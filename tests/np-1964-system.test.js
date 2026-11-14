import assert from "node:assert/strict";
import test from "node:test";
import { islandTerminalRecords, sources, staticClaims, stationProfiles, timeline } from "../src/data.js";

const station = (code) => stationProfiles.find((candidate) => candidate.code === code);
const stationText = (code) => JSON.stringify(station(code));
const terminalText = (code) => JSON.stringify(islandTerminalRecords.find((candidate) => candidate.code === code));

test("1964 record does not invent a demand value", () => {
  assert.equal(timeline.some((entry) => entry.date === "1964" && entry.category === "load"), false);
});

test("the original Sunnyside to Gander corridor retains all four later line designations", () => {
  const event = timeline.find((entry) => entry.date === "1964" && /Sunnyside to Gander/.test(entry.title));
  assert.ok(event);
  assert.match(event.body, /100L, 124L, 121L and 146L/);
  assert.match(event.body, /34\.13 km.*148 H-frame.*397\.5 ACSR/);
  assert.match(event.body, /86\.1 km.*79 km of 1964 construction/);
  assert.match(event.body, /40\.7 km.*160 H-frame.*244\.4 or 397\.5 ACSR/);
  assert.equal(sources.find((source) => source.id === "np-1964-sunnyside-gander-corridor")?.pages, "physical PDF pp. 460 to 461");
});

test("1964 corridor records are attached to their documented endpoints", () => {
  assert.match(terminalText("SUN"), /1964 SUNNYSIDE TO GANDER 138 KV CORRIDOR/);
  assert.match(stationText("CLV"), /1964 100L AND 124L CONSTRUCTION/);
  assert.match(stationText("GAM"), /1964 CENTRAL 138 KV CORRIDOR/);
  assert.match(stationText("GAN"), /1964 146L CONSTRUCTION/);
});

test("1964 distribution records retain cable and feeder construction detail", () => {
  assert.match(stationText("LET"), /1964 LET-01 SUBMARINE CABLE.*approximately 3 km.*two-conductor single-phase.*ungrounded/);
  assert.match(stationText("LEW"), /1964 LEW-02 CONSTRUCTION.*number 2 and number 4 ACSR.*blackjack creosote poles/);
  assert.match(stationText("GLV"), /1964 ORIGINAL GAMBO TO GLOVERTOWN FEEDER.*single-phase line from Gambo.*two phases added/);
});

test("1964 hydro plant equipment interventions remain separate", () => {
  assert.match(stationText("SCV"), /1964 G1 RUNNER REPLACEMENT.*original 1924 turbine runner/);
  assert.match(stationText("TCV"), /1964 GENERATOR REFURBISHMENT.*Westinghouse/);
});

test("Bay d'Espoir and Wiltondale retain 1964 support and manufacture records", () => {
  assert.match(terminalText("BDE"), /1964 CONSTRUCTION SUPPORT SYSTEMS.*Bear Brook water system.*Line depot/);
  assert.match(terminalText("WDL"), /1964 TRANSFORMER MANUFACTURE.*operating conditions and test results did not justify replacement/);
  assert.equal(sources.find((source) => source.id === "nlh-1964-bde-water")?.pages, "physical PDF pp. 173 and 176");
  assert.equal(sources.find((source) => source.id === "nlh-1964-wiltondale-transformer")?.pages, "physical PDF p. 770");
});

test("1964 system claim retains its complete source set", () => {
  const claim = staticClaims.find((candidate) => candidate.id === "np-1964-system-record");
  assert.ok(claim);
  assert.equal(claim.status, "reported");
  assert.equal(claim.sources.length, 12);
  assert.ok(claim.sources.some((reference) => reference.sourceId === "np-1964-let01"));
  assert.ok(claim.sources.some((reference) => reference.sourceId === "np-1964-tors-cove-generator"));
  assert.ok(claim.sources.some((reference) => reference.sourceId === "nlh-1964-bde-line-depot"));
});
