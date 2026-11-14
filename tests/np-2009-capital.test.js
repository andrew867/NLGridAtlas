import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { sources, stationProfiles } from "../src/data.js";

const station = (code) => stationProfiles.find((candidate) => candidate.code === code);
const stationText = (code) => JSON.stringify(station(code));

test("2009 source records retain page locators and evidence states", () => {
  const expected = new Map([
    ["np-2009-station-modernization", ["physical PDF pp. 265 to 284", "proposed"]],
    ["np-2009-broad-cove-growth", ["physical PDF pp. 60 to 61", "proposed"]],
    ["np-2009-transmission-rebuild", ["physical PDF pp. 309 to 325", "proposed"]],
    ["np-2009-nwb02", ["physical PDF pp. 341 to 350", "proposed"]],
    ["np-2009-rose-blanche-spillway", ["physical PDF pp. 220 to 222", "proposed"]],
    ["np-2009-q3-capital", ["physical PDF p. 505", "reported"]],
    ["np-2009-annual-report", ["physical PDF pp. 597, 603 and 611", "reported"]]
  ]);

  for (const [id, [pages, status]] of expected) {
    const source = sources.find((candidate) => candidate.id === id);
    assert.ok(source, id);
    assert.equal(source.pages, pages);
    assert.equal(source.status, status);
  }
});

test("2009 station records separate filed scope, delay, and completion evidence", () => {
  assert.match(stationText("CLV"), /2009 FILED STATION WORK/);
  assert.match(stationText("CLV"), /2008 TO 2009 WORK DELAYED/);
  assert.match(stationText("GAN"), /2009 FILED STATION WORK/);
  assert.match(stationText("GAN"), /2008 TO 2009 WORK DELAYED/);
  assert.match(stationText("GFS"), /2009 FILED GRAND FALLS 4\.16 KV YARD WORK/);
  assert.match(stationText("KBR"), /Q4 2009 REPORTED STATION COMPLETION/);
  assert.match(stationText("OXP"), /2009 FILED OXEN POND STATION WORK/);
});

test("2009 line rebuilds retain filed engineering and later completion reports", () => {
  assert.match(stationText("CLV"), /4\.9 km near Clarenville.*\$627,000/);
  assert.match(stationText("CLV"), /Q3 2009 REPORTED 110L COMPLETION/);
  assert.match(stationText("PUN"), /remaining 17\.7 km.*\$2\.285 million/);
  assert.match(stationText("PUN"), /Q3 2009 REPORTED 111L COMPLETION/);
});

test("2009 NWB-02 study retains route, outage, and staged-cost evidence", () => {
  const text = stationText("NWB");
  assert.match(text, /190 interruption reports and 2,151,561 customer-minutes/);
  assert.match(text, /\$1\.463 million.*\$496,000 in 2009.*\$447,000 in 2010.*\$520,000 in 2011/);
  assert.match(text, /nwb-02-2009-route\.png/);
});

test("2009 generation records retain filed scope and completion evidence", () => {
  assert.match(stationText("RBH"), /1\.16 m ogee concrete extension/);
  assert.match(stationText("RBH"), /0\.9 GWh annually.*20\.7 GWh.*21\.6 GWh/);
  assert.match(stationText("ROP"), /1942 woodstave penstock/);
  assert.match(stationText("ROP"), /rewind the 1941 Westinghouse generator/);
  assert.match(stationText("ROP"), /\$6\.517 million in 2009/);
});

test("2009 Broad Cove record remains a filed load-transfer project", () => {
  assert.match(stationText("BCV"), /convert a section of a Broad Cove feeder from 12\.5 kV to 25 kV/);
  assert.match(stationText("BCV"), /defer transformer replacement/);
  assert.match(stationText("BCV"), /\$244,000/);
});

test("2009 filed route images are preserved as local reference sheets", async () => {
  for (const asset of ["110l-2009-route.png", "111l-2009-route.png", "nwb-02-2009-route.png"]) {
    const contents = await readFile(new URL(`../public/reference-maps/${asset}`, import.meta.url));
    assert.ok(contents.length > 500_000, asset);
  }
});
