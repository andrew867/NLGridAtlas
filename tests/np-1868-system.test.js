import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { timeline } from "../src/data.js";
import workItems from "../docs/work-items.json" with { type: "json" };

test("1868 search does not turn routine telegraph expense into a system event", () => {
  assert.equal(timeline.some((entry) => entry.date === "1868" || entry.date.startsWith("1868-")), false);
  const record = fs.readFileSync(new URL("../research/NP_1868_SYSTEM_RECORD.md", import.meta.url), "utf8");
  assert.match(record, /\$126\.45 contingent-expense payment/);
  assert.match(record, /does not identify a new line, station, cable, operating change or construction project/);
  assert.match(record, /physical PDF pp\. 134 and 655, printed pp\. 130 and 578/);
  assert.match(record, /2f79446d8af69396dc1bb73c0c187f0247144f413362c872898f9c696ef4490f/);
});

test("1868 record assigns the dated pole evidence to the 1867 queue", () => {
  const record = fs.readFileSync(new URL("../research/NP_1868_SYSTEM_RECORD.md", import.meta.url), "utf8");
  assert.match(record, /December 31, 1867/);
  assert.match(record, /belongs to the 1867 queue/);
});

test("1868 work item follows the 1869 queue", () => {
  const item = workItems.work_items.find((candidate) => candidate.id === "NPREG-160");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-159"]);
  assert.deepEqual(item.completion_evidence, ["research/NP_1868_SYSTEM_RECORD.md", "tests/np-1868-system.test.js"]);
});
