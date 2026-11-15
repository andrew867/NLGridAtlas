import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { sources, timeline } from "../src/data.js";
import workItems from "../docs/work-items.json" with { type: "json" };

test("1871 directory record retains the six explicit company offices", () => {
  const event = timeline.find((entry) => entry.date === "1871");
  assert.ok(event);
  for (const place of ["Black River", "Brigus", "Carbonear", "Chapel Arm", "Harbor Grace", "St. John's"]) {
    assert.match(event.body, new RegExp(place.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.match(event.body, /Black River was described as a telegraph station/);
  assert.equal(event.status, "reported");
});

test("1871 record keeps Heart's Content wording distinct from the office list", () => {
  const event = timeline.find((entry) => entry.date === "1871");
  assert.ok(event);
  assert.match(event.body, /Heart's Content entry described the company's line/);
  assert.match(event.body, /telegraph operators and an Atlantic Telegraph Company manager/);
  assert.doesNotMatch(event.body.split(".")[0], /Heart's Content/);
});

test("1871 source preserves the complete physical-page locator", () => {
  const source = sources.find((entry) => entry.id === "lovell-1871-newfoundland-telegraph-directory");
  assert.ok(source);
  assert.equal(source.pages, "physical PDF pp. 3, 10, 13, 19 to 20, 23, 40, 42, 44 to 45, 78, 99, 105 and 108");
});

test("1871 research record retains the source hash and named staff", () => {
  const record = fs.readFileSync(new URL("../research/NP_1871_SYSTEM_RECORD.md", import.meta.url), "utf8");
  assert.match(record, /5bf8b10d727b30c535508b44b795f5c8db93b309c6d7427e1ed60592d3d80aab/);
  for (const name of ["A. Blackader", "Benjamin Gardner", "George A. Nichole", "J. P. Dray", "W. H. Thompson", "A. M. Mackay", "D. Stott", "F. J. Wyatt"]) {
    assert.match(record, new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});

test("1871 work item follows the 1872 queue", () => {
  const item = workItems.work_items.find((candidate) => candidate.id === "NPREG-157");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-156"]);
  assert.deepEqual(item.completion_evidence, ["research/NP_1871_SYSTEM_RECORD.md", "src/data.js", "tests/np-1871-system.test.js"]);
});
