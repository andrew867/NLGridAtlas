import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { sources, timeline } from "../src/data.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "research", "derived", "np-1808-newspaper-issue-manifest.json"), "utf8"));
const workItems = JSON.parse(fs.readFileSync(path.join(root, "docs", "work-items.json"), "utf8"));

test("1808 source records preserve exact URLs, pages and evidence states", () => {
  const expected = [
    ["mun-royal-gazette-1808-garrison-fuel-june", "https://dai.mun.ca/pdfs/royalgazette/TheRoyalGazette18080616.pdf", "physical PDF p. 1", "proposed"],
    ["mun-royal-gazette-1808-garrison-fuel-september", "https://dai.mun.ca/pdfs/royalgazette/TheRoyalGazette18080908.pdf", "physical PDF p. 3", "proposed"],
    ["mun-royal-gazette-1808-civic-presentment", "https://dai.mun.ca/pdfs/royalgazette/TheRoyalGazette18080728.pdf", "physical PDF p. 3", "proposed"],
    ["mun-royal-gazette-1808-ships-rooms-register", "https://dai.mun.ca/pdfs/royalgazette/TheRoyalGazette18081013.pdf", "physical PDF p. 4", "reported"],
    ["mun-royal-gazette-1808-fire-safety", "https://dai.mun.ca/pdfs/royalgazette/TheRoyalGazette18081103.pdf", "physical PDF p. 3", "proposed"],
    ["mun-royal-gazette-1808-ordnance-fuel", "https://dai.mun.ca/pdfs/royalgazette/TheRoyalGazette18081208.pdf", "physical PDF p. 3", "proposed"],
    ["mun-royal-gazette-1808-powder-magazine-finance", "https://dai.mun.ca/pdfs/royalgazette/TheRoyalGazette18081208.pdf", "physical PDF p. 3", "proposed"],
    ["mun-royal-gazette-1808-coastal-building-rule", "https://dai.mun.ca/pdfs/royalgazette/TheRoyalGazette18090420.pdf", "physical PDF p. 1", "reported"],
    ["mun-colonial-1808-public-works", "https://dai.mun.ca/PDFs/cns_colonia/A52_V01.pdf", "physical PDF pp. 268 to 269", "reported"],
    ["mun-colonial-1808-ships-rooms", "https://dai.mun.ca/PDFs/cns_colonia/A52_V01.pdf", "physical PDF p. 268", "reported"],
    ["mun-colonial-1808-fortifications", "https://dai.mun.ca/PDFs/cns_colonia/A52_V01.pdf", "physical PDF p. 268", "reported"],
    ["mun-colonial-1808-st-georges-coal", "https://dai.mun.ca/PDFs/cns_colonia/A52_V01.pdf", "physical PDF p. 269", "reported"]
  ];
  for (const [id, url, pages, status] of expected) {
    const source = sources.find((entry) => entry.id === id);
    assert.ok(source, id);
    assert.equal(source.url, url);
    assert.equal(source.pages, pages);
    assert.equal(source.status, status);
  }
});

test("1808 manifest preserves the 52-file weekly run", () => {
  assert.equal(manifest.year, 1808);
  assert.equal(manifest.issue_count, 52);
  assert.equal(manifest.physical_page_count, 210);
  const items = manifest.collections.flatMap((entry) => entry.items);
  assert.equal(items.length, 52);
  assert.equal(items.at(0)?.date, "18080107");
  assert.equal(items.at(-1)?.date, "18081229");
  for (const item of items) assert.match(item.sha256, /^[a-f0-9]{64}$/);

  const record = fs.readFileSync(path.join(root, "research", "NP_1808_SYSTEM_RECORD.md"), "utf8");
  assert.match(record, /52 dated 1808 archive files/);
  assert.match(record, /210 physical PDF pages/);
});

test("1808 civic and fire-safety proposals remain proposals", () => {
  const hospital = timeline.find((entry) => entry.sourceId === "mun-royal-gazette-1808-civic-presentment");
  const fire = timeline.find((entry) => entry.sourceId === "mun-royal-gazette-1808-fire-safety");
  const powder = timeline.find((entry) => entry.sourceId === "mun-royal-gazette-1808-powder-magazine-finance");
  assert.equal(hospital?.status, "proposed");
  assert.match(hospital.body, /Public Hospital/);
  assert.match(hospital.body, /additional burial ground/);
  assert.equal(fire?.status, "proposed");
  assert.match(fire.body, /Chain Rock/);
  assert.match(fire.body, /50-pound limit/);
  assert.equal(powder?.status, "proposed");
  assert.match(powder.body, /50 shares of £10/);
});

test("1808 supply quantities retain their delivery points and units", () => {
  const june = timeline.find((entry) => entry.sourceId === "mun-royal-gazette-1808-garrison-fuel-june");
  const september = timeline.find((entry) => entry.sourceId === "mun-royal-gazette-1808-garrison-fuel-september");
  const ordnance = timeline.find((entry) => entry.sourceId === "mun-royal-gazette-1808-ordnance-fuel");
  assert.match(june.body, /2,500 hogsheads/);
  assert.match(june.body, /3,200 pounds/);
  assert.match(september.body, /1,000 hogsheads/);
  assert.match(september.body, /2,000 pounds/);
  assert.match(ordnance.body, /150 cords/);
  assert.match(ordnance.body, /1,200 hogsheads/);
  assert.match(ordnance.body, /Fort Townshend, Signal Hill and the Ordnance Yard/);
});

test("1808 surveying and public works retain completion states", () => {
  const register = timeline.find((entry) => entry.sourceId === "mun-royal-gazette-1808-ships-rooms-register");
  const court = timeline.find((entry) => entry.sourceId === "mun-colonial-1808-public-works" && entry.status === "reported");
  const jail = timeline.find((entry) => entry.sourceId === "mun-colonial-1808-public-works" && entry.status === "proposed");
  assert.equal(register?.status, "reported");
  assert.match(register.body, /September 29, 1809/);
  assert.equal(court?.status, "reported");
  assert.match(court.body, /£200 payment/);
  assert.equal(jail?.status, "proposed");
  assert.match(jail.body, /£200/);
});

test("1808 research preserves source hashes and unresolved typesetting", () => {
  const record = fs.readFileSync(path.join(root, "research", "NP_1808_SYSTEM_RECORD.md"), "utf8");
  for (const hash of [
    "c661895a258647ffcfe8df394ce3a0ee6dc18e5d48344e0982b1c9351b231a21",
    "fb69501670cf35506619266e3ad9ac2d0ef0c759855d2544b543d3ef959ef2bd",
    "aafd0796958361c2e5d077e95e60bbce520e614b5be5f33cc4b61ca2ff5603b5",
    "66ab5c96890d556341f4bbee07f0806198a7a1f790909c94812d19a6195ba13c",
    "4cb294934e31a1adcb547a40a8dcf6ce6211c2e9db6536e9d7663fbc9e005e2b"
  ]) assert.match(record, new RegExp(hash));
  assert.match(record, /printed quantity reads `12,00 Hogsheads`/);
});

test("1808 work item is complete", () => {
  const item = workItems.work_items.find((entry) => entry.id === "NPREG-220");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-219"]);
  assert.deepEqual(item.completion_evidence, [
    "research/NP_1808_SYSTEM_RECORD.md",
    "research/derived/np-1808-newspaper-issue-manifest.json",
    "src/data.js",
    "tests/np-1808-system.test.js"
  ]);
});
