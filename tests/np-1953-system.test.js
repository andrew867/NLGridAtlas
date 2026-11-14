import assert from "node:assert/strict";
import test from "node:test";
import { sources, staticClaims, stationProfiles, timeline } from "../src/data.js";

const stationText = (code) => JSON.stringify(stationProfiles.find((candidate) => candidate.code === code));

test("1953 record does not invent transmission, demand or telecommunications events", () => {
  assert.equal(timeline.some((entry) => entry.date === "1953" && ["network", "load", "telecom"].includes(entry.category)), false);
});

test("St. John's Diesel retains its original duty and electrical connection", () => {
  const event = timeline.find((entry) => entry.date === "1953" && /Diesel and Steam/.test(entry.title));
  assert.ok(event);
  assert.match(event.body, /2,500 kW Nordberg.*General Electric.*station services.*steam plant/);
  assert.match(event.body, /St\. John's Main distribution line.*three 1,500 kVA.*6\.9\/4\.16 kV/);
  assert.match(stationText("SJD"), /1953 ORIGINAL INSTALLATION/);
  assert.match(stationText("SJD"), /direct distribution-line connection to St\. John's Main/);
});

test("Cape Broyle and Horse Chops retain the unresolved 1952, 1953 and 1954 records", () => {
  const event = timeline.find((entry) => entry.date === "1952, 1953 or 1954" && /dates conflict/.test(entry.title));
  assert.ok(event);
  assert.equal(event.status, "unresolved");
  assert.match(event.body, /generating-unit table.*1952.*development record.*1953.*2025 capital filing.*1954/);
});

test("Blackwoods Pond and Horse Chops civil works retain their 1953 construction", () => {
  const reservoir = timeline.find((entry) => entry.date === "1953" && /Blackwoods Pond/.test(entry.title));
  const spillway = timeline.find((entry) => entry.date === "1953" && /Horse Chops spillway/.test(entry.title));
  assert.match(reservoir.body, /Cape Broyle and Horse Chops hydroelectric development/);
  assert.match(spillway.body, /one large bay and 11 smaller bays.*150 mm.*300 mm/);
  assert.match(stationText("CAB"), /1953 BLACKWOODS POND RESERVOIR/);
  assert.match(stationText("HCP"), /1953 HORSE CHOPS SPILLWAY/);
});

test("1953 system claim retains exact source pages", () => {
  const claim = staticClaims.find((candidate) => candidate.id === "np-1953-system-record");
  assert.ok(claim);
  assert.equal(claim.status, "unresolved");
  assert.equal(claim.sources.length, 5);
  assert.equal(sources.find((source) => source.id === "np-2013-ca-np-035-sjd")?.pages, "physical PDF pp. 1, 178, 180 to 181, 185, 187, 191 and 193");
  assert.equal(sources.find((source) => source.id === "np-1953-blackwoods-pond")?.pages, "physical PDF p. 1");
  assert.equal(sources.find((source) => source.id === "np-1953-horse-chops-spillway")?.pages, "physical PDF pp. 176 to 177");
});
