import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { timeline } from "../src/data.js";
import workItems from "../docs/work-items.json" with { type: "json" };

test("1891 municipal licence does not create an unsupported system event", () => {
  assert.equal(timeline.some((entry) => entry.date === "1891"), false);
  const record = fs.readFileSync(new URL("../research/NP_1891_SYSTEM_RECORD.md", import.meta.url), "utf8");
  assert.match(record, /annual licence fee of \$200/);
  assert.match(record, /physical PDF p\. 1/);
  assert.match(record, /clause 8/);
  assert.match(record, /cef57a335e98f3cd671ee0eb934d01942e5de468fa7ab373ecdc0de5444adcf6/);
});

test("1891 work item follows the 1892 queue", () => {
  const item = workItems.work_items.find((candidate) => candidate.id === "NPREG-137");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-136"]);
  assert.deepEqual(item.completion_evidence, ["research/NP_1891_SYSTEM_RECORD.md", "tests/np-1891-system.test.js"]);
});

