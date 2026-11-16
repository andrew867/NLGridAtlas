import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { sources, timeline } from "../src/data.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "research", "derived", "np-1816-newspaper-issue-manifest.json"), "utf8"));
const workItems = JSON.parse(fs.readFileSync(path.join(root, "docs", "work-items.json"), "utf8"));

test("1816 source records preserve exact URLs, pages and evidence states", () => {
  const expected = [
    ["mun-colonial-1816-st-johns-fire", "https://dai.mun.ca/PDFs/cns_colonia/A52_V03.pdf", "physical PDF pp. 11 to 15 and 37 to 39", "reported"],
    ["mun-royal-gazette-1816-harbour-grace-fire", "https://dai.mun.ca/pdfs/royalgazette/TheRoyalGazette18160903.pdf", "physical PDF p. 3", "reported"],
    ["mun-colonial-1816-harbour-grace-fire", "https://dai.mun.ca/PDFs/cns_colonia/A52_V03.pdf", "physical PDF pp. 41 to 42", "reported"],
    ["mun-royal-gazette-1816-pickmore-arrival", "https://dai.mun.ca/pdfs/royalgazette/TheRoyalGazette18160910.pdf", "physical PDF p. 3", "reported"],
    ["mun-mercantile-1816-accession-salutes", "https://dai.mun.ca/pdfs/nl_mercantile/NewfoundlandMercantileJournal18160925no112.pdf", "physical PDF p. 3", "reported"],
    ["mun-royal-gazette-1816-outer-buoy", "https://dai.mun.ca/pdfs/royalgazette/TheRoyalGazette18161015.pdf", "physical PDF p. 3, page printed October 8, 1816", "reported"],
    ["mun-mercantile-1816-coronation-salutes", "https://dai.mun.ca/pdfs/nl_mercantile/NewfoundlandMercantileJournal18161026no121.pdf", "physical PDF p. 2", "reported"],
    ["mun-mercantile-1816-fort-fuel", "https://dai.mun.ca/pdfs/nl_mercantile/NewfoundlandMercantileJournal18161109no125.pdf", "physical PDF p. 2", "reported"],
    ["mun-royal-gazette-1816-pickmore-departure", "https://dai.mun.ca/pdfs/royalgazette/TheRoyalGazette18161203.pdf", "physical PDF p. 2", "reported"],
    ["mun-mercantile-1816-fire-alarms", "https://dai.mun.ca/pdfs/nl_mercantile/NewfoundlandMercantileJournal18161211no134.pdf", "physical PDF p. 3", "reported"]
  ];
  for (const [id, url, pages, status] of expected) {
    const source = sources.find((entry) => entry.id === id);
    assert.ok(source, id);
    assert.equal(source.year, 1816);
    assert.equal(source.url, url);
    assert.equal(source.pages, pages);
    assert.equal(source.status, status);
  }
});

test("1816 manifest preserves both newspaper collections and archive coverage limits", () => {
  assert.equal(manifest.year, 1816);
  assert.equal(manifest.issue_count, 56);
  assert.equal(manifest.physical_page_count, 222);
  assert.deepEqual(manifest.collections.map((entry) => [entry.name, entry.issue_count, entry.physical_page_count]), [
    ["Newfoundland Mercantile Journal", 31, 124],
    ["The Royal Gazette", 25, 98]
  ]);
  const items = manifest.collections.flatMap((entry) => entry.items);
  assert.equal(items.length, 56);
  for (const item of items) {
    assert.match(item.sha256, /^[a-f0-9]{64}$/);
  }
});

test("1816 St. John's fire keeps Coote's values as reported estimates", () => {
  const event = timeline.find((entry) => entry.sourceId === "mun-colonial-1816-st-johns-fire" && entry.date === "1816-02-12");
  assert.ok(event);
  assert.equal(event.status, "reported");
  assert.match(event.body, /reported about 130 houses destroyed/);
  assert.match(event.body, /about 120 families displaced/);
  assert.match(event.body, /roughly 1,000 people dependent on relief/);
  assert.match(event.body, /estimated the loss at more than 100,000 pounds/);
  assert.match(event.body, /Customs House caught fire but was preserved/);
});

test("1816 Harbour Grace cause conflict remains attributed", () => {
  const newspaper = timeline.find((entry) => entry.sourceId === "mun-royal-gazette-1816-harbour-grace-fire");
  const governor = timeline.find((entry) => entry.sourceId === "mun-colonial-1816-harbour-grace-fire");
  assert.ok(newspaper);
  assert.ok(governor);
  assert.match(newspaper.body, /strong suspicions of deliberate ignition/);
  assert.match(newspaper.body, /Pickmore later stated that there was every reason to believe the fire was accidental/);
  assert.match(newspaper.body, /remain separate and attributed to their issuers/);
  assert.match(governor.body, /expense of 1,500 pounds/);
  assert.match(governor.body, /every reason to believe the fire was accidental/);
});

test("1816 outer-buoy record preserves the archive and printed dates", () => {
  const event = timeline.find((entry) => entry.sourceId === "mun-royal-gazette-1816-outer-buoy");
  assert.ok(event);
  assert.equal(event.date, "1816-10-08");
  assert.match(event.body, /passed the outer buoy/);
  assert.match(event.body, /archive filename is dated October 15/);
  assert.match(event.body, /printed-page date and archive filename are retained separately/);
});

test("1816 fort fuel allocation totals 250 cords", () => {
  const event = timeline.find((entry) => entry.sourceId === "mun-mercantile-1816-fort-fuel");
  assert.ok(event);
  assert.match(event.body, /100 cords to Fort Townshend/);
  assert.match(event.body, /100 cords to Fort William/);
  assert.match(event.body, /50 cords to Signal Hill/);
  assert.equal(100 + 100 + 50, 250);
});

test("1816 research preserves coverage, hashes and the missing fort attachment", () => {
  const record = fs.readFileSync(path.join(root, "research", "NP_1816_SYSTEM_RECORD.md"), "utf8");
  assert.match(record, /31 surviving 1816 files/);
  assert.match(record, /25 listed \*Royal Gazette\* files/);
  assert.match(record, /222 physical PDF pages/);
  assert.match(record, /115 physical pages/);
  assert.match(record, /e6f9348b475eac8c223ed6946fc7115b562baeb28d602c14caf684b3fa0e078a/);
  assert.match(record, /d45b6c989ad37eaca135ce37089a1aa358b1d4070cf5976d2c468e938e88eac9/);
  assert.match(record, /attached report is absent from the reproduced volume/);
  assert.match(record, /No 1816 fort condition claim is taken from that letter/);
});

test("1816 work item is complete", () => {
  const item = workItems.work_items.find((entry) => entry.id === "NPREG-212");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-211"]);
  assert.deepEqual(item.completion_evidence, [
    "research/NP_1816_SYSTEM_RECORD.md",
    "research/derived/np-1816-newspaper-issue-manifest.json",
    "src/data.js",
    "tests/np-1816-system.test.js"
  ]);
});
