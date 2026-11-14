import assert from "node:assert/strict";
import test from "node:test";
import { sources, staticClaims, stationProfiles, timeline } from "../src/data.js";

const stationText = (code) => JSON.stringify(stationProfiles.find((station) => station.code === code));

test("2000 source records retain physical pages and reported state", () => {
  const annual = sources.find((candidate) => candidate.id === "np-2000-annual-report");
  assert.ok(annual);
  assert.equal(annual.pages, "physical PDF pp. 11 to 13, 17 and 32");
  assert.equal(annual.status, "reported");

  for (const id of ["np-2003-ca-279-rev", "np-2003-ca-446-rev", "np-2003-ca-241-load-factor"]) {
    const source = sources.find((candidate) => candidate.id === id);
    assert.ok(source, id);
    assert.equal(source.pages, "physical PDF p. 1", id);
  }
});

test("2000 station, distribution and generation work is attached only to documented endpoints", () => {
  assert.match(stationText("SCT"), /new St\. Catherines substation/);
  assert.match(stationText("GBY"), /Gander Bay substation/);
  assert.match(stationText("BLK"), /new 20 km distribution line/);
  assert.match(stationText("ROB"), /25 km section of distribution line/);
  assert.match(stationText("DOY"), /12 km section of distribution line/);
  assert.match(stationText("TCV"), /Tors Cove surge tank/);
  assert.match(stationText("HCP"), /Horse Chops steel penstock/);
});

test("2000 reliability values and sources remain distinct", () => {
  const claim = staticClaims.find((candidate) => candidate.id === "np-2000-system-reliability");
  assert.ok(claim);
  assert.equal(claim.status, "reported");
  assert.equal(claim.sources.length, 2);
  assert.deepEqual(claim.sources.map((source) => source.pages), ["physical PDF pp. 11 to 12", "physical PDF p. 1"]);

  const reliability = timeline.find((entry) => entry.date === "2000" && entry.category === "reliability");
  assert.ok(reliability);
  assert.match(reliability.title, /99\.93 percent/);
  assert.match(reliability.body, /4\.11 interruptions and 5\.33 hours/);
});

test("2000 hydro production and operating-system values are preserved", () => {
  const generation = timeline.find((entry) => entry.date === "2000" && entry.category === "generation" && /415 GWh/.test(entry.title));
  assert.ok(generation);
  assert.match(generation.body, /88 percent/);
  assert.match(generation.body, /450 GWh to 423 GWh/);
  assert.match(generation.body, /Rose Blanche produced 28 GWh/);

  const telecom = timeline.find((entry) => entry.date === "2000" && entry.category === "telecom");
  assert.ok(telecom);
  assert.match(telecom.title, /Fifty-six remote terminal units/);
  assert.match(telecom.body, /56 of 59/);
  assert.match(telecom.body, /200-customer/);
});

test("2000 financial asset values preserve units", () => {
  const record = timeline.find((entry) => entry.date === "2000-12-31" && entry.category === "financial");
  assert.ok(record);
  assert.match(record.body, /\$176\.144 million/);
  assert.match(record.body, /\$78\.844 million/);
  assert.match(record.title, /\$97\.3 million/);
});
