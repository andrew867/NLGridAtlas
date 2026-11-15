import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { islandTerminalRecords, sources, timeline } from "../src/data.js";

test("1925 records retain the Deer Lake fleet range and Corner Brook mill system", () => {
  const event = timeline.find((entry) => entry.date === "1925");
  assert.ok(event);
  assert.match(event.title, /Deer Lake Power commissioning began/);
  assert.match(event.body, /nine Deer Lake units/);
  assert.match(event.body, /does not assign a year to each unit/);

  const deerLakePower = islandTerminalRecords.find(({ code }) => code === "DLP");
  assert.ok(deerLakePower);
  const history = deerLakePower.historyRecords.map(({ label, facts }) => `${label} ${facts.flat().join(" ")}`).join(" ");
  assert.match(history, /1925 TO 1929 GENERATING FLEET.*nine units/);
  assert.match(history, /127,084 kW/);
  assert.match(history, /1925 CORNER BROOK MILL.*predominantly 50 Hz/);
});

test("1925 sources and work item remain traceable", () => {
  for (const id of ["nlh-1925-corner-brook-mill", "nlh-1925-deer-lake-generation"]) {
    assert.ok(sources.some((source) => source.id === id), `missing source ${id}`);
  }

  const record = fs.readFileSync(new URL("../research/NP_1925_SYSTEM_RECORD.md", import.meta.url), "utf8");
  assert.match(record, /It does not assign a commissioning year or capacity to an individual unit/);
  assert.match(record, /not a 1925 date for the later Hydro frequency converter/);

  const workItems = JSON.parse(fs.readFileSync(new URL("../docs/work-items.json", import.meta.url), "utf8"));
  const item = workItems.work_items.find((candidate) => candidate.id === "NPREG-103");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.completion_evidence, ["research/NP_1925_SYSTEM_RECORD.md", "src/data.js", "tests/np-1925-system.test.js"]);
});
