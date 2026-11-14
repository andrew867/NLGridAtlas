import assert from "node:assert/strict";
import test from "node:test";
import { islandTerminalRecords, sources, staticClaims, stationProfiles, timeline } from "../src/data.js";

const recordText = (code) => JSON.stringify(
  islandTerminalRecords.find((station) => station.code === code)
  ?? stationProfiles.find((station) => station.code === code)
);

test("1982 demand and planning values remain distinct", () => {
  const actual = timeline.find((entry) => entry.date === "1982" && /1,083 MW/.test(entry.title));
  assert.ok(actual);
  assert.match(actual.body, /731\.8 MW/);
  assert.match(actual.body, /880 MW/);
  assert.match(actual.body, /does not provide a separate Hydro Rural peak/);

  const planning = timeline.find((entry) => entry.date === "1982 planning case");
  assert.ok(planning);
  assert.equal(planning.status, "proposed");
  assert.match(planning.title, /1,309 MW/);
  assert.match(planning.body, /147 GWh surplus/);
});

test("1982 transmission records retain routes, voltage and lengths", () => {
  const avalon = timeline.find((entry) => entry.date === "1982" && /Holyrood to Hardwoods/.test(entry.title));
  assert.ok(avalon);
  assert.match(avalon.body, /27 km/);
  assert.match(avalon.body, /TL242/);

  const tl239 = timeline.find((entry) => entry.date === "1982" && /TL239/.test(entry.title));
  assert.ok(tl239);
  assert.match(tl239.body, /138 kV/);
  assert.match(tl239.body, /610 wood-pole structures/);
  assert.match(tl239.body, /71 km/);

  const tl253 = timeline.find((entry) => entry.date === "1982" && /TL253/.test(entry.title));
  assert.ok(tl253);
  assert.match(tl253.body, /12 km/);
  assert.match(tl253.title, /69 kV/);

  const burin = timeline.find((entry) => entry.date === "1982" && /300L and 308L/.test(entry.title));
  assert.ok(burin);
  assert.match(burin.body, /Linton Lake to Marystown/);
  assert.match(burin.body, /Marystown to Salt Pond/);
});

test("1982 plant and station work is attached to asset records", () => {
  assert.match(recordText("HLA"), /January 30, 1982/);
  assert.match(recordText("HLA"), /three months/);
  assert.match(recordText("BRH"), /48 V, 35 A Saft Nife/);
  assert.match(recordText("BVS"), /1982 CONTROL BUILDING AND PROTECTION/);
  assert.match(recordText("BVS"), /357L, 358L, and 359L/);
  assert.match(recordText("SPO"), /1982 TRANSFORMER PROTECTION/);
});

test("1982 system claim retains page references", () => {
  const claim = staticClaims.find((candidate) => candidate.id === "np-1982-system-record");
  assert.ok(claim);
  assert.equal(claim.status, "reported");
  assert.equal(claim.sources.length, 9);
  assert.equal(sources.find((source) => source.id === "nlh-1982-tl239")?.pages, "physical PDF p. 10");
  assert.equal(sources.find((source) => source.id === "nlh-1982-tl253")?.pages, "physical PDF p. 116");
  assert.equal(sources.find((source) => source.id === "nlh-1982-berry-hill-charger")?.pages, "physical PDF p. 725");
});
