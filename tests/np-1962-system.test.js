import assert from "node:assert/strict";
import test from "node:test";
import { sources, staticClaims, stationProfiles, timeline } from "../src/data.js";

const stationText = (code) => JSON.stringify(stationProfiles.find((candidate) => candidate.code === code));

test("1962 record does not invent a demand value", () => {
  assert.equal(timeline.some((entry) => entry.date === "1962" && entry.category === "load"), false);
});

test("1962 transmission records retain voltage, endpoints and physical detail", () => {
  const event = timeline.find((entry) => entry.date === "1962" && /13L and TL2303/.test(entry.title));
  assert.ok(event);
  assert.match(event.body, /13L.*St\. John's Main and Stamp's Lane.*66 kV/);
  assert.match(event.body, /0\.42 km.*2\.64 km.*1\.84 km.*56 original/);
  assert.match(event.body, /215 km, 230 kV TL2303.*Churchill Falls and Wabush.*steel structures.*Grosbeak/);
});

test("TL224 remains an unresolved 1962 or 1968 date conflict", () => {
  const event = timeline.find((entry) => entry.date === "1962 or 1968" && /TL224/.test(entry.title));
  assert.ok(event);
  assert.equal(event.status, "unresolved");
  assert.match(event.body, /57\.51 km, 138 kV.*Howley and Indian River/);
  assert.match(event.body, /2018.*2027.*1962.*2025.*2027.*1968/);
  assert.match(stationText("HOW"), /1962 OR 1968 TL224 IN-SERVICE CONFLICT.*Owl conductor/);
  assert.equal(sources.find((source) => source.id === "nlh-1962-transmission-register")?.status, "unresolved");
  assert.equal(sources.find((source) => source.id === "nlh-1968-tl224")?.status, "unresolved");
});

test("1968 transmission summary no longer flattens TL224 into 1968", () => {
  const event = timeline.find((entry) => entry.date === "1968" && /Five 230 kV and 138 kV transmission records/.test(entry.title));
  assert.ok(event);
  for (const circuit of ["TL206", "TL207", "TL214", "TL218", "TL237"]) {
    assert.match(event.body, new RegExp(circuit));
  }
  assert.match(event.body, /TL224 is excluded.*conflict between 1962 and 1968/);
});

test("1962 station, generation and distribution records remain attached", () => {
  assert.match(stationText("KBR"), /1962 66 KV HIGH-VOLTAGE STRUCTURE.*45 MVA.*steel structure and bus/);
  assert.match(stationText("LOK"), /1962 G1 ADDITION.*second 1\.5 MW unit.*2,000 hp Gilkes Francis.*General Electric; original 1962/);
  assert.match(stationText("NWB"), /1962 NWB-01 ORIGINAL LINE.*Goobies to North Harbour.*rebuilt in 2000/);
});

test("Port Union retains the 1962 or 1972 conflict and equipment details", () => {
  const event = timeline.find((entry) => entry.date === "1962 or 1972" && /Port Union diesel/.test(entry.title));
  assert.ok(event);
  assert.equal(event.status, "unresolved");
  assert.match(event.body, /500 kW Caterpillar.*625 kVA Canadian General Electric/);
  assert.match(stationText("PUN"), /1962 COMMISSIONING \/ 1972 DEPRECIATION DATE CONFLICT/);
  assert.match(stationText("PUN"), /9,100 litre.*sharing.*hydro plant.*no longer operational/);
  assert.equal(sources.find((source) => source.id === "np-1972-port-union-diesel")?.status, "unresolved");
});

test("Happy Valley and February ice-storm records retain stated limits", () => {
  const distribution = timeline.find((entry) => entry.date === "1962" && /NWB-01 and an older Happy Valley/.test(entry.title));
  assert.match(distribution.body, /25 kV L8.*older L1 constructed in 1962/);
  const storm = timeline.find((entry) => entry.date === "February 7 to 19, 1962");
  assert.match(storm.body, /February 7 to 12.*500 poles.*two inches/);
  assert.match(storm.body, /February 16 to 19.*60 mph.*three-inch glaze.*one mile/);
});

test("1962 system claim retains its unresolved sources and exact pages", () => {
  const claim = staticClaims.find((candidate) => candidate.id === "np-1962-system-record");
  assert.ok(claim);
  assert.equal(claim.status, "unresolved");
  assert.equal(claim.sources.length, 11);
  assert.equal(sources.find((source) => source.id === "np-1962-kings-bridge-structure")?.pages, "physical PDF p. 191");
  assert.equal(sources.find((source) => source.id === "np-1962-port-union-diesel")?.pages, "physical PDF pp. 233, 309 and 325");
  assert.equal(sources.find((source) => source.id === "nlh-1962-ice-storms")?.pages, "physical PDF p. 54");
});
