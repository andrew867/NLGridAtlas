#!/usr/bin/env python3
"""Extract two text-native Newfoundland Power register layers into JSON."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
from pathlib import Path

try:
    import pymupdf as fitz
except ImportError:  # pragma: no cover
    import fitz


STATION_CODE = re.compile(r"^[A-Z]{3}$")
LINE_CODE = re.compile(r"^(\d{3}L(?:\([A-Z]\))?)(1)?$")
LOADING_REGION = {
    3: "St. John's",
    4: "St. John's",
    5: "Avalon",
    6: "Burin",
    7: "Bonavista",
    8: "Gander",
    9: "Grand Falls",
    10: "Corner Brook",
    11: "Stephenville",
}


def digest(path: Path) -> str:
    value = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            value.update(chunk)
    return value.hexdigest()


def clean_lines(page) -> list[str]:
    lines = []
    for raw in page.get_text("text").splitlines():
        value = re.sub(r"\s+", " ", raw).strip().replace("�", "'")
        if value:
            lines.append(value)
    return lines


def expand_feeders(code: str, value: str) -> list[str]:
    compact = value.replace(" ", "")
    if compact == "-":
        return []
    tokens = [token for token in compact.split(",") if token]
    if not tokens or not tokens[0].startswith(f"{code}-"):
        raise ValueError(f"Unexpected feeder cell for {code}: {value}")
    feeders = [tokens[0]]
    for token in tokens[1:]:
        feeders.append(token if "-" in token else f"{code}-{token}")
    return feeders


def extract_feeder_stations(path: Path) -> list[dict[str, object]]:
    stations: list[dict[str, object]] = []
    with fitz.open(path) as document:
        for physical_page in range(3, 9):
            lines = clean_lines(document[physical_page - 1])
            positions = [index for index, value in enumerate(lines) if STATION_CODE.fullmatch(value)]
            for offset, start in enumerate(positions):
                stop = positions[offset + 1] if offset + 1 < len(positions) else len(lines)
                cell = lines[start:stop]
                if len(cell) < 3:
                    raise ValueError(f"Incomplete station row on PDF p. {physical_page}: {cell}")
                code, name = cell[:2]
                feeder_text = " ".join(cell[2:])
                stations.append(
                    {
                        "code": code,
                        "name": name,
                        "feeders": expand_feeders(code, feeder_text),
                        "source_page": physical_page,
                    }
                )
    return stations


def normalize_circuit(value: str) -> str:
    return re.sub(r"^0+", "", value)


def extract_line_loading(path: Path) -> list[dict[str, object]]:
    records: list[dict[str, object]] = []
    with fitz.open(path) as document:
        for physical_page in range(3, 12):
            lines = clean_lines(document[physical_page - 1])
            for index, value in enumerate(lines):
                match = LINE_CODE.fullmatch(value)
                if not match:
                    continue
                fields = lines[index + 1:index + 9]
                if len(fields) != 8:
                    raise ValueError(f"Incomplete line row on PDF p. {physical_page}: {value}")
                circuit, marker = match.groups()
                source_voltage, rating_mva, rating_amps, peak_mva, peak_amps, percent = fields[2:]
                records.append(
                    {
                        "circuit": normalize_circuit(circuit),
                        "source_circuit": circuit,
                        "footnote_marker": int(marker) if marker else None,
                        "from": fields[0],
                        "to": fields[1],
                        "voltage_kv": int(source_voltage),
                        "winter_continuous_rating_mva": float(rating_mva),
                        "winter_continuous_rating_amps": float(rating_amps),
                        "forecast_2012_peak_mva": float(peak_mva),
                        "forecast_2012_peak_amps": float(peak_amps),
                        "forecast_percent_rating": int(percent),
                        "region": LOADING_REGION[physical_page],
                        "source_page": physical_page,
                    }
                )
    return records


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--feeder-pdf", type=Path, required=True)
    parser.add_argument("--loading-pdf", type=Path, required=True)
    parser.add_argument("--out", type=Path, required=True)
    args = parser.parse_args()

    payload = {
        "schema_version": 1,
        "sources": {
            "feeder_register": {
                "title": "PUB-NP-5, Substation/Feeder Listing",
                "url": "http://www.pub.nl.ca/applications/ARCHIVE/2009/NP2009Capital/files/rfi/PUB-NP-5.pdf",
                "physical_pages": "3 to 8",
                "sha256": digest(args.feeder_pdf),
            },
            "line_loading": {
                "title": "PUB-NP-275, 2013 Transmission Line Loading",
                "url": "http://www.pub.nl.ca/applications/IslandInterconnectedSystem/files/rfi/PUB-NP-275.pdf",
                "physical_pages": "3 to 11",
                "sha256": digest(args.loading_pdf),
            },
        },
        "feeder_stations": extract_feeder_stations(args.feeder_pdf),
        "transmission_line_loading": extract_line_loading(args.loading_pdf),
    }
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
