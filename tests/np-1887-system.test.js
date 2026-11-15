import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { timeline } from "../src/data.js";
import workItems from "../docs/work-items.json" with { type: "json" };

test("1887 search does not turn the graving-dock tariff into a system event", () => {
  assert.equal(timeline.some((entry) => entry.date === "1887"), false);
  const record = fs.readFileSync(new URL("../research/NP_1887_SYSTEM_RECORD.md", import.meta.url), "utf8");
  assert.match(record, /\$3 per hour per light/);
  assert.match(record, /does not identify the lamp owner, generating source, supply circuit/);
  assert.match(record, /physical PDF p\. 153, printed p\. 149/);
  assert.match(record, /b1ea0e5b3bfdc27d20ce4692fcc43d41e689c61d1b7aadd7a9d2c82fabc62c8d/);
});

test("1887 work item follows the 1888 queue", () => {
  const item = workItems.work_items.find((candidate) => candidate.id === "NPREG-141");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-140"]);
  assert.deepEqual(item.completion_evidence, ["research/NP_1887_SYSTEM_RECORD.md", "tests/np-1887-system.test.js"]);
});
