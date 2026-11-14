import assert from "node:assert/strict";
import test from "node:test";
import { sources, stationProfiles } from "../src/data.js";

const station = (code) => stationProfiles.find((candidate) => candidate.code === code);
const recordText = (code) => JSON.stringify(station(code));

test("2017 capital sources retain their evidence states and page locators", () => {
  const expected = new Map([
    ["np-2017-transmission-rebuild", ["physical PDF pp. 46 to 47 and 275 to 286", "proposed"]],
    ["np-2017-rbk01", ["physical PDF pp. 72 and 360 to 366", "proposed"]],
    ["np-2017-automation", ["physical PDF pp. 76 to 77 and 239", "proposed"]],
    ["np-2017-operational-communications", ["physical PDF pp. 97 to 98", "proposed"]],
    ["np-2017-sjm-underground", ["physical PDF p. 78", "proposed"]],
    ["np-2021-ca-np-001-capital-actuals", ["physical PDF pp. 9 to 11", "reported"]]
  ]);

  for (const [id, [pages, status]] of expected) {
    const source = sources.find((candidate) => candidate.id === id);
    assert.ok(source, id);
    assert.equal(source.pages, pages);
    assert.equal(source.status, status);
  }
});

test("2017 line and feeder records retain exact filed values and maps", () => {
  assert.match(recordText("RRD"), /32L.*3\.2 km total.*1\.4 km and 35 single-pole structures.*\$384,000/);
  assert.match(recordText("CAR"), /41L.*13\.6 km.*55 H-frame structures and 3 single-pole structures.*4\/0 ACSR.*\$2\.510 million/);
  assert.match(recordText("HCT"), /41L.*13\.6 km of 1958-vintage line.*55 H-frame structures and 3 single-pole structures/);
  assert.match(recordText("ILC"), /57L.*17\.8 km.*8\.5 km in 2016 and 9\.3 km in 2017.*186 H-frame structures.*4\/0 ACSR/);
  assert.match(recordText("RBK"), /RBK-01.*174 A per phase.*168 A planning rating.*4\/0 AASC.*356 A for planning/);

  assert.match(recordText("RRD"), /32l-2017-route\.jpg/);
  assert.match(recordText("CAR"), /41l-2017-route\.jpg/);
  assert.match(recordText("ILC"), /57l-2017-route\.jpg/);
  assert.match(recordText("RBK"), /rbk-01-2017-upgrade\.jpg/);
});

test("2017 downline reclosers are attached only to their filed stations", () => {
  const expected = new Map([
    ["MOB", ["MOB-01"]],
    ["MIL", ["MIL-02"]],
    ["LEW", ["LEW-02-R2", "LEW-02-R3", "LEW-03-R2"]],
    ["HWD", ["HWD-01"]],
    ["VIR", ["VIR-02"]],
    ["RVH", ["RVH-01"]]
  ]);

  for (const [code, devices] of expected) {
    const records = station(code).historyRecords.filter(({ sourceId }) => sourceId === "np-2017-automation");
    const text = JSON.stringify(records);
    assert.equal(records.length, 1, code);
    for (const device of devices) assert.match(text, new RegExp(device));
  }

  const devices = [...expected.values()].flat();
  const stationTexts = new Map(stationProfiles.map(({ code, historyRecords = [] }) => [code, JSON.stringify(historyRecords.filter(({ sourceId }) => sourceId === "np-2017-automation"))]));
  for (const device of devices) {
    const containing = [...stationTexts].filter(([, text]) => text.includes(device)).map(([code]) => code);
    assert.deepEqual(containing, [[...expected].find(([, values]) => values.includes(device))[0]], device);
  }
});

test("St. John's Main keeps filed ductbank scope separate from reported actual expenditure", () => {
  const sjm = station("SJM");
  const filed = sjm.historyRecords.find(({ sourceId }) => sourceId === "np-2017-sjm-underground");
  const actual = sjm.historyRecords.find(({ sourceId }) => sourceId === "np-2021-ca-np-001-capital-actuals");

  assert.match(JSON.stringify(filed), /nine distribution feeders.*approximately 40 years old.*\$2\.440 million/);
  assert.match(JSON.stringify(actual), /\$4\.185 million.*\$1\.546 million carried from 2017 into 2018/);
});
