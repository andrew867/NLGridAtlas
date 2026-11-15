import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { timeline } from "../src/data.js";
import workItems from "../docs/work-items.json" with { type: "json" };

test("1846 foreign submarine test is not turned into a Newfoundland event", () => {
  assert.equal(timeline.some((entry) => entry.date === "1846" || entry.date.startsWith("1846-")), false);
  const record = fs.readFileSync(new URL("../research/NP_1846_SYSTEM_RECORD.md", import.meta.url), "utf8");
  assert.match(record, /Admiralty submarine-telegraph experiments in Portsmouth Harbour/);
  assert.match(record, /HMS \*Blake\*/);
  assert.match(record, /receiving index showed the signals/);
  assert.match(record, /test occurred in Portsmouth, England/);
});

test("1846 record retains its physical page and source hash", () => {
  const record = fs.readFileSync(new URL("../research/NP_1846_SYSTEM_RECORD.md", import.meta.url), "utf8");
  assert.match(record, /physical PDF p\. 1/);
  assert.match(record, /5f1d369084e190cdb09818b23a632a3716b9e0f0a6af40a1a3a6cfc6cf401242/);
  assert.match(record, /No event is added to the atlas timeline for 1846/);
});

test("1846 work item is complete", () => {
  const item = workItems.work_items.find((entry) => entry.id === "NPREG-182");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-181"]);
  assert.deepEqual(item.completion_evidence, ["research/NP_1846_SYSTEM_RECORD.md", "tests/np-1846-system.test.js"]);
});
