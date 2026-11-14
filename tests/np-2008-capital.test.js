import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { sources, stationProfiles, timeline } from "../src/data.js";

const station = (code) => stationProfiles.find((candidate) => candidate.code === code);
const stationText = (code) => JSON.stringify(station(code));

test("2008 primary sources retain physical page locators and proposed state", () => {
  const expected = new Map([
    ["np-2008-station-modernization", "physical PDF pp. 161 to 180"],
    ["np-2008-transmission-rebuild", "physical PDF pp. 189 to 203"],
    ["np-2008-hydro-rehabilitation", "physical PDF pp. 149 to 159"],
    ["np-2008-fibre-network", "physical PDF pp. 228 to 234"]
  ]);

  for (const [id, pages] of expected) {
    const source = sources.find((candidate) => candidate.id === id);
    assert.ok(source, id);
    assert.equal(source.pages, pages);
    assert.equal(source.status, "proposed");
  }
});

test("2008 station records cover all ten filed modernization locations", () => {
  for (const code of ["BCV", "BOT", "CLV", "FER", "GAN", "KBR", "KEL", "LEW", "MOB", "OXP"]) {
    assert.match(stationText(code), /2008 FILED/, code);
  }
  assert.match(stationText("BOT"), /high-speed ground switch/);
  assert.match(stationText("CLV"), /110L breaker bypass switch/);
  assert.match(stationText("KBR"), /automate 12 feeders/);
  assert.match(stationText("LEW"), /103L to Notre Dame Junction/);
});

test("2008 line records preserve filed sections and later completion boundaries", () => {
  assert.match(stationText("MOB"), /20\.1 km.*13\.5 km.*\$1\.563 million/);
  assert.match(stationText("CAB"), /Q4 2008 REPORTED PLANT AND STATION COMPLETION/);
  assert.match(stationText("PUN"), /most deteriorated 13 km.*\$1\.482 million/);
  assert.match(stationText("PUN"), /Q3 2009 REPORTED 111L COMPLETION/);
});

test("2008 hydro records retain plant-specific equipment and civil work", () => {
  assert.match(stationText("MOP"), /12\.0 MW, derated to 10\.5 MW/);
  assert.match(stationText("PBK"), /2008 FILED GOVERNOR REPLACEMENT/);
  assert.match(stationText("HCT"), /stainless-steel runner and wicket gates/);
  assert.match(stationText("PHR"), /COCHRANE POND DAM WORK/);
  assert.match(stationText("HCP"), /MOUNT CARMEL POND DAM WORK/);
  assert.match(stationText("SCV"), /SOLDIERS POND DAM AND SPILLWAY REPLACEMENT/);
  assert.match(stationText("PUN"), /WHIRL POND STRUCTURE REPLACEMENTS/);
});

test("2008 fibre record preserves the documented network inventory", () => {
  const record = timeline.find((item) => item.sourceId === "np-2008-fibre-network");
  assert.ok(record);
  assert.match(record.body, /32 circuits/);
  assert.match(record.body, /16 company-built, 15 leased and one rented/);
  assert.match(record.body, /SCADA and protective relaying/);
});

test("2008 20L route image is preserved locally", async () => {
  const contents = await readFile(new URL("../public/reference-maps/20l-2008-route.png", import.meta.url));
  assert.ok(contents.length > 500_000);
});
