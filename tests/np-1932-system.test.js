import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { stationProfiles, timeline } from "../src/data.js";

test("1932 Topsail event retains the original unit and intake record", () => {
  const event = timeline.find((entry) => entry.date === "1932" && /Topsail/.test(entry.title));
  assert.ok(event);
  assert.equal(event.status, "reported");
  assert.equal(event.sourceId, "np-2021-topsail-refurbishment");
  assert.match(event.body, /1\.2 MW turbine-generator/);
  assert.match(event.body, /intake foundation and gate conduit/);

  const topsail = stationProfiles.find((station) => station.code === "TOP");
  assert.ok(topsail);
  const facts = topsail.historyRecords.flatMap(({ facts }) => facts).flat().join(" ");
  assert.match(facts, /2,300 kW under about 111\.2 m net head/);
  assert.match(facts, /2\.6 MW at 85\.5 m rated net head/);
  assert.match(facts, /do not reconcile the two capacity and net-head records/);
});

test("1932 research preserves the source distinction", () => {
  const record = fs.readFileSync(new URL("../research/NP_1932_SYSTEM_RECORD.md", import.meta.url), "utf8");
  assert.match(record, /original 1932 unit was rated 1\.2 MW/);
  assert.match(record, /2010 development record gives 2,300 kW/);
  assert.match(record, /2020 engineering report gives 2\.6 MW/);
  assert.match(record, /do not reconcile the capacity and net-head values/);

  const workItems = JSON.parse(fs.readFileSync(new URL("../docs/work-items.json", import.meta.url), "utf8"));
  const item = workItems.work_items.find((candidate) => candidate.id === "NPREG-096");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.completion_evidence, ["research/NP_1932_SYSTEM_RECORD.md", "src/data.js", "tests/np-1932-system.test.js"]);
});
