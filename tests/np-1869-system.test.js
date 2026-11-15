import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { sources, timeline } from "../src/data.js";
import workItems from "../docs/work-items.json" with { type: "json" };

test("1869 almanac record preserves the three linked telegraph companies", () => {
  const event = timeline.find((entry) => entry.date === "1869");
  assert.ok(event);
  for (const company of ["Atlantic", "Anglo-American", "New York, Newfoundland and London"]) {
    assert.match(event.body, new RegExp(company.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.match(event.body, /Brooking & Co\./);
  assert.match(event.body, /Alexander M\. McKay/);
  assert.equal(event.status, "reported");
});

test("1869 financial terms retain amounts and their stated bases", () => {
  const event = timeline.find((entry) => entry.date === "1869");
  assert.ok(event);
  assert.match(event.body, /£125,000 from Atlantic Telegraph Company line earnings/);
  assert.match(event.body, /£25,000 from the Newfoundland company for through messages/);
});

test("1869 source locators preserve physical and printed pages", () => {
  const almanac = sources.find((entry) => entry.id === "mun-almanac-1869-telegraph-companies");
  const newspaper = sources.find((entry) => entry.id === "mun-morning-chronicle-1869-telegraph-reports");
  assert.ok(almanac);
  assert.ok(newspaper);
  assert.equal(almanac.pages, "physical PDF pp. 1 and 107, printed p. 73");
  assert.equal(newspaper.pages, "physical PDF p. 2");
});

test("1869 research record keeps hashes and limits the unprinted company reports", () => {
  const record = fs.readFileSync(new URL("../research/NP_1869_SYSTEM_RECORD.md", import.meta.url), "utf8");
  assert.match(record, /4a869fb6ee165899a7f92a52ecf42e4e250b10cce3163cfd34016710501c5f72/);
  assert.match(record, /1a2f688d379366f62ff6039ec5e183dc95748681cb844aea067246a88fd99232/);
  assert.match(record, /newspaper does not reproduce the reports/);
  assert.match(record, /not their contents/);
});

test("1869 work item follows the 1870 queue", () => {
  const item = workItems.work_items.find((candidate) => candidate.id === "NPREG-159");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-158"]);
  assert.deepEqual(item.completion_evidence, ["research/NP_1869_SYSTEM_RECORD.md", "src/data.js", "tests/np-1869-system.test.js"]);
});
