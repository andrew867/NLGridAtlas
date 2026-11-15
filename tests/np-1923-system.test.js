import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { sources, stationProfiles, timeline } from "../src/data.js";

test("1923 Seal Cove table remains a conflict rather than a timeline event", () => {
  assert.equal(timeline.some((entry) => entry.date === "1923"), false);
  const sealCove = stationProfiles.find(({ code }) => code === "SCV");
  assert.ok(sealCove);
  const history = sealCove.historyRecords.map(({ label, facts }) => `${label} ${facts.flat().join(" ")}`).join(" ");
  assert.match(history, /2008 CONFLICTING 1923 TABLE.*3\.18 MW.*two units/);
  assert.match(history, /conflicts with the detailed development records that consistently state 1924/);
});

test("1923 source and work item remain traceable", () => {
  const source = sources.find(({ id }) => id === "np-1923-seal-cove-conflict");
  assert.ok(source);
  assert.equal(source.status, "unresolved");

  const record = fs.readFileSync(new URL("../research/NP_1923_SYSTEM_RECORD.md", import.meta.url), "utf8");
  assert.match(record, /does not displace the repeated detailed 1924 records/);
  assert.match(record, /does not create a 1923 commissioning event/);

  const workItems = JSON.parse(fs.readFileSync(new URL("../docs/work-items.json", import.meta.url), "utf8"));
  const item = workItems.work_items.find((candidate) => candidate.id === "NPREG-105");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.completion_evidence, ["research/NP_1923_SYSTEM_RECORD.md", "src/data.js", "tests/np-1923-system.test.js"]);
});
