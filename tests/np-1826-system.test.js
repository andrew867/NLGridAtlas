import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { sources, timeline } from "../src/data.js";
import workItems from "../docs/work-items.json" with { type: "json" };
import manifest from "../research/derived/np-1826-newspaper-issue-manifest.json" with { type: "json" };

test("1826 winter record retains water and land alternatives", () => {
  const event = timeline.find((entry) => entry.sourceId === "mun-mercantile-1826-winter-packet");
  assert.ok(event);
  assert.equal(event.date, "1826-01-26");
  assert.equal(event.status, "reported");
  assert.match(event.body, /laid up until spring/);
  assert.match(event.body, /more suitable boat for winter crossings/);
  assert.match(event.body, /letter carrier was to travel around Conception Bay/);
  assert.match(event.body, /James Clift.*William Innott/);
});

test("1826 packet records retain timetable, rates and daylight change", () => {
  const timetable = timeline.find((entry) => entry.sourceId === "mun-mercantile-1826-express-service");
  assert.ok(timetable);
  assert.equal(timetable.date, "1826-04-04");
  assert.match(timetable.body, /09:00 on Monday, Wednesday and Saturday/);
  assert.match(timetable.body, /10:00 the next morning/);
  assert.match(timetable.body, /passenger, letter and parcel charges/);

  const postage = timeline.find((entry) => entry.sourceId === "mun-mercantile-1826-postage");
  assert.ok(postage);
  assert.equal(postage.date, "1826-09-07");
  assert.match(postage.body, /one shilling to six pence/);

  const daylight = timeline.find((entry) => entry.sourceId === "mun-mercantile-1826-winter-carrier");
  assert.ok(daylight);
  assert.equal(daylight.date, "1826-10-12");
  assert.match(daylight.body, /07:00 every Tuesday, Thursday and Saturday/);
  assert.match(daylight.body, /complete the passage by daylight/);
});

test("1826 Western Ward record retains organization, equipment and alarms", () => {
  const event = timeline.find((entry) => entry.sourceId === "mun-mercantile-1826-western-fire-watch");
  assert.ok(event);
  assert.equal(event.date, "1826-11-09");
  assert.equal(event.status, "reported");
  assert.match(event.body, /100 members/);
  assert.match(event.body, /engine, lanterns, speaking trumpets, ladders, buckets, saws, hatchets and a hook ladder/);
  assert.match(event.body, /rattle reserved for fire or robbery alarms/);
  assert.match(event.body, /winter and summer watch hours/);
});

test("1826 sources retain exact physical pages and evidence states", () => {
  const expected = new Map([
    ["mun-mercantile-1826-winter-packet", "physical PDF p. 3"],
    ["mun-mercantile-1826-express-service", "physical PDF p. 3"],
    ["mun-mercantile-1826-postage", "physical PDF p. 3"],
    ["mun-mercantile-1826-western-fire-watch", "physical PDF p. 3"],
    ["mun-mercantile-1826-winter-carrier", "physical PDF p. 1"]
  ]);
  for (const [id, pages] of expected) {
    const source = sources.find((entry) => entry.id === id);
    assert.ok(source, id);
    assert.equal(source.pages, pages);
    assert.equal(source.status, "reported");
  }
});

test("1826 manifest preserves the MUN DAI Mercantile issue set", () => {
  assert.equal(manifest.year, 1826);
  assert.equal(manifest.issue_count, 36);
  assert.equal(manifest.collections.length, 1);
  assert.deepEqual(manifest.collections.map((entry) => [entry.name, entry.issue_count]), [
    ["Newfoundland Mercantile Journal", 36]
  ]);
  const items = manifest.collections.flatMap((entry) => entry.items);
  assert.equal(items.length, 36);
  assert.equal(new Set(items.map((entry) => entry.filename)).size, 36);
  for (const item of items) {
    assert.match(item.url, /^https:\/\/dai\.mun\.ca\/pdfs\/nl_mercantile\/NewfoundlandMercantileJournal1826\d{4}no\d+\.pdf$/);
    assert.match(item.sha256, /^[a-f0-9]{64}$/);
    assert.ok(item.bytes > 500_000);
  }
});

test("1826 research preserves publication and collection boundaries", () => {
  const record = fs.readFileSync(new URL("../research/NP_1826_SYSTEM_RECORD.md", import.meta.url), "utf8");
  assert.match(record, /all 36 surviving 1826 files listed in the MUN DAI \*Newfoundland Mercantile Journal\* collection/);
  assert.match(record, /does not establish the company's adoption or founding date/);
  assert.match(record, /does not establish that no other 1826 newspaper existed or survives elsewhere/);
  assert.match(record, /No supported named 1826 Newfoundland lighthouse project, electric telegraph, installed electrical circuit, operating electrical apparatus or local lightning-damage event/);
  assert.match(record, /Manifest SHA-256 `7114cc13c20e375350c93b9beaab7edfa632243d557478db93f96b7dcabeb2ea`/);
});

test("1826 work item is complete", () => {
  const item = workItems.work_items.find((entry) => entry.id === "NPREG-202");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-201"]);
  assert.deepEqual(item.completion_evidence, [
    "research/NP_1826_SYSTEM_RECORD.md",
    "research/derived/np-1826-newspaper-issue-manifest.json",
    "src/data.js",
    "tests/np-1826-system.test.js"
  ]);
});
