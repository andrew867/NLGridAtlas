import assert from "node:assert/strict";
import test from "node:test";
import { islandTerminalRecords, sources, staticClaims, stationProfiles, timeline } from "../src/data.js";

const stationText = (code) => JSON.stringify(stationProfiles.find((station) => station.code === code));
const terminalText = (code) => JSON.stringify(islandTerminalRecords.find((station) => station.code === code));

test("1990 sources retain filed pages and URLs", () => {
  const reliability = sources.find((candidate) => candidate.id === "np-1990-reliability-capital");
  assert.ok(reliability);
  assert.equal(reliability.pages, "physical PDF p. 4");
  assert.equal(reliability.url, "http://www.pub.nl.ca/applications/2021/NP2021Capital/rfis/CA-NP-004.PDF");

  const gnp = sources.find((candidate) => candidate.id === "nlh-1990-gnp-reconfiguration");
  assert.ok(gnp);
  assert.equal(gnp.pages, "physical PDF pp. 3 to 4");

  const storm = sources.find((candidate) => candidate.id === "nlh-1990-tl217-storm");
  assert.ok(storm);
  assert.equal(storm.pages, "physical PDF p. 3");
});

test("1990 reliability and operating totals preserve filed units", () => {
  const claim = staticClaims.find((candidate) => candidate.id === "np-1990-system-reliability");
  assert.ok(claim);
  assert.deepEqual(claim.sources.map((source) => source.pages), ["physical PDF p. 4"]);

  const reliability = timeline.find((entry) => entry.date === "1990" && entry.category === "reliability");
  assert.ok(reliability);
  assert.match(reliability.title, /2\.46/);
  assert.match(reliability.title, /4\.55 hours/);

  const capital = timeline.find((entry) => entry.date === "1990" && /67\.074/.test(entry.title));
  assert.ok(capital);

  const energy = timeline.find((entry) => entry.date === "1990" && entry.category === "generation" && /411 GWh/.test(entry.title));
  assert.ok(energy);
  assert.match(energy.body, /4,008 GWh purchased/);
  assert.match(`${energy.title} ${energy.body}`, /1,074 MW/);
  assert.match(energy.body, /192,365 customer/);
});

test("1990 transmission work and storm record remain connected", () => {
  assert.match(terminalText("PBR"), /1990 TERMINAL ADDITION AND LINE RECONFIGURATION/);
  assert.match(terminalText("PBR"), /TL262/);
  assert.match(terminalText("PBR"), /86\.625 km/);

  const newLines = timeline.find((entry) => entry.date === "1990" && /TL259 and TL260/.test(entry.title));
  assert.ok(newLines);
  assert.match(newLines.body, /36 km/);

  const storm = timeline.find((entry) => entry.date === "1990-04-25" && /TL217/.test(entry.title));
  assert.ok(storm);
  assert.match(storm.body, /within 24 hours/);
});

test("1990 generation, cable and carrier records remain source-linked", () => {
  assert.match(terminalText("BDE"), /1990 UNIT 7 PARTIAL-DISCHARGE MONITORING/);
  assert.match(stationText("MOP"), /1990 TURBINE-RUNNER REPLACEMENT/);
  assert.match(stationText("BCV"), /1990 SUBMARINE-CABLE INSTALLATION/);
  assert.match(stationText("BCV"), /1955 was abandoned after a 1990 fault/);

  const holyrood = timeline.find((entry) => entry.date === "1990" && /Holyrood Unit 1/.test(entry.title));
  assert.ok(holyrood);
  assert.match(holyrood.body, /175 MW/);

  const gasTurbine = timeline.find((entry) => entry.date === "1990" && /Mobile gas turbine/.test(entry.title));
  assert.ok(gasTurbine);
  assert.match(`${gasTurbine.title} ${gasTurbine.body}`, /overhaul|repair/i);

  const carrier = timeline.find((entry) => entry.date === "1990" && /powerline-carrier/.test(entry.title));
  assert.ok(carrier);
  assert.match(carrier.body, /TL239A and TL239B/);
});
