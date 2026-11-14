import assert from "node:assert/strict";
import test from "node:test";
import { islandTerminalRecords, sources, staticClaims, stationProfiles, timeline } from "../src/data.js";

const recordText = (code) => JSON.stringify(
  islandTerminalRecords.find((station) => station.code === code)
  ?? stationProfiles.find((station) => station.code === code)
);

test("1987 sources retain filed pages and URLs", () => {
  const lineRegister = sources.find((candidate) => candidate.id === "nlh-1987-tl250-tl255");
  assert.ok(lineRegister);
  assert.equal(lineRegister.pages, "physical PDF p. 5");
  assert.equal(lineRegister.url, "http://www.pub.nl.ca/applications/IslandInterconnectedSystem/files/rfi/PUB-NLH-316.pdf");

  const carrier = sources.find((candidate) => candidate.id === "nlh-1987-plc-carrier");
  assert.ok(carrier);
  assert.equal(carrier.pages, "physical PDF p. 41");

  const tl217 = sources.find((candidate) => candidate.id === "nlh-1987-tl217-failure");
  assert.ok(tl217);
  assert.equal(tl217.pages, "physical PDF p. 3");
});

test("1987 reliability and capital preserve filed units", () => {
  const claim = staticClaims.find((candidate) => candidate.id === "np-1987-system-reliability");
  assert.ok(claim);
  assert.deepEqual(claim.sources.map((source) => source.pages), ["physical PDF p. 11"]);

  const reliability = timeline.find((entry) => entry.date === "1987" && entry.category === "reliability");
  assert.ok(reliability);
  assert.match(reliability.title, /4\.05/);
  assert.match(reliability.title, /6\.32 hours/);
  assert.match(reliability.body, /1\.56/);
  assert.ok(timeline.find((entry) => entry.date === "1987" && /38\.881/.test(entry.title)));
});

test("1987 transmission and carrier records stay connected", () => {
  const lines = timeline.find((entry) => entry.date === "1987" && /TL250 and TL255 entered/.test(entry.title));
  assert.ok(lines);
  assert.match(lines.body, /123\.231 km/);
  assert.match(lines.body, /33\.014 km/);
  assert.match(lines.body, /138 kV/);

  const carrier = timeline.find((entry) => entry.date === "1987" && entry.category === "telecom");
  assert.ok(carrier);
  assert.match(carrier.title, /powerline-carrier/);

  const failure = timeline.find((entry) => entry.date === "1987" && /63 day outage/.test(entry.title));
  assert.ok(failure);
  assert.match(failure.body, /Seven structures/);
  assert.match(failure.body, /\$500,000/);
});

test("1987 station and plant histories remain source linked", () => {
  assert.match(recordText("GDL"), /1987 66 KV BUS EXTENSION/);
  assert.match(recordText("WBK"), /1987 INTAKE REHABILITATION/);
  assert.match(recordText("WBK"), /1987 PENSTOCK REPLACEMENT/);
  assert.match(recordText("RBK"), /1987 UNIT 1 RUNNER AND LEVEL INSTRUMENTATION/);
  assert.match(recordText("PUN"), /1987 DIESEL CONTROL AND SWITCHGEAR WORK/);
  assert.match(recordText("BDE"), /1987 GOODYEAR'S DAM EMERGENCY REPAIRS/);
});

test("1987 Holyrood date conflicts remain unresolved", () => {
  const conflicts = timeline.filter((entry) => entry.date === "1987" && entry.status === "unresolved");
  assert.ok(conflicts.find((entry) => /uprate records disagree/.test(entry.title)));
  assert.ok(conflicts.find((entry) => /PLC records disagree/.test(entry.title)));

  const controlSource = sources.find((candidate) => candidate.id === "nlh-1987-holyrood-gt-control-conflict");
  assert.ok(controlSource);
  assert.equal(controlSource.status, "unresolved");
  assert.equal(controlSource.pages, "physical PDF pp. 66 to 67");
});
