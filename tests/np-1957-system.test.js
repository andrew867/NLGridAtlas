import assert from "node:assert/strict";
import test from "node:test";
import { sources, staticClaims, stationProfiles, timeline } from "../src/data.js";

const stationText = (code) => JSON.stringify(stationProfiles.find((candidate) => candidate.code === code));

test("1957 record does not invent a demand value", () => {
  assert.equal(timeline.some((entry) => entry.date === "1957" && entry.category === "load"), false);
});

test("101L record retains route, length, structures and conductor", () => {
  const event = timeline.find((entry) => entry.date === "1957" && /101L/.test(entry.title));
  assert.ok(event);
  assert.match(event.body, /32\.5 km, 66 kV.*Trans-Canada Highway.*Route 351/);
  assert.match(event.body, /29\.5 km.*236 single-pole structures.*five two-pole structures.*2\/0 ACSR/);
  assert.match(stationText("GFS"), /1957 101L CONSTRUCTION/);
  assert.match(stationText("RBK"), /1957 101L CONSTRUCTION/);
});

test("New Chelsea service year and production conflict remain unresolved", () => {
  const event = timeline.find((entry) => entry.date === "1956 or January 1957" && /New Chelsea/.test(entry.title));
  assert.ok(event);
  assert.equal(event.status, "unresolved");
  assert.match(event.body, /3\.7 MW.*January 1957.*\$2\.5 million/);
  assert.match(event.body, /1956.*15\.4 GWh.*16\.3 GWh/);
  assert.match(stationText("NCH"), /1956 \/ JANUARY 1957 SERVICE-DATE RECORDS/);
});

test("1957 intake records remain distinct from plant commissioning", () => {
  const event = timeline.find((entry) => entry.date === "1957" && /intake structures/.test(entry.title));
  assert.ok(event);
  assert.match(event.body, /concrete foundation, trash rack, head gate and timber building/);
  assert.match(event.body, /Pitmans Pond intake predates.*1959/);
  assert.match(stationText("NCH"), /1957 INTAKE CONSTRUCTION/);
  assert.match(stationText("PIT"), /1957 INTAKE CONSTRUCTION/);
});

test("Snook's Arm and Venams Bight commissioning conflict is not flattened", () => {
  const event = timeline.find((entry) => entry.date === "1956 or 1957" && /Tilt Cove mine/.test(entry.title));
  assert.ok(event);
  assert.equal(event.status, "unresolved");
  assert.match(event.body, /0\.56 MW.*Snook's Arm.*0\.36 MW.*Venams Bight/);
  assert.match(event.body, /commissioned in 1957.*entered service in 1956/);
  assert.match(event.body, /seven Snook's Arm dams.*1957/);
});

test("St. George's breaker evidence retains both dated records", () => {
  const event = timeline.find((entry) => entry.date === "1957 or 1960" && /St\. George's breaker/.test(entry.title));
  assert.ok(event);
  assert.equal(event.status, "unresolved");
  assert.match(event.body, /installed in 1957.*purchased in 1960/);
  assert.match(stationText("STG"), /1957 \/ 1960 BREAKER RECORD CONFLICT/);
});

test("Topsail Road financial vintage is stated without a construction claim", () => {
  const event = timeline.find((entry) => entry.date === "1957" && /Topsail Road property/.test(entry.title));
  assert.ok(event);
  assert.match(event.body, /\$28,575.*Transformer Shop.*Transformer Storage/);
  assert.doesNotMatch(event.body, /facility was (built|constructed)/i);
});

test("Red Indian Falls remains a proposal", () => {
  const event = timeline.find((entry) => entry.date === "October 31, 1957" && /Red Indian Falls/.test(entry.title));
  assert.ok(event);
  assert.equal(event.status, "proposed");
  assert.match(event.body, /preliminary estimate.*20,000 hp/);
  assert.match(event.body, /does not establish.*constructed/);
});

test("1957 system claim retains exact source pages", () => {
  const claim = staticClaims.find((candidate) => candidate.id === "np-1957-system-record");
  assert.ok(claim);
  assert.equal(claim.status, "unresolved");
  assert.equal(claim.sources.length, 12);
  assert.equal(sources.find((source) => source.id === "np-1957-101l-condition")?.pages, "physical PDF p. 252");
  assert.equal(sources.find((source) => source.id === "nlh-1957-mini-hydro-plants")?.pages, "physical PDF pp. 20, 23 and 30 to 31");
  assert.equal(sources.find((source) => source.id === "nlh-1957-red-indian-prospect")?.status, "proposed");
});
