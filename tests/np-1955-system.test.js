import assert from "node:assert/strict";
import test from "node:test";
import { sources, staticClaims, stationProfiles, timeline } from "../src/data.js";

const stationText = (code) => JSON.stringify(stationProfiles.find((candidate) => candidate.code === code));

test("1955 record does not invent a demand value", () => {
  assert.equal(timeline.some((entry) => entry.date === "1955" && entry.category === "load"), false);
});

test("Lockston history retains the original 46 kV Port Union link", () => {
  const event = timeline.find((entry) => entry.date === "1955" && /46 kV line/.test(entry.title));
  assert.ok(event);
  assert.match(event.body, /planned plant.*Port Union electricity system/);
  assert.doesNotMatch(event.body, /66 kV/);
  assert.match(stationText("LOK"), /1955 46 KV LINK TO PORT UNION/);
  assert.match(stationText("LOK"), /increased to 66 kV in 1965/);
});

test("Bell Island history retains cable identity and retirement cause", () => {
  const event = timeline.find((entry) => entry.date === "1955" && /cable 28L/.test(entry.title));
  assert.ok(event);
  assert.match(event.body, /three submarine cables installed in 1932/);
  assert.match(event.body, /abandoned in 1990 after a cable fault/);
  assert.match(event.body, /tidal zone.*cast-iron necklaces/);
  assert.match(stationText("BCV"), /1955 BELL ISLAND SUBMARINE CABLE 28L/);
});

test("Venam's Bight penstock date remains separate from plant dates", () => {
  const event = timeline.find((entry) => entry.date === "1955" && /wood-stave penstock/.test(entry.title));
  assert.ok(event);
  assert.match(event.body, /supplied water to the generating station/);
  assert.match(event.body, /predates the 1956 construction and 1956 or 1957 commissioning dates/);
});

test("March 1955 ice event retains exact dates and observed damage", () => {
  const event = timeline.find((entry) => entry.date === "March 13 to 22, 1955");
  assert.ok(event);
  assert.match(event.body, /United Towns Electric lost three poles/);
  assert.match(event.body, /one area served by Newfoundland Power was dark/);
  assert.match(event.body, /wires were torn from eight houses/);
  assert.match(event.body, /Canadian National Telegraphs.*no wind/);
});

test("1955 system claim retains exact source pages", () => {
  const claim = staticClaims.find((candidate) => candidate.id === "np-1955-system-record");
  assert.ok(claim);
  assert.equal(claim.status, "reported");
  assert.equal(claim.sources.length, 4);
  assert.equal(sources.find((source) => source.id === "np-1955-bell-island-28l")?.pages, "physical PDF pp. 15, 79 to 80 and 314");
  assert.equal(sources.find((source) => source.id === "nlh-1955-venams-bight-penstock")?.pages, "physical PDF p. 34");
  assert.equal(sources.find((source) => source.id === "nlh-1955-ice-storm")?.pages, "physical PDF p. 54");
});
