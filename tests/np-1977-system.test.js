import assert from "node:assert/strict";
import test from "node:test";
import { islandTerminalRecords, sources, staticClaims, stationProfiles, timeline } from "../src/data.js";

const recordText = (code) => JSON.stringify([
  ...islandTerminalRecords.filter((station) => station.code === code),
  ...stationProfiles.filter((station) => station.code === code)
]);

test("1977 demand record does not invent an Island transmission peak", () => {
  const demand = timeline.find((entry) => entry.date === "1977" && /584\.2 MW/.test(entry.title));
  assert.ok(demand);
  assert.match(demand.body, /679 MW/);
  assert.match(demand.body, /does not print an Island transmission peak/);
});

test("1977 Blaketown dates remain visibly unresolved", () => {
  const event = timeline.find((entry) => entry.date === "1977 to 1978" && /Blaketown/.test(entry.title));
  assert.equal(event?.status, "unresolved");
  assert.match(event.body, /construction.*1977/);
  assert.match(event.body, /installed.*1978/);
  assert.match(recordText("BLK"), /1977 TO 1978 STRUCTURE DATE CONFLICT/);
});

test("1977 station structures are attached to their station records", () => {
  assert.match(recordText("BIG"), /1977 STATION STRUCTURES/);
  assert.match(recordText("BCV"), /1977 LOW-VOLTAGE STRUCTURE/);
  assert.match(recordText("HOL"), /1977 STATION STRUCTURES/);
  assert.match(recordText("BOT"), /1977 STATION STRUCTURES/);
  assert.match(recordText("ABC"), /1977 STRUCTURE RECORD/);
  assert.match(recordText("FRN"), /1977 ASSET RECORD/);
  assert.match(recordText("GIL"), /1977 ASSET RECORD/);
});

test("1977 Greenhill conflict, carrier links and Unit 7 exciter are retained", () => {
  assert.match(recordText("GRH"), /1975 TO 1977 FACILITY DATE CONFLICT/);
  const carrier = timeline.find((entry) => entry.date === "1977" && /carrier links/.test(entry.title));
  assert.match(carrier.body, /TL232/);
  assert.match(carrier.body, /TL205/);
  assert.match(recordText("BDE"), /General Electric Silcomatic IV/);
  assert.match(recordText("BDE"), /91,856/);
});

test("1977 system claim retains source pages and unresolved state", () => {
  const claim = staticClaims.find((candidate) => candidate.id === "np-1977-system-record");
  assert.ok(claim);
  assert.equal(claim.status, "unresolved");
  assert.equal(claim.sources.length, 7);
  assert.equal(sources.find((source) => source.id === "nlh-1977-historical-demand")?.pages, "physical PDF p. 2");
  assert.equal(sources.find((source) => source.id === "np-1977-greenhill-installation")?.pages, "physical PDF p. 11");
  assert.equal(sources.find((source) => source.id === "nlh-1977-powerline-carrier")?.pages, "physical PDF p. 41");
  assert.equal(sources.find((source) => source.id === "nlh-1977-bde-unit7-exciter")?.pages, "physical PDF pp. 36 to 37");
});
