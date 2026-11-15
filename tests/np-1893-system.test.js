import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { timeline } from "../src/data.js";
import workItems from "../docs/work-items.json" with { type: "json" };

test("1893 search does not create an unsupported system event", () => {
  assert.equal(timeline.some((entry) => entry.date === "1893"), false);
  const record = fs.readFileSync(new URL("../research/NP_1893_SYSTEM_RECORD.md", import.meta.url), "utf8");
  assert.match(record, /corporate presence, not a change to the electrical system/);
  assert.match(record, /physical PDF p\. 241, printed p\. 139/);
  assert.match(record, /1c9aab2362eb02074740869b20e7ef1e1c1148a2ef81e07f1bf24ac37dcd982d/);
  assert.match(record, /7d09c4f97c78723323f54da0705a8a4be38d6347635973f3fdc8b5ae9d6a0f81/);
});

test("1893 work item follows the 1894 queue", () => {
  const item = workItems.work_items.find((candidate) => candidate.id === "NPREG-135");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-134"]);
  assert.deepEqual(item.completion_evidence, ["research/NP_1893_SYSTEM_RECORD.md", "tests/np-1893-system.test.js"]);
});
