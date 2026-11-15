import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { sources, timeline } from "../src/data.js";
import workItems from "../docs/work-items.json" with { type: "json" };

test("1859 news agency record preserves the St. John's and Cape Race arrangement", () => {
  const event = timeline.find((entry) => entry.date === "1859-01-04");
  assert.ok(event);
  assert.equal(event.category, "telecommunications operations");
  assert.match(event.body, /line between St\. John's and New York/);
  assert.match(event.body, /steamers touching at St\. John's/);
  assert.match(event.body, /[Aa] vessel was stationed off Cape Race/);
});

test("1859 City of Washington record retains the explicit ship and news dates", () => {
  const event = timeline.find((entry) => entry.date === "1859-06-02");
  assert.ok(event);
  assert.match(event.body, /City of Washington/);
  assert.match(event.body, /Liverpool news dated May 25/);
  assert.match(event.body, /Cork news dated May 26/);
  assert.match(event.body, /published in New York on the following day/);
});

test("1859 auction record does not invent a reason for the property sale", () => {
  const event = timeline.find((entry) => entry.date === "1859-11-09");
  assert.ok(event);
  assert.equal(event.category, "telecommunications assets");
  assert.match(event.body, /mushroom anchors, grapnels, bar steel/);
  assert.match(event.body, /does not state why the property was sold/);
  assert.doesNotMatch(event.body, /retir|dismantl|abandon/i);
});

test("1859 office notice confirms the company office without inventing an address", () => {
  const event = timeline.find((entry) => entry.date === "1859-11-30");
  assert.ok(event);
  assert.match(event.body, /Electric Telegraph Company's office/);
  assert.match(event.body, /confirms a company office in St\. John's/);
  assert.match(event.body, /does not print its address/);
});

test("1859 source locators retain physical pages and evidence states", () => {
  const expected = new Map([
    ["mun-morning-post-1859-cape-race-agency", "physical PDF p. 4"],
    ["mun-public-ledger-1859-city-of-washington", "physical PDF p. 2"],
    ["mun-telegraph-1859-atlantic-company-auction", "physical PDF p. 3"],
    ["mun-telegraph-1859-electric-office", "physical PDF p. 3"]
  ]);
  for (const [sourceId, pages] of expected) {
    const source = sources.find((entry) => entry.id === sourceId);
    assert.ok(source, sourceId);
    assert.equal(source.pages, pages);
    assert.equal(source.status, "reported");
  }
});

test("1859 research record retains source hashes", () => {
  const record = fs.readFileSync(new URL("../research/NP_1859_SYSTEM_RECORD.md", import.meta.url), "utf8");
  for (const hash of [
    "2daa4364cabe61b271ae37d14cc8e3ae10c146940fa176fabde248c7eeaa50c4",
    "a481c382e497a76e2cd843e17737bf158fac2806eae2cd122fc4dc9b65aa1fbc",
    "37fe52eb46aeb0b4a6a0f4c586ee96598002f5fb334b95b3e5947c8212bd74d6",
    "d58316aeda1027372d60b89f3c6632395d2e06a3f31cf80f6d53bc6b3b7ba115"
  ]) {
    assert.match(record, new RegExp(hash));
  }
});

test("1859 work item follows the 1860 closeout", () => {
  const item = workItems.work_items.find((candidate) => candidate.id === "NPREG-169");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-168"]);
  assert.deepEqual(item.completion_evidence, ["research/NP_1859_SYSTEM_RECORD.md", "src/data.js", "tests/np-1859-system.test.js"]);
});
