import assert from "node:assert/strict";
import test from "node:test";
import { sources, staticClaims, stationProfiles, timeline } from "../src/data.js";

const stationText = (code) => JSON.stringify(stationProfiles.find((candidate) => candidate.code === code));

test("1959 record does not invent a demand value", () => {
  assert.equal(timeline.some((entry) => entry.date === "1959" && entry.category === "load"), false);
});

test("1959 station record retains original and later roles", () => {
  const event = timeline.find((entry) => entry.date === "1959" && /Gander, Grand Falls/.test(entry.title));
  assert.ok(event);
  assert.match(event.body, /Gander began as a distribution station.*138\/66\/12\.5 kV/);
  assert.match(event.body, /Grand Falls began as a 66\/4\.16 kV distribution station/);
  assert.match(event.body, /Rattling Brook was built as a transmission, distribution and generation station/);
  assert.match(stationText("GFS"), /1959 ORIGINAL 66\/4\.16 KV YARD/);
});

test("Rattling Brook plant conflict is not flattened", () => {
  const event = timeline.find((entry) => entry.date === "1958 or 1959" && /Rattling Brook/.test(entry.title));
  assert.ok(event);
  assert.equal(event.status, "unresolved");
  assert.match(event.body, /commissioned in 1958.*constructed in 1959/);
  assert.match(event.body, /11\.5 MW and 14\.8 MW/);
  assert.match(stationText("RBK"), /December 16, 1958.*constructed in 1959.*11\.5 MW.*14\.8 MW/);
});

test("1959 line and feeder record retains topology and construction detail", () => {
  const event = timeline.find((entry) => entry.date === "1959" && /66 kV corridors/.test(entry.title));
  assert.ok(event);
  assert.match(event.body, /30L.*2\.9 km/);
  assert.match(event.body, /35L.*3\.39 km.*39 single-pole structures/);
  assert.match(event.body, /301L date to 1959 and 1966/);
  assert.match(event.body, /BOT-01.*25 kV/);
  assert.match(event.body, /302L construction year.*1958 and 1959/);
});

test("69L construction-year conflict remains unresolved", () => {
  const event = timeline.find((entry) => entry.date === "1951 or 1959" && /69L/.test(entry.title));
  assert.ok(event);
  assert.equal(event.status, "unresolved");
  assert.match(event.body, /summary dates.*1951.*project text.*1959/);
});

test("Pitmans Pond record retains machine and civil data", () => {
  const event = timeline.find((entry) => entry.date === "1959" && /Pitmans Pond entered service/.test(entry.title));
  assert.ok(event);
  assert.match(event.body, /625 kW.*21\.3 m/);
  assert.match(event.body, /1,200 hp.*895 kW/);
  assert.match(event.body, /1,000 kVA.*NCH-03/);
  assert.match(event.body, /385 m woodstave penstock.*steel head gate/);
  assert.match(stationText("PIT"), /1959 PLANT AND CIVIL WORKS.*1,372 mm.*manual drum-style/);
});

test("1959 penstock and building records are attached to their assets", () => {
  assert.match(stationText("HCT"), /1959 STEEL PENSTOCK SECTION.*21 m long.*1,829 mm/);
  assert.match(stationText("VIC"), /1959 AND 1963 PENSTOCK REPLACEMENT.*238 m.*174 m.*82 m/);
  assert.match(stationText("GAL"), /1959 PROTECTION AND CONTROL BUILDING.*expanded in 1970/);
});

test("historic dry sequence uses the filed dates and definition", () => {
  const event = timeline.find((entry) => entry.date === "April 1959 to December 1962");
  assert.ok(event);
  assert.match(event.body, /45-month period.*longest sustained low-inflow period/);
  assert.match(event.body, /Individual months or quarters elsewhere were lower/);
});

test("1959 system claim retains exact source pages", () => {
  const claim = staticClaims.find((candidate) => candidate.id === "np-1959-system-record");
  assert.ok(claim);
  assert.equal(claim.status, "unresolved");
  assert.equal(claim.sources.length, 17);
  assert.equal(sources.find((source) => source.id === "np-1959-grand-falls")?.pages, "physical PDF p. 294");
  assert.equal(sources.find((source) => source.id === "np-1959-rattling-brook-plant")?.pages, "physical PDF pp. 50 and 52");
  assert.equal(sources.find((source) => source.id === "np-1959-hydro-civil")?.pages, "physical PDF pp. 160 and 171");
  assert.equal(sources.find((source) => source.id === "np-1959-woodstave-penstocks")?.pages, "physical PDF p. 1");
  assert.equal(sources.find((source) => source.id === "nlh-1959-dry-sequence")?.pages, "physical PDF p. 1");
});
