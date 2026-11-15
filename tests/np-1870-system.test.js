import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { sources, timeline } from "../src/data.js";
import workItems from "../docs/work-items.json" with { type: "json" };

test("1870 coastal cable remains a proposal", () => {
  const event = timeline.find((entry) => entry.date === "1870-08-27");
  assert.ok(event);
  assert.match(event.body, /submarine cable along the coasts of Newfoundland and Labrador/);
  assert.match(event.body, /report fishery conditions to coastal stations/);
  assert.match(event.body, /Norway's fishery cable/);
  assert.match(event.body, /did not report an approved project or construction/);
  assert.equal(event.status, "proposed");
});

test("1870 source preserves its exact physical page", () => {
  const source = sources.find((entry) => entry.id === "mun-express-1870-coastal-fishery-cable-proposal");
  assert.ok(source);
  assert.equal(source.pages, "physical PDF p. 3");
  assert.equal(source.status, "proposed");
});

test("1870 research record retains the source hash and evidence limit", () => {
  const record = fs.readFileSync(new URL("../research/NP_1870_SYSTEM_RECORD.md", import.meta.url), "utf8");
  assert.match(record, /5c8deb7e484c78322afe35cf4950374fc419324ba950b0fed4f93d139cf44cf3/);
  assert.match(record, /does not identify an approved project, survey, route, appropriation, construction contract or completed cable/);
});

test("1870 work item follows the 1871 queue", () => {
  const item = workItems.work_items.find((candidate) => candidate.id === "NPREG-158");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-157"]);
  assert.deepEqual(item.completion_evidence, ["research/NP_1870_SYSTEM_RECORD.md", "src/data.js", "tests/np-1870-system.test.js"]);
});
