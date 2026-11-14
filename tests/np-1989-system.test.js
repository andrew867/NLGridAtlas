import assert from "node:assert/strict";
import test from "node:test";
import { components, islandTerminalRecords, sources, staticClaims, timeline } from "../src/data.js";

const terminalText = (code) => JSON.stringify(islandTerminalRecords.find((station) => station.code === code));

test("1989 sources retain filed pages and URLs", () => {
  const reliability = sources.find((candidate) => candidate.id === "np-1989-reliability");
  assert.ok(reliability);
  assert.equal(reliability.pages, "physical PDF p. 11");
  assert.equal(reliability.url, "http://www.pub.nl.ca/applications/ARCHIVE/NP2008GRA/files/information/Information-17.pdf");

  const lines = sources.find((candidate) => candidate.id === "nlh-1989-tl257-tl258");
  assert.ok(lines);
  assert.equal(lines.pages, "physical PDF p. 5");

  const paradise = sources.find((candidate) => candidate.id === "nlh-1989-paradise-river");
  assert.ok(paradise);
  assert.equal(paradise.pages, "physical PDF pp. 222 to 223");
});

test("1989 reliability, capital and operating totals preserve filed units", () => {
  const claim = staticClaims.find((candidate) => candidate.id === "np-1989-system-reliability");
  assert.ok(claim);
  assert.deepEqual(claim.sources.map((source) => source.pages), ["physical PDF p. 11"]);

  const reliability = timeline.find((entry) => entry.date === "1989" && entry.category === "reliability" && /SAIFI/.test(entry.title));
  assert.ok(reliability);
  assert.match(reliability.title, /3\.80/);
  assert.match(reliability.title, /5\.20 hours/);
  assert.match(reliability.body, /1\.37/);

  assert.ok(timeline.find((entry) => entry.date === "1989" && /56\.304/.test(entry.title)));
  const energy = timeline.find((entry) => entry.date === "1989" && /415 GWh/.test(entry.title));
  assert.ok(energy);
  assert.match(energy.body, /3,772 GWh purchased/);
  assert.match(`${energy.title} ${energy.body}`, /1,106 MW/);
  assert.match(energy.body, /188,575 customer/);
});

test("1989 Paradise River and northern transmission records remain connected", () => {
  const paradise = islandTerminalRecords.find(({ code }) => code === "PRV");
  assert.ok(paradise);
  assert.match(JSON.stringify(paradise), /February 26, 1989/);
  assert.match(JSON.stringify(paradise), /6\/8\/10 MVA/);
  assert.match(JSON.stringify(paradise), /TL258/);
  assert.match(JSON.stringify(paradise), /17\.2 km/);

  assert.match(terminalText("SAA"), /1989 TL257 CONNECTION/);
  assert.match(terminalText("RWC"), /1989 TL257 INTERCONNECTION/);
  const tl257 = timeline.find((entry) => entry.date === "1989" && /TL257 connected/.test(entry.title));
  assert.ok(tl257);
  assert.match(tl257.body, /63\.395 km/);
});

test("1989 VHF and Holyrood equipment details remain source linked", () => {
  const vhf = timeline.find((entry) => entry.date === "1989" && /ATI VHF/.test(entry.title));
  assert.ok(vhf);
  assert.match(vhf.body, /29 repeaters/);
  assert.match(vhf.body, /150 MHz/);

  const uprate = timeline.find((entry) => entry.date === "1989" && /Unit 2 was uprated/.test(entry.title));
  assert.ok(uprate);
  assert.match(uprate.title, /150 MW to 175 MW/);

  assert.match(JSON.stringify(components["hrd-t2"]), /Federal Pioneer/);
  assert.match(JSON.stringify(components["hrd-t2"]), /Z1 13\.7%/);
  assert.match(JSON.stringify(components["hrd-t8"]), /installed 1989/);
});

test("1989 Newfoundland Power plant histories stay separate", () => {
  const records = timeline.filter((entry) => entry.date === "1989");
  assert.ok(records.find((entry) => /New Chelsea/.test(entry.title)));
  assert.ok(records.find((entry) => /Heart's Content/.test(entry.title)));
  assert.ok(records.find((entry) => /Pierre's Brook/.test(entry.title)));
  assert.ok(records.find((entry) => /transmission-insulator/.test(entry.title)));
});
