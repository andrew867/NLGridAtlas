import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { sources, timeline } from "../src/data.js";
import workItems from "../docs/work-items.json" with { type: "json" };

test("1872 record keeps current western-office reporting separate from intended changes", () => {
  const events = timeline.filter((entry) => entry.date === "1872-11-13");
  assert.equal(events.length, 2);

  const operating = events.find((entry) => entry.status === "reported");
  assert.ok(operating);
  assert.match(operating.body, /did not support the alleged abandonment/);
  assert.match(operating.body, /Rose Blanche as an operating office/);
  assert.match(operating.body, /not part of a general plan/);

  const intended = events.find((entry) => entry.status === "proposed");
  assert.ok(intended);
  assert.match(intended.body, /expected to close in spring/);
  assert.match(intended.body, /intention to open a new telegraph office at Bay Roberts/);
});

test("1872 source preserves the exact physical page locator", () => {
  const source = sources.find((entry) => entry.id === "mun-morning-chronicle-1872-western-telegraph-offices");
  assert.ok(source);
  assert.equal(source.pages, "physical PDF p. 2");
  assert.equal(source.status, "reported");
});

test("1872 research record retains the source hash and completion limit", () => {
  const record = fs.readFileSync(new URL("../research/NP_1872_SYSTEM_RECORD.md", import.meta.url), "utf8");
  assert.match(record, /4cdb0ec57957e7f02cc9951f938e0f46a83776eec21bf576bc64ff3f83738d77/);
  assert.match(record, /does not establish that either the Rose Blanche closure or the Bay Roberts opening was completed/);
});

test("1872 work item follows the 1873 queue", () => {
  const item = workItems.work_items.find((candidate) => candidate.id === "NPREG-156");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-155"]);
  assert.deepEqual(item.completion_evidence, ["research/NP_1872_SYSTEM_RECORD.md", "src/data.js", "tests/np-1872-system.test.js"]);
});
