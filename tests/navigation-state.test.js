import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { parseRoute, serializeRoute } from "../src/navigation/state.js";
import { legacyDestination } from "../src/navigation/legacy-aliases.js";

test("station route preserves collection, record, view, and fragment", () => {
  const { state, errors } = parseRoute("https://example.test/NLGridAtlas/stations.html?collection=np&station=HWD&view=equipment#station-record");
  assert.deepEqual(errors, []);
  assert.equal(state.route, "stations");
  assert.equal(state.collection, "np");
  assert.equal(state.station, "HWD");
  assert.equal(state.view, "equipment");
  assert.equal(state.fragment, "station-record");
});

test("explicit empty voltage selection is distinct from omitted defaults", () => {
  assert.deepEqual(parseRoute("https://example.test/NLGridAtlas/network.html?voltages=none").state.voltages, []);
  assert.equal(parseRoute("https://example.test/NLGridAtlas/network.html").state.voltages, null);
});

test("grouped component selections retain independent diagram ownership", () => {
  const { state, errors } = parseRoute("https://example.test/NLGridAtlas/stations.html?component=hwd%3Ahwd-t1&component=opd%3Aopd-t2");
  assert.deepEqual(errors, []);
  assert.deepEqual(state.sets.component, ["hwd:hwd-t1", "opd:opd-t2"]);
});

test("source catalogue filters and sort survive a route round trip", () => {
  const parsed = parseRoute("https://example.test/NLGridAtlas/sources.html?organization=Newfoundland+Power&period=2020-2029&topic=transformer+ratings&sort=year&pageSize=50#evidence");
  assert.equal(parsed.state.organization, "Newfoundland Power");
  assert.equal(parsed.state.period, "2020-2029");
  assert.equal(parsed.state.topic, "transformer ratings");
  assert.equal(parsed.state.sort, "year");
  assert.equal(parsed.state.pageSize, "50");
  assert.equal(parseRoute(serializeRoute(parsed.state, parsed.url)).state.topic, "transformer ratings");
});

test("conflicting record identities are rejected", () => {
  const { state, errors } = parseRoute("https://example.test/NLGridAtlas/stations.html?station=HWD&station=OXP");
  assert.equal(state.station, null);
  assert.equal(errors[0].code, "conflicting-identity");
});

test("off-site return destinations are removed", () => {
  const { state, messages } = parseRoute("https://example.test/NLGridAtlas/sources.html?source=x&returnTo=https%3A%2F%2Fevil.example%2F");
  assert.equal(state.returnTo, null);
  assert.ok(messages.some((message) => message.includes("outside this atlas")));
});

test("serialization removes page-inapplicable parameters and orders supported state", () => {
  const parsed = parseRoute("https://example.test/NLGridAtlas/network.html?unknown=x&register=feeders-2018&q=HWD#register");
  assert.equal(serializeRoute(parsed.state, parsed.url).href, "https://example.test/NLGridAtlas/network.html?register=feeders-2018&q=HWD#register");
});

test("major legacy sections resolve to real page files", () => {
  assert.equal(legacyDestination("network"), "./stations.html?collection=hydro#network");
  assert.equal(legacyDestination("substations"), "./stations.html?collection=np#substations");
  assert.equal(legacyDestination("telephone"), "./telephone.html#telephone");
  assert.equal(legacyDestination("main"), "./index.html#main");
});

test("the generated legacy inventory has no unresolved IDs", async () => {
  const audit = JSON.parse(await readFile(new URL("../research/derived/legacy-alias-audit.json", import.meta.url), "utf8"));
  assert.equal(audit.unresolvedIdCount, 0);
  assert.equal(audit.ambiguousIdCount, 0);
  assert.equal(audit.mappedIdCount + audit.runtimeResolvedCount, audit.baselineTargetCount);
});
