import assert from "node:assert/strict";
import test from "node:test";
import { components, islandTerminalRecords, sources, staticClaims, stationProfiles, timeline } from "../src/data.js";

const stationText = (code) => JSON.stringify(stationProfiles.find((station) => station.code === code));

test("1992 sources retain the filed pages and URLs", () => {
  const capital = sources.find((candidate) => candidate.id === "np-1992-capital-variance");
  assert.ok(capital);
  assert.equal(capital.pages, "physical PDF p. 33");
  assert.equal(capital.status, "reported");

  const losses = sources.find((candidate) => candidate.id === "np-1992-losses");
  assert.ok(losses);
  assert.equal(losses.url, "http://www.pub.nl.ca/applications/2021/NP2021Capital/rfis/CA-NP-004.PDF");

  const unit4 = sources.find((candidate) => candidate.id === "nlh-1992-bde-unit4");
  assert.ok(unit4);
  assert.equal(unit4.pages, "physical PDF p. 52");
});

test("1992 reliability and operating totals preserve filed units", () => {
  const claim = staticClaims.find((candidate) => candidate.id === "np-1992-system-reliability");
  assert.ok(claim);
  assert.deepEqual(claim.sources.map((source) => source.pages), ["physical PDF p. 1"]);

  const reliability = timeline.find((entry) => entry.date === "1992" && entry.category === "reliability");
  assert.ok(reliability);
  assert.match(reliability.title, /3\.46/);
  assert.match(reliability.title, /4\.75 hours/);

  const capital = timeline.find((entry) => entry.date === "1992" && /43\.080/.test(entry.title));
  assert.ok(capital);
  assert.match(capital.body, /\$47\.739 million budget/);
  assert.match(capital.body, /9\.76% underspend/);

  const energy = timeline.find((entry) => entry.date === "1992" && entry.category === "generation" && /417 GWh/.test(entry.title));
  assert.ok(energy);
  assert.match(energy.body, /4,066 GWh purchased/);
  assert.match(energy.body, /4,244 GWh in sales/);
  assert.match(energy.body, /198,936 customers/);

  const losses = timeline.find((entry) => entry.date === "1992" && /Energy losses/.test(entry.title));
  assert.ok(losses);
  assert.match(losses.body, /4\.78% total energy loss/);
  assert.match(losses.body, /8\.10% in total/);
});

test("1992 Hardwoods records retain the unresolved date conflict", () => {
  const summary = JSON.stringify(components["hwd-summary"]);
  assert.match(summary, /T4 and 230 kV bus-tie breaker added/);
  assert.match(summary, /dated July 7, 1991/);
  assert.match(summary, /later project history dates the B1B2 addition to the 1992 T4 project/);

  const t4 = JSON.stringify(components["hwd-t4"]);
  assert.match(t4, /75\/100\/125 MVA/);
  assert.match(t4, /T4 added with a 230 kV bus-tie breaker/);

  const busTie = JSON.stringify(components["hwd-b1b2"]);
  assert.match(busTie, /drawing dated July 7, 1991/);
  assert.match(busTie, /added during the 1992 T4 project/);

  const gasTurbine = JSON.stringify(components["hwd-g1"]);
  assert.match(gasTurbine, /Exhaust stacks replaced/);
});

test("1992 Bay d'Espoir and 80L work is connected to the asset records", () => {
  const bayDEspoir = JSON.stringify(islandTerminalRecords.find((station) => station.code === "BDE"));
  assert.match(bayDEspoir, /1992 230 kV work/);
  assert.match(bayDEspoir, /Bus modifications completed/);
  assert.match(bayDEspoir, /phase A ground fault located at a main lead/);

  const line80 = timeline.find((entry) => entry.date === "1992" && /5 km section of 80L/.test(entry.title));
  assert.ok(line80);
  assert.match(line80.body, /66 kV H-frame circuit/);

  assert.match(stationText("BLK"), /1992 80L REBUILD SECTION/);
  assert.match(stationText("HCT"), /5 km near Heart's Content/);
});
