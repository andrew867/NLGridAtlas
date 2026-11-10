#!/usr/bin/env python3
"""Inventory and mirror public document files from NL Hydro's upload index.

The crawler is deliberately limited to year directories. WordPress plugin,
form-upload, import, and temporary directories at the upload root are outside
scope.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import mimetypes
import re
import time
import urllib.parse
import urllib.request
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from html import unescape
from pathlib import Path, PurePosixPath


ROOT = "https://nlhydro.com/wp-content/uploads/"
YEAR_RANGE = range(2014, 2027)
DOCUMENT_EXTENSIONS = {
    ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".xlsm", ".csv",
    ".ppt", ".pptx", ".rtf", ".txt", ".zip",
}
ROW_RE = re.compile(
    r'<tr><td[^>]*>.*?</td><td><a href="([^"]+)">.*?</a>.*?</td>'
    r'<td[^>]*>(.*?)</td><td[^>]*>\s*(.*?)\s*</td>',
    re.IGNORECASE,
)
SIZE_RE = re.compile(r"^(\d+(?:\.\d+)?)\s*([KMGTP]?)$", re.IGNORECASE)


@dataclass(frozen=True)
class FileRecord:
    url: str
    relative_path: str
    modified: str
    listed_size: str
    listed_size_bytes: int | None
    extension: str


def fetch_text(url: str, timeout: float) -> str:
    request = urllib.request.Request(url, headers={"User-Agent": "NLGridAtlasResearch/0.1"})
    with urllib.request.urlopen(request, timeout=timeout) as response:
        return response.read().decode("utf-8", "replace")


def parse_size(value: str) -> int | None:
    value = unescape(re.sub(r"<[^>]+>", "", value)).strip()
    if not value or value == "-":
        return None
    match = SIZE_RE.match(value)
    if not match:
        return None
    number = float(match.group(1))
    exponent = "KMGTP".find(match.group(2).upper()) + 1 if match.group(2) else 0
    return int(number * (1024**exponent))


def clean_cell(value: str) -> str:
    return unescape(re.sub(r"<[^>]+>", "", value)).strip()


def crawl(timeout: float, delay: float) -> tuple[list[FileRecord], list[str]]:
    pending = [urllib.parse.urljoin(ROOT, f"{year}/") for year in YEAR_RANGE]
    visited: set[str] = set()
    files: list[FileRecord] = []
    errors: list[str] = []

    while pending:
        url = pending.pop(0)
        if url in visited:
            continue
        visited.add(url)
        try:
            html = fetch_text(url, timeout)
        except Exception as exc:  # network errors are retained in the manifest
            errors.append(f"{url}\t{type(exc).__name__}: {exc}")
            continue

        for href, modified_cell, size_cell in ROW_RE.findall(html):
            href = unescape(href)
            if href.startswith(("?", "/")) or href in ("../", "./"):
                continue
            child = urllib.parse.urljoin(url, href)
            if not child.startswith(ROOT):
                continue
            relative = urllib.parse.unquote(child.removeprefix(ROOT))
            first = PurePosixPath(relative).parts[0] if relative else ""
            if not (first.isdigit() and int(first) in YEAR_RANGE):
                continue
            if child.endswith("/"):
                pending.append(child)
                continue
            extension = PurePosixPath(urllib.parse.urlsplit(child).path).suffix.lower()
            if extension not in DOCUMENT_EXTENSIONS:
                continue
            listed_size = clean_cell(size_cell)
            files.append(FileRecord(
                url=child,
                relative_path=relative,
                modified=clean_cell(modified_cell),
                listed_size=listed_size,
                listed_size_bytes=parse_size(listed_size),
                extension=extension,
            ))
        if delay:
            time.sleep(delay)

    files.sort(key=lambda item: item.relative_path.casefold())
    return files, errors


def write_inventory(out: Path, files: list[FileRecord], errors: list[str]) -> Path:
    out.mkdir(parents=True, exist_ok=True)
    counts: dict[str, int] = {}
    for record in files:
        counts[record.extension] = counts.get(record.extension, 0) + 1
    manifest = {
        "schema_version": 1,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "root_url": ROOT,
        "scope": [str(year) for year in YEAR_RANGE],
        "excluded_root_directories": [
            "cmtt", "easy-accordion", "gf_import_files", "gravity_forms",
            "maxmegamenu", "tmp", "uag-plugin", "wp-sync-db", "wpallimport", "wpo",
        ],
        "file_count": len(files),
        "listed_size_bytes": sum(item.listed_size_bytes or 0 for item in files),
        "unknown_size_count": sum(item.listed_size_bytes is None for item in files),
        "counts_by_extension": dict(sorted(counts.items())),
        "errors": errors,
        "files": [asdict(item) for item in files],
    }
    path = out / "inventory.json"
    path.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return path


def safe_destination(root: Path, relative_path: str) -> Path:
    parts = [part for part in PurePosixPath(relative_path).parts if part not in ("", ".", "..")]
    destination = root.joinpath(*parts).resolve()
    root_resolved = root.resolve()
    if root_resolved not in destination.parents:
        raise ValueError(f"unsafe destination: {relative_path}")
    return destination


def mirror(out: Path, files: list[FileRecord], timeout: float, delay: float) -> None:
    content_root = out / "files"
    log_path = out / "downloads.jsonl"
    completed: dict[str, int] = {}
    if log_path.exists():
        for line in log_path.read_text(encoding="utf-8", errors="replace").splitlines():
            try:
                event = json.loads(line)
            except json.JSONDecodeError:
                continue
            if event.get("status") == "downloaded" and isinstance(event.get("size_bytes"), int):
                completed[event["relative_path"]] = event["size_bytes"]
    for index, record in enumerate(files, start=1):
        destination = safe_destination(content_root, record.relative_path)
        if destination.exists() and completed.get(record.relative_path) == destination.stat().st_size:
            print(f"[{index}/{len(files)}] exists {record.relative_path}")
            continue
        destination.parent.mkdir(parents=True, exist_ok=True)
        temporary = destination.with_suffix(destination.suffix + ".part")
        request = urllib.request.Request(record.url, headers={"User-Agent": "NLGridAtlasResearch/0.1"})
        digest = hashlib.sha256()
        size = 0
        try:
            with urllib.request.urlopen(request, timeout=timeout) as response, temporary.open("wb") as stream:
                while chunk := response.read(1024 * 1024):
                    stream.write(chunk)
                    digest.update(chunk)
                    size += len(chunk)
            temporary.replace(destination)
            result = {
                "downloaded_at": datetime.now(timezone.utc).isoformat(),
                "url": record.url,
                "relative_path": record.relative_path,
                "size_bytes": size,
                "sha256": digest.hexdigest(),
                "media_type": mimetypes.guess_type(destination.name)[0],
                "status": "downloaded",
            }
            print(f"[{index}/{len(files)}] {size} {record.relative_path}")
        except Exception as exc:
            result = {
                "downloaded_at": datetime.now(timezone.utc).isoformat(),
                "url": record.url,
                "relative_path": record.relative_path,
                "status": "error",
                "error": f"{type(exc).__name__}: {exc}",
            }
            print(f"[{index}/{len(files)}] ERROR {record.relative_path}: {exc}")
        with log_path.open("a", encoding="utf-8") as stream:
            stream.write(json.dumps(result, ensure_ascii=False) + "\n")
        if delay:
            time.sleep(delay)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("command", choices=("inventory", "mirror"))
    parser.add_argument("--out", type=Path, required=True)
    parser.add_argument("--delay", type=float, default=0.15)
    parser.add_argument("--timeout", type=float, default=90)
    args = parser.parse_args()

    files, errors = crawl(args.timeout, args.delay)
    inventory_path = write_inventory(args.out, files, errors)
    total = sum(item.listed_size_bytes or 0 for item in files)
    print(f"Inventory: {len(files)} files, {total} listed bytes, {len(errors)} crawl errors")
    print(inventory_path)
    if args.command == "mirror":
        mirror(args.out, files, args.timeout, args.delay)


if __name__ == "__main__":
    main()
