import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { sources, timeline } from "../src/data.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "research", "derived", "np-1809-newspaper-issue-manifest.json"), "utf8"));
const workItems = JSON.parse(fs.readFileSync(path.join(root, "docs", "work-items.json"), "utf8"));

test("1809 source records preserve exact URLs, pages and evidence states", () => {
  const expected = [
    ["mun-royal-gazette-1809-fish-market", "https://dai.mun.ca/pdfs/royalgazette/TheRoyalGazette18090601.pdf", "physical PDF p. 4", "reported"],
    ["mun-royal-gazette-1809-ordnance-materials", "https://dai.mun.ca/pdfs/royalgazette/TheRoyalGazette18090720.pdf", "physical PDF p. 3", "proposed"],
    ["mun-royal-gazette-1809-powder-magazine", "https://dai.mun.ca/pdfs/royalgazette/TheRoyalGazette18090720.pdf", "physical PDF p. 4", "proposed"],
    ["mun-royal-gazette-1809-freestone", "https://dai.mun.ca/pdfs/royalgazette/TheRoyalGazette18090928.pdf", "physical PDF p. 4", "proposed"],
    ["mun-royal-gazette-1809-harbour-signals", "https://dai.mun.ca/pdfs/royalgazette/TheRoyalGazette18090928.pdf", "physical PDF p. 4", "reported"],
    ["mun-royal-gazette-1809-lottery", "https://dai.mun.ca/pdfs/royalgazette/TheRoyalGazette18091130.pdf", "physical PDF p. 1", "proposed"],
    ["mun-royal-gazette-1809-post-office", "https://dai.mun.ca/pdfs/royalgazette/TheRoyalGazette18091214.pdf", "physical PDF p. 4", "reported"],
    ["mun-colonial-1809-public-works", "https://dai.mun.ca/PDFs/cns_colonia/A52_V01.pdf", "physical PDF p. 286", "reported"],
    ["mun-colonial-1809-ships-rooms-survey", "https://dai.mun.ca/PDFs/cns_colonia/A52_V01.pdf", "physical PDF pp. 288 to 290", "reported"],
    ["mun-colonial-1809-fortifications", "https://dai.mun.ca/PDFs/cns_colonia/A52_V01.pdf", "physical PDF pp. 290 and 297", "reported"]
  ];
  for (const [id, url, pages, status] of expected) {
    const source = sources.find((entry) => entry.id === id);
    assert.ok(source, id);
    assert.equal(source.year, 1809);
    assert.equal(source.url, url);
    assert.equal(source.pages, pages);
    assert.equal(source.status, status);
  }
});

test("1809 manifest preserves the mixed physical-page run", () => {
  assert.equal(manifest.year, 1809);
  assert.equal(manifest.issue_count, 51);
  assert.equal(manifest.physical_page_count, 210);
  const items = manifest.collections.flatMap((entry) => entry.items);
  assert.equal(items.length, 51);
  for (const item of items) assert.match(item.sha256, /^[a-f0-9]{64}$/);
  for (const date of ["18090914", "18090921", "18090928", "18091005"]) {
    assert.equal(items.find((item) => item.date === date)?.physical_page_count, 6);
  }
  assert.equal(items.find((item) => item.date === "18091221")?.physical_page_count, 2);

  const record = fs.readFileSync(path.join(root, "research", "NP_1809_SYSTEM_RECORD.md"), "utf8");
  assert.match(record, /51 dated 1809 archive files/);
  assert.match(record, /210 surviving physical PDF pages/);
  assert.match(record, /not treated as a complete run/);
});

test("1809 tenders remain proposed while operating systems remain reported", () => {
  const fish = timeline.find((entry) => entry.sourceId === "mun-royal-gazette-1809-fish-market");
  const timber = timeline.find((entry) => entry.sourceId === "mun-royal-gazette-1809-ordnance-materials");
  const powder = timeline.find((entry) => entry.sourceId === "mun-royal-gazette-1809-powder-magazine");
  const stone = timeline.find((entry) => entry.sourceId === "mun-royal-gazette-1809-freestone");
  assert.equal(fish?.status, "reported");
  assert.equal(timber?.status, "proposed");
  assert.equal(powder?.status, "proposed");
  assert.equal(stone?.status, "proposed");
  assert.match(fish.body, /three boats/);
  assert.match(timber.body, /100,000 prime shingles/);
  assert.match(powder.body, /plan and description/);
  assert.match(stone.body, /3,000 tons/);
});

test("1809 communication records retain their operating details", () => {
  const signal = timeline.find((entry) => entry.sourceId === "mun-royal-gazette-1809-harbour-signals");
  const post = timeline.find((entry) => entry.sourceId === "mun-royal-gazette-1809-post-office");
  assert.equal(signal?.status, "reported");
  assert.match(signal.body, /night signal/);
  assert.match(signal.body, /Fort William and Amherst Tower/);
  assert.equal(post?.status, "reported");
  assert.match(post.body, /one penny per letter/);
  assert.match(post.body, /two pence/);
});

test("1809 public works preserve amounts and completion states", () => {
  const works = timeline.find((entry) => entry.sourceId === "mun-colonial-1809-public-works");
  const survey = timeline.find((entry) => entry.sourceId === "mun-colonial-1809-ships-rooms-survey" && entry.status === "proposed");
  const fort = timeline.find((entry) => entry.sourceId === "mun-colonial-1809-fortifications" && entry.pages === "physical PDF p. 297");
  assert.equal(works?.status, "reported");
  assert.match(works.body, /£500/);
  assert.match(works.body, /£100/);
  assert.match(works.body, /£80/);
  assert.equal(survey?.status, "proposed");
  assert.match(survey.body, /£50/);
  assert.equal(fort?.status, "reported");
  assert.match(fort.body, /remained ruinous/);
});

test("1809 lottery arithmetic is internally consistent", () => {
  const lottery = timeline.find((entry) => entry.sourceId === "mun-royal-gazette-1809-lottery");
  assert.equal(lottery?.status, "proposed");
  assert.match(lottery.body, /600 five-dollar tickets/);
  assert.match(lottery.body, /59 prizes totalling 1,800 dollars/);
  assert.match(lottery.body, /541 blanks/);
  assert.equal(59 + 541, 600);
  assert.equal(30 * 10 + 20 * 20 + 4 * 50 + 3 * 100 + 1 * 200 + 1 * 400, 1800);
});

test("1809 research preserves source hashes", () => {
  const record = fs.readFileSync(path.join(root, "research", "NP_1809_SYSTEM_RECORD.md"), "utf8");
  assert.match(record, /4610d90a494d77d2e0768e2b905bce46d07dcb8b2655d7bf20f837f76deeff6e/);
  assert.match(record, /8daa331579ebce49928ca2c71715a4c2a9d971775d7154245a056f04f0637b34/);
  assert.match(record, /4cb294934e31a1adcb547a40a8dcf6ce6211c2e9db6536e9d7663fbc9e005e2b/);
  assert.match(record, /93e72f5700c62240de4b4c4157d8b9bc633ded0bcaa27b4de6bc3e7c9ac62f43/);
});

test("1809 work item is complete", () => {
  const item = workItems.work_items.find((entry) => entry.id === "NPREG-219");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-218"]);
  assert.deepEqual(item.completion_evidence, [
    "research/NP_1809_SYSTEM_RECORD.md",
    "research/derived/np-1809-newspaper-issue-manifest.json",
    "src/data.js",
    "tests/np-1809-system.test.js"
  ]);
});
