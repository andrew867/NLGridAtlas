import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { sources, stationProfiles } from "../src/data.js";

const register = JSON.parse(
  await readFile(new URL("../research/derived/avalon-2006-switchgear-cubicle-registers.json", import.meta.url), "utf8")
);

test("2006 switchgear register retains its source hash and five station sheets", () => {
  assert.equal(register.source.sha256, "6fe51c538029c73422c2e6e7b0ac33fd818fbde66e36eda06ec548e5b288d6a0");
  assert.equal(register.source.form_revision_date, "2006-12-08");
  assert.deepEqual(register.records.map(({ station_code }) => station_code), ["KBR", "PEP", "RRD", "SJM", "SLA"]);
  assert.deepEqual(register.records.map(({ physical_pdf_page }) => physical_pdf_page), [48, 57, 61, 65, 66]);
});

test("switchgear inventories are attached as dated station histories", () => {
  const source = sources.find(({ id }) => id === "np-2016-pub-np-064-f");
  assert.ok(source);
  assert.equal(source.status, "verified");

  for (const record of register.records) {
    const station = stationProfiles.find(({ code }) => code === record.station_code);
    assert.ok(station, record.station_code);
    const history = station.historyRecords.find(({ sourceId }) => sourceId === source.id);
    assert.ok(history, record.station_code);
    assert.equal(history.pages, `physical PDF p. ${record.physical_pdf_page}`);
  }

  const ridgeRoad = stationProfiles.find(({ code }) => code === "RRD");
  const ridgeRoadText = ridgeRoad.historyRecords.find(({ sourceId }) => sourceId === source.id).facts.flat().join(" ");
  assert.match(ridgeRoadText, /RRD-TB-2-3.*RRD-TIE-2-3-D.*RRD-TB-3-4/);

  const stJohnsMain = stationProfiles.find(({ code }) => code === "SJM");
  const stJohnsText = stJohnsMain.historyRecords.find(({ sourceId }) => sourceId === source.id).facts.flat().join(" ");
  assert.match(stJohnsText, /SJM-TB-1-2.*SJM-TB-1-3.*SJM-TIE-1-3-D/);
});
