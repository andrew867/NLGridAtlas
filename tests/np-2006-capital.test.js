import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { sources, stationProfiles, timeline } from "../src/data.js";

const station = (code) => stationProfiles.find((candidate) => candidate.code === code);
const stationText = (code) => JSON.stringify(station(code));

test("2006 capital sources retain physical page locators and proposal state", () => {
  const expected = new Map([
    ["np-2006-hydro-rehabilitation", "physical PDF pp. 170 to 175"],
    ["np-2006-substation-program", "physical PDF pp. 202 to 235"],
    ["np-2006-humber-valley", "physical PDF pp. 237 to 245"],
    ["np-2006-123l", "physical PDF pp. 332 to 338"],
    ["np-2006-distribution-reliability", "physical PDF pp. 405 to 451"],
    ["np-2006-feeder-growth", "physical PDF pp. 453 to 455"],
    ["np-2006-standby-load-control", "physical PDF pp. 457 to 465"]
  ]);

  for (const [id, pages] of expected) {
    const source = sources.find((candidate) => candidate.id === id);
    assert.ok(source, id);
    assert.equal(source.pages, pages, id);
    assert.equal(source.status, "proposed", id);
  }
});

test("123L records preserve construction, ice damage, filed work, and route", () => {
  for (const code of ["CLV", "PRC", "CAT"]) {
    assert.match(stationText(code), /2006 FILED 123L REHABILITATION/, code);
    assert.match(stationText(code), /94 km/, code);
    assert.match(stationText(code), /4\.3 km/, code);
  }
  assert.match(stationText("CLV"), /123l-2006-route-338\.png/);
});

test("2006 distribution reliability records retain measured outage totals and later states", () => {
  assert.match(stationText("LEW"), /3,071,925 customer outage minutes/);
  assert.match(stationText("LEW"), /remaining 2009 allocation was cancelled/);
  assert.match(stationText("GLV"), /1,476,700 customer outage minutes/);
  assert.match(stationText("GLV"), /\$781,000 of work completed in 2008/);
  assert.match(stationText("BCV"), /3,512,882 customer outage minutes/);
  assert.match(stationText("BCV"), /no reliability issues after 2006/);
  assert.match(stationText("SMV"), /2,414,660 customer outage minutes/);
  assert.match(stationText("GPD"), /1,756,284 customer outage minutes/);
  assert.match(stationText("GPD"), /completed under the rebuild program in 2005/);
});

test("2006 substation records retain equipment ratings and protection limits", () => {
  assert.match(stationText("BRB"), /25 kV structure foundation/);
  assert.match(stationText("LAU"), /seven 66 kV structure foundations/);
  assert.match(stationText("GRH"), /more than 12,000 litres of oil/);
  assert.match(stationText("VIR"), /12\.5 kA.*18\.4 kA/);
  assert.match(stationText("SPO"), /66 kV bus differential protection/);
  assert.match(stationText("NCH"), /66 kV bus differential protection/);
  assert.match(stationText("RVH"), /high-side transformer backup fuses/);
  assert.match(stationText("TRP"), /high-side transformer backup fuses/);
  assert.match(stationText("PAS"), /10 MVA without forced cooling and 13\.3 MVA with fans/);
});

test("2006 hydro records are attached to every named facility", () => {
  const expected = new Map([
    ["MRP", /CANAL EMBANKMENT/],
    ["TCV", /FOREBAY EMBANKMENT/],
    ["VIC", /BLUE HILL AND ROCKY POND DAM/],
    ["WBK", /SPILLWAY REHABILITATION/],
    ["HCT", /SEAL COVE POND DAM/],
    ["LWN", /GENERATOR COOLING/],
    ["TOP", /DAM AND GENERATOR COOLING/],
    ["ROP", /GENERATOR COOLING/],
    ["HCP", /GENERATOR COOLING/],
    ["RBH", /GENERATOR COOLING/],
    ["CAB", /FREEBOARD DYKE/],
    ["PIT", /VIBRATION PROTECTION/],
    ["LBK", /INSTRUMENTATION WORK/],
    ["PBK", /INSTRUMENTATION WORK/]
  ]);

  for (const [code, pattern] of expected) {
    assert.match(stationText(code), pattern, code);
  }
});

test("December 2004 load-control event retains measured reduction and filing locator", () => {
  const event = timeline.find((candidate) => candidate.date === "2004-12-06");
  assert.ok(event);
  assert.equal(event.sourceId, "np-2006-standby-load-control");
  assert.equal(event.pages, "physical PDF pp. 463 to 465");
  assert.match(event.body, /2\.5 MW/);
});

test("2006 filed route images are preserved locally", async () => {
  const routes = [
    ["123l-2006-route-338.png", 50_000],
    ["lew-02-2006-route-415.png", 500_000],
    ["glv-02-2006-route-427.png", 500_000],
    ["gpd-01-2006-route-451.png", 500_000]
  ];

  for (const [route, minimum] of routes) {
    const contents = await readFile(new URL(`../public/reference-maps/${route}`, import.meta.url));
    assert.ok(contents.length > minimum, route);
  }
});
