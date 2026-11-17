import { readAtlasHtmlSync } from "./page-fixture.js";
import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { sources, staticClaims, stationProfiles, timeline } from "../src/data.js";

const stationText = (code) => JSON.stringify(stationProfiles.find((candidate) => candidate.code === code));

test("Mobile retains the 1949 watershed-rights amendment", () => {
  const event = timeline.find((entry) => entry.date === "1949" && /Mobile River rights/.test(entry.title));
  assert.ok(event);
  assert.equal(event.status, "reported");
  assert.match(event.body, /1946 Mobile River watershed lease was amended on October 21, 1949/);
  assert.match(event.body, /approximately 49 GWh annually.*not a 1949 production record/);
  assert.match(stationText("MOP"), /1949 MOBILE RIVER RIGHTS/);
  assert.match(stationText("MOP"), /lease dated November 23, 1946.*agreement dated October 21, 1949/);
});

test("Mobile retains the visually checked 1949 land sequence", () => {
  const event = timeline.find((entry) => entry.date === "1949" && /Mobile River rights/.test(entry.title));
  assert.match(event.body, /September 23, September 28, twice on September 30, and twice on December 13/);
  assert.match(stationText("MOP"), /1949 MOBILE LAND ASSEMBLY/);
  assert.match(stationText("MOP"), /September 23, September 28, two parcels on September 30, and two parcels on December 13, 1949/);
});

test("1949 Board establishment retains its authority distinction", () => {
  const event = timeline.find((entry) => entry.date === "1949" && /Board of Commissioners/.test(entry.title));
  assert.ok(event);
  assert.match(event.body, /general authority to supervise public utilities and approve rates/);
  assert.match(event.body, /earlier Public Utilities Commission/);
});

test("1949 system claim and public card retain exact sources", () => {
  const claim = staticClaims.find((candidate) => candidate.id === "np-1949-system-record");
  assert.ok(claim);
  assert.equal(claim.status, "reported");
  assert.equal(claim.sources.length, 4);
  assert.equal(sources.find((source) => source.id === "np-1949-mobile-water-rights")?.pages, "physical PDF p. 1");
  assert.equal(sources.find((source) => source.id === "np-1949-mobile-watershed-order")?.pages, "physical PDF p. 45");
  assert.equal(sources.find((source) => source.id === "np-1949-property-record")?.pages, "physical PDF pp. 137 to 138");
  assert.equal(sources.find((source) => source.id === "pub-1949-establishment")?.pages, "physical PDF p. 17");
  const html = readAtlasHtmlSync();
  assert.match(html, /data-claim-id="np-1949-system-record"/);
  assert.match(html, /Mobile land.*six deeds dated September 23, September 28, twice on September 30, and twice on December 13/s);
});
