import assert from "node:assert/strict";
import test from "node:test";
import { sources, stationProfiles, timeline } from "../src/data.js";

const station = (code) => stationProfiles.find((candidate) => candidate.code === code);
const stationText = (code) => JSON.stringify(station(code));

test("2003 sources retain physical pages and evidence states", () => {
  const expected = new Map([
    ["np-2003-capital-substations", ["physical PDF pp. 25 to 37", "proposed"]],
    ["np-2003-substation-equipment-inspections", ["physical PDF pp. 1 to 2", "reported"]],
    ["np-2003-breaker-ages", ["physical PDF p. 1", "reported"]],
    ["np-2003-breaker-costs", ["physical PDF p. 1", "proposed"]],
    ["np-2003-hardwoods-t2-cables", ["physical PDF p. 1", "proposed"]],
    ["np-2003-transmission-rebuild", ["physical PDF pp. 39 to 40", "proposed"]],
    ["np-2003-telecommunications", ["physical PDF pp. 74 to 77", "proposed"]],
    ["np-2003-status-2002", ["physical PDF pp. 112 to 120", "reported"]],
    ["pu-36-2003-capital", ["physical PDF pp. 21, 26 and 28", "verified"]]
  ]);

  for (const [id, [pages, status]] of expected) {
    const source = sources.find((candidate) => candidate.id === id);
    assert.ok(source, id);
    assert.equal(source.pages, pages, id);
    assert.equal(source.status, status, id);
  }
});

test("2003 equipment condition is attached to the affected stations", () => {
  assert.match(stationText("HWD"), /one transformer cable failed in 2002/);
  assert.match(stationText("RBK"), /purchased in 1958/);
  assert.match(stationText("STG"), /purchased in 1960/);
  assert.match(stationText("PAS"), /two station reclosers purchased in 1981/);
  assert.match(stationText("BIG"), /two reclosers, one station-service transformer and one metering tank/);
  assert.match(stationText("GAN"), /three grounding transformers/);
});

test("Virginia Waters keeps the filed project separate from later completion evidence", () => {
  const text = stationText("VIR");
  assert.match(text, /2003 FILED THIRD TRANSFORMER/);
  assert.match(text, /\$1\.15 million/);
  assert.match(text, /third transformer added in 2003/);
});

test("Board decision records approval and rejected study without merging them", () => {
  const entry = timeline.find((candidate) => candidate.sourceId === "pu-36-2003-capital");
  assert.ok(entry);
  assert.equal(entry.status, "verified");
  assert.match(entry.body, /\$383,000 telecommunications category/);
  assert.match(entry.body, /rejected the separate \$500,000 radial transmission study/);
});
