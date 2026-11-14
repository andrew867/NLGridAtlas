import assert from "node:assert/strict";
import test from "node:test";
import { islandTerminalRecords, sources, staticClaims, stationProfiles, timeline } from "../src/data.js";

const recordText = (code) => JSON.stringify([
  ...islandTerminalRecords.filter((station) => station.code === code),
  ...stationProfiles.filter((station) => station.code === code)
]);

test("1978 demand values remain distinct", () => {
  const actual = timeline.find((entry) => entry.date === "1978" && /939 MW/.test(entry.title));
  assert.ok(actual);
  assert.match(actual.body, /639\.9 MW/);
  assert.match(actual.body, /718 MW/);
});

test("1978 transmission records retain route and construction details", () => {
  const line142 = timeline.find((entry) => entry.date === "1978" && /142L/.test(entry.title));
  const tl243 = timeline.find((entry) => entry.date === "1978" && /TL243/.test(entry.title));
  assert.match(line142.body, /Clarke's Head/);
  assert.match(line142.body, /1\.7 km/);
  assert.match(tl243.body, /15 km, 138 kV/);
  assert.match(tl243.body, /74 H-frame/);
  assert.match(recordText("COB"), /1978 142L TO BOYD'S COVE/);
  assert.match(recordText("HLA"), /1978 TL243 CONNECTION/);
  assert.match(recordText("HOW"), /1978 TL243 CONNECTION/);
});

test("1978 Western Avalon and station structure records remain specific", () => {
  assert.match(recordText("WAV"), /MAY 15, 1978 T3 AND 230 KV BAY/);
  assert.match(recordText("WAV"), /B1L17/);
  assert.match(recordText("BRB"), /1978 TRANSMISSION EXPANSION/);
  assert.match(recordText("BLK"), /1977 TO 1978 STRUCTURE DATE CONFLICT/);
  assert.match(recordText("JON"), /1978 ORIGINAL STRUCTURES/);
  assert.match(recordText("BFS"), /1978 STRUCTURE REGISTER/);
  assert.match(recordText("SPR"), /1978 25 KV STRUCTURE/);
});

test("1978 rural protection and Holyrood equipment are retained", () => {
  const reclosers = timeline.find((entry) => entry.date === "1978" && /rural feeder reclosers/.test(entry.title));
  const holyrood = timeline.find((entry) => entry.date === "1978" && /Holyrood Unit 3/.test(entry.title));
  assert.match(reclosers.body, /SB7-R2/);
  assert.match(reclosers.body, /JA1-R1 and JA2-R1/);
  assert.match(reclosers.body, /HA1-R1/);
  assert.match(holyrood.body, /Hitachi/);
  assert.match(holyrood.body, /relay panels were installed in 1978/);
  assert.match(holyrood.body, /moved from the T1 position to T3/);
});

test("1978 system claim retains physical page references", () => {
  const claim = staticClaims.find((candidate) => candidate.id === "np-1978-system-record");
  assert.ok(claim);
  assert.equal(claim.status, "reported");
  assert.equal(claim.sources.length, 9);
  assert.equal(sources.find((source) => source.id === "np-1978-142l")?.pages, "physical PDF p. 100");
  assert.equal(sources.find((source) => source.id === "nlh-1978-tl243")?.pages, "physical PDF p. 53");
  assert.equal(sources.find((source) => source.id === "nlh-1978-western-avalon-assets")?.pages, "physical PDF pp. 7 to 8");
  assert.equal(sources.find((source) => source.id === "np-1978-substation-structures")?.pages, "physical PDF pp. 194, 198 to 199");
});
