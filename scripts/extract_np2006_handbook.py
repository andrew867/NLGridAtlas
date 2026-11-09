"""Extract the verified registers from the NP 2006 Electrical System Handbook."""

from __future__ import annotations

import hashlib
import json
import re
from pathlib import Path

from pypdf import PdfReader


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "research" / "sources" / "np-2006" / "NP2006ApplicationHandbook.pdf"
OUTPUT = ROOT / "research" / "derived" / "np-2006-handbook.json"
SOURCE_URL = (
    "http://www.pub.nf.ca/ARCHIVE/np2006cap/files/applic/"
    "NP2006ApplicationHandbook.pdf"
)


LINE_EXCEPTIONS = {
    "21L": ("Horsechops Tap", None, "Horsechops Plant", "HCP"),
    "22L": ("Morris Plant Tap", None, "Morris Plant", "MRP"),
    "53L": ("Golden Eagle Tap", None, "Golden Eagle", None),
    "104L": ("Roycefield Tap", None, "Roycefield Mine", "RFD"),
    "142L": ("Cobb's Pond", "COB", "Clarke's Head Tap", None),
}


GENERATION_PLANTS = [
    {"category": "hydro", "name": "Cape Broyle", "code": "CAB"},
    {"category": "hydro", "name": "Fall Pond", "code": "FPD"},
    {"category": "hydro", "name": "Heart's Content", "code": "HCT"},
    {"category": "hydro", "name": "Horsechops", "code": "HCP"},
    {"category": "hydro", "name": "Lawn", "code": "LWN"},
    {"category": "hydro", "name": "Lockston", "code": "LOK"},
    {"category": "hydro", "name": "Lookout Brook", "code": "LBK"},
    {"category": "hydro", "name": "Mobile", "code": "MOB"},
    {"category": "hydro", "name": "Morris", "code": "MRP"},
    {"category": "hydro", "name": "New Chelsea", "code": "NCH"},
    {"category": "hydro", "name": "Petty Harbour", "code": "PHR"},
    {"category": "hydro", "name": "Pierre's Brook", "code": "PBK"},
    {"category": "hydro", "name": "Pitman's Pond", "code": "PIT"},
    {"category": "hydro", "name": "Port Union", "code": "PUN"},
    {"category": "hydro", "name": "Rattling Brook", "code": "RBK"},
    {"category": "hydro", "name": "Rocky Pond", "code": "ROP"},
    {"category": "hydro", "name": "Rose Blanche Brook", "code": "RBH"},
    {"category": "hydro", "name": "Sandy Brook", "code": "SBK"},
    {"category": "hydro", "name": "Seal Cove", "code": "SCV"},
    {"category": "hydro", "name": "Topsail", "code": "TOP"},
    {"category": "hydro", "name": "Tors Cove", "code": "TCV"},
    {"category": "hydro", "name": "Victoria", "code": "VIC"},
    {"category": "hydro", "name": "West Brook", "code": "WBK"},
    {"category": "gas_turbine", "name": "Greenhill", "code": "GRT"},
    {"category": "gas_turbine", "name": "Portable", "code": "GBS"},
    {"category": "gas_turbine", "name": "Wesleyville", "code": "WES"},
    {"category": "diesel", "name": "New Portable", "code": "GBS"},
    {"category": "diesel", "name": "Port aux Basques", "code": "PAB"},
    {"category": "diesel", "name": "Port Union", "code": "PUN"},
]


def clean(value: str) -> str:
    return " ".join(value.replace("\ufffd", "'").split())


