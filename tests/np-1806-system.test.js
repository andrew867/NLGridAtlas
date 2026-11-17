import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { sources, timeline } from "../src/data.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const workItems = JSON.parse(fs.readFileSync(path.join(root, "docs", "work-items.json"), "utf8"));

test("1806 source records preserve exact URL, pages and evidence states", () => {
  const url = "https://dai.mun.ca/PDFs/cns_colonia/A52_V01.pdf";
  const expected = [
    ["mun-colonial-1806-road-rights", "physical PDF pp. 222 to 224", "reported"],
    ["mun-colonial-1806-fire-access", "physical PDF pp. 224 to 225", "proposed"],
    ["mun-colonial-1806-currency", "physical PDF p. 226", "proposed"],
    ["mun-colonial-1806-ordnance-wharf", "physical PDF pp. 229 to 231", "proposed"],
    ["mun-colonial-1806-powder-house-clearances", "physical PDF p. 231", "reported"],
    ["mun-colonial-1806-government-house", "physical PDF pp. 233 to 234", "reported"]
  ];
  for (const [id, pages, status] of expected) {
    const source = sources.find((entry) => entry.id === id);
    assert.ok(source, id);
    assert.equal(source.url, url);
    assert.equal(source.pages, pages);
    assert.equal(source.status, status);
  }
});

test("1806 road record keeps the 1804 opening separate from the 1806 follow-up", () => {
  const road = timeline.find((entry) => entry.sourceId === "mun-colonial-1806-road-rights");
  const access = timeline.find((entry) => entry.sourceId === "mun-colonial-1806-fire-access");
  assert.equal(road?.date, "1806-04-19");
  assert.match(road.body, /opened .* in 1804/);
  assert.match(road.body, /200 yards from high-water mark/);
  assert.equal(access?.status, "proposed");
  assert.match(access.body, /six or seven feet wide/);
  assert.match(access.body, /prevented fire engines/);
});

test("1806 currency record preserves amount and denomination", () => {
  const item = timeline.find((entry) => entry.sourceId === "mun-colonial-1806-currency");
  assert.equal(item?.status, "proposed");
  assert.match(item.body, /£7,000 in Spanish dollars/);
  assert.match(item.body, /£500 in copper two-penny and penny coins/);
});

test("1806 Ordnance record separates intentions from measured clearances", () => {
  const wharf = timeline.find((entry) => entry.title === "Gower proposed shared Ordnance Wharf repair costs");
  const shed = timeline.find((entry) => entry.title === "Gower intended to recover Ordnance land and the Powder Shed");
  const clearances = timeline.find((entry) => entry.sourceId === "mun-colonial-1806-powder-house-clearances");
  assert.equal(wharf?.status, "proposed");
  assert.match(wharf.body, /equally between the Ordnance and contingent departments/);
  assert.equal(shed?.status, "proposed");
  assert.match(shed.body, /prevent fires on the Barrens/);
  assert.equal(clearances?.status, "reported");
  assert.match(clearances.body, /240 yards/);
  assert.match(clearances.body, /365 yards/);
});

test("1806 public works preserve estimates and authorization state", () => {
  const outbuildings = timeline.find((entry) => entry.title === "Government House outbuildings were ordered into execution");
  const garden = timeline.find((entry) => entry.title === "A replacement Fort Townshend garden required £41 17s in labour");
  assert.equal(outbuildings?.status, "reported");
  assert.match(outbuildings.body, /estimated at £100/);
  assert.match(outbuildings.body, /vouchers lacked formal accounting authority/);
  assert.equal(garden?.status, "reported");
  assert.match(garden.body, /£41 17s/);
  assert.match(garden.body, /clearing and fencing/);
});

test("1806 research preserves the source hash", () => {
  const record = fs.readFileSync(path.join(root, "research", "NP_1806_SYSTEM_RECORD.md"), "utf8");
  assert.match(record, /4cb294934e31a1adcb547a40a8dcf6ce6211c2e9db6536e9d7663fbc9e005e2b/);
  assert.match(record, /physical PDF pp\. 222 to 225/);
  assert.match(record, /physical PDF pp\. 229 to 231/);
  assert.match(record, /physical PDF pp\. 233 to 234/);
});

test("1806 work item is complete", () => {
  const item = workItems.work_items.find((entry) => entry.id === "NPREG-222");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-221"]);
  assert.deepEqual(item.completion_evidence, [
    "research/NP_1806_SYSTEM_RECORD.md",
    "src/data.js",
    "tests/np-1806-system.test.js"
  ]);
});
