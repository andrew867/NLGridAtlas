import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { sources, timeline } from "../src/data.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "research", "derived", "np-1813-newspaper-issue-manifest.json"), "utf8"));
const workItems = JSON.parse(fs.readFileSync(path.join(root, "docs", "work-items.json"), "utf8"));

test("1813 source records preserve exact URLs, pages and evidence states", () => {
  const expected = [
    ["mun-royal-gazette-1813-ordnance-barrack", "https://dai.mun.ca/pdfs/royalgazette/TheRoyalGazette18130311.pdf", "physical PDF p. 1", "proposed"],
    ["mun-royal-gazette-1813-bay-bulls-road", "https://dai.mun.ca/pdfs/royalgazette/TheRoyalGazette18130311.pdf", "physical PDF p. 1", "reported"],
    ["mun-royal-gazette-1813-hospital-foundation", "https://dai.mun.ca/pdfs/royalgazette/TheRoyalGazette18130610.pdf", "physical PDF p. 2", "reported"],
    ["mun-royal-gazette-1813-truckage", "https://dai.mun.ca/pdfs/royalgazette/TheRoyalGazette18130701.pdf", "physical PDF p. 6", "proposed"],
    ["mun-royal-gazette-1813-fire-engine-one", "https://dai.mun.ca/pdfs/royalgazette/TheRoyalGazette18130805.pdf", "physical PDF p. 3", "reported"],
    ["mun-colonial-1813-record-office", "https://dai.mun.ca/PDFs/cns_colonia/A52_V01.pdf", "physical PDF p. 482", "proposed"],
    ["mun-colonial-1813-fortifications", "https://dai.mun.ca/PDFs/cns_colonia/A52_V01.pdf", "physical PDF pp. 501 to 503", "reported"]
  ];
  for (const [id, url, pages, status] of expected) {
    const source = sources.find((entry) => entry.id === id);
    assert.ok(source, id);
    assert.equal(source.year, 1813);
    assert.equal(source.url, url);
    assert.equal(source.pages, pages);
    assert.equal(source.status, status);
  }
});

test("1813 manifest preserves the surviving Royal Gazette coverage", () => {
  assert.equal(manifest.year, 1813);
  assert.equal(manifest.issue_count, 43);
  assert.equal(manifest.physical_page_count, 185);
  assert.deepEqual(manifest.collections.map((entry) => [entry.name, entry.issue_count, entry.physical_page_count]), [
    ["The Royal Gazette", 43, 185]
  ]);
  const items = manifest.collections.flatMap((entry) => entry.items);
  assert.equal(items.length, 43);
  for (const item of items) {
    assert.match(item.sha256, /^[a-f0-9]{64}$/);
  }
});

test("1813 material tenders remain proposed and retain their quantities", () => {
  const ordnance = timeline.find((entry) => entry.sourceId === "mun-royal-gazette-1813-ordnance-barrack");
  const garrison = timeline.find((entry) => entry.sourceId === "mun-royal-gazette-1813-garrison-fuel");
  assert.ok(ordnance);
  assert.ok(garrison);
  assert.equal(ordnance.status, "proposed");
  assert.equal(garrison.status, "proposed");
  assert.match(ordnance.body, /3,000 hogsheads/);
  assert.match(ordnance.body, /200 cords/);
  assert.match(ordnance.body, /150 gallons of cod-fish oil/);
  assert.match(ordnance.body, /100 gallons of seal oil/);
  assert.match(garrison.body, /300 cords of firewood divided equally/);
});

test("1813 hospital milestones do not claim completion", () => {
  const foundation = timeline.find((entry) => entry.sourceId === "mun-royal-gazette-1813-hospital-foundation");
  const progress = timeline.find((entry) => entry.sourceId === "mun-royal-gazette-1813-hospital-progress");
  assert.ok(foundation);
  assert.ok(progress);
  assert.equal(foundation.date, "1813-06-04");
  assert.equal(progress.date, "1813-07-13");
  assert.doesNotMatch(progress.body, /completed|completion/);
});

test("1813 fire-engine notice does not invent ownership or commissioning", () => {
  const event = timeline.find((entry) => entry.sourceId === "mun-royal-gazette-1813-fire-engine-one");
  assert.ok(event);
  assert.match(event.body, /Captain Richard Langley/);
  assert.doesNotMatch(event.body, /owner|commission/);
});

test("1813 fortification report preserves completion distinctions", () => {
  const event = timeline.find((entry) => entry.sourceId === "mun-colonial-1813-fortifications");
  assert.ok(event);
  assert.equal(event.status, "reported");
  assert.match(event.body, /completed batteries/);
  assert.match(event.body, /Signal Hill remained unfinished/);
  assert.match(event.body, /larger Signal Hill plan remained proposed/);
});

test("1813 research preserves coverage, hashes and removes placeholders", () => {
  const record = fs.readFileSync(path.join(root, "research", "NP_1813_SYSTEM_RECORD.md"), "utf8");
  assert.match(record, /43 surviving 1813 files/);
  assert.match(record, /185 physical PDF pages/);
  assert.match(record, /516 physical pages/);
  assert.match(record, /4cb294934e31a1adcb547a40a8dcf6ce6211c2e9db6536e9d7663fbc9e005e2b/);
  assert.match(record, /c1056710d6e1038d9acf976ac570415b847e1b956d257c5e395df18f8a40fd29/);
  assert.doesNotMatch(record, /PLACEHOLDER/);
});

test("1813 work item is complete", () => {
  const item = workItems.work_items.find((entry) => entry.id === "NPREG-215");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-214"]);
  assert.deepEqual(item.completion_evidence, [
    "research/NP_1813_SYSTEM_RECORD.md",
    "research/derived/np-1813-newspaper-issue-manifest.json",
    "src/data.js",
    "tests/np-1813-system.test.js"
  ]);
});
