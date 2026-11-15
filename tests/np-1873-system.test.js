import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { sources, timeline } from "../src/data.js";
import workItems from "../docs/work-items.json" with { type: "json" };

test("1873 record retains the legally established consolidation", () => {
  const event = timeline.find((entry) => entry.date === "1873-06-26");
  assert.ok(event);
  assert.match(event.body, /Anglo-American Telegraph Company/);
  assert.match(event.body, /New York, Newfoundland and London Telegraph Company/);
  assert.match(event.body, /merged into the consolidated company/);
  assert.match(event.body, /exclusive privileges/);
  assert.equal(event.status, "verified");
});

test("1873 company notice retains all fourteen submarine cables", () => {
  const event = timeline.find((entry) => entry.date === "1873-07-18");
  assert.ok(event);
  for (const route of ["Valentia and Heart's Content", "Falmouth and Brest", "Brest and St. Pierre", "St. Pierre and Duxbury", "Placentia and Sydney", "Placentia and St. Pierre", "St. Pierre and Sydney", "Port Basque and Aspoe Bay", "Prince Edward Island and New Brunswick"]) {
    assert.match(event.body, new RegExp(route.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.match(event.body, /fourteen owned submarine cables/);
  assert.equal(event.status, "reported");
});

test("1873 sources preserve exact physical page locators", () => {
  const consolidation = sources.find((entry) => entry.id === "nl-law-reports-1873-telegraph-consolidation");
  const inventory = sources.find((entry) => entry.id === "mun-courier-1873-cable-inventory");
  assert.equal(consolidation?.pages, "physical PDF pp. 50 to 51, printed pp. 30 to 31");
  assert.equal(inventory?.pages, "physical PDF p. 2");
});

test("1873 research record retains both source hashes", () => {
  const record = fs.readFileSync(new URL("../research/NP_1873_SYSTEM_RECORD.md", import.meta.url), "utf8");
  assert.match(record, /7cb6b390fc9027e7e93295d00ccfc5e244a42b031216d251a52208c3ec28585d/);
  assert.match(record, /168ecb24ded781cca107b445503ec0f9da06ba0a1abc4a1d5a43cd5f8edc0a5a/);
  assert.match(record, /route counts sum to fourteen cables/);
});

test("1873 work item follows the 1874 queue", () => {
  const item = workItems.work_items.find((candidate) => candidate.id === "NPREG-155");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-154"]);
  assert.deepEqual(item.completion_evidence, ["research/NP_1873_SYSTEM_RECORD.md", "src/data.js", "tests/np-1873-system.test.js"]);
});
