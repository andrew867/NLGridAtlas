import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { sources, timeline } from "../src/data.js";
import workItems from "../docs/work-items.json" with { type: "json" };

test("1886 record retains the government street-light contract", () => {
  const event = timeline.find((entry) => entry.date === "1886");
  assert.ok(event);
  assert.match(event.title, /25 electric street lamps/);
  assert.match(event.body, /\$200 annually for each lamp/);
  assert.match(event.body, /replaced 35 gas lamps/);
  assert.equal(event.status, "reported");
});

test("1886 sources preserve page locators and file hashes", () => {
  const source = sources.find((entry) => entry.id === "mun-nq-1886-street-light-contract");
  assert.equal(source.pages, "physical PDF p. 26, printed p. 24");
  const record = fs.readFileSync(new URL("../research/NP_1886_SYSTEM_RECORD.md", import.meta.url), "utf8");
  assert.match(record, /physical PDF p\. 1/);
  assert.match(record, /physical PDF p\. 4/);
  assert.match(record, /47a6e79cf22e8a9f86dd20951e48b7c5ab3fe230622ab87d9eba24505bacb5f0/);
  assert.match(record, /4540389b6dcd68588087737a93f1c650ae3fe26146eb2bb27fa06df61aad0b4e/);
  assert.match(record, /79a26d942b1a45cd02fc15cd9fbd2d90ab662175bdb1175e3f75ec1b0e99f0b4/);
});

test("1886 work item follows the 1887 queue", () => {
  const item = workItems.work_items.find((candidate) => candidate.id === "NPREG-142");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-141"]);
  assert.deepEqual(item.completion_evidence, ["research/NP_1886_SYSTEM_RECORD.md", "src/data.js", "tests/np-1886-system.test.js"]);
});
