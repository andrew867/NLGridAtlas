import assert from "node:assert/strict";
import test from "node:test";
import { sources, staticClaims, stationProfiles, timeline } from "../src/data.js";

const stationText = (code) => JSON.stringify(stationProfiles.find((candidate) => candidate.code === code));

test("1956 record does not invent a demand value", () => {
  assert.equal(timeline.some((entry) => entry.date === "1956" && entry.category === "load"), false);
});

test("1956 transmission record retains all three corridor descriptions", () => {
  const event = timeline.find((entry) => entry.date === "1956" && /Three 66 kV corridors/.test(entry.title));
  assert.ok(event);
  assert.match(event.body, /43L.*25\.1 km.*Heart's Content.*New Chelsea.*H-frame/);
  assert.match(event.body, /31 km 111L.*Lockston.*Catalina.*Port Union.*single wood poles/);
  assert.match(event.body, /27\.9 km 407L.*Stephenville.*St\. George's.*Stephenville Crossing/);
});

test("Lockston record preserves first-unit identity and original structures", () => {
  const event = timeline.find((entry) => entry.date === "1956" && /Lockston entered service/.test(entry.title));
  assert.ok(event);
  assert.match(event.body, /1\.5 MW.*2,000 hp Gilkes Francis.*Canadian General Electric.*80 m/);
  assert.match(event.body, /labelled G2.*1962.*labelled G1/);
  assert.match(stationText("LOK"), /1956 ORIGINAL DEVELOPMENT/);
  assert.match(stationText("LOK"), /46 kV and 6\.9 kV wood-pole structures/);
});

test("Heart's Content construction is not assigned later equipment ratings", () => {
  const event = timeline.find((entry) => entry.date === "1956" && /station developments/.test(entry.title));
  assert.ok(event);
  assert.match(event.body, /Heart's Content was built as a generation station.*later gained distribution/);
  assert.doesNotMatch(event.body, /2\.3 MVA|3 MVA/);
  assert.match(stationText("HCT"), /1956 as a generation station/);
});

test("New Chelsea 1956 works remain separate from the unresolved service date", () => {
  const event = timeline.find((entry) => entry.date === "1956" && /New Chelsea and Topsail/.test(entry.title));
  assert.ok(event);
  assert.match(event.body, /steel penstock.*control panels, switchgear, DC panel, protection systems and grounding transformer/);
  assert.match(stationText("NCH"), /1956 PENSTOCK AND ORIGINAL ELECTRICAL SYSTEMS/);
  assert.match(stationText("NCH"), /1956 \/ JANUARY 1957 SERVICE-DATE RECORDS/);
});

test("Thomas Pond spillway retains the documented geometry", () => {
  const event = timeline.find((entry) => entry.date === "1956" && /New Chelsea and Topsail/.test(entry.title));
  assert.ok(event);
  assert.match(event.body, /46 m reinforced-concrete spillway.*wooden stoplogs.*reinforced-concrete abutments/);
  assert.match(stationText("TOP"), /1956 THOMAS POND SPILLWAY/);
});

test("Snook's Arm and Venams Bight commissioning dates remain unresolved", () => {
  const event = timeline.find((entry) => entry.date === "1956 or 1957" && /construction and commissioning records diverge/.test(entry.title));
  assert.ok(event);
  assert.equal(event.status, "unresolved");
  assert.match(event.body, /constructed in 1956.*commissioned in 1957.*in service in 1956/);
  assert.match(event.body, /30 inches.*3,050 feet/);
});

test("1956 system claim retains exact source pages", () => {
  const claim = staticClaims.find((candidate) => candidate.id === "np-1956-system-record");
  assert.ok(claim);
  assert.equal(claim.status, "unresolved");
  assert.equal(claim.sources.length, 12);
  assert.equal(sources.find((source) => source.id === "np-1956-new-chelsea-penstock")?.pages, "physical PDF p. 1");
  assert.equal(sources.find((source) => source.id === "np-1956-thomas-pond-spillway")?.pages, "physical PDF p. 195");
  assert.equal(sources.find((source) => source.id === "nlh-1956-snooks-penstock")?.pages, "physical PDF p. 198");
});
