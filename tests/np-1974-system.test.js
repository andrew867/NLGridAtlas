import assert from "node:assert/strict";
import test from "node:test";
import { islandTerminalRecords, sources, staticClaims, stationProfiles, timeline } from "../src/data.js";

const stationText = (code) => JSON.stringify(stationProfiles.find((station) => station.code === code));

test("1974 demand record does not invent an Island transmission peak", () => {
  const demand = timeline.find((entry) => entry.date === "1974" && /408\.4 MW/.test(entry.title));
  assert.ok(demand);
  assert.match(demand.body, /538 MW/);
  assert.match(demand.body, /does not print an Island transmission peak/);
});

test("six substations retain their documented 1974 roles", () => {
  assert.match(stationText("PUL"), /1974 STATION CONSTRUCTION/);
  assert.match(stationText("WES"), /1974 as a distribution substation/);
  assert.match(stationText("ISL"), /1974 as a distribution substation/);
  assert.match(stationText("LEW"), /1974 STATION CONSTRUCTION/);
  assert.match(stationText("CAR"), /"Station built","1974"/);
  assert.match(stationText("VIR"), /1974 STATION CONSTRUCTION/);
});

test("1974 Mobile turbine and transformer records remain distinct", () => {
  const grandBay = stationText("GBS");
  const mobile = stationText("MOB");
  assert.match(grandBay, /6,750 kW/);
  assert.match(grandBay, /Orenda OT-390 Model 2G/);
  assert.match(grandBay, /two trailers/);
  assert.match(mobile, /MOB-T2 purchased in 1974/);
  assert.match(mobile, /does not state a separate installation date/);
});

test("Come By Chance distinguishes asset dates from the terminal date", () => {
  const cbc = JSON.stringify(islandTerminalRecords.find((station) => station.code === "CBC"));
  assert.match(cbc, /estimated in service in 1973/);
  assert.match(cbc, /January 1, 1974/);
  assert.match(cbc, /two 230 kV power transformers/);
});

test("1974 station equipment records include Gambo and Memorial", () => {
  assert.match(stationText("GAM"), /66 kV wood-pole structure installed in 1974/);
  assert.match(stationText("MUN"), /17 electromechanical relays/);
  assert.match(stationText("MUN"), /66 kV bus, MUN-T1 and MUN-T2/);
});

test("1974 line records preserve only the dated sections", () => {
  assert.match(stationText("CAR"), /2\.0 km entering Carbonear/);
  assert.match(stationText("CAR"), /2\.01 km entering Carbonear/);
  assert.match(stationText("LAU"), /2\.4 km entering Laurentian/);
  const network = timeline.find((entry) => entry.date === "1972 to 1974");
  assert.match(network.body, /18\.2 km upgraded between 1972 and 1974/);
});

test("1974 system claim retains exact source pages", () => {
  const claim = staticClaims.find((candidate) => candidate.id === "np-1974-system-record");
  assert.ok(claim);
  assert.equal(claim.status, "reported");
  assert.equal(claim.sources.length, 17);
  assert.equal(sources.find((source) => source.id === "nlh-1974-historical-demand")?.pages, "physical PDF p. 2");
  assert.equal(sources.find((source) => source.id === "np-1974-mobile-gas-turbine")?.pages, "physical PDF pp. 1 and 13");
  assert.equal(sources.find((source) => source.id === "np-1974-mob-t2")?.pages, "physical PDF p. 1");
  assert.equal(sources.find((source) => source.id === "nlh-1974-come-by-chance-assets")?.pages, "physical PDF p. 19");
  assert.equal(sources.find((source) => source.id === "np-2024-memorial")?.pages, "physical PDF pp. 378 to 386");
});
