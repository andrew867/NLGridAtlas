import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { sources, timeline } from "../src/data.js";
import workItems from "../docs/work-items.json" with { type: "json" };

test("1881 record retains the enacted railway communications scope", () => {
  const event = timeline.find((entry) => entry.date === "1881-05-09");
  assert.ok(event);
  assert.equal(event.category, "system authorization");
  assert.match(event.title, /Railway Act covered communications and electric-light equipment/);
  assert.match(event.body, /telegraph and telephone lines/);
  assert.match(event.body, /dynamo machines/);
  assert.equal(event.status, "verified");
});

test("1881 source preserves the enactment and equipment-list pages", () => {
  const source = sources.find((entry) => entry.id === "nl-statutes-1881-railway-communications");
  assert.ok(source);
  assert.equal(source.pages, "physical PDF pp. 21 and 32 to 33, printed pp. 20 and 31 to 32");
  assert.equal(source.status, "verified");
});

test("1881 research record retains the source hash and construction boundary", () => {
  const record = fs.readFileSync(new URL("../research/NP_1881_SYSTEM_RECORD.md", import.meta.url), "utf8");
  assert.match(record, /authorized procurement category/);
  assert.match(record, /does not identify a route, line voltage, dynamo rating, station installation or 1881 commissioning date/);
  assert.match(record, /39116a288a6ee756ffeb6cd752fba91d7c181eb2fb256b09dc021843082456c5/);
});

test("1881 work item follows the 1882 queue", () => {
  const item = workItems.work_items.find((candidate) => candidate.id === "NPREG-147");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-146"]);
  assert.deepEqual(item.completion_evidence, ["research/NP_1881_SYSTEM_RECORD.md", "src/data.js", "tests/np-1881-system.test.js"]);
});
