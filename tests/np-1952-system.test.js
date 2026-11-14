import assert from "node:assert/strict";
import test from "node:test";
import { sources, staticClaims, stationProfiles, timeline } from "../src/data.js";

const stationText = (code) => JSON.stringify(stationProfiles.find((candidate) => candidate.code === code));

test("21L retains its 1952 construction and filed length difference", () => {
  const event = timeline.find((entry) => entry.date === "1952" && /21L connected/.test(entry.title));
  assert.ok(event);
  assert.equal(event.status, "unresolved");
  assert.match(event.body, /66 kV H-frame.*36 two-pole and three-pole.*266\.8 ACSR/);
  assert.match(event.body, /2011 filing lists 5\.73 km.*2012 filing lists 5\.3 km/);
  assert.match(stationText("HCP"), /2011 filing: 5\.73 km; 2012 filing: 5\.3 km/);
});

test("18L retains the 1951 and 1952 construction-year conflict", () => {
  const event = timeline.find((entry) => entry.date === "1951 or 1952" && /18L construction year conflicts/.test(entry.title));
  assert.ok(event);
  assert.equal(event.status, "unresolved");
  assert.match(event.body, /detailed 2014 engineering report.*1951.*rebuild-strategy tables.*1952/);
  assert.match(event.body, /1977 Glendale reroute/);
});

test("Cape Broyle and Horse Chops retain all three filed date records", () => {
  const event = timeline.find((entry) => entry.date === "1952, 1953 or 1954" && /dates conflict/.test(entry.title));
  assert.ok(event);
  assert.match(event.body, /CAB-G and HCP-G1.*1952.*1953.*1954/);
  assert.match(stationText("CAB"), /CAB-G listed at 5\.6 MW with a 1952 installation date/);
  assert.match(stationText("HCP"), /HCP-G1 listed at 7\.7 MW with a 1952 installation date/);
});

test("Cape Broyle retains the 1952 turbine inlet valve", () => {
  const event = timeline.find((entry) => entry.date === "1952" && /turbine inlet valve/.test(entry.title));
  assert.ok(event);
  assert.match(event.body, /78 inch.*drain and bypass valves/);
  assert.match(event.body, /positive water shutoff.*keep turning during shutdown/);
  assert.match(stationText("CAB"), /1952 TURBINE INLET VALVE/);
});

test("Stamp's Lane retains the 1952 and 1963 construction-year conflict", () => {
  const event = timeline.find((entry) => entry.date === "1952 or 1963" && /Stamp's Lane construction year conflicts/.test(entry.title));
  assert.ok(event);
  assert.equal(event.status, "unresolved");
  assert.match(event.body, /2004 response.*1952.*2007 and 2011 station reports.*1963/);
  assert.match(stationText("SLA"), /1952 \/ 1963 CONSTRUCTION RECORDS/);
});

test("1952 system claim retains exact source pages", () => {
  const claim = staticClaims.find((candidate) => candidate.id === "np-1952-system-record");
  assert.ok(claim);
  assert.equal(claim.status, "unresolved");
  assert.equal(claim.sources.length, 7);
  assert.equal(sources.find((source) => source.id === "np-2013-generation-unit-data")?.pages, "physical PDF pp. 1 to 2");
  assert.equal(sources.find((source) => source.id === "np-1952-cape-broyle-valve")?.pages, "physical PDF pp. 163 to 164");
  assert.equal(sources.find((source) => source.id === "np-2004-sla-construction")?.pages, "physical PDF p. 1");
});
