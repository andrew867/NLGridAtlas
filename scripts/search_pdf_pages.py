#!/usr/bin/env python3
"""Search PDF text and report the physical pages that contain each term."""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

from pypdf import PdfReader


def pdf_paths(inputs: list[Path]) -> list[Path]:
    files: set[Path] = set()
    for item in inputs:
        if item.is_file() and item.suffix.casefold() == ".pdf":
            files.add(item.resolve())
        elif item.is_dir():
            files.update(path.resolve() for path in item.rglob("*.pdf"))
            files.update(path.resolve() for path in item.rglob("*.PDF"))
    return sorted(files, key=lambda path: str(path).casefold(), reverse=True)


def matching_lines(text: str, pattern: re.Pattern[str], context: int) -> list[str]:
    lines = [line.strip() for line in text.splitlines()]
    selected: set[int] = set()
    for index, line in enumerate(lines):
        if pattern.search(line):
            start = max(0, index - context)
            stop = min(len(lines), index + context + 1)
            selected.update(range(start, stop))
    return [lines[index] for index in sorted(selected) if lines[index]]


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("inputs", nargs="+", type=Path, help="PDF files or directories")
    parser.add_argument("--term", action="append", required=True, help="literal search term, repeat as needed")
    parser.add_argument("--context", type=int, default=1, help="lines before and after a matching line")
    parser.add_argument("--max-results", type=int, default=0, help="stop after this many matching pages, 0 scans all")
    args = parser.parse_args()

    pattern = re.compile("|".join(re.escape(term) for term in args.term), re.IGNORECASE)
    result_count = 0
    error_count = 0
    files = pdf_paths(args.inputs)

    for path in files:
        try:
            reader = PdfReader(path)
            for page_number, page in enumerate(reader.pages, start=1):
                text = page.extract_text() or ""
                lines = matching_lines(text, pattern, args.context)
                if not lines:
                    continue
                print(f"{path}\tphysical PDF p. {page_number}")
                for line in lines:
                    print(f"  {line}")
                result_count += 1
                if args.max_results and result_count >= args.max_results:
                    print(f"RESULTS\t{result_count}\tFILES\t{len(files)}\tERRORS\t{error_count}")
                    return 0
        except Exception as exc:
            error_count += 1
            print(f"ERROR\t{path}\t{type(exc).__name__}: {exc}", file=sys.stderr)

    print(f"RESULTS\t{result_count}\tFILES\t{len(files)}\tERRORS\t{error_count}")
    return 1 if error_count else 0


if __name__ == "__main__":
    raise SystemExit(main())
