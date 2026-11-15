import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { islandTerminalRecords, sources, stationProfiles, timeline } from "../src/data.js";
import workItems from "../docs/work-items.json" with { type: "json" };

test("1906 record separates first harnessing from the 1907 civil works", () => {
  const event = timeline.find((entry) => entry.date === "1906");
  assert.ok(event);
  assert.match(event.title, /Grand Falls hydroelectric development/);
  assert.match(event.body, /first harnessed.*1906/);
  assert.match(event.body, /main dam and original forebay intake.*1907/);

  const generation = islandTerminalRecords.find((station) => station.code === "GFS");
  assert.match(JSON.stringify(generation.facts), /1906 development/);
  const grandFalls = stationProfiles.find((station) => station.code === "GFS");
  assert.match(JSON.stringify(grandFalls.historyRecords), /1906 FIRST HYDROELECTRIC DEVELOPMENT/);
  assert.match(JSON.stringify(grandFalls.historyRecords), /Anglo Newfoundland Development Company/);
});

test("1906 source and research retain the external PDF provenance", () => {
  const source = sources.find((entry) => entry.id === "gnl-1906-grand-falls-first-harnessed");
  assert.ok(source);
  assert.equal(source.pages, "physical PDF p. 18, printed p. 17");
  assert.equal(source.status, "reported");

  const record = fs.readFileSync(new URL("../research/NP_1906_SYSTEM_RECORD.md", import.meta.url), "utf8");
  assert.match(record, /current installed capacity, not a 1906 rating/);
  assert.match(record, /SHA-256 `e16d9ab6c576d2d21d6ad04f0178835833aead046f3bc6b88872f436802aac12`/);
  assert.match(record, /no placement dated 1906/i);
});

test("1906 work item follows the 1907 queue", () => {
  const item = workItems.work_items.find((candidate) => candidate.id === "NPREG-122");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-121"]);
  assert.deepEqual(item.completion_evidence, ["research/NP_1906_SYSTEM_RECORD.md", "src/data.js", "tests/np-1906-system.test.js"]);
});
