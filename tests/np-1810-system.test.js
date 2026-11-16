import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { sources, timeline } from "../src/data.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "research", "derived", "np-1810-newspaper-issue-manifest.json"), "utf8"));
const workItems = JSON.parse(fs.readFileSync(path.join(root, "docs", "work-items.json"), "utf8"));

test("1810 source records preserve exact URLs, pages and evidence states", () => {
  const expected = [
    ["mun-royal-gazette-1810-roads-bridges", "https://dai.mun.ca/pdfs/royalgazette/TheRoyalGazette18100517.pdf", "physical PDF p. 4", "proposed"],
    ["mun-royal-gazette-1810-chapel-enlargement", "https://dai.mun.ca/pdfs/royalgazette/TheRoyalGazette18100614.pdf", "physical PDF p. 4", "reported"],
    ["mun-royal-gazette-1810-powder-magazine", "https://dai.mun.ca/pdfs/royalgazette/TheRoyalGazette18100614.pdf", "physical PDF p. 4", "proposed"],
    ["mun-royal-gazette-1810-freestone", "https://dai.mun.ca/pdfs/royalgazette/TheRoyalGazette18100823.pdf", "physical PDF p. 3", "proposed"],
    ["mun-royal-gazette-1810-narrows-signal", "https://dai.mun.ca/pdfs/royalgazette/TheRoyalGazette18100913.pdf", "physical PDF p. 3", "reported"],
    ["mun-royal-gazette-1810-property-register", "https://dai.mun.ca/pdfs/royalgazette/TheRoyalGazette18100927.pdf", "physical PDF p. 4", "reported"],
    ["mun-royal-gazette-1810-ordnance-firewood", "https://dai.mun.ca/pdfs/royalgazette/TheRoyalGazette18101122.pdf", "physical PDF p. 1", "proposed"],
    ["mun-royal-gazette-1810-ordnance-wharf", "https://dai.mun.ca/pdfs/royalgazette/TheRoyalGazette18101122.pdf", "physical PDF p. 3", "proposed"],
    ["mun-colonial-1810-fishing-rooms", "https://dai.mun.ca/PDFs/cns_colonia/A52_V01.pdf", "physical PDF p. 313", "reported"],
    ["mun-colonial-1810-government-house", "https://dai.mun.ca/PDFs/cns_colonia/A52_V01.pdf", "physical PDF pp. 328 to 329", "proposed"]
  ];
  for (const [id, url, pages, status] of expected) {
    const source = sources.find((entry) => entry.id === id);
    assert.ok(source, id);
    assert.equal(source.year, 1810);
    assert.equal(source.url, url);
    assert.equal(source.pages, pages);
    assert.equal(source.status, status);
  }
});

test("1810 manifest preserves incomplete physical-page coverage", () => {
  assert.equal(manifest.year, 1810);
  assert.equal(manifest.issue_count, 34);
  assert.equal(manifest.physical_page_count, 130);
  const items = manifest.collections.flatMap((entry) => entry.items);
  assert.equal(items.length, 34);
  for (const item of items) assert.match(item.sha256, /^[a-f0-9]{64}$/);
  assert.equal(items.find((item) => item.filename === "TheRoyalGazette18100607Page34Missing.pdf")?.physical_page_count, 2);
  assert.equal(items.find((item) => item.filename === "TheRoyalGazette18101004.pdf")?.physical_page_count, 1);
  assert.equal(items.find((item) => item.filename === "TheRoyalGazette18101213.pdf")?.physical_page_count, 3);

  const record = fs.readFileSync(path.join(root, "research", "NP_1810_SYSTEM_RECORD.md"), "utf8");
  assert.match(record, /34 dated 1810 archive files/);
  assert.match(record, /130 surviving physical PDF pages/);
  assert.match(record, /Page34Missing/);
  assert.match(record, /not treated as a complete run/);
});

test("1810 tenders and repair requests remain proposed", () => {
  const roads = timeline.find((entry) => entry.sourceId === "mun-royal-gazette-1810-roads-bridges");
  const powder = timeline.find((entry) => entry.sourceId === "mun-royal-gazette-1810-powder-magazine");
  const wharf = timeline.find((entry) => entry.sourceId === "mun-royal-gazette-1810-ordnance-wharf");
  const governmentHouse = timeline.find((entry) => entry.sourceId === "mun-colonial-1810-government-house");
  assert.equal(roads?.status, "proposed");
  assert.equal(powder?.status, "proposed");
  assert.equal(wharf?.status, "proposed");
  assert.equal(governmentHouse?.status, "proposed");
  assert.match(wharf.body, /plan and description/);
  assert.match(governmentHouse.body, /plan, section and elevation/);
});

test("1810 operational records retain quantities and functions", () => {
  const freestone = timeline.find((entry) => entry.sourceId === "mun-royal-gazette-1810-freestone");
  const signal = timeline.find((entry) => entry.sourceId === "mun-royal-gazette-1810-narrows-signal");
  const fuel = timeline.find((entry) => entry.sourceId === "mun-royal-gazette-1810-ordnance-firewood");
  const survey = timeline.find((entry) => entry.sourceId === "mun-colonial-1810-land-survey");
  const rooms = timeline.find((entry) => entry.sourceId === "mun-colonial-1810-fishing-rooms");
  assert.match(freestone.body, /1,000 tons/);
  assert.match(signal.body, /charge for the shots/);
  assert.match(fuel.body, /150 cords/);
  assert.match(fuel.body, /Fort Townshend, Signal Hill and the Ordnance Fuel Yard/);
  assert.match(survey.body, /25 pounds per year/);
  assert.match(rooms.body, /three 1810 perambulations/i);
});

test("1810 public works retain reported amounts without converting them to completions", () => {
  const hospital = timeline.find((entry) => entry.sourceId === "mun-colonial-1810-hospital");
  const regional = timeline.find((entry) => entry.sourceId === "mun-colonial-1810-regional-public-works");
  const fire = timeline.find((entry) => entry.sourceId === "mun-colonial-1810-fire-society");
  assert.equal(hospital?.status, "proposed");
  assert.match(hospital.body, /700 pounds/);
  assert.match(regional.body, /Trinity church as ruined/);
  assert.match(regional.body, /Greenspond had subscribed 200 pounds/);
  assert.equal(fire?.status, "reported");
  assert.match(fire.body, /Court of Sessions records/);
});

test("1810 research preserves source hashes", () => {
  const record = fs.readFileSync(path.join(root, "research", "NP_1810_SYSTEM_RECORD.md"), "utf8");
  assert.match(record, /500519659e308f91bdf6f291a583b3189959583aa57b4eedf17cf38677e8b693/);
  assert.match(record, /07b27ac4685948d1b055cbd15be112ee5137aeb92ae2a0897755991345361c07/);
  assert.match(record, /6a6bb0d67bdb8aa721a545960e6b30122df1743c28d1e35a81cae47ab537c150/);
  assert.match(record, /4cb294934e31a1adcb547a40a8dcf6ce6211c2e9db6536e9d7663fbc9e005e2b/);
  assert.match(record, /aaa6e9dd3d2de89c07c9a1ebd027a08924c60ee83477dc3f1dc4a8365053ac51/);
});

test("1810 work item is complete", () => {
  const item = workItems.work_items.find((entry) => entry.id === "NPREG-218");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-217"]);
  assert.deepEqual(item.completion_evidence, [
    "research/NP_1810_SYSTEM_RECORD.md",
    "research/derived/np-1810-newspaper-issue-manifest.json",
    "src/data.js",
    "tests/np-1810-system.test.js"
  ]);
});
