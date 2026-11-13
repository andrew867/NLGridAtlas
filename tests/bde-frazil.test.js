import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { islandTerminalRecords, sources, staticClaims, timeline } from "../src/data.js";

const event = JSON.parse(
  await readFile(new URL("../research/derived/bde-frazil-2026.json", import.meta.url), "utf8")
);

test("Bay d'Espoir frazil event retains its source hash and observed times", () => {
  assert.equal(event.source.sha256, "4EBDD49D282D6F2D51ABF4CA55A0B9C6CBFC8E6350FEE660F5FBA77EF47F0058");
  assert.equal(event.event.all_units_removed_time, "18:00");
  assert.equal(event.event.all_units_removed_reserve_mw_approximate, 250);
  assert.equal(event.event.power_warning_reserve_mw_approximate, 360);
  assert.deepEqual(event.event.units_1_to_6_full_release, {
    timestamp: "2026-01-25 15:42",
    unit_count: 6,
    available_mw_each: 76.5
  });
  assert.equal(event.event.unit_7_release.available_mw, 154.4);
});

test("frazil event is connected to the source ledger, timeline and Bay d'Espoir record", async () => {
  const source = sources.find(({ id }) => id === "nlh-bde-frazil-2026");
  assert.ok(source);
  assert.match(source.pages, /13 to 16/);

  const claim = staticClaims.find(({ id }) => id === "bde-2026-frazil-event");
  assert.deepEqual(claim.sources, [{ sourceId: "nlh-bde-frazil-2026", pages: "physical PDF pp. 13 to 15 and 32" }]);

  const timelineEvent = timeline.find(({ sourceId }) => sourceId === "nlh-bde-frazil-2026");
  assert.equal(timelineEvent.date, "2026-01-21");
  assert.match(timelineEvent.body, /approximately 250 MW/);

  const station = islandTerminalRecords.find(({ code }) => code === "BDE");
  assert.match(station.facts.flat().join(" "), /all seven units.*approximately 250 MW/i);
  assert.match(station.facts.flat().join(" "), /6 x 76\.5 MW/);
  assert.match(station.facts.flat().join(" "), /154\.4 MW/);
  assert.ok(station.sources.some(({ sourceId: id }) => id === "nlh-bde-frazil-2026"));

  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  assert.match(html, /id="bde-frazil-2026"/);
  assert.match(html, /January 21, 18:00<\/dt><dd>All seven units out; about 250 MW reserve/);
  assert.match(html, /January 25, 15:42<\/dt><dd>Units 1 to 6 released at full capacity; 6 x 76\.5 MW/);
});
