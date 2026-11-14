import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { sources, stationProfiles, timeline } from "../src/data.js";

const station = (code) => stationProfiles.find((candidate) => candidate.code === code);
const stationText = (code) => JSON.stringify(station(code));

test("2010 source records retain page locators and evidence states", () => {
  const expected = new Map([
    ["np-2010-station-modernization", ["physical PDF pp. 285 to 302", "proposed"]],
    ["np-2010-feeder-growth", ["physical PDF pp. 376 to 389", "proposed"]],
    ["np-2010-sjm-underground", ["physical PDF pp. 363 to 374", "proposed"]],
    ["np-2010-lookout-brook", ["physical PDF pp. 183 to 193", "proposed"]],
    ["np-2010-fibre-circuits", ["physical PDF p. 99", "proposed"]],
    ["np-2012-fibre-reconciliation", ["physical PDF pp. 93 and 169", "reported"]],
    ["np-2011-p3-refurbishment", ["physical PDF pp. 174, 287 and 291", "proposed"]]
  ]);

  for (const [id, [pages, status]] of expected) {
    const source = sources.find((candidate) => candidate.id === id);
    assert.ok(source, id);
    assert.equal(source.pages, pages);
    assert.equal(source.status, status);
  }
});

test("2010 Avalon feeder records remain filed projects", () => {
  assert.match(stationText("HWD"), /1\.8 MVA.*HWD-02.*KEN-03/);
  assert.match(stationText("HWD"), /HWD-07.*4\.2 MVA.*CHA-02.*477 AASC/);
  assert.match(stationText("BCV"), /BCV-03.*1\.8 km.*#4 copper.*356 A/);
  assert.match(stationText("OXP"), /OXP-01.*1\.0 km.*#4 copper.*356 A/);
  assert.match(stationText("KEN"), /25 kV tie between the Hardwoods and Kenmount distribution systems/);
  assert.match(stationText("SLA"), /SLA-11.*0\.75 km.*MOL-08.*477 AASC/);
});

test("2010 station records are assigned to the correct stations", () => {
  assert.match(stationText("BOY"), /metal-oxide lightning arresters.*station-service transformer.*grounding system/);
  assert.match(stationText("SPF"), /one 20 MVA, 138\/12 kV transformer.*three 12 kV feeders/);
  assert.match(stationText("SPF"), /replace leaking and deteriorated transformer radiators/);
  assert.doesNotMatch(stationText("COL"), /2010 FILED TRANSFORMER-RADIATOR/);
});

test("2010 St. John's Main records retain the filed cable and switching scope", () => {
  assert.match(stationText("SJM"), /12 distribution feeders.*nine passed under the Waterford River duct bank/);
  assert.match(stationText("SJM"), /three 1,100 m single-phase 500 MCM XLPE cables/);
  assert.match(stationText("SJM"), /five-compartment 12\.5 kV padmount switch/);
  assert.match(stationText("SJM"), /\$550,000/);
});

test("2010 Lookout Brook records separate filed scope from later completion evidence", () => {
  assert.match(stationText("LBK"), /high-impedance grounding.*neutral-grounding transformers/);
  assert.match(stationText("LBK"), /ControlLogix PLC.*gateway data concentrator/);
  assert.match(stationText("LBK"), /2010 COMPLETED PLANT-SYSTEM REFURBISHMENT/);

  const completed = timeline.find(({ title }) => /Lookout Brook plant systems refurbished/.test(title));
  assert.equal(completed?.status, "verified");
  assert.equal(completed?.pages, "physical PDF pp. 439 to 440");
});

test("2010 fibre and portable-substation outcomes retain qualified states", () => {
  const fibre = timeline.find(({ title }) => /Two leased fibre circuits replaced/.test(title));
  const portable = timeline.find(({ title }) => /Portable substation P3 refurbishment deferred/.test(title));
  assert.equal(fibre?.status, "reported");
  assert.match(fibre?.body ?? "", /Two leases were abandoned.*one cable was not built/);
  assert.equal(portable?.status, "proposed");
  assert.match(portable?.body ?? "", /\$440,000/);
});

test("2010 filed drawings are preserved as local reference sheets", async () => {
  const assets = [
    "sjm-03-2010-route.png",
    "sjm-03-2010-proposed.png",
    "hwd-02-2010-conversion.png",
    "bcv-03-2010-upgrade.png",
    "hwd-07-2010-upgrade.png",
    "oxp-01-2010-upgrade.png",
    "sla-11-2010-upgrade.png"
  ];

  for (const asset of assets) {
    const contents = await readFile(new URL(`../public/reference-maps/${asset}`, import.meta.url));
    assert.ok(contents.length > 300_000, asset);
  }
});
