import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { sources, timeline } from "../src/data.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "research", "derived", "np-1812-newspaper-issue-manifest.json"), "utf8"));
const workItems = JSON.parse(fs.readFileSync(path.join(root, "docs", "work-items.json"), "utf8"));

test("1812 source records preserve exact URLs, pages and evidence states", () => {
  const expected = [
    ["mun-royal-gazette-1812-fort-firewood", "https://dai.mun.ca/pdfs/royalgazette/TheRoyalGazette18120116.pdf", "physical PDF p. 3", "proposed"],
    ["mun-royal-gazette-1812-government-house-fire", "https://dai.mun.ca/pdfs/royalgazette/TheRoyalGazette18120205.pdf", "physical PDF p. 3", "reported"],
    ["mun-royal-gazette-1812-governors-wharf", "https://dai.mun.ca/pdfs/royalgazette/TheRoyalGazette18120730.pdf", "physical PDF p. 3", "reported"],
    ["mun-royal-gazette-1812-public-works-materials", "https://dai.mun.ca/pdfs/royalgazette/TheRoyalGazette18121022.pdf", "physical PDF p. 2", "proposed"],
    ["mun-colonial-1812-out-harbour-defence", "https://dai.mun.ca/PDFs/cns_colonia/A52_V01.pdf", "physical PDF pp. 353 to 355", "reported"],
    ["mun-colonial-1812-debtors-gaol", "https://dai.mun.ca/PDFs/cns_colonia/A52_V01.pdf", "physical PDF pp. 375 to 376", "proposed"]
  ];
  for (const [id, url, pages, status] of expected) {
    const source = sources.find((entry) => entry.id === id);
    assert.ok(source, id);
    assert.equal(source.year, 1812);
    assert.equal(source.url, url);
    assert.equal(source.pages, pages);
    assert.equal(source.status, status);
  }
});

test("1812 manifest preserves the surviving Royal Gazette coverage", () => {
  assert.equal(manifest.year, 1812);
  assert.equal(manifest.issue_count, 40);
  assert.equal(manifest.physical_page_count, 162);
  assert.deepEqual(manifest.collections.map((entry) => [entry.name, entry.issue_count, entry.physical_page_count]), [
    ["The Royal Gazette", 40, 162]
  ]);
  const items = manifest.collections.flatMap((entry) => entry.items);
  assert.equal(items.length, 40);
  for (const item of items) {
    assert.match(item.sha256, /^[a-f0-9]{64}$/);
  }
});

test("1812 tenders remain proposed and retain their quantities", () => {
  const garrison = timeline.find((entry) => entry.sourceId === "mun-royal-gazette-1812-garrison-supply");
  const publicWorks = timeline.find((entry) => entry.sourceId === "mun-royal-gazette-1812-public-works-materials");
  assert.ok(garrison);
  assert.ok(publicWorks);
  assert.equal(garrison.status, "proposed");
  assert.equal(publicWorks.status, "proposed");
  assert.match(garrison.body, /3,000 hogsheads/);
  assert.match(garrison.body, /5,400 pounds/);
  assert.match(garrison.body, /550 cords/);
  assert.match(publicWorks.body, /55,000 feet/);
  assert.match(publicWorks.body, /22,000 bricks/);
  assert.match(publicWorks.body, /96 tons/);
});

test("1812 Government House fire keeps the relative event date", () => {
  const event = timeline.find((entry) => entry.sourceId === "mun-royal-gazette-1812-government-house-fire");
  assert.ok(event);
  assert.equal(event.date, "1812-02-06");
  assert.match(event.body, /Monday evening last/);
  assert.match(event.body, /Government House and the Barracks/);
});

test("1812 wharf records keep operating and construction evidence distinct", () => {
  const governorWharf = timeline.find((entry) => entry.sourceId === "mun-royal-gazette-1812-governors-wharf");
  const annual = timeline.find((entry) => entry.sourceId === "mun-colonial-1812-public-works");
  assert.ok(governorWharf);
  assert.ok(annual);
  assert.equal(governorWharf.status, "reported");
  assert.match(governorWharf.body, /recently built wharf/);
  assert.match(annual.body, /two large public wharves built/);
  assert.match(annual.body, /two-thirds of the wharf-building expense had been paid/);
  assert.equal(sources.some((entry) => entry.id === "mun-royal-gazette-1812-fishing-wharf"), false);
});

test("1812 defence report retains completed work and exact repair estimate", () => {
  const outHarbours = timeline.find((entry) => entry.sourceId === "mun-colonial-1812-out-harbour-defence");
  const forts = timeline.find((entry) => entry.sourceId === "mun-colonial-1812-fort-repairs");
  assert.ok(outHarbours);
  assert.ok(forts);
  assert.equal(outHarbours.status, "reported");
  assert.match(outHarbours.body, /gun platforms/);
  assert.match(outHarbours.body, /breastworks/);
  assert.match(forts.body, /360 pounds, 3 shillings and 7 pence/);
  assert.doesNotMatch(forts.body, /366 pounds/);
});

test("1812 gaol record remains proposed", () => {
  const event = timeline.find((entry) => entry.sourceId === "mun-colonial-1812-debtors-gaol");
  assert.ok(event);
  assert.equal(event.status, "proposed");
  assert.match(event.body, /plan and estimate/);
  assert.match(event.body, /1,500-pound estimate/);
});

test("1812 research preserves coverage, hashes and removes placeholders", () => {
  const record = fs.readFileSync(path.join(root, "research", "NP_1812_SYSTEM_RECORD.md"), "utf8");
  assert.match(record, /40 surviving 1812 files/);
  assert.match(record, /162 physical PDF pages/);
  assert.match(record, /4cb294934e31a1adcb547a40a8dcf6ce6211c2e9db6536e9d7663fbc9e005e2b/);
  assert.match(record, /fcbeed1b3684e33f9734ee05c7b229ce91b6349efd8e194fb89b2b2c75847740/);
  assert.doesNotMatch(record, /PLACEHOLDER/);
});

test("1812 work item is complete", () => {
  const item = workItems.work_items.find((entry) => entry.id === "NPREG-216");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-215"]);
  assert.deepEqual(item.completion_evidence, [
    "research/NP_1812_SYSTEM_RECORD.md",
    "research/derived/np-1812-newspaper-issue-manifest.json",
    "src/data.js",
    "tests/np-1812-system.test.js"
  ]);
});
