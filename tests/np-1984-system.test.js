import assert from "node:assert/strict";
import test from "node:test";
import { components, islandTerminalRecords, sources, staticClaims, stationProfiles, timeline } from "../src/data.js";

const recordText = (code) => JSON.stringify(
  islandTerminalRecords.find((station) => station.code === code)
  ?? stationProfiles.find((station) => station.code === code)
);

test("1984 demand, capital and planning sources retain filed pages", () => {
  assert.equal(sources.find((source) => source.id === "nlh-1984-historical-demand")?.pages, "physical PDF p. 2");
  assert.equal(sources.find((source) => source.id === "np-1984-capital")?.pages, "physical PDF p. 9");
  assert.equal(sources.find((source) => source.id === "np-1984-planning-forecast")?.status, "proposed");

  const claim = staticClaims.find((candidate) => candidate.id === "np-1984-system-record");
  assert.ok(claim);
  assert.equal(claim.status, "reported");
  assert.equal(claim.sources.length, 6);
});

test("1984 actual and planning values remain distinct", () => {
  const actual = timeline.find((entry) => entry.date === "1984" && /1,186 MW/.test(entry.title));
  assert.ok(actual);
  assert.match(actual.body, /833\.8 MW/);
  assert.match(actual.body, /45\.6 MW/);

  const planning = timeline.find((entry) => entry.date === "1984 planning case");
  assert.ok(planning);
  assert.equal(planning.status, "proposed");
  assert.match(planning.title, /1,423 MW/);
  assert.match(planning.body, /99 GWh surplus/);

  const capital = timeline.find((entry) => entry.date === "1984" && /\$30\.615 million/.test(entry.title));
  assert.ok(capital);
});

test("1984 Avalon storm record retains line, structure and restoration values", () => {
  const failures = timeline.find((entry) => entry.date === "April 9 to 14, 1984");
  assert.ok(failures);
  assert.match(failures.body, /27\.5 conductor miles/);
  assert.match(failures.body, /35, 29, 14, 9, and 14 days/);

  const operations = timeline.find((entry) => entry.date === "April 1984" && /rotated Avalon feeders manually/.test(entry.title));
  assert.ok(operations);
  assert.match(operations.body, /had not yet implemented SCADA/);

  const mechanics = timeline.find((entry) => entry.date === "1984" && /TL201 guyed angle structure/.test(entry.title));
  assert.ok(mechanics);
  assert.match(mechanics.body, /1\.60 inches radial ice/);
  assert.match(mechanics.body, /2\.0 inches radial ice/);
});

test("1984 network and plant work is attached to station records", () => {
  assert.match(recordText("BRB"), /1984 DISTRIBUTION TRANSFORMER/);
  assert.match(recordText("LBK"), /1984 G4 AND CROSS POND SPILLWAY/);
  assert.match(recordText("GRH"), /1984 DERATING/);
  assert.match(recordText("PUN"), /1984 WOODSTAVE PENSTOCK/);
  assert.match(JSON.stringify(components["hwd-g1"]), /1984 plant work/);
});

test("Tors Cove penstock date conflict retains all three reported years", () => {
  const source = sources.find((candidate) => candidate.id === "np-1984-tors-cove-penstock-conflict");
  assert.ok(source);
  assert.equal(source.status, "unresolved");

  const entry = timeline.find((candidate) => candidate.date === "1984, 1985, or 1986" && /Tors Cove/.test(candidate.title));
  assert.ok(entry);
  assert.equal(entry.status, "unresolved");
  assert.match(recordText("TCV"), /later Newfoundland Power records separately state 1984, 1985, and 1986/);
});
