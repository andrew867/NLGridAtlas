import assert from "node:assert/strict";
import test from "node:test";
import { components, sources, staticClaims, stationProfiles, timeline } from "../src/data.js";

const stationText = (code) => JSON.stringify(stationProfiles.find((station) => station.code === code));

test("1993 sources retain the filed pages and URLs", () => {
  const capital = sources.find((candidate) => candidate.id === "np-1993-capital-variance");
  assert.ok(capital);
  assert.equal(capital.pages, "physical PDF p. 2");
  assert.equal(capital.status, "reported");

  const line = sources.find((candidate) => candidate.id === "np-1993-70l");
  assert.ok(line);
  assert.equal(line.url, "http://www.pub.nl.ca/applications/IslandInterconnectedSystem/files/rfi/PUB-NP-147.pdf");
  assert.equal(line.pages, "physical PDF p. 1");

  const monitoring = sources.find((candidate) => candidate.id === "nlh-1993-hawke-hill");
  assert.ok(monitoring);
  assert.equal(monitoring.pages, "physical PDF p. 69");
});

test("1993 reliability and operating totals preserve filed units", () => {
  const claim = staticClaims.find((candidate) => candidate.id === "np-1993-system-reliability");
  assert.ok(claim);
  assert.deepEqual(claim.sources.map((source) => source.pages), ["physical PDF p. 1"]);

  const reliability = timeline.find((entry) => entry.date === "1993" && entry.category === "reliability");
  assert.ok(reliability);
  assert.match(reliability.title, /3\.68/);
  assert.match(reliability.title, /4\.64 hours/);

  const capital = timeline.find((entry) => entry.date === "1993" && /33\.862/.test(entry.title));
  assert.ok(capital);
  assert.match(capital.body, /\$3\.104 million for substations/);
  assert.match(capital.body, /\$2\.140 million for transmission/);
  assert.match(capital.body, /\$0\.618 million for telecommunications/);

  const energy = timeline.find((entry) => entry.date === "1993" && entry.category === "generation" && /420 GWh/.test(entry.title));
  assert.ok(energy);
  assert.match(energy.body, /4,093 GWh purchased/);
  assert.match(energy.body, /4,286 GWh in sales/);
  assert.match(energy.body, /201,628 customers/);
});

test("1993 transmission work is connected to the network records", () => {
  const line = timeline.find((entry) => entry.date === "1993" && /70L entered service/.test(entry.title));
  assert.ok(line);
  assert.match(line.body, /second 66 kV circuit/);
  assert.match(line.body, /last newly constructed transmission line/);

  const line14 = timeline.find((entry) => entry.date === "1993" && /0\.45 km section of 14L/.test(entry.title));
  assert.ok(line14);
  assert.match(line14.body, /22 original single-pole structures/);

  const tl202 = timeline.find((entry) => entry.date === "1993 to 1996" && /TL202/.test(entry.title));
  assert.ok(tl202);
  assert.match(tl202.body, /230 kV Bay d'Espoir to Sunnyside circuit/);

  assert.match(stationText("OXP"), /1993 70L COMPLETION/);
  assert.match(stationText("SLA"), /1993 70L COMPLETION/);
});

test("1993 equipment histories retain the named assets", () => {
  const hardwoods = JSON.stringify(components["hwd-g1"]);
  assert.match(hardwoods, /End B engine 202223 overhauled/);
  assert.match(hardwoods, /both compressors, air lines, valves and control panel replaced/);

  assert.match(stationText("NWB"), /1993 PROTECTION INSTALLATION/);
  assert.match(stationText("NWB"), /outdoor pole-mounted protection panel/);

  assert.match(stationText("SPO"), /1993 GAS-TURBINE POWERHOUSE REPLACEMENT/);
  assert.match(stationText("SPO"), /14\.7 MW gas turbine/);

  const hawkeHill = timeline.find((entry) => entry.date === "1993" && /Hawke Hill/.test(entry.title));
  assert.ok(hawkeHill);
  assert.match(hawkeHill.body, /icing-storm data/);
});
