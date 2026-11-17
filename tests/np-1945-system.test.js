import { readAtlasHtmlSync } from "./page-fixture.js";
import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { sources, staticClaims, stationProfiles, timeline } from "../src/data.js";

const stationText = (code) => JSON.stringify(stationProfiles.find((candidate) => candidate.code === code));

test("1945 Lookout Brook records preserve the commissioning conflict", () => {
  const lookout = timeline.find((entry) => entry.date === "1945" && /Lookout Brook/.test(entry.title));
  assert.ok(lookout);
  assert.equal(lookout.status, "unresolved");
  assert.match(lookout.body, /13\.1 km Flat Bay Brook access road/);
  assert.match(lookout.body, /1946/);
  assert.match(stationText("LBK"), /1945 \/ 1946 COMMISSIONING DATE CONFLICT/);
  assert.match(stationText("LBK"), /G1, G2 and the original powerhouse to 1946/);
});

test("1945 Port Union record keeps original and replacement dates separate", () => {
  const portUnion = timeline.find((entry) => entry.date === "1945" && /Port Union/.test(entry.title));
  assert.ok(portUnion);
  assert.equal(portUnion.status, "unresolved");
  assert.match(portUnion.body, /Caterpillar D398A/);
  assert.match(portUnion.body, /675 kVA/);
  assert.match(stationText("PUN"), /1945 ORIGINAL STANDBY DIESEL/);
  assert.match(stationText("PUN"), /1962 and 1972 dates/);
});

test("1945 property records retain exact locations and dates", () => {
  const property = timeline.find((entry) => entry.date === "1945" && /six 1945 deeds/.test(entry.title));
  assert.ok(property);
  assert.match(property.body, /Rocky Pond deeds dated February 1945/);
  assert.match(property.body, /Broad Cove deed dated November 14/);
  assert.match(property.body, /Topsail Road deed dated June 7/);
  assert.match(property.body, /Heart's Content deed dated July 4/);
  assert.match(property.body, /Port aux Basques deed dated April 19/);
  assert.match(stationText("ROP"), /William J\. Long deed/);
  assert.match(stationText("BCV"), /November 14, 1945/);
  assert.match(stationText("HCT"), /Reuben George/);
  assert.match(stationText("PAB"), /Gladys Hann/);
});

test("1945 claim and public card retain exact source pages", () => {
  const claim = staticClaims.find((candidate) => candidate.id === "np-1945-system-record");
  assert.ok(claim);
  assert.equal(claim.status, "unresolved");
  assert.equal(claim.sources.length, 6);
  assert.equal(sources.find((source) => source.id === "np-1945-lookout-brook")?.pages, "physical PDF p. 142");
  assert.equal(sources.find((source) => source.id === "np-1945-lookout-brook-development")?.pages, "physical PDF p. 198");
  assert.equal(sources.find((source) => source.id === "np-1945-lookout-brook-road")?.pages, "physical PDF p. 138");
  assert.equal(sources.find((source) => source.id === "np-1945-port-union-diesel")?.pages, "physical PDF pp. 162 and 176");
  assert.equal(sources.find((source) => source.id === "np-1945-property-record")?.pages, "physical PDF pp. 137, 152, 153 and 155");
  const html = readAtlasHtmlSync();
  assert.match(html, /data-claim-id="np-1945-system-record"/);
  assert.match(html, /13\.1 km Flat Bay Brook access road/);
  assert.match(html, /property deed dated November 14, 1945/);
});
