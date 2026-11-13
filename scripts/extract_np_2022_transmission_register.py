#!/usr/bin/env python3
"""Extract CA-NP-168 Attachment A into a checked JSON register."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
from pathlib import Path

import fitz


SOURCE_SHA256 = "94e1720d54e98dc6126f4faa2106584de6c28a84d143ccb3e11adb5fd8793c56"
ROW_PATTERN = re.compile(r"^(?P<circuit>\d+L)(?P<footnote>\d*)$")
ALLOCATIONS = {"Common", "Fully Contributed", "Common/Specific"}
CODE_PAIR_PATTERN = re.compile(r"^([A-Z0-9]+)-([A-Z0-9]+)$")


def source_hash(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for block in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def row_starts(lines: list[str]) -> list[tuple[int, str, str | None]]:
    starts: list[tuple[int, str, str | None]] = []
    for index, line in enumerate(lines):
        match = ROW_PATTERN.fullmatch(line)
        if match:
            footnote = match.group("footnote") or None
            starts.append((index, match.group("circuit"), footnote))
        elif line.startswith("403L Rob Tap "):
            starts.append((index, "403L Rob Tap", None))
    return starts


def parse_page(lines: list[str]) -> list[dict[str, object]]:
    starts = row_starts(lines)
    records: list[dict[str, object]] = []
    for position, (start, circuit, footnote) in enumerate(starts):
        end = starts[position + 1][0] if position + 1 < len(starts) else len(lines)
        chunk = [value for value in lines[start:end] if value]
        if circuit == "403L Rob Tap":
            description = chunk[0].removeprefix("403L Rob Tap ")
            chunk = [circuit, description, *chunk[1:]]
        allocation_index = next(
            (index for index, value in enumerate(chunk) if value in ALLOCATIONS),
            None,
        )
        if allocation_index is None or allocation_index + 1 >= len(chunk):
            raise ValueError(f"Could not parse register row: {chunk!r}")
        description = " ".join(chunk[1:allocation_index])
        cost_text = chunk[allocation_index + 1]
        if not re.fullmatch(r"[\d,]+", cost_text):
            raise ValueError(f"Invalid cost for {circuit}: {cost_text!r}")
        endpoint_codes: list[str] = []
        for group in re.findall(r"\(([^()]*)\)", description):
            match = CODE_PAIR_PATTERN.fullmatch(group.strip())
            if match:
                endpoint_codes = [match.group(1), match.group(2)]
        record: dict[str, object] = {
            "circuit": circuit,
            "description": description,
            "allocation": chunk[allocation_index],
            "historical_cost_thousands": int(cost_text.replace(",", "")),
            "physical_pdf_page": 3 if "3L" in lines[:10] else 4,
        }
        if endpoint_codes:
            record["endpoint_codes"] = endpoint_codes
        if footnote:
            record["footnote"] = int(footnote)
        records.append(record)
    return records


def extract(pdf_path: Path) -> dict[str, object]:
    digest = source_hash(pdf_path)
    if digest != SOURCE_SHA256:
        raise ValueError(f"Unexpected source hash: {digest}")
    document = fitz.open(pdf_path)
    records: list[dict[str, object]] = []
    for page_index in (2, 3):
        lines = [line.strip() for line in document[page_index].get_text().splitlines()]
        records.extend(parse_page(lines))
    undistributed = 54
    total = 186_951
    if len(records) != 109:
        raise ValueError(f"Expected 109 circuit rows, extracted {len(records)}")
    if len({record["circuit"] for record in records}) != 109:
        raise ValueError("Circuit identifiers are not unique")
    extracted_total = sum(int(record["historical_cost_thousands"]) for record in records)
    if extracted_total + undistributed != total:
        raise ValueError(
            f"Cost reconciliation failed: {extracted_total} + {undistributed} != {total}"
        )
    return {
        "source": {
            "title": "CA-NP-168, Attachment A, Transmission Assets - Data",
            "url": "http://www.pub.nl.ca/applications/2025/NP2025GRA/responses/CA-NP-168.PDF",
            "physical_pdf_pages": [3, 4],
            "sha256": digest,
        },
        "cost_date": "2022-12-31",
        "record_count": len(records),
        "circuit_cost_thousands": extracted_total,
        "undistributed_cost_thousands": undistributed,
        "total_cost_thousands": total,
        "records": records,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("pdf", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()
    result = extract(args.pdf)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
