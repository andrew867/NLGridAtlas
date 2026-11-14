import assert from "node:assert/strict";
import test from "node:test";
import { sources, staticClaims, stationProfiles, timeline } from "../src/data.js";

const stationText = (code) => JSON.stringify(stationProfiles.find((station) => station.code === code));

test("1997 source record retains physical pages and reported state", () => {
  const annual = sources.find((candidate) => candidate.id === "np-1997-annual-report");
  assert.ok(annual);
  assert.equal(annual.pages, "physical PDF pp. 10 to 11, 13, 18, 26, 34, 42 and 56");
  assert.equal(annual.status, "reported");
  assert.equal(annual.url, "http://www.pub.nl.ca/ARCHIVE/nfpower03/rfi/CA-213B.pdf");
});

test("1997 reliability values exclude Hydro loss of supply without inventing unavailable measures", () => {
  const claim = staticClaims.find((candidate) => candidate.id === "np-1997-system-reliability");
  assert.ok(claim);
  assert.equal(claim.status, "reported");
  assert.deepEqual(claim.sources.map((source) => source.pages), ["physical PDF p. 10", "physical PDF p. 1"]);

  const reliability = timeline.find((entry) => entry.date === "1997" && entry.category === "reliability");
  assert.ok(reliability);
  assert.match(reliability.title, /2\.72/);
  assert.match(reliability.title, /3\.73 hours/);
  assert.doesNotMatch(reliability.title + reliability.body, /service availability|load factor|operating-area/i);
});

test("1997 network and capital records preserve scope and units", () => {
  const network = timeline.find((entry) => entry.date === "1997" && entry.category === "network" && /Insulator/.test(entry.title));
  assert.ok(network);
  assert.match(network.body, /70,000/);
  assert.match(network.body, /\$10 million/);
  assert.match(network.body, /infrared thermoscanning/);

  const capital = timeline.find((entry) => entry.date === "1997" && entry.category === "network" && /30\.965/.test(entry.title));
  assert.ok(capital);
  assert.match(capital.body, /\$2\.102 million for substations/);
  assert.match(capital.body, /\$1\.855 million for transmission/);
  assert.match(capital.body, /\$0\.562 million for telecommunications/);
});

test("1997 operating and fixed-asset values preserve units", () => {
  const generation = timeline.find((entry) => entry.date === "1997" && entry.category === "generation" && /424 GWh/.test(entry.title));
  assert.ok(generation);
  assert.match(generation.body, /4,244 million kWh/);
  assert.match(generation.body, /1,065 MW/);

  const financial = timeline.find((entry) => entry.date === "1997-12-31" && entry.category === "financial");
  assert.ok(financial);
  assert.match(financial.body, /\$162\.864 million/);
  assert.match(financial.body, /\$70\.837 million/);
  assert.match(financial.body, /\$0\.170 million/);
  assert.match(financial.title, /\$92\.197 million/);
});

test("1997 Rose Blanche construction remains distinct from later energization and opening", () => {
  const record = stationText("RBH");
  assert.match(record, /1997 CONSTRUCTION PROGRAM/);
  assert.match(record, /DECEMBER 22, 1998 ENERGIZATION/);
  assert.match(record, /AUGUST 1999 OFFICIAL OPENING/);
  assert.match(record, /more than \$13 million/);
});
