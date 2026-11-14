import assert from "node:assert/strict";
import test from "node:test";
import { islandTerminalRecords, sources, staticClaims, stationProfiles, timeline } from "../src/data.js";

const recordText = (code) => JSON.stringify(
  islandTerminalRecords.find((station) => station.code === code)
  ?? stationProfiles.find((station) => station.code === code)
);

test("1988 sources retain filed pages and URLs", () => {
  const reliability = sources.find((candidate) => candidate.id === "np-1988-reliability");
  assert.ok(reliability);
  assert.equal(reliability.pages, "physical PDF p. 11");
  assert.equal(reliability.url, "http://www.pub.nl.ca/applications/ARCHIVE/NP2008GRA/files/information/Information-17.pdf");

  const cables = sources.find((candidate) => candidate.id === "nlh-1988-change-fogo-cables");
  assert.ok(cables);
  assert.equal(cables.pages, "physical PDF pp. 311 to 313");

  const bellIsland = sources.find((candidate) => candidate.id === "np-1988-bell-island-cables");
  assert.ok(bellIsland);
  assert.equal(bellIsland.pages, "physical PDF p. 314");
});

test("1988 reliability and capital preserve filed units", () => {
  const claim = staticClaims.find((candidate) => candidate.id === "np-1988-system-reliability");
  assert.ok(claim);
  assert.deepEqual(claim.sources.map((source) => source.pages), ["physical PDF p. 11"]);

  const reliability = timeline.find((entry) => entry.date === "1988" && entry.category === "reliability");
  assert.ok(reliability);
  assert.match(reliability.title, /5\.78/);
  assert.match(reliability.title, /9\.59 hours/);
  assert.match(reliability.body, /1\.66/);
  assert.ok(timeline.find((entry) => entry.date === "1988" && /46\.598/.test(entry.title)));
});

test("1988 Boyd's Cove and TL254 records remain connected", () => {
  assert.match(recordText("BOY"), /1988 origin/);
  assert.match(recordText("BOY"), /TL254/);
  const line = timeline.find((entry) => entry.date === "1988" && /TL254 connected/.test(entry.title));
  assert.ok(line);
  assert.match(line.body, /18\.868 km/);
  assert.match(line.body, /66 kV/);
});

test("1988 submarine cable histories preserve the physical systems", () => {
  const changeFogo = timeline.find((entry) => entry.date === "1988" && /Change Islands and Fogo Island/.test(entry.title));
  assert.ok(changeFogo);
  assert.match(changeFogo.body, /5\.1 km/);
  assert.match(changeFogo.body, /5\.3 km/);
  assert.match(changeFogo.body, /four single-conductor cables/);

  const bellIsland = timeline.find((entry) => entry.date === "1988" && /Bell Island operating cables/.test(entry.title));
  assert.ok(bellIsland);
  assert.match(bellIsland.body, /factory-splice problem/);
  assert.match(bellIsland.body, /12\.47 kV/);
});

test("1988 generation and plant work remain source linked", () => {
  const records = timeline.filter((entry) => entry.date === "1988");
  assert.ok(records.find((entry) => /Unit 1 was uprated/.test(entry.title)));
  assert.ok(records.find((entry) => /T4 spare position/.test(entry.title)));
  assert.ok(records.find((entry) => /power-turbine casings/.test(entry.title)));
  assert.ok(records.find((entry) => /Frozen Ocean Lake dam/.test(entry.title)));
  assert.ok(records.find((entry) => /Seal Cove generator G1/.test(entry.title)));
  assert.match(recordText("STV"), /1988 POWER-TURBINE CASING REPLACEMENT/);
  assert.match(recordText("RBK"), /1988 FROZEN OCEAN LAKE DAM REBUILD/);
});
