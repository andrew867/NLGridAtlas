import assert from "node:assert/strict";
import test from "node:test";
import { sources, staticClaims, stationProfiles, timeline } from "../src/data.js";

const stationText = (code) => JSON.stringify(stationProfiles.find((station) => station.code === code));

test("2001 source records retain physical pages and reported state", () => {
  const annual = sources.find((candidate) => candidate.id === "np-2001-annual-report");
  assert.ok(annual);
  assert.equal(annual.pages, "physical PDF pp. 13 to 16, 18 and 35");
  assert.equal(annual.status, "reported");

  for (const id of ["np-2003-ca-279-rev", "np-2003-ca-446-rev", "np-2003-ca-241-load-factor"]) {
    const source = sources.find((candidate) => candidate.id === id);
    assert.ok(source, id);
    assert.equal(source.pages, "physical PDF p. 1", id);
  }
});

test("2001 station and generation work is attached to documented endpoints", () => {
  assert.match(stationText("LWN"), /new substation constructed at Lawn/);
  assert.match(stationText("BLK"), /reported a rebuilt substation/);
  assert.match(stationText("LEW"), /reported a rebuilt substation/);
  assert.match(stationText("LAU"), /40 km of Laurentian-02/);
  assert.match(stationText("CAB"), /penstock replaced/);
  assert.match(stationText("SBK"), /new runner and updated instrumentation/);
  assert.match(stationText("GRH"), /updated start-up and control technology/);
});

test("Greenhill relocation remains approved future work", () => {
  const greenhill = stationText("GRH");
  assert.match(greenhill, /regulatory approval had been received for a planned 2002 relocation/);
  assert.match(greenhill, /did not record that move as complete/);
});

test("2001 reliability values and sources remain distinct", () => {
  const claim = staticClaims.find((candidate) => candidate.id === "np-2001-system-reliability");
  assert.ok(claim);
  assert.equal(claim.status, "reported");
  assert.equal(claim.sources.length, 2);
  assert.deepEqual(claim.sources.map((source) => source.pages), ["physical PDF p. 13", "physical PDF p. 1"]);

  const reliability = timeline.find((entry) => entry.date === "2001" && entry.category === "reliability");
  assert.ok(reliability);
  assert.match(reliability.title, /99\.96 percent/);
  assert.match(reliability.body, /2\.99 interruptions and 3\.43 hours/);
});

test("2001 financial asset values preserve units", () => {
  const record = timeline.find((entry) => entry.date === "2001-12-31" && entry.category === "financial");
  assert.ok(record);
  assert.match(record.body, /\$181\.928 million/);
  assert.match(record.body, /\$82\.892 million/);
  assert.match(record.body, /\$99\.036 million/);
});
