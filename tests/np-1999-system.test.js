import assert from "node:assert/strict";
import test from "node:test";
import { sources, staticClaims, stationProfiles, timeline } from "../src/data.js";

const stationText = (code) => JSON.stringify(stationProfiles.find((station) => station.code === code));

test("1999 source records retain physical pages and reported state", () => {
  const annual = sources.find((candidate) => candidate.id === "np-1999-annual-report");
  assert.ok(annual);
  assert.equal(annual.pages, "physical PDF pp. 10 to 13, 15, 20, 29 and 35");
  assert.equal(annual.status, "reported");

  for (const id of ["np-2003-ca-279-rev", "np-2003-ca-446-rev", "np-2003-ca-241-load-factor"]) {
    const source = sources.find((candidate) => candidate.id === id);
    assert.ok(source, id);
    assert.equal(source.pages, "physical PDF p. 1", id);
  }
});

test("1999 station and hydro work is attached only to documented endpoints", () => {
  assert.match(stationText("RBH"), /AUGUST 1999 OFFICIAL OPENING/);
  assert.match(stationText("MOP"), /Mobile hydro-plant surge tank/);
  assert.match(stationText("PHR"), /Petty Harbour penstock/);
  assert.match(stationText("HCP"), /Horse Chops hydro-plant surge tank/);
  assert.match(stationText("DUN"), /Dunville was among the areas/);
  assert.match(stationText("BOT"), /Botwood was among the areas/);
  assert.match(stationText("RVH"), /Riverhead was among the areas/);
  assert.doesNotMatch(stationText("KBR"), /Botwood was among the areas/);
});

test("1999 reliability values and sources remain distinct", () => {
  const claim = staticClaims.find((candidate) => candidate.id === "np-1999-system-reliability");
  assert.ok(claim);
  assert.equal(claim.status, "reported");
  assert.equal(claim.sources.length, 2);
  assert.deepEqual(claim.sources.map((source) => source.pages), ["physical PDF p. 10", "physical PDF p. 1"]);

  const reliability = timeline.find((entry) => entry.date === "1999" && entry.category === "reliability");
  assert.ok(reliability);
  assert.match(reliability.title, /99\.89 percent/);
  assert.match(reliability.body, /5\.28 interruptions and 9\.36 hours/);
});

test("1999 system and generation values preserve their units", () => {
  const telecom = timeline.find((entry) => entry.date === "1999" && entry.category === "telecom");
  assert.ok(telecom);
  assert.match(telecom.title, /\$2\.6 million/);
  assert.match(telecom.body, /Telephony Video Data/);

  const feeder = timeline.find((entry) => entry.date === "1999" && entry.category === "network");
  assert.ok(feeder);
  assert.match(feeder.title, /\$2\.8 million/);
  assert.match(feeder.body, /more than 250 outages/);
  assert.match(feeder.body, /10,000 km/);

  const generation = timeline.find((entry) => entry.date === "1999" && entry.category === "generation" && /450 GWh/.test(entry.title));
  assert.ok(generation);
  assert.match(generation.body, /4,292 million kWh/);
});

test("1999 financial asset values preserve units", () => {
  const record = timeline.find((entry) => entry.date === "1999-12-31" && entry.category === "financial");
  assert.ok(record);
  assert.match(record.body, /\$171\.604 million/);
  assert.match(record.body, /\$76\.225 million/);
  assert.match(record.title, /\$95\.379 million/);
});
