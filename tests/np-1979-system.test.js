import assert from "node:assert/strict";
import test from "node:test";
import { islandTerminalRecords, sources, staticClaims, stationProfiles, timeline } from "../src/data.js";

const recordText = (code) => JSON.stringify(
  islandTerminalRecords.find((station) => station.code === code)
  ?? stationProfiles.find((station) => station.code === code)
);

test("1979 demand values remain distinct", () => {
  const actual = timeline.find((entry) => entry.date === "1979" && /997 MW/.test(entry.title));
  assert.ok(actual);
  assert.match(actual.body, /664\.1 MW/);
  assert.match(actual.body, /821 MW/);
  assert.match(actual.body, /does not print a separate Hydro Rural peak/);
});

test("1979 transmission and distribution records retain their operating context", () => {
  const line129 = timeline.find((entry) => entry.date === "1979" && /129L/.test(entry.title));
  assert.ok(line129);
  assert.match(line129.body, /Gander Bay to Carmanville/);
  assert.match(line129.body, /GBY-03/);
  assert.match(recordText("GBY"), /1979 129L TO CARMANVILLE/);

  const tl232 = timeline.find((entry) => entry.date === "1979 to 1981" && /TL232/.test(entry.title));
  assert.ok(tl232);
  assert.equal(tl232.status, "unresolved");
  assert.match(tl232.body, /1979 and 1980/);
  assert.match(tl232.body, /constructed in 1981/);
  assert.match(recordText("STB"), /1979 TO 1981 TL232 DATE CONFLICT/);
  assert.match(recordText("BUC"), /1979 TO 1981 TL232 DATE CONFLICT/);
});

test("1979 telecommunications and station records retain equipment details", () => {
  const microwave = timeline.find((entry) => entry.date === "1979" && /microwave/.test(entry.title));
  assert.ok(microwave);
  assert.match(microwave.body, /Ten microwave hops/);
  assert.match(microwave.body, /power-line carrier/);
  assert.match(recordText("GRH"), /1979 LOW-VOLTAGE BUS/);
  assert.match(recordText("GRH"), /12\.47 kV steel structure/);
});

test("Holyrood 1979 equipment is separate from the unresolved unit date", () => {
  const holyrood = timeline.find((entry) => entry.date === "1979" && /Holyrood Unit 3 electrical/.test(entry.title));
  assert.ok(holyrood);
  assert.equal(holyrood.status, "unresolved");
  assert.match(holyrood.body, /isolated-phase generator bus/);
  assert.match(holyrood.body, /commissioned in spring 1979/);
  assert.match(holyrood.body, /turbine-generator commissioning to 1980/);
});

test("1979 system claim retains physical page references", () => {
  const claim = staticClaims.find((candidate) => candidate.id === "np-1979-system-record");
  assert.ok(claim);
  assert.equal(claim.status, "unresolved");
  assert.equal(claim.sources.length, 10);
  assert.equal(sources.find((source) => source.id === "np-1979-129l")?.pages, "physical PDF p. 329");
  assert.equal(sources.find((source) => source.id === "nlh-1979-west-coast-microwave")?.pages, "physical PDF pp. 10 and 151");
  assert.equal(sources.find((source) => source.id === "nlh-1979-holyrood-assets")?.pages, "physical PDF pp. 379, 405 to 406 and 547");
  assert.equal(sources.find((source) => source.id === "nlh-1979-tl232-construction")?.status, "unresolved");
});
