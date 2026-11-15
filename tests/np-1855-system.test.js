import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { sources, timeline } from "../src/data.js";
import workItems from "../docs/work-items.json" with { type: "json" };

const eventsBySource = (sourceId) => timeline.filter((entry) => entry.sourceId === sourceId);

test("1855 Bay Despair construction retains workforce evidence", () => {
  const [event] = eventsBySource("mun-courier-1855-bay-despair-work");
  assert.ok(event);
  assert.match(event.body, /Bay Despair/);
  assert.match(event.body, /two hundred men/);
  assert.match(event.body, /labourers and supplies/);
});

test("1855 cable expedition arrival retains the missing cable ship", () => {
  const [event] = eventsBySource("mun-times-1855-cable-arrival");
  assert.ok(event);
  assert.equal(event.date, "1855-08-14");
  assert.match(event.body, /James Adger/);
  assert.match(event.body, /Sarah L\. Bryant/);
  assert.match(event.body, /had not reached Port aux Basques/);
});

test("1855 cable attempt separates landing and failure", () => {
  const events = eventsBySource("mun-times-1855-cable-failure");
  assert.equal(events.length, 2);
  const landing = events.find((event) => event.date === "1855-08-23");
  const failure = events.find((event) => event.date === "1855-08-29");
  assert.ok(landing);
  assert.ok(failure);
  assert.match(landing.body, /Cape Ray Cove/);
  assert.match(landing.body, /shore end was brought ashore/);
  assert.match(failure.body, /eight-hour delay/);
  assert.match(failure.body, /forty miles had been paid out/);
  assert.match(failure.body, /Thirty-four miles remained aboard/);
  assert.match(failure.body, /thirty miles from Cape North/);
});

test("1855 survey and inspection records retain people and endpoints", () => {
  const [capeNorth] = eventsBySource("mun-morning-post-1855-cape-north-survey");
  const [route] = eventsBySource("mun-public-ledger-1855-route-inspection");
  assert.ok(capeNorth);
  assert.ok(route);
  assert.match(capeNorth.body, /about 120 workers/);
  assert.match(route.body, /F\. N\. Gisborne/);
  assert.match(route.body, /J\. T\. Neville/);
  assert.match(route.body, /Piper's Hole and Cape Ray/);
});

test("1855 contract notice retains scope, targets and proposed state", () => {
  const [event] = eventsBySource("mun-courier-1855-line-contracts");
  assert.ok(event);
  assert.equal(event.status, "proposed");
  assert.match(event.body, /Piper's Hole to Cape Ray/);
  assert.match(event.body, /St\. John's to Trepassey/);
  assert.match(event.body, /January 1, 1856/);
  assert.match(event.body, /March 10/);
  assert.match(event.body, /four hundred men/);
});

test("1855 source locators retain physical pages", () => {
  const expected = new Map([
    ["mun-courier-1855-bay-despair-work", "physical PDF p. 3"],
    ["mun-times-1855-cable-arrival", "physical PDF p. 2"],
    ["mun-times-1855-cable-failure", "physical PDF p. 2"],
    ["mun-morning-post-1855-cape-north-survey", "physical PDF p. 2"],
    ["mun-public-ledger-1855-route-inspection", "physical PDF p. 2"],
    ["mun-courier-1855-line-contracts", "physical PDF p. 3"]
  ]);
  for (const [sourceId, pages] of expected) {
    const source = sources.find((entry) => entry.id === sourceId);
    assert.ok(source, sourceId);
    assert.equal(source.pages, pages);
    assert.equal(source.status, "reported");
  }
});

test("1855 research record retains source hashes", () => {
  const record = fs.readFileSync(new URL("../research/NP_1855_SYSTEM_RECORD.md", import.meta.url), "utf8");
  for (const hash of [
    "56d9520097cce2ffab3a4ddbff5104211d5f8fca859038ecfdf79cf8f9e66f29",
    "8719257c71c007fedd60fb61e450a54f7d1749680aa7b30cd6cb6873b8870057",
    "1531058995ce96c87168bbc933b56c5e7c4086e1dece217a50da77267b55e003",
    "0a3996fbaafc164a0542c44bbc73a60d4c561c8a105f8e0a0af007263050f990",
    "374f6e4cd8e1b9c5f627a51a87e792d512dfa1865c7f93ce67448d5d8d838b6e",
    "76ff68d8a10860e52a709462bfe49a314c3c38453dca282d81a863b3fae8ecd3"
  ]) {
    assert.match(record, new RegExp(hash));
  }
});

test("1855 work item follows the 1856 closeout", () => {
  const item = workItems.work_items.find((candidate) => candidate.id === "NPREG-173");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-172"]);
  assert.deepEqual(item.completion_evidence, ["research/NP_1855_SYSTEM_RECORD.md", "src/data.js", "tests/np-1855-system.test.js"]);
});
