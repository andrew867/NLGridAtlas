import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { sources, staticClaims, stationProfiles, timeline } from "../src/data.js";

const stationText = (code) => JSON.stringify(stationProfiles.find((candidate) => candidate.code === code));

test("1941 Tors Cove record keeps service and original equipment values", () => {
  const service = timeline.find((entry) => entry.date === "1941" && /plant and substation/.test(entry.title));
  assert.ok(service);
  assert.equal(service.status, "unresolved");
  assert.match(service.body, /two 2,350 kVA English Electric generators/);
  assert.match(service.body, /two 2,850 hp Francis turbines/);
  assert.match(service.body, /52\.7 m rated net head/);
  assert.match(stationText("TCV"), /1940 \/ 1941 \/ 1942 DATE CONFLICT/);
});

test("1941 Tors Cove equipment dates remain separate from the 1951 G3 addition", () => {
  const text = stationText("TCV");
  assert.match(text, /G3 equipment date/);
  assert.match(text, /unit added in 1951/);
  assert.match(text, /runner installation, generator manufacture and original power cables to 1941/);
  assert.match(text, /17 m penstock trestle supporting 2,438 mm woodstave pipe/);
  assert.match(text, /15-ton Vaughan double-girder crane/);
});

test("1941 Rocky Pond generator and Tors Cove property records remain attached", () => {
  const rockyPond = stationText("ROP");
  const torsCove = stationText("TCV");
  assert.match(rockyPond, /Westinghouse; manufactured in 1941; 6\.9 kV/);
  assert.match(rockyPond, /stator windings described as extremely brittle/);
  assert.match(torsCove, /John Ronayne/);
  assert.match(torsCove, /Avalon and William P\. Goodridge/);
  assert.match(torsCove, /Charles Power/);
});

test("1941 claim and public card retain exact source pages", () => {
  const claim = staticClaims.find((candidate) => candidate.id === "np-1941-system-record");
  assert.ok(claim);
  assert.equal(claim.status, "unresolved");
  assert.equal(claim.sources.length, 6);
  assert.equal(sources.find((source) => source.id === "np-1941-tors-cove-equipment")?.pages, "physical PDF pp. 353 to 354, 356 and 359");
  assert.equal(sources.find((source) => source.id === "np-1941-tors-cove-g3-equipment")?.pages, "physical PDF pp. 206 to 207 and 210");
  assert.equal(sources.find((source) => source.id === "np-1941-tors-cove-bridges")?.pages, "physical PDF p. 175");
  assert.equal(sources.find((source) => source.id === "np-1941-property-record")?.pages, "physical PDF p. 136");
  const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
  assert.match(html, /data-claim-id="np-1941-system-record"/);
  assert.match(html, /unit added in 1951; runner, generator and original power cables separately dated to 1941/);
  assert.match(html, /three deeds dated January 9, March 13 and April 15, 1941/);
});