def parse_lines(reader: PdfReader) -> list[dict]:
    records = []
    pair = re.compile(r"^(.*?)\s+\(([A-Z]{3})\)\s+(.*?)\s+\(([A-Z]{3})\)$")
    for page_number in range(6, 10):
        text = reader.pages[page_number - 1].extract_text() or ""
        for raw in text.splitlines():
            line = clean(raw)
            match = re.match(r"^(\d+L)\s+(.+)$", line)
            if not match:
                continue
            circuit, endpoints = match.groups()
            if circuit in LINE_EXCEPTIONS:
                from_name, from_code, to_name, to_code = LINE_EXCEPTIONS[circuit]
            else:
                endpoint_match = pair.match(endpoints)
                if not endpoint_match:
                    raise ValueError(f"Could not parse {circuit}: {endpoints}")
                from_name, from_code, to_name, to_code = endpoint_match.groups()
            records.append(
                {
                    "circuit": circuit,
                    "from": clean(from_name),
                    "from_code": from_code,
                    "to": clean(to_name),
                    "to_code": to_code,
                    "source_page": page_number,
                }
            )
    if len(records) != 104:
        raise ValueError(f"Expected 104 transmission lines, found {len(records)}")
    return records


def expand_feeders(code: str, raw: str) -> list[str]:
    compact = raw.replace(" ", "")
    if not compact or compact == "-":
        return []
    prefix = f"{code}-"
    if not compact.startswith(prefix):
        raise ValueError(f"Unexpected feeder list for {code}: {raw}")
    return [prefix + item for item in compact[len(prefix):].split(",") if item]


def parse_stations(reader: PdfReader) -> list[dict]:
    logical_rows: list[tuple[int, str]] = []
    for page_number in range(11, 17):
        text = reader.pages[page_number - 1].extract_text() or ""
        for raw in text.splitlines():
            line = clean(raw)
            if re.match(r"^[A-Z]{3}\s+", line):
                logical_rows.append((page_number, line))
            elif logical_rows and re.match(r"^[0-9][0-9, ]*$", line):
                old_page, old = logical_rows[-1]
                joiner = ""
                if not (old.endswith(",1") and line == "4"):
                    joiner = " "
                logical_rows[-1] = (old_page, old + joiner + line)

    records = []
    for page_number, row in logical_rows:
        code, rest = row.split(" ", 1)
        marker = f"{code}-"
        marker_index = rest.find(marker)
        if marker_index >= 0:
            name = clean(rest[:marker_index])
            feeder_raw = clean(rest[marker_index:])
        else:
            name = clean(rest.removesuffix("-").rstrip())
            feeder_raw = ""
        feeders = expand_feeders(code, feeder_raw)
        records.append(
            {
                "code": code,
                "name": name,
                "feeders": feeders,
                "source_page": page_number,
            }
        )
    if len(records) != 136:
        raise ValueError(f"Expected 136 station designations, found {len(records)}")
    return records


def main() -> None:
    reader = PdfReader(SOURCE)
    transmission_lines = parse_lines(reader)
    substations = parse_stations(reader)
    feeder_count = sum(len(record["feeders"]) for record in substations)
    if feeder_count != 302:
        raise ValueError(f"Expected 302 feeder designations, found {feeder_count}")

    content = SOURCE.read_bytes()
    payload = {
        "source": {
            "title": "2006 Capital Budget Application, Electrical System Handbook",
            "organization": "Newfoundland Power",
            "cover_date": "2005-06",
            "retrieved_on": "2026-11-09",
            "source_url": SOURCE_URL,
            "local_path": "research/sources/np-2006/NP2006ApplicationHandbook.pdf",
            "sha256": hashlib.sha256(content).hexdigest(),
            "bytes": len(content),
            "physical_pages": len(reader.pages),
        },
        "reported_totals": {
            "transmission_lines": 104,
            "substations": 136,
            "distribution_feeders": 302,
        },
        "generation_plants": [dict(record, source_page=4) for record in GENERATION_PLANTS],
        "transmission_lines": transmission_lines,
        "substations": substations,
        "notes": [
            "The generation list prints Greenhill as GRT on PDF p. 4. The transmission and station registers use GRH on PDF pp. 9 and 12.",
            "The transmission register does not state a voltage for each circuit. The derived schematic does not assign one.",
            "Tap names without a three-letter code are retained as printed.",
        ],
    }
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    print(
        f"Wrote {OUTPUT}: {len(transmission_lines)} lines, "
        f"{len(substations)} station codes, {feeder_count} feeders"
    )


if __name__ == "__main__":
    main()
