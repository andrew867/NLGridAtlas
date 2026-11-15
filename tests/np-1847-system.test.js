import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { timeline } from "../src/data.js";
import workItems from "../docs/work-items.json" with { type: "json" };

test("1847 communications editorial is not turned into a telegraph event", () => {
  assert.equal(timeline.some((entry) => entry.date === "1847" || entry.date.startsWith("1847-")), false);
  const record = fs.readFileSync(new URL("../research/NP_1847_SYSTEM_RECORD.md", import.meta.url), "utf8");
  assert.match(record, /regular steam communication between St. John's and Boston/);
  assert.match(record, /New York and Halifax by way of Canada/);
  assert.match(record, /weekly steam service to Boston, not a telegraph line/);
});

test("1847 record retains its physical page and source hash", () => {
  const record = fs.readFileSync(new URL("../research/NP_1847_SYSTEM_RECORD.md", import.meta.url), "utf8");
  assert.match(record, /physical PDF p\. 2/);
  assert.match(record, /e375ba20a8611c5b4dca130e58e7143bd84dc92fcba6b812fa72bc53dcf22cdf/);
  assert.match(record, /No event is added to the atlas timeline for 1847/);
});

test("1847 work item is complete", () => {
  const item = workItems.work_items.find((entry) => entry.id === "NPREG-181");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-180"]);
  assert.deepEqual(item.completion_evidence, ["research/NP_1847_SYSTEM_RECORD.md", "tests/np-1847-system.test.js"]);
});
