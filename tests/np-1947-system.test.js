import { readAtlasHtmlSync } from "./page-fixture.js";
import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { sources, staticClaims, stationProfiles, timeline } from "../src/data.js";

const stationText = (code) => JSON.stringify(stationProfiles.find((candidate) => candidate.code === code));

test("1947 survey records retain the benchmark values and later uses", () => {
  const survey = timeline.find((entry) => entry.date === "1947" && /survey control/.test(entry.title));
  assert.ok(survey);
  assert.equal(survey.status, "reported");
  assert.match(survey.body, /72\.04-foot benchmark/);
  assert.match(survey.body, /1965 site mapping/);
  assert.match(survey.body, /Hamilton Falls/);
  assert.match(survey.body, /Twin Falls development area/);
});

test("1947 Port aux Basques ledger value remains plant-specific", () => {
  const event = timeline.find((entry) => entry.date === "1947" && /Port aux Basques/.test(entry.title));
  assert.ok(event);
  assert.match(event.body, /\$1,700/);
  assert.match(event.body, /electrical-plant original cost/);
  assert.match(stationText("PAB"), /1947 ELECTRICAL-PLANT LEDGER/);
  assert.match(stationText("PAB"), /Account 332, Electrical Plant/);
});

test("1947 claim and public card retain exact source pages", () => {
  const claim = staticClaims.find((candidate) => candidate.id === "np-1947-system-record");
  assert.ok(claim);
  assert.equal(claim.status, "reported");
  assert.equal(claim.sources.length, 3);
  assert.equal(sources.find((source) => source.id === "nlh-1947-muskrat-survey")?.pages, "physical PDF p. 69");
  assert.equal(sources.find((source) => source.id === "nlh-1947-hamilton-falls-benchmark")?.pages, "physical PDF p. 135");
  assert.equal(sources.find((source) => source.id === "np-1947-port-aux-basques-electrical-plant")?.pages, "physical PDF p. 1049");
  const html = readAtlasHtmlSync();
  assert.match(html, /data-claim-id="np-1947-system-record"/);
  assert.match(html, /72\.04-foot benchmark/);
  assert.match(html, /\$1,700 original cost/);
  assert.doesNotMatch(html, /1947 radio installation/i);
});
