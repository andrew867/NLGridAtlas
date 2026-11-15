import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { sources, stationProfiles, timeline } from "../src/data.js";
import workItems from "../docs/work-items.json" with { type: "json" };

test("1902 record separates United Towns formation from Victoria commissioning", () => {
  const event = timeline.find((entry) => entry.date === "1902");
  assert.ok(event);
  assert.equal(event.category, "utility formation");
  assert.match(event.body, /incorporated in 1902/);
  assert.match(event.body, /began operations in 1904/);
  assert.match(event.body, /does not represent plant commissioning/);

  const victoria = stationProfiles.find((station) => station.code === "VIC");
  const history = victoria.historyRecords.find((entry) => entry.label === "1902 UNITED TOWNS ELECTRICAL COMPANY");
  assert.ok(history);
  assert.match(JSON.stringify(history.facts), /Harbour Grace, Carbonear and Heart's Content/);
});

test("1902 source retains its exact PDF page and file hash", () => {
  const history = sources.find((entry) => entry.id === "mun-1937-united-towns-history");
  assert.equal(history.pages, "physical PDF p. 304, printed p. 296");

  const record = fs.readFileSync(new URL("../research/NP_1902_SYSTEM_RECORD.md", import.meta.url), "utf8");
  assert.match(record, /1902 event is therefore recorded as company formation, not plant commissioning/);
  assert.match(record, /d25fbdaecfdf9f053238d01d9d8f4adac29deb8a1d49143caa69d743f2aeea42/);
  assert.match(record, /retrieved 2026-11-15/);
});

test("1902 work item follows the 1903 queue", () => {
  const item = workItems.work_items.find((candidate) => candidate.id === "NPREG-126");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-125"]);
  assert.deepEqual(item.completion_evidence, ["research/NP_1902_SYSTEM_RECORD.md", "src/data.js", "tests/np-1902-system.test.js"]);
});
