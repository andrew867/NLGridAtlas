import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { sources, timeline } from "../src/data.js";
import workItems from "../docs/work-items.json" with { type: "json" };

test("1892 record separates restored arc service from pending incandescent service", () => {
  const event = timeline.find((entry) => entry.date === "1892");
  assert.ok(event);
  assert.match(event.title, /resumed arc-light service/);
  assert.match(event.body, /July 15/);
  assert.match(event.body, /two 50-light dynamos/);
  assert.match(event.body, /two 100 hp compound engines/);
  assert.match(event.body, /two 70 hp boilers/);
  assert.match(event.body, /being prepared for incandescent service/);
});

test("1892 source retains exact equipment values, page and hash", () => {
  const source = sources.find((entry) => entry.id === "mun-1892-flavin-lane-rebuild");
  assert.equal(source.pages, "physical PDF p. 4");
  const record = fs.readFileSync(new URL("../research/NP_1892_SYSTEM_RECORD.md", import.meta.url), "utf8");
  assert.match(record, /1,200 incandescent lights at 1,000 r\/min/);
  assert.match(record, /receiving 1,000 V and supplying 52 V/);
  assert.match(record, /a1b78578b8e1c1862e30d9f5c9f88358683bc8f776681c41fd9273d63f00874a/);
  assert.match(record, /not recorded as operating on September 28/);
});

test("1892 work item follows the 1893 queue", () => {
  const item = workItems.work_items.find((candidate) => candidate.id === "NPREG-136");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-135"]);
  assert.deepEqual(item.completion_evidence, ["research/NP_1892_SYSTEM_RECORD.md", "src/data.js", "tests/np-1892-system.test.js"]);
});
