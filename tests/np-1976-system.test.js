import assert from "node:assert/strict";
import test from "node:test";
import { components, sources, staticClaims, stationProfiles, timeline } from "../src/data.js";

const recordText = (code) => JSON.stringify(stationProfiles.filter((station) => station.code === code));

test("1976 demand record does not invent an Island transmission peak", () => {
  const demand = timeline.find((entry) => entry.date === "1976" && /585\.4 MW/.test(entry.title));
  assert.ok(demand);
  assert.match(demand.body, /681 MW/);
  assert.match(demand.body, /does not print an Island transmission peak/);
});

test("1976 transmission records retain circuit, endpoints and dimensions", () => {
  assert.match(JSON.stringify(timeline), /TL231 connected Bay d'Espoir and Stony Brook/);
  assert.match(JSON.stringify(timeline), /105\.3 km, 230 kV steel-tower line/);
  assert.match(JSON.stringify(timeline), /TL229 connected Wiltondale and Glenburnie/);
  assert.match(JSON.stringify(timeline), /13 km route/);
  assert.match(JSON.stringify(timeline), /123L connected Clarenville and Catalina/);
  assert.match(JSON.stringify(timeline), /94 km, 138 kV line/);
});

test("1976 Hardwoods commissioning conflict is visible in the diagram detail", () => {
  const event = timeline.find((entry) => entry.date === "1976 to 1977" && /Hardwoods/.test(entry.title));
  assert.equal(event?.status, "unresolved");
  assert.match(event.body, /1976/);
  assert.match(event.body, /1977/);
  assert.equal(components["hwd-g1"].status, "unresolved");
  assert.match(JSON.stringify(components["hwd-g1"]), /two Rolls-Royce Olympus C gas generators/);
  assert.match(JSON.stringify(components["hwd-g1"]), /synchronous-condenser operation is dominant/);
});

test("1976 Grand Falls history is attached to its station record", () => {
  const record = recordText("GFS");
  assert.match(record, /1976 NEW GRAND FALLS STATION/);
  assert.match(record, /130L to Stony Brook/);
  assert.match(record, /five feeders serving approximately 6,000 customers/);
});

test("1976 system claim retains source pages and unresolved state", () => {
  const claim = staticClaims.find((candidate) => candidate.id === "np-1976-system-record");
  assert.ok(claim);
  assert.equal(claim.status, "unresolved");
  assert.equal(claim.sources.length, 11);
  assert.equal(sources.find((source) => source.id === "nlh-1976-historical-demand")?.pages, "physical PDF p. 2");
  assert.equal(sources.find((source) => source.id === "nlh-1976-hardwoods-gt")?.pages, "physical PDF p. 63");
  assert.equal(sources.find((source) => source.id === "nlh-1976-tl231")?.pages, "physical PDF p. 16");
  assert.equal(sources.find((source) => source.id === "nlh-1976-tl229")?.pages, "physical PDF p. 331");
  assert.equal(sources.find((source) => source.id === "np-2012-grand-falls-history")?.pages, "physical PDF p. 327");
});
