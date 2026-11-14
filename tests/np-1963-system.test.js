import assert from "node:assert/strict";
import test from "node:test";
import { sources, staticClaims, stationProfiles, timeline } from "../src/data.js";

const stationText = (code) => JSON.stringify(stationProfiles.find((candidate) => candidate.code === code));

test("1963 record does not invent a demand value", () => {
  assert.equal(timeline.some((entry) => entry.date === "1963" && entry.category === "load"), false);
});

test("1963 transmission records retain voltage, endpoints and physical detail", () => {
  const event = timeline.find((entry) => entry.date === "1963" && /363L, 32L and 105L/.test(entry.title));
  assert.ok(event);
  assert.match(event.body, /138 kV.*62 km.*478.*266\.8 ACSR/);
  assert.match(event.body, /3\.2 km 32L.*Oxen Pond and Ridge Road.*66 kV/);
  assert.match(event.body, /105L between Grand Falls and Sandy Brook/);
  assert.equal(sources.find((source) => source.id === "np-1963-32l")?.pages, "physical PDF p. 278");
  assert.equal(sources.find((source) => source.id === "np-1963-105l")?.pages, "physical PDF p. 247");
});

test("1963 line records are attached to documented stations", () => {
  assert.match(stationText("OXP"), /1963 32L CONSTRUCTION.*66 kV single-pole line.*3\.2 km/);
  assert.match(stationText("RRD"), /2017 FILED 32L REBUILD.*Original construction.*1963/);
  assert.match(stationText("GFS"), /1963 105L CONSTRUCTION RECORD.*Grand Falls and Sandy Brook/);
  assert.match(stationText("SBK"), /1963 ORIGINAL PLANT AND 105L.*6\.31 MW.*105L/);
});

test("Ridge Road and Stamp's Lane retain their 1963 station records", () => {
  assert.match(stationText("RRD"), /built in 1963.*30L to King's Bridge.*32L and 67L to Oxen Pond/);
  assert.match(stationText("SLA"), /Station built.*1963.*five 4\.16 kV feeders and six 12\.5 kV feeders/);
});

test("Sandy Brook retains original plant and electrical equipment", () => {
  assert.match(stationText("SBK"), /1963 ORIGINAL ELECTRICAL EQUIPMENT.*Westinghouse exciter.*Brown Boveri AB2\/1/);
  assert.match(stationText("SBK"), /Westinghouse DH generator breaker.*potential transformers.*current transformers/);
  assert.match(stationText("SBK"), /two single-phase 120\/240 V transformers connected open delta/);
});

test("1963 system claim retains its source set", () => {
  const claim = staticClaims.find((candidate) => candidate.id === "np-1963-system-record");
  assert.ok(claim);
  assert.equal(claim.status, "reported");
  assert.equal(claim.sources.length, 7);
  assert.ok(claim.sources.some((reference) => reference.sourceId === "np-2018-363l"));
  assert.ok(claim.sources.some((reference) => reference.sourceId === "np-1963-sandy-brook-electrical"));
});
