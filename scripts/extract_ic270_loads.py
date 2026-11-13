"""Extract the IC-270 Bear Cove and Plum Point peak-demand series."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
from collections import defaultdict
from pathlib import Path

import fitz


MONTH_ROW = re.compile(r"^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-\d{2}$")


def value(text: str) -> int | None:
    return None if text == "N/A" else int(text)


def extract(pdf_path: Path) -> dict:
    document = fitz.open(pdf_path)
    monthly = []
    forecasts = {}

    for page_index in range(4, 7):
        rows = defaultdict(list)
        for x0, y0, _x1, _y1, text, *_rest in document[page_index].get_text("words"):
            rows[round(y0, 1)].append((x0, text))
        for row in rows.values():
            words = [text for _x, text in sorted(row)]
            if words and MONTH_ROW.match(words[0]):
                if len(words) != 5:
                    raise ValueError(f"Unexpected monthly row: {words}")
                monthly.append({
                    "month": words[0],
                    "bear_cove_mwh": value(words[1]),
                    "bear_cove_peak_kw": value(words[2]),
                    "plum_point_mwh": value(words[3]),
                    "plum_point_peak_kw": value(words[4]),
                })
            elif len(words) == 4 and words[1] == "forecast" and words[0] in {"2001", "2002"}:
                forecasts[words[0]] = {
                    "bear_cove_peak_kw": int(words[2]),
                    "plum_point_peak_kw": int(words[3]),
                }

    if len(monthly) != 112:
        raise ValueError(f"Expected 112 monthly rows, found {len(monthly)}")
    if set(forecasts) != {"2001", "2002"}:
        raise ValueError(f"Missing forecast rows: {forecasts}")

    complete_year_peaks = {"bear_cove": [], "plum_point": []}
    for year in range(1992, 2001):
        rows = [row for row in monthly if row["month"].endswith(f"-{str(year)[2:]}")]
        for system, field in (("bear_cove", "bear_cove_peak_kw"), ("plum_point", "plum_point_peak_kw")):
            values = [row[field] for row in rows]
            if len(values) == 12 and all(item is not None for item in values):
                complete_year_peaks[system].append({"year": year, "peak_kw": max(values)})

    partial_2001 = [row for row in monthly if row["month"].endswith("-01")]
    comparison_2001 = {}
    for system, field in (("bear_cove", "bear_cove_peak_kw"), ("plum_point", "plum_point_peak_kw")):
        observed = max(row[field] for row in partial_2001 if row[field] is not None)
        forecast = forecasts["2001"][field]
        difference = observed - forecast
        comparison_2001[system] = {
            "recorded_january_to_april_peak_kw": observed,
            "filed_winter_peak_forecast_kw": forecast,
            "difference_kw": difference,
            "difference_percent_of_forecast": round(difference / forecast * 100, 1),
        }

    return {
        "source": {
            "title": "IC-270, 2001 General Rate Application",
            "url": "http://www.pub.nl.ca/ARCHIVE/hyd01gra/filings/hydresp/Indust/IC%20270.pdf",
            "physical_pdf_pages": "5 to 7",
            "sha256": hashlib.sha256(pdf_path.read_bytes()).hexdigest().upper(),
        },
        "units": {"energy": "MWh", "peak_demand": "kW"},
        "monthly_row_count": len(monthly),
        "complete_year_peaks": complete_year_peaks,
        "forecast_comparison_2001": comparison_2001,
        "forecasts": forecasts,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("pdf", type=Path)
    args = parser.parse_args()
    print(json.dumps(extract(args.pdf), indent=2))


if __name__ == "__main__":
    main()
