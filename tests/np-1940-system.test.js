import { readAtlasHtmlSync } from "./page-fixture.js";
import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { sources, staticClaims, stationProfiles, timeline } from "../src/data.js";

const stationText = (code) => JSON.stringify(stationProfiles.find((candidate) => candidate.code === code));

test("1940 Tors Cove record retains the filed development values", () => {
  const event = timeline.find((entry) => entry.date === "1940" && /entered the 1940 development record/.test(entry.title));
  assert.ok(event);
  assert.equal(event.status, "unresolved");
  assert.match(event.body, /6,900 kW/);
  assert.match(event.body, /52\.7 m net head/);
  assert.match(event.body, /three English Electric horizontal Francis turbines/);
});

test("1940 unit and governor records preserve the G3 date conflict", () => {
  const text = stationText("TCV");
  assert.match(text, /G1 and G2/);
  assert.match(text, /2\.0 MW each; generating-unit register installation date 1940/);
  assert.match(text, /generating-unit register dates the 2\.3 MW unit to 1951/);
  assert.match(text, /G2 and G3 governors original to the 1940 construction/);
});

test("1940 property records remain attached to Tors Cove", () => {
  const text = stationText("TCV");
  assert.match(text, /fourteen deeds dated from May through December 1940/);
  assert.match(text, /Crown grant dated September 3, 1940/);
  const propertyEvent = timeline.find((entry) => entry.date === "1940" && entry.category === "property");
  assert.ok(propertyEvent);
  assert.match(propertyEvent.body, /fourteen Tors Cove deeds/);
});

test("1940 claim and public card retain exact source pages", () => {
  const claim = staticClaims.find((candidate) => candidate.id === "np-1940-system-record");
  assert.ok(claim);
  assert.equal(claim.status, "unresolved");
  assert.equal(claim.sources.length, 6);
  assert.equal(sources.find((source) => source.id === "np-1940-tors-cove-commissioning")?.pages, "physical PDF p. 240");
  assert.equal(sources.find((source) => source.id === "np-1940-tors-cove-governors")?.pages, "physical PDF p. 2");
  assert.equal(sources.find((source) => source.id === "np-1940-property-record")?.pages, "physical PDF pp. 135 to 136");
  const html = readAtlasHtmlSync();
  assert.match(html, /data-claim-id="np-1940-system-record"/);
  assert.match(html, /fourteen deeds dated from May through December 1940/);
  assert.match(html, /2003 filing calls the G2 and G3 governors original to the 1940 construction/);
});
