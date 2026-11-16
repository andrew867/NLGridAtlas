import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { sources, timeline } from "../src/data.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "research", "derived", "np-1820-newspaper-issue-manifest.json"), "utf8"));
const workItems = JSON.parse(fs.readFileSync(path.join(root, "docs", "work-items.json"), "utf8"));

test("1820 Active record preserves pilot-boat assistance and overland letters", () => {
  const event = timeline.find((entry) => entry.sourceId === "mun-mercantile-1820-active-letters");
  assert.ok(event);
  assert.equal(event.date, "1820-01-20");
  assert.equal(event.category, "communications");
  assert.match(event.body, /split her sails in a gale/);
  assert.match(event.body, /went ashore and lost her rudder/);
  assert.match(event.body, /pilot boat went from St\. John's/);
  assert.match(event.body, /Halifax letters.*brought overland/);
  assert.doesNotMatch(event.body, /telegraph|electric/i);
});

test("1820 firewood tender preserves the three named allocations", () => {
  const event = timeline.find((entry) => entry.sourceId === "mun-mercantile-1820-fort-firewood");
  assert.ok(event);
  assert.equal(event.date, "1820-01-17");
  assert.equal(event.category, "operations");
  assert.match(event.body, /400 cords of fir firewood/);
  assert.match(event.body, /Fort William, 150 cords/);
  assert.match(event.body, /Fort Townshend, 200 cords/);
  assert.match(event.body, /Signal Hill, 50 cords/);
  assert.match(event.body, /two sureties/);
});

test("1820 fire record keeps the two incidents separate", () => {
  const event = timeline.find((entry) => entry.sourceId === "mun-mercantile-1820-fires");
  assert.ok(event);
  assert.equal(event.date, "1820-02-24");
  assert.equal(event.category, "fire response");
  assert.match(event.body, /house behind Fort William/);
  assert.match(event.body, /Methodist Chapel/);
  assert.match(event.body, /alarm was given immediately/);
  assert.match(event.body, /five feet square/);
  assert.doesNotMatch(event.title, /February 20/);
});

test("1820 sources retain exact issue URLs and physical pages", () => {
  const active = sources.find((entry) => entry.id === "mun-mercantile-1820-active-letters");
  const fuel = sources.find((entry) => entry.id === "mun-mercantile-1820-fort-firewood");
  const fires = sources.find((entry) => entry.id === "mun-mercantile-1820-fires");
  assert.ok(active);
  assert.ok(fuel);
  assert.ok(fires);
  assert.equal(active.year, 1820);
  assert.equal(active.pages, "physical PDF p. 3");
  assert.equal(fuel.pages, "physical PDF p. 3");
  assert.equal(fires.pages, "physical PDF p. 3");
  assert.equal(active.url, "https://dai.mun.ca/pdfs/nl_mercantile/NewfoundlandMercantileJournal18200120no301.pdf");
  assert.equal(fuel.url, active.url);
  assert.equal(fires.url, "https://dai.mun.ca/pdfs/nl_mercantile/NewfoundlandMercantileJournal18200224no306.pdf");
});

test("1820 manifest preserves the 46 surviving MUN DAI issues", () => {
  assert.equal(manifest.year, 1820);
  assert.equal(manifest.issue_count, 46);
  assert.equal(manifest.collections.length, 1);
  assert.deepEqual(manifest.collections.map((entry) => [entry.name, entry.issue_count]), [
    ["Newfoundland Mercantile Journal", 46]
  ]);
  const items = manifest.collections.flatMap((entry) => entry.items);
  assert.equal(items.length, 46);
  assert.equal(items[0].date, "18200113");
  assert.equal(items.at(-1).date, "18201228");
  for (const missing of ["18200106", "18200210", "18200302", "18200622", "18200824", "18201109"]) {
    assert.equal(items.some((entry) => entry.date === missing), false, missing);
  }
  for (const item of items) {
    assert.match(item.url, /^https:\/\/dai\.mun\.ca\/pdfs\/nl_mercantile\/NewfoundlandMercantileJournal1820\d{4}no\d+\.pdf$/);
    assert.match(item.sha256, /^[a-f0-9]{64}$/);
  }
});

test("1820 research preserves geographic and evidence boundaries", () => {
  const record = fs.readFileSync(path.join(root, "research", "NP_1820_SYSTEM_RECORD.md"), "utf8");
  assert.match(record, /does not identify a signalling apparatus at Signal Hill/);
  assert.match(record, /did not provide a supported 1820 Newfoundland electric telegraph/);
  assert.match(record, /Public Ledger.*begins in January 1827/);
  assert.doesNotMatch(record, /February 20, 1820.*fire/);
});

test("1820 work item is complete", () => {
  const item = workItems.work_items.find((entry) => entry.id === "NPREG-208");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-207"]);
  assert.deepEqual(item.completion_evidence, [
    "research/NP_1820_SYSTEM_RECORD.md",
    "research/derived/np-1820-newspaper-issue-manifest.json",
    "src/data.js",
    "tests/np-1820-system.test.js"
  ]);
});
