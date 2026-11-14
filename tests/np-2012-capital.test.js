import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { sources, stationProfiles, timeline } from "../src/data.js";

const station = (code) => stationProfiles.find((candidate) => candidate.code === code);
const stationText = (code) => JSON.stringify(station(code));

test("2012 sources retain page locators and evidence states", () => {
  const expected = new Map([
    ["np-2012-capital-transmission", ["physical PDF pp. 427 to 436", "proposed"]],
    ["np-2012-south-stjohns-load", ["physical PDF pp. 363 to 370", "reported"]],
    ["np-2012-feeder-growth", ["physical PDF pp. 463 to 465 and 469", "proposed"]],
    ["np-2012-fibre-plan", ["physical PDF pp. 93 to 94", "proposed"]],
    ["np-2012-q2-report", ["physical PDF p. 625", "verified"]],
    ["np-2012-q3-report", ["physical PDF p. 12", "verified"]],
    ["np-2012-fibre-decision", ["physical PDF p. 1", "verified"]],
    ["np-2012-annual-review", ["physical PDF pp. 20 to 21", "reported"]]
  ]);

  for (const [id, [pages, status]] of expected) {
    const source = sources.find((candidate) => candidate.id === id);
    assert.ok(source, id);
    assert.equal(source.pages, pages);
    assert.equal(source.status, status);
  }
});

test("2012 transmission records separate filed scope from reported completion", async () => {
  assert.match(stationText("HCP"), /5\.3 km of 66 kV H-frame construction/);
  assert.match(stationText("HCP"), /reported complete in the third quarter of 2012/);
  assert.match(stationText("CLV"), /5 km of 138 kV H-frame line near Clarenville/);
  assert.match(stationText("CLV"), /reported complete in June 2012/);

  const completionEvents = timeline.filter(({ sourceId }) => ["np-2012-q2-report", "np-2012-q3-report"].includes(sourceId));
  assert.ok(completionEvents.some(({ title }) => /124L/.test(title)));
  assert.ok(completionEvents.some(({ title }) => /21L/.test(title)));
  assert.ok(completionEvents.every(({ status }) => status === "verified"));

  const line21 = await readFile(new URL("../public/reference-maps/21l-2012-route.png", import.meta.url));
  const line124 = await readFile(new URL("../public/reference-maps/124l-2012-route.png", import.meta.url));
  assert.ok(line21.length > 2_000_000);
  assert.ok(line124.length > 3_000_000);
});

test("2012 St. John's fibre record preserves the lease decision", () => {
  const molloys = stationText("MOL");
  assert.match(molloys, /System Control Centre to Molloy's Lane/);
  assert.match(molloys, /six remaining circuits/);
  assert.match(molloys, /five-year vendor lease completed in June 2012/);
  assert.match(molloys, /three filed fibre routes were suspended/);

  const event = timeline.find(({ sourceId }) => sourceId === "np-2012-fibre-decision");
  assert.ok(event);
  assert.equal(event.status, "verified");
});

test("2012 load study retains dated transformer forecasts", () => {
  assert.match(stationText("HWD"), /HWD-T1.*20\.1 MVA forecast for 2013/);
  assert.match(stationText("HWD"), /HWD-T2.*20\.1 MVA forecast for 2013/);
  assert.match(stationText("GDL"), /GDL-T1.*22\.4 MVA forecast for 2013/);
  assert.match(stationText("GDL"), /GDL-T2.*22\.4 MVA forecast for 2013/);
  assert.match(stationText("GOU"), /GOU-T2.*21\.4 MVA forecast for 2013/);
  assert.match(stationText("GOU"), /GOU-T3.*14\.0 MVA forecast for 2013/);
});

test("2012 feeder and station records retain actual outcomes", async () => {
  assert.match(stationText("SJM"), /Q3 2012 COMPLETED SJM-08 RELOCATION/);
  assert.match(stationText("PUL"), /2012 FILED PUL-02 CONDUCTOR UPGRADE/);
  assert.match(stationText("PUL"), /374 A per phase/);
  assert.match(stationText("LOK"), /2011 FILED 2012 PLANT REFURBISHMENT/);
  assert.match(stationText("LOK"), /\$387,000 below budget/);

  const pulpit = await readFile(new URL("../public/reference-maps/pul-02-2012-single-line.png", import.meta.url));
  const gander = await readFile(new URL("../public/reference-maps/gander-2012-distribution-network.png", import.meta.url));
  assert.ok(pulpit.length > 500_000);
  assert.ok(gander.length > 150_000);
});
