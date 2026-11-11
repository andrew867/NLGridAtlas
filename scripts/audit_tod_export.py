#!/usr/bin/env python3
"""Audit the Access CSV export used by the 2018 time-of-day study record."""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
from collections import Counter
from datetime import datetime
from pathlib import Path


EXPECTED_COLUMNS = ["PrimaryKey", "RECORDER_ID", "DATE", "HOUR", "WATTS"]


def file_sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        while chunk := stream.read(1024 * 1024):
            digest.update(chunk)
    return digest.hexdigest()


def audit(path: Path) -> dict:
    recorder_counts: Counter[str] = Counter()
    dates: set[str] = set()
    hours: set[int] = set()
    measurement_rows = 0
    separator_rows = 0
    zero_watt_rows = 0
    minimum_watts: float | None = None
    maximum_watts: float | None = None
    first_primary_key: int | None = None
    last_primary_key: int | None = None
    primary_key_discontinuities = 0
    previous_primary_key: int | None = None

    with path.open("r", encoding="utf-8-sig", newline="") as stream:
        rows = csv.reader(stream)
        header = next(rows)
        if header != EXPECTED_COLUMNS:
            raise ValueError(f"Unexpected columns: {header!r}")
        for line_number, row in enumerate(rows, start=2):
            if len(row) != 5:
                raise ValueError(f"Line {line_number} has {len(row)} columns")
            primary_key_text, recorder_id, date_text, hour_text, watts_text = row
            primary_key = int(primary_key_text)
            if first_primary_key is None:
                first_primary_key = primary_key
            if previous_primary_key is not None and primary_key != previous_primary_key + 1:
                primary_key_discontinuities += 1
            previous_primary_key = primary_key
            last_primary_key = primary_key

            if recorder_id == "RECORDER ID" and not date_text and not hour_text and not watts_text:
                separator_rows += 1
                continue
            if not recorder_id or not date_text or not hour_text or not watts_text:
                raise ValueError(f"Line {line_number} is neither a measurement nor a separator")

            datetime.strptime(date_text.zfill(6), "%y%m%d")
            hour = int(hour_text)
            if hour < 100 or hour > 2400 or hour % 100:
                raise ValueError(f"Line {line_number} has invalid hour {hour_text}")
            watts = float(watts_text)
            measurement_rows += 1
            recorder_counts[recorder_id] += 1
            dates.add(date_text.zfill(6))
            hours.add(hour)
            if watts == 0:
                zero_watt_rows += 1
            minimum_watts = watts if minimum_watts is None else min(minimum_watts, watts)
            maximum_watts = watts if maximum_watts is None else max(maximum_watts, watts)

    ordered_dates = sorted(dates)
    count_distribution = Counter(recorder_counts.values())
    return {
        "schema_version": 1,
        "source_filename": path.name,
        "source_bytes": path.stat().st_size,
        "source_sha256": file_sha256(path),
        "columns": EXPECTED_COLUMNS,
        "measurement_rows": measurement_rows,
        "separator_rows": separator_rows,
        "total_data_rows": measurement_rows + separator_rows,
        "recorder_series": len(recorder_counts),
        "measurements_per_recorder": {
            str(count): series for count, series in sorted(count_distribution.items())
        },
        "distinct_dates": len(dates),
        "first_date": datetime.strptime(ordered_dates[0], "%y%m%d").date().isoformat(),
        "last_date": datetime.strptime(ordered_dates[-1], "%y%m%d").date().isoformat(),
        "hours": sorted(hours),
        "minimum_watts": minimum_watts,
        "maximum_watts": maximum_watts,
        "zero_watt_rows": zero_watt_rows,
        "primary_key": {
            "first": first_primary_key,
            "last": last_primary_key,
            "discontinuities": primary_key_discontinuities,
        },
        "recorder_ids": sorted(recorder_counts),
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("--out", type=Path)
    args = parser.parse_args()
    result = audit(args.source)
    payload = json.dumps(result, indent=2) + "\n"
    if args.out:
        args.out.parent.mkdir(parents=True, exist_ok=True)
        args.out.write_text(payload, encoding="utf-8")
        print(args.out)
    else:
        print(payload, end="")


if __name__ == "__main__":
    main()
