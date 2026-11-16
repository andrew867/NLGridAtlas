import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { sources, timeline } from "../src/data.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "research", "derived", "np-1811-newspaper-issue-manifest.json"), "utf8"));
const workItems = JSON.parse(fs.readFileSync(path.join(root, "docs", "work-items.json"), "utf8"));

test("1811 source records preserve exact URLs, pages and evidence states", () => {
  const expected = [
    ["mun-royal-gazette-1811-fort-amherst-light", "https://dai.mun.ca/pdfs/royalgazette/TheRoyalGazette18111024.pdf", "physical PDF p. 1", "reported"],
    ["mun-royal-gazette-1811-hospital", "https://dai.mun.ca/pdfs/royalgazette/TheRoyalGazette18111031.pdf", "physical PDF p. 2", "proposed"],
    ["mun-royal-gazette-1811-fishing-room", "https://dai.mun.ca/pdfs/royalgazette/TheRoyalGazette18111031.pdf", "physical PDF p. 4", "reported"],
    ["mun-royal-gazette-1811-town-improvement", "https://dai.mun.ca/pdfs/royalgazette/TheRoyalGazette18111128.pdf", "physical PDF p. 3", "proposed"],
    ["mun-colonial-1811-public-works", "https://dai.mun.ca/PDFs/cns_colonia/A52_V01.pdf", "physical PDF pp. 404 to 407", "reported"],
    ["mun-colonial-1811-debtors-gaol", "https://dai.mun.ca/PDFs/cns_colonia/A52_V01.pdf", "physical PDF p. 410", "proposed"]
  ];
  for (const [id, url, pages, status] of expected) {
    const source = sources.find((entry) => entry.id === id);
    assert.ok(source, id);
    assert.equal(source.year, 1811);
    assert.equal(source.url, url);
    assert.equal(source.pages, pages);
    assert.equal(source.status, status);
  }
});

test("1811 manifest preserves archive-file coverage without claiming clean issues", () => {
  assert.equal(manifest.year, 1811);
  assert.equal(manifest.issue_count, 20);
  assert.equal(manifest.physical_page_count, 80);
  const items = manifest.collections.flatMap((entry) => entry.items);
  assert.equal(items.length, 20);
  for (const item of items) assert.match(item.sha256, /^[a-f0-9]{64}$/);
  const record = fs.readFileSync(path.join(root, "research", "NP_1811_SYSTEM_RECORD.md"), "utf8");
  assert.match(record, /20 dated 1811 archive files/);
  assert.match(record, /not treated as 20 clean or complete issues/);
  assert.match(record, /physical PDF p\. 3 is headed October 17, 1811/);
});

test("1811 fishing-room proclamation is not represented as an 1812 wharf", () => {
  const event = timeline.find((entry) => entry.sourceId === "mun-royal-gazette-1811-fishing-room");
  assert.ok(event);
  assert.equal(event.date, "1811-09-26");
  assert.match(event.body, /Fishing Ships' Room/);
  assert.match(event.body, /drying, curing and husbanding fish/);
  assert.equal(sources.some((entry) => entry.id === "mun-royal-gazette-1812-fishing-wharf"), false);
});

test("1811 infrastructure proposals remain proposed", () => {
  const hospital = timeline.find((entry) => entry.sourceId === "mun-royal-gazette-1811-hospital");
  const road = timeline.find((entry) => entry.sourceId === "mun-royal-gazette-1811-portugal-cove-road");
  const town = timeline.find((entry) => entry.sourceId === "mun-royal-gazette-1811-town-improvement");
  assert.equal(hospital?.status, "proposed");
  assert.equal(road?.status, "proposed");
  assert.equal(town?.status, "proposed");
  assert.match(road.body, /14 feet wide/);
  assert.match(town.body, /paving, lighting and widening streets/);
});

test("1811 operational records retain exact quantities and purposes", () => {
  const light = timeline.find((entry) => entry.sourceId === "mun-royal-gazette-1811-fort-amherst-light");
  const buoy = timeline.find((entry) => entry.sourceId === "mun-royal-gazette-1811-fire-access-buoys" && entry.category === "navigation");
  const publicWorks = timeline.find((entry) => entry.sourceId === "mun-colonial-1811-public-works" && entry.category === "public works");
  assert.match(light.body, /March 15 through December 31/);
  assert.match(buoy.body, /under 100 tons/);
  assert.match(buoy.body, /charitable fund/);
  assert.match(publicWorks.body, /60 pounds paid to the Fire Society/);
  assert.match(publicWorks.body, /20 pounds for accurate fishery returns/);
});

test("1811 research preserves source hashes", () => {
  const record = fs.readFileSync(path.join(root, "research", "NP_1811_SYSTEM_RECORD.md"), "utf8");
  assert.match(record, /d8666edbb2692f4a00506fe43d9074a27138dd41d0afd03a8a38c6e544e12ca9/);
  assert.match(record, /05b80aea387dd0b59883ccc81019a343bb6a96cb9c02e6c8e0a21fd1bc41b08a/);
  assert.match(record, /bfc424c25bcc46a86c3bf691259dde7c2a945239d07b5df68c33031aa601276f/);
  assert.match(record, /936ddde8492161097979e20086cffce0052ee4d2c0539b08834a78355f79df51/);
});

test("1811 work item is complete", () => {
  const item = workItems.work_items.find((entry) => entry.id === "NPREG-217");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-216"]);
  assert.deepEqual(item.completion_evidence, [
    "research/NP_1811_SYSTEM_RECORD.md",
    "research/derived/np-1811-newspaper-issue-manifest.json",
    "src/data.js",
    "tests/np-1811-system.test.js"
  ]);
});
