import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { sources, timeline } from "../src/data.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "research", "derived", "np-1819-newspaper-issue-manifest.json"), "utf8"));
const workItems = JSON.parse(fs.readFileSync(path.join(root, "docs", "work-items.json"), "utf8"));

test("1819 source records preserve exact issue URLs and physical pages", () => {
  const expected = [
    ["mun-mercantile-1819-fort-firewood", "18190107no247", "physical PDF p. 3"],
    ["mun-mercantile-1819-pilot-regulation", "18190114no248", "physical PDF p. 3"],
    ["mun-mercantile-1819-electric-matter", "18190121no249", "physical PDF p. 2"],
    ["mun-mercantile-1819-fort-amherst-signal", "18190128no250", "physical PDF p. 3"],
    ["mun-mercantile-1819-carnation-distress", "18190304no255", "physical PDF p. 2"],
    ["mun-mercantile-1819-freshwater-rescue", "18190408no260", "physical PDF p. 2"],
    ["mun-mercantile-1819-fire-engine", "18190527no267", "physical PDF p. 3"],
    ["mun-mercantile-1819-water-street-fire", "18190729no276", "physical PDF p. 2"]
  ];
  for (const [id, issue, pages] of expected) {
    const source = sources.find((entry) => entry.id === id);
    assert.ok(source, id);
    assert.equal(source.year, 1819);
    assert.equal(source.status, "reported");
    assert.equal(source.pages, pages);
    assert.equal(source.url, `https://dai.mun.ca/pdfs/nl_mercantile/NewfoundlandMercantileJournal${issue}.pdf`);
  }
});

test("1819 manifest preserves the 46 surviving MUN DAI issues", () => {
  assert.equal(manifest.year, 1819);
  assert.equal(manifest.issue_count, 46);
  assert.deepEqual(manifest.collections.map((entry) => [entry.name, entry.issue_count]), [
    ["Newfoundland Mercantile Journal", 46]
  ]);
  const items = manifest.collections.flatMap((entry) => entry.items);
  assert.equal(items.length, 46);
  assert.equal(items[0].date, "18190107");
  assert.equal(items.at(-1).date, "18191230");
  for (const missing of ["18190429", "18190715", "18190722", "18190805", "18191028", "18191209"]) {
    assert.equal(items.some((entry) => entry.date === missing), false, missing);
  }
  for (const item of items) {
    assert.match(item.sha256, /^[a-f0-9]{64}$/);
  }
});

test("1819 issue preserves the repeated fort fuel notice without a duplicate event", () => {
  const source = sources.find((entry) => entry.id === "mun-mercantile-1819-fort-firewood");
  assert.ok(source);
  assert.equal(source.pages, "physical PDF p. 3");
  assert.equal(timeline.some((entry) => entry.sourceId === source.id), false);
});

test("1819 pilot record keeps private rules and Hoyles opinion distinct from completed work", () => {
  const event = timeline.find((entry) => entry.sourceId === "mun-mercantile-1819-pilot-regulation");
  assert.ok(event);
  assert.match(event.body, /merchant arrangement/);
  assert.match(event.body, /not legally enforceable/);
  assert.match(event.body, /his opinion, not a documented expenditure or completed work/);
});

test("1819 Fort Amherst record preserves the signal rule and incident decision", () => {
  const event = timeline.find((entry) => entry.sourceId === "mun-mercantile-1819-fort-amherst-signal");
  assert.ok(event);
  assert.equal(event.date, "1819-01-12");
  assert.match(event.body, /red pendant over a yellow pendant with a gun/);
  assert.match(event.body, /repeated guns for great danger/);
  assert.match(event.body, /did not make the distress signal/);
});

test("1819 electrical context is not presented as local apparatus or measurement", () => {
  const event = timeline.find((entry) => entry.sourceId === "mun-mercantile-1819-electric-matter");
  assert.ok(event);
  assert.equal(event.category, "electrical context");
  assert.match(event.body, /not a Newfoundland electrical installation or local measurement/);
});

test("1819 vessel distress and boat rescue remain separate records", () => {
  const ship = timeline.find((entry) => entry.sourceId === "mun-mercantile-1819-carnation-distress");
  const rescue = timeline.find((entry) => entry.sourceId === "mun-mercantile-1819-freshwater-rescue");
  assert.ok(ship);
  assert.ok(rescue);
  assert.equal(ship.date, "1819-03-04");
  assert.equal(rescue.date, "1819-04-08");
  assert.match(ship.body, /HMS Carnation/);
  assert.match(rescue.body, /Joseph Gribble/);
});

test("1819 customs fire engine remains unassigned and separate from July engines", () => {
  const arrival = timeline.find((entry) => entry.sourceId === "mun-mercantile-1819-fire-engine");
  const fire = timeline.find((entry) => entry.sourceId === "mun-mercantile-1819-water-street-fire");
  assert.ok(arrival);
  assert.ok(fire);
  assert.match(arrival.body, /does not name the purchaser, owner, operator or installation site/);
  assert.match(arrival.body, /does not connect the engine/);
  assert.match(fire.body, /Mr\. Bennett's engine/);
  assert.match(fire.body, /Ordnance Department engine/);
  assert.match(fire.body, /small patent engine belonging to his house/);
  assert.match(fire.body, /60-foot open space/);
  assert.match(fire.body, /more than 1,100 people/);
});

test("1819 research retains archive limits and source hashes", () => {
  const record = fs.readFileSync(path.join(root, "research", "NP_1819_SYSTEM_RECORD.md"), "utf8");
  assert.match(record, /does not establish the complete signal code for the harbour/);
  assert.match(record, /cannot be assigned to the Ordnance Department engine or Mr\. Job's patent engine/);
  assert.match(record, /The MUN DAI .*Royal Gazette.* collection has no digitized 1819 issue/);
  assert.match(record, /c46c59b1b9eb3cddf44c5b5462a34084bac075dfe0570fa25c9d4a48ddce5bc7/);
});

test("1819 work item is complete", () => {
  const item = workItems.work_items.find((entry) => entry.id === "NPREG-209");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-208"]);
  assert.deepEqual(item.completion_evidence, [
    "research/NP_1819_SYSTEM_RECORD.md",
    "research/derived/np-1819-newspaper-issue-manifest.json",
    "src/data.js",
    "tests/np-1819-system.test.js"
  ]);
});
