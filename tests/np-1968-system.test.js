import assert from "node:assert/strict";
import test from "node:test";
import { components, islandTerminalRecords, sources, staticClaims, stationProfiles, timeline } from "../src/data.js";

const stationText = (code) => JSON.stringify(stationProfiles.find((station) => station.code === code));
const terminalText = (code) => JSON.stringify(islandTerminalRecords.find((station) => station.code === code));

test("1968 demand retains only the printed Newfoundland Power peak", () => {
  const demand = timeline.find((entry) => entry.date === "1968" && /172\.9 MW/.test(entry.title));
  assert.ok(demand);
  assert.match(demand.body, /does not print Hydro or Island transmission peak/);
});

test("Bay d'Espoir Unit 4 and Stage I intake controls retain their 1968 records", () => {
  const bayDEspoir = terminalText("BDE");
  assert.match(bayDEspoir, /1968 STAGE I UNIT 4 AND INTAKE CONTROLS/);
  assert.match(bayDEspoir, /Unit 4.*installed and commissioned in 1968/);
  assert.match(bayDEspoir, /Intakes 1 and 2 installed/);
});

test("1968 Hydro transmission records remain attached", () => {
  const network = timeline.find((entry) => entry.date === "1968" && /Six 230 kV and 138 kV transmission records/.test(entry.title));
  assert.ok(network);
  for (const circuit of ["TL206", "TL207", "TL214", "TL218", "TL224", "TL237"]) {
    assert.match(network.body, new RegExp(circuit));
  }
});

test("55L and 404L records preserve their source distinctions", () => {
  const line55 = timeline.find((entry) => entry.date === "1968" && /55L retained/.test(entry.title));
  assert.match(JSON.stringify(line55), /1\.0 km/);

  const line404 = timeline.find((entry) => entry.date === "1967 or 1968" && /404L construction/.test(entry.title));
  assert.equal(line404.status, "unresolved");
  assert.match(line404.body, /1967.*1\.2 km/);
  assert.match(line404.body, /1968.*2\.0 km/);
  assert.match(stationText("WHE"), /1967 TO 1968 404L DATE AND LENGTH CONFLICT/);
});

test("1968 station and equipment records remain attached", () => {
  assert.match(stationText("GLN"), /built in 1968/);
  assert.match(stationText("GLN"), /138\/25 kV/);
  assert.match(stationText("HAR"), /Station built.*1968/);
  assert.match(stationText("HAR"), /HAR-T1.*installed in 1969/);
  assert.match(stationText("QTZ"), /wood 66 kV and 4\.16 kV structures installed in 1968/);
  assert.match(JSON.stringify(components["hwd-t3"]), /entered service at Oxen Pond in 1968/);
  assert.match(terminalText("BBK"), /Control building.*built 1968/);
});

test("1968 system claim retains the 404L conflict and exact source pages", () => {
  const claim = staticClaims.find((candidate) => candidate.id === "np-1968-system-record");
  assert.ok(claim);
  assert.equal(claim.status, "unresolved");
  assert.equal(claim.sources.length, 15);
  assert.equal(sources.find((source) => source.id === "nlh-1968-historical-demand")?.pages, "physical PDF p. 2");
  assert.equal(sources.find((source) => source.id === "nlh-1968-bde-unit4")?.pages, "physical PDF p. 97");
  assert.equal(sources.find((source) => source.id === "nlh-1968-tl214")?.pages, "physical PDF pp. 7 and 14");
  assert.equal(sources.find((source) => source.id === "nlh-1968-tl224")?.pages, "physical PDF p. 581");
  assert.equal(sources.find((source) => source.id === "np-1968-404l-revised-record")?.pages, "physical PDF pp. 316 to 317");
});
