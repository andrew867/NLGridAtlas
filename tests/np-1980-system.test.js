import assert from "node:assert/strict";
import test from "node:test";
import { islandTerminalRecords, sources, staticClaims, stationProfiles, timeline } from "../src/data.js";

const recordText = (code) => JSON.stringify(
  islandTerminalRecords.find((station) => station.code === code)
  ?? stationProfiles.find((station) => station.code === code)
);

test("1980 actual demand values remain distinct", () => {
  const actual = timeline.find((entry) => entry.date === "1980" && /1,030 MW/.test(entry.title));
  assert.ok(actual);
  assert.match(actual.body, /662\.7 MW/);
  assert.match(actual.body, /836 MW/);
  assert.match(actual.body, /does not print a separate Hydro Rural peak/);
});

test("1980 terminal and distribution-station records remain connected", () => {
  assert.match(recordText("DLK"), /1980 as a 138\/66 kV terminal station/);
  assert.match(recordText("DUN"), /1980 CONSTRUCTION/);
  assert.match(recordText("DUN"), /8\.3 MVA/);
  assert.match(recordText("GAM"), /1980 138 KV STEEL STRUCTURE/);
  assert.match(recordText("GPD"), /built in 1980/);
});

test("1980 generation records retain equipment details", () => {
  assert.match(recordText("HLA"), /75 MW vertical Francis turbine/);
  assert.match(recordText("HLA"), /1,400 m buried welded steel/);
  assert.match(recordText("RWC"), /1980 MINI-HYDRO PILOT/);
  assert.match(recordText("RWC"), /horizontal crossflow unit/);

  const holyrood = timeline.find((entry) => entry.date === "1980" && /Holyrood Unit 3/.test(entry.title));
  assert.ok(holyrood);
  assert.match(holyrood.body, /installed in 1979/);
  assert.match(holyrood.body, /150 MW/);
});

test("1980 ownership record keeps the filed consideration", () => {
  const transfer = timeline.find((entry) => entry.date === "1980-04");
  assert.ok(transfer);
  assert.match(transfer.title, /Power Distribution District assets/);
  assert.match(transfer.body, /one dollar/);
  assert.match(transfer.body, /Current assets and liabilities transferred at cost/);
});

test("1980 system claim retains physical page references", () => {
  const claim = staticClaims.find((candidate) => candidate.id === "np-1980-system-record");
  assert.ok(claim);
  assert.equal(claim.status, "reported");
  assert.equal(claim.sources.length, 10);
  assert.equal(sources.find((source) => source.id === "nlh-1980-board-record")?.pages, "physical PDF p. 20");
  assert.equal(sources.find((source) => source.id === "nlh-1980-deer-lake")?.pages, "physical PDF p. 4");
  assert.equal(sources.find((source) => source.id === "nlh-1980-hinds-lake")?.pages, "physical PDF p. 23");
  assert.equal(sources.find((source) => source.id === "nlh-1980-roddickton-assessment")?.pages, "physical PDF p. 9");
});
