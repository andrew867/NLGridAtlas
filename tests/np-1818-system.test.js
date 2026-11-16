import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { sources, timeline } from "../src/data.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "research", "derived", "np-1818-newspaper-issue-manifest.json"), "utf8"));
const workItems = JSON.parse(fs.readFileSync(path.join(root, "docs", "work-items.json"), "utf8"));

test("1818 source records preserve exact issue URLs and physical pages", () => {
  const expected = [
    ["mun-royal-gazette-1818-arson-rewards", "royalgazette", "TheRoyalGazette18180113", "physical PDF p. 1"],
    ["mun-royal-gazette-1818-electrifying-machine", "royalgazette", "TheRoyalGazette18180310", "physical PDF p. 2"],
    ["mun-mercantile-1818-portugal-cove-fire", "nl_mercantile", "NewfoundlandMercantileJournal18180403no207", "physical PDF p. 3"],
    ["mun-mercantile-1818-hamilton-arrival", "nl_mercantile", "NewfoundlandMercantileJournal18180724no223", "physical PDF p. 3"],
    ["mun-mercantile-1818-lighthouse-establishment", "nl_mercantile", "NewfoundlandMercantileJournal18180807no225", "physical PDF p. 3"],
    ["mun-mercantile-1818-fort-firewood", "nl_mercantile", "NewfoundlandMercantileJournal18181224no245", "physical PDF p. 3"],
    ["mun-mercantile-1818-helen-wreck", "nl_mercantile", "NewfoundlandMercantileJournal18181231no246", "physical PDF p. 3"]
  ];
  for (const [id, slug, issue, pages] of expected) {
    const source = sources.find((entry) => entry.id === id);
    assert.ok(source, id);
    assert.equal(source.year, 1818);
    assert.equal(source.status, "reported");
    assert.equal(source.pages, pages);
    assert.equal(source.url, `https://dai.mun.ca/pdfs/${slug}/${issue}.pdf`);
  }
});

test("1818 manifest preserves both surviving MUN DAI newspaper runs", () => {
  assert.equal(manifest.year, 1818);
  assert.equal(manifest.issue_count, 60);
  assert.deepEqual(manifest.collections.map((entry) => [entry.name, entry.issue_count]), [
    ["Newfoundland Mercantile Journal", 47],
    ["The Royal Gazette", 13]
  ]);
  const mercantile = manifest.collections[0].items;
  const royal = manifest.collections[1].items;
  assert.equal(mercantile[0].date, "18180109");
  assert.equal(mercantile.at(-1).date, "18181231");
  assert.equal(royal[0].date, "18180113");
  assert.equal(royal.at(-1).date, "18180407");
  for (const missing of ["18180320", "18180327", "18180612", "18180903", "18180917"]) {
    assert.equal(mercantile.some((entry) => entry.date === missing), false, missing);
  }
  for (const item of [...mercantile, ...royal]) {
    assert.match(item.sha256, /^[a-f0-9]{64}$/);
  }
});

test("1818 arson response keeps the three reward provisions distinct", () => {
  const event = timeline.find((entry) => entry.sourceId === "mun-royal-gazette-1818-arson-rewards");
  assert.ok(event);
  assert.equal(event.date, "1818-01-01");
  assert.match(event.body, /300 pounds/);
  assert.match(event.body, /further 1,000 pounds/);
  assert.match(event.body, /separate 100-pound reward/);
  assert.match(event.body, /William Hogan's house in Maggotty Cove/);
});

test("1818 electrical guidance is not presented as Newfoundland apparatus", () => {
  const event = timeline.find((entry) => entry.sourceId === "mun-royal-gazette-1818-electrifying-machine");
  assert.ok(event);
  assert.equal(event.category, "electrical context");
  assert.match(event.body, /electrifying machine/);
  assert.match(event.body, /does not identify a machine, purchase or treatment in Newfoundland/);
});

test("1818 Portugal Cove record preserves the reported firebreak and cause", () => {
  const event = timeline.find((entry) => entry.sourceId === "mun-mercantile-1818-portugal-cove-fire");
  assert.ok(event);
  assert.equal(event.date, "1818-04-03");
  assert.match(event.body, /An adjoining store was pulled down/);
  assert.match(event.body, /hot ashes left in a tub in the porch/);
});

test("1818 harbour ceremony preserves the signal actions", () => {
  const event = timeline.find((entry) => entry.sourceId === "mun-mercantile-1818-hamilton-arrival");
  assert.ok(event);
  assert.match(event.body, /commodore's pendant was struck/);
  assert.match(event.body, /Ships in port and the garrison fired salutes/);
  assert.match(event.body, /flag transferred/);
});

test("1818 lighthouse notice remains limited to what the notice names", () => {
  const event = timeline.find((entry) => entry.sourceId === "mun-mercantile-1818-lighthouse-establishment");
  assert.ok(event);
  assert.match(event.body, /Friends and Supporters of the Light-House Establishment/);
  assert.match(event.body, /does not identify a lighthouse, site, light, keeper, governing body or construction project/);
});

test("1818 fort fuel tender preserves its notice date and controls", () => {
  const event = timeline.find((entry) => entry.sourceId === "mun-mercantile-1818-fort-firewood");
  assert.ok(event);
  assert.equal(event.date, "1818-12-09");
  assert.match(event.body, /400 cords of black, yellow or white birch/);
  assert.match(event.body, /Fort William, 150 cords/);
  assert.match(event.body, /Fort Townshend, 200 cords/);
  assert.match(event.body, /Signal Hill, 50 cords/);
  assert.match(event.body, /minimum of 20 cords/);
  assert.match(event.body, /two sureties/);
  assert.equal(timeline.some((entry) => entry.sourceId === "mun-mercantile-1819-fort-firewood"), false);
});

test("1818 Helen report keeps publication date and pilot-boat actions explicit", () => {
  const event = timeline.find((entry) => entry.sourceId === "mun-mercantile-1818-helen-wreck");
  assert.ok(event);
  assert.equal(event.date, "1818-12-31");
  assert.match(event.body, /A pilot boat helped put out two additional anchors/);
  assert.match(event.body, /stream hawser and two anchor cables parted/);
  assert.match(event.body, /six people died/);
});

test("1818 research retains archive limits, deferrals and source hashes", () => {
  const record = fs.readFileSync(path.join(root, "research", "NP_1818_SYSTEM_RECORD.md"), "utf8");
  assert.match(record, /comprise 234 physical PDF pages/);
  assert.match(record, /Post Office notice dated December 26, 1817/);
  assert.match(record, /4e8c43a17775a56fa92df0b71b60377842145a7ae992a4b13bf5e81173a78a02/);
  assert.match(record, /does not identify a lighthouse, site, light, keeper, governing body or construction project/);
});

test("1818 work item is complete", () => {
  const item = workItems.work_items.find((entry) => entry.id === "NPREG-210");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-209"]);
  assert.deepEqual(item.completion_evidence, [
    "research/NP_1818_SYSTEM_RECORD.md",
    "research/derived/np-1818-newspaper-issue-manifest.json",
    "src/data.js",
    "tests/np-1818-system.test.js"
  ]);
});
