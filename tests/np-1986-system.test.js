import assert from "node:assert/strict";
import test from "node:test";
import { islandTerminalRecords, sources, staticClaims, stationProfiles, timeline } from "../src/data.js";

const recordText = (code) => JSON.stringify(
  islandTerminalRecords.find((station) => station.code === code)
  ?? stationProfiles.find((station) => station.code === code)
);

test("1986 annual sources retain filed pages and evidence state", () => {
  const capital = sources.find((candidate) => candidate.id === "np-1986-capital");
  assert.ok(capital);
  assert.equal(capital.pages, "physical PDF p. 9");
  assert.equal(capital.status, "reported");

  const demand = sources.find((candidate) => candidate.id === "nlh-1986-historical-demand");
  assert.ok(demand);
  assert.equal(demand.pages, "physical PDF p. 2");

  const conflict = sources.find((candidate) => candidate.id === "np-1986-peak-demand-conflict");
  assert.ok(conflict);
  assert.equal(conflict.status, "unresolved");
  assert.equal(conflict.pages, "physical PDF pp. 336 and 338");

  const forecast = sources.find((candidate) => candidate.id === "np-1986-planning-forecast");
  assert.ok(forecast);
  assert.equal(forecast.status, "proposed");
});

test("1986 load and capital claim preserves the source conflict", () => {
  const claim = staticClaims.find((candidate) => candidate.id === "np-1986-system-load-capital");
  assert.ok(claim);
  assert.equal(claim.status, "unresolved");
  assert.deepEqual(
    claim.sources.map((source) => source.pages),
    ["physical PDF p. 2", "physical PDF pp. 336 and 338", "physical PDF p. 8", "physical PDF p. 9"]
  );

  const historical = timeline.find((entry) => entry.date === "1986" && /1,291 MW/.test(entry.title));
  assert.ok(historical);
  assert.match(historical.body, /847\.8 MW/);

  const planning = timeline.find((entry) => entry.date === "1986 planning case");
  assert.ok(planning);
  assert.equal(planning.status, "proposed");
  assert.match(planning.title, /1,548 MW/);

  const conflict = timeline.find((entry) => entry.date === "1986" && entry.status === "unresolved" && /peak values/.test(entry.title));
  assert.ok(conflict);
  assert.match(conflict.body, /863 MW/);
  assert.match(conflict.body, /15\.2 MW/);
  assert.ok(timeline.find((entry) => entry.date === "1986" && /32\.184 million/.test(entry.title)));
});

test("1986 transformer, line, and storm records remain source linked", () => {
  const transformer = timeline.find((entry) => entry.date === "1986" && /Oxen Pond received/.test(entry.title));
  assert.ok(transformer);
  assert.match(transformer.body, /75\/100\/125 MVA/);
  assert.match(transformer.body, /Hardwoods/);

  const line = timeline.find((entry) => entry.date === "1986" && /7\.2 km of 124L/.test(entry.title));
  assert.ok(line);
  assert.match(line.body, /138 kV/);

  const storm = timeline.find((entry) => entry.date === "March 29, 1986");
  assert.ok(storm);
  assert.match(storm.title, /four TL220 structures/);
  assert.match(storm.body, /1 1\/3 days/);

  assert.match(recordText("CLV"), /1986 124L CONSTRUCTION/);
});

test("1986 station and plant histories remain attached to their assets", () => {
  assert.match(recordText("PHR"), /1986 UNIT 2 AND UNIT 3 OVERHAULS/);
  assert.match(recordText("NCH"), /1986 REMOTE SCADA CONTROL/);
  assert.match(recordText("RBK"), /1986 UNIT 2 RUNNER REPLACEMENT/);
  assert.match(recordText("PUN"), /1986 DIESEL ENGINE REFIT/);
  assert.match(recordText("PIT"), /1986 SURGE-PROTECTION INSTALLATION/);
  assert.match(recordText("HCT"), /1986 SURGE-PROTECTION INSTALLATION/);
  assert.match(recordText("PBK"), /1986 SURGE-CAPACITOR INSTALLATION/);
  assert.match(recordText("MOP"), /1986 NEGATIVE-SEQUENCE RELAY/);
  assert.match(recordText("TCV"), /1985 OR 1986 WOODSTAVE PENSTOCK/);
  assert.match(recordText("SBK"), /1986 ISLAND POND DAM REPLACEMENTS/);
});

test("1986 generation and control timeline covers the verified plant work", () => {
  const titles = timeline.filter((entry) => entry.date === "1986").map((entry) => entry.title).join("\n");
  assert.match(titles, /Holyrood rebuilt the gas-turbine installation/);
  assert.doesNotMatch(titles, /Holyrood Unit 3 gained synchronous-condenser capability/);
  assert.match(titles, /Cat Arm installed its station-service PLC/);
  assert.match(titles, /Western Avalon installed a Staticon battery charger/);
  assert.match(titles, /Stephenville installed gas-turbine vibration monitoring/);
  assert.match(titles, /Mobile added generator negative-sequence protection/);
});
