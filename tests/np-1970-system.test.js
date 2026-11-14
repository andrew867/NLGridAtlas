import assert from "node:assert/strict";
import test from "node:test";
import { components, islandTerminalRecords, sources, staticClaims, stationProfiles, timeline } from "../src/data.js";

const stationText = (code) => JSON.stringify(stationProfiles.find((station) => station.code === code));
const terminalText = (code) => JSON.stringify(islandTerminalRecords.find((station) => station.code === code));

test("1970 demand retains only the printed peak", () => {
  const demand = timeline.find((entry) => entry.date === "1970" && /223\.7 MW/.test(entry.title));
  assert.ok(demand);
  assert.match(demand.body, /does not print Hydro or Island transmission peak/);
});

test("Holyrood separates installation, commissioning and later equipment states", () => {
  assert.match(components["hrd-summary"].summary, /Unit 1 was commissioned in 1970 and Unit 2 in 1971/);
  assert.match(JSON.stringify(components["hrd-summary"]), /Unit 1 and Unit 2 GE generators installed in 1970/);
  assert.match(JSON.stringify(components["hrd-t2"]), /Original T2.*170 MVA.*installed in 1970/);
  assert.match(JSON.stringify(components["hrd-t3"]), /installed in the T1 position in 1970/);
});

test("1970 transmission construction remains source specific", () => {
  const network = timeline.find((entry) => entry.date === "1970" && /Five Hydro wood-pole lines/.test(entry.title));
  assert.match(network.body, /TL220 connected Bay d'Espoir to Barachoix through English Harbour/);
  assert.match(network.body, /TL221, TL225, TL226 and TL227/);
  assert.match(terminalText("HAW"), /1970 TL221 ORIGINAL CORRIDOR/);
});

test("Hawke's Bay and Bay d'Espoir retain 1970 physical assets", () => {
  assert.match(terminalText("HAW"), /1970 ORIGINAL TERMINAL STATION/);
  assert.match(terminalText("HAW"), /69\/25-12\.5 kV/);
  assert.match(terminalText("BDE"), /1970 STAGE II SURGE TANK 3/);
  assert.match(terminalText("BDE"), /112 m surge tank/);
});

test("1970 transformer and terminal assets remain attached to their stations", () => {
  assert.match(stationText("MAS"), /1970 TRANSFORMER LATER MOVED TO BUCHANS/);
  assert.match(stationText("BUC"), /1970 MASSEY DRIVE INSTALLATION/);
  assert.match(stationText("HGR"), /1970 HGR-T1 INSTALLATION/);
  assert.match(stationText("BLK"), /1970 HYDRO TERMINAL ASSET RECORD/);
  assert.match(stationText("BLK"), /in-service estimate unknown/);
});

test("Holyrood paging remains a dated communications record", () => {
  const paging = timeline.find((entry) => entry.date === "1970" && /paging system/.test(entry.title));
  assert.match(paging.body, /primary emergency-protocol communication system/);
  assert.match(paging.body, /VHF mobile radio system/);
});

test("1970 system claim retains exact source pages", () => {
  const claim = staticClaims.find((candidate) => candidate.id === "np-1970-system-record");
  assert.ok(claim);
  assert.equal(claim.status, "reported");
  assert.equal(claim.sources.length, 13);
  assert.equal(sources.find((source) => source.id === "nlh-1970-hawkes-bay")?.pages, "physical PDF pp. 570 to 571");
  assert.equal(sources.find((source) => source.id === "nlh-1970-tl220")?.pages, "physical PDF p. 55");
  assert.equal(sources.find((source) => source.id === "nlh-1970-holyrood-paging")?.pages, "physical PDF pp. 13 to 14");
});
