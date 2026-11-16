import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { sources, timeline } from "../src/data.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "research", "derived", "np-1815-newspaper-issue-manifest.json"), "utf8"));
const workItems = JSON.parse(fs.readFileSync(path.join(root, "docs", "work-items.json"), "utf8"));

test("1815 source records preserve exact URLs, pages and evidence states", () => {
  const expected = [
    ["mun-royal-gazette-1815-fort-fuel", "https://dai.mun.ca/pdfs/royalgazette/TheRoyalGazette18150105.pdf", "physical PDF p. 3", "reported"],
    ["mun-royal-gazette-1815-fire-readiness", "https://dai.mun.ca/pdfs/royalgazette/TheRoyalGazette18150202.pdf", "physical PDF p. 3", "reported"],
    ["mun-colonial-1815-fort-signals", "https://dai.mun.ca/PDFs/cns_colonia/A52_V02.pdf", "physical PDF pp. 88 to 95 and 105 to 108", "reported"],
    ["mun-royal-gazette-1815-kings-beach-sewer", "https://dai.mun.ca/pdfs/royalgazette/TheRoyalGazette18150831.pdf", "physical PDF p. 2", "proposed"],
    ["mun-colonial-1815-survey-record-office", "https://dai.mun.ca/PDFs/cns_colonia/A52_V02.pdf", "physical PDF pp. 127, 129 and 133", "reported"]
  ];
  for (const [id, url, pages, status] of expected) {
    const source = sources.find((entry) => entry.id === id);
    assert.ok(source, id);
    assert.equal(source.year, 1815);
    assert.equal(source.url, url);
    assert.equal(source.pages, pages);
    assert.equal(source.status, status);
  }
});

test("1815 manifest preserves the surviving Royal Gazette coverage", () => {
  assert.equal(manifest.year, 1815);
  assert.equal(manifest.issue_count, 50);
  assert.equal(manifest.physical_page_count, 200);
  assert.deepEqual(manifest.collections.map((entry) => [entry.name, entry.issue_count, entry.physical_page_count]), [
    ["The Royal Gazette", 50, 200]
  ]);
  const items = manifest.collections.flatMap((entry) => entry.items);
  assert.equal(items.length, 50);
  for (const item of items) {
    assert.match(item.sha256, /^[a-f0-9]{64}$/);
  }
});

test("1815 fort fuel allocation totals 150 cords", () => {
  const event = timeline.find((entry) => entry.sourceId === "mun-royal-gazette-1815-fort-fuel");
  assert.ok(event);
  assert.match(event.body, /80 cords to Fort Townshend/);
  assert.match(event.body, /40 cords to Fort William/);
  assert.match(event.body, /30 cords to Signal Hill/);
  assert.equal(80 + 40 + 30, 150);
});

test("1815 fire-readiness record preserves the specified equipment and storage controls", () => {
  const event = timeline.find((entry) => entry.sourceId === "mun-royal-gazette-1815-fire-readiness");
  assert.ok(event);
  assert.equal(event.date, "1815-02-02");
  assert.match(event.body, /ladder from ground to eaves/);
  assert.match(event.body, /second ladder fixed to the roof/);
  assert.match(event.body, /two marked leather fire buckets/);
  assert.match(event.body, /gunpowder to be stored in the magazine/);
});

test("1815 March signal record retains the source's relative date wording", () => {
  const event = timeline.find((entry) => entry.sourceId === "mun-colonial-1815-fort-signals" && entry.date === "1815-03-21");
  assert.ok(event);
  assert.match(event.body, /night following the 16th/);
  assert.match(event.body, /Fort William/);
  assert.match(event.body, /Fort Townshend and Signal Hill/);
  assert.doesNotMatch(event.body, /March 17/);
});

test("1815 May response record separates fort signals and reported patrol quantities", () => {
  const event = timeline.find((entry) => entry.sourceId === "mun-colonial-1815-fort-signals" && entry.date === "1815-05-06");
  assert.ok(event);
  assert.match(event.body, /on a signal, a company from each fort would come to town/);
  assert.match(event.body, /about 90 special constables/);
  assert.match(event.body, /nightly 24-person patrol in two divisions/);
});

test("1815 King's Beach sewer remains proposed", () => {
  const event = timeline.find((entry) => entry.sourceId === "mun-royal-gazette-1815-kings-beach-sewer");
  assert.ok(event);
  assert.equal(event.status, "proposed");
  assert.match(event.body, /sought proposals to construct and complete/);
  assert.match(event.body, /does not report that construction was completed/);
});

test("1815 research preserves coverage, hashes and the missing fort attachment", () => {
  const record = fs.readFileSync(path.join(root, "research", "NP_1815_SYSTEM_RECORD.md"), "utf8");
  assert.match(record, /50 surviving 1815 files/);
  assert.match(record, /200 physical PDF pages/);
  assert.match(record, /144 physical pages/);
  assert.match(record, /1986bcb76525bfe19b3b410ad9cabf803bd69e92c1e1c23e92c51d14c6a80458/);
  assert.match(record, /6a108f6f9a7acae9935c55cb0f52d174c0241a6552e4f745ac729ffb5ba4837f/);
  assert.match(record, /attached report is absent from the reproduced volume/);
  assert.match(record, /No 1815 fort condition claim is taken from the missing attachment/);
});

test("1815 work item is complete", () => {
  const item = workItems.work_items.find((entry) => entry.id === "NPREG-213");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-212"]);
  assert.deepEqual(item.completion_evidence, [
    "research/NP_1815_SYSTEM_RECORD.md",
    "research/derived/np-1815-newspaper-issue-manifest.json",
    "src/data.js",
    "tests/np-1815-system.test.js"
  ]);
});
