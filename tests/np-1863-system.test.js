import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { sources, timeline } from "../src/data.js";
import workItems from "../docs/work-items.json" with { type: "json" };

test("1863 almanac retains the operating company management", () => {
  const event = timeline.find((entry) => entry.date === "1863" && entry.sourceId === "mun-almanac-1863-telegraph-company");
  assert.ok(event);
  assert.equal(event.status, "reported");
  assert.equal(event.category, "telecommunications operations");
  assert.match(event.body, /Peter Cooper as president/);
  assert.match(event.body, /Alexander M\. McKay was local manager at St\. John's and superintendent/);
});

test("1863 Cape Race event retains the two observed message times", () => {
  const event = timeline.find((entry) => entry.date === "1863-04-27");
  assert.ok(event);
  assert.equal(event.status, "reported");
  assert.equal(event.category, "telecommunications operations");
  assert.match(event.body, /4:30 p\.m\./);
  assert.match(event.body, /9 p\.m\./);
  assert.match(event.body, /does not identify the transmission route or equipment/);
});

test("1863 Atlantic cable tender remains a proposal", () => {
  const event = timeline.find((entry) => entry.date === "1863-08-05");
  assert.ok(event);
  assert.equal(event.status, "proposed");
  assert.equal(event.category, "telecommunications proposal");
  assert.match(event.body, /manufacturing and laying an Atlantic cable/);
  assert.match(event.body, /tender review, not a contract award/);
});

test("1863 source locators retain physical pages and evidence states", () => {
  const expected = new Map([
    ["mun-almanac-1863-telegraph-company", ["physical PDF p. 56", "reported"]],
    ["mun-daybook-1863-anglo-saxon-telegraph", ["physical PDF p. 2", "reported"]],
    ["mun-public-ledger-1863-atlantic-cable-tenders", ["physical PDF p. 2", "proposed"]]
  ]);
  for (const [sourceId, [pageText, status]] of expected) {
    const source = sources.find((entry) => entry.id === sourceId);
    assert.ok(source, sourceId);
    assert.match(source.pages, new RegExp(pageText.replaceAll(".", "\\.")));
    assert.equal(source.status, status);
  }
});

test("1863 research record retains primary-source hashes", () => {
  const record = fs.readFileSync(new URL("../research/NP_1863_SYSTEM_RECORD.md", import.meta.url), "utf8");
  for (const hash of [
    "a60f4798017422e1a9b202f4b0bacbfaf0e746ff392d689bbee1e03bc00df892",
    "4db2e5b15e139b11b0ebe96363e26d69b880c946e8b822dbd40f3113eae2b4fd",
    "d7b3239ef124fccfd80a7ed5ceb1d5dfabc1c9b31c17fed3eeb5bf950575a935"
  ]) {
    assert.match(record, new RegExp(hash));
  }
});

test("1863 work item follows the 1864 closeout", () => {
  const item = workItems.work_items.find((candidate) => candidate.id === "NPREG-165");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-164"]);
  assert.deepEqual(item.completion_evidence, ["research/NP_1863_SYSTEM_RECORD.md", "src/data.js", "tests/np-1863-system.test.js"]);
});
