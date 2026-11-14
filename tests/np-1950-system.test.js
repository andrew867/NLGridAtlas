import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { sources, staticClaims, stationProfiles, timeline } from "../src/data.js";

const stationText = (code) => JSON.stringify(stationProfiles.find((candidate) => candidate.code === code));

test("Mobile preserves the 1950 and 1951 commissioning conflict", () => {
  const event = timeline.find((entry) => entry.date === "1950 or 1951" && /Mobile hydro plant/.test(entry.title));
  assert.ok(event);
  assert.equal(event.status, "unresolved");
  assert.match(event.body, /2013 plant history dates powerhouse commissioning to 1950/);
  assert.match(event.body, /Later capital records date the plant and original 11\.0 MVA equipment to 1951/);
  assert.match(event.body, /2026 filing also gives both 1950 and 1951 for MOP Substation.*2027 filing gives 1951/);
  assert.match(stationText("MOP"), /1950 OR 1951 POWERHOUSE COMMISSIONING/);
  assert.match(stationText("MOP"), /Dominion Engineering Works supplied the original turbine.*Voith supplied the replacement runner and wicket gates in 1990/);
});

test("1950 line records retain voltage, length, construction, and later endpoint limits", () => {
  const combined = timeline.find((entry) => entry.date === "1950" && /12L and 14L/.test(entry.title));
  const line16 = timeline.find((entry) => entry.date === "1950" && /16L was constructed/.test(entry.title));
  assert.ok(combined);
  assert.ok(line16);
  assert.match(combined.body, /12L as 2\.2 km.*59 single-pole structures.*1\/0 copper/);
  assert.match(combined.body, /14L as 1\.13 km of aerial line/);
  assert.match(combined.body, /later endpoints.*Memorial Substation was not built until 1966/);
  assert.match(line16.body, /66 kV.*1\.98 km.*single-pole.*1\/0 copper/);
  assert.match(line16.body, /50 structures.*43 with distribution underbuild/);
});

test("TCV-T1 retains its 1950 manufacturer and nameplate record", () => {
  const event = timeline.find((entry) => entry.date === "1950" && /TCV-T1 was manufactured/.test(entry.title));
  assert.ok(event);
  assert.match(event.body, /Canadian General Electric.*P-298.*serial 256858/);
  assert.match(event.body, /7\.5 MVA.*6\.9 kV to 33\/66 kV/);
  assert.match(stationText("TCV"), /asset P-298.*serial 256858.*built in 1950.*6\.9 kV to 33\/66 kV.*7\.5 MVA/);
});

test("Bay Roberts preserves the conflicting construction years", () => {
  const event = timeline.find((entry) => entry.date === "1950 or 1967" && /Bay Roberts/.test(entry.title));
  assert.ok(event);
  assert.equal(event.status, "unresolved");
  assert.match(event.body, /2004 construction-year table gives 1950/);
  assert.match(event.body, /built as a distribution substation in 1967.*expanded.*1978/);
  assert.match(stationText("BRB"), /1950 OR 1967 CONSTRUCTION RECORD/);
});

test("1950 system claim and public card retain exact source locators", () => {
  const claim = staticClaims.find((candidate) => candidate.id === "np-1950-system-record");
  assert.ok(claim);
  assert.equal(claim.status, "unresolved");
  assert.equal(claim.sources.length, 11);
  assert.equal(sources.find((source) => source.id === "np-1950-mobile-commissioning")?.pages, "physical PDF p. 136");
  assert.equal(sources.find((source) => source.id === "np-2014-transmission-lines")?.pages, "physical PDF pp. 307 to 320");
  assert.equal(sources.find((source) => source.id === "np-2015-transmission-lines")?.pages, "physical PDF pp. 552 to 569");
  assert.equal(sources.find((source) => source.id === "np-2022-tors-cove")?.pages, "physical PDF pp. 289 to 292, 296 and 329 to 339");
  const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
  assert.match(html, /data-claim-id="np-1950-system-record"/);
  assert.match(html, /Mobile powerhouse.*2013 plant history gives 1950.*later plant and original-equipment records give 1951/s);
});
