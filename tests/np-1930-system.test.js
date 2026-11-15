import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { stationProfiles, timeline } from "../src/data.js";

const stationText = (code) => {
  const station = stationProfiles.find((candidate) => candidate.code === code);
  assert.ok(station, `missing station ${code}`);
  return station.historyRecords.map(({ label, facts }) => `${label} ${facts.flat().join(" ")}`).join(" ");
};

test("1930 infrastructure events retain exact source distinctions", () => {
  const events = timeline.filter((entry) => entry.date === "1930");
  assert.equal(events.length, 3);
  assert.match(events.find(({ title }) => /3L/.test(title)).body, /Goulds and Petty Harbour/);
  assert.match(events.find(({ title }) => /Lawn/.test(title)).body, /timber-crib intake/);
  assert.match(events.find(({ title }) => /Grand Falls/.test(title)).body, /does not identify its unit number/);

  assert.match(stationText("PHR"), /400 in the Petty Harbour area/);
  assert.match(stationText("LWN"), /original timber-crib structure built in 1930/);
  assert.match(stationText("PBK"), /exciter supplied with the General Electric generator in 1930/);
  assert.match(stationText("BCV"), /Samuel Tucker on October 14, 1930/);
  assert.match(stationText("GFS"), /original Units 1 to 3 were removed in 2002/);
});

test("1930 research records the unresolved Grand Falls unit and property date", () => {
  const record = fs.readFileSync(new URL("../research/NP_1930_SYSTEM_RECORD.md", import.meta.url), "utf8");
  assert.match(record, /does not identify the unit number/);
  assert.match(record, /scan does not make the August day legible/);
  assert.match(record, /4\.7 km at a cost of \$364,000/);

  const workItems = JSON.parse(fs.readFileSync(new URL("../docs/work-items.json", import.meta.url), "utf8"));
  const item = workItems.work_items.find((candidate) => candidate.id === "NPREG-098");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.completion_evidence, ["research/NP_1930_SYSTEM_RECORD.md", "src/data.js", "tests/np-1930-system.test.js"]);
});
