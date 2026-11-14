import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { sources, stationProfiles, timeline } from "../src/data.js";

const station = (code) => stationProfiles.find((candidate) => candidate.code === code);
const stationText = (code) => JSON.stringify(station(code));

test("2011 source records retain page locators and evidence states", () => {
  const expected = new Map([
    ["np-2011-northeast-load", ["physical PDF pp. 333 to 342", "reported"]],
    ["np-2011-transmission-rebuild", ["physical PDF pp. 373 to 382", "proposed"]],
    ["np-2011-nwb02", ["physical PDF pp. 396 to 400", "proposed"]],
    ["np-2011-feeder-growth", ["physical PDF pp. 407 to 410 and 413 to 429", "proposed"]],
    ["np-2011-hydro-work", ["physical PDF pp. 27 to 29 and 202 to 248", "proposed"]],
    ["np-2011-q3-status", ["physical PDF pp. 1120 to 1122", "reported"]],
    ["np-2014-sandy-lake-completion", ["physical PDF p. 1", "verified"]]
  ]);

  for (const [id, [pages, status]] of expected) {
    const source = sources.find((candidate) => candidate.id === id);
    assert.ok(source, id);
    assert.equal(source.pages, pages);
    assert.equal(source.status, status);
  }
});

test("2011 Avalon load records retain measured peaks and selected work", () => {
  assert.match(stationText("BCV"), /25\.6 MVA measured peak.*25 MVA nameplate/);
  assert.match(stationText("PUL"), /PUL-T1 carried 22\.7 MVA.*25 MVA/);
  assert.match(stationText("HWD"), /HWD-T3.*23\.9 MVA measured peak/);
  assert.match(stationText("CHA"), /CHA-T1.*19\.9 MVA.*CHA-T2.*19\.9 MVA/);
  assert.match(stationText("PUL"), /\$2\.705 million.*\$638,000/);
});

test("2011 line records retain filed scope and later status", async () => {
  assert.match(stationText("KBR"), /16L between King's Bridge and Pepperell.*1\.98 km/);
  assert.match(stationText("KBR"), /listed complete in the 2019 transmission rebuild strategy update/);
  assert.match(stationText("SJM"), /25L between St\. John's Main and Goulds.*9\.25 km/);

  const line16 = await readFile(new URL("../public/reference-maps/16l-2011-route.png", import.meta.url));
  const line25 = await readFile(new URL("../public/reference-maps/25l-2011-route.png", import.meta.url));
  assert.ok(line16.length > 3_000_000);
  assert.ok(line25.length > 3_000_000);
});

test("2011 feeder records preserve NWB-02 and St. John's Main work", async () => {
  assert.match(stationText("NWB"), /Hillview to Hatchet Cove Tap.*7\.0 km/);
  assert.match(stationText("NWB"), /St\. Jones Within.*3\.4 km/);
  assert.match(stationText("SJM"), /51\.3 MVA before the project and 70\.4 MVA after/);
  assert.match(stationText("SJM"), /SJM-04 removed/);

  const feederDrawing = await readFile(new URL("../public/reference-maps/sjm-2011-reconfigured-feeders.png", import.meta.url));
  assert.ok(feederDrawing.length > 700_000);
});

test("2011 hydro records keep reported and verified states separate", () => {
  assert.match(stationText("RBK"), /105 m stoplog spillway replaced.*piano-key spillway/);
  assert.match(stationText("RBK"), /substantially complete/);
  assert.match(stationText("SBK"), /0\.86 GWh additional energy per year/);
  assert.match(stationText("SBK"), /completed as part of the 2011 capital program/);

  const rattling = timeline.find(({ title }) => /Rattling Lake spillway/.test(title));
  const sandy = timeline.find(({ title }) => /Sandy Lake spillway/.test(title));
  assert.equal(rattling?.status, "reported");
  assert.equal(sandy?.status, "verified");
});
