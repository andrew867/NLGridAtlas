import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { sources, stationProfiles } from "../src/data.js";

const station = (code) => stationProfiles.find((candidate) => candidate.code === code);
const recordText = (code) => JSON.stringify(station(code));
const historyFrom = (code, sourceId) => station(code).historyRecords.filter((record) => record.sourceId === sourceId);

test("2016 capital sources retain their evidence states and page locators", () => {
  const expected = new Map([
    ["np-2016-kbr-system", ["physical PDF pp. 263 to 264, 480, 485, 487 and 492", "proposed"]],
    ["np-2016-30l", ["physical PDF pp. 316 and 322", "proposed"]],
    ["np-2016-fibre-network", ["physical PDF pp. 96 and 556 to 560", "proposed"]],
    ["np-2016-greenhill-overhaul", ["physical PDF p. 32", "proposed"]],
    ["np-2021-ca-np-001-2016-actuals", ["physical PDF pp. 6 to 8", "reported"]],
    ["np-2018-2016-fibre-closeout", ["physical PDF p. 167", "reported"]]
  ]);

  for (const [id, [pages, status]] of expected) {
    const source = sources.find((candidate) => candidate.id === id);
    assert.ok(source, id);
    assert.equal(source.pages, pages);
    assert.equal(source.status, status);
  }
});

test("King's Bridge preserves the filed voltage conversion and 30L records", async () => {
  const kbr = recordText("KBR");
  const rrd = recordText("RRD");

  assert.match(kbr, /KBR-T1 and KBR-T2 each supplied eight 4\.16 kV feeders through 10 MVA banks/);
  assert.match(kbr, /KBR-T3 supplied four 12\.5 kV feeders through a 25 MVA bank/);
  assert.match(kbr, /convert KBR-01 to 12\.5 kV; eliminate KBR-01 and KBR-07/);
  assert.match(kbr, /KBR-13 for three converted feeders and KBR-14 for the remaining 4\.16 kV group/);
  assert.match(kbr, /kbr-2016-reconfigured-feeders\.png/);
  assert.match(kbr, /30l-2016-route\.png/);

  for (const text of [kbr, rrd]) {
    assert.match(text, /2\.9 km, 66 kV, 87 single-pole structures/);
    assert.match(text, /1\.5 km in 2015 and the remaining 1\.4 km in 2016/);
    assert.match(text, /\$507,000/);
  }
  assert.match(rrd, /30l-2016-route\.png/);

  const lineMap = await readFile(new URL("../public/reference-maps/30l-2016-route.png", import.meta.url));
  const feederMap = await readFile(new URL("../public/reference-maps/kbr-2016-reconfigured-feeders.png", import.meta.url));
  assert.ok(lineMap.length > 1_000_000);
  assert.ok(feederMap.length > 500_000);
});

test("2016 St. John's west fibre route is attached to Hardwoods and Kenmount", async () => {
  for (const code of ["HWD", "KEN"]) {
    const records = historyFrom(code, "np-2016-fibre-network");
    assert.equal(records.length, 1, code);
    assert.match(JSON.stringify(records), /Hardwoods to Kenmount, then Kenmount to the Duffy Place operations centre/);
    assert.match(recordText(code), /st-johns-west-2016-fibre\.png/);
  }
  const map = await readFile(new URL("../public/reference-maps/st-johns-west-2016-fibre.png", import.meta.url));
  assert.ok(map.length > 500_000);
});

test("2016 Corner Brook fibre ring is attached only to its four filed stations", async () => {
  const expectedCodes = ["MAS", "BVS", "HUM", "WAL"];
  for (const code of expectedCodes) {
    const records = historyFrom(code, "np-2016-fibre-network");
    assert.equal(records.length, 1, code);
    assert.match(JSON.stringify(records), /Massey Drive to Maple Valley to Bayview/);
  }

  const containingCodes = stationProfiles
    .filter(({ historyRecords = [] }) => historyRecords.some(({ label }) => label === "2016 FILED CORNER BROOK FIBRE RING"))
    .map(({ code }) => code)
    .sort();
  assert.deepEqual(containingCodes, [...expectedCodes].sort());
  assert.match(recordText("MAS"), /corner-brook-2016-fibre\.png/);
  const map = await readFile(new URL("../public/reference-maps/corner-brook-2016-fibre.png", import.meta.url));
  assert.ok(map.length > 400_000);
});

test("Greenhill keeps condition evidence separate from reported expenditure", () => {
  const filed = historyFrom("GRH", "np-2016-greenhill-overhaul");
  const actual = historyFrom("GRH", "np-2021-ca-np-001-2016-actuals");

  assert.equal(filed.length, 1);
  assert.match(JSON.stringify(filed), /Rolls Royce OLYMPUS.*last overhauled in 1995/);
  assert.match(JSON.stringify(filed), /20 MW.*derated from 25 MW.*casing cracks/);
  assert.match(JSON.stringify(filed), /March 2014 borescope.*coating loss and corrosion.*carbon buildup and corrosion/);
  assert.match(JSON.stringify(actual), /\$1\.500 million budget; \$1\.091 million actual expenditure/);
  assert.doesNotMatch(JSON.stringify(actual), /commissioned|completed/);
});
