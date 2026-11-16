import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { sources, timeline } from "../src/data.js";
import workItems from "../docs/work-items.json" with { type: "json" };
import manifest from "../research/derived/np-1827-newspaper-issue-manifest.json" with { type: "json" };

test("1827 winter record retains water and land fallback", () => {
  const event = timeline.find((entry) => entry.sourceId === "mun-mercantile-1827-winter-packet");
  assert.ok(event);
  assert.equal(event.date, "1827-01-13");
  assert.equal(event.status, "reported");
  assert.match(event.body, /laid up for the winter/);
  assert.match(event.body, /suitable boat with an experienced crew/);
  assert.match(event.body, /letter carrier was to travel weekly/);
  assert.match(event.body, /Harbour Grace to St. John's by land/);
});

test("1827 altered packet record retains timetable, traffic and agents", () => {
  const event = timeline.find((entry) => entry.sourceId === "mun-public-ledger-1827-express-alteration");
  assert.ok(event);
  assert.equal(event.date, "1827-05-04");
  assert.equal(event.status, "reported");
  assert.match(event.body, /alterations for passenger comfort/);
  assert.match(event.body, /Monday, Wednesday and Friday at 09:00/);
  assert.match(event.body, /six-pence single-letter rate/);
  assert.match(event.body, /James Clift and P. Rogerson/);
});

test("1827 Carbonear lightning record retains damage and occupant outcome", () => {
  const event = timeline.find((entry) => entry.sourceId === "mun-public-ledger-1827-carbonear-lightning");
  assert.ok(event);
  assert.equal(event.date, "1827-07-16");
  assert.equal(event.category, "electrical");
  assert.equal(event.status, "reported");
  assert.match(event.body, /Slade, Elson & Co/);
  assert.match(event.body, /entered through the chimney/);
  assert.match(event.body, /forced a door off its hinges/);
  assert.match(event.body, /recovered without reported injury/);
});

test("1827 sources retain exact physical pages and evidence states", () => {
  const expected = new Map([
    ["mun-mercantile-1827-winter-packet", "physical PDF p. 3"],
    ["mun-public-ledger-1827-express-alteration", "physical PDF p. 1"],
    ["mun-public-ledger-1827-carbonear-lightning", "physical PDF p. 2"]
  ]);
  for (const [id, pages] of expected) {
    const source = sources.find((entry) => entry.id === id);
    assert.ok(source, id);
    assert.equal(source.pages, pages);
    assert.equal(source.status, "reported");
  }
});

test("1827 issue manifest preserves all three available newspaper sets", () => {
  assert.equal(manifest.year, 1827);
  assert.equal(manifest.issue_count, 128);
  assert.equal(manifest.collections.length, 3);
  assert.deepEqual(manifest.collections.map((entry) => [entry.name, entry.issue_count]), [
    ["The Newfoundlander", 15],
    ["Public Ledger", 99],
    ["Newfoundland Mercantile Journal", 14]
  ]);
  const items = manifest.collections.flatMap((entry) => entry.items);
  assert.equal(items.length, 128);
  assert.equal(new Set(items.map((entry) => entry.filename)).size, 128);
  for (const item of items) {
    assert.match(item.url, /^https:\/\/dai\.mun\.ca\/pdfs\/(?:newfoundland|publicledger|nl_mercantile)\/.+1827\d{4}(?:no\d+)?\.pdf$/);
    assert.match(item.sha256, /^[a-f0-9]{64}$/);
    assert.ok(item.bytes > 500_000);
  }
});

test("1827 research preserves date conflicts and claim boundaries", () => {
  const record = fs.readFileSync(new URL("../research/NP_1827_SYSTEM_RECORD.md", import.meta.url), "utf8");
  assert.match(record, /15 issues of \*The Newfoundlander\*, 99 issues of the \*Public Ledger\* and 14 issues of the \*Newfoundland Mercantile Journal\*/);
  assert.match(record, /dates the notice April 16/);
  assert.match(record, /one-day conflict is unresolved/);
  assert.match(record, /does not identify a lightning conductor or other installed electrical apparatus/);
  assert.match(record, /Manifest SHA-256 `04f92df15f36cca28ecdce5dad38648ee5b5f09629c18dc33f6b8ef6b92125c7`/);
});

test("1827 work item is complete", () => {
  const item = workItems.work_items.find((entry) => entry.id === "NPREG-201");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-200"]);
  assert.deepEqual(item.completion_evidence, [
    "research/NP_1827_SYSTEM_RECORD.md",
    "research/derived/np-1827-newspaper-issue-manifest.json",
    "src/data.js",
    "tests/np-1827-system.test.js"
  ]);
});
