import assert from "node:assert/strict";
import test from "node:test";
import { components, islandTerminalRecords, sources, staticClaims, stationProfiles, timeline } from "../src/data.js";

const stationText = (code) => JSON.stringify(stationProfiles.find((station) => station.code === code));
const terminalText = (code) => JSON.stringify(islandTerminalRecords.find((station) => station.code === code));
const assetText = (code) => JSON.stringify({
  terminal: islandTerminalRecords.find((station) => station.code === code),
  station: stationProfiles.find((station) => station.code === code)
});

test("1967 demand retains the printed Newfoundland Power peak", () => {
  const demand = timeline.find((entry) => entry.date === "1967" && /156\.3 MW/.test(entry.title));
  assert.ok(demand);
  assert.match(demand.body, /Newfoundland Power column/);
  assert.equal(demand.sourceId, "nlh-1967-historical-demand");
});

test("Bay d'Espoir Stage I Units 1 to 3 retain their 1967 commissioning record", () => {
  const bayDEspoir = terminalText("BDE");
  assert.match(bayDEspoir, /1967 STAGE I UNITS 1 TO 3/);
  assert.match(bayDEspoir, /Units 1, 2 and 3 installed and commissioned in 1967/);
});

test("1967 transmission construction remains attached to four circuits", () => {
  const network = timeline.find((entry) => entry.date === "1967" && /TL205, TL211, TL222 and TL228/.test(entry.title));
  assert.ok(network);
  for (const circuit of ["TL205", "TL211", "TL222", "TL228"]) assert.match(network.title, new RegExp(circuit));
  assert.equal(sources.find((source) => source.id === "nlh-1967-transmission-lines")?.pages, "physical PDF p. 4");
});

test("Sunnyside and Stony Brook retain their conflicting commissioning records", () => {
  const sunnyside = islandTerminalRecords.find((station) => station.code === "SUN");
  const stonyBrook = islandTerminalRecords.find((station) => station.code === "STB");
  assert.equal(sunnyside.status, "unresolved");
  assert.equal(stonyBrook.status, "unresolved");
  assert.match(JSON.stringify(sunnyside), /1965 TO 1967 COMMISSIONING AND RING-BUS RECORD/);
  assert.match(JSON.stringify(stonyBrook), /1966 TO 1967 IN-SERVICE DATE CONFLICT/);
});

test("1967 terminal, station and transformer records remain attached", () => {
  assert.match(terminalText("BBK"), /1967 TERMINAL STATION 1 AND ORIGINAL TRANSFORMERS/);
  assert.match(terminalText("BBK"), /C\.G\.E\. 286625/);
  assert.match(terminalText("SBR"), /1967 T1 AND TL222 RECORD/);
  assert.match(assetText("WAV"), /1967 230\/138 KV TRANSFORMER/);
  assert.match(assetText("BUC"), /1967 ORIGINAL 230\/66 KV TRANSFORMER/);
  assert.match(assetText("MAS"), /Built in 1967/);
  assert.match(stationText("BLK"), /Station built.*1967/);
  assert.match(stationText("MOL"), /66 kV structure.*wood; dated 1967/);
  assert.match(assetText("WBK"), /1967 MAIN-VALVE REPLACEMENT/);
  assert.match(JSON.stringify(components["opd-t1"]), /in service 1967/);
});

test("Burgeo and powerline-carrier sources retain exact page locators", () => {
  assert.equal(sources.find((source) => source.id === "nlh-1967-burgeo")?.pages, "physical PDF pp. 219 to 221");
  assert.equal(sources.find((source) => source.id === "nlh-1967-burgeo-feeders")?.pages, "physical PDF p. 419");
  assert.equal(sources.find((source) => source.id === "nlh-1967-plc-carrier")?.pages, "physical PDF p. 42");
  const carrier = timeline.find((entry) => entry.date === "1967" && /powerline-carrier equipment/.test(entry.title));
  assert.match(carrier.body, /TL202.*TL207.*TL236.*TL218/);
});

test("1967 system claim retains both date conflicts and its source set", () => {
  const claim = staticClaims.find((candidate) => candidate.id === "np-1967-system-record");
  assert.ok(claim);
  assert.equal(claim.status, "unresolved");
  assert.equal(claim.sources.length, 15);
  assert.ok(claim.sources.some((reference) => reference.sourceId === "nlh-1967-sunnyside-history-conflict"));
  assert.ok(claim.sources.some((reference) => reference.sourceId === "nlh-1967-burgeo-feeders"));
});
