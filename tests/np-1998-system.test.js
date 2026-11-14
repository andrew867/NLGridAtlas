import assert from "node:assert/strict";
import test from "node:test";
import { sources, staticClaims, stationProfiles, timeline } from "../src/data.js";

const stationText = (code) => JSON.stringify(stationProfiles.find((station) => station.code === code));

test("1998 source records retain physical pages and reported state", () => {
  const annual = sources.find((candidate) => candidate.id === "np-1998-annual-report");
  assert.ok(annual);
  assert.equal(annual.pages, "physical PDF pp. 7, 10 to 11, 14, 17, 25 and 29");
  assert.equal(annual.status, "reported");

  for (const id of ["np-2003-ca-279-rev", "np-2003-ca-446-rev", "np-2003-ca-241-load-factor"]) {
    const source = sources.find((candidate) => candidate.id === id);
    assert.ok(source, id);
    assert.equal(source.pages, "physical PDF p. 1", id);
  }
});

test("1998 Rose Blanche energization is distinct from the 1999 opening", () => {
  const record = stationText("RBH");
  assert.match(record, /DECEMBER 22, 1998 ENERGIZATION/);
  assert.match(record, /AUGUST 1999 OFFICIAL OPENING/);
  assert.match(record, /6\.1 MW in the annual report/);
});

test("1998 reliability values exclude Hydro loss of supply without inventing availability", () => {
  const claim = staticClaims.find((candidate) => candidate.id === "np-1998-system-reliability");
  assert.ok(claim);
  assert.equal(claim.status, "reported");
  assert.equal(claim.sources.length, 2);
  assert.deepEqual(claim.sources.map((source) => source.pages), ["physical PDF p. 10", "physical PDF p. 1"]);

  const reliability = timeline.find((entry) => entry.date === "1998" && entry.category === "reliability");
  assert.ok(reliability);
  assert.match(reliability.title, /3\.21/);
  assert.match(reliability.title, /4\.91 hours/);
  assert.doesNotMatch(reliability.title + reliability.body, /service availability/i);
});

test("1998 communications record separates installed and planned systems", () => {
  const telecom = timeline.find((entry) => entry.date === "1998" && entry.category === "telecom");
  assert.ok(telecom);
  assert.match(telecom.title, /Telephony Video Data entered service/);
  assert.match(telecom.body, /2,000 simultaneous callers/);
  assert.match(telecom.body, /60 remote power-quality monitors/);
  assert.match(telecom.body, /replacement SCADA system remained planned for 1999/);
});

test("1998 operating and financial values preserve units", () => {
  const generation = timeline.find((entry) => entry.date === "1998" && entry.category === "generation" && /429 GWh/.test(entry.title));
  assert.ok(generation);
  assert.match(generation.body, /4,259 million kWh/);
  assert.match(generation.body, /957 MW/);

  const financial = timeline.find((entry) => entry.date === "1998-12-31" && entry.category === "financial");
  assert.ok(financial);
  assert.match(financial.body, /\$167\.328 million/);
  assert.match(financial.body, /\$73\.332 million/);
  assert.match(financial.title, /\$93\.996 million/);
});
