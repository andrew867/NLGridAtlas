import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { islandTerminalRecords, sources, timeline } from "../src/data.js";
import workItems from "../docs/work-items.json" with { type: "json" };

test("1905 record retains the two dated Exploits equipment groups", () => {
  const event = timeline.find((entry) => entry.date === "1905");
  assert.ok(event);
  assert.match(event.body, /eight surface forebay gates/);
  assert.match(event.body, /Units 8 and 9.*1905/);
  assert.match(event.body, /out of service during the 2017 inspection/);

  const exploits = islandTerminalRecords.find((station) => station.code === "GFS");
  assert.match(JSON.stringify(exploits.facts), /S\. Morgan Smith/);
  assert.match(JSON.stringify(exploits.facts), /1\.6 MVA and 1\.9 MVA/);
});

test("1905 sources preserve exact pages, state and hashes", () => {
  const condition = sources.find((entry) => entry.id === "nlh-exploits-condition-2017");
  assert.match(condition.pages, /651/);
  assert.match(condition.pages, /690/);
  const plan = sources.find((entry) => entry.id === "nlh-2018-exploits-long-term-plan");
  assert.equal(plan.pages, "physical PDF pp. 22 to 23, report pp. 17 to 18");
  assert.equal(plan.status, "reported");

  const record = fs.readFileSync(new URL("../research/NP_1905_SYSTEM_RECORD.md", import.meta.url), "utf8");
  assert.match(record, /each unit at 1,000 kW/);
  assert.match(record, /not 1905 ratings/);
  assert.match(record, /7295b73cf565c32382d53881a6e3e6e655d42a1c7c7d9d74665fc8d096097f02/);
  assert.match(record, /ad539f42d053784d1d1b77dd8629bd712d43b2f54dff006ab2696db4e0abf924/);
});

test("1905 work item follows the 1906 queue", () => {
  const item = workItems.work_items.find((candidate) => candidate.id === "NPREG-123");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-122"]);
  assert.deepEqual(item.completion_evidence, ["research/NP_1905_SYSTEM_RECORD.md", "src/data.js", "tests/np-1905-system.test.js"]);
});
