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

test("1878 record keeps western construction separate from commissioning", () => {
  const start = timeline.find((entry) => entry.date === "1878-02-18");
  const progress = timeline.find((entry) => entry.date === "1878-07-25");
  assert.ok(start);
  assert.ok(progress);
  assert.match(start.body, /first bush of the telegraph track/);
  assert.match(start.body, /not a completed line/);
  assert.match(progress.body, /almost complete to Bay of Islands/);
  assert.match(progress.body, /rather than commissioning evidence/);
});

test("1878 record retains the King's Cove conflict", () => {
  const event = timeline.find((entry) => entry.date === "1878-11-26");
  assert.ok(event);
  assert.match(event.body, /Bonavista telegraph office/);
  assert.match(event.body, /Catalina operator/);
  assert.match(event.body, /conflicts with the 1885 review/);
  assert.equal(event.status, "proposed");
});

test("1878 sources preserve all physical page locators", () => {
  const telephone = sources.find((entry) => entry.id === "mun-enl-1878-first-telephone");
  const telegraph = sources.find((entry) => entry.id === "nl-statutes-1878-northern-telegraph");
  const start = sources.find((entry) => entry.id === "mun-morning-chronicle-1878-western-start");
  const progress = sources.find((entry) => entry.id === "mun-morning-chronicle-1878-western-progress");
  const kingsCove = sources.find((entry) => entry.id === "mun-morning-chronicle-1878-kings-cove");
  assert.equal(telephone?.pages, "physical PDF p. 178, printed p. 838");
  assert.equal(telephone?.status, "reported");
  assert.equal(telegraph?.pages, "physical PDF p. 595, printed p. 102");
  assert.equal(telegraph?.status, "verified");
  assert.equal(start?.pages, "physical PDF p. 2");
  assert.equal(progress?.pages, "physical PDF p. 2");
  assert.equal(kingsCove?.pages, "physical PDF p. 2");
});

test("1878 research record retains source hashes and evidence boundaries", () => {
  const record = fs.readFileSync(new URL("../research/NP_1878_SYSTEM_RECORD.md", import.meta.url), "utf8");
  assert.match(record, /original 1878 Royal Gazette issue is not in the digitized collection/);
  assert.match(record, /no route, line length, conductor, office equipment, construction stage or commissioning date/);
  assert.match(record, /do not establish the line's commissioning date/);
  assert.match(record, /conflicts with an 1885 review/);
  assert.match(record, /6f57b53e8035b6f8ec2bb59542e72e0527b2bc97f4ffa74ad2179af37498f788/);
  assert.match(record, /c0d7b134de700686abc6d5f283aab7f6bacf3c6d0cd9d8650e525d54c762770d/);
  assert.match(record, /04e3282ece9e001b04cfe76ffed0426480fc43db905c2cdbf1aef2651eca44fd/);
  assert.match(record, /db845f6dabdce894a202decc2d8ad40f85ac0835f10b63c8d9e6c0b44bb8fbca/);
  assert.match(record, /9fedab2e3a400952079dad2b9af6d05cb5318abac96eb00f76f9d72caaaf3eea/);
});

test("1878 work item follows the 1879 queue", () => {
  const item = workItems.work_items.find((candidate) => candidate.id === "NPREG-150");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-149"]);
  assert.deepEqual(item.completion_evidence, ["research/NP_1878_SYSTEM_RECORD.md", "src/data.js", "tests/np-1878-system.test.js"]);
});
