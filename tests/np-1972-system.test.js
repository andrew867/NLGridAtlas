import assert from "node:assert/strict";
import test from "node:test";
import { components, islandTerminalRecords, sources, staticClaims, stationProfiles, timeline } from "../src/data.js";

const stationText = (code) => JSON.stringify(stationProfiles.find((station) => station.code === code));

test("1972 demand retains only the printed peak", () => {
  const demand = timeline.find((entry) => entry.date === "1972" && /316\.1 MW/.test(entry.title));
  assert.ok(demand);
  assert.match(demand.body, /does not print Hydro or Island transmission peak/);
});

test("Hardwoods and 114L retain their 1972 records", () => {
  assert.match(components["hwd-summary"].summary, /built in 1972/);
  assert.match(components["hwd-t1"].summary, /in service since 1972/);
  const line = timeline.find((entry) => entry.date === "1972" && /114L/.test(entry.title));
  assert.match(line.body, /Clarke's Head through Boyd's Cove to Summerford/);
});

test("1972 station equipment remains attached to the relevant stations", () => {
  assert.match(stationText("MOL"), /1972 LOW-VOLTAGE STRUCTURE/);
  assert.match(stationText("CLK"), /1972 STRUCTURE REGISTER/);
  assert.match(stationText("BVS"), /built in 1971/);
  assert.match(stationText("BVS"), /1972 STRUCTURE REGISTER/);
  assert.match(stationText("CAT"), /1972 CAT-T1 INSTALLATION/);
  assert.match(stationText("PUN"), /1972 DIESEL YEAR IN SERVICE/);
});

test("Come By Chance keeps all three construction-date records", () => {
  const cbc = JSON.stringify(islandTerminalRecords.find((station) => station.code === "CBC"));
  assert.match(cbc, /constructed in 1972/);
  assert.match(cbc, /estimated in service in 1973/);
  assert.match(cbc, /January 1, 1974/);
});

test("1972 claim is unresolved and retains exact source pages", () => {
  const claim = staticClaims.find((candidate) => candidate.id === "np-1972-system-record");
  assert.ok(claim);
  assert.equal(claim.status, "unresolved");
  assert.equal(claim.sources.length, 8);
  assert.equal(sources.find((source) => source.id === "nlh-1972-historical-demand")?.pages, "physical PDF p. 2");
  assert.equal(sources.find((source) => source.id === "nlh-1972-cbc-construction")?.pages, "physical PDF p. 8");
  assert.equal(sources.find((source) => source.id === "np-1972-port-union-diesel")?.pages, "physical PDF p. 810");
});
