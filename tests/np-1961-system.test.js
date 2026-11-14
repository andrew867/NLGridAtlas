import assert from "node:assert/strict";
import test from "node:test";
import { sources, staticClaims, stationProfiles, timeline } from "../src/data.js";

const stationText = (code) => JSON.stringify(stationProfiles.find((candidate) => candidate.code === code));

test("1961 record does not invent a demand value", () => {
  assert.equal(timeline.some((entry) => entry.date === "1961" && entry.category === "load"), false);
});

test("1961 transmission records retain circuit, voltage and retirement detail", () => {
  const event = timeline.find((entry) => entry.date === "1961" && /38L and the Golden Eagle/.test(entry.title));
  assert.ok(event);
  assert.match(event.body, /38L.*Seal Cove and Duff's.*Holyrood.*Conception Bay South/);
  assert.match(event.body, /5\.9 km, 66 kV single-pole 53L.*Golden Eagle Refinery.*retired.*2007/);
});

test("1961 hydro record keeps plant dates separate from dam and storage work", () => {
  const event = timeline.find((entry) => entry.date === "1961" && /Rattling Brook gained storage/.test(entry.title));
  assert.ok(event);
  assert.match(event.body, /Additional storage.*Rattling Brook/);
  assert.match(event.body, /SV-6 and SV-7.*five structures.*SV-5/);
  assert.match(event.body, /generating station.*commissioned in 1957/);
  assert.match(stationText("RBK"), /1961 ADDITIONAL STORAGE.*commissioned in 1958.*additional storage added/);
});

test("Wabush breaker date is not used as the terminal operating date", () => {
  const event = timeline.find((entry) => entry.date === "1961 equipment / 1963 operation");
  assert.ok(event);
  assert.match(event.body, /46 kV oil-filled circuit breaker 46-33.*16 MVA/);
  assert.match(event.body, /operated since 1963/);
  assert.match(event.body, /eight 230:46 kV transformers.*two synchronous condensers/);
});

test("Happy Valley record retains the former diesel plant use", () => {
  const event = timeline.find((entry) => entry.date === "1961 to 1977");
  assert.ok(event);
  assert.match(event.body, /460 m2 Hunt Street building.*diesel generating units until 1977/);
  assert.match(event.body, /290 m2.*warehouse.*170 m2.*line depot/);
});

test("38L construction remains attached to Seal Cove", () => {
  assert.match(stationText("SCV"), /1961 38L TRANSMISSION LINE.*Seal Cove to Duff's/);
  assert.match(stationText("SCV"), /2\.8 km.*deteriorated poles, crossarms, insulators and hardware/);
});

test("1961 system claim retains exact source pages", () => {
  const claim = staticClaims.find((candidate) => candidate.id === "np-1961-system-record");
  assert.ok(claim);
  assert.equal(claim.status, "reported");
  assert.equal(claim.sources.length, 6);
  assert.equal(sources.find((source) => source.id === "np-1961-38l")?.pages, "physical PDF p. 389");
  assert.equal(sources.find((source) => source.id === "np-1961-53l")?.pages, "physical PDF p. 277");
  assert.equal(sources.find((source) => source.id === "nlh-1961-wabush-breaker")?.pages, "physical PDF pp. 10 to 11");
  assert.equal(sources.find((source) => source.id === "nlh-1961-happy-valley-diesel-building")?.pages, "physical PDF pp. 462 to 463");
});
