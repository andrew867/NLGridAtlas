import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { timeline } from "../src/data.js";
import workItems from "../docs/work-items.json" with { type: "json" };

test("1901 search does not create an unsupported timeline event", () => {
  assert.equal(timeline.some((entry) => entry.date === "1901"), false);
  const record = fs.readFileSync(new URL("../research/NP_1901_SYSTEM_RECORD.md", import.meta.url), "utf8");
  assert.match(record, /No named Newfoundland electric generating unit/);
  assert.match(record, /No event is added to the atlas timeline for 1901/);
});

test("1901 work item follows the 1902 queue", () => {
  const item = workItems.work_items.find((candidate) => candidate.id === "NPREG-127");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-126"]);
  assert.deepEqual(item.completion_evidence, ["research/NP_1901_SYSTEM_RECORD.md", "tests/np-1901-system.test.js"]);
});
