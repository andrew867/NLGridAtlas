import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { sources, timeline, stationProfiles } from "../src/data.js";
import workItems from "../docs/work-items.json" with { type: "json" };

test("1908 Petty Harbour record keeps the historical unit separate from present unit identifiers", () => {
  const event = timeline.find((entry) => entry.date === "1908");
  assert.ok(event);
  assert.match(event.title, /Petty Harbour added a turbine-generator/);
  assert.match(event.body, /three horizontal Francis/);
  assert.match(event.body, /5,300 kW/);
  assert.match(event.body, /57\.9 m/);
  assert.match(event.body, /does not map.*present unit identifier/);

  const station = stationProfiles.find((entry) => entry.code === "PHR");
  const record = station.historyRecords.find((entry) => entry.label === "1908 GENERATING-UNIT ADDITION");
  const history = JSON.stringify(record);
  assert.match(history, /one of three horizontal Francis turbine-generator sets commissioned in 1908/);
  assert.doesNotMatch(history, /PHR-G[123]/);
});

test("1908 research records its source and closes unsupported searches", () => {
  const source = sources.find((entry) => entry.id === "np-1908-petty-harbour-development");
  assert.ok(source);
  assert.equal(source.pages, "physical PDF p. 207");
  assert.equal(source.status, "reported");

  const record = fs.readFileSync(new URL("../research/NP_1908_SYSTEM_RECORD.md", import.meta.url), "utf8");
  assert.match(record, /SHA-256 `e3e004d1aadd10be1624cc33b402203eb60c744f24e4736d1219b94e41579cb2`/);
  assert.match(record, /no placement dated 1908/i);
  assert.match(record, /No amount is assigned/);
});

test("1908 work item follows the 1909 queue", () => {
  const item = workItems.work_items.find((candidate) => candidate.id === "NPREG-120");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-119"]);
  assert.deepEqual(item.completion_evidence, ["research/NP_1908_SYSTEM_RECORD.md", "src/data.js", "tests/np-1908-system.test.js"]);
});
