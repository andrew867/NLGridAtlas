import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { timeline } from "../src/data.js";
import workItems from "../docs/work-items.json" with { type: "json" };

test("1890 directory evidence does not create an unsupported system event", () => {
  assert.equal(timeline.some((entry) => entry.date === "1890"), false);
  const record = fs.readFileSync(new URL("../research/NP_1890_SYSTEM_RECORD.md", import.meta.url), "utf8");
  assert.match(record, /corner of Prescott Street and Flavin's Lane/);
  assert.match(record, /printed p\. 272/);
  assert.match(record, /291020a83c222381b95f059f01a27fd6b45c295b60d1d2f0bdc5ce2186a87568/);
  assert.match(record, /d813be90d7577a56db090fb3a12d553151fa19d8489563061f3bb59df1f8f88b/);
});

test("1890 work item follows the 1891 queue", () => {
  const item = workItems.work_items.find((candidate) => candidate.id === "NPREG-138");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-137"]);
  assert.deepEqual(item.completion_evidence, ["research/NP_1890_SYSTEM_RECORD.md", "tests/np-1890-system.test.js"]);
});

