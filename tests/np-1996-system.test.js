import assert from "node:assert/strict";
import test from "node:test";
import { sources, staticClaims, stationProfiles, timeline } from "../src/data.js";

const stationText = (code) => JSON.stringify(stationProfiles.find((station) => station.code === code));

test("1996 source record retains physical pages and reported state", () => {
  const annual = sources.find((candidate) => candidate.id === "np-1996-annual-report");
  assert.ok(annual);
  assert.equal(annual.pages, "physical PDF pp. 8 to 9, 11, 21, 29, 38, 49 and 53");
  assert.equal(annual.status, "reported");
  assert.equal(annual.url, "http://www.pub.nl.ca/ARCHIVE/nfpower03/rfi/CA-213A.pdf");
});

test("1996 reliability values exclude Hydro loss of supply without unavailable measures", () => {
  const claim = staticClaims.find((candidate) => candidate.id === "np-1996-system-reliability");
  assert.ok(claim);
  assert.equal(claim.status, "reported");
  assert.deepEqual(claim.sources.map((source) => source.pages), ["physical PDF p. 8", "physical PDF p. 1"]);

  const reliability = timeline.find((entry) => entry.date === "1996" && entry.category === "reliability");
  assert.ok(reliability);
  assert.match(reliability.title, /2\.66/);
  assert.match(reliability.title, /3\.87 hours/);
  assert.match(reliability.body, /Bonavista/);
  assert.doesNotMatch(reliability.title + reliability.body, /service availability|load factor|operating-area/i);
});

test("1996 capital, energy and fixed assets preserve units", () => {
  const capital = timeline.find((entry) => entry.date === "1996" && entry.category === "network" && /28\.770/.test(entry.title));
  assert.ok(capital);
  assert.match(capital.body, /\$1\.179 million for substations/);
  assert.match(capital.body, /\$1\.634 million for transmission/);
  assert.match(capital.body, /\$0\.930 million for telecommunications/);

  const generation = timeline.find((entry) => entry.date === "1996" && entry.category === "generation" && /423 GWh/.test(entry.title));
  assert.ok(generation);
  assert.match(generation.body, /4,236 million kWh/);
  assert.match(generation.body, /220,675 MWh/);
  assert.match(generation.body, /4\.7 percent/);

  const financial = timeline.find((entry) => entry.date === "1996-12-31" && entry.category === "financial");
  assert.ok(financial);
  assert.match(financial.title, /\$47\.189 million/);
  assert.match(financial.title, /\$44\.005 million/);
  assert.match(financial.body, /\$87\.130 million/);
  assert.match(financial.body, /\$70\.725 million/);
});

test("1996 Rose Blanche proposal remains separate from later construction", () => {
  const record = stationText("RBH");
  assert.match(record, /1996 FILED DEVELOPMENT PLAN/);
  assert.match(record, /Filed rating[^]*5\.5 MW/);
  assert.match(record, /Filed annual production[^]*22 GWh/);
  assert.match(record, /1997 CONSTRUCTION PROGRAM/);
  assert.match(record, /DECEMBER 22, 1998 ENERGIZATION/);
});

test("early 1997 telecommunications statement keeps its reported timing", () => {
  const telecom = timeline.find((entry) => entry.date === "early 1997" && entry.category === "telecom");
  assert.ok(telecom);
  assert.match(telecom.title, /substantially completed/);
  assert.match(telecom.body, /radio and substation-control capabilities/);
  assert.equal(telecom.sourceId, "np-1996-annual-report");
});
