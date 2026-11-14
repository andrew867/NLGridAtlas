import assert from "node:assert/strict";
import test from "node:test";
import { components, islandTerminalRecords, sources, staticClaims, stationProfiles, timeline } from "../src/data.js";

const recordText = (code) => JSON.stringify(stationProfiles.filter((station) => station.code === code));

test("1975 demand record does not invent an Island transmission peak", () => {
  const demand = timeline.find((entry) => entry.date === "1975" && /488\.2 MW/.test(entry.title));
  assert.ok(demand);
  assert.match(demand.body, /527 MW/);
  assert.match(demand.body, /does not print an Island transmission peak/);
});

test("Wiltondale terminal record retains its supply, transmission and distribution links", () => {
  const wiltondale = islandTerminalRecords.find((station) => station.code === "WDL");
  assert.ok(wiltondale);
  assert.match(JSON.stringify(wiltondale), /2\.4 km, 66 kV tap from TL226/);
  assert.match(JSON.stringify(wiltondale), /TL229/);
  assert.match(JSON.stringify(wiltondale), /WDL-L1/);
  assert.match(JSON.stringify(wiltondale), /7\.80 interruptions per delivery point/);
  assert.match(JSON.stringify(wiltondale), /179\.80 hours/);
  assert.match(JSON.stringify(islandTerminalRecords.find((station) => station.code === "DLK")), /"destinationCode":"WDL"/);
  assert.match(JSON.stringify(islandTerminalRecords.find((station) => station.code === "BRH")), /"destinationCode":"WDL"/);
});

test("Holyrood terminal stages and Stephenville plant service date are retained", () => {
  assert.match(JSON.stringify(components["hrd-summary"]), /Stage 1 in 1965; Stage 2 in 1975; Stage 3 in 1982/);
  assert.match(recordText("STV"), /1975/);
  assert.match(recordText("STV"), /Rolls-Royce Olympus C/);
  assert.match(recordText("STV"), /63\.5 MVA/);
});

test("Greenhill preserves both turbine and substation date conflicts", () => {
  const record = recordText("GRH");
  assert.match(record, /1975 TO 1977 FACILITY DATE CONFLICT/);
  assert.match(record, /commissioned in 1975/);
  assert.match(record, /installed near Grand Bank in 1977/);
  assert.match(record, /physical page 14 says constructed in 1975/);
  assert.match(record, /physical page 45 says constructed in 1977/);
});

test("1975 network records retain 305L and the Clarenville section of 100L", () => {
  const record = JSON.stringify(timeline.filter((entry) => entry.date === "1975"));
  assert.match(record, /305L entered the Burin Peninsula 66 kV loop/);
  assert.match(record, /Greenhill, Webbers Cove and Laurentian/);
  assert.match(record, /2 km section connecting 100L to Clarenville Substation/);
  assert.match(record, /34\.13 km, 138 kV H-frame line dates to 1964/);
});

test("1975 system claim retains source pages and unresolved state", () => {
  const claim = staticClaims.find((candidate) => candidate.id === "np-1975-system-record");
  assert.ok(claim);
  assert.equal(claim.status, "unresolved");
  assert.equal(claim.sources.length, 12);
  assert.equal(sources.find((source) => source.id === "nlh-1975-historical-demand")?.pages, "physical PDF p. 2");
  assert.equal(sources.find((source) => source.id === "nlh-1975-wiltondale")?.pages, "physical PDF pp. 766 to 775");
  assert.equal(sources.find((source) => source.id === "nlh-1975-holyrood-stage2")?.pages, "physical PDF p. 334");
  assert.equal(sources.find((source) => source.id === "np-1975-burin-network")?.pages, "physical PDF p. 5");
  assert.equal(sources.find((source) => source.id === "np-2026-100l")?.pages, "physical PDF p. 96");
});
