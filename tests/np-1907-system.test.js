import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { islandTerminalRecords, sources, stationProfiles, timeline } from "../src/data.js";
import workItems from "../docs/work-items.json" with { type: "json" };

const historyText = (code) => JSON.stringify(stationProfiles.find((station) => station.code === code)?.historyRecords ?? []);

test("1907 Exploits record retains the dated civil works", () => {
  const event = timeline.find((entry) => entry.date === "1907" && /Grand Falls dam/.test(entry.title));
  assert.ok(event);
  assert.match(event.body, /Grand Falls main dam and original forebay intake/);
  assert.match(event.body, /Bishop's Falls forebay intake/);
  assert.match(event.body, /1997/);

  const generation = islandTerminalRecords.find((station) => station.code === "GFS");
  assert.match(JSON.stringify(generation.facts), /1907 civil works/);
  assert.match(historyText("GFS"), /1907 GRAND FALLS HYDRO CIVIL WORKS/);
  assert.match(historyText("GFS"), /17 permanently open, non-operable gates/);
  assert.match(historyText("BFS"), /1907 BISHOP'S FALLS FOREBAY INTAKE/);
  assert.match(historyText("BFS"), /13 gates/);
});

test("1907 Petty Harbour record preserves the unit-date conflict", () => {
  const event = timeline.find((entry) => entry.date === "1907" && /Petty Harbour Unit 2/.test(entry.title));
  assert.ok(event);
  assert.equal(event.status, "unresolved");
  assert.match(event.body, /1907 installation/);
  assert.match(event.body, /1900, 1908 and 1926/);

  const history = historyText("PHR");
  assert.match(history, /1907 REPORTED UNIT 2 INSTALLATION/);
  assert.match(history, /installed in 1907/);
  assert.match(history, /1900, 1908 and 1926/);

  const source = sources.find((entry) => entry.id === "np-1907-petty-harbour-unit-2");
  assert.equal(source.status, "unresolved");
  assert.equal(source.pages, "physical PDF p. 202");
});

test("1907 research keeps the anonymous account placement unassigned", () => {
  const record = fs.readFileSync(new URL("../research/NP_1907_SYSTEM_RECORD.md", import.meta.url), "utf8");
  assert.match(record, /\$11,910 original-cost placement/);
  assert.match(record, /amount is not assigned to Petty Harbour or an Exploits asset/);
  assert.match(record, /SHA-256 `7295b73cf565c32382d53881a6e3e6e655d42a1c7c7d9d74665fc8d096097f02`/);

  const item = workItems.work_items.find((candidate) => candidate.id === "NPREG-121");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-120"]);
});
