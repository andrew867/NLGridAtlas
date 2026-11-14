import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { sources, stationProfiles, staticClaims, timeline } from "../src/data.js";

const station = (code) => stationProfiles.find((candidate) => candidate.code === code);
const stationText = (code) => JSON.stringify(station(code));

test("2013 capital sources retain page locators and evidence states", () => {
  const expected = new Map([
    ["np-2013-transmission-rebuild", ["physical PDF pp. 285 to 292", "proposed"]],
    ["np-2013-substation-modernization", ["physical PDF pp. 265 to 280", "proposed"]],
    ["np-2013-feeder-growth", ["physical PDF pp. 312 to 315", "proposed"]],
    ["np-2013-mobile-radio", ["physical PDF pp. 394 to 402", "proposed"]],
    ["np-2017-mobile-radio-completion", ["physical PDF p. 141", "verified"]],
    ["np-2013-q3-report", ["physical PDF p. 767; attachment p. 56", "verified"]],
    ["np-2013-q4-report", ["physical PDF p. 787; attachment p. 76", "verified"]]
  ]);

  for (const [id, [pages, status]] of expected) {
    const source = sources.find((candidate) => candidate.id === id);
    assert.ok(source, id);
    assert.equal(source.pages, pages);
    assert.equal(source.status, status);
  }
});

test("110L record retains the filed final section and later completion evidence", async () => {
  const records = [stationText("LOK"), stationText("SMV"), stationText("LET")].join(" ");
  assert.match(records, /21\.1 km between Lethbridge and Summerville/);
  assert.match(records, /227 original structures/);
  assert.match(records, /1\/0 ACSR replaced by 477 ASC/);
  assert.match(records, /about one-half of its original current capacity/);

  const completion = timeline.find(({ sourceId, title }) => sourceId === "np-2013-q3-report" && /110L/.test(title));
  assert.ok(completion);
  assert.equal(completion.status, "verified");

  const route = await readFile(new URL("../public/reference-maps/110l-2013-route.png", import.meta.url));
  assert.ok(route.length > 1_000_000);
});

test("2013 station records keep filed work and completion reports separate", () => {
  assert.match(stationText("SCT"), /SCT-T1 at 5 MVA, 66\/25 kV and SCT-T2 at 4 MVA, 25\/12\.5 kV/);
  assert.match(stationText("SCT"), /oil reported above 50 ppm PCB/);
  assert.match(stationText("STV"), /401L to Gallants, 405L to Harmon, and 407L to Stephenville Crossing/);
  assert.match(stationText("STV"), /replace the 1976 electromechanical line and bus relays/);
  assert.match(stationText("KEN"), /1\.82 square metre opening/);
  assert.match(stationText("KEN"), /14 square metre opening/);
  assert.match(stationText("SCT"), /reported the St\. Catherines substation refurbishment complete/i);
  assert.match(stationText("STV"), /reported the Stephenville substation refurbishment complete/i);
});

test("2013 feeder projects retain filed scope without invented completion", () => {
  assert.match(stationText("GDL"), /construct two new feeders from Glendale Substation/);
  assert.match(stationText("SJM"), /aerial feeders 3 and 4/);
  assert.match(stationText("SJM"), /three 1,100 m single-phase 500 MCM XLPE cables/);
  assert.match(stationText("KEL"), /approximately 10 km of three-phase, 12\.47 kV line along Incinerator Road/);
  assert.match(stationText("KEL"), /three voltage regulators and a supporting pole structure/);

  for (const code of ["GDL", "SJM", "KEL"]) {
    const record = station(code).historyRecords.find(({ sourceId }) => sourceId === "np-2013-feeder-growth");
    assert.ok(record, code);
    assert.match(record.label, /PROPOSED/);
  }
});

test("Newfoundland Power radio record retains the separate network and 2014 replacement", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  assert.match(html, /207 MOBILE/);
  assert.match(html, /85 PORTABLE/);
  assert.match(html, /23 BASE/);
  assert.match(html, /24 REPEATERS/);
  assert.match(html, /9 OPERATING AREAS/);
  assert.match(html, /Approximately \$838,000/);
  assert.match(html, /\$7\.611 million/);
  assert.match(html, /np-vhf-2012-sites\.png/);

  const claim = staticClaims.find(({ id }) => id === "np-2014-mobile-radio");
  assert.ok(claim);
  assert.deepEqual(claim.sources.map(({ sourceId }) => sourceId), ["np-2013-mobile-radio", "np-2017-mobile-radio-completion"]);

  const event = timeline.find(({ sourceId }) => sourceId === "np-2017-mobile-radio-completion");
  assert.ok(event);
  assert.equal(event.status, "verified");

  const map = await readFile(new URL("../public/reference-maps/np-vhf-2012-sites.png", import.meta.url));
  assert.ok(map.length > 500_000);
});
