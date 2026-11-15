import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { sources, stationProfiles, timeline } from "../src/data.js";

const historyText = (code) => {
  const station = stationProfiles.find((candidate) => candidate.code === code);
  assert.ok(station, `missing station ${code}`);
  return station.historyRecords.map(({ label, facts }) => `${label} ${facts.flat().join(" ")}`).join(" ");
};

test("1918 records keep the Heart's Content plant and Port Union penstock dates separate", () => {
  const event = timeline.find((entry) => entry.date === "1918");
  assert.ok(event);
  assert.match(event.title, /Heart's Content hydroelectric development entered service/);
  assert.match(event.body, /current machine ratings are not assigned to the 1918 equipment/);

  assert.match(historyText("HCT"), /1918 ORIGINAL DEVELOPMENT AND CORRIDOR DEED/);
  assert.match(historyText("HCT"), /June 14, 1918.*14 ft wide pipe or flume corridor/);
  assert.match(historyText("PUN"), /1918 ORIGINAL WOODSTAVE PENSTOCK.*replaced in 1984.*137 m/);
  assert.match(historyText("PUN"), /plant commissioning and both original turbines to 1917/);
});

test("1918 sources and research record retain exact evidence boundaries", () => {
  for (const id of [
    "np-1918-hearts-content-development",
    "np-1918-hearts-content-service",
    "np-1918-hearts-content-property",
    "np-1918-port-union-penstock"
  ]) {
    assert.ok(sources.some((source) => source.id === id), `missing source ${id}`);
  }

  const record = fs.readFileSync(new URL("../research/NP_1918_SYSTEM_RECORD.md", import.meta.url), "utf8");
  assert.match(record, /The penstock construction year and plant commissioning year remain separate asset dates/);
  assert.match(record, /\$4,850 in account 326\.00/);
  assert.match(record, /\$700 in account 327\.00/);
  assert.match(record, /not assigned to named atlas assets/);

  const workItems = JSON.parse(fs.readFileSync(new URL("../docs/work-items.json", import.meta.url), "utf8"));
  const item = workItems.work_items.find((candidate) => candidate.id === "NPREG-110");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.completion_evidence, ["research/NP_1918_SYSTEM_RECORD.md", "src/data.js", "tests/np-1918-system.test.js"]);
});
