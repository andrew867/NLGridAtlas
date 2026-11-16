import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { sources, timeline } from "../src/data.js";
import workItems from "../docs/work-items.json" with { type: "json" };
import manifest from "../research/derived/np-1823-newspaper-issue-manifest.json" with { type: "json" };

test("1823 Hibernia record retains route, traffic and collection points", () => {
  const event = timeline.find((entry) => entry.sourceId === "mun-mercantile-1823-hibernia-packet");
  assert.ok(event);
  assert.equal(event.date, "1823-09-18");
  assert.equal(event.status, "reported");
  assert.match(event.body, /between Portugal Cove and Harbour Grace/);
  assert.match(event.body, /packages or passengers/);
  assert.match(event.body, /Mercantile Journal office/);
  assert.match(event.body, /James Holly's Sign of the Keg/);
});

test("1823 Hibernia source retains its later publication locator", () => {
  const source = sources.find((entry) => entry.id === "mun-mercantile-1823-hibernia-packet");
  assert.ok(source);
  assert.equal(source.year, 1823);
  assert.equal(source.pages, "physical PDF p. 3");
  assert.equal(source.status, "reported");
  assert.equal(source.url, "https://dai.mun.ca/pdfs/nl_mercantile/NewfoundlandMercantileJournal18240129no510.pdf");
});

test("1823 manifest preserves the 14 surviving MUN DAI issues", () => {
  assert.equal(manifest.year, 1823);
  assert.equal(manifest.issue_count, 14);
  assert.equal(manifest.collections.length, 1);
  assert.deepEqual(manifest.collections.map((entry) => [entry.name, entry.issue_count]), [
    ["Newfoundland Mercantile Journal", 14]
  ]);
  const items = manifest.collections.flatMap((entry) => entry.items);
  assert.equal(items.length, 14);
  assert.deepEqual(items.map((entry) => entry.date), [
    "18230102", "18230109", "18230116", "18230123", "18230130",
    "18230206", "18230213", "18230220", "18230227", "18230306",
    "18230313", "18230403", "18230410", "18230417"
  ]);
  for (const item of items) {
    assert.match(item.url, /^https:\/\/dai\.mun\.ca\/pdfs\/nl_mercantile\/NewfoundlandMercantileJournal1823\d{4}no\d+\.pdf$/);
    assert.match(item.sha256, /^[a-f0-9]{64}$/);
    assert.ok(item.bytes > 500_000);
  }
});

test("1823 research preserves event-date and collection boundaries", () => {
  const record = fs.readFileSync(new URL("../research/NP_1823_SYSTEM_RECORD.md", import.meta.url), "utf8");
  assert.match(record, /notice dated September 18, 1823/);
  assert.match(record, /\*Lively\* packet notice repeated in the surviving 1823 issues is dated November 13, 1822/);
  assert.match(record, /court report about an ordnance-yard fire and military response in St\. John's in 1819/);
  assert.match(record, /all 14 surviving 1823 files listed in the MUN DAI \*Newfoundland Mercantile Journal\* collection/);
  assert.match(record, /online run ends in April 1818 and resumes in January 1828/);
  assert.match(record, /Manifest SHA-256 `df13a79ad1f7346584e2e30d88cc48e7c36566c7bd854e9344eceb3ae16b95cf`/);
});

test("1823 work item is complete", () => {
  const item = workItems.work_items.find((entry) => entry.id === "NPREG-205");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-204"]);
  assert.deepEqual(item.completion_evidence, [
    "research/NP_1823_SYSTEM_RECORD.md",
    "research/derived/np-1823-newspaper-issue-manifest.json",
    "src/data.js",
    "tests/np-1823-system.test.js"
  ]);
});
