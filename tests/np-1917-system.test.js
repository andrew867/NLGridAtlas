import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { sources, stationProfiles, timeline } from "../src/data.js";

const historyText = (code) => {
  const station = stationProfiles.find((candidate) => candidate.code === code);
  assert.ok(station, `missing station ${code}`);
  return station.historyRecords.map(({ label, facts }) => `${label} ${facts.flat().join(" ")}`).join(" ");
};

test("1917 records retain Port Union commissioning and the Cochrane Pond diversion", () => {
  const events = timeline.filter((entry) => entry.date === "1917");
  assert.equal(events.length, 2);
  assert.ok(events.some((entry) => /Port Union hydroelectric development entered service/.test(entry.title)));
  assert.ok(events.some((entry) => /Cochrane Pond was diverted/.test(entry.title)));

  assert.match(historyText("PUN"), /1917 DEVELOPMENT COMMISSIONING.*21\.3 m net head/);
  assert.match(historyText("PUN"), /500 kW.*511 kW/);
  assert.match(historyText("PUN"), /both Pelton governors as original to the 1917 construction/);
  assert.match(historyText("PHR"), /1917 COCHRANE POND WATERSHED DIVERSION.*Manuels River/);
});

test("1917 sources and research retain conflicts and unassigned ledger values", () => {
  for (const id of [
    "np-1917-port-union-development",
    "np-1917-port-union-units",
    "np-1917-port-union-governors",
    "np-1917-cochrane-diversion",
    "np-1917-bay-bulls-big-pond-property"
  ]) {
    assert.ok(sources.some((source) => source.id === id), `missing source ${id}`);
  }

  const record = fs.readFileSync(new URL("../research/NP_1917_SYSTEM_RECORD.md", import.meta.url), "utf8");
  assert.match(record, /concrete powerhouse.*wood-frame powerhouse/);
  assert.match(record, /137 m.*118 m/);
  assert.match(record, /\$19,139 in account 322\.00/);
  assert.match(record, /not assigned to Port Union or other named atlas assets/);

  const workItems = JSON.parse(fs.readFileSync(new URL("../docs/work-items.json", import.meta.url), "utf8"));
  const item = workItems.work_items.find((candidate) => candidate.id === "NPREG-111");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.completion_evidence, ["research/NP_1917_SYSTEM_RECORD.md", "src/data.js", "tests/np-1917-system.test.js"]);
});
