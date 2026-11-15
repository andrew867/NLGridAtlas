import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { sources, stationProfiles, timeline } from "../src/data.js";

test("1910 Petty Harbour record preserves the component dates and unit-date conflict", () => {
  const event = timeline.find((entry) => entry.date === "1910");
  assert.ok(event);
  assert.match(event.title, /Petty Harbour Unit 1/);
  assert.match(event.body, /original governor.*1910/);
  assert.match(event.body, /Voith inlet valve.*1910/);
  assert.match(event.body, /1900, 1908 and 1926/);

  const pettyHarbour = stationProfiles.find((station) => station.code === "PHR");
  assert.ok(pettyHarbour);
  const history = pettyHarbour.historyRecords.map(({ label, facts }) => `${label} ${facts.flat().join(" ")}`).join(" ");
  assert.match(history, /1910 REPORTED PHR-G1 INSTALLATION.*PHR-G1.*1\.6 MW.*1910/);
  assert.match(history, /1910 UNIT 1 GOVERNOR.*original governor installed in 1910/);
  assert.match(history, /48-inch.*Voith.*1910/);
  assert.match(history, /1900, 1908 and 1926/);
});

test("1910 research does not assign the anonymous account placement to Petty Harbour", () => {
  assert.ok(sources.some((source) => source.id === "np-1910-petty-harbour-valve"));

  const record = fs.readFileSync(new URL("../research/NP_1910_SYSTEM_RECORD.md", import.meta.url), "utf8");
  assert.match(record, /\$89,482 placement/);
  assert.match(record, /\$61,482/);
  assert.match(record, /amount is not assigned to Petty Harbour/);
  assert.match(record, /physical PDF pp\. 101, 601 and 631/);

  const workItems = JSON.parse(fs.readFileSync(new URL("../docs/work-items.json", import.meta.url), "utf8"));
  const item = workItems.work_items.find((candidate) => candidate.id === "NPREG-118");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.completion_evidence, ["research/NP_1910_SYSTEM_RECORD.md", "src/data.js", "tests/np-1910-system.test.js"]);
});
