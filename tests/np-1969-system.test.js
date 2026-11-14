import assert from "node:assert/strict";
import test from "node:test";
import { components, islandTerminalRecords, sources, staticClaims, stationProfiles, timeline } from "../src/data.js";

const stationText = (code) => JSON.stringify(stationProfiles.find((station) => station.code === code));
const terminalText = (code) => JSON.stringify(islandTerminalRecords.find((station) => station.code === code));

test("1969 demand retains only the printed peak", () => {
  const demand = timeline.find((entry) => entry.date === "1969" && /188\.8 MW/.test(entry.title));
  assert.ok(demand);
  assert.match(demand.body, /does not print Hydro or Island transmission peak/);
});

test("Holyrood commissioning conflict remains unresolved", () => {
  assert.equal(components["hrd-summary"].status, "unresolved");
  assert.match(components["hrd-summary"].summary, /Unit 1 to 1969/);
  assert.match(components["hrd-summary"].summary, /Unit 1 to late 1969 and Unit 2 to early 1970/);
  assert.match(components["hrd-summary"].summary, /complete Stage I to 1971/);
  assert.match(JSON.stringify(components["hrd-summary"]), /Original unit rating.*150 MW each/);
});

test("Holyrood 1969 transformers and facilities remain attached", () => {
  const summary = JSON.stringify(components["hrd-summary"]);
  assert.match(summary, /UST-1 and UST-2.*Federal Pioneer.*10 MVA each/);
  assert.match(summary, /SST-12.*10\.5\/14 MVA.*69 kV/);
  assert.match(summary, /1969 black start.*15 MW/);
  assert.match(summary, /1969 marine terminal.*Initial construction/);
  assert.match(JSON.stringify(components["hrd-t5"]), /Westinghouse.*1969.*15\/20\/25 MVA.*230\/69 kV/);
});

test("Bay d'Espoir Stage II retains its 1969 record", () => {
  assert.match(terminalText("BDE"), /1969 STAGE II UNITS 5 AND 6/);
  assert.match(terminalText("BDE"), /Units 5 and 6 commissioned in 1969/);
  assert.match(terminalText("BDE"), /solid copper-bar design/);
});

test("1969 stations and transmission remain source specific", () => {
  assert.match(stationText("SMV"), /Station built.*1969 as a distribution substation/);
  assert.match(stationText("RVH"), /Riverhead was built in 1969/);
  const network = timeline.find((entry) => entry.date === "1969" && /Summerville, 94L and TL215/.test(entry.title));
  assert.match(network.body, /66 kV 94L corridor/);
  assert.match(network.body, /TL215 from Doyles to Grand Bay/);
});

test("Salt Pond turbine history remains attached to Wesleyville", () => {
  assert.match(stationText("WES"), /installed at Salt Pond in 1969/);
  assert.match(stationText("WES"), /moved to New-Wes-Valley in 2003/);
});

test("1969 system claim retains conflicts and exact pages", () => {
  const claim = staticClaims.find((candidate) => candidate.id === "np-1969-system-record");
  assert.ok(claim);
  assert.equal(claim.status, "unresolved");
  assert.equal(claim.sources.length, 12);
  assert.equal(sources.find((source) => source.id === "nlh-1969-historical-demand")?.pages, "physical PDF p. 2");
  assert.equal(sources.find((source) => source.id === "nlh-1969-holyrood-commissioning-conflict")?.pages, "physical PDF p. 66");
  assert.equal(sources.find((source) => source.id === "nlh-1969-bde-stage2")?.pages, "physical PDF p. 97");
  assert.equal(sources.find((source) => source.id === "nlh-1969-assigned-assets")?.pages, "physical PDF pp. 14 to 15");
});
