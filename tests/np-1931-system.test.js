import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { stationProfiles, timeline } from "../src/data.js";

test("1931 Pierre's Brook event retains the plant and original civil record", () => {
  const event = timeline.find((entry) => entry.date === "1931" && /Pierre's Brook/.test(entry.title));
  assert.ok(event);
  assert.equal(event.status, "reported");
  assert.equal(event.sourceId, "np-2015-pierre-brook");
  assert.match(event.body, /3\.4 MW nameplate/);
  assert.match(event.body, /steel penstock/);

  const station = stationProfiles.find((candidate) => candidate.code === "PBK");
  assert.ok(station);
  const history = station.historyRecords.map(({ label, facts }) => `${label} ${facts.flat().join(" ")}`).join(" ");
  assert.match(history, /1931 PLANT AND ORIGINAL CIVIL WORKS/);
  assert.match(history, /4\.3 MW plant/);
  assert.match(history, /1959 drawings.*not constructed/);
  assert.match(history, /Henry Lash/);
  assert.match(history, /Thomas Cotton/);
  assert.match(history, /Michael Vickers/);
});

test("1931 research preserves the dated capacity labels", () => {
  const record = fs.readFileSync(new URL("../research/NP_1931_SYSTEM_RECORD.md", import.meta.url), "utf8");
  assert.match(record, /3\.4 MW nameplate rating/);
  assert.match(record, /single-unit 4\.3 MW plant/);
  assert.match(record, /3,200 kW load rating/);
  assert.match(record, /4,100 kW peak output/);

  const workItems = JSON.parse(fs.readFileSync(new URL("../docs/work-items.json", import.meta.url), "utf8"));
  const item = workItems.work_items.find((candidate) => candidate.id === "NPREG-097");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.completion_evidence, ["research/NP_1931_SYSTEM_RECORD.md", "src/data.js", "tests/np-1931-system.test.js"]);
});
