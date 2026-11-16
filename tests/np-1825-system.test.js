import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { sources, timeline } from "../src/data.js";
import workItems from "../docs/work-items.json" with { type: "json" };
import manifest from "../research/derived/np-1825-newspaper-issue-manifest.json" with { type: "json" };

test("1825 Express record retains timetable, traffic and agents", () => {
  const event = timeline.find((entry) => entry.sourceId === "mun-mercantile-1825-express-packet");
  assert.ok(event);
  assert.equal(event.date, "1825-08-25");
  assert.equal(event.status, "reported");
  assert.match(event.body, /commenced packet service/);
  assert.match(event.body, /08:00 on Monday, Wednesday and Friday/);
  assert.match(event.body, /10:00 the next morning/);
  assert.match(event.body, /one-shilling letter charge/);
  assert.match(event.body, /James Clift and William Innott/);
});

test("1825 daylight connection retains packet-man schedule and purpose", () => {
  const event = timeline.find((entry) => entry.sourceId === "mun-mercantile-1825-express-daylight");
  assert.ok(event);
  assert.equal(event.date, "1825-10-06");
  assert.equal(event.status, "reported");
  assert.match(event.body, /reach Harbour Grace before night/);
  assert.match(event.body, /07:45 on Tuesday, Thursday and Saturday/);
  assert.match(event.body, /Letters and parcels/);
});

test("1825 Fanny service remains proposed", () => {
  const event = timeline.find((entry) => entry.sourceId === "mun-mercantile-1825-fanny-service");
  assert.ok(event);
  assert.equal(event.date, "1825-11-03");
  assert.equal(event.status, "proposed");
  assert.match(event.body, /51-ton schooner Fanny/);
  assert.match(event.body, /St. John's, Harbour Grace, Carbonear, Brigus/);
  assert.match(event.body, /when freight offered/);
  const source = sources.find((entry) => entry.id === "mun-mercantile-1825-fanny-service");
  assert.ok(source);
  assert.equal(source.status, "proposed");
});

test("1825 sources retain exact physical pages and evidence states", () => {
  const expected = new Map([
    ["mun-mercantile-1825-express-packet", ["physical PDF p. 1", "reported"]],
    ["mun-mercantile-1825-express-daylight", ["physical PDF p. 3", "reported"]],
    ["mun-mercantile-1825-fanny-service", ["physical PDF p. 1", "proposed"]]
  ]);
  for (const [id, [pages, status]] of expected) {
    const source = sources.find((entry) => entry.id === id);
    assert.ok(source, id);
    assert.equal(source.pages, pages);
    assert.equal(source.status, status);
  }
});

test("1825 manifest preserves the five surviving MUN DAI issues", () => {
  assert.equal(manifest.year, 1825);
  assert.equal(manifest.issue_count, 5);
  assert.equal(manifest.collections.length, 1);
  assert.deepEqual(manifest.collections.map((entry) => [entry.name, entry.issue_count]), [
    ["Newfoundland Mercantile Journal", 5]
  ]);
  const items = manifest.collections.flatMap((entry) => entry.items);
  assert.equal(items.length, 5);
  assert.deepEqual(items.map((entry) => entry.date), ["18251103", "18251110", "18251117", "18251124", "18251201"]);
  for (const item of items) {
    assert.match(item.url, /^https:\/\/dai\.mun\.ca\/pdfs\/nl_mercantile\/NewfoundlandMercantileJournal1825\d{4}no\d+\.pdf$/);
    assert.match(item.sha256, /^[a-f0-9]{64}$/);
    assert.ok(item.bytes > 500_000);
  }
});

test("1825 research preserves proposal and collection boundaries", () => {
  const record = fs.readFileSync(new URL("../research/NP_1825_SYSTEM_RECORD.md", import.meta.url), "utf8");
  assert.match(record, /do not establish that the proposed service began/);
  assert.match(record, /all five surviving 1825 files listed in the MUN DAI \*Newfoundland Mercantile Journal\* collection/);
  assert.match(record, /does not establish that no other 1825 newspaper existed or survives elsewhere/);
  assert.match(record, /Manifest SHA-256 `42777f985c922896a9010474269eea66a78515dc2d4cbb698fdc3abaf2adbae0`/);
});

test("1825 work item is complete", () => {
  const item = workItems.work_items.find((entry) => entry.id === "NPREG-203");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-202"]);
  assert.deepEqual(item.completion_evidence, [
    "research/NP_1825_SYSTEM_RECORD.md",
    "research/derived/np-1825-newspaper-issue-manifest.json",
    "src/data.js",
    "tests/np-1825-system.test.js"
  ]);
});
