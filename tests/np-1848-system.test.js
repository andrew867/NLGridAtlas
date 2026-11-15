import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { sources, timeline } from "../src/data.js";
import workItems from "../docs/work-items.json" with { type: "json" };

const eventBySource = (sourceId) => timeline.find((entry) => entry.sourceId === sourceId);

test("1848 Gisborne lecture remains in Saint John, New Brunswick", () => {
  const event = eventBySource("mun-courier-1848-gisborne-saint-john-lecture");
  assert.ok(event);
  assert.equal(event.date, "1848-04-13");
  assert.equal(event.status, "reported");
  assert.match(event.body, /Saint John, New Brunswick/);
  assert.match(event.body, /earth return/);
  assert.match(event.body, /paper-marking apparatus/);
  assert.match(event.body, /event occurred in New Brunswick/);
});

test("1848 mainland route remains proposed", () => {
  const event = eventBySource("mun-courier-1848-mainland-halifax-route");
  assert.ok(event);
  assert.equal(event.date, "1848-06-13");
  assert.equal(event.status, "proposed");
  assert.match(event.body, /£10,000/);
  assert.match(event.body, /Halifax/);
  assert.match(event.body, /Amherst/);
  assert.match(event.body, /Calais/);
  assert.match(event.body, /remaining link, not an operating through route/);
});

test("1848 source locators retain physical pages", () => {
  const expected = new Map([
    ["mun-courier-1848-gisborne-saint-john-lecture", "physical PDF p. 4"],
    ["mun-courier-1848-mainland-halifax-route", "physical PDF p. 2"]
  ]);
  for (const [sourceId, pages] of expected) {
    const source = sources.find((entry) => entry.id === sourceId);
    assert.ok(source, sourceId);
    assert.equal(source.pages, pages);
    assert.equal(source.status, "reported");
  }
});

test("1848 research record retains source hashes and evidence boundary", () => {
  const record = fs.readFileSync(new URL("../research/NP_1848_SYSTEM_RECORD.md", import.meta.url), "utf8");
  for (const hash of [
    "765eb73812a4310bf592aecc222cfe288c00472620bb59eb19b6513a7caedc5b",
    "9f4522b2ab501a8d19faeae3b40950bb782be0058a1935dc72f5ff204f7d1ec6"
  ]) {
    assert.match(record, new RegExp(hash));
  }
  assert.match(record, /do not record a Newfoundland line, company, station or operating circuit in 1848/);
});

test("1848 work item is complete", () => {
  const item = workItems.work_items.find((entry) => entry.id === "NPREG-180");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-179"]);
  assert.deepEqual(item.completion_evidence, ["research/NP_1848_SYSTEM_RECORD.md", "src/data.js", "tests/np-1848-system.test.js"]);
});
