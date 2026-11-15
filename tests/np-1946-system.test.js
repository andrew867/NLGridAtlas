import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { sources, staticClaims, stationProfiles, timeline } from "../src/data.js";

const stationText = (code) => JSON.stringify(stationProfiles.find((candidate) => candidate.code === code));

test("1946 generation and station records retain their equipment sequence", () => {
  const lookout = timeline.find((entry) => entry.date === "1946" && /Lookout Brook/.test(entry.title));
  assert.ok(lookout);
  assert.match(lookout.body, /G1 and G2/);
  assert.match(lookout.body, /G3 followed in 1958/);
  assert.match(lookout.body, /replaced by G4 in 1984/);
  const portAuxBasques = timeline.find((entry) => entry.date === "1946" && /Port aux Basques/.test(entry.title));
  assert.ok(portAuxBasques);
  assert.match(portAuxBasques.body, /\$9,670/);
  assert.match(stationText("LBK"), /1945 \/ 1946 COMMISSIONING DATE CONFLICT/);
  assert.equal(lookout.status, "unresolved");
  assert.match(stationText("PAB"), /1946 STATION AND DIESEL-PLANT RECORD/);
});

test("1946 hydro civil records remain attached to Heart's Content and Seal Cove", () => {
  const heartsContent = timeline.find((entry) => entry.date === "1946" && /Heart's Content development/.test(entry.title));
  assert.ok(heartsContent);
  assert.equal(heartsContent.status, "unresolved");
  assert.match(heartsContent.body, /558 m woodstave penstock/);
  assert.match(heartsContent.body, /1965/);
  assert.match(stationText("HCT"), /1946 DEVELOPMENT REBUILD AND LAND RECORD/);
  assert.match(stationText("HCT"), /separate asset-ledger record dates the existing penstock to 1965/);
  assert.match(stationText("SCV"), /1946 FENELONS POND DAM/);
});

test("1946 watershed and property records retain exact dates", () => {
  const property = timeline.find((entry) => entry.date === "1946" && /Mobile water rights/.test(entry.title));
  assert.ok(property);
  assert.match(property.body, /November 23, 1946/);
  assert.match(property.body, /October 12, 1946/);
  assert.match(stationText("MOP"), /1946 MOBILE RIVER WATERSHED LEASE/);
});

test("1946 claim and public card retain exact source pages", () => {
  const claim = staticClaims.find((candidate) => candidate.id === "np-1946-system-record");
  assert.ok(claim);
  assert.equal(claim.status, "unresolved");
  assert.equal(claim.sources.length, 8);
  assert.equal(sources.find((source) => source.id === "np-1946-lookout-brook")?.pages, "physical PDF pp. 112, 438 and 440");
  assert.equal(sources.find((source) => source.id === "np-1946-port-aux-basques-station")?.pages, "physical PDF p. 292");
  assert.equal(sources.find((source) => source.id === "np-1946-hearts-content-civil")?.pages, "physical PDF pp. 180 to 181");
  assert.equal(sources.find((source) => source.id === "np-1946-fenelons-pond")?.pages, "physical PDF p. 7");
  assert.equal(sources.find((source) => source.id === "np-1946-property-record")?.pages, "physical PDF p. 153");
  const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
  assert.match(html, /data-claim-id="np-1946-system-record"/);
  assert.match(html, /\$9,670 original cost/);
  assert.match(html, /October 12, 1946/);
});
