import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { sources, stationProfiles, timeline } from "../src/data.js";
import workItems from "../docs/work-items.json" with { type: "json" };

test("1899 record separates Petty Harbour construction from 1900 commissioning", () => {
  const event = timeline.find((entry) => entry.date === "1899");
  assert.ok(event);
  assert.match(event.title, /construction began/);
  assert.match(event.body, /construction at Petty Harbour began in 1899/);
  assert.match(event.body, /commissioning of its first generating set to 1900/);

  const pettyHarbour = stationProfiles.find((station) => station.code === "PHR");
  const history = pettyHarbour.historyRecords.find((entry) => entry.label === "1899 CONSTRUCTION START");
  assert.ok(history);
  assert.match(JSON.stringify(history.facts), /first generating set to 1900/);
});

test("1899 source retains its exact page and file hash", () => {
  const source = sources.find((entry) => entry.id === "np-1999-annual-petty-harbour-construction");
  assert.equal(source.pages, "physical PDF p. 17, report p. 14");
  const record = fs.readFileSync(new URL("../research/NP_1899_SYSTEM_RECORD.md", import.meta.url), "utf8");
  assert.match(record, /limited to the start of construction/);
  assert.match(record, /6318f5fc91c2fe202a1f991e5849bc4a53d65101eea8df1c2d746a60cecd4783/);
  assert.match(record, /e3e004d1aadd10be1624cc33b402203eb60c744f24e4736d1219b94e41579cb2/);
});

test("1899 work item follows the 1900 queue", () => {
  const item = workItems.work_items.find((candidate) => candidate.id === "NPREG-129");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-128"]);
  assert.deepEqual(item.completion_evidence, ["research/NP_1899_SYSTEM_RECORD.md", "src/data.js", "tests/np-1899-system.test.js"]);
});
