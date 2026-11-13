import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { sources, stationProfiles } from "../src/data.js";

const repairRegister = JSON.parse(
  await readFile(new URL("../research/derived/np-transformer-repair-times-2025.json", import.meta.url), "utf8")
);

test("NLH-NP-014 preserves all six transformer repair records", () => {
  assert.equal(repairRegister.source.sha256, "cc883009ff958225c9db9200d8100dac9b68961213428e201d4c6f6f5dc7a783");
  assert.equal(repairRegister.records.length, 6);
  assert.equal(new Set(repairRegister.records.map(({ transformer }) => transformer)).size, 6);
  assert.deepEqual(
    repairRegister.records.map(({ transformer, days_out_of_service_for_repair }) => [transformer, days_out_of_service_for_repair]),
    [["BLK-T2", 126], ["DUN-T1", 773], ["SLA-T3", 5], ["HUM-T2", 6], ["HUM-T3", 6], ["TRN-T1", 1]]
  );
  assert.ok(repairRegister.records.every(({ returned_to_service }) => returned_to_service));
});

test("source ledger preserves the repair table locator", () => {
  const source = sources.find(({ id }) => id === "np-2026-nlh-np-014");
  assert.equal(source.pages, "physical PDF p. 1");
  assert.equal(source.status, "verified");
  for (const transformer of repairRegister.records.map(({ transformer }) => transformer)) {
    assert.ok(source.topics.includes(transformer), transformer);
  }
});

test("affected stations expose the reported repair histories", () => {
  for (const row of repairRegister.records) {
    const station = stationProfiles.find(({ code }) => code === row.station_code);
    assert.ok(station, row.station_code);
    const repairHistory = station.historyRecords.find(({ sourceId }) => sourceId === "np-2026-nlh-np-014");
    assert.ok(repairHistory, row.station_code);
    assert.match(JSON.stringify(repairHistory), new RegExp(row.transformer));
    assert.match(JSON.stringify(repairHistory), new RegExp(`(?:^|\\D)${row.days_out_of_service_for_repair}(?:\\D|$)`));
  }
});

test("Trinity keeps repair time separate from customer interruption time", () => {
  const trinity = stationProfiles.find(({ code }) => code === "TRN");
  const failure = trinity.historyRecords.find(({ label }) => label === "2020 TRN-T1 BUSHING FAILURE");
  const repair = trinity.historyRecords.find(({ sourceId }) => sourceId === "np-2026-nlh-np-014");
  assert.match(JSON.stringify(failure), /25 hours and 58 minutes/);
  assert.match(JSON.stringify(repair), /1 day/);
});
