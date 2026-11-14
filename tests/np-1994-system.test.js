import assert from "node:assert/strict";
import test from "node:test";
import { sources, staticClaims, stationProfiles, timeline } from "../src/data.js";

const stationText = (code) => JSON.stringify(stationProfiles.find((station) => station.code === code));

test("1994 sources retain the filed pages and URLs", () => {
  const capital = sources.find((candidate) => candidate.id === "np-1994-capital-variance");
  assert.ok(capital);
  assert.equal(capital.pages, "physical PDF p. 3");
  assert.equal(capital.status, "reported");
  assert.equal(capital.url, "http://www.pub.nl.ca/ARCHIVE/np03cap/files/rfi/CA%20%20%202.pdf");

  const storm = sources.find((candidate) => candidate.id === "np-1994-storm-report");
  assert.ok(storm);
  assert.equal(storm.pages, "physical PDF pp. 22 to 38 and 51 to 63");
  assert.equal(storm.url, "http://www.pub.nl.ca/applications/ARCHIVE/2013/NLHGRASUPP2013/PrudenceReview/files/rfi/PR-PUB-NLH-003.PDF");
});

test("1994 reliability remains distinct from the storm chronology", () => {
  const reliabilityClaim = staticClaims.find((candidate) => candidate.id === "np-1994-system-reliability");
  assert.ok(reliabilityClaim);
  assert.equal(reliabilityClaim.status, "reported");
  assert.deepEqual(reliabilityClaim.sources.map((source) => source.pages), ["physical PDF p. 1"]);

  const reliability = timeline.find((entry) => entry.date === "1994" && entry.category === "reliability");
  assert.ok(reliability);
  assert.match(reliability.title, /4\.38/);
  assert.match(reliability.title, /19\.53 hours/);
  assert.match(reliability.body, /exclude Hydro loss-of-supply/);

  const stormClaim = staticClaims.find((candidate) => candidate.id === "avalon-1994-storm");
  assert.ok(stormClaim);
  assert.equal(stormClaim.status, "reported");
  assert.equal(stormClaim.sources.length, 2);
});

test("1994 capital and operating values preserve filed units", () => {
  const capital = timeline.find((entry) => entry.date === "1994" && entry.category === "network" && /34\.773/.test(entry.title));
  assert.ok(capital);
  assert.match(capital.body, /\$1\.372 million for substations/);
  assert.match(capital.body, /\$1\.907 million for transmission/);
  assert.match(capital.body, /\$0\.792 million for telecommunications/);

  const energy = timeline.find((entry) => entry.date === "1994" && entry.category === "generation");
  assert.ok(energy);
  assert.match(energy.title, /420 GWh/);
  assert.match(energy.body, /4,178 GWh purchased/);
  assert.match(energy.body, /4,371 GWh in sales/);
  assert.match(energy.body, /204,900 customers/);
});

test("December 1994 storm chronology keeps the documented equipment events", () => {
  const storm = timeline.find((entry) => entry.date === "1994-12-08 to 1994-12-11");
  assert.ok(storm);
  assert.match(storm.title, /TL201 and TL217/);
  assert.match(storm.body, /126 km\/h/);
  assert.match(storm.body, /TL217 conductor broke/);
  assert.match(storm.body, /Holyrood 230 kV breaker flashed over/);
  assert.match(storm.body, /two complete Avalon blackouts/);
});

test("post-storm sectionalizing and control-centre communications remain dated", () => {
  const sectionalizing = timeline.find((entry) => entry.date === "1995-11 to 1995-12");
  assert.ok(sectionalizing);
  assert.match(sectionalizing.body, /two Northwest Brook feeders and one Sunnyside feeder/);

  const communications = timeline.find((entry) => entry.date === "1996-01" && /control-centre/.test(entry.title));
  assert.ok(communications);
  assert.match(communications.body, /VHF links were in operation/);
  assert.match(communications.body, /power-line-carrier telephone path remained in progress/);

  assert.match(stationText("SUN"), /NOVEMBER 1995 POST-STORM SECTIONALIZING/);
  assert.match(stationText("NWB"), /NOVEMBER 1995 POST-STORM SECTIONALIZING/);
});
