import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { sources, timeline } from "../src/data.js";
import workItems from "../docs/work-items.json" with { type: "json" };

test("1880 record retains the separate telegraph appropriations", () => {
  const event = timeline.find((entry) => entry.date === "1880");
  assert.ok(event);
  assert.equal(event.category, "telecommunications authorization");
  assert.match(event.body, /\$4,603/);
  assert.match(event.body, /\$7,000/);
  assert.match(event.body, /\$1,945\.83/);
  assert.equal(event.status, "verified");
});

test("1880 source preserves both appropriation pages", () => {
  const source = sources.find((entry) => entry.id === "nl-statutes-1880-telegraph-appropriations");
  assert.ok(source);
  assert.equal(source.pages, "physical PDF pp. 126 and 143, printed pp. 126 and 143");
  assert.equal(source.status, "verified");
});

test("1880 research record retains the source hash and route boundary", () => {
  const record = fs.readFileSync(new URL("../research/NP_1880_SYSTEM_RECORD.md", import.meta.url), "utf8");
  assert.match(record, /do not identify a route, endpoint, line length, conductor, office equipment or completion date/);
  assert.match(record, /do not connect the appropriations to the Coon River to Harbor Breton branch/);
  assert.match(record, /ecf500b58efe3635d29750f1e50b10e5231f67d89590e72156c2adb928a4e46b/);
});

test("1880 work item follows the 1881 queue", () => {
  const item = workItems.work_items.find((candidate) => candidate.id === "NPREG-148");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-147"]);
  assert.deepEqual(item.completion_evidence, ["research/NP_1880_SYSTEM_RECORD.md", "src/data.js", "tests/np-1880-system.test.js"]);
});
