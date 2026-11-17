import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { sources, timeline } from "../src/data.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const workItems = JSON.parse(fs.readFileSync(path.join(root, "docs", "work-items.json"), "utf8"));

test("1805 source records preserve exact URL, pages and evidence states", () => {
  const url = "https://dai.mun.ca/PDFs/cns_colonia/A52_V01.pdf";
  const expected = [
    ["mun-colonial-1805-st-johns-defence", "physical PDF pp. 172 to 177", "reported"],
    ["mun-colonial-1805-signal-hill-works", "physical PDF p. 190", "proposed"],
    ["mun-colonial-1805-jail-payments", "physical PDF p. 197", "reported"],
    ["mun-colonial-1805-convoys", "physical PDF pp. 201 to 202", "reported"],
    ["mun-colonial-1805-placentia-fort", "physical PDF pp. 206 to 207", "reported"],
    ["mun-colonial-1805-burin-building", "physical PDF pp. 209 to 210", "proposed"]
  ];
  for (const [id, pages, status] of expected) {
    const source = sources.find((entry) => entry.id === id);
    assert.ok(source, id);
    assert.equal(source.url, url);
    assert.equal(source.pages, pages);
    assert.equal(source.status, status);
  }
});

test("1805 St. John's defence record retains the dated arrangement", () => {
  const defence = timeline.find((entry) => entry.title === "St. John's defence centred on Signal Hill while the town forts decayed");
  const volunteers = timeline.find((entry) => entry.title === "Five volunteer companies fielded 250 armed men");
  assert.equal(defence?.date, "1805-07-18");
  assert.match(defence.body, /Fort Townshend and Fort William were nearly decayed and not tenable/);
  assert.match(defence.body, /Bay Bulls or Torbay/);
  assert.equal(volunteers?.status, "reported");
  assert.match(volunteers.body, /five companies and 250 men/);
  assert.match(volunteers.body, /furnished arms/);
});

test("1805 Signal Hill entry does not reconstruct the missing engineer report", () => {
  const item = timeline.find((entry) => entry.sourceId === "mun-colonial-1805-signal-hill-works");
  assert.equal(item?.status, "proposed");
  assert.match(item.body, /does not reproduce the report/);
  assert.match(item.body, /does not support reconstruction/);
});

test("1805 jail and Burin records preserve amounts and completion states", () => {
  const jails = timeline.find((entry) => entry.sourceId === "mun-colonial-1805-jail-payments");
  const burin = timeline.find((entry) => entry.sourceId === "mun-colonial-1805-burin-building");
  assert.equal(jails?.status, "reported");
  assert.match(jails.body, /£125/);
  assert.match(jails.body, /£150/);
  assert.equal(burin?.status, "proposed");
  assert.match(burin.body, /£700 or £800/);
  assert.match(burin.body, /draw £125 after completion/);
});

test("1805 convoy arithmetic and Placentia costs preserve source values", () => {
  const convoy = timeline.find((entry) => entry.sourceId === "mun-colonial-1805-convoys");
  const fort = timeline.find((entry) => entry.sourceId === "mun-colonial-1805-placentia-fort");
  assert.match(convoy.title, /Sixty-nine sail/);
  assert.match(convoy.body, /33 sail/);
  assert.match(convoy.body, /36 sail/);
  assert.equal(33 + 36, 69);
  assert.match(fort.body, /at least £500/);
  assert.match(fort.body, /more than £1,000 in stores/);
  assert.match(fort.body, /no parapet/);
});

test("1805 research preserves the source hash", () => {
  const record = fs.readFileSync(path.join(root, "research", "NP_1805_SYSTEM_RECORD.md"), "utf8");
  assert.match(record, /4cb294934e31a1adcb547a40a8dcf6ce6211c2e9db6536e9d7663fbc9e005e2b/);
  assert.match(record, /physical PDF pp\. 172 to 177/);
  assert.match(record, /physical PDF pp\. 206 to 207/);
  assert.match(record, /physical PDF pp\. 209 to 210/);
});

test("1805 work item is complete", () => {
  const item = workItems.work_items.find((entry) => entry.id === "NPREG-223");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-222"]);
  assert.deepEqual(item.completion_evidence, [
    "research/NP_1805_SYSTEM_RECORD.md",
    "src/data.js",
    "tests/np-1805-system.test.js"
  ]);
});
