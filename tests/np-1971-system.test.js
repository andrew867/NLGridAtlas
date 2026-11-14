import assert from "node:assert/strict";
import test from "node:test";
import { components, islandTerminalRecords, sources, staticClaims, stationProfiles, timeline } from "../src/data.js";

const stationText = (code) => JSON.stringify(stationProfiles.find((station) => station.code === code));

test("1971 demand retains only the printed peak", () => {
  const demand = timeline.find((entry) => entry.date === "1971" && /267\.5 MW/.test(entry.title));
  assert.ok(demand);
  assert.match(demand.body, /does not print Hydro or Island transmission peak/);
});

test("Holyrood Stage I and Bayview retain their 1971 records", () => {
  assert.match(components["hrd-summary"].summary, /Unit 1 was commissioned in 1970 and Unit 2 in 1971/);
  assert.match(components["hrd-summary"].summary, /both were originally designed for 150 MW/);
  assert.match(stationText("BVS"), /built in 1971/);
  assert.match(stationText("BVS"), /1972 STRUCTURE REGISTER/);
});

test("55L and TL209 retain their dated construction records", () => {
  const network = timeline.find((entry) => entry.date === "1971" && /55L and TL209/.test(entry.title));
  assert.match(network.body, /1\.0 km section built in 1968/);
  assert.match(network.body, /21 km, 230 kV TL209/);
});

test("1971 station equipment remains attached to its station records", () => {
  assert.match(stationText("HGR"), /HGR-T2 installed in 1971/);
  const stv = JSON.stringify(islandTerminalRecords.find((station) => station.code === "STV"));
  assert.match(stv, /1971 TERMINAL ESTIMATE/);
  assert.match(stv, /additional 69 kV ground-switch cost dated January 1, 1971/);
  assert.match(stationText("SPO"), /1971 TO 1973 SYSTEM-TRANSFORMER DATE CONFLICT/);
});

test("1971 system claim preserves the Salt Pond conflict and exact pages", () => {
  const claim = staticClaims.find((candidate) => candidate.id === "np-1971-system-record");
  assert.ok(claim);
  assert.equal(claim.status, "unresolved");
  assert.equal(claim.sources.length, 9);
  assert.equal(sources.find((source) => source.id === "nlh-1971-historical-demand")?.pages, "physical PDF p. 2");
  assert.equal(sources.find((source) => source.id === "nlh-1971-tl209")?.pages, "physical PDF p. 56");
  assert.equal(sources.find((source) => source.id === "np-1971-salt-pond-transformer")?.pages, "physical PDF pp. 6 and 9");
});
