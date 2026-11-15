import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { sources, timeline } from "../src/data.js";
import workItems from "../docs/work-items.json" with { type: "json" };

test("1860 almanac record retains the company and Newfoundland agent", () => {
  const event = timeline.find((entry) => entry.date === "1860");
  assert.ok(event);
  assert.equal(event.status, "reported");
  assert.match(event.body, /New York, Newfoundland, and London Telegraph Company/);
  assert.match(event.body, /Nicholas Stabb/);
});

test("1860 news agency record preserves the Cape Race operating arrangement", () => {
  const event = timeline.find((entry) => entry.date === "1860-01-06");
  assert.ok(event);
  assert.equal(event.category, "telecommunications operations");
  assert.match(event.body, /line between St\. John's and New York/);
  assert.match(event.body, /vessel stationed off Cape Race/);
  assert.match(event.body, /telegraphed from Newfoundland/);
});

test("1860 City of Baltimore record retains the stated interception time", () => {
  const event = timeline.find((entry) => entry.date === "1860-08-23");
  assert.ok(event);
  assert.match(event.body, /City of Baltimore/);
  assert.match(event.body, /7 p\.m\./);
  assert.match(event.body, /Liverpool and Queenstown dates/);
});

test("1860 Harbor Grace record keeps the dispatch date and relative event time", () => {
  const event = timeline.find((entry) => entry.date === "1860-11-02");
  assert.ok(event);
  assert.equal(event.category, "telecommunications fault");
  assert.match(event.body, /dispatch dated November 1/);
  assert.match(event.body, /previous evening/);
  assert.match(event.body, /7:30 p\.m\./);
  assert.match(event.body, /no damaged length or return-to-service time/);
});

test("1860 Carbonear report identifies the telegraph office as destroyed", () => {
  const event = timeline.find((entry) => entry.date === "1860-11-08");
  assert.ok(event);
  assert.match(event.body, /report dated November 7/);
  assert.match(event.body, /telegraph office among the destroyed premises/);
  assert.match(event.body, /no equipment or replacement arrangement/);
});

test("1860 Wycocomagh record retains sentence and network limits", () => {
  const event = timeline.find((entry) => entry.date === "1860-12-12");
  assert.ok(event);
  assert.match(event.body, /two shillings sterling or 48 hours' imprisonment/);
  assert.match(event.body, /near Wycocomagh/);
  assert.match(event.body, /does not identify incident dates, damaged lengths or repair times/);
});

test("1860 source locators retain physical pages and evidence states", () => {
  const expected = new Map([
    ["mun-almanac-1860-telegraph-company", "physical PDF p. 52, printed p. 47"],
    ["mun-morning-post-1860-cape-race-agency", "physical PDF p. 4"],
    ["mun-morning-post-1860-city-of-baltimore", "physical PDF p. 2"],
    ["mun-daily-news-1860-harbor-grace-line", "physical PDF p. 2"],
    ["mun-daily-news-1860-carbonear-office", "physical PDF p. 3"],
    ["mun-morning-post-1860-wycocomagh-cuts", "physical PDF p. 2"]
  ]);
  for (const [sourceId, pages] of expected) {
    const source = sources.find((entry) => entry.id === sourceId);
    assert.ok(source, sourceId);
    assert.equal(source.pages, pages);
    assert.equal(source.status, "reported");
  }
});

test("1860 research record retains source hashes", () => {
  const record = fs.readFileSync(new URL("../research/NP_1860_SYSTEM_RECORD.md", import.meta.url), "utf8");
  for (const hash of [
    "1cead31226191bfb7f318114dda6b63f4729577ff93c8cd5cb722d8dbbebdb53",
    "fc6b7f541c022abf190340743df3082994add00ad466b8e10fa368dd32e4930d",
    "9657524feb3bdbf6cf8065c4bd2792d612255ea95e15255d3a94eb0caf6fcc6c",
    "b8ecc10a3062a57e70d6fc59c0b66b88d60854c673ff4f413d52b974f915ff42",
    "0e97abde7c020afad1c917982743b7a1de7d363b147bca9ff75f7333aab064c4",
    "c86d09a6593f324dd3c74b863c092e2425b985dba2760e56345dc397d1c3fcce"
  ]) {
    assert.match(record, new RegExp(hash));
  }
});

test("1860 work item follows the 1861 closeout", () => {
  const item = workItems.work_items.find((candidate) => candidate.id === "NPREG-168");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-167"]);
  assert.deepEqual(item.completion_evidence, ["research/NP_1860_SYSTEM_RECORD.md", "src/data.js", "tests/np-1860-system.test.js"]);
});
