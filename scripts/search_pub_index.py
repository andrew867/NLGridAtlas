#!/usr/bin/env python3
"""Search the local PUB full-text index without changing archive state."""

from __future__ import annotations

import argparse
import json
import re
import sqlite3
import sys
from pathlib import Path


def main() -> None:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    parser = argparse.ArgumentParser()
    parser.add_argument("database", type=Path)
    parser.add_argument("query", help="SQLite FTS5 match expression")
    parser.add_argument("--limit", type=int, default=100)
    parser.add_argument("--path", action="append", default=[], help="case-insensitive path substring")
    parser.add_argument("--json", action="store_true")
    args = parser.parse_args()

    uri = f"file:{args.database.resolve().as_posix()}?mode=ro"
    connection = sqlite3.connect(uri, uri=True)
    connection.row_factory = sqlite3.Row
    try:
        rows = connection.execute(
            """
            SELECT url, path, page_no,
                   snippet(pages_fts, 3, '[', ']', ' ... ', 28) AS snippet,
                   bm25(pages_fts) AS score
            FROM pages_fts
            WHERE pages_fts MATCH ?
            ORDER BY score
            LIMIT ?
            """,
            (args.query, max(args.limit * 5, args.limit)),
        ).fetchall()
    finally:
        connection.close()

    results = []
    for row in rows:
        path = row["path"] or ""
        url = row["url"] or ""
        haystack = f"{path}\n{url}".casefold()
        if args.path and not all(item.casefold() in haystack for item in args.path):
            continue
        results.append(dict(row))
        if len(results) >= args.limit:
            break

    if args.json:
        print(json.dumps(results, indent=2, ensure_ascii=False))
        return
    for result in results:
        print(f"{result['path']}\tPDF p. {result['page_no']}\t{result['url']}")
        print(re.sub(r"\s+", " ", result["snippet"] or "").strip())


if __name__ == "__main__":
    main()
