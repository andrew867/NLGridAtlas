import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { sources, stationProfiles } from "../src/data.js";

const register = JSON.parse(
  await readFile(new URL("../research/derived/np-rural-feeder-reliability-and-closeouts.json", import.meta.url), "utf8")
);

test("rural feeder source digests and page locators are preserved", () => {
  assert.deepEqual(
    register.sources.map(({ id, sha256 }) => [id, sha256]),
    [
      ["np-2018-feeder-automation", "d5fe2f1847725348d395edbdd0d34d649d6749c4a00eb4babb15fd1924da59ed"],
      ["np-2019-capex-report-2018", "cf3040ef577d52049bbc248635ff8b78211b4aa37aea56420ae79cfcde044ae8"],
      ["np-2022-ca-np-034", "1e54e3c0e9580a1bcf1b007d8c961c60f6c39906c59119dc8155328aff6c2e51"],
      ["np-2021-pbd01", "3f482d1be23a135b3ca9752909bee2331fc88da6e7f5b78d57b234571118af02"],
      ["np-2023-capex-report-2022", "8dc8c59e30984ba71610b32ee9f591d8d7248df901270c54ec362e4d1575cfcc"]
    ]
  );
  for (const source of register.sources) {
    assert.ok(source.physical_pdf_pages.length > 0, source.id);
  }
});

test("MIL-02 and PBD-01 reliability values match CA-NP-034", () => {
  assert.equal(register.reliability_period.system_average_saidi_hours, 1.82);
  assert.equal(register.reliability_period.system_average_saifi_interruptions_per_year, 1.33);
  assert.deepEqual(register.reliability_period.records, [
    {
      station_code: "MIL",
      feeder: "MIL-02",
      customers: 1493,
      average_saidi_hours: 2.98,
      average_saifi_interruptions_per_year: 1.55,
      physical_pdf_pages: [2, 3]
    },
    {
      station_code: "PBD",
      feeder: "PBD-01",
      customers: 672,
      average_saidi_hours: 2.2,
      average_saifi_interruptions_per_year: 1.47,
      physical_pdf_pages: [2, 3]
    }
  ]);
});

test("program closeouts preserve published arithmetic", () => {
  const [substations, loadGrowth] = register.program_closeouts;
  assert.equal(substations.actual_expenditure_cad - substations.approved_budget_cad, substations.variance_cad);
  assert.equal(loadGrowth.actual_expenditure_2021_cad + loadGrowth.actual_expenditure_2022_cad, loadGrowth.actual_expenditure_total_cad);
  assert.equal(loadGrowth.actual_expenditure_total_cad - loadGrowth.approved_budget_cad, loadGrowth.variance_cad);
  assert.ok(register.program_closeouts.every(({ carryover_cad, program_closeout_only }) => carryover_cad === 0 && program_closeout_only));
});

test("source ledger includes reliability and closeout records", () => {
  const expected = new Map([
    ["np-2019-capex-report-2018", "physical PDF pp. 4 to 5, 8 to 10, 13, 17, 20 and 26"],
    ["np-2022-ca-np-034", "physical PDF pp. 1 to 3"],
    ["np-2023-capex-report-2022", "physical PDF pp. 4, 10, 13, 17 to 18 and 21"]
  ]);
  for (const [id, pages] of expected) {
    const source = sources.find((candidate) => candidate.id === id);
    assert.ok(source, id);
    assert.equal(source.pages, pages);
    assert.equal(source.status, "reported");
  }
});

test("station histories expose reliability and program closeouts", () => {
  const milton = stationProfiles.find(({ code }) => code === "MIL");
  const portBlandford = stationProfiles.find(({ code }) => code === "PBD");
  const newHarbour = stationProfiles.find(({ code }) => code === "NHR");

  assert.match(JSON.stringify(milton.historyRecords), /MIL-02.*1,493 customers.*2\.98 hours.*1\.55 interruptions per year/);
  assert.match(JSON.stringify(portBlandford.historyRecords), /PBD-01.*672 customers.*2\.20 hours.*1\.47 interruptions per year/);
  assert.ok(newHarbour.historyRecords.some(({ sourceId }) => sourceId === "np-2019-capex-report-2018"));
  assert.ok(portBlandford.historyRecords.some(({ sourceId }) => sourceId === "np-2019-capex-report-2018"));
  assert.ok(portBlandford.historyRecords.some(({ sourceId }) => sourceId === "np-2023-capex-report-2022"));
});
