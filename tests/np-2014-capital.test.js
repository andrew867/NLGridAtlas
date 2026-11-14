import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { sources, stationProfiles, timeline } from "../src/data.js";

const station = (code) => stationProfiles.find((candidate) => candidate.code === code);
const stationText = (code) => JSON.stringify(station(code));

test("2014 capital sources retain exact page locators and evidence states", () => {
  const expected = new Map([
    ["np-2014-transmission-lines", ["physical PDF pp. 307 to 320", "proposed"]],
    ["np-2014-hearts-content", ["physical PDF pp. 26 and 170 to 176", "proposed"]],
    ["np-2014-la-manche", ["physical PDF pp. 24 and 215 to 219", "proposed"]],
    ["np-2014-reliability-review", ["physical PDF pp. 334 to 342", "reported"]],
    ["np-2016-2014-actuals", ["physical PDF pp. 189 and 192", "reported"]],
    ["np-2016-12l-completion", ["physical PDF pp. 480 and 485", "verified"]]
  ]);

  for (const [id, [pages, status]] of expected) {
    const source = sources.find((candidate) => candidate.id === id);
    assert.ok(source, id);
    assert.equal(source.pages, pages);
    assert.equal(source.status, status);
  }
});

test("2014 transmission records retain dated endpoints, line details, and route sheets", async () => {
  assert.match(stationText("SJM"), /0\.42 km underground and 2\.64 km aerial/);
  assert.match(stationText("GOU"), /replace deteriorated 266\.8 ACSR with 715\.5 ASC/);
  assert.match(stationText("KEN"), /FORMER KEN-OXP SECTION/);
  assert.match(stationText("OXP"), /FORMER OXP-KEN SECTION/);
  assert.match(stationText("HGR"), /50 two-pole and three-pole H-frame structures/);
  assert.match(stationText("CAR"), /2\.01 km entering Carbonear/);

  for (const name of ["12l-2014-route.png", "13l-2014-route.png", "18l-2014-route.png", "35l-2014-route.png", "68l-2014-route.png"]) {
    const image = await readFile(new URL(`../public/reference-maps/${name}`, import.meta.url));
    assert.ok(image.length > 1_000_000, name);
  }
});

test("2014 hydro proposals remain separate from later expenditure records", () => {
  const hearts = stationText("HCT");
  const rocky = stationText("ROP");
  const tors = stationText("TCV");

  assert.match(hearts, /one 2\.4 MW unit; 46\.9 m rated net head/);
  assert.match(hearts, /\$6\.429 million; \$494,000 above budget/);
  assert.match(rocky, /5\.54 GWh additional annual energy/);
  assert.match(tors, /\$1\.678 million; \$13,000 above budget/);

  const actualRecords = [hearts, rocky, tors].join(" ");
  assert.doesNotMatch(actualRecords, /commissioned the La Manche|completed the La Manche|completed the plant refurbishment/);
});

test("2014 feeder reliability records preserve the five-year values and no-project decision", () => {
  assert.match(stationText("RRD"), /4,381 customer interruptions; 455,051 customer-minutes; SAIFI 2\.89; SAIDI 5\.00 hours/);
  assert.match(stationText("KEN"), /7,576 customer interruptions; 449,412 customer-minutes; SAIFI 3\.12; SAIDI 3\.08 hours/);
  assert.match(stationText("DOY"), /4,587 customer interruptions; 413,181 customer-minutes; SAIFI 2\.79; SAIDI 4\.19 hours/);
  assert.match(stationText("DLK"), /2,711 customer interruptions; 409,774 customer-minutes; SAIFI 2\.20; SAIDI 5\.54 hours/);
  assert.match(stationText("SUM"), /5,355 customer interruptions; 400,223 customer-minutes; SAIFI 2\.96; SAIDI 3\.69 hours/);

  const event = timeline.find(({ sourceId }) => sourceId === "np-2014-reliability-review");
  assert.ok(event);
  assert.equal(event.status, "reported");
  assert.match(event.body, /proposed no Distribution Reliability Initiative construction for 2014/);
});

test("12L completion uses the later explicit completion record", () => {
  const event = timeline.find(({ sourceId }) => sourceId === "np-2016-12l-completion");
  assert.ok(event);
  assert.equal(event.status, "verified");
  assert.match(stationText("KBR"), /rebuild completed in 2014/);
  assert.match(stationText("MUN"), /rebuild completed in 2014/);
});
