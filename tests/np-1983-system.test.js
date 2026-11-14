import assert from "node:assert/strict";
import test from "node:test";
import { islandTerminalRecords, sources, staticClaims, stationProfiles, timeline } from "../src/data.js";

const recordText = (code) => JSON.stringify(
  islandTerminalRecords.find((station) => station.code === code)
  ?? stationProfiles.find((station) => station.code === code)
);

test("1983 demand and planning values remain distinct", () => {
  const actual = timeline.find((entry) => entry.date === "1983" && /1,251 MW/.test(entry.title));
  assert.ok(actual);
  assert.match(actual.body, /742\.6 MW/);
  assert.match(actual.body, /49\.2 MW/);
  assert.match(actual.body, /1,040 MW/);

  const planning = timeline.find((entry) => entry.date === "1983 planning case");
  assert.ok(planning);
  assert.equal(planning.status, "proposed");
  assert.match(planning.title, /1,362 MW/);
  assert.match(planning.body, /396 GWh surplus/);
});

test("1983 transmission additions retain routes, operating voltages and pages", () => {
  const northern = timeline.find((entry) => entry.date === "1983" && /TL241 and TL244/.test(entry.title));
  assert.ok(northern);
  assert.match(northern.body, /Hawke's Bay to Plum Point/);
  assert.match(northern.body, /Plum Point to Bear Cove/);
  assert.match(northern.body, /operated at 66 kV/);
  assert.equal(northern.pages, "physical PDF p. 35");

  const western = timeline.find((entry) => entry.date === "1983" && /TL248 connected Deer Lake/.test(entry.title));
  assert.ok(western);
  assert.match(western.body, /Massey Drive/);
  assert.match(western.body, /1983 and 1984/);
});

test("Upper Salmon preserves the contemporary and later ratings", () => {
  const commissioning = timeline.find((entry) => entry.date === "January 1983" && /Upper Salmon/.test(entry.title));
  assert.ok(commissioning);
  assert.equal(commissioning.status, "unresolved");
  assert.match(commissioning.body, /86 MW/);
  assert.match(commissioning.body, /84 MW/);
  assert.match(recordText("USL"), /January 1983/);
  assert.match(recordText("USL"), /Contemporary rating/);
  assert.match(recordText("USL"), /Later plant rating/);
});

test("1983 hydroelectric and station work is attached to asset records", () => {
  assert.match(recordText("MRP"), /commissioned in 1983/);
  assert.match(recordText("TOP"), /1983 MAJOR REFURBISHMENT/);
  assert.match(recordText("TOP"), /turbine, generator, switchgear, protection, and control systems/);
  assert.match(recordText("LWN"), /substantially refurbished in 1983/);
  assert.match(recordText("LGL"), /1983 STATION STRUCTURES/);
  assert.match(recordText("SJM"), /1983 LOW-VOLTAGE STRUCTURE/);
});

test("Grand Bay retains the asset-date conflict and capacitor-bank history", () => {
  const record = recordText("GBS");
  assert.match(record, /1983 STATION ASSETS \/ 1984 STATION DATE/);
  assert.match(record, /one-year difference/);
  assert.match(record, /3 MVAR, 66 kV capacitor bank/);
});

test("1983 VHF record does not invent a radio count", () => {
  const radio = timeline.find((entry) => entry.date === "1983" && /Midland VHF mobiles/.test(entry.title));
  assert.ok(radio);
  assert.match(radio.body, /Midland 70-341/);
  assert.match(radio.body, /Torbayman's Pond/);
  assert.match(radio.body, /does not state how many/);
});

test("1983 system claim retains primary page references", () => {
  const claim = staticClaims.find((candidate) => candidate.id === "np-1983-system-record");
  assert.ok(claim);
  assert.equal(claim.status, "reported");
  assert.equal(claim.sources.length, 8);
  assert.equal(sources.find((source) => source.id === "np-1983-vhf")?.pages, "physical PDF p. 1");
  assert.equal(sources.find((source) => source.id === "nlh-1983-bay-despoir-flood")?.pages, "physical PDF pp. 27 to 28");
});
