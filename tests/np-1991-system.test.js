import assert from "node:assert/strict";
import test from "node:test";
import { components, islandTerminalRecords, sources, staticClaims, stationProfiles, timeline } from "../src/data.js";

const stationText = (code) => JSON.stringify(stationProfiles.find((station) => station.code === code));

test("1991 sources retain filed pages and URLs", () => {
  const reliability = sources.find((candidate) => candidate.id === "np-1991-reliability-capital");
  assert.ok(reliability);
  assert.equal(reliability.pages, "physical PDF p. 4");
  assert.equal(reliability.url, "http://www.pub.nl.ca/applications/2021/NP2021Capital/rfis/CA-NP-004.PDF");

  const line = sources.find((candidate) => candidate.id === "nlh-1991-tl217-upgrade");
  assert.ok(line);
  assert.equal(line.pages, "physical PDF p. 54");

  const vhf = sources.find((candidate) => candidate.id === "nlh-1991-vhf-support");
  assert.ok(vhf);
  assert.equal(vhf.pages, "physical PDF p. 1");
});

test("1991 reliability and operating totals preserve filed units", () => {
  const claim = staticClaims.find((candidate) => candidate.id === "np-1991-system-reliability");
  assert.ok(claim);
  assert.deepEqual(claim.sources.map((source) => source.pages), ["physical PDF p. 4"]);

  const reliability = timeline.find((entry) => entry.date === "1991" && entry.category === "reliability");
  assert.ok(reliability);
  assert.match(reliability.title, /2\.09/);
  assert.match(reliability.title, /3\.26 hours/);

  const capital = timeline.find((entry) => entry.date === "1991" && /43\.322/.test(entry.title));
  assert.ok(capital);

  const energy = timeline.find((entry) => entry.date === "1991" && entry.category === "generation" && /417 GWh/.test(entry.title));
  assert.ok(energy);
  assert.match(energy.body, /4,008 GWh purchased/);
  assert.match(`${energy.title} ${energy.body}`, /1,101 MW/);
  assert.match(energy.body, /195,730 customer/);

  const island = timeline.find((entry) => entry.date === "1991" && /Total Island/.test(entry.title));
  assert.ok(island);
  assert.match(island.body, /1,480 MW/);
  assert.match(`${island.title} ${island.body}`, /7,464 GWh/);
});

test("1991 transmission and station histories are connected to the assets", () => {
  assert.match(stationText("WAV"), /1991 TL217 ICE-LOADING UPGRADE/);
  assert.match(stationText("WAV"), /63 mm glaze ice/);
  assert.match(stationText("WBK"), /1991 BATTERY BANK AND CHARGER/);
  assert.match(stationText("PBK"), /1991 SURGE-TANK REPLACEMENT/);

  const hardwoods = JSON.stringify(components["hwd-summary"]);
  assert.match(hardwoods, /revision 17, dated July 7, 1991/);
  assert.match(hardwoods, /B1B2/);
  assert.match(hardwoods, /B7B8/);
});

test("1991 generation and VHF work remains source-linked", () => {
  const bayDEspoir = JSON.stringify(islandTerminalRecords.find((station) => station.code === "BDE"));
  assert.match(bayDEspoir, /1991 UNIT 3 STATOR WORK/);
  assert.match(bayDEspoir, /piggyback wedges/);
  assert.match(bayDEspoir, /Synchronous-condenser blower replaced/);

  const holyrood = timeline.filter((entry) => entry.date === "1991" && /Holyrood/.test(`${entry.title} ${entry.body}`));
  assert.ok(holyrood.some((entry) => /175 MW/.test(`${entry.title} ${entry.body}`)));
  assert.ok(holyrood.some((entry) => /forced-draft motors/.test(`${entry.title} ${entry.body}`)));
  assert.ok(holyrood.some((entry) => /major overhaul/.test(`${entry.title} ${entry.body}`)));
  assert.match(JSON.stringify(components["hrd-gt"]), /Major overhaul completed/);

  const vhf = timeline.find((entry) => entry.date === "1991" && /VHF/.test(entry.title));
  assert.ok(vhf);
  assert.match(`${vhf.title} ${vhf.body}`, /support cutoff/);
});
