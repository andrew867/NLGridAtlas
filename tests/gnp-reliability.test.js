import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { sources, staticClaims } from "../src/data.js";

const record = JSON.parse(
  await readFile(new URL("../research/derived/gnp-reliability-2026.json", import.meta.url), "utf8")
);

test("2026 Great Northern Peninsula reliability record retains its source hash and page range", () => {
  assert.equal(record.source.sha256, "5E0C3D2DE891081AB82BAD83CF42641134B05D0555F6801367777255572ABD36");
  assert.equal(record.source.physical_pdf_pages, "8 to 10 and 15 to 16");
  const source = sources.find(({ id }) => id === "nlh-gnp-reliability-2026");
  assert.ok(source);
  assert.match(source.pages, /8 to 10 and 15 to 16/);
});

test("five-year reliability and outage-cause values reconcile", () => {
  const regional = record.reliability_2021_to_2025.great_northern_peninsula;
  assert.equal(regional.saidi_hours_per_customer_per_year, 15.67);
  assert.equal(regional.saifi_interruptions_per_customer_per_year, 5.99);
  assert.equal(Object.values(record.reliability_2021_to_2025.outage_cause_percent).reduce((sum, value) => sum + value, 0), 100);
  assert.deepEqual(record.system_extent, {
    terminal_stations: 16,
    transmission_line_km_approximate: 700,
    communities: 13
  });
  assert.deepEqual(record.regional_line_design, {
    radial_ice_inches_maximum: 1.5,
    wind_mph_maximum: 110
  });
});

test("reliability card and source ledger use the filed values", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  assert.match(html, /id="gnp-reliability"/);
  assert.match(html, /15\.67 hours per customer per year/);
  assert.match(html, /5\.99 interruptions per customer per year/);
  assert.match(html, /16 terminal stations; about 700 km of transmission line; 13 communities/);
  assert.match(html, /27% planned, 24% equipment, 20% adverse weather, 19% tree contact and 10% unplanned transmission outages/);
  const claim = staticClaims.find(({ id }) => id === "gnp-2021-2025-reliability");
  assert.deepEqual(claim.sources, [{ sourceId: "nlh-gnp-reliability-2026", pages: "physical PDF pp. 8 to 9" }]);
});
