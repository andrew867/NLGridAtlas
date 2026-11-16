import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { sources, timeline } from "../src/data.js";
import workItems from "../docs/work-items.json" with { type: "json" };
import manifest from "../research/derived/np-1828-newspaper-issue-manifest.json" with { type: "json" };

test("1828 Express alteration record retains route and communication function", () => {
  const event = timeline.find((entry) => entry.sourceId === "mun-newfoundlander-1828-packet-alterations");
  assert.ok(event);
  assert.equal(event.date, "1828-01-09");
  assert.equal(event.status, "reported");
  assert.match(event.body, /alterations for passenger comfort/);
  assert.match(event.body, /Harbour Grace and Portugal Cove/);
  assert.match(event.body, /three weekly departures/);
  assert.match(event.body, /St. John's carrier connection/);
  assert.match(event.body, /passengers, parcels and letters/);
});

test("1828 winter record retains water and land fallback", () => {
  const event = timeline.find((entry) => entry.sourceId === "mun-newfoundlander-1828-winter-packet");
  assert.ok(event);
  assert.equal(event.date, "1828-03-05");
  assert.equal(event.status, "reported");
  assert.match(event.body, /laid up for winter/);
  assert.match(event.body, /suitable boat with an experienced crew/);
  assert.match(event.body, /land letter carrier/);
  assert.match(event.body, /weekly from Harbour Grace to St. John's/);
});

test("1828 Western Ward record retains alarm equipment and command roles", () => {
  const event = timeline.find((entry) => entry.sourceId === "mun-royal-gazette-1828-western-watch-fire");
  assert.ok(event);
  assert.equal(event.date, "1828-04-08");
  assert.equal(event.category, "communications");
  assert.equal(event.status, "reported");
  assert.match(event.body, /night watch and fire company/);
  assert.match(event.body, /engine-house keys/);
  assert.match(event.body, /lanterns and speaking trumpets/);
  assert.match(event.body, /report to the engine house/);
});

test("1828 Union packet record retains three routes and St. John's mail connection", () => {
  const event = timeline.find((entry) => entry.sourceId === "mun-public-ledger-1828-union-packet");
  assert.ok(event);
  assert.equal(event.date, "1828-05-02");
  assert.equal(event.status, "reported");
  assert.match(event.body, /launched the Union packet/);
  assert.match(event.body, /Carbonear/);
  assert.match(event.body, /Brigus and Port de Grave/);
  assert.match(event.body, /Harbour Grace/);
});

test("1828 repaired Express and Dart stay separate", () => {
  const repair = timeline.find((entry) => entry.sourceId === "mun-newfoundlander-1828-packet-repair");
  const dart = timeline.find((entry) => entry.sourceId === "mun-newfoundlander-1828-dart-packet");
  assert.ok(repair);
  assert.ok(dart);
  assert.equal(repair.date, "1828-05-07");
  assert.match(repair.body, /thorough repair/);
  assert.equal(dart.date, "1828-12-25");
  assert.match(dart.body, /James Doyle's Dart/);
  assert.match(dart.body, /does not identify the route's first service date/);
});

test("1828 sources retain exact pages and evidence states", () => {
  const expected = new Map([
    ["mun-newfoundlander-1828-packet-alterations", "physical PDF p. 1"],
    ["mun-newfoundlander-1828-winter-packet", "physical PDF p. 1"],
    ["mun-royal-gazette-1828-western-watch-fire", "physical PDF p. 3"],
    ["mun-public-ledger-1828-union-packet", "physical PDF p. 1"],
    ["mun-newfoundlander-1828-packet-repair", "physical PDF p. 1"],
    ["mun-newfoundlander-1828-dart-packet", "physical PDF p. 1"]
  ]);
  for (const [id, pages] of expected) {
    const source = sources.find((entry) => entry.id === id);
    assert.ok(source, id);
    assert.equal(source.pages, pages);
    assert.equal(source.status, "reported");
  }
});

test("1828 issue manifest preserves all three surviving newspaper sets", () => {
  assert.equal(manifest.year, 1828);
  assert.equal(manifest.issue_count, 188);
  assert.equal(manifest.collections.length, 3);
  assert.deepEqual(manifest.collections.map((entry) => [entry.name, entry.issue_count]), [
    ["The Newfoundlander", 47],
    ["The Royal Gazette", 48],
    ["Public Ledger", 93]
  ]);
  const items = manifest.collections.flatMap((entry) => entry.items);
  assert.equal(items.length, 188);
  assert.equal(new Set(items.map((entry) => entry.filename)).size, 188);
  for (const item of items) {
    assert.match(item.url, /^https:\/\/dai\.mun\.ca\/pdfs\/(?:newfoundland|royalgazette|publicledger)\/.+1828\d{4}\.pdf$/);
    assert.match(item.sha256, /^[a-f0-9]{64}$/);
    assert.ok(item.bytes > 500_000);
  }
});

test("1828 research preserves claim boundaries and provenance", () => {
  const record = fs.readFileSync(new URL("../research/NP_1828_SYSTEM_RECORD.md", import.meta.url), "utf8");
  assert.match(record, /47 issues of \*The Newfoundlander\*, 48 issues of \*The Royal Gazette\* and 93 issues of the \*Public Ledger\*/);
  assert.match(record, /does not identify the route's first service date/);
  assert.match(record, /does not describe an electrical alarm, telegraph or installed electrical apparatus/);
  assert.match(record, /No named 1828 Newfoundland lighthouse project, electrical telegraph, installed electrical apparatus or operating electrical circuit/);
  assert.match(record, /6f18cf31a215c29cb36fb4f2855e8e7415353b656219e671aa4cd8dc100ea601/);
  assert.match(record, /4044ddddda0518e28ee451c24d00d42df5b68611195b379a554ef1d28358002ad/);
  assert.match(record, /5c24ec9efc915cb2548c0eac626b084732a6ef81fc080ce7467a71c2fb9da6d4/);
});

test("1828 work item is complete", () => {
  const item = workItems.work_items.find((entry) => entry.id === "NPREG-200");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-199"]);
  assert.deepEqual(item.completion_evidence, [
    "research/NP_1828_SYSTEM_RECORD.md",
    "research/derived/np-1828-newspaper-issue-manifest.json",
    "src/data.js",
    "tests/np-1828-system.test.js"
  ]);
});
