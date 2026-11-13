import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const loads = JSON.parse(
  await readFile(new URL("../research/derived/gnp-loads-2001.json", import.meta.url), "utf8")
);

test("IC-270 load extraction retains the complete monthly-row count and source hash", () => {
  assert.equal(loads.monthly_row_count, 112);
  assert.equal(loads.units.peak_demand, "kW");
  assert.equal(loads.source.physical_pdf_pages, "5 to 7");
  assert.equal(loads.source.sha256, "7C025C2ADDFA4133B06649698AE41C2E67FA998BCE94363696659F784B5345E3");
});

test("2001 Great Northern Peninsula forecast differences reconcile", () => {
  const bearCove = loads.forecast_comparison_2001.bear_cove;
  assert.equal(bearCove.recorded_january_to_april_peak_kw - bearCove.filed_winter_peak_forecast_kw, bearCove.difference_kw);
  assert.equal(bearCove.difference_kw, 799);
  assert.equal(bearCove.difference_percent_of_forecast, 16.0);

  const plumPoint = loads.forecast_comparison_2001.plum_point;
  assert.equal(plumPoint.recorded_january_to_april_peak_kw - plumPoint.filed_winter_peak_forecast_kw, plumPoint.difference_kw);
  assert.equal(plumPoint.difference_kw, -1220);
  assert.equal(plumPoint.difference_percent_of_forecast, -27.7);
});

test("complete-year peak series excludes years with missing monthly kW values", () => {
  assert.deepEqual(loads.complete_year_peaks.bear_cove.map(({ year }) => year), [1992, 1993, 1994, 1996, 1997, 1998, 1999]);
  assert.deepEqual(loads.complete_year_peaks.plum_point.map(({ year }) => year), [1994, 1996, 1997, 1998, 1999, 2000]);
  assert.equal(loads.complete_year_peaks.bear_cove.find(({ year }) => year === 1992).peak_kw, 6931);
  assert.equal(loads.complete_year_peaks.plum_point.find(({ year }) => year === 1999).peak_kw, 4224);
});
