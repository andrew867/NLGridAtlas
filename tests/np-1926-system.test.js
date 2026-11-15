import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { sources, stationProfiles, timeline } from "../src/data.js";

const stationText = (code) => {
  const station = stationProfiles.find((candidate) => candidate.code === code);
  assert.ok(station, `missing station ${code}`);
  return station.historyRecords.map(({ label, facts }) => `${label} ${facts.flat().join(" ")}`).join(" ");
};

test("1926 records retain the Petty Harbour addition and Seal Cove conflict", () => {
  const event = timeline.find((entry) => entry.date === "1926");
  assert.ok(event);
  assert.match(event.title, /Petty Harbour added a generating unit/);
  assert.match(event.body, /cannot be assigned to the present unit register/);

  assert.match(stationText("PHR"), /1926 GENERATING-UNIT ADDITION.*horizontal Francis/);
  assert.match(stationText("PHR"), /1926 POWERHOUSE EXTENSION.*upgraded and extended/);
  assert.match(stationText("SCV"), /1926 REPORTED G2 VINTAGE.*2\.4 MW/);
  assert.match(stationText("SCV"), /2013 CONFLICTING UNIT TABLE.*both listed with 1924/);
  assert.match(stationText("BIG"), /1926 PROPERTY RECORD.*November 10, 1926/);
});

test("1926 sources and work item remain traceable", () => {
  for (const id of ["np-1926-petty-harbour-development", "np-1926-petty-harbour-building", "np-1926-seal-cove-g2", "np-1926-property-record"]) {
    assert.ok(sources.some((source) => source.id === id), `missing source ${id}`);
  }

  const record = fs.readFileSync(new URL("../research/NP_1926_SYSTEM_RECORD.md", import.meta.url), "utf8");
  assert.match(record, /without assigning it to a current unit identifier/);
  assert.match(record, /do not reconcile the G2 year or the two capacity pairs/);

  const workItems = JSON.parse(fs.readFileSync(new URL("../docs/work-items.json", import.meta.url), "utf8"));
  const item = workItems.work_items.find((candidate) => candidate.id === "NPREG-102");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.completion_evidence, ["research/NP_1926_SYSTEM_RECORD.md", "src/data.js", "tests/np-1926-system.test.js"]);
});
