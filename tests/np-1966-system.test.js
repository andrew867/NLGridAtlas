import assert from "node:assert/strict";
import test from "node:test";
import { components, islandTerminalRecords, sources, staticClaims, stationProfiles, timeline } from "../src/data.js";

const station = (code) => stationProfiles.find((candidate) => candidate.code === code);
const stationText = (code) => JSON.stringify(station(code));
const terminalText = (code) => JSON.stringify(islandTerminalRecords.find((candidate) => candidate.code === code));

test("1966 record does not invent a demand value", () => {
  assert.equal(timeline.some((entry) => entry.date === "1966" && entry.category === "load"), false);
});

test("six Hydro transmission records remain attached to 1966", () => {
  const event = timeline.find((entry) => entry.date === "1966" && /Six Hydro transmission records/.test(entry.title));
  assert.ok(event);
  for (const circuit of ["TL201", "TL202", "TL204", "TL212", "TL223", "TL235"]) {
    assert.match(event.body, new RegExp(circuit));
  }
  assert.equal(sources.find((source) => source.id === "nlh-1966-transmission-lines")?.pages, "physical PDF p. 4");
});

test("1966 terminal records preserve the Sunnyside and Stony Brook conflicts", () => {
  const event = timeline.find((entry) => entry.date === "1965 to 1967" && /Four terminal histories/.test(entry.title));
  assert.equal(event?.status, "unresolved");
  assert.match(event.body, /Bay d'Espoir.*Stony Brook.*Sunnyside.*Western Avalon/);
  assert.match(terminalText("BDE"), /1965 TO 1966 ORIGINAL 230 KV BUS/);
  assert.match(stationText("WAV"), /1966 ORIGINAL TERMINAL COMMISSIONING/);
  assert.equal(islandTerminalRecords.find((candidate) => candidate.code === "SUN")?.status, "unresolved");
  assert.equal(islandTerminalRecords.find((candidate) => candidate.code === "STB")?.status, "unresolved");
});

test("1966 Newfoundland Power station records remain attached", () => {
  for (const code of ["GAM", "MUN", "HGR", "VIC", "WAL", "LBK"]) {
    assert.match(stationText(code), /1966/);
  }
  assert.match(stationText("MUN"), /Ferranti-Packard.*manufactured 1966.*66\/12\.5 kV.*11\.125\/14\.83 MVA/);
});

test("Clarenville retains its 1966 to 1967 construction conflict", () => {
  assert.equal(station("CLV")?.status, "unresolved");
  assert.match(stationText("CLV"), /1966 TO 1967 STATION DATE CONFLICT/);
  assert.match(stationText("CLV"), /station built in 1966.*station built in 1967/);
});

test("Bay d'Espoir and the Holyrood gas-turbine branch retain 1966 equipment history", () => {
  assert.match(terminalText("BDE"), /1966 T1 AND T2 MANUFACTURE/);
  assert.match(JSON.stringify(components["hrd-gt"]), /1966 purchase.*Rolls-Royce Avon.*First installation.*Hardwoods/);
  assert.ok(components["hrd-gt"].sources.some((reference) => reference.sourceId === "nlh-1966-black-start-gas-turbine"));
});

test("1966 rural distribution and 49L records retain exact page locators", () => {
  assert.equal(sources.find((source) => source.id === "nlh-1966-farewell-head")?.pages, "physical PDF p. 419");
  assert.equal(sources.find((source) => source.id === "np-1966-49l")?.pages, "physical PDF p. 393");
  assert.match(stationText("HWD"), /1966 SUBSTATION STRUCTURES/);
  const event = timeline.find((entry) => entry.date === "1966" && /2\.7 km section of 49L/.test(entry.title));
  assert.match(event.body, /two H-frame structures.*24 single-pole structures.*336\.4 ACSR/);
});

test("1966 system claim retains unresolved status and complete source set", () => {
  const claim = staticClaims.find((candidate) => candidate.id === "np-1966-system-record");
  assert.ok(claim);
  assert.equal(claim.status, "unresolved");
  assert.equal(claim.sources.length, 15);
  assert.ok(claim.sources.some((reference) => reference.sourceId === "np-1966-clarenville"));
  assert.ok(claim.sources.some((reference) => reference.sourceId === "nlh-1966-frequency-converter-air"));
});
