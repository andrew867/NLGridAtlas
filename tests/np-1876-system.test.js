import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { sources, timeline } from "../src/data.js";
import workItems from "../docs/work-items.json" with { type: "json" };

test("1876 record separates the communications gap from construction", () => {
  const event = timeline.find((entry) => entry.date === "1876-02-21");
  assert.ok(event);
  assert.match(event.body, /absence of telegraph communication/);
  assert.match(event.body, /Trinity Bay and Bonavista Bay/);
  assert.match(event.body, /Twillingate and Fogo/);
  assert.equal(event.status, "reported");
});

test("1876 record retains the northern telegraph proposals", () => {
  const event = timeline.find((entry) => entry.date === "1876-04-25");
  assert.ok(event);
  assert.match(event.body, /Conn River through Hall's Bay to Cape St. John/);
  assert.match(event.body, /£500 annual interest guarantee/);
  assert.match(event.body, /Twillingate, Fogo, Bonavista Bay and Trinity Bay/);
  assert.equal(event.status, "proposed");
});

test("1876 sources preserve the journal page locators", () => {
  const gap = sources.find((entry) => entry.id === "nl-assembly-1876-communications-gap");
  const proposals = sources.find((entry) => entry.id === "nl-assembly-1876-telegraph-proposals");
  assert.equal(gap?.pages, "physical PDF pp. 627 and 633");
  assert.equal(gap?.status, "reported");
  assert.equal(proposals?.pages, "physical PDF pp. 42 to 43, 176 to 178, 181 and 192");
  assert.equal(proposals?.status, "proposed");
});

test("1876 research record retains the source hash and evidence boundary", () => {
  const record = fs.readFileSync(new URL("../research/NP_1876_SYSTEM_RECORD.md", import.meta.url), "utf8");
  assert.match(record, /not establish that a telegraph line entered construction in 1876/);
  assert.match(record, /not construction or commissioning/);
  assert.match(record, /69f82ceb9ce7ec87fff5cd8ab245e383620a03c8e4c31cca94c6ee1288744639/);
});

test("1876 work item follows the corrected 1877 queue", () => {
  const item = workItems.work_items.find((candidate) => candidate.id === "NPREG-152");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-151"]);
  assert.deepEqual(item.completion_evidence, ["research/NP_1876_SYSTEM_RECORD.md", "src/data.js", "tests/np-1876-system.test.js"]);
});
