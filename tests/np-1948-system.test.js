import { readAtlasHtmlSync } from "./page-fixture.js";
import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { sources, staticClaims, stationProfiles, timeline } from "../src/data.js";

const stationText = (code) => JSON.stringify(stationProfiles.find((candidate) => candidate.code === code));

test("King's Bridge retains its 1948 combined-station record", () => {
  const event = timeline.find((entry) => entry.date === "1948" && /King's Bridge/.test(entry.title));
  assert.ok(event);
  assert.equal(event.status, "reported");
  assert.match(event.body, /both a transmission and distribution substation/);
  assert.match(stationText("KBR"), /1948 STATION CONSTRUCTION/);
  assert.match(stationText("KBR"), /constructed as both a transmission and distribution substation/);
});

test("Lawn retains the 1948 dam refacing sequence", () => {
  const event = timeline.find((entry) => entry.date === "1948" && /Lawn Forebay Dam/.test(entry.title));
  assert.ok(event);
  assert.match(event.body, /downstream surface was refaced with concrete/);
  assert.match(stationText("LWN"), /1937 TO 1983 DAM WORK/);
  assert.match(stationText("LWN"), /1937 work.*1948 work.*1983 work/);
});

test("1948 hydrometry and corporate records retain their dates", () => {
  const hydro = timeline.find((entry) => entry.date === "1948" && /Upper Muskrat Falls/.test(entry.title));
  assert.ok(hydro);
  assert.match(hydro.body, /continuous recording began in 1953/);
  const corporate = timeline.find((entry) => entry.date === "1948" && /electricity-only company/.test(entry.title));
  assert.ok(corporate);
  assert.match(corporate.body, /listed its shares in 1949/);
});

test("1948 system claim and public card retain exact sources", () => {
  const claim = staticClaims.find((candidate) => candidate.id === "np-1948-system-record");
  assert.ok(claim);
  assert.equal(claim.status, "reported");
  assert.equal(claim.sources.length, 6);
  assert.equal(sources.find((source) => source.id === "np-1948-lawn-dam")?.pages, "physical PDF p. 185");
  assert.equal(sources.find((source) => source.id === "np-1948-property-record")?.pages, "physical PDF p. 152");
  assert.equal(sources.find((source) => source.id === "nlh-1948-muskrat-hydrometry")?.pages, "physical PDF p. 32");
  assert.equal(sources.find((source) => source.id === "fortis-1948-electricity-company")?.pages, "physical PDF p. 220");
  const html = readAtlasHtmlSync();
  assert.match(html, /data-claim-id="np-1948-system-record"/);
  assert.match(html, /Topsail Road.*Gabriel Whiffen.*June 1948/s);
  assert.doesNotMatch(html, /Heart's Content.*1948/);
});
