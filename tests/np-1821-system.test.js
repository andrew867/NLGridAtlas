import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { sources, timeline } from "../src/data.js";
import workItems from "../docs/work-items.json" with { type: "json" };
import manifest from "../research/derived/np-1821-newspaper-issue-manifest.json" with { type: "json" };

test("1821 Lively record retains route, capacity, fares and collection points", () => {
  const event = timeline.find((entry) => entry.sourceId === "mun-mercantile-1821-lively-packet");
  assert.ok(event);
  assert.equal(event.date, "1821-11-29");
  assert.equal(event.status, "reported");
  assert.match(event.body, /between Portugal Cove and Harbour Grace/);
  assert.match(event.body, /eight shillings for ladies and gentlemen/);
  assert.match(event.body, /five shillings for tradesmen/);
  assert.match(event.body, /four shillings for labourers/);
  assert.match(event.body, /letters cost nine pence each/);
  assert.match(event.body, /Francis Neary/);
});

test("1821 and 1822 Lively notices preserve their documented changes", () => {
  const original = timeline.find((entry) => entry.sourceId === "mun-mercantile-1821-lively-packet");
  const later = timeline.find((entry) => entry.sourceId === "mun-mercantile-1822-lively-packet");
  assert.ok(original);
  assert.ok(later);
  assert.match(original.body, /eight shillings for ladies and gentlemen/);
  assert.match(original.body, /Francis Neary/);
  assert.match(later.body, /five shillings for ladies and gentlemen/);
  assert.match(later.body, /James Neary/);
});

test("1821 electric-eel record remains non-Newfoundland electrical context", () => {
  const event = timeline.find((entry) => entry.sourceId === "mun-mercantile-1821-electric-eel");
  assert.ok(event);
  assert.equal(event.date, "1821-11-29");
  assert.equal(event.category, "electrical context");
  assert.match(event.body, /living electrical machine/);
  assert.match(event.body, /hand and arm contraction/);
  assert.match(event.body, /did not occur in Newfoundland/);
  assert.doesNotMatch(event.body, /installed|generator|circuit/i);
});

test("1821 sources retain exact shared issue and physical pages", () => {
  const packet = sources.find((entry) => entry.id === "mun-mercantile-1821-lively-packet");
  const eel = sources.find((entry) => entry.id === "mun-mercantile-1821-electric-eel");
  assert.ok(packet);
  assert.ok(eel);
  assert.equal(packet.year, 1821);
  assert.equal(eel.year, 1821);
  assert.equal(packet.pages, "physical PDF p. 3");
  assert.equal(eel.pages, "physical PDF p. 4");
  assert.equal(packet.url, "https://dai.mun.ca/pdfs/nl_mercantile/NewfoundlandMercantileJournal18211129no397.pdf");
  assert.equal(eel.url, packet.url);
});

test("1821 manifest preserves the 43 surviving MUN DAI issues", () => {
  assert.equal(manifest.year, 1821);
  assert.equal(manifest.issue_count, 43);
  assert.equal(manifest.collections.length, 1);
  assert.deepEqual(manifest.collections.map((entry) => [entry.name, entry.issue_count]), [
    ["Newfoundland Mercantile Journal", 43]
  ]);
  const items = manifest.collections.flatMap((entry) => entry.items);
  assert.equal(items.length, 43);
  assert.equal(items[0].date, "18210104");
  assert.equal(items.at(-1).date, "18211227");
  for (const missing of [
    "18210426", "18210503", "18210510", "18210906", "18210913",
    "18210920", "18210927", "18211025", "18211115"
  ]) {
    assert.equal(items.some((entry) => entry.date === missing), false, missing);
  }
  for (const item of items) {
    assert.match(item.url, /^https:\/\/dai\.mun\.ca\/pdfs\/nl_mercantile\/NewfoundlandMercantileJournal1821\d{4}no\d+\.pdf$/);
    assert.match(item.sha256, /^[a-f0-9]{64}$/);
    assert.ok(item.bytes > 500_000);
  }
});

test("1821 research preserves geographic and evidence boundaries", () => {
  const record = fs.readFileSync(new URL("../research/NP_1821_SYSTEM_RECORD.md", import.meta.url), "utf8");
  assert.match(record, /later notice dated November 13, 1822 reduced the listed fare/);
  assert.match(record, /This is electrical context printed in Newfoundland/);
  assert.match(record, /reported observation did not occur in Newfoundland/);
  assert.match(record, /fire-engine report concerns Saint John, New Brunswick/);
  assert.match(record, /lighthouse references describe Genoa and Harwich/);
  assert.match(record, /all 43 surviving 1821 files listed in the MUN DAI \*Newfoundland Mercantile Journal\* collection/);
  assert.match(record, /Manifest SHA-256 `6c790b4813b06fa0152f04698eea35152e83ae93f735a56c94f21fc4521ce56b`/);
});

test("1821 work item is complete", () => {
  const item = workItems.work_items.find((entry) => entry.id === "NPREG-207");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-206"]);
  assert.deepEqual(item.completion_evidence, [
    "research/NP_1821_SYSTEM_RECORD.md",
    "research/derived/np-1821-newspaper-issue-manifest.json",
    "src/data.js",
    "tests/np-1821-system.test.js"
  ]);
});
