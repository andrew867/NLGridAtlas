import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { sources, timeline } from "../src/data.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "research", "derived", "np-1817-newspaper-issue-manifest.json"), "utf8"));
const workItems = JSON.parse(fs.readFileSync(path.join(root, "docs", "work-items.json"), "utf8"));

test("1817 source records preserve exact URLs, pages and evidence states", () => {
  const expected = [
    ["mun-mercantile-1817-brig-signal", "https://dai.mun.ca/pdfs/nl_mercantile/NewfoundlandMercantileJournal18170104no141.pdf", "physical PDF p. 3", "reported"],
    ["mun-royal-gazette-1817-april-fire", "https://dai.mun.ca/pdfs/royalgazette/TheRoyalGazette18170408.pdf", "physical PDF p. 3", "reported"],
    ["mun-mercantile-1817-light-establishment", "https://dai.mun.ca/pdfs/nl_mercantile/NewfoundlandMercantileJournal18170418no157.pdf", "physical PDF p. 3", "reported"],
    ["mun-mercantile-1817-fort-salutes", "https://dai.mun.ca/pdfs/nl_mercantile/NewfoundlandMercantileJournal18170606no164.pdf", "physical PDF p. 2", "reported"],
    ["mun-colonial-1817-fire-dispatches", "https://dai.mun.ca/PDFs/cns_colonia/A52_V03.pdf", "physical PDF pp. 93 to 99", "reported"],
    ["mun-royal-gazette-1817-nov7-fire", "https://dai.mun.ca/pdfs/royalgazette/TheRoyalGazette18171111.pdf", "physical PDF p. 3", "reported"],
    ["mun-royal-gazette-1817-november-fires", "https://dai.mun.ca/pdfs/royalgazette/TheRoyalGazette18171125.pdf", "physical PDF pp. 2 to 3", "reported"],
    ["mun-royal-gazette-1817-post-office", "https://dai.mun.ca/pdfs/royalgazette/TheRoyalGazette18171230.pdf", "physical PDF p. 3", "reported"],
    ["mun-colonial-1817-fortifications", "https://dai.mun.ca/PDFs/cns_colonia/A52_V03.pdf", "physical PDF pp. 100 to 104", "reported"],
    ["mun-colonial-1817-rebuilding-proposals", "https://dai.mun.ca/PDFs/cns_colonia/A52_V03.pdf", "physical PDF pp. 111 to 114", "proposed"]
  ];
  for (const [id, url, pages, status] of expected) {
    const source = sources.find((entry) => entry.id === id);
    assert.ok(source, id);
    assert.equal(source.year, 1817);
    assert.equal(source.url, url);
    assert.equal(source.pages, pages);
    assert.equal(source.status, status);
  }
});

test("1817 manifest preserves both newspaper collections and archive gaps", () => {
  assert.equal(manifest.year, 1817);
  assert.equal(manifest.issue_count, 93);
  assert.equal(manifest.physical_page_count, 356);
  assert.deepEqual(manifest.collections.map((entry) => [entry.name, entry.issue_count, entry.physical_page_count]), [
    ["Newfoundland Mercantile Journal", 25, 100],
    ["The Royal Gazette", 68, 256]
  ]);
  const items = manifest.collections.flatMap((entry) => entry.items);
  assert.equal(items.length, 93);
  for (const item of items) {
    assert.match(item.sha256, /^[a-f0-9]{64}$/);
  }
  const warnings = items.filter((entry) => entry.archive_note).map((entry) => [entry.filename, entry.archive_note]);
  assert.deepEqual(warnings, [
    ["TheRoyalGazette18171014SupplementMissingPage.pdf", "MUN filename marks a missing page"],
    ["TheRoyalGazette18171230SupplementMaybeMissingPage.pdf", "MUN filename marks a possible missing page"]
  ]);
});

test("1817 brig report does not invent the signal apparatus or vessel", () => {
  const event = timeline.find((entry) => entry.sourceId === "mun-mercantile-1817-brig-signal");
  assert.ok(event);
  assert.equal(event.date, "1817-01-03");
  assert.match(event.body, /drifted south past the harbour in a field of ice/);
  assert.match(event.body, /does not identify the signal apparatus or the vessel/);
});

test("1817 April fire preserves the alarm failure, deaths and unresolved cause", () => {
  const event = timeline.find((entry) => entry.sourceId === "mun-royal-gazette-1817-april-fire");
  assert.ok(event);
  assert.match(event.body, /fourteen people died/);
  assert.match(event.body, /Armed Association guard at the Court House gave the first general alarm/);
  assert.match(event.body, /drifting snow prevented the garrison from seeing their signals/);
  assert.match(event.body, /no cause could be assigned/);
});

