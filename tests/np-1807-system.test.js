import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { sources, timeline } from "../src/data.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "research", "derived", "np-1807-newspaper-issue-manifest.json"), "utf8"));
const workItems = JSON.parse(fs.readFileSync(path.join(root, "docs", "work-items.json"), "utf8"));

test("1807 source records preserve exact URLs, pages and evidence states", () => {
  const expected = [
    ["mun-royal-gazette-1807-garrison-timber", "https://dai.mun.ca/pdfs/royalgazette/TheRoyalGazette18071001.pdf", "physical PDF p. 4", "proposed"],
    ["mun-royal-gazette-1807-barrack-furniture", "https://dai.mun.ca/pdfs/royalgazette/TheRoyalGazette18071105.pdf", "physical PDF p. 3", "proposed"],
    ["mun-royal-gazette-1807-convoy-signals", "https://dai.mun.ca/pdfs/royalgazette/TheRoyalGazette18071105.pdf", "physical PDF p. 3", "reported"],
    ["mun-colonial-1807-convoy", "https://dai.mun.ca/PDFs/cns_colonia/A52_V01.pdf", "physical PDF p. 237", "reported"],
    ["mun-colonial-1807-public-buildings", "https://dai.mun.ca/PDFs/cns_colonia/A52_V01.pdf", "physical PDF pp. 238 to 240", "reported"]
  ];
  for (const [id, url, pages, status] of expected) {
    const source = sources.find((entry) => entry.id === id);
    assert.ok(source, id);
    assert.equal(source.url, url);
    assert.equal(source.pages, pages);
    assert.equal(source.status, status);
  }
});

test("1807 manifest preserves the surviving newspaper run", () => {
  assert.equal(manifest.year, 1807);
  assert.equal(manifest.issue_count, 17);
  assert.equal(manifest.physical_page_count, 66);
  const items = manifest.collections.flatMap((entry) => entry.items);
  assert.equal(items.length, 17);
  assert.equal(items.at(0)?.date, "18070910Page12Missing");
  assert.equal(items.at(0)?.physical_page_count, 2);
  assert.equal(items.at(-1)?.date, "18071231");
  for (const item of items) assert.match(item.sha256, /^[a-f0-9]{64}$/);

  const record = fs.readFileSync(path.join(root, "research", "NP_1807_SYSTEM_RECORD.md"), "utf8");
  assert.match(record, /17 dated 1807 archive files/);
  assert.match(record, /66 surviving physical PDF pages/);
  assert.match(record, /pages 1 and 2 are missing/);
});

test("1807 signal code retains pendant positions and destinations", () => {
  const signal = timeline.find((entry) => entry.sourceId === "mun-royal-gazette-1807-convoy-signals");
  assert.equal(signal?.status, "reported");
  assert.match(signal.body, /blue pendant below/);
  assert.match(signal.body, /England convoy/);
  assert.match(signal.body, /blue pendant above/);
  assert.match(signal.body, /Portugal convoy/);
});

test("1807 public-building records preserve amounts and completion states", () => {
  const court = timeline.find((entry) => entry.title === "Harbour Grace sought government aid for court buildings");
  const repair = timeline.find((entry) => entry.title === "Harbour Grace church and parsonage were under repair");
  const school = timeline.find((entry) => entry.title === "St. John's school house carried debt of £300 and upwards");
  const fogo = timeline.find((entry) => entry.title === "Fogo inhabitants had built a worship house");
  assert.equal(court?.status, "proposed");
  assert.match(court.body, /£789/);
  assert.match(court.body, /£400/);
  assert.equal(repair?.status, "reported");
  assert.match(repair.body, /£50/);
  assert.equal(school?.status, "reported");
  assert.match(school.body, /£300 and upwards/);
  assert.match(school.body, /£20 annual salary/);
  assert.equal(fogo?.status, "reported");
  assert.match(fogo.body, /about 400/);
  assert.match(fogo.body, /£15 annual allowance/);
});

test("1807 tenders retain physical specifications", () => {
  const timber = timeline.find((entry) => entry.sourceId === "mun-royal-gazette-1807-garrison-timber");
  const furniture = timeline.find((entry) => entry.sourceId === "mun-royal-gazette-1807-barrack-furniture");
  assert.equal(timber?.status, "proposed");
  assert.match(timber.body, /pine or spruce scantling/);
  assert.match(timber.body, /King's Wharf/);
  assert.equal(furniture?.status, "proposed");
  assert.match(furniture.body, /eight deal tables/);
  assert.match(furniture.body, /4\.5 feet long and 3 feet wide/);
  assert.match(furniture.body, /16 stools/);
});

test("1807 research preserves source hashes", () => {
  const record = fs.readFileSync(path.join(root, "research", "NP_1807_SYSTEM_RECORD.md"), "utf8");
  for (const hash of [
    "c6f565267f23288b34f18bb739b452357a14e19b5dd6547792c9977f7f4a7cf2",
    "b65ea72fa3ea7d449833e5f0dd2ed6d468c3c7220420b08a4b8c3d2c91bfa1b2",
    "4cb294934e31a1adcb547a40a8dcf6ce6211c2e9db6536e9d7663fbc9e005e2b",
    "05f99896a14880febcff6448b4930a2cdffb0a19b900b8153a40fd676879b142"
  ]) assert.match(record, new RegExp(hash));
});

test("1807 work item is complete", () => {
  const item = workItems.work_items.find((entry) => entry.id === "NPREG-221");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-220"]);
  assert.deepEqual(item.completion_evidence, [
    "research/NP_1807_SYSTEM_RECORD.md",
    "research/derived/np-1807-newspaper-issue-manifest.json",
    "src/data.js",
    "tests/np-1807-system.test.js"
  ]);
});
