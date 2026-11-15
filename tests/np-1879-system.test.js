import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { sources, timeline } from "../src/data.js";
import workItems from "../docs/work-items.json" with { type: "json" };

test("1879 record retains the telegraph appropriation", () => {
  const event = timeline.find((entry) => entry.date === "1879");
  assert.ok(event);
  assert.equal(event.category, "telecommunications authorization");
  assert.match(event.body, /\$7,000/);
  assert.match(event.body, /interest and aid maintenance/);
  assert.equal(event.status, "verified");
});

test("1879 source preserves the Supply Act page", () => {
  const source = sources.find((entry) => entry.id === "nl-statutes-1879-telegraph-appropriation");
  assert.ok(source);
  assert.equal(source.pages, "physical PDF p. 125, printed p. 125");
  assert.equal(source.status, "verified");
});

test("1879 research record retains the source hash and appropriation boundary", () => {
  const record = fs.readFileSync(new URL("../research/NP_1879_SYSTEM_RECORD.md", import.meta.url), "utf8");
  assert.match(record, /does not divide the appropriation between interest and maintenance/);
  assert.match(record, /no route, endpoint, line length, conductor, office equipment or construction date/);
  assert.match(record, /0360fd9ab8e3e109bd9a76fc6f9157b5a842aaf19dc18d09ec71d9243fb665ce/);
});

test("1879 work item follows the 1880 queue", () => {
  const item = workItems.work_items.find((candidate) => candidate.id === "NPREG-149");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-148"]);
  assert.deepEqual(item.completion_evidence, ["research/NP_1879_SYSTEM_RECORD.md", "src/data.js", "tests/np-1879-system.test.js"]);
});
