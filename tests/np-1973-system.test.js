import assert from "node:assert/strict";
import test from "node:test";
import { islandTerminalRecords, sources, staticClaims, stationProfiles, timeline } from "../src/data.js";

const stationText = (code) => JSON.stringify(stationProfiles.find((station) => station.code === code));

test("1973 demand record retains only the printed value", () => {
  const demand = timeline.find((entry) => entry.date === "1973" && /336\.3 MW/.test(entry.title));
  assert.ok(demand);
  assert.match(demand.body, /does not print Hydro or Island transmission peak/);
});

test("Gallant Street and 103L retain their 1973 records", () => {
  assert.match(stationText("GAL"), /built","1973/);
  assert.match(stationText("GAL"), /401L to Stephenville/);
  assert.match(stationText("NDJ"), /103L was built in 1973/);
});

test("Buchans retains terminal, ring bus, TL233 and compressed-air history", () => {
  const buchans = JSON.stringify(islandTerminalRecords.find((station) => station.code === "BUC"));
  assert.match(buchans, /1973 COMMISSIONING/);
  assert.match(buchans, /Bowater supplied Buchans at 50 Hz/);
  assert.match(buchans, /TL233.*added between Buchans and Bottom Brook in 1973/);
  assert.match(buchans, /1973 COMPRESSED-AIR SYSTEM/);
});

test("1973 station equipment is attached to its station records", () => {
  assert.match(stationText("SPO"), /1973 SPO-T4 INSTALLATION/);
  assert.match(stationText("LOK"), /1973 66 KV STRUCTURE/);
  assert.match(stationText("HGR"), /1973 STRUCTURE REGISTER/);
  assert.match(stationText("SJM"), /1973 4\.16 KV STRUCTURE/);
});

test("1973 system claim keeps exact source pages", () => {
  const claim = staticClaims.find((candidate) => candidate.id === "np-1973-system-record");
  assert.ok(claim);
  assert.equal(claim.status, "reported");
  assert.equal(claim.sources.length, 10);
  assert.equal(sources.find((source) => source.id === "nlh-1973-historical-demand")?.pages, "physical PDF p. 2");
  assert.equal(sources.find((source) => source.id === "nlh-1973-tl233")?.pages, "physical PDF p. 48");
  assert.equal(sources.find((source) => source.id === "nlh-1973-buchans-air")?.pages, "physical PDF pp. 337 to 339");
});
