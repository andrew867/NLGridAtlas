import assert from "node:assert/strict";
import test from "node:test";
import { sources, staticClaims, stationProfiles, timeline } from "../src/data.js";

const stationText = (code) => JSON.stringify(stationProfiles.find((candidate) => candidate.code === code));

test("1958 record does not invent a demand value", () => {
  assert.equal(timeline.some((entry) => entry.date === "1958" && entry.category === "load"), false);
});

test("1958 transmission record retains route and construction detail", () => {
  const event = timeline.find((entry) => entry.date === "1958" && /66 kV corridors/.test(entry.title));
  assert.ok(event);
  assert.match(event.body, /102L.*61 km.*Notre Dame Junction.*Roycefield.*Gander/);
  assert.match(event.body, /41L, 57L, 68L and 15L/);
  assert.match(event.body, /79 km 110L.*Clarenville and Lockston/);
  assert.match(event.body, /403L.*Robinsons and Flat Bay.*Lookout Brook/);
});

test("302L construction-year conflict is not flattened", () => {
  const event = timeline.find((entry) => entry.date === "1958 or 1959" && /302L/.test(entry.title));
  assert.ok(event);
  assert.equal(event.status, "unresolved");
  assert.match(event.body, /2002.*1958.*1969.*2018.*1959.*1974/);
  assert.match(stationText("SPO"), /1958 \/ 1959 302L CONSTRUCTION-YEAR CONFLICT/);
  assert.match(stationText("LAU"), /1958 \/ 1959 302L CONSTRUCTION-YEAR CONFLICT/);
});

test("1958 hydro record retains plant and civil details", () => {
  const event = timeline.find((entry) => entry.date === "1958" && /Rattling Brook and Lookout Brook/.test(entry.title));
  assert.ok(event);
  assert.match(event.body, /December 16.*two vertical Francis/);
  assert.match(event.body, /Amy's canal.*control gate.*107\.35 m.*stoplog spillway/);
  assert.match(event.body, /Lookout Brook.*G3.*governor.*switchgear/);
});

test("1958 station equipment remains distinct from station construction", () => {
  const event = timeline.find((entry) => entry.date === "1958" && /Mobile and Stamp's Lane/.test(entry.title));
  assert.ok(event);
  assert.match(event.body, /66 kV potential transformers/);
  assert.match(event.body, /SLA-T1 and SLA-T2.*leaking terminations.*cracked cable bodies/);
});

test("Stephenville building purchase-year conflict remains unresolved", () => {
  const event = timeline.find((entry) => entry.date === "1958" && /operations buildings/.test(entry.title));
  assert.ok(event);
  assert.equal(event.status, "unresolved");
  assert.match(event.body, /Grand Falls-Windsor.*Stephenville.*1986 and 1988/);
});

test("1958 system claim retains exact source pages", () => {
  const claim = staticClaims.find((candidate) => candidate.id === "np-1958-system-record");
  assert.ok(claim);
  assert.equal(claim.status, "unresolved");
  assert.equal(claim.sources.length, 14);
  assert.equal(sources.find((source) => source.id === "np-1958-burin-review")?.pages, "physical PDF p. 5");
  assert.equal(sources.find((source) => source.id === "np-1958-property-buildings")?.pages, "physical PDF pp. 88 and 116");
  assert.equal(sources.find((source) => source.id === "np-1958-stephenville-building")?.pages, "physical PDF p. 381");
});
