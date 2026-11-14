import assert from "node:assert/strict";
import test from "node:test";
import { islandTerminalRecords, sources, staticClaims, stationProfiles, timeline } from "../src/data.js";

const stationText = (code) => JSON.stringify(stationProfiles.find((station) => station.code === code));

test("1995 capital source retains the filed page and URL", () => {
  const capital = sources.find((candidate) => candidate.id === "np-2003-capital-variance-history");
  assert.ok(capital);
  assert.equal(capital.pages, "physical PDF pp. 1 and 4");
  assert.equal(capital.status, "reported");
  assert.equal(capital.url, "http://www.pub.nl.ca/ARCHIVE/np03cap/files/rfi/CA%20%20%202.pdf");
});

test("1995 reliability values exclude Hydro loss of supply", () => {
  const claim = staticClaims.find((candidate) => candidate.id === "np-1995-system-reliability");
  assert.ok(claim);
  assert.equal(claim.status, "reported");
  assert.deepEqual(claim.sources.map((source) => source.pages), ["physical PDF p. 1"]);

  const reliability = timeline.find((entry) => entry.date === "1995" && entry.category === "reliability");
  assert.ok(reliability);
  assert.match(reliability.title, /3\.70/);
  assert.match(reliability.title, /5\.34 hours/);
  assert.match(reliability.body, /exclude Hydro loss-of-supply/);
});

test("1995 capital, energy and asset values preserve source units", () => {
  const capital = timeline.find((entry) => entry.date === "1995" && entry.category === "network" && /30\.782/.test(entry.title));
  assert.ok(capital);
  assert.match(capital.body, /\$1\.278 million for substations/);
  assert.match(capital.body, /\$1\.790 million for transmission/);
  assert.match(capital.body, /\$0\.552 million for telecommunications/);

  const generation = timeline.find((entry) => entry.date === "1995" && entry.category === "generation" && /423\.1 GWh/.test(entry.title));
  assert.ok(generation);
  assert.match(generation.body, /4,186,353 MWh/);
  assert.match(generation.body, /212,936 MWh/);
  assert.match(generation.body, /4\.6 percent/);

  const financial = timeline.find((entry) => entry.date === "1995-12-31" && entry.category === "financial");
  assert.ok(financial);
  assert.match(financial.title, /\$46\.310 million/);
  assert.match(financial.title, /\$44\.707 million/);
  assert.match(financial.body, /\$7\.693 million/);
});

test("1995 major network changes remain attached to the documented systems", () => {
  const stony = timeline.find((entry) => entry.date === "1995" && /Stony Brook/.test(entry.title));
  assert.ok(stony);
  assert.equal(stony.sourceId, "nlh-system-design-2015");
  const stonyRecord = JSON.stringify(islandTerminalRecords.find((station) => station.code === "STB"));
  assert.match(stonyRecord, /converted to a 230 kV ring bus in 1995/);

  const northern = timeline.find((entry) => entry.date === "1995" && /Great Northern Peninsula/.test(entry.title));
  assert.ok(northern);
  assert.match(northern.body, /TL241/);
  assert.match(northern.body, /TL244/);
  assert.match(northern.body, /TL256/);
});

test("1995 plant work is distinct inside Greenhill and Pierre's Brook histories", () => {
  const greenhill = stationText("GRH");
  assert.match(greenhill, /1995 GAS-GENERATOR AND POWER-TURBINE WORK/);
  assert.match(greenhill, /cracked casing replaced with a used casing/);

  const pierresBrook = stationText("PBK");
  assert.match(pierresBrook, /1995 RUNNER AND STATION-SERVICE TRANSFORMER WORK/);
  assert.match(pierresBrook, /4,100 kW actual peak output/);
});
