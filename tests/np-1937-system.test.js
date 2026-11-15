import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { islandTerminalRecords, sources, staticClaims, stationProfiles, timeline } from "../src/data.js";

const lawnText = () => JSON.stringify(stationProfiles.find((candidate) => candidate.code === "LWN"));
const grandFallsText = () => JSON.stringify(islandTerminalRecords.find((candidate) => candidate.code === "GFS"));

test("1937 Lawn record retains the concrete work without assigning later dimensions to it", () => {
  const event = timeline.find((entry) => entry.date === "1937" && /Lawn Forebay Dam/.test(entry.title));
  assert.ok(event);
  assert.equal(event.status, "reported");
  assert.match(event.body, /concrete base/);
  assert.match(event.body, /upstream and downstream sides/);
  assert.match(lawnText(), /1937 TO 1983 DAM WORK/);
  assert.match(lawnText(), /concrete base and concrete encasement/);
});

test("Grand Falls G4 installation year remains unresolved between 1937 and 1938", () => {
  const event = timeline.find((entry) => entry.date === "1937" && /Grand Falls G4/.test(entry.title));
  assert.ok(event);
  assert.equal(event.status, "unresolved");
  assert.match(event.body, /page 132 says 1938/);
  assert.match(event.body, /page 135 says 1937/);
  assert.match(event.body, /50 Hz/);
  assert.match(event.body, /27,000 kW and 29,700 kVA/);
  assert.match(grandFallsText(), /installation year.*unresolved/);
});

test("1937 claim and public card retain exact source pages", () => {
  const claim = staticClaims.find((candidate) => candidate.id === "np-1937-system-record");
  assert.ok(claim);
  assert.equal(claim.status, "unresolved");
  assert.equal(claim.sources.length, 2);
  assert.equal(sources.find((source) => source.id === "np-1937-grand-falls-g4")?.pages, "physical PDF pp. 131 to 135");
  const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
  assert.match(html, /data-claim-id="np-1937-system-record"/);
  assert.match(html, /same court judgment gives 1938 on physical PDF p\. 132 and 1937 on physical PDF p\. 135/);
});

test("1937 work item is closed with evidence", () => {
  const workItems = JSON.parse(fs.readFileSync(new URL("../docs/work-items.json", import.meta.url), "utf8"));
  const item = workItems.work_items.find((candidate) => candidate.id === "NPREG-091");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.completion_evidence, ["research/NP_1937_SYSTEM_RECORD.md", "src/data.js", "index.html", "tests/np-1937-system.test.js"]);
});
