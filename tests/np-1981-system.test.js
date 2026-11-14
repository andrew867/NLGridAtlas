import assert from "node:assert/strict";
import test from "node:test";
import { islandTerminalRecords, sources, staticClaims, stationProfiles, timeline } from "../src/data.js";

const recordText = (code) => JSON.stringify(
  islandTerminalRecords.find((station) => station.code === code)
  ?? stationProfiles.find((station) => station.code === code)
);

test("1981 demand and planning values remain distinct", () => {
  const actual = timeline.find((entry) => entry.date === "1981" && /978 MW/.test(entry.title));
  assert.ok(actual);
  assert.match(actual.body, /716\.2 MW/);
  assert.match(actual.body, /834 MW/);

  const planning = timeline.find((entry) => entry.date === "1981 planning case");
  assert.ok(planning);
  assert.equal(planning.status, "proposed");
  assert.match(planning.title, /1,234 MW/);
  assert.match(planning.body, /592 GWh surplus/);
});

test("1981 transmission records retain routes, voltage and lengths", () => {
  const tl232 = timeline.find((entry) => entry.date === "1981" && /TL232/.test(entry.title));
  assert.ok(tl232);
  assert.match(tl232.body, /84 km/);
  assert.match(tl232.title, /230 kV/);

  const tl234 = timeline.find((entry) => entry.date === "1981" && /TL234/.test(entry.title));
  assert.ok(tl234);
  assert.match(tl234.body, /51\.5 km/);
  assert.match(tl234.body, /230 kV/);

  const whiteBay = timeline.find((entry) => entry.date === "1981" && /TL251 and TL252/.test(entry.title));
  assert.ok(whiteBay);
  assert.match(whiteBay.body, /48 km/);
  assert.match(whiteBay.body, /53 km/);
  assert.match(whiteBay.body, /69 kV/);

  const npLines = timeline.find((entry) => entry.date === "1981" && /136L and 147L/.test(entry.title));
  assert.ok(npLines);
  assert.match(npLines.body, /81 km/);
  assert.match(npLines.body, /58 km/);
  assert.match(npLines.title, /138 kV/);
});

test("1981 station and generation work is attached to asset records", () => {
  assert.match(recordText("GPD"), /1981 CONSTRUCTION AND GRID CONNECTION/);
  assert.match(recordText("GPD"), /Hydro diesel station/);
  assert.match(recordText("BFS"), /1981 ORIGINAL 136L CONNECTION/);
  assert.match(recordText("COB"), /1981 138 KV TRANSMISSION EXPANSION/);
  assert.match(recordText("LEW"), /1981 147L CONSTRUCTION/);
  assert.match(recordText("TOP"), /1981 PENSTOCK DATE CONFLICT/);
  assert.match(recordText("BDE"), /1981 UNIT 5 DRAFT-TUBE REPAIRS/);
  assert.match(recordText("STB"), /1981 TL232 CONSTRUCTION/);
  assert.match(recordText("BUC"), /1981 TL232 CONSTRUCTION/);
  assert.match(recordText("USL"), /1981 TL234 CONSTRUCTION/);
});

test("Topsail date conflict remains unresolved", () => {
  const topsail = timeline.find((entry) => entry.date === "1981" && /Topsail penstock/.test(entry.title));
  assert.ok(topsail);
  assert.equal(topsail.status, "unresolved");
  assert.match(topsail.body, /1983 major refurbishment/);
});

test("1981 system claim retains page references", () => {
  const claim = staticClaims.find((candidate) => candidate.id === "np-1981-system-record");
  assert.ok(claim);
  assert.equal(claim.status, "unresolved");
  assert.equal(claim.sources.length, 15);
  assert.equal(sources.find((source) => source.id === "nlh-1981-tl232")?.pages, "physical PDF p. 116");
  assert.equal(sources.find((source) => source.id === "nlh-1981-tl234-tl252")?.pages, "physical PDF p. 54");
  assert.equal(sources.find((source) => source.id === "np-1981-147l")?.pages, "physical PDF p. 11");
  assert.equal(sources.find((source) => source.id === "nlh-1981-hardwoods-b7c1")?.pages, "physical PDF pp. 72 to 73");
});
