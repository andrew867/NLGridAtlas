#!/usr/bin/env python3
"""Extract the 300-row PUB-NP-081 Attachment B feeder register."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
from pathlib import Path

import fitz


SOURCE_SHA256 = "a95d862df02f36a44c57ed17ce14db70ddccc3a69ceb92357c0aee3a853558cc"
FEEDER_PATTERN = re.compile(r"^[A-Z0-9]{3}-\d{2}$")


def digest(path: Path) -> str:
    value = hashlib.sha256()
    with path.open("rb") as source:
        for block in iter(lambda: source.read(1024 * 1024), b""):
            value.update(block)
    return value.hexdigest()


def extract(pdf_path: Path) -> dict[str, object]:
    source_digest = digest(pdf_path)
    if source_digest != SOURCE_SHA256:
        raise ValueError(f"Unexpected source hash: {source_digest}")
    document = fitz.open(pdf_path)
    records: list[dict[str, object]] = []
    for page_index in range(9, 20):
        region = "St. John's" if page_index <= 12 else "Eastern" if page_index <= 15 else "Western"
        lines = [line.strip() for line in document[page_index].get_text().splitlines() if line.strip()]
        for index, feeder in enumerate(lines):
            if not FEEDER_PATTERN.fullmatch(feeder):
                continue
            values = lines[index + 1:index + 6]
            if len(values) != 5 or not values[-1].endswith("%"):
                raise ValueError(f"Could not parse {feeder} on physical PDF p. {page_index + 1}")
            voltage, planning, winter, forecast, loading = values
            record = {
                "feeder": feeder,
                "station_code": feeder.split("-", 1)[0],
                "region": region,
                "operating_voltage_kv": float(voltage),
                "planning_capacity_mva": float(planning),
                "winter_capacity_mva": float(winter),
                "forecast_winter_peak_mva": float(forecast),
                "loading_vs_planning_percent": float(loading.removesuffix("%")),
                "physical_pdf_page": page_index + 1,
            }
            calculated = record["forecast_winter_peak_mva"] / record["planning_capacity_mva"] * 100
            if abs(calculated - record["loading_vs_planning_percent"]) > 0.02:
                raise ValueError(f"Published loading does not reconcile for {feeder}")
            records.append(record)
    if len(records) != 300:
        raise ValueError(f"Expected 300 feeder rows, extracted {len(records)}")
    if len({record["feeder"] for record in records}) != 300:
        raise ValueError("Feeder identifiers are not unique")
    region_counts = {
        region: sum(record["region"] == region for record in records)
        for region in ("St. John's", "Eastern", "Western")
    }
    return {
        "source": {
            "title": "PUB-NP-081 Attachment B, Distribution Feeder Listing",
            "url": "http://www.pub.nl.ca/applications/2018/2018ratemitigation/responses/PUB-NP-081.PDF",
            "physical_pdf_pages": list(range(10, 21)),
            "sha256": source_digest,
        },
        "forecast_period": "2024-2025 winter",
        "record_count": len(records),
        "region_counts": region_counts,
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
