import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { sources, timeline } from "../src/data.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "research", "derived", "np-1814-newspaper-issue-manifest.json"), "utf8"));
const workItems = JSON.parse(fs.readFileSync(path.join(root, "docs", "work-items.json"), "utf8"));

test("1814 source records preserve exact URLs, pages and evidence states", () => {
  const expected = [
    ["mun-royal-gazette-1814-post-office", "https://dai.mun.ca/pdfs/royalgazette/TheRoyalGazette18140210.pdf", "physical PDF p. 3", "reported"],
    ["mun-royal-gazette-1814-public-repair-fund", "https://dai.mun.ca/pdfs/royalgazette/TheRoyalGazette18140217.pdf", "physical PDF p. 4", "proposed"],
    ["mun-royal-gazette-1814-ordnance-materials", "https://dai.mun.ca/pdfs/royalgazette/TheRoyalGazette18140331.pdf", "physical PDF p. 2", "proposed"],
    ["mun-royal-gazette-1814-ordnance-wharf", "https://dai.mun.ca/pdfs/royalgazette/TheRoyalGazette18140407.pdf", "physical PDF p. 2", "reported"],
    ["mun-colonial-1814-record-office", "https://dai.mun.ca/PDFs/cns_colonia/A52_V02.pdf", "physical PDF pp. 17, 66 and 68 to 70", "reported"],
    ["mun-colonial-1814-mail", "https://dai.mun.ca/PDFs/cns_colonia/A52_V02.pdf", "physical PDF p. 117", "reported"],
    ["mun-royal-gazette-1814-market", "https://dai.mun.ca/pdfs/royalgazette/TheRoyalGazette18150105.pdf", "physical PDF p. 3", "proposed"]
  ];
  for (const [id, url, pages, status] of expected) {
    const source = sources.find((entry) => entry.id === id);
    assert.ok(source, id);
    assert.equal(source.year, 1814);
    assert.equal(source.url, url);
    assert.equal(source.pages, pages);
    assert.equal(source.status, status);
  }
});

test("1814 manifest preserves the surviving Royal Gazette coverage", () => {
  assert.equal(manifest.year, 1814);
  assert.equal(manifest.issue_count, 53);
  assert.equal(manifest.physical_page_count, 214);
  assert.deepEqual(manifest.collections.map((entry) => [entry.name, entry.issue_count, entry.physical_page_count]), [
    ["The Royal Gazette", 53, 214]
  ]);
  const items = manifest.collections.flatMap((entry) => entry.items);
  assert.equal(items.length, 53);
  for (const item of items) {
    assert.match(item.sha256, /^[a-f0-9]{64}$/);
  }
});

test("1814 repair lottery arithmetic preserves the printed schedule", () => {
  const event = timeline.find((entry) => entry.sourceId === "mun-royal-gazette-1814-public-repair-fund");
  assert.ok(event);
  assert.match(event.body, /1,000 tickets at 20 shillings each/);
  assert.match(event.body, /600 pounds to prizes/);
  assert.match(event.body, /400 pounds for repairs/);
  assert.equal(600 + 400, 1000);
});

test("1814 Ordnance tenders remain proposed and retain their quantities", () => {
  const event = timeline.find((entry) => entry.sourceId === "mun-royal-gazette-1814-ordnance-materials");
  assert.ok(event);
  assert.equal(event.status, "proposed");
  assert.match(event.body, /400 hogsheads of coal/);
  assert.match(event.body, /300 rails/);
  assert.match(event.body, /3,000 pickets/);
  assert.match(event.body, /100 cords of firewood/);
  assert.match(event.body, /4,000 superficial feet/);
  assert.match(event.body, /50-foot flagstaff spar/);
  assert.match(event.body, /solicitations, not completed deliveries/);
});

test("1814 Meeting House report retains its relative date wording", () => {
  const event = timeline.find((entry) => entry.sourceId === "mun-royal-gazette-1814-meeting-house-fire");
  assert.ok(event);
  assert.equal(event.date, "1814-12-01");
  assert.match(event.body, /Monday morning last/);
  assert.doesNotMatch(event.body, /November 28/);
});

test("1814 dated notices preserve their later publication date", () => {
  const market = timeline.find((entry) => entry.sourceId === "mun-royal-gazette-1814-market");
  const carrier = timeline.find((entry) => entry.sourceId === "mun-royal-gazette-1814-letter-carrier");
  assert.ok(market);
  assert.ok(carrier);
  assert.equal(market.date, "1814-12-29");
  assert.equal(carrier.date, "1814-12-01");
  assert.match(market.body, /printed on January 5, 1815/);
  assert.match(carrier.body, /printed on January 5, 1815/);
});

test("1814 annual works preserve completion distinctions", () => {
  const signalHill = timeline.find((entry) => entry.sourceId === "mun-colonial-1814-record-office" && entry.title.includes("Signal Hill"));
  const survey = timeline.find((entry) => entry.sourceId === "mun-colonial-1814-record-office" && entry.title.includes("survey"));
  assert.ok(signalHill);
  assert.ok(survey);
  assert.equal(signalHill.status, "reported");
  assert.match(signalHill.body, /contemplated Signal Hill defences/);
  assert.equal(survey.status, "proposed");
  assert.match(survey.body, /not reported complete until 1815/);
});

test("1814 research preserves coverage, hashes and removes placeholders", () => {
  const record = fs.readFileSync(path.join(root, "research", "NP_1814_SYSTEM_RECORD.md"), "utf8");
  assert.match(record, /53 surviving 1814 files/);
  assert.match(record, /214 physical PDF pages/);
  assert.match(record, /144 physical pages/);
  assert.match(record, /1986bcb76525bfe19b3b410ad9cabf803bd69e92c1e1c23e92c51d14c6a80458/);
  assert.match(record, /3b9e90570cd2c0ec0efb76aee5d8488790c57f0cf0cb77e6dd31c10096c7d72a/);
  assert.doesNotMatch(record, /PLACEHOLDER/);
});

test("1814 work item is complete", () => {
  const item = workItems.work_items.find((entry) => entry.id === "NPREG-214");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-213"]);
  assert.deepEqual(item.completion_evidence, [
    "research/NP_1814_SYSTEM_RECORD.md",
    "research/derived/np-1814-newspaper-issue-manifest.json",
    "src/data.js",
    "tests/np-1814-system.test.js"
  ]);
});
