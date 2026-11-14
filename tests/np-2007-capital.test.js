import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { sources, stationProfiles } from "../src/data.js";

const station = (code) => stationProfiles.find((candidate) => candidate.code === code);
const stationText = (code) => JSON.stringify(station(code));

test("2007 primary sources retain physical page locators and evidence states", () => {
  const capital = sources.find((candidate) => candidate.id === "np-2007-capital");
  assert.ok(capital);
  assert.equal(capital.pages, "physical PDF pp. 18 to 31, 133 to 183 and 375 to 385");
  assert.equal(capital.status, "proposed");

  const wesleyville = sources.find((candidate) => candidate.id === "np-2007-wesleyville-completion");
  assert.ok(wesleyville);
  assert.equal(wesleyville.pages, "physical PDF p. 139");
  assert.equal(wesleyville.status, "verified");
});

test("Rattling Brook separates filed plant scope from completed station work", () => {
  assert.match(stationText("RBK"), /2007 FILED PLANT AND STATION SCOPE/);
  assert.match(stationText("RBK"), /two vertical Francis turbine-generator units/);
  assert.match(stationText("RBK"), /2007 COMPLETED 66 KV STATION MODERNIZATION/);
  assert.match(stationText("RBK"), /refurbishment and modernization of the 66 kV transmission/);
});

test("2007 direct station records cover the seven strategic-plan locations", () => {
  for (const code of ["BLK", "CLK", "GLV", "GOU", "RRD", "SLA"]) {
    assert.match(stationText(code), /np-2007-capital/, code);
  }
  assert.match(stationText("GAR"), /np-2007-garnish/);
  assert.match(stationText("BLK"), /42 MVA.*20 MVA/);
  assert.match(stationText("CLK"), /CLK-T1 and CLK-T2 at 7\.5 MVA each/);
  assert.match(stationText("GLV"), /two 25 kV feeders serving approximately 2,300 customers/);
  assert.match(stationText("GOU"), /17L breaker bypass switch/);
  assert.match(stationText("RRD"), /automate eight feeders/);
  assert.match(stationText("SLA"), /approximately 9,300 customers/);
});

test("2007 line records preserve staged work and later completion evidence", () => {
  assert.match(stationText("HCT"), /25\.1 km.*8\.0 km rebuilt in 2005.*final 5\.1 km filed for 2007/);
  assert.match(stationText("HCT"), /2019 strategy update lists 43L complete/);
  assert.match(stationText("LOK"), /79 km.*14\.1 km between Lockston and Summerville/);
  assert.match(stationText("LOK"), /2013 COMPLETED 110L REBUILD/);
});

test("2007 generation records retain filed dam work and verified Wesleyville completion", () => {
  assert.match(stationText("PHR"), /2007 FILED FOREBAY DAM WORK/);
  assert.match(stationText("HCP"), /2007 FILED HORSE CHOPS WEST DAM WORK/);
  assert.match(stationText("WES"), /zero-hour-rated refurbished unit supplied by Siemens Canada/);
  assert.match(stationText("WES"), /\$1\.139 million.*\$1\.124 million/);
});

test("2007 route images are preserved locally", async () => {
  const routes = ["43l-2007-route-181.png", "110l-2007-route-182.png"];
  for (const route of routes) {
    const contents = await readFile(new URL(`../public/reference-maps/${route}`, import.meta.url));
    assert.ok(contents.length > 500_000, route);
  }
});
