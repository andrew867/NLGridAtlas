import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { sources, staticClaims, stationProfiles, timeline } from "../src/data.js";

const stationText = (code) => JSON.stringify(stationProfiles.find((candidate) => candidate.code === code));

test("1942 Tors Cove record preserves all three published dates", () => {
  const record = timeline.find((entry) => entry.date === "1942" && /Tors Cove construction dates/.test(entry.title));
  assert.ok(record);
  assert.equal(record.status, "unresolved");
  assert.match(record.body, /G1 and G2 to 1940/);
  assert.match(record.body, /plant service and substation construction to 1941/);
  assert.match(record.body, /plant commissioning to 1942/);
  assert.match(stationText("TCV"), /1940 \/ 1941 \/ 1942 DATE CONFLICT/);
  assert.match(stationText("TCV"), /G3 installed in 1951/);
});

test("1942 transmission and Rocky Pond infrastructure retain filed voltages and duties", () => {
  const lines = timeline.find((entry) => entry.date === "1942" && /11L and 23L/.test(entry.title));
  assert.ok(lines);
  assert.match(lines.body, /5\.0 km, 66 kV line 11L/);
  assert.match(lines.body, /5\.5 km, 33 kV line 23L/);
  assert.match(stationText("PBK"), /non-standard 3\/0 copper/);
  assert.match(stationText("ROP"), /one 4 MVA transformer at 6\.9 kV/);
  assert.match(stationText("ROP"), /12\.5 kV line built in 1942/);
  assert.match(stationText("ROP"), /gate control and gate position/);
});

test("1942 West Brook, Fall Pond and property records remain attached", () => {
  assert.match(stationText("WBK"), /one Leffel horizontal Francis turbine/);
  assert.match(stationText("WBK"), /680 kW under approximately 47\.0 m net head/);
  assert.match(stationText("FPD"), /54\.7 m crest/);
  assert.match(stationText("FPD"), /Edward Turpin/);
  assert.match(stationText("MOB"), /Roman Catholic Episcopal Corporation/);
  assert.match(stationText("GOU"), /Volume 163, Folio 413/);
  assert.match(stationText("ROP"), /W\. J\. Long, W\. J\. Morris and George H\. Parsons/);
});

test("1942 claim and public card retain exact source pages", () => {
  const claim = staticClaims.find((candidate) => candidate.id === "np-1942-system-record");
  assert.ok(claim);
  assert.equal(claim.status, "unresolved");
  assert.equal(claim.sources.length, 8);
  assert.equal(sources.find((source) => source.id === "np-1942-hydro-record")?.pages, "physical PDF pp. 137 and 140");
  assert.equal(sources.find((source) => source.id === "np-1942-23l")?.pages, "physical PDF p. 330");
  assert.equal(sources.find((source) => source.id === "np-1942-fall-pond-dam")?.pages, "physical PDF p. 188");
  assert.equal(sources.find((source) => source.id === "np-1942-property-record")?.pages, "physical PDF pp. 136 to 137 and 152");
  const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
  assert.match(html, /data-claim-id="np-1942-system-record"/);
  assert.match(html, /original 33 kV, 5\.5 km radial line/);
  assert.match(html, /eight recorded utility property transactions/);
});
