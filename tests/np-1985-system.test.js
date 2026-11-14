import assert from "node:assert/strict";
import test from "node:test";
import { components, islandTerminalRecords, sources, staticClaims, stationProfiles, timeline } from "../src/data.js";

const recordText = (code) => JSON.stringify(
  islandTerminalRecords.find((station) => station.code === code)
  ?? stationProfiles.find((station) => station.code === code)
);

test("1985 annual sources retain filed pages and evidence state", () => {
  const capital = sources.find((candidate) => candidate.id === "np-1985-capital");
  assert.ok(capital);
  assert.equal(capital.pages, "physical PDF p. 9");

  const demand = sources.find((candidate) => candidate.id === "nlh-1985-historical-demand");
  assert.ok(demand);
  assert.equal(demand.pages, "physical PDF p. 2");

  const statistics = sources.find((candidate) => candidate.id === "np-1985-operating-statistics");
  assert.ok(statistics);
  assert.equal(statistics.status, "unresolved");

  const forecast = sources.find((candidate) => candidate.id === "np-1985-planning-forecast");
  assert.ok(forecast);
  assert.equal(forecast.status, "proposed");
});

test("1985 system claim preserves actual and planning records", () => {
  const claim = staticClaims.find((candidate) => candidate.id === "np-1985-system-record");
  assert.ok(claim);
  assert.equal(claim.status, "unresolved");
  assert.deepEqual(
    claim.sources.map((source) => source.pages),
    ["physical PDF p. 2", "physical PDF p. 24", "physical PDF p. 8", "physical PDF p. 9"]
  );

  const demand = timeline.find((entry) => entry.date === "1985" && /1,180 MW/.test(entry.title));
  assert.ok(demand);
  assert.match(demand.body, /825\.6 MW/);

  const energy = timeline.find((entry) => entry.date === "1985" && /3,531 GWh/.test(entry.title));
  assert.ok(energy);
  assert.match(energy.body, /172,119 customers/);

  const planning = timeline.find((entry) => entry.date === "1985 planning case");
  assert.ok(planning);
  assert.equal(planning.status, "proposed");
  assert.match(planning.title, /1,487 MW/);
});

test("Holyrood Unit 3 commissioning date is corrected to 1985", () => {
  const entry = timeline.find((candidate) => candidate.date === "1985" && /synchronous-condenser capability/.test(candidate.title));
  assert.ok(entry);
  assert.equal(entry.sourceId, "nlh-2011-holyrood-sc-upgrade");
  assert.equal(entry.pages, "physical PDF p. 814; project p. 7");
  assert.match(JSON.stringify(components["hrd-g3"]), /since 1985/);
});

test("1985 generation and station histories remain attached to their assets", () => {
  assert.match(recordText("CAT"), /1985; two 63\.5 MW Pelton/);
  assert.match(recordText("GLN"), /1985 HIGH-VOLTAGE AND LOW-VOLTAGE STRUCTURES/);
  assert.match(recordText("PUN"), /1985 WATER-CONTROL STRUCTURE WORK/);
  assert.match(recordText("TCV"), /1985 G3 MAIN INLET VALVE/);
  assert.match(recordText("PBK"), /1985 POWERHOUSE VENTILATION/);
  assert.match(recordText("NCH"), /1985 WICKET GATES AND LINKAGES/);
  assert.match(recordText("MAS"), /1985 DC system/);
  assert.match(JSON.stringify(components["hwd-g1"]), /T5 register date.*1985/);
});

test("1985 Tors Cove penstock year remains unresolved", () => {
  const source = sources.find((candidate) => candidate.id === "np-1985-tors-cove-penstock-conflict");
  assert.ok(source);
  assert.equal(source.status, "unresolved");

  const entry = timeline.find((candidate) => candidate.date === "1984, 1985, or 1986" && /Tors Cove/.test(candidate.title));
  assert.ok(entry);
  assert.equal(entry.status, "unresolved");
  assert.match(entry.body, /1984, 1985, or 1986/);
});

test("1985 telecommunications and regulatory records are source linked", () => {
  const titles = timeline.filter((entry) => entry.date === "1985" || entry.date === "November 8, 1985").map((entry) => entry.title).join("\n");
  assert.match(titles, /expanded its VHF and UHF systems/);
  assert.match(titles, /Rate Stabilization Plan/);
  assert.ok(sources.find((candidate) => candidate.id === "np-1985-vhf"));
  assert.ok(sources.find((candidate) => candidate.id === "np-1985-uhf-link"));
  assert.ok(sources.find((candidate) => candidate.id === "nlh-1985-rsp"));
});
