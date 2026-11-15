import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { sources, staticClaims, stationProfiles, timeline } from "../src/data.js";

const stationText = (code) => JSON.stringify(stationProfiles.find((candidate) => candidate.code === code));

test("1943 Rocky Pond record preserves the commissioning conflict and equipment", () => {
  const rockyPond = timeline.find((entry) => entry.date === "1943" && /Rocky Pond commissioning/.test(entry.title));
  assert.ok(rockyPond);
  assert.equal(rockyPond.status, "unresolved");
  assert.match(rockyPond.body, /Dominion vertical Francis turbine/);
  assert.match(rockyPond.body, /3\.2 MW/);
  assert.match(rockyPond.body, /2009 capital filing dates plant service to 1942/);
  assert.match(stationText("ROP"), /1942 \/ 1943 COMMISSIONING DATE CONFLICT/);
  assert.match(stationText("ROP"), /multiple later development records say 1943/);
});

test("1943 hydraulic and access records remain attached to Rocky Pond", () => {
  const waterworks = timeline.find((entry) => entry.date === "1943" && /La Manche Canal/.test(entry.title));
  assert.ok(waterworks);
  assert.match(waterworks.body, /12\.6 km Cape Pond Road/);
  assert.match(waterworks.body, /Cluney's/);
  assert.match(stationText("ROP"), /1943 LA MANCHE CANAL AND CAPE POND ROAD/);
  assert.match(stationText("ROP"), /six spillways/);
});

test("1943 property records remain attached to King's Bridge and Fall Pond", () => {
  const property = timeline.find((entry) => entry.date === "1943" && /five 1943 deeds/.test(entry.title));
  assert.ok(property);
  assert.match(property.body, /January 11 and May 29/);
  assert.match(property.body, /three Fall Pond deeds/);
  assert.match(stationText("KBR"), /Elizabeth M\. Stead deed/);
  assert.match(stationText("KBR"), /Volume 169, Folios 76 to 78/);
  assert.match(stationText("FPD"), /Volume 167, Folio 800/);
  assert.match(stationText("FPD"), /Volume 167, Folio 801/);
  assert.match(stationText("FPD"), /Volume 167, Folio 598/);
});

test("1943 claim and public card retain exact source pages", () => {
  const claim = staticClaims.find((candidate) => candidate.id === "np-1943-system-record");
  assert.ok(claim);
  assert.equal(claim.status, "unresolved");
  assert.equal(claim.sources.length, 5);
  assert.equal(sources.find((source) => source.id === "np-1943-rocky-pond")?.pages, "physical PDF pp. 240 to 241");
  assert.equal(sources.find((source) => source.id === "np-1943-cape-pond-road")?.pages, "physical PDF p. 169");
  assert.equal(sources.find((source) => source.id === "np-1943-property-record")?.pages, "physical PDF pp. 137 and 152");
  const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
  assert.match(html, /data-claim-id="np-1943-system-record"/);
  assert.match(html, /12\.6 km gravel access road/);
  assert.match(html, /three property deeds dated May 18, 1943/);
});
