import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { stationProfiles, timeline } from "../src/data.js";

const stationText = (code) => {
  const station = stationProfiles.find((candidate) => candidate.code === code);
  assert.ok(station, `missing station ${code}`);
  return station.historyRecords.map(({ label, facts }) => `${label} ${facts.flat().join(" ")}`).join(" ");
};

test("1929 events separate generation from limited regulatory authority", () => {
  const events = timeline.filter((entry) => entry.date === "1929");
  assert.equal(events.length, 2);
  assert.match(events.find(({ title }) => /Lawn/.test(title)).body, /two original Voith turbines/);
  const commission = events.find(({ title }) => /Public Utilities Commission/.test(title));
  assert.match(commission.body, /did not yet have general authority/);

  assert.match(stationText("LWN"), /1929 WOODSTAVE PENSTOCK.*replaced in 1981.*286 m/);
  assert.match(stationText("BIG"), /William Frizzelle on September 25, 1929/);
});

test("1929 research preserves the commission and asset boundaries", () => {
  const record = fs.readFileSync(new URL("../research/NP_1929_SYSTEM_RECORD.md", import.meta.url), "utf8");
  assert.match(record, /could investigate matters referred by government/);
  assert.match(record, /general supervisory authority followed in 1949/);
  assert.match(record, /original penstock to 1929/);

  const workItems = JSON.parse(fs.readFileSync(new URL("../docs/work-items.json", import.meta.url), "utf8"));
  const item = workItems.work_items.find((candidate) => candidate.id === "NPREG-099");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.completion_evidence, ["research/NP_1929_SYSTEM_RECORD.md", "src/data.js", "tests/np-1929-system.test.js"]);
});