test("1817 Light Establishment account preserves its operating categories", () => {
  const event = timeline.find((entry) => entry.sourceId === "mun-mercantile-1817-light-establishment");
  assert.ok(event);
  assert.match(event.body, /1812 through March 1817/);
  assert.match(event.body, /oil, wick, a lamp, carpenter work, a buoy, printing, carriage and attendant service/);
  assert.match(event.body, /Charles Grant's attendance and oil carriage/);
  assert.match(event.body, /Mary Hume's wick/);
});

test("1817 fort salute record preserves the separate garrison and ship actions", () => {
  const event = timeline.find((entry) => entry.sourceId === "mun-mercantile-1817-fort-salutes");
  assert.ok(event);
  assert.match(event.body, /guns at the different forts/);
  assert.match(event.body, /feu de joie/);
  assert.match(event.body, /HMS Pike separately fired a royal salute/);
});

test("1817 November fire reports remain separate rather than reconciled", () => {
  const event = timeline.find((entry) => entry.sourceId === "mun-colonial-1817-fire-dispatches" && entry.date === "1817-11-07");
  assert.ok(event);
  assert.match(event.body, /buildings were taken down/);
  assert.match(event.body, /Other storehouses were demolished/);
  assert.match(event.body, /upwards of 130 dwellings/);
  assert.match(event.body, /400,000 to 500,000 pounds/);
  const record = fs.readFileSync(path.join(root, "research", "NP_1817_SYSTEM_RECORD.md"), "utf8");
  assert.match(record, /at least 135 dwellings and not fewer than 1,100 occupants/);
  assert.match(record, /two dated reports, not one reconciled survey/);
});

test("1817 second fire keeps the Grand Jury opinion and ignition attempt distinct", () => {
  const fire = timeline.find((entry) => entry.sourceId === "mun-royal-gazette-1817-november-fires" && entry.date === "1817-11-21");
  const later = timeline.find((entry) => entry.sourceId === "mun-royal-gazette-1817-november-fires" && entry.date === "1817-11-25");
  assert.ok(fire);
  assert.ok(later);
  assert.match(fire.body, /55 dwellings/);
  assert.match(fire.body, /more than 500 people/);
  assert.match(fire.body, /at least 150,000 pounds/);
  assert.match(later.body, /solely to accident/);
  assert.match(later.body, /burning brands were found among shavings/);
  assert.match(later.body, /investigation was continuing/);
  assert.match(later.body, /later described the November 7 and 21 fires as unexplained/);
});

test("1817 fortification record preserves condition differences", () => {
  const event = timeline.find((entry) => entry.sourceId === "mun-colonial-1817-fortifications");
  assert.ok(event);
  assert.match(event.body, /Fort Townshend as dilapidated/);
  assert.match(event.body, /Gate Battery was in repair/);
  assert.match(event.body, /incomplete 60-yard stockade/);
  assert.match(event.body, /Fort Amherst was in good repair/);
  assert.match(event.body, /Frederick's Battery was serviceable but damp/);
});

test("1817 rebuilding work remains proposed", () => {
  const event = timeline.find((entry) => entry.sourceId === "mun-colonial-1817-rebuilding-proposals");
  assert.ok(event);
  assert.equal(event.status, "proposed");
  assert.match(event.body, /proposed a remote site/);
  assert.match(event.body, /stopped Martello tower project/);
  assert.match(event.body, /does not record completed buildings or enacted regulations/);
});

test("1817 Post Office relocation remains tied to its dated notice", () => {
  const event = timeline.find((entry) => entry.sourceId === "mun-royal-gazette-1817-post-office");
  assert.ok(event);
  assert.equal(event.date, "1817-12-26");
  assert.match(event.body, /moved temporarily/);
  assert.match(event.body, /Thomas Phippard, watchmaker/);
  assert.match(event.body, /burnt out on November 7/);
});

test("1817 research preserves coverage, hashes and page locators", () => {
  const record = fs.readFileSync(path.join(root, "research", "NP_1817_SYSTEM_RECORD.md"), "utf8");
  assert.match(record, /93 downloaded newspaper file URLs/);
  assert.match(record, /356 physical PDF pages/);
  assert.match(record, /115 physical pages/);
  assert.match(record, /2434a414b07e38ead5f209587739db502e08e8b7495d230000b612d9d2027762/);
  assert.match(record, /e6f9348b475eac8c223ed6946fc7115b562baeb28d602c14caf684b3fa0e078a/);
  assert.match(record, /physical PDF pp\. 93 to 99/);
  assert.match(record, /physical PDF pp\. 100 to 104/);
  assert.match(record, /physical PDF pp\. 111 to 114/);
});

test("1817 work item is complete", () => {
  const item = workItems.work_items.find((entry) => entry.id === "NPREG-211");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-210"]);
  assert.deepEqual(item.completion_evidence, [
    "research/NP_1817_SYSTEM_RECORD.md",
    "research/derived/np-1817-newspaper-issue-manifest.json",
    "src/data.js",
    "tests/np-1817-system.test.js"
  ]);
});
