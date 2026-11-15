import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { stationProfiles, timeline } from "../src/data.js";
import workItems from "../docs/work-items.json" with { type: "json" };

test("1900 record adds the original Petty Harbour development without assigning later plant totals to one unit", () => {
  const event = timeline.find((entry) => entry.date === "1900");
  assert.ok(event);
  assert.match(event.title, /Petty Harbour hydroelectric development/);
  assert.match(event.body, /first horizontal Francis turbine-generator set/);
  assert.doesNotMatch(event.body, /5,300 kW|15\.87 GWh/);

  const pettyHarbour = stationProfiles.find((station) => station.code === "PHR");
  const history = pettyHarbour.historyRecords.find((entry) => entry.label === "1900 ORIGINAL DEVELOPMENT");
  assert.ok(history);
  assert.match(JSON.stringify(history.facts), /5,300 kW total installed capacity/);
  assert.match(JSON.stringify(history.facts), /2010 three-unit plant/);
});

test("1900 research retains the source boundary and hash", () => {
  const record = fs.readFileSync(new URL("../research/NP_1900_SYSTEM_RECORD.md", import.meta.url), "utf8");
  assert.match(record, /Those figures describe the three-unit plant in 2010/);
  assert.match(record, /not assigned to the single 1900 machine/);
  assert.match(record, /e3e004d1aadd10be1624cc33b402203eb60c744f24e4736d1219b94e41579cb2/);
});

test("1900 work item follows the 1901 queue", () => {
  const item = workItems.work_items.find((candidate) => candidate.id === "NPREG-128");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-127"]);
  assert.deepEqual(item.completion_evidence, ["research/NP_1900_SYSTEM_RECORD.md", "src/data.js", "tests/np-1900-system.test.js"]);
});
