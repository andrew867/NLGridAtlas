import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { sources, timeline } from "../src/data.js";
import workItems from "../docs/work-items.json" with { type: "json" };

test("1858 Cape Race record separates the operating service from the proposed container", () => {
  const event = timeline.find((entry) => entry.date === "1858-03-24");
  assert.ok(event);
  assert.match(event.body, /vessel watched for mail steamers off Cape Race/);
  assert.match(event.body, /from Newfoundland to New York/);
  assert.match(event.body, /proposed a new floating message container/);
  assert.match(event.body, /does not establish that it entered service/);
});

test("1858 company notice retains the office and manager", () => {
  const event = timeline.find((entry) => entry.date === "1858-04-19");
  assert.ok(event);
  assert.match(event.body, /St\. John's office/);
  assert.match(event.body, /May 3 general meeting in New York/);
  assert.match(event.body, /A\. Shea as local manager/);
});

test("1858 cable landing record retains the journal chronology", () => {
  const event = timeline.find((entry) => entry.date === "1858-08-05");
  assert.ok(event);
  assert.equal(event.category, "telecommunications infrastructure");
  assert.match(event.body, /anchored at 1:45 a\.m\./);
  assert.match(event.body, /landed at 5:15 a\.m\./);
  assert.match(event.body, /Telegraph House at 6:00 a\.m\./);
  assert.match(event.body, /strong electric current through the cable/);
});

test("1858 message tests preserve the reported dates and rate", () => {
  const event = timeline.find((entry) => entry.date === "1858-08-16");
  assert.ok(event);
  assert.match(event.body, /repeated back without error or omission/);
  assert.match(event.body, /August 18/);
  assert.match(event.body, /100 words per hour/);
});

test("1858 fault records do not turn estimates into a confirmed location", () => {
  const october = timeline.find((entry) => entry.date === "1858-10-13");
  const november = timeline.find((entry) => entry.date === "1858-11-05");
  assert.ok(october);
  assert.ok(november);
  assert.match(october.body, /had not been removed/);
  assert.match(october.body, /does not state that service was restored/);
  assert.match(november.body, /estimated that the fault was nearly 300 miles from Valentia/);
  assert.match(november.body, /not a confirmed fault location/);
});

test("1858 equipment record retains the reported component details", () => {
  const event = timeline.find((entry) => entry.date === "1858-12-07");
  assert.ok(event);
  assert.equal(event.category, "telecommunications equipment");
  assert.match(event.body, /30 horseshoe steel magnets/);
  assert.match(event.body, /six miles of wire/);
  assert.match(event.body, /galvanometer/);
  assert.match(event.body, /did not identify the fault location/);
});

test("1858 source locators retain physical pages and evidence states", () => {
  const expected = new Map([
    ["mun-times-1858-company-office", "physical PDF p. 3"],
    ["mun-telegraph-1858-cape-race-service", "physical PDF p. 1"],
    ["mun-public-ledger-1858-atlantic-cable-landing", "physical PDF p. 2"],
    ["mun-telegraph-1858-cable-tests", "physical PDF p. 3"],
    ["mun-times-1858-cable-diagnostic", "physical PDF p. 2"],
    ["mun-public-ledger-1858-cable-fault", "physical PDF p. 2"],
    ["mun-public-ledger-1858-valentia-equipment", "physical PDF pp. 1 to 2"]
  ]);
  for (const [sourceId, pages] of expected) {
    const source = sources.find((entry) => entry.id === sourceId);
    assert.ok(source, sourceId);
    assert.equal(source.pages, pages);
    assert.equal(source.status, "reported");
  }
});

test("1858 research record retains source hashes", () => {
  const record = fs.readFileSync(new URL("../research/NP_1858_SYSTEM_RECORD.md", import.meta.url), "utf8");
  for (const hash of [
    "f6da687b7ab4001b0921c3049c2932bbbfdd32d696b3f6ca8728f9351da2228d",
    "705236d589dfab76313cbe99774749e9456db89af131e05a8d252fb6375c15fc",
    "92ff2a462349971bd0500fdb69fc6911b0f19ec091673d03b3a5ce1f29baaa7c",
    "8dc568d506dbbb5176daf8590c4874676df80203e9cad1ce35c3413e3b3e6eb0",
    "57223c09999ba28ec71df95b8d53528cd4707a29f5b237cab39c5d4e5d27aa51",
    "4b2535d12a3fa6d3e4ae33e1110948a22fb10b7bd530b0eea1cbcfe7c38c81a9",
    "477a6fa79cc3775fcdfb08010f56d503058fa33244313e7364e6a4aa0ac5173f"
  ]) {
    assert.match(record, new RegExp(hash));
  }
});

test("1858 work item follows the 1859 closeout", () => {
  const item = workItems.work_items.find((candidate) => candidate.id === "NPREG-170");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-169"]);
  assert.deepEqual(item.completion_evidence, ["research/NP_1858_SYSTEM_RECORD.md", "src/data.js", "tests/np-1858-system.test.js"]);
});
