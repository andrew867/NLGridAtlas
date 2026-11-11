#!/usr/bin/env python3
"""Inventory and mirror regulatory PDFs linked by Newfoundland Power.

The script is intentionally limited to Newfoundland Power's public regulation
page and the documents linked directly from it. It does not crawl unrelated
Sitecore media or customer-service material.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import time
import urllib.parse
import urllib.request
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path


REGULATION_PAGE = "https://www.newfoundlandpower.com/en/About/Who-We-Are/Regulation"
USER_AGENT = "NLGridAtlasResearch/0.1"
ALLOWED_HOSTS = {"newfoundlandpower.com", "www.newfoundlandpower.com"}
PDF_PATH_RE = re.compile(r"\.pdf$", re.IGNORECASE)


@dataclass(frozen=True)
class DocumentRecord:
    title: str
    url: str
    filename: str
    source_page: str


class LinkParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.links: list[tuple[str, str]] = []
        self._href: str | None = None
        self._text: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag.casefold() != "a":
            return
        values = dict(attrs)
        self._href = values.get("href")
        self._text = []

    def handle_data(self, data: str) -> None:
        if self._href is not None:
            self._text.append(data)

    def handle_endtag(self, tag: str) -> None:
        if tag.casefold() != "a" or self._href is None:
            return
        title = " ".join("".join(self._text).split())
        self.links.append((self._href, title))
        self._href = None
        self._text = []


def request(url: str, timeout: float):
    return urllib.request.urlopen(
        urllib.request.Request(url, headers={"User-Agent": USER_AGENT}),
        timeout=timeout,
    )


def fetch_text(url: str, timeout: float) -> str:
    with request(url, timeout) as response:
        charset = response.headers.get_content_charset() or "utf-8"
        return response.read().decode(charset, "replace")


def safe_filename(url: str) -> str:
    name = Path(urllib.parse.unquote(urllib.parse.urlsplit(url).path)).name
    name = re.sub(r'[<>:"/\\|?*\x00-\x1f]', "_", name).strip(" .")
    if not name:
        raise ValueError(f"URL has no usable filename: {url}")
    return name


def parse_documents(html: str, source_page: str = REGULATION_PAGE) -> list[DocumentRecord]:
    parser = LinkParser()
    parser.feed(html)
    documents: dict[str, DocumentRecord] = {}
    used_names: dict[str, str] = {}
    for href, title in parser.links:
        absolute = urllib.parse.urljoin(source_page, href)
        split = urllib.parse.urlsplit(absolute)
        host = (split.hostname or "").casefold()
        clean_url = urllib.parse.urlunsplit((split.scheme, split.netloc, split.path, "", ""))
        if split.scheme not in {"http", "https"} or host not in ALLOWED_HOSTS:
            continue
        if not PDF_PATH_RE.search(split.path):
            continue
        filename = safe_filename(clean_url)
        key = filename.casefold()
        if key in used_names and used_names[key] != clean_url:
            stem = Path(filename).stem
            suffix = Path(filename).suffix
            filename = f"{stem}-{hashlib.sha256(clean_url.encode()).hexdigest()[:10]}{suffix}"
        used_names[filename.casefold()] = clean_url
        documents[clean_url] = DocumentRecord(
            title=title or filename,
            url=clean_url,
            filename=filename,
            source_page=source_page,
        )
    return sorted(documents.values(), key=lambda item: (item.title.casefold(), item.url))


def write_inventory(out: Path, documents: list[DocumentRecord], errors: list[str]) -> Path:
    out.mkdir(parents=True, exist_ok=True)
    manifest = {
        "schema_version": 1,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "source_page": REGULATION_PAGE,
        "scope": "PDF documents linked directly from Newfoundland Power's public Regulation page",
        "document_count": len(documents),
        "errors": errors,
        "documents": [asdict(item) for item in documents],
    }
    path = out / "inventory.json"
    path.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return path


def load_completed(log_path: Path) -> dict[str, dict]:
    completed: dict[str, dict] = {}
    if not log_path.exists():
        return completed
    for line in log_path.read_text(encoding="utf-8", errors="replace").splitlines():
        try:
            event = json.loads(line)
        except json.JSONDecodeError:
            continue
        if event.get("status") == "downloaded" and event.get("url"):
            completed[event["url"]] = event
    return completed


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        while chunk := stream.read(1024 * 1024):
            digest.update(chunk)
    return digest.hexdigest()


def mirror(out: Path, documents: list[DocumentRecord], timeout: float, delay: float) -> None:
    content_root = out / "files"
    content_root.mkdir(parents=True, exist_ok=True)
    log_path = out / "downloads.jsonl"
    completed = load_completed(log_path)
    for index, record in enumerate(documents, start=1):
        destination = (content_root / record.filename).resolve()
        if content_root.resolve() not in destination.parents:
            raise ValueError(f"unsafe destination: {record.filename}")
        prior = completed.get(record.url)
        if destination.exists() and prior:
            same_size = prior.get("size_bytes") == destination.stat().st_size
            same_hash = prior.get("sha256") == sha256_file(destination)
            if same_size and same_hash:
                print(f"[{index}/{len(documents)}] verified {record.filename}")
                continue
        temporary = destination.with_suffix(destination.suffix + ".part")
        digest = hashlib.sha256()
        size = 0
        try:
            with request(record.url, timeout) as response, temporary.open("wb") as stream:
                first = response.read(1024 * 1024)
                if not first.startswith(b"%PDF-"):
                    raise ValueError(f"response is not a PDF: {record.url}")
                stream.write(first)
                digest.update(first)
                size += len(first)
                while chunk := response.read(1024 * 1024):
                    stream.write(chunk)
                    digest.update(chunk)
                    size += len(chunk)
            temporary.replace(destination)
            result = {
                "downloaded_at": datetime.now(timezone.utc).isoformat(),
                "title": record.title,
                "url": record.url,
                "filename": record.filename,
                "size_bytes": size,
                "sha256": digest.hexdigest(),
                "status": "downloaded",
            }
            print(f"[{index}/{len(documents)}] {size} {record.filename}")
        except Exception as exc:
            result = {
                "downloaded_at": datetime.now(timezone.utc).isoformat(),
                "title": record.title,
                "url": record.url,
                "filename": record.filename,
                "status": "error",
                "error": f"{type(exc).__name__}: {exc}",
            }
            print(f"[{index}/{len(documents)}] ERROR {record.filename}: {exc}")
        with log_path.open("a", encoding="utf-8") as stream:
            stream.write(json.dumps(result, ensure_ascii=False) + "\n")
        if delay:
            time.sleep(delay)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("command", choices=("inventory", "mirror"))
    parser.add_argument("--out", type=Path, required=True)
    parser.add_argument("--delay", type=float, default=0.25)
    parser.add_argument("--timeout", type=float, default=120)
    args = parser.parse_args()

    errors: list[str] = []
    try:
        html = fetch_text(REGULATION_PAGE, args.timeout)
        documents = parse_documents(html)
    except Exception as exc:
        documents = []
        errors.append(f"{REGULATION_PAGE}\t{type(exc).__name__}: {exc}")
    inventory_path = write_inventory(args.out, documents, errors)
    print(f"Inventory: {len(documents)} documents, {len(errors)} crawl errors")
    print(inventory_path)
    if args.command == "mirror" and not errors:
        mirror(args.out, documents, args.timeout, args.delay)


if __name__ == "__main__":
    main()
