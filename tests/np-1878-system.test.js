import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { sources, timeline } from "../src/data.js";
import workItems from "../docs/work-items.json" with { type: "json" };

test("1878 record keeps the private telephone line reported", () => {
  const event = timeline.find((entry) => entry.date === "1878-03-20");
  assert.ok(event);
  assert.equal(event.category, "telecommunications");
  assert.match(event.body, /John Delaney/);
  assert.match(event.body, /John Higgins/);
  assert.match(event.body, /private point-to-point line/);
  assert.equal(event.status, "reported");
});

test("1878 record retains the Northern Telegraph financing values", () => {
  const event = timeline.find((entry) => entry.date === "1878" && /Northern Telegraph/.test(entry.title));
  assert.ok(event);
  assert.match(event.body, /\$765/);
  assert.match(event.body, /\$17,000/);
  assert.match(event.body, /Newfoundland Savings' Bank/);
  assert.equal(event.status, "verified");
});

test("1878 sources preserve both physical page locators", () => {
  const telephone = sources.find((entry) => entry.id === "mun-enl-1878-first-telephone");
  const telegraph = sources.find((entry) => entry.id === "nl-statutes-1878-northern-telegraph");
  assert.equal(telephone?.pages, "physical PDF p. 178, printed p. 838");
  assert.equal(telephone?.status, "reported");
  assert.equal(telegraph?.pages, "physical PDF p. 595, printed p. 102");
  assert.equal(telegraph?.status, "verified");
});

test("1878 research record retains source hashes and evidence boundaries", () => {
  const record = fs.readFileSync(new URL("../research/NP_1878_SYSTEM_RECORD.md", import.meta.url), "utf8");
  assert.match(record, /original 1878 Royal Gazette issue is not in the digitized collection/);
  assert.match(record, /no route, line length, conductor, office equipment, construction stage or commissioning date/);
  assert.match(record, /6f57b53e8035b6f8ec2bb59542e72e0527b2bc97f4ffa74ad2179af37498f788/);
  assert.match(record, /c0d7b134de700686abc6d5f283aab7f6bacf3c6d0cd9d8650e525d54c762770d/);
});

test("1878 work item follows the 1879 queue", () => {
  const item = workItems.work_items.find((candidate) => candidate.id === "NPREG-150");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-149"]);
  assert.deepEqual(item.completion_evidence, ["research/NP_1878_SYSTEM_RECORD.md", "src/data.js", "tests/np-1878-system.test.js"]);
});
