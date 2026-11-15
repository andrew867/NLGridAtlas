import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { sources, stationProfiles, timeline } from "../src/data.js";
import workItems from "../docs/work-items.json" with { type: "json" };

test("1898 record separates Petty Harbour site and dam work from later plant construction", () => {
  const event = timeline.find((entry) => entry.date === "1898");
  assert.ok(event);
  assert.match(event.title, /dam site/);
  assert.match(event.body, /May 7/);
  assert.match(event.body, /twelve men/);
  assert.match(event.body, /plant construction to 1899/);

  const pettyHarbour = stationProfiles.find((station) => station.code === "PHR");
  const history = pettyHarbour.historyRecords.find((entry) => entry.label === "1898 SITE AND DAM WORK");
  assert.ok(history);
  assert.match(JSON.stringify(history.facts), /selected a dam site/);
  assert.match(JSON.stringify(history.facts), /plant construction to 1899/);
});

test("1898 source retains its exact page and file hash", () => {
  const source = sources.find((entry) => entry.id === "mun-1965-st-johns-street-railway");
  assert.equal(source.pages, "physical PDF p. 7, printed p. 5");
  const record = fs.readFileSync(new URL("../research/NP_1898_SYSTEM_RECORD.md", import.meta.url), "utf8");
  assert.match(record, /Spring 1965/);
  assert.match(record, /8b429721b73b312ea8bc11faca11173e0789988b38cd1cc3f2f16b40fb88ff95/);
  assert.match(record, /6318f5fc91c2fe202a1f991e5849bc4a53d65101eea8df1c2d746a60cecd4783/);
});

test("1898 work item follows the 1899 queue", () => {
  const item = workItems.work_items.find((candidate) => candidate.id === "NPREG-130");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-129"]);
  assert.deepEqual(item.completion_evidence, ["research/NP_1898_SYSTEM_RECORD.md", "src/data.js", "tests/np-1898-system.test.js"]);
});
