import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { sources, timeline } from "../src/data.js";
import workItems from "../docs/work-items.json" with { type: "json" };
import manifest from "../research/derived/np-1831-newfoundlander-issue-manifest.json" with { type: "json" };

test("1831 packet record retains its timetable and communication function", () => {
  const event = timeline.find((entry) => entry.sourceId === "mun-public-ledger-1831-harbour-grace-packet");
  assert.ok(event);
  assert.equal(event.date, "1831-04-15");
  assert.equal(event.status, "reported");
  assert.match(event.body, /resumed its usual trips/);
  assert.match(event.body, /Monday, Wednesday and Friday at 09:00/);
  assert.match(event.body, /weather permitting/);
  assert.match(event.body, /passengers, parcels and letters/);
  assert.match(event.body, /Henry Winton and Robert Oke/);
});

test("1831 packet source retains exact page and state", () => {
  const source = sources.find((entry) => entry.id === "mun-public-ledger-1831-harbour-grace-packet");
  assert.ok(source);
  assert.equal(source.pages, "physical PDF p. 4");
  assert.equal(source.status, "reported");
});

test("1831 issue manifest preserves the surviving regular scan set", () => {
  assert.equal(manifest.year, 1831);
  assert.equal(manifest.issue_count, 44);
  assert.equal(manifest.items.length, 44);
  assert.equal(new Set(manifest.items.map((entry) => entry.filename)).size, 44);
  for (const item of manifest.items) {
    assert.match(item.url, /^https:\/\/dai\.mun\.ca\/pdfs\/newfoundland\/Newfoundlander1831\d{4}\.pdf$/);
    assert.match(item.sha256, /^[a-f0-9]{64}$/);
    assert.ok(item.bytes > 1_000_000);
  }
});

test("1831 research preserves coverage and claim boundaries", () => {
  const record = fs.readFileSync(new URL("../research/NP_1831_SYSTEM_RECORD.md", import.meta.url), "utf8");
  assert.match(record, /words \*usual trips\* show that this was a resumed operating schedule/);
  assert.match(record, /six missing issues/);
  assert.match(record, /September 15 supplement was not included/);
  assert.match(record, /No named 1831 Newfoundland lighthouse project/);
  assert.match(record, /not locate a contemporary page supporting/);
  assert.match(record, /028872af06d03952a088310d84526e9ad18eef193ef9ea75cdd859a3feb20390/);
  assert.match(record, /0a44de24523e6a81e59b4cfeb07d1fe97554b77d323316b9d7d5c6734ed4dbb8/);
});

test("1831 work item is complete", () => {
  const item = workItems.work_items.find((entry) => entry.id === "NPREG-197");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-196"]);
  assert.deepEqual(item.completion_evidence, [
    "research/NP_1831_SYSTEM_RECORD.md",
    "research/derived/np-1831-newfoundlander-issue-manifest.json",
    "src/data.js",
    "tests/np-1831-system.test.js"
  ]);
});
