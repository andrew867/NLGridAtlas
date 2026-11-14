import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { sources, stationProfiles } from "../src/data.js";

const station = (code) => stationProfiles.find((candidate) => candidate.code === code);
const stationText = (code) => JSON.stringify(station(code));

test("2004 capital sources retain physical pages and evidence states", () => {
  const expected = new Map([
    ["np-2004-hydro-rehabilitation", ["physical PDF pp. 263 to 267", "proposed"]],
    ["np-2004-new-chelsea", ["physical PDF pp. 281 to 327; budget table p. 329", "proposed"]],
    ["np-2004-rebuild-substations", ["physical PDF pp. 334 to 339", "proposed"]],
    ["np-2004-substation-equipment", ["physical PDF pp. 340 to 346", "proposed"]],
    ["np-2004-feeder-additions", ["physical PDF pp. 347 to 348", "proposed"]],
    ["np-2004-transmission-rebuild", ["physical PDF pp. 388 to 392", "proposed"]],
    ["np-2004-st-johns-ampacity", ["physical PDF pp. 393 to 408", "reported"]]
  ]);

  for (const [id, [pages, status]] of expected) {
    const source = sources.find((candidate) => candidate.id === id);
    assert.ok(source, id);
    assert.equal(source.pages, pages, id);
    assert.equal(source.status, status, id);
  }
});

test("2004 station records preserve filed scope and measured values", () => {
  assert.match(stationText("NCH"), /867 m woodstave penstock/);
  assert.match(stationText("TOP"), /115 unscheduled plant outages/);
  assert.match(stationText("RBK"), /identical 45-year-old winding/);
  assert.match(stationText("CHA"), /approximately 4\.5 MVA from Kelligrews/);
  assert.match(stationText("PUL"), /Country Drive and Manning's Hill/);
  assert.match(stationText("WAL"), /WAL-T1 19\.0 MVA and WAL-T2 16\.7 MVA/);
  assert.match(stationText("BVS"), /Bayview 19\.9 MVA/);
});

test("2004 rebuild records remain attached to affected assets", () => {
  assert.match(stationText("PHR"), /2004 FILED 3L REBUILD/);
  assert.match(stationText("PBD"), /PBD-124-A6 and PBD-124L-A7/);
  assert.match(stationText("SLA"), /oil-insulated cables supplying SLA-T1 and SLA-T2/);
  assert.match(stationText("PEP"), /51 years old.*critical-clearing criterion/);
  assert.match(stationText("SUM"), /approximately 37 years old.*control performance was inconsistent/);
  for (const code of ["ROB", "STG", "LBK"]) {
    assert.match(stationText(code), /2004 FILED 403L REBUILD/, code);
  }
});

test("St. John's ampacity sheets and dated study values are exposed", async () => {
  assert.match(stationText("HWD"), /53\.8 MVA against a 40\.3 MVA winter rating/);
  assert.match(stationText("OXP"), /8\.5 MVA.*13\.3 MVA/);
  assert.match(stationText("HWD"), /st-johns-2004-ampacity-upgrades-404\.png/);
  assert.match(stationText("OXP"), /st-johns-2002-ampacity-network-408\.png/);

  for (const path of [
    "../public/reference-maps/st-johns-2004-ampacity-upgrades-404.png",
    "../public/reference-maps/st-johns-2002-ampacity-network-408.png"
  ]) {
    const image = await readFile(new URL(path, import.meta.url));
    assert.ok(image.length > 50_000, path);
  }
});
