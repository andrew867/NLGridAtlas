import assert from "node:assert/strict";
import test from "node:test";
import { components, islandTerminalRecords, sources, staticClaims, stationProfiles, timeline } from "../src/data.js";

const station = (code) => stationProfiles.find((candidate) => candidate.code === code);
const stationText = (code) => JSON.stringify(station(code));
const terminalText = (code) => JSON.stringify(islandTerminalRecords.find((candidate) => candidate.code === code));

test("1965 record does not invent a demand value", () => {
  assert.equal(timeline.some((entry) => entry.date === "1965" && entry.category === "load"), false);
});

test("TL203 retains the 1965 register and physical construction record", () => {
  const event = timeline.find((entry) => entry.date === "1965" && /TL203 connected/.test(entry.title));
  assert.ok(event);
  assert.match(event.body, /44\.534 km.*185 structures.*562\.5 kcmil AACSR.*636 kcmil ACSR/);
  assert.equal(sources.find((source) => source.id === "nlh-1965-tl203-register")?.pages, "physical PDF p. 4");
  assert.equal(sources.find((source) => source.id === "nlh-1965-tl203-structures")?.pages, "physical PDF p. 196");
});

test("35L, 108L and 352L remain attached to 1965", () => {
  const event = timeline.find((entry) => entry.date === "1965" && /35L, 108L and 352L/.test(entry.title));
  assert.ok(event);
  assert.match(event.body, /Oxen Pond to Airport.*44 km.*396-structure.*2\/0 ACSR.*Massey Drive to Walbournes/);
  assert.match(stationText("OXP"), /1965 35L CONSTRUCTION RECORD/);
  assert.match(stationText("GAN"), /1965 108L CONSTRUCTION/);
  assert.match(stationText("GBY"), /1965 108L CONSTRUCTION/);
  assert.match(stationText("WAL"), /1965 352L CONSTRUCTION/);
});

test("Holyrood, Springdale and transformer manufacture records retain evidence type", () => {
  assert.ok(components["hrd-summary"].sources.some((reference) => reference.sourceId === "nlh-1965-holyrood-stage1"));
  assert.match(stationText("SPR"), /built in 1965/);
  assert.match(stationText("NWB"), /Westinghouse; manufactured in 1965/);
  assert.match(stationText("GPD"), /Canadian General Electric; manufactured in 1965/);
  const event = timeline.find((entry) => entry.date === "1965" && /three transformers were manufactured/.test(entry.title));
  assert.match(event.body, /manufacture dates.*not station commissioning dates/);
});

test("Bay d'Espoir retains the 1965 construction and distribution records", () => {
  assert.match(terminalText("BDE"), /SPRING 1965 STAGE 1 CONSTRUCTION START/);
  assert.match(terminalText("BDE"), /1965 DISTRIBUTION LINES L1 AND L2/);
  assert.match(terminalText("BDE"), /BD1-VR1.*BD1-VR2.*BD1-R1.*BD1-R2.*BD1-R3/);
  assert.equal(sources.find((source) => source.id === "nlh-1965-bay-despoir-distribution")?.pages, "physical PDF pp. 290 and 341");
});

test("1965 penstock records are attached to both hydro plants", () => {
  assert.match(stationText("PBK"), /1965 PENSTOCK RECONSTRUCTION.*2,470 m.*63 m.*400 original/);
  assert.match(stationText("HCT"), /1965 PENSTOCK INSTALLATION/);
});

test("1965 rural distribution and station-structure records remain sourced", () => {
  for (const sourceId of ["nlh-1965-rigolet", "nlh-1965-little-bay", "nlh-1965-lanse-amour", "np-2006-bot01-study"]) {
    assert.ok(sources.some((source) => source.id === sourceId));
  }
  assert.match(stationText("BOT"), /Leading Tickles and Fortune Harbour sections constructed in 1965/);
  assert.match(stationText("MOB"), /1965 12\.47 KV STRUCTURE/);
  assert.match(stationText("MOP"), /1965 6\.9 KV STRUCTURE/);
  assert.match(stationText("RRD"), /1965 12\.5 KV SWITCHGEAR/);
});

test("1965 system claim retains its complete source set", () => {
  const claim = staticClaims.find((candidate) => candidate.id === "np-1965-system-record");
  assert.ok(claim);
  assert.equal(claim.status, "reported");
  assert.equal(claim.sources.length, 18);
  assert.ok(claim.sources.some((reference) => reference.sourceId === "nlh-1965-little-bay"));
  assert.ok(claim.sources.some((reference) => reference.sourceId === "np-1965-penstocks"));
});

