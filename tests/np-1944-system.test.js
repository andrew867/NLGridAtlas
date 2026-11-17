import { readAtlasHtmlSync } from "./page-fixture.js";
import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { sources, staticClaims, stationProfiles, timeline } from "../src/data.js";

const stationText = (code) => JSON.stringify(stationProfiles.find((candidate) => candidate.code === code));

test("1944 Salmon River record preserves the two filed date ranges", () => {
  const hydrology = timeline.find((entry) => entry.date === "1944" && /Salmon River/.test(entry.title));
  assert.ok(hydrology);
  assert.equal(hydrology.status, "unresolved");
  assert.match(hydrology.body, /1944 to 1964 and 21 years/);
  assert.match(hydrology.body, /1944 to 1965 and 22 years/);
  assert.match(hydrology.body, /Bay d'Espoir inflow sequence/);
});

test("1944 property records remain attached to the correct stations", () => {
  const property = timeline.find((entry) => entry.date === "1944" && /three 1944 deeds/.test(entry.title));
  assert.ok(property);
  assert.match(property.body, /Walter E\. Seibert/);
  assert.match(property.body, /Volume 177, Folio 510/);
  assert.match(property.body, /Leo Gaultois and Mary O'Reilly/);
  assert.match(stationText("WBK"), /West Brook property acquired from Walter E\. Seibert/);
  assert.match(stationText("STG"), /Leo Gaultois deed/);
  assert.match(stationText("STG"), /Mary O'Reilly deed/);
});

test("1944 claim and public card retain exact source pages", () => {
  const claim = staticClaims.find((candidate) => candidate.id === "np-1944-system-record");
  assert.ok(claim);
  assert.equal(claim.status, "unresolved");
  assert.equal(claim.sources.length, 3);
  assert.equal(sources.find((source) => source.id === "nlh-1944-salmon-river-record")?.pages, "physical PDF pp. 33 and 43");
  assert.equal(sources.find((source) => source.id === "nlh-1944-salmon-river-refresh")?.pages, "physical PDF p. 340");
  assert.equal(sources.find((source) => source.id === "np-1944-property-record")?.pages, "physical PDF pp. 152 and 155");
  const html = readAtlasHtmlSync();
  assert.match(html, /data-claim-id="np-1944-system-record"/);
  assert.match(html, /1944 to 1964; 21 years/);
  assert.match(html, /1944 to 1965; 22 years/);
  assert.match(html, /Volume 177, Folio 510/);
});
