import assert from "node:assert/strict";
import test from "node:test";
import { sources, staticClaims, stationProfiles, timeline } from "../src/data.js";

const stationText = (code) => JSON.stringify(stationProfiles.find((station) => station.code === code));

test("2002 GRA and annual-report sources retain physical pages", () => {
  const expected = new Map([
    ["np-2002-annual-report", "physical PDF pp. 17 to 18"],
    ["np-2003-gra-operations-rev1", "physical PDF pp. 83 to 86"],
    ["np-2003-ca-241-load-factor", "physical PDF p. 1"],
    ["np-2003-ca-279-rev", "physical PDF p. 1"],
    ["np-2003-ca-446-rev", "physical PDF p. 1"]
  ]);

  for (const [id, pages] of expected) {
    const source = sources.find((candidate) => candidate.id === id);
    assert.ok(source, id);
    assert.equal(source.pages, pages, id);
    assert.equal(source.status, "reported", id);
  }
});

test("2002 completion records are attached to their station endpoints", () => {
  assert.match(stationText("SPO"), /replacement portable transformer subsequently failed/);
  assert.match(stationText("GAN"), /wooden bus structure with a steel structure/);
  assert.match(stationText("RBK"), /power transformer and circuit breaker at Rattling Brook/);
  assert.match(stationText("GBE"), /transmission line between Grand Bank and Grand Beach/);
  assert.match(stationText("MOB"), /11 km section and upgraded a 10 km section/);
  assert.match(stationText("GOU"), /11 km section and upgraded a 10 km section/);
});

test("2002 reliability record uses revised actual values", () => {
  const reliability = timeline.find((entry) => entry.date === "2002-12-31");
  assert.ok(reliability);
  assert.match(reliability.body, /17 underfrequency trips against a target of 8/);
  assert.match(reliability.body, /4\.76 interruptions and 4\.54 hours/);
  assert.match(reliability.body, /3\.25 and 4\.18/);

  const claim = staticClaims.find((candidate) => candidate.id === "np-2002-system-reliability");
  assert.ok(claim);
  assert.equal(claim.status, "reported");
  assert.equal(claim.sources.length, 3);
});

test("load-factor claim preserves the actual and forecast boundary", () => {
  const claim = staticClaims.find((candidate) => candidate.id === "np-1998-2005-system-load-factors");
  assert.ok(claim);
  assert.match(claim.scope, /Actual.*1998 to 2001/);
  assert.match(claim.scope, /forecasts.*2002 to 2005/);
});
