import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { sources, timeline } from "../src/data.js";
import workItems from "../docs/work-items.json" with { type: "json" };
import manifest from "../research/derived/np-1824-newspaper-issue-manifest.json" with { type: "json" };

test("1824 Davy record retains wire-connected copper protection", () => {
  const event = timeline.find((entry) => entry.sourceId === "mun-mercantile-1824-davy-copper");
  assert.ok(event);
  assert.equal(event.date, "1824-05-13");
  assert.equal(event.status, "reported");
  assert.match(event.body, /negatively electrical/);
  assert.match(event.body, /tin connected by wire/);
  assert.match(event.body, /trials on warships/);
});

test("1824 fire response retains alarm and engine evidence", () => {
  const event = timeline.find((entry) => entry.sourceId === "mun-mercantile-1824-fire-response");
  assert.ok(event);
  assert.equal(event.date, "1824-05-08");
  assert.equal(event.status, "reported");
  assert.match(event.body, /guns and bells/);
  assert.match(event.body, /Snow initially concealed/);
  assert.match(event.body, /Fort Townshend engine/);
});

test("1824 buoy record retains intended use and enforcement", () => {
  const event = timeline.find((entry) => entry.sourceId === "mun-mercantile-1824-kings-buoys");
  assert.ok(event);
  assert.equal(event.date, "1824-05-10");
  assert.equal(event.status, "reported");
  assert.match(event.body, /Narrows and St\. John's harbour/);
  assert.match(event.body, /warping past/);
  assert.match(event.body, /responsible pilots could be barred from future King's service/);
});

test("1824 Phoenix record retains equipment, drill and response rules", () => {
  const event = timeline.find((entry) => entry.sourceId === "mun-mercantile-1824-phoenix-fire-company");
  assert.ok(event);
  assert.equal(event.date, "1824-05-19");
  assert.equal(event.status, "reported");
  assert.match(event.body, /18:00 to 19:00 every second Saturday/);
  assert.match(event.body, /Brown, Hoyles and Morris's wharf/);
  assert.match(event.body, /six light, inverted-cone buckets/);
});

test("1824 Dart record retains route, schedule and letter collection", () => {
  const event = timeline.find((entry) => entry.sourceId === "mun-mercantile-1824-dart-packet");
  assert.ok(event);
  assert.equal(event.date, "1824-07-13");
  assert.equal(event.status, "reported");
  assert.match(event.body, /Portugal Cove and other Conception Bay ports/);
  assert.match(event.body, /08:00 each Saturday/);
  assert.match(event.body, /collection points/);
});

test("1824 sources retain exact physical pages", () => {
  const expected = new Map([
    ["mun-mercantile-1824-davy-copper", "physical PDF p. 1"],
    ["mun-mercantile-1824-fire-response", "physical PDF p. 2"],
    ["mun-mercantile-1824-kings-buoys", "physical PDF p. 2"],
    ["mun-mercantile-1824-phoenix-fire-company", "physical PDF p. 3"],
    ["mun-mercantile-1824-dart-packet", "physical PDF p. 3"]
  ]);
  for (const [id, pages] of expected) {
    const source = sources.find((entry) => entry.id === id);
    assert.ok(source, id);
    assert.equal(source.pages, pages);
    assert.equal(source.status, "reported");
  }
});

test("1824 manifest preserves the 25 surviving MUN DAI issues", () => {
  assert.equal(manifest.year, 1824);
  assert.equal(manifest.issue_count, 25);
  assert.equal(manifest.collections.length, 1);
  assert.deepEqual(manifest.collections.map((entry) => [entry.name, entry.issue_count]), [
    ["Newfoundland Mercantile Journal", 25]
  ]);
  const items = manifest.collections.flatMap((entry) => entry.items);
  assert.equal(items.length, 25);
  assert.deepEqual(items.map((entry) => entry.date), [
    "18240115", "18240129", "18240205", "18240219", "18240304",
    "18240318", "18240513", "18240520", "18240527", "18240603",
    "18240610", "18240617", "18240624", "18240708", "18240715",
    "18240805", "18240812", "18240819", "18240826", "18240902",
    "18240909", "18240916", "18240930", "18241007", "18241021"
  ]);
  for (const item of items) {
    assert.match(item.url, /^https:\/\/dai\.mun\.ca\/pdfs\/nl_mercantile\/NewfoundlandMercantileJournal1824\d{4}no\d+\.pdf$/);
    assert.match(item.sha256, /^[a-f0-9]{64}$/);
    assert.ok(item.bytes > 500_000);
  }
});

test("1824 research preserves local and publication boundaries", () => {
  const record = fs.readFileSync(new URL("../research/NP_1824_SYSTEM_RECORD.md", import.meta.url), "utf8");
  assert.match(record, /not evidence of a local installed electrical system/);
  assert.match(record, /\*Hibernia\* packet notice repeated in several 1824 issues is dated September 18, 1823/);
  assert.match(record, /all 25 surviving 1824 files listed in the MUN DAI \*Newfoundland Mercantile Journal\* collection/);
  assert.match(record, /Manifest SHA-256 `451cb6682bd7b5acb9f47d17687415fd3464920aa7ea9cc426dfed14ed227c0a`/);
});

test("1824 work item is complete", () => {
  const item = workItems.work_items.find((entry) => entry.id === "NPREG-204");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-203"]);
  assert.deepEqual(item.completion_evidence, [
    "research/NP_1824_SYSTEM_RECORD.md",
    "research/derived/np-1824-newspaper-issue-manifest.json",
    "src/data.js",
    "tests/np-1824-system.test.js"
  ]);
});
