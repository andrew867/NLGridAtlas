import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { sources, timeline } from "../src/data.js";
import workItems from "../docs/work-items.json" with { type: "json" };
import manifest from "../research/derived/np-1829-newspaper-issue-manifest.json" with { type: "json" };

test("1829 Express repair record retains schedule and communication function", () => {
  const event = timeline.find((entry) => entry.sourceId === "mun-newfoundlander-1829-packet-repair");
  assert.ok(event);
  assert.equal(event.date, "1829-01-01");
  assert.equal(event.status, "reported");
  assert.match(event.body, /thorough repair/);
  assert.match(event.body, /Harbour Grace and Portugal Cove/);
  assert.match(event.body, /three weekly departures/);
  assert.match(event.body, /St. John's land connection/);
  assert.match(event.body, /passengers, parcels and letters/);
});

test("1829 winter record retains water and land fallback", () => {
  const event = timeline.find((entry) => entry.sourceId === "mun-newfoundlander-1829-winter-packet");
  assert.ok(event);
  assert.equal(event.date, "1829-03-26");
  assert.equal(event.status, "reported");
  assert.match(event.body, /laid up for winter/);
  assert.match(event.body, /suitable boat with an experienced crew/);
  assert.match(event.body, /land letter carrier/);
  assert.match(event.body, /weekly, weather permitting/);
});

test("1829 Guswell record retains purpose and three routes", () => {
  const event = timeline.find((entry) => entry.sourceId === "mun-newfoundlander-1829-conception-bay-packets");
  assert.ok(event);
  assert.equal(event.date, "1829-06-18");
  assert.equal(event.status, "reported");
  assert.match(event.body, /launched a packet boat built to carry letters and passengers/);
  assert.match(event.body, /Carbonear on Monday, Cubits on Wednesday and Harbour Grace on Friday/);
  assert.match(event.body, /returned on the next day/);
  assert.match(event.body, /Express and Dart/);
});

test("1829 lightning report stays separate from installed infrastructure", () => {
  const event = timeline.find((entry) => entry.sourceId === "mun-royal-gazette-1829-lightning-damage");
  assert.ok(event);
  assert.equal(event.date, "1829-08-25");
  assert.equal(event.category, "electrical context");
  assert.equal(event.status, "reported");
  assert.match(event.body, /John Currie's newly roofed house/);
  assert.match(event.body, /Carbonear store chimney near an iron plate/);
  assert.match(event.body, /electric fluid/);
});

test("1829 sources retain exact pages and evidence states", () => {
  const expected = new Map([
    ["mun-newfoundlander-1829-packet-repair", "physical PDF p. 1"],
    ["mun-newfoundlander-1829-winter-packet", "physical PDF p. 1"],
    ["mun-newfoundlander-1829-conception-bay-packets", "physical PDF p. 1"],
    ["mun-royal-gazette-1829-lightning-damage", "physical PDF pp. 2 to 3"]
  ]);
  for (const [id, pages] of expected) {
    const source = sources.find((entry) => entry.id === id);
    assert.ok(source, id);
    assert.equal(source.pages, pages);
    assert.equal(source.status, "reported");
  }
});

test("1829 issue manifest preserves all three surviving newspaper sets", () => {
  assert.equal(manifest.year, 1829);
  assert.equal(manifest.issue_count, 193);
  assert.equal(manifest.collections.length, 3);
  assert.deepEqual(manifest.collections.map((entry) => [entry.name, entry.issue_count]), [
    ["The Newfoundlander", 51],
    ["The Royal Gazette", 49],
    ["Public Ledger", 93]
  ]);
  const items = manifest.collections.flatMap((entry) => entry.items);
  assert.equal(items.length, 193);
  assert.equal(new Set(items.map((entry) => entry.filename)).size, 193);
  for (const item of items) {
    assert.match(item.url, /^https:\/\/dai\.mun\.ca\/pdfs\/(?:newfoundland|royalgazette|publicledger)\/.+1829\d{4}\.pdf$/);
    assert.match(item.sha256, /^[a-f0-9]{64}$/);
    assert.ok(item.bytes > 500_000);
  }
});

test("1829 research preserves claim boundaries and provenance", () => {
  const record = fs.readFileSync(new URL("../research/NP_1829_SYSTEM_RECORD.md", import.meta.url), "utf8");
  assert.match(record, /51 issues of \*The Newfoundlander\*, 49 issues of \*The Royal Gazette\* and 93 issues of the \*Public Ledger\*/);
  assert.match(record, /October 22 \*Newfoundlander\* as missing/);
  assert.match(record, /does not identify the date on which the packet service began/);
  assert.match(record, /not an engineering investigation of the discharge path/);
  assert.match(record, /No named 1829 Newfoundland lighthouse project, electrical telegraph, installed electrical apparatus or operating electrical circuit/);
  assert.match(record, /f4f4c755620ccf25e99b1a871d601eb62612f261fb85cc763e03ae32ce5b378b/);
  assert.match(record, /1f624e0ec9eafa60702293df6c94f3b008e69278e8b60b043f21412639a2c34e/);
  assert.match(record, /31aac503b74cd4371869e89f3cea4333ab1f4903502551c76f156207da96825f/);
});

test("1829 work item is complete", () => {
  const item = workItems.work_items.find((entry) => entry.id === "NPREG-199");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-198"]);
  assert.deepEqual(item.completion_evidence, [
    "research/NP_1829_SYSTEM_RECORD.md",
    "research/derived/np-1829-newspaper-issue-manifest.json",
    "src/data.js",
    "tests/np-1829-system.test.js"
  ]);
});
