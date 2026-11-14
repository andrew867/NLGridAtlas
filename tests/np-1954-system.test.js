import assert from "node:assert/strict";
import test from "node:test";
import { sources, staticClaims, stationProfiles, timeline } from "../src/data.js";

const stationText = (code) => JSON.stringify(stationProfiles.find((candidate) => candidate.code === code));

test("1954 record does not invent a demand value", () => {
  assert.equal(timeline.some((entry) => entry.date === "1954" && entry.category === "load"), false);
});

test("25L retains its original line construction", () => {
  const event = timeline.find((entry) => entry.date === "1954" && /25L connected/.test(entry.title));
  assert.ok(event);
  assert.match(event.body, /66 kV.*9\.25 km.*51 two-pole and three-pole.*two steel towers.*477 ACSR/);
  assert.match(stationText("GOU"), /25L between Goulds and St\. John's Main.*66 kV.*9\.25 km/);
});

test("24L separates the 1954 stage from later construction and rebuilding", () => {
  const event = timeline.find((entry) => entry.date === "1954" && /24L was built/.test(entry.title));
  assert.ok(event);
  assert.match(event.body, /20 km.*Bay Bulls Big Pond.*Mobile.*1954 and 1964/);
  assert.match(event.body, /1954 H-frame section was completely rebuilt in 2002/);
  assert.match(stationText("MOB"), /1954 \/ 1964 24L CONSTRUCTION/);
});

test("1954 station records retain their original roles", () => {
  const mobile = timeline.find((entry) => entry.date === "1954" && /Mobile Substation/.test(entry.title));
  const goulds = timeline.find((entry) => entry.date === "1954" && /Goulds Substation/.test(entry.title));
  const humber = timeline.find((entry) => entry.date === "1954" && /Humber Substation/.test(entry.title));
  assert.match(mobile.body, /generation substation/);
  assert.match(goulds.body, /66 kV transmission switching station.*12\.5 kV distribution/);
  assert.match(humber.body, /transmission and distribution substation.*1954 building/);
  assert.match(stationText("MOB"), /built in 1954 as a generation substation/);
  assert.match(stationText("GOU"), /Station built.*1954/);
  assert.match(stationText("HUM"), /1954 as a transmission and distribution substation/);
});

test("Cape Broyle and Horse Chops commissioning dates remain unresolved", () => {
  const event = timeline.find((entry) => entry.date === "1953 or 1954" && /commissioning dates conflict/.test(entry.title));
  assert.ok(event);
  assert.equal(event.status, "unresolved");
  assert.match(event.body, /2013 development record.*1953.*2025 capital filing.*1954/);
  assert.match(stationText("CAB"), /1953 \/ 1954 COMMISSIONING RECORDS/);
  assert.match(stationText("HCP"), /1953 \/ 1954 COMMISSIONING RECORDS/);
});

test("1954 civil records retain physical dimensions and operating method", () => {
  const pettyHarbour = timeline.find((entry) => entry.date === "1954" && /upper penstock/.test(entry.title));
  const mountCarmel = timeline.find((entry) => entry.date === "1954" && /Mount Carmel Pond/.test(entry.title));
  assert.match(pettyHarbour.body, /250 m.*2,286 mm.*timber cradles.*creosote/);
  assert.match(mountCarmel.body, /operated manually.*no electricity for control equipment/);
  assert.match(stationText("PHR"), /1954 UPPER PENSTOCK SECTION/);
  assert.match(stationText("CAB"), /1954 MOUNT CARMEL POND STRUCTURES/);
});

test("Newfoundland Power Commission incorporation is retained as governance history", () => {
  const event = timeline.find((entry) => entry.date === "1954" && /Power Commission was incorporated/.test(entry.title));
  assert.ok(event);
  assert.match(event.body, /Hydro's predecessor.*electrify the province/);
});

test("1954 system claim retains exact source pages", () => {
  const claim = staticClaims.find((candidate) => candidate.id === "np-1954-system-record");
  assert.ok(claim);
  assert.equal(claim.status, "unresolved");
  assert.equal(claim.sources.length, 9);
  assert.equal(sources.find((source) => source.id === "np-1954-petty-harbour-penstock")?.pages, "physical PDF pp. 207 to 208");
  assert.equal(sources.find((source) => source.id === "nlh-1954-power-commission")?.pages, "physical PDF p. 12");
  assert.equal(sources.find((source) => source.id === "np-2022-humber")?.pages, "physical PDF pp. 282 to 289, 304 to 309 and 312 to 317");
});
