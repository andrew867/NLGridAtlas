import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { components, islandTerminalRecords, sources, stationProfiles, timeline } from "../src/data.js";
import { avalonNodePositions } from "../src/avalon-layout.js";

const handbook = JSON.parse(await readFile(new URL("../research/derived/np-2006-handbook.json", import.meta.url), "utf8"));
const transformerRegister = JSON.parse(await readFile(new URL("../research/derived/np-2027-transformer-register.json", import.meta.url), "utf8"));
const todStudy = JSON.parse(await readFile(new URL("../research/derived/np-2018-tod-study.json", import.meta.url), "utf8"));

const allowedStates = new Set(["verified", "reported", "proposed", "inferred", "unresolved"]);
const primaryLocator = /(?:PDF p|archival record)/;

test("source records have stable identifiers and primary locators", () => {
  const ids = new Set();
  for (const source of sources) {
    assert.match(source.id, /^[a-z0-9-]+$/);
    assert.ok(!ids.has(source.id), `duplicate source id: ${source.id}`);
    ids.add(source.id);
    assert.match(source.url, /^https?:\/\//);
    assert.match(source.pages, primaryLocator);
    assert.ok(Number.isInteger(source.year));
    assert.ok(allowedStates.has(source.status));
    assert.ok(source.topics.length > 0);
  }
});

test("HVDC link system records retain the filed ratings and source pages", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const sourceById = new Map(sources.map((source) => [source.id, source]));

  assert.equal(sourceById.get("nlh-gra-2017-v2").pages, "physical PDF pp. 14 to 17");
  assert.equal(sourceById.get("nalcor-maritime-basis-2019").pages, "physical PDF pp. 107 to 120, 141 to 144, and 148 to 150");
  assert.equal(sourceById.get("synapse-maritime-service-2018").pages, "physical PDF p. 7");

  assert.match(html, /id="hvdc-links"/);
  assert.match(html, /Labrador-Island Link/);
  assert.match(html, /L3501 \/ POLE 1 \/ \+350 kV/);
  assert.match(html, /L3502 \/ POLE 2 \/ -350 kV/);
  assert.match(html, /900 MW AT MUSKRAT FALLS \/ 830 MW AT SOLDIERS POND/);
  assert.match(html, /Five 72 MVAr at Muskrat Falls; six 75 MVAr at Soldiers Pond/);

  assert.match(html, /Maritime Link/);
  assert.match(html, /TL269/);
  assert.match(html, /X20005 \/ X20001 \/ POLE 1 \/ \+200 kV/);
  assert.match(html, /X20006 \/ X20002 \/ POLE 2 \/ -200 kV/);
  assert.match(html, /500 MW BIPOLAR \/ 250 MW CONTINUOUS MONOPOLE/);
  assert.match(html, /2 x 170 km SUBSEA/);
  assert.match(html, /301NL/);
  assert.match(html, /301NS/);
});

test("Corner Brook frequency converter record retains the dated operating arrangement", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const sourceById = new Map(sources.map((source) => [source.id, source]));

  assert.equal(sourceById.get("nlh-cbk-assessment-2005").pages, "physical PDF pp. 4 to 6, 9, 22 to 24, and 34");
  assert.equal(sourceById.get("nlh-cbk-rfi-2006").pages, "physical PDF p. 1");
  assert.equal(sourceById.get("nlh-cbk-upgrade-2017").pages, "physical PDF pp. 182 to 183");
  assert.equal(sourceById.get("pub-cbk-sale-2018").pages, "physical PDF pp. 1 to 3");

  assert.match(html, /id="corner-brook-frequency-converter"/);
  assert.match(html, /data-claim-id="corner-brook-frequency-converter-record"/);
  assert.match(html, /data-hydro-terminal-record="DLK"/);
  assert.match(html, /data-hydro-terminal-record="MDR"/);
  assert.match(html, /25 MVA MOTOR-GENERATOR SET/);
  assert.match(html, /21\/28 MVA/);
  assert.match(html, /66\/6\.6 kV/);
  assert.match(html, /19 MVA operating limit/);
  assert.match(html, /25 MW maximum output/);
  assert.match(html, /\$2\.9438 million budget/);
  assert.match(html, /Sale to Corner Brook Pulp and Paper approved for \$1; Hydro abandonment approved/);
  assert.doesNotMatch(html, /50 Hz conversion completed/);
});

test("telecommunications record keeps historical, proposed and reported systems separate", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const sourceById = new Map(sources.map((source) => [source.id, source]));

  assert.equal(sourceById.get("vhf-2004").pages, "physical PDF pp. 193 to 203, 251, 258, and 265 to 266");
  assert.equal(sourceById.get("vhf-2027-status").pages, "physical PDF p. 248");
  assert.equal(sourceById.get("nlh-2025-avalon-ct-early-execution").status, "proposed");

  assert.match(html, /HISTORICAL \/ 2001 STUDY/);
  assert.match(html, /PROPOSED \/ 2004 REVISION/);
  assert.match(html, /REPORTED \/ 2026 FILING/);
  assert.match(html, /170 MHz \/ 39 SITES/);
  assert.match(html, /\$10,827,896/);
  assert.match(html, /\$10,597,828/);
  assert.match(html, /\$230,068/);
  assert.match(html, /PROVINCIAL P25/);
  assert.match(html, /STARLINK/);
  assert.match(html, /CRADLEPOINT/);
  assert.match(html, /West-coast microwave upgrade/);
  assert.match(html, /vhf-2001-existing-sites-265\.png/);
  assert.match(html, /vhf-2001-potential-sites-266\.png/);
});

test("load records separate actual peaks, forecasts and planning ratios", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const sourceById = new Map(sources.map((source) => [source.id, source]));

  assert.equal(sourceById.get("forecast-2020").pages, "physical PDF pp. 13 to 14; report pp. 7 to 8");
  assert.equal(sourceById.get("np-2014-winter-peak").pages, "physical PDF p. 1");

  assert.match(html, /2020-01-02 TO 2020-01-03 \/ DATA IMPORT FAILURE/);
  assert.match(html, /1,135 MW/);
  assert.match(html, /1,282 MW/);
  assert.match(html, /1,165 MW/);
  assert.match(html, /1,295 MW/);
  assert.match(html, /1,398\.465/);
  assert.match(html, /863\.868/);
  assert.match(html, /They are planning values, not measured peaks/);
  assert.match(html, /GIL-T1<\/td><td>6\.67 MVA<\/td><td>7\.11 MVA<\/td><td>106\.6%/);

  const ratio = 7.11 / 6.67 * 100;
  assert.equal(ratio.toFixed(1), "106.6");

  const ridgeRoad = components["rrd-summary"];
  const kingsBridge = components["kbr-summary"];
  assert.ok(ridgeRoad.data.some(([label, value]) => label === "Five-year forecast maximum peak" && value === "34.7 MVA"));
  assert.ok(kingsBridge.data.some(([label, value]) => label === "Five-year forecast maximum peak" && value === "43.7 MVA"));
});

test("timeline events resolve to a source and evidence state", () => {
  const sourceIds = new Set(sources.map((source) => source.id));
  for (const event of timeline) {
    assert.ok(sourceIds.has(event.sourceId), `unknown source: ${event.sourceId}`);
    assert.ok(allowedStates.has(event.status), `unknown status: ${event.status}`);
    assert.match(event.pages, /PDF p/);
    assert.ok(event.body.endsWith("."));
  }
});

test("diagram components resolve to a diagram and primary sources", () => {
  const sourceIds = new Set(sources.map((source) => source.id));
  for (const [id, component] of Object.entries(components)) {
    assert.match(id, /^[a-z0-9-]+$/);
    assert.ok(component.diagram);
    assert.ok(allowedStates.has(component.status));
    assert.ok(component.code);
    assert.ok(component.title);
    assert.ok(component.summary.endsWith("."));
    assert.ok(component.data.length > 0);
    assert.ok(component.sources.length > 0);
    for (const reference of component.sources) {
      assert.ok(sourceIds.has(reference.sourceId), `unknown component source: ${reference.sourceId}`);
      assert.match(reference.pages, primaryLocator);
    }
  }
});

test("every clickable diagram item has an evidence record", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const expected = [
    "opd-t1", "opd-t2", "opd-t3",
    "hwd-t1", "hwd-t2", "hwd-t3", "hwd-t4",
    "wav-t1", "wav-t2", "wav-t3", "wav-t4", "wav-t5",
    "hrd-t1", "hrd-t2", "hrd-t3", "hrd-g3", "hrd-t5", "hrd-t6", "hrd-t7", "hrd-t8", "hrd-t10", "hrd-gt",
    "hwd-np-t1", "hwd-np-t2", "hwd-np-t3", "hwd-np-hwd08", "hwd-np-hwd09",
    "oxp-np-transformer", "oxp-np-feeder",
    "mun-t1", "mun-t2", "mun-bus",
    "lpd-t1", "lpd-t2"
  ];
  for (const id of expected) {
    assert.ok(components[id], `missing component data: ${id}`);
    assert.match(html, new RegExp(`data-component="${id}"`));
  }
  for (const diagram of ["opd", "hwd", "wav", "hrd", "hwd-np", "oxp-np", "mun", "lpd"]) {
    assert.ok(components[`${diagram}-summary`], `missing summary: ${diagram}`);
    assert.match(html, new RegExp(`data-diagram-panel="${diagram}"`));
    assert.match(html, new RegExp(`data-default-component="${diagram}-summary"`));
  }
});

test("2006 handbook extraction matches the source-reported registers", () => {
  assert.equal(handbook.source.sha256, "54cfa1347e25bdf937dd09acbe5d84da7c0ac8b08c87e1284a8a84d23085a5ff");
  assert.equal(handbook.source.physical_pages, 18);
  assert.equal(handbook.transmission_lines.length, 104);
  assert.equal(handbook.substations.length, 136);
  assert.equal(handbook.substations.reduce((total, station) => total + station.feeders.length, 0), 302);
  assert.equal(new Set(handbook.transmission_lines.map((line) => line.circuit)).size, 104);
  assert.equal(new Set(handbook.substations.map((station) => station.code)).size, 136);
});

test("Avalon schematic only uses handbook station codes and line endpoints", () => {
  const knownCodes = new Set(handbook.substations.map((station) => station.code));
  for (const line of handbook.transmission_lines) {
    if (line.from_code) knownCodes.add(line.from_code);
    if (line.to_code) knownCodes.add(line.to_code);
  }
  for (const code of Object.keys(avalonNodePositions)) {
    assert.ok(knownCodes.has(code), `unknown Avalon station or endpoint code: ${code}`);
  }
  const drawable = handbook.transmission_lines.filter((line) => (
    line.from_code in avalonNodePositions && line.to_code in avalonNodePositions
  ));
  assert.ok(drawable.length >= 40);
  for (const line of drawable) {
    assert.match(line.circuit, /^\d+L$/);
    assert.ok(line.source_page >= 6 && line.source_page <= 9);
  }
});

test("Avalon station placement follows the geographic source maps", () => {
  assert.ok(avalonNodePositions.CHA[0] < avalonNodePositions.HWD[0]);
  assert.ok(avalonNodePositions.KEL[0] < avalonNodePositions.HWD[0]);
  assert.ok(avalonNodePositions.OXP[0] > avalonNodePositions.HWD[0]);
});

test("network links use registered circuit endpoints and page anchors", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const connectedCircuits = (code) => handbook.transmission_lines
    .filter((line) => line.from_code === code || line.to_code === code)
    .map((line) => line.circuit);

  assert.deepEqual(connectedCircuits("HWD"), ["5L", "19L", "49L", "54L", "72L", "73L", "79L"]);
  assert.deepEqual(connectedCircuits("OXP"), ["31L", "32L", "34L", "35L", "58L", "67L", "70L"]);

  for (const anchor of [
    "terminal-opd", "terminal-hwd", "terminal-wav", "terminal-hrd",
    "substation-hwd", "substation-oxp", "substation-pul", "substation-mun", "substation-lpd"
  ]) {
    assert.match(html, new RegExp(`id="${anchor}"`), `missing page anchor: ${anchor}`);
  }
  for (const href of [
    "#terminal-opd", "#terminal-hwd", "#terminal-wav", "#terminal-hrd",
    "#substation-hwd", "#substation-oxp", "#station-browser", "#hydro-terminal-browser"
  ]) {
    assert.match(html, new RegExp(`href="${href}"`), `missing network link: ${href}`);
  }
  assert.match(html, /data-station-record="BCV"/);
  assert.match(html, /href="#substation-sla"/);
  assert.match(html, /data-hydro-terminal-record="SUN"/);
  assert.match(html, /data-hydro-terminal-record="CBC"/);
  assert.match(html, /TL203[\s\S]*SUNNYSIDE/);
  assert.match(html, /TL237[\s\S]*COME BY CHANCE/);
  assert.match(html, /TL208[\s\S]*VOISEY'S BAY[\s\S]*NICKEL/);
  assert.ok(html.indexOf('id="terminal-hrd"') < html.indexOf('id="substations"'));
  assert.match(html, /59L \/ VIRGINIA WATERS/);
  assert.match(html, /PUL-T1[\s\S]*PUL-T2[\s\S]*PUL-05/);
});

test("station additions preserve sourced details", async () => {
  const healthEvent = timeline.find((event) => event.sourceId === "np-2014-capital");
  assert.ok(healthEvent);
  assert.match(healthEvent.body, /Health Sciences Centre/);
  assert.equal(healthEvent.pages, "PDF p. 309");

  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  assert.match(html, />OXP-01</);
  assert.match(html, /December 2012 demolition drawing/i);
  assert.match(html, /T2 \/ 115\/152\/190 MVA/);
  assert.match(html, /T9 \/ 10\.5\/14 MVA/);
  assert.match(html, /ATI mobile network/);
  assert.match(html, /29[\s\S]*Repeater sites/);
  assert.match(html, /Bay d'Espoir Hill[\s\S]*164\.22 MHz[\s\S]*170\.28 MHz/);
  assert.match(html, /P25 system and Starlink with Cradlepoint routers/);
  assert.match(html, /Hardwoods Terminal Station simplified one-line/);
  assert.match(html, /Simplified Oxen Pond one-line diagram/);
  assert.match(html, /Western Avalon Terminal Station simplified one-line/);
  assert.match(html, /Newfoundland Power substations/);
  assert.match(html, /Hardwoods Substation simplified one-line/);
  assert.match(html, /Oxen Pond Substation simplified one-line/);
  assert.match(html, /12L \/ KING'S BRIDGE/);
  assert.match(html, /14L \/ STAMP'S LANE/);
  assert.match(html, /1192\.5 kcmil 54\/19 Grackle/);
  assert.match(html, /969 A \/ 386 MVA/);
  assert.match(html, /1610 A \/ 641 MVA/);
  assert.match(html, /238 hourly load series/);
  assert.match(html, /4,175,472/);
  assert.match(html, /Household records<\/dt><dd>236/);
  assert.match(html, /Customers retained<\/dt><dd>209/);
  assert.doesNotMatch(html, /Each technical statement includes its source page/);
  assert.doesNotMatch(html, /does not assign voltage/);
  assert.doesNotMatch(html, /this atlas preserves/i);
  assert.doesNotMatch(html, /TRANSFORMER REGISTER SHEETS/);
  assert.doesNotMatch(html, /cyclotron/i);
  assert.doesNotMatch(html, /loop name in the 2026 planning study/);
  assert.doesNotMatch(html, /66\/69 kV/);
  assert.doesNotMatch(html, /<h2 id="network-title">Oxen Pond terminal station<\/h2>/i);
  assert.doesNotMatch(html, /class="station-event"/);
  assert.doesNotMatch(html, /Type H mechanism was replaced with a Type VV mechanism/);
  assert.match(html, /Terminal station <span class="no-break">one-lines<\/span>/);
  assert.match(html, /03 \/ SUBSTATION DIAGRAMS/);
  assert.match(html, /04 \/ TRANSMISSION RECORD/);

  assert.match(components["wav-t5"].summary, /Type H mechanism was replaced with a Type VV mechanism/);
  assert.match(components["hrd-t2"].summary, /failed internally in November 2021/);
  assert.match(components["hwd-t3"].summary, /moved to Hardwoods in 1986/);
});

test("new station and corridor records retain primary source locators", () => {
  const expected = new Map([
    ["np-2024-capital", "PDF pp. 378 to 389"],
    ["np-2023-long-pond", "PDF pp. 109 to 111"],
    ["nlh-2014-wav-t5", "PDF pp. 12, 17, 19 to 20"],
    ["nlh-2026-wav-sop", "PDF pp. 9, 30 to 33, 41 to 43, 57, 60, 62, 145 to 146"],
    ["np-2027-loop-study", "physical PDF pp. 183, 188 to 195, 199 to 200 and 223"],
    ["np-2027-transformers", "physical PDF pp. 545 to 553 and 560"]
  ]);
  for (const [id, pages] of expected) {
    const source = sources.find((item) => item.id === id);
    assert.ok(source, `missing source: ${id}`);
    assert.equal(source.pages, pages);
  }

  const t5Event = timeline.find((event) => event.sourceId === "nlh-2014-wav-t5");
  assert.match(t5Event.body, /Type VV/);
  const corridorEvent = timeline.find((event) => event.sourceId === "nlh-2026-wav-sop");
  assert.equal(corridorEvent.status, "proposed");

  const holyroodFailure = timeline.find((event) => event.sourceId === "nlh-2022-holyrood-t2");
  assert.match(holyroodFailure.body, /115\/152\/190 MVA/);
  assert.match(holyroodFailure.body, /approximately 150 MVA/);

  const radioRevision = timeline.find((event) => event.sourceId === "vhf-2004-revision");
  assert.match(radioRevision.body, /29 existing sites to 39/);
  assert.match(radioRevision.body, /Burin Peninsula/);

  const burinStudy = timeline.find((event) => event.sourceId === "np-2021-burin-reactive");
  assert.match(burinStudy.body, /40 MVA/);
  assert.match(burinStudy.body, /28\.418 MW/);
});

test("time-of-day study record retains the source discrepancy", () => {
  const source = sources.find((item) => item.id === "np-2018-tod-study");
  assert.ok(source);
  assert.equal(source.year, 2018);
  assert.match(source.pages, /PDF p\. 1/);
  assert.equal(todStudy.hourly_data.recorder_series, 238);
  assert.equal(todStudy.hourly_data.measurements_per_series, 731 * 24);
  assert.equal(
    todStudy.hourly_data.measurement_rows,
    todStudy.hourly_data.recorder_series * todStudy.hourly_data.measurements_per_series
  );
  assert.equal(todStudy.attachment_b.household_records, 236);
  assert.equal(todStudy.attachment_b.customers_retained, 209);
});

test("station profiles separate registers, maps, and recorded event loads", () => {
  const hardwoods = stationProfiles.find((station) => station.code === "HWD");
  assert.deepEqual(hardwoods.feederRegister, ["HWD-01", "HWD-02", "HWD-03", "HWD-04", "HWD-06", "HWD-07", "HWD-08"]);
  assert.deepEqual(hardwoods.mapPages.map(([feeder]) => feeder), ["HWD-01", "HWD-02", "HWD-03", "HWD-04", "HWD-06", "HWD-07"]);
  assert.deepEqual(hardwoods.eventLoads, [["HWD-07", "11 MW"], ["HWD-01", "7 MW"], ["HWD-04", "8 MW"]]);
  assert.match(hardwoods.mapNote, /HWD-08 route and recloser drawing/);
  assert.equal(hardwoods.referenceSheets[0].pages, "physical PDF p. 44");
  assert.deepEqual(hardwoods.engineeringRecord.facts, [
    ["HWD-T1", "66/12.5 kV, 20 MVA, 16.62 MVA 2026 forecast"],
    ["HWD-T2", "66/12.5 kV, 20 MVA, 16.52 MVA 2026 forecast"],
    ["HWD-T3", "66/25 kV, 50 MVA, 44.16 MVA 2026 forecast"],
    ["HWD-08", "477 ASC, 590 A planning rating, 595 A forecast per phase"],
    ["HWD-09", "new 25 kV feeder to Kenmount Road"],
    ["Load transfer", "approximately 9 MVA transferred onto HWD-08"]
  ]);

  const oxenPond = stationProfiles.find((station) => station.code === "OXP");
  assert.deepEqual(oxenPond.eventLoads, [["OXP-01", "9 MW"]]);
  assert.deepEqual(oxenPond.engineeringRecord.facts, [
    ["Operating voltage", "66/12.5 kV"],
    ["Rating", "13.33 MVA"],
    ["2026 forecast", "9.87 MVA"]
  ]);

  const kenmount = stationProfiles.find((station) => station.code === "KEN");
  assert.deepEqual(kenmount.feederRegister, ["KEN-02", "KEN-03", "KEN-04"]);
  assert.deepEqual(kenmount.mapPages.map(([feeder]) => feeder), ["KEN-01", "KEN-02", "KEN-03", "KEN-04"]);
  assert.deepEqual(kenmount.engineeringRecord.facts, [
    ["KEN-T1", "66/25 kV, 25 MVA, 20.04 MVA 2026 forecast"],
    ["KEN-T2", "66/25 kV, 50 MVA, 41.93 MVA 2026 forecast"]
  ]);
});

test("every extracted feeder image is exposed by a station record", async () => {
  const imageFiles = (await readdir(new URL("../public/feeder-maps/", import.meta.url)))
    .filter((file) => file.endsWith(".jpg"))
    .sort();
  const mappedFiles = stationProfiles
    .flatMap((station) => station.mapPages.map(([feeder]) => `${feeder.toLowerCase()}.jpg`))
    .sort();
  assert.deepEqual(mappedFiles, imageFiles);
});

test("CA-NP-020 feeder sheets preserve the complete filed page sequence", () => {
  const mapRows = stationProfiles
    .flatMap((station) => station.mapPages.map(([feeder, page]) => ({ feeder, page, station: station.code })))
    .sort((left, right) => left.page - right.page);

  assert.equal(mapRows.length, 150);
  assert.deepEqual(mapRows.map(({ page }) => page), Array.from({ length: 150 }, (_, index) => index + 20));
  assert.deepEqual(mapRows[0], { feeder: "ABC-01", page: 20, station: "ABC" });
  assert.deepEqual(mapRows.at(-1), { feeder: "WES-02", page: 169, station: "WES" });
  assert.equal(new Set(mapRows.map(({ feeder }) => feeder)).size, 150);
  assert.deepEqual(mapRows.slice(0, 12).map(({ feeder, page }) => [feeder, page]), [
    ["ABC-01", 20], ["ABC-02", 21], ["BCV-01", 22], ["BCV-02", 23],
    ["BCV-03", 24], ["BCV-04", 25], ["BFS-01", 26], ["BFS-02", 27],
    ["BIG-02", 28], ["BLK-01", 29], ["BLK-02", 30], ["BOT-01", 31]
  ]);
  assert.deepEqual(mapRows.slice(-21).map(({ feeder, page }) => [feeder, page]), [
    ["SPF-02", 149], ["SPF-03", 150], ["STX-01", 151], ["TRN-02", 152],
    ["TWG-01", 153], ["TWG-02", 154], ["VIC-02", 155],
    ["VIR-01", 156], ["VIR-02", 157], ["VIR-03", 158], ["VIR-04", 159],
    ["VIR-05", 160], ["VIR-06", 161], ["VIR-08", 162],
    ["WAL-01", 163], ["WAL-02", 164], ["WAL-04", 165], ["WAL-05", 166],
    ["WAV-01", 167], ["WES-01", 168], ["WES-02", 169]
  ]);
});

test("early CA-NP-020 feeder sheets have station records and current transformer entries", () => {
  const expected = {
    ABC: [["ABC-01", 20], ["ABC-02", 21]],
    BCV: [["BCV-01", 22], ["BCV-02", 23], ["BCV-03", 24], ["BCV-04", 25]],
    BFS: [["BFS-01", 26], ["BFS-02", 27]],
    BIG: [["BIG-02", 28]],
    BRB: [["BRB-01", 33], ["BRB-02", 34], ["BRB-03", 35], ["BRB-04", 36], ["BRB-05", 37]],
    BVS: [["BVS-01", 38], ["BVS-02", 39]],
    CHA: [["CHA-01", 41], ["CHA-03", 42]],
    COB: [["COB-03", 47]],
    DLK: [["DLK-01", 48], ["DLK-03", 49]],
    GAR: [["GAR-01", 57]]
  };

  for (const [code, mapPages] of Object.entries(expected)) {
    const profile = stationProfiles.find((station) => station.code === code);
    assert.ok(profile, `${code} station profile`);
    assert.deepEqual(profile.mapPages, mapPages, `${code} feeder maps`);
    assert.equal(profile.planningRecord.sourceId, "np-2027-transformers", `${code} transformer source`);
  }

  const bishopsFalls = stationProfiles.find((station) => station.code === "BFS");
  assert.deepEqual(bishopsFalls.connectedCircuits.map(({ circuit }) => circuit), ["132L", "133L", "134L", "136L"]);
  assert.equal(bishopsFalls.connectedCircuits.find(({ circuit }) => circuit === "136L").from_code, "RBK");
  assert.equal(bishopsFalls.circuitSource.sourceId, "np-2025-ca-np-168");
  assert.deepEqual(bishopsFalls.diagram.buses.map(({ voltage }) => voltage), ["138 kV", "25 kV"]);
  assert.match(bishopsFalls.planningRecord.facts.flat().join(" "), /BFS-T1.*138\/25 kV; 20 MVA; 8\.47 MVA/);
  assert.match(bishopsFalls.engineeringRecord.facts.flat().join(" "), /20 MVA.*steel; installed in 1978.*steel; installed in 1978/);
  const bishopsFallsHistory = bishopsFalls.historyRecords.flatMap(({ facts }) => facts).flat().join(" ");
  assert.match(bishopsFallsHistory, /BFS-132L-B, BFS-133L-B, BFS-134L-B and BFS-136L-B; bulk-oil units/);
  assert.match(bishopsFallsHistory, /GFS-02 to BFS-02 tie was estimated at approximately \$900,000/);
  assert.match(bishopsFallsHistory, /voltages as low as 0\.86 pu.*approximately 20 MVAR at Gambo/);

  const cobbsPond = stationProfiles.find((station) => station.code === "COB");
  assert.deepEqual(cobbsPond.connectedCircuits.map(({ circuit }) => circuit), ["TL210", "142L", "144L", "147L"]);
  assert.deepEqual(cobbsPond.diagram.buses.map(({ voltage }) => voltage), ["138 kV", "66 kV", "12.5 kV"]);
  assert.deepEqual(cobbsPond.diagram.transformers.map(({ label }) => label), ["COB-T1", "COB-T2", "COB-T3"]);
  assert.match(cobbsPond.engineeringRecord.facts.flat().join(" "), /steel; installed in 1980.*wood 66 kV structure installed in 1978.*bus modifications recorded in 2001/);
  const cobbsPondHistory = cobbsPond.historyRecords.flatMap(({ facts }) => facts).flat().join(" ");
  assert.match(cobbsPondHistory, /19\.6 MVA on COB-T1.*add COB-T3, 25 MVA, 138\/12\.5 kV/);
  assert.match(cobbsPondHistory, /two breakers, civil infrastructure, and a bus extension to complete the ring-bus configuration/);
  assert.match(cobbsPondHistory, /in-service failure in 2025; repaired without a portable transformer/);
});

test("Deer Lake keeps the dated voltage records and approved DLK-03 work separate", () => {
  const deerLake = stationProfiles.find((station) => station.code === "DLK");
  assert.ok(deerLake);
  assert.deepEqual(deerLake.diagram.buses.map(({ voltage }) => voltage), ["66 kV", "25 kV"]);
  assert.match(deerLake.engineeringRecord.facts.flat().join(" "), /approximately 147 A.*85 A/);
  assert.match(deerLake.planningRecord.facts.flat().join(" "), /2018 transformer listing records 66\/12\.47 kV.*2027 transformer register records 66\/25 kV/);

  const history = deerLake.historyRecords.flatMap(({ facts }) => facts).flat().join(" ");
  assert.match(history, /16\.8 MVA on the 16\.7 MVA DLK-T1/);
  assert.match(history, /Q4 2010 report records both Deer Lake and Mobile transformer replacements complete/);
  assert.match(history, /upgrade 3\.5 km of DLK-03.*new 2\.5 km extension from WDL-L1/);
  assert.match(history, /engineering was in progress; construction was set to begin in early 2027/);

  const mobile = stationProfiles.find((station) => station.code === "MOB");
  assert.match(mobile.historyRecords.flatMap(({ facts }) => facts).flat().join(" "), /former 16\.7 MVA, 66\/12\.5 kV DLK-T1 was relocated/);
});

test("island terminal records retain page-level sources", async () => {
  const sourceIds = new Set(sources.map((source) => source.id));
  assert.deepEqual(islandTerminalRecords.map((record) => record.code), ["SUN", "STB", "BDE", "BUC", "DLK", "BRH", "PBR", "PLP", "BRC", "SAA", "HAW", "HOW", "SBR", "DOY", "GRB", "EHW", "BBK", "GFS", "MAS", "STV", "CBC", "VBN", "SDP", "USL", "GRC", "CAT", "HLA"]);
  for (const record of islandTerminalRecords) {
    assert.ok(allowedStates.has(record.status));
    assert.ok(record.facts.length > 0);
    for (const reference of record.sources) {
      assert.ok(sourceIds.has(reference.sourceId));
      assert.match(reference.pages, /PDF p/);
    }
  }
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  assert.match(html, /id="hydro-terminal-browser"/);
  assert.match(html, /data-hydro-terminal-record="BDE"/);
});

test("island transformer evidence keeps dated ratings and replacements", () => {
  const sunnyside = islandTerminalRecords.find((record) => record.code === "SUN");
  const buchans = islandTerminalRecords.find((record) => record.code === "BUC");
  const stonyBrook = islandTerminalRecords.find((record) => record.code === "STB");
  const deerLake = islandTerminalRecords.find((record) => record.code === "DLK");
  const howley = islandTerminalRecords.find((record) => record.code === "HOW");
  const masseyDrive = islandTerminalRecords.find((record) => record.code === "MAS");
  const bayDEspoir = islandTerminalRecords.find((record) => record.code === "BDE");
  const comeByChance = islandTerminalRecords.find((record) => record.code === "CBC");
  const voiseysBayNickel = islandTerminalRecords.find((record) => record.code === "VBN");
  const soldiersPond = islandTerminalRecords.find((record) => record.code === "SDP");

  assert.match(stonyBrook.facts.flat().join(" "), /75\/100\/125 MVA each in the 2003 system report/);
  assert.match(deerLake.facts.flat().join(" "), /45\/60\/75 MVA/);
  assert.match(deerLake.facts.flat().join(" "), /25\/33\.3\/41\.7 MVA/);
  assert.match(howley.facts.flat().join(" "), /138\/69\/4\.16 kV, 7\.5\/10\/12\.5 MVA/);
  assert.match(masseyDrive.facts.flat().join(" "), /1998 transformer replacement/);
  assert.match(masseyDrive.facts.flat().join(" "), /66\.7 MVA.*125 MVA/);
  assert.match(sunnyside.facts.flat().join(" "), /Former Holyrood T8.*Sunnyside T1 position/);
  assert.match(buchans.facts.flat().join(" "), /Massey Drive in 1970.*Buchans in 1998/);
  assert.match(bayDEspoir.facts.flat().join(" "), /T10 and T12, 230\/69 kV, 15\/20\/25 MVA each/);
  assert.match(bayDEspoir.facts.flat().join(" "), /T7, 230\/13\.8 kV, 129\/172 MVA/);
  assert.match(voiseysBayNickel.facts.flat().join(" "), /TL208 to Western Avalon/);
  assert.match(voiseysBayNickel.facts.flat().join(" "), /Long Harbour predecessor.*removed from service/);
  assert.deepEqual(bayDEspoir.diagram.transformers, [
    { label: "T10", rating: "15/20/25 MVA", from: "b1", to: "b2" },
    { label: "T12", rating: "15/20/25 MVA", from: "b1", to: "b2" }
  ]);
  assert.match(comeByChance.facts.flat().join(" "), /230\/13\.8 kV, 30\/40\/50 MVA each; both manufactured in 1972/);
  assert.match(comeByChance.facts.flat().join(" "), /T1 and T2 serve only the Braya refinery/);
  assert.deepEqual(comeByChance.diagram.transformers, [
    { label: "T1", rating: "30/40/50 MVA", from: "b1", to: "b2" },
    { label: "T2", rating: "30/40/50 MVA", from: "b1", to: "b2" }
  ]);
  assert.match(components["hrd-t8"].summary, /new 75\/100\/125 MVA transformer was installed as Holyrood T8 in 2014/);
  assert.match(components["hrd-t7"].summary, /Churchill Falls T31/);
  assert.match(components["hrd-t7"].summary, /finished in 2024/);
  assert.ok(howley.sources.some((reference) => reference.sourceId === "nlh-howley-system-2003"));
  assert.ok(masseyDrive.sources.some((reference) => reference.sourceId === "nlh-system-additions-2001"));
  assert.ok(bayDEspoir.sources.some((reference) => reference.sourceId === "nlh-bde-one-lines-2016"));
  assert.ok(comeByChance.sources.some((reference) => reference.sourceId === "nlh-cbc-facility-review-2014"));
  assert.ok(comeByChance.sources.some((reference) => reference.sourceId === "nlh-braya-ciac-2023"));
  assert.match(soldiersPond.facts.flat().join(" "), /commissioned on 2023-04-14/);
  assert.match(soldiersPond.facts.flat().join(" "), /SC1, SC2 and SC3; 175 MVAr each/);
  assert.deepEqual(soldiersPond.diagram.circuits.map((circuit) => circuit.label), ["TL201", "TL217", "TL242", "TL266", "TL265", "TL268"]);
  assert.equal(soldiersPond.diagram.converters.length, 2);
  assert.ok(soldiersPond.sources.some((reference) => reference.sourceId === "nlh-lil-commissioning-2023"));
});

test("2027 transformer register updates Avalon station records", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  assert.deepEqual(components["oxp-np-transformer"].data, [
    ["Operating voltage", "66/12.5 kV"],
    ["Rating", "13.33 MVA"],
    ["2026 forecast", "9.87 MVA"]
  ]);
  assert.equal(components["hwd-np-t1"].data[1][1], "20 MVA");
  assert.equal(components["hwd-np-t2"].data[1][1], "20 MVA");
  assert.equal(components["hwd-np-t3"].data[1][1], "50 MVA");
  assert.equal(components["mun-t1"].data[3][1], "14.96 MVA");
  assert.equal(components["mun-t2"].data[0][1], "25 MVA");
  assert.equal(components["lpd-t2"].status, "verified");
  assert.match(components["pul-np-summary"].summary, /12\.5 kV feeders/);
  assert.doesNotMatch(components["pul-np-summary"].summary, /25\.0 kV/);
  assert.match(html, /OXP-T1[\s\S]*66\/12\.5 kV \/ 13\.33 MVA/);
  assert.match(html, /HWD-T1[\s\S]*HWD-T2[\s\S]*HWD-T3/);
  assert.doesNotMatch(html, /Not stated in cited records/);
});

test("station browser covers the handbook and merges the 2027 transformer register", async () => {
  const main = await readFile(new URL("../src/main.js", import.meta.url), "utf8");
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  assert.equal(transformerRegister.transformers.length, 187);
  assert.equal(new Set(transformerRegister.transformers.map((row) => row.designation)).size, 187);
  assert.equal(new Set(transformerRegister.transformers.map((row) => row.station_code)).size, 123);
  assert.deepEqual(
    transformerRegister.transformers
      .filter((row) => row.station_code === "GOU")
      .map((row) => [row.designation, row.type, row.high_kv, row.low_kv, row.size_mva]),
    [["GOU-T2", "distribution", 66, 12.5, 20], ["GOU-T3", "distribution", 66, 12.5, 13.33], ["GOU-T1", "transmission", 66, 33, 10]]
  );
  assert.match(main, /handbook\.substations[\s\S]*data-station-profile/);
  assert.match(main, /transformersByStation/);
  assert.match(main, /planningRecord\?\.sourceId !== "np-2027-transformers"/);
  assert.match(main, /data-station-record/);
  assert.match(html, /id="station-search"/);
  assert.match(html, /id="station-tabs"/);
});

test("Grand Falls record separates the two yards and parallel 25 kV bank", () => {
  const grandFalls = stationProfiles.find((station) => station.code === "GFS");
  assert.ok(grandFalls);
  assert.deepEqual(grandFalls.feederRegister, ["GFS-02", "GFS-06", "GFS-07", "GFS-08", "GFS-10"]);
  const engineeringFacts = grandFalls.engineeringRecord.facts.flat().join(" ");
  const planningFacts = grandFalls.planningRecord.facts.flat().join(" ");
  assert.match(engineeringFacts, /separate 138\/66\/25 kV and 66\/4\.16 kV yards/);
  assert.match(engineeringFacts, /GFS-T3 selected replacement 138\/25 kV; 50 MVA; operated in parallel with GFS-T2/);
  assert.match(engineeringFacts, /101L to Rattling Brook; 130L to Stony Brook; 132L to Bishop's Falls/);
  assert.match(planningFacts, /GFS-T5 66\/4\.2 kV; 11\.17 MVA; 6\.27 MVA 2026 forecast/);
  const ngfHistory = grandFalls.historyRecords.find((record) => record.label.includes("25 KV YARD"));
  assert.match(ngfHistory.facts.flat().join(" "), /2011 to 2012.*air-break switches.*2016 load growth.*50 MVA/);
});

test("Grand Falls renders the 138 kV, 66 kV, 25 kV, and 4.2 kV station functions", () => {
  const grandFalls = stationProfiles.find((station) => station.code === "GFS");
  assert.ok(grandFalls);
  assert.deepEqual(grandFalls.connectedCircuits.map(({ circuit }) => circuit), ["101L", "130L", "132L"]);
  assert.deepEqual(grandFalls.diagram.buses.map(({ voltage }) => voltage), ["138 kV", "66 kV", "25 kV", "4.2 kV"]);
  assert.deepEqual(grandFalls.diagram.transformers.map(({ label, rating }) => [label, rating]), [["GFS-T1", "29.7 MVA"], ["GFS-T2", "20 MVA"], ["GFS-T3", "50 MVA"], ["GFS-T5", "11.17 MVA"]]);
  assert.deepEqual(grandFalls.diagram.circuits.slice(0, 3).map(({ label, destination }) => [label, destination]), [["130L", "Stony Brook"], ["132L", "Bishop's Falls"], ["101L", "Rattling Brook"]]);
  assert.match(grandFalls.engineeringRecord.facts.flat().join(" "), /separate 138\/66\/25 kV and 66\/4\.16 kV yards.*north of the Trans-Canada Highway.*south of the highway/s);
  assert.match(grandFalls.planningRecord.facts.flat().join(" "), /GFS-T5 66\/4\.2 kV; 11\.17 MVA; 6\.27 MVA 2026 forecast/);
});

test("Lewisporte and Rattling Brook retain the completed central 138 kV arrangement", () => {
  const lewisporte = stationProfiles.find((station) => station.code === "LEW");
  const rattlingBrook = stationProfiles.find((station) => station.code === "RBK");
  assert.deepEqual(lewisporte.connectedCircuits.map(({ circuit }) => circuit), ["137L", "147L"]);
  assert.deepEqual(lewisporte.feederRegister, ["LEW-01", "LEW-02", "LEW-03", "LEW-04"]);
  assert.match(lewisporte.engineeringRecord.facts.flat().join(" "), /147L from Cobb's Pond and 137L from Rattling Brook/);
  assert.match(lewisporte.referenceSheets[0].image, /lew-2018-selected-one-line\.svg/);

  assert.deepEqual(rattlingBrook.connectedCircuits.map(({ circuit }) => circuit), ["136L", "137L"]);
  assert.deepEqual(rattlingBrook.feederRegister, ["RBK-01"]);
  const rbkFacts = rattlingBrook.engineeringRecord.facts.flat().join(" ");
  assert.match(rbkFacts, /RBK-T3 15\/20\/25 MVA, 138\/66 kV; installed in 2021/);
  assert.match(rbkFacts, /RBK-T2 5 MVA, 66\/12\.5 kV; supplies RBK-01/);
  assert.match(rattlingBrook.planningRecord.facts.flat().join(" "), /Record difference/);
  assert.match(rattlingBrook.referenceSheets[0].image, /rbk-2018-selected-one-line\.svg/);
});

test("Greenspond separates existing equipment from the proposed modernization", () => {
  const greenspond = stationProfiles.find((station) => station.code === "GPD");
  assert.ok(greenspond);
  assert.deepEqual(greenspond.connectedCircuits.map(({ circuit }) => circuit), ["115L/116L tap"]);
  assert.deepEqual(greenspond.feederRegister, ["GPD-01"]);
  const existingFacts = greenspond.engineeringRecord.facts.flat().join(" ");
  const proposedFacts = greenspond.historyRecords[0].facts.flat().join(" ");
  assert.match(existingFacts, /GPD-T1 66\/12\.5 kV; 2\.8 MVA; Canadian General Electric; manufactured in 1965/);
  assert.match(existingFacts, /one 12\.5 kV feeder serving approximately 260 customers/);
  assert.match(proposedFacts, /retain GPD-T1 and the three voltage regulators/);
  assert.match(proposedFacts, /commissioning planned for the fourth quarter of 2027/);
});

test("Mobile Hydro Plant separates the existing outlet transformer from its proposed replacement", () => {
  const mobilePlant = stationProfiles.find((station) => station.code === "MOP");
  assert.ok(mobilePlant);
  assert.deepEqual(mobilePlant.connectedCircuits.map(({ to_code }) => to_code), ["MOB"]);
  assert.deepEqual(mobilePlant.diagram.generators.map(({ rating }) => rating), ["11 MVA"]);
  const existingFacts = mobilePlant.engineeringRecord.facts.flat().join(" ");
  const planningFacts = mobilePlant.planningRecord.facts.flat().join(" ");
  const historyFacts = mobilePlant.historyRecords.flatMap(({ facts }) => facts).flat().join(" ");
  const proposedFacts = mobilePlant.historyRecords.find(({ label }) => label.includes("PROPOSED REPLACEMENT")).facts.flat().join(" ");
  assert.match(existingFacts, /MOP-T1 66\/6\.9 kV; 10 MVA; Westinghouse; installed at Mobile Plant in 1951/);
  assert.match(planningFacts, /MOP-T1 fleet-table rating 66\/6\.9 kV; 13\.33 MVA/);
  assert.match(historyFacts, /upgrade AC\/DC distribution, protection and control systems and the governor; replace the switchgear/);
  assert.match(historyFacts, /reported all commissioning complete/);
  assert.match(proposedFacts, /10\/13\.3\/16\.7 MVA, 66\/6\.9 kV/);
  assert.match(proposedFacts, /commissioning planned for 2028/);
});

test("Mobile separates the distribution station from the hydro plant outlet", () => {
  const mobile = stationProfiles.find((station) => station.code === "MOB");
  assert.ok(mobile);
  assert.deepEqual(mobile.connectedCircuits.map(({ circuit }) => circuit), ["11L", "20L", "24L", "23L"]);
  assert.deepEqual(mobile.feederRegister, ["MOB-01", "MOB-02"]);
  const existingFacts = mobile.engineeringRecord.facts.flat().join(" ");
  const planningFacts = mobile.planningRecord.facts.flat().join(" ");
  assert.match(existingFacts, /MOB-T2 66\/12\.5 kV; 6\.7 MVA/);
  assert.match(existingFacts, /MOB-T3 66\/33 kV; 4\.6 MVA/);
  assert.match(planningFacts, /MOB-T2 66\/12\.5 kV; 16\.67 MVA; 12\.79 MVA 2026 forecast/);
});

test("Seal Cove keeps the dated distribution-voltage records separate", () => {
  const sealCove = stationProfiles.find((station) => station.code === "SCV");
  assert.ok(sealCove);
  assert.deepEqual(sealCove.connectedCircuits.map(({ circuit }) => circuit), ["38L", "52L"]);
  assert.deepEqual(sealCove.feederRegister, ["SCV-01", "SCV-02"]);
  const existingFacts = sealCove.engineeringRecord.facts.flat().join(" ");
  const planningFacts = sealCove.planningRecord.facts.flat().join(" ");
  assert.match(existingFacts, /SCV-T2 66\/12\.5 kV; 11\.2 MVA/);
  assert.match(existingFacts, /two generators, 4 MVA combined/);
  assert.match(planningFacts, /SCV-T2 66\/25 kV distribution transformer; 11\.2 MVA; 8\.69 MVA 2026 forecast/);
  assert.match(planningFacts, /SCV-T1 66\/4\.2 kV generation transformer; 3\.33 MVA/);
  const history = sealCove.historyRecords.flatMap((record) => record.facts).flat().join(" ");
  assert.match(history, /9\.3 MVA recorded 2009 peak/);
  assert.match(history, /Alternative 1 retained SCV-T2/);
  assert.match(history, /1\.5 km of single-phase line proposed for conversion to three-phase/);
  assert.match(history, /2\.0 km of single-phase line proposed for conversion to three-phase/);
});

test("Harbour Grace separates its 2017 dual-bank arrangement from the current fleet table", () => {
  const harbourGrace = stationProfiles.find((station) => station.code === "HGR");
  assert.ok(harbourGrace);
  assert.deepEqual(harbourGrace.connectedCircuits.map(({ circuit }) => circuit), ["57L", "68L"]);
  assert.deepEqual(harbourGrace.feederRegister, ["HGR-01", "HGR-02", "HGR-03"]);
  const existingFacts = harbourGrace.engineeringRecord.facts.flat().join(" ");
  const planningFacts = harbourGrace.planningRecord.facts.flat().join(" ");
  assert.match(existingFacts, /HGR-T1, 66\/12\.5 kV, 10 MVA; HGR-T2, 66\/12\.5 kV, 6\.7 MVA/);
  assert.match(existingFacts, /57L to Upper Island Cove and 68L to Carbonear/);
  assert.match(planningFacts, /HGR-T1 66\/25 kV; 25 MVA; 9\.54 MVA 2026 forecast/);
});

test("Upper Island Cove links both 57L sections and the filed feeder tie", () => {
  const islandCove = stationProfiles.find((station) => station.code === "ILC");
  assert.ok(islandCove);
  assert.deepEqual(islandCove.connectedCircuits.map(({ circuit }) => circuit), ["57L", "57L"]);
  assert.deepEqual(islandCove.connectedCircuits.map(({ from_code, to_code }) => [from_code, to_code]), [["BRB", "ILC"], ["ILC", "HGR"]]);
  assert.deepEqual(islandCove.feederRegister, ["ILC-01", "ILC-02"]);
  const existingFacts = islandCove.engineeringRecord.facts.flat().join(" ");
  const proposedFacts = islandCove.historyRecords.find(({ label }) => label.includes("PROPOSED ILC-02")).facts.flat().join(" ");
  assert.match(existingFacts, /TD-2018 connects ILC-02 to ILC-01/);
  assert.match(islandCove.planningRecord.facts.flat().join(" "), /ILC-T1 66\/12\.5 kV; 13\.33 MVA; 9\.89 MVA 2026 forecast/);
  assert.match(proposedFacts, /96 A on phase A and 77 A on phase C/);
});

test("Pasadena separates the 2013 expansion plan from the current transformer record", () => {
  const pasadena = stationProfiles.find((station) => station.code === "PAS");
  assert.ok(pasadena);
  assert.deepEqual(pasadena.connectedCircuits.map(({ circuit }) => circuit), ["Deer Lake Power L1"]);
  assert.deepEqual(pasadena.feederRegister, ["PAS-01", "PAS-02"]);
  const existingFacts = pasadena.engineeringRecord.facts.flat().join(" ");
  const proposedFacts = pasadena.historyRecords[0].facts.flat().join(" ");
  assert.match(existingFacts, /PAS-T1 66\/12\.5 kV; 13\.3 MVA/);
  assert.match(existingFacts, /Deer Lake Power L1 supplies the Pasadena and Marble Mountain station transformers/);
  assert.match(pasadena.planningRecord.facts.flat().join(" "), /PAS-T1 66\/12\.5 kV; 13\.30 MVA; 12\.46 MVA 2026 forecast/);
  assert.match(proposedFacts, /scheduled a 15\/20\/25 MVA PAS-T1 replacement for 2021/);
});

test("Marble Mountain preserves the former transformer and filed Humber Valley expansion", () => {
  const marbleMountain = stationProfiles.find((station) => station.code === "MMT");
  assert.ok(marbleMountain);
  assert.deepEqual(marbleMountain.connectedCircuits.map(({ circuit }) => circuit), ["Deer Lake Power L1"]);
  assert.deepEqual(marbleMountain.feederRegister, ["MMT-01"]);
  assert.match(marbleMountain.engineeringRecord.facts.flat().join(" "), /approximately 9 km of 4\/0 AASC/);
  assert.match(marbleMountain.historyRecords[0].facts.flat().join(" "), /structures installed in 1990/);
  assert.match(marbleMountain.historyRecords[1].facts.flat().join(" "), /former MOB-T1, rated 5\/6\.7 MVA/);
  assert.match(marbleMountain.historyRecords[1].facts.flat().join(" "), /extend the main trunk 0\.6 km/);
  assert.match(marbleMountain.historyRecords[2].facts.flat().join(" "), /5\.80 MVA forecast peak; 87% of rating/);
  assert.equal(transformerRegister.transformers.find((record) => record.designation === "MMT-T1").forecast_2026_mva, 5.59);
});

test("Stephenville Crossing remains a documented tap on radial 407L", () => {
  const crossing = stationProfiles.find((station) => station.code === "STX");
  assert.ok(crossing);
  assert.deepEqual(crossing.connectedCircuits.map(({ circuit }) => circuit), ["407L", "407L"]);
  assert.deepEqual(crossing.connectedCircuits.map(({ from_code, to_code }) => [from_code, to_code]), [["STV", "STX"], ["STX", "STG"]]);
  assert.deepEqual(crossing.feederRegister, ["STX-01"]);
  const existingFacts = crossing.engineeringRecord.facts.flat().join(" ");
  assert.match(existingFacts, /66 kV radial line between Stephenville and St\. George's through Stephenville Crossing/);
  assert.match(crossing.planningRecord.facts.flat().join(" "), /STX-T1 66\/12\.5 kV; 6\.67 MVA; 4\.97 MVA 2026 forecast/);
  assert.match(crossing.historyRecords[0].facts.flat().join(" "), /installed in 1977/);
});

test("Boyd's Cove and Gander retain the present corridor before the proposed 138 kV conversion", () => {
  const boydsCove = stationProfiles.find((station) => station.code === "BOY");
  const gander = stationProfiles.find((station) => station.code === "GAN");
  assert.deepEqual(boydsCove.connectedCircuits.map(({ circuit }) => circuit), ["114L", "114L", "TL254"]);
  assert.match(boydsCove.engineeringRecord.facts.flat().join(" "), /114L to Summerford Substation and Newfoundland and Labrador Hydro TL254/);
  assert.match(boydsCove.historyRecords[0].facts.flat().join(" "), /new 138 kV line from Lewisporte to Boyd's Cove/);

  assert.deepEqual(gander.connectedCircuits.map(({ circuit }) => circuit), ["144L", "146L", "108L", "102L"]);
  assert.deepEqual(gander.feederRegister, ["GAN-01", "GAN-02", "GAN-03", "GAN-04"]);
  const ganderFacts = gander.engineeringRecord.facts.flat().join(" ");
  assert.match(ganderFacts, /138\/12\.5 kV; 20 MVA/);
  assert.match(ganderFacts, /16\/21\.3\/26\.67 MVA/);
  const filedArrangement = gander.historyRecords.find((record) => record.label === "2014 FILED STATION ARRANGEMENT");
  assert.match(filedArrangement.facts.flat().join(" "), /three single-phase 69\/6\.9 kV, 1\.667 MVA transformers/);
  assert.match(gander.planningRecord.facts.flat().join(" "), /GAN-T3 66 kV grounding-transformer bank; 3\.5 MVA/);
  const peak = gander.historyRecords.find((record) => record.label === "2010 MEASURED WINTER PEAK");
  assert.match(peak.facts.flat().join(" "), /18\.0 MVA measured peak/);
  const equipment = gander.historyRecords.find((record) => record.label === "MARCH 2014 EQUIPMENT REGISTER");
  assert.match(equipment.facts.flat().join(" "), /GAN-144L-B and GAN-146L-B were minimum-oil/);
  const condition = gander.historyRecords.find((record) => record.label === "2024 GAN-T2 CONDITION ASSESSMENT");
  assert.match(condition.facts.flat().join(" "), /25\/33\.3\/41\.6 MVA/);
  assert.match(condition.facts.flat().join(" "), /arcing and partial discharge/);
  const status = gander.historyRecords.find((record) => record.label === "2026 REPORTED REPLACEMENT STATUS");
  assert.match(status.facts.flat().join(" "), /procured in 2025/);
  const lineRebuild = gander.historyRecords.find((record) => record.label === "2025 146L REBUILD COMPLETED");
  assert.match(lineRebuild.facts.flat().join(" "), /rebuilt line was energized/);
  const conversion = gander.historyRecords.find((record) => record.label === "2026 TO 2027 APPROVED 66 KV REMOVAL");
  assert.match(conversion.facts.flat().join(" "), /remove the 66 kV system from Gander/);
});

test("Gander Bay separates its normal transmission configuration from filed feeder projects", () => {
  const ganderBay = stationProfiles.find((station) => station.code === "GBY");
  assert.ok(ganderBay);
  assert.deepEqual(ganderBay.connectedCircuits.map(({ circuit }) => circuit), ["108L", "114L"]);
  assert.deepEqual(ganderBay.feederRegister, ["GBY-01", "GBY-02", "GBY-03"]);

  const existingFacts = ganderBay.engineeringRecord.facts.flat().join(" ");
  assert.match(existingFacts, /108L from Gander/);
  assert.match(existingFacts, /114L is normally open at the Gander Bay end/);
  assert.match(existingFacts, /approximately 1\.7 km west of Gander Bay/);
  assert.match(ganderBay.planningRecord.facts.flat().join(" "), /66\/25 kV; 13\.33 MVA; 8\.48 MVA 2026 forecast/);

  const gby02 = ganderBay.historyRecords.find((record) => record.label === "2004 TO 2006 FILED GBY-02 REBUILD");
  assert.match(gby02.facts.flat().join(" "), /approximately 886 customers/);
  assert.match(gby02.facts.flat().join(" "), /predominantly #2 ACSR/);
  assert.match(gby02.facts.flat().join(" "), /\$862,695/);

  const equipment = ganderBay.historyRecords.find((record) => record.label === "MARCH 2014 EQUIPMENT REGISTER");
  assert.match(equipment.facts.flat().join(" "), /GBY-T1 asset 200248/);
  assert.match(equipment.facts.flat().join(" "), /GBY-02-VR1 regulator assets 220684, 220685 and 220686/);

  const gby03 = ganderBay.historyRecords.find((record) => record.label === "2018 FILED GBY-03 REBUILD");
  assert.match(gby03.facts.flat().join(" "), /49 km/);
  assert.match(gby03.facts.flat().join(" "), /266 MCM ACSR/);
  const gby03Status = ganderBay.historyRecords.find((record) => record.label === "2019 TO 2020 REPORTED GBY-03 WORK");
  assert.match(gby03Status.facts.flat().join(" "), /carried out in 2019 and 2020/);

  const gby01 = ganderBay.historyRecords.find((record) => record.label === "2027 TO 2028 PROPOSED GBY-01 REFURBISHMENT");
  assert.match(gby01.facts.flat().join(" "), /tie to SUM-02 at Roger's Cove/);
  assert.match(gby01.facts.flat().join(" "), /22 leaning or deteriorated causeway poles/);
  assert.match(gby01.facts.flat().join(" "), /\$1\.36 million/);

  assert.deepEqual(ganderBay.referenceSheets.map(({ image }) => image), [
    "./reference-maps/gby-01-2027-route.png",
    "./reference-maps/gby-02-2005-map-1.png",
    "./reference-maps/gby-02-2005-map-2.png",
    "./reference-maps/gby-02-2005-map-3.png",
    "./reference-maps/gby-03-2018-route.png"
  ]);
});

test("Summerford combines its 66 kV corridor, transformer, equipment, and feeder histories", () => {
  const summerford = stationProfiles.find((station) => station.code === "SUM");
  assert.ok(summerford);
  assert.deepEqual(summerford.connectedCircuits.map(({ circuit }) => circuit), ["114L", "140L"]);
  assert.deepEqual(summerford.feederRegister, ["SUM-01", "SUM-02"]);

  const existingFacts = summerford.engineeringRecord.facts.flat().join(" ");
  assert.match(existingFacts, /114L from Boyd's Cove; 140L to Twillingate/);
  assert.match(existingFacts, /2,421 Newfoundland Power customers/);
  assert.match(summerford.planningRecord.facts.flat().join(" "), /66\/25 kV; 13\.33 MVA; 7\.41 MVA 2026 forecast/);

  const equipment = summerford.historyRecords.find((record) => record.label === "MARCH 2014 EQUIPMENT REGISTER");
  assert.match(equipment.facts.flat().join(" "), /SUM-T1 asset 200264/);
  assert.match(equipment.facts.flat().join(" "), /SUM-140L-B bulk-oil circuit breaker asset 210096/);

  const sum02 = summerford.historyRecords.find((record) => record.label === "2017 TO 2018 FILED SUM-02 REFURBISHMENT");
  assert.match(sum02.facts.flat().join(" "), /replace 29 km of 2\/0 ACSR with 4\/0 AASC/);
  assert.match(sum02.facts.flat().join(" "), /\$1\.798 million/);
  const sum02Status = summerford.historyRecords.find((record) => record.label === "2017 TO 2018 REPORTED SUM-02 WORK");
  assert.match(sum02Status.facts.flat().join(" "), /carried out in 2017 and 2018/);

  const relocation = summerford.historyRecords.find((record) => record.label === "NOVEMBER 2019 APPROVED 114L AND SUM-02 RELOCATION");
  assert.match(relocation.facts.flat().join(" "), /Cottle's Island Lumber/);
  assert.match(relocation.facts.flat().join(" "), /\$309,619 approved/);

  const sum01 = summerford.historyRecords.find((record) => record.label === "2023 TO 2024 FILED SUM-01 REFURBISHMENT");
  assert.match(sum01.facts.flat().join(" "), /1,812 customers/);
  assert.match(sum01.facts.flat().join(" "), /replace 6\.5 km of 2\/0 ACSR with 4\/0 AASC/);
  const sum01Expenditure = summerford.historyRecords.find((record) => record.label === "2025 FINAL SUM-01 CAPITAL EXPENDITURE");
  assert.match(sum01Expenditure.facts.flat().join(" "), /\$1\.681 million through 2025/);

  assert.deepEqual(summerford.referenceSheets.map(({ image }) => image), [
    "./reference-maps/sum-01-2022-route.jpg",
    "./reference-maps/sum-02-2016-route.jpg"
  ]);
});

test("Jonathan's Pond preserves the dated transformer records and proposed retirement state", () => {
  const jonathansPond = stationProfiles.find((station) => station.code === "JON");
  assert.ok(jonathansPond);
  assert.deepEqual(jonathansPond.connectedCircuits.map(({ circuit }) => circuit), ["108L"]);
  assert.deepEqual(jonathansPond.feederRegister, ["JON-01"]);

  const existingFacts = jonathansPond.engineeringRecord.facts.flat().join(" ");
  assert.match(existingFacts, /tap on 108L between Gander and Gander Bay/);
  assert.match(existingFacts, /5 in the 2024 planning study/);
  assert.match(jonathansPond.planningRecord.facts.flat().join(" "), /66\/12\.5 kV; 0\.33 MVA; 0\.10 MVA 2026 forecast/);

  const earlierRegister = jonathansPond.historyRecords.find((record) => record.label === "2025 TRANSFORMER REGISTER");
  assert.match(earlierRegister.facts.flat().join(" "), /66\/7\.2 kV; 0\.33 MVA; 0\.10 MVA 2025 forecast/);
  const refurbishment = jonathansPond.historyRecords.find((record) => record.label === "2022 REPORTED JON-T1 REFURBISHMENT");
  assert.match(refurbishment.facts.flat().join(" "), /asset 200102; refurbishment cost \$57,000/);

  const retirement = jonathansPond.historyRecords.find((record) => record.label === "2027 PROPOSED COB-02 EXTENSION AND STATION RETIREMENT");
  const retirementFacts = retirement.facts.flat().join(" ");
  assert.match(retirementFacts, /approximately 8 km of single-phase line from COB-02/);
  assert.match(retirementFacts, /\$1\.828 million/);
  assert.match(retirementFacts, /construction by end of Q3 2027/);
  assert.match(retirementFacts, /proposed for retirement after the extension is in service/);
  assert.deepEqual(jonathansPond.referenceSheets.map(({ image }) => image), ["./reference-maps/jon-cob02-2027-extension.jpg"]);
});

test("Roycefield remains a 66 kV switching point without an invented transformer", () => {
  const roycefield = stationProfiles.find((station) => station.code === "RFD");
  assert.ok(roycefield);
  assert.deepEqual(roycefield.connectedCircuits.map(({ circuit }) => circuit), ["102L", "104L"]);
  assert.deepEqual(roycefield.feederRegister, []);
  assert.deepEqual(roycefield.diagram.transformers, []);

  const currentFacts = roycefield.engineeringRecord.facts.flat().join(" ");
  assert.match(currentFacts, /fenced yard with 66 kV isolating switch RFD-104L-D/);
  assert.match(currentFacts, /104L runs approximately 40 km/);
  assert.match(currentFacts, /none shown in the filed single-line/);
  assert.match(currentFacts, /no other Newfoundland Power customers/);

  const equipment = roycefield.historyRecords.find((record) => record.label === "MARCH 2014 EQUIPMENT REGISTER");
  assert.match(equipment.facts.flat().join(" "), /SF6 circuit breaker asset 210232/);
  const assetRegister = roycefield.historyRecords.find((record) => record.label === "2022 TRANSMISSION ASSET REGISTER");
  const assetFacts = assetRegister.facts.flat().join(" ");
  assert.match(assetFacts, /102L Gander to Roycefield Tap; common transmission asset; \$2\.689 million/);
  assert.match(assetFacts, /104L Roycefield Tap to Roycefield Mine; fully contributed; \$1\.301 million/);
  assert.deepEqual(roycefield.referenceSheets.map(({ image }) => image), ["./reference-maps/rfd-2023-single-line.png"]);
});

test("Notre Dame Junction stays historical until a completion record establishes removal", () => {
  const notreDameJunction = stationProfiles.find((station) => station.code === "NDJ");
  assert.ok(notreDameJunction);
  assert.equal(notreDameJunction.voltage, "66 kV historical");
  assert.deepEqual(notreDameJunction.connectedCircuits.map(({ circuit }) => circuit), ["102L", "102L", "103L"]);
  assert.deepEqual(notreDameJunction.feederRegister, []);
  assert.deepEqual(notreDameJunction.diagram.transformers, []);

  const existingFacts = notreDameJunction.engineeringRecord.facts.flat().join(" ");
  assert.match(existingFacts, /66 kV junction on 102L/);
  assert.match(existingFacts, /approximately 17 km/);
  assert.match(existingFacts, /approximately 20 km/);
  assert.match(existingFacts, /approximately 14 km/);

  const approvalFacts = notreDameJunction.planningRecord.facts.flat().join(" ");
  assert.match(approvalFacts, /remove 101L and 37 km of 102L/);
  assert.match(approvalFacts, /removal follows completion/);
  assert.doesNotMatch(approvalFacts, /removal completed/);

  const inspection = notreDameJunction.historyRecords.find((record) => record.label === "MARCH 2014 INSPECTION REGISTER");
  assert.match(inspection.facts.flat().join(" "), /battery asset 100343 and charger asset 110085/);
  const successor = notreDameJunction.historyRecords.find((record) => record.label === "2025 FILED SUCCESSOR CONNECTIONS");
  assert.match(successor.facts.flat().join(" "), /137L from Rattling Brook and 147L from Cobb's Pond/);
  assert.deepEqual(notreDameJunction.referenceSheets.map(({ image }) => image), ["./reference-maps/ndj-2018-central-system.png"]);
});

test("Glenwood separates the installed TL210 station from the studied 147L tap", () => {
  const glenwood = stationProfiles.find((station) => station.code === "GLN");
  assert.ok(glenwood);
  assert.equal(glenwood.voltage, "138/25 kV");
  assert.deepEqual(glenwood.connectedCircuits.map(({ circuit }) => circuit), ["TL210", "TL210"]);
  assert.deepEqual(glenwood.connectedCircuits.map(({ from_code, to_code }) => [from_code, to_code]), [["STB", "GLN"], ["GLN", "COB"]]);
  assert.deepEqual(glenwood.feederRegister, ["GLN-01"]);
  assert.doesNotMatch(glenwood.connectedCircuits.map(({ circuit }) => circuit).join(" "), /147L/);

  const existingFacts = glenwood.engineeringRecord.facts.flat().join(" ");
  assert.match(existingFacts, /built in 1968/);
  assert.match(existingFacts, /138\/25 kV; 8\.3 MVA/);
  assert.match(existingFacts, /GLN-01; 707 customers/);
  assert.match(glenwood.planningRecord.facts.flat().join(" "), /8\.34 MVA; 3\.82 MVA 2026 forecast/);

  const completion = glenwood.historyRecords.find((record) => record.label === "Q3 2013 REPORTED COMPLETION");
  assert.equal(completion.sourceId, "np-2013-q3-report");
  assert.match(completion.facts.flat().join(" "), /construction complete in the third quarter of 2013/);

  const study = glenwood.historyRecords.find((record) => record.label === "2026 CENTRAL LOOP STUDY");
  const studyFacts = study.facts.flat().join(" ");
  assert.match(studyFacts, /1 km tap from 147L/);
  assert.match(studyFacts, /not required to maintain voltage levels/);
  assert.deepEqual(glenwood.referenceSheets.map(({ image }) => image), ["./reference-maps/gln-2026-study-area.png"]);
});

test("Cape Broyle records generation, distribution, and dated voltage evidence without flattening the source conflict", () => {
  const capeBroyle = stationProfiles.find((station) => station.code === "CAB");
  assert.ok(capeBroyle);
  assert.deepEqual(capeBroyle.connectedCircuits.map(({ circuit }) => circuit), ["20L", "66L"]);
  assert.deepEqual(capeBroyle.connectedCircuits.map(({ from_code, to_code }) => [from_code, to_code]), [["MOB", "CAB"], ["CAB", "FER"]]);
  assert.deepEqual(capeBroyle.feederRegister, ["CAB-01"]);
  assert.deepEqual(capeBroyle.diagram.transformers.map(({ label, rating }) => [label, rating]), [["CAB-T2", "6.67 MVA"], ["CAB-T1", "11.25 MVA"]]);

  const arrangement = capeBroyle.engineeringRecord.facts.flat().join(" ");
  assert.match(arrangement, /6\.9 kV from the Cape Broyle plant stepped up to 66 kV/);
  assert.match(arrangement, /66 kV stepped down to 12\.5 kV/);
  assert.match(arrangement, /CAB-01 sole 12\.5 kV feeder; 13\.4 km main trunk; 1,247 customers/);

  const fleet = capeBroyle.planningRecord.facts.flat().join(" ");
  assert.match(fleet, /CAB-T1 generation; 66\/7\.2 kV; 11\.25 MVA/);
  assert.match(fleet, /CAB-T2 distribution; 66\/25 kV; 6\.67 MVA; 3\.83 MVA 2026 forecast/);
  assert.match(fleet, /Published voltage difference/);

  const completion = capeBroyle.historyRecords.find((record) => record.label === "Q4 2008 REPORTED PLANT AND STATION COMPLETION");
  assert.match(completion.facts.flat().join(" "), /20L rebuild between Mobile and Cape Broyle completed/);
  const inspection = capeBroyle.historyRecords.find((record) => record.label === "MARCH 2014 INSPECTION REGISTER");
  assert.match(inspection.facts.flat().join(" "), /CAB-66L-B bulk-oil breaker 210150.*CAB-T2 asset 200290/);
  assert.deepEqual(capeBroyle.referenceSheets.map(({ image }) => image), ["./reference-maps/cab-01-2027-refurbishment.png"]);
});

test("Fermeuse separates the Newfoundland Power station from the seller and Hydro wind equipment", () => {
  const fermeuse = stationProfiles.find((station) => station.code === "FER");
  assert.ok(fermeuse);
  assert.deepEqual(fermeuse.connectedCircuits.map(({ circuit }) => circuit), ["66L", "902E"]);
  assert.deepEqual(fermeuse.feederRegister, ["FER-01"]);
  assert.deepEqual(fermeuse.diagram.transformers, [{ label: "FER-T1", rating: "4 MVA", from: "b1", to: "b2" }]);
  assert.match(fermeuse.engineeringRecord.facts.flat().join(" "), /built in 1976.*radial 66L from Cape Broyle.*66\/12\.5 kV; 4 MVA/s);
  assert.match(fermeuse.planningRecord.facts.flat().join(" "), /2\.2 MVA 2026 forecast/);

  const completion = fermeuse.historyRecords.find((record) => record.label === "Q4 2008 REPORTED WIND-INTERCONNECTION COMPLETION");
  assert.match(completion.facts.flat().join(" "), /station modifications.*completed/);
  const inspection = fermeuse.historyRecords.find((record) => record.label === "MARCH 2014 INSPECTION REGISTER");
  assert.match(inspection.facts.flat().join(" "), /FER-902E-B SF6 breaker 210691/);

  const boundary = fermeuse.historyRecords.find((record) => record.label === "2009 WIND PROJECT IN SERVICE / 2026 REPUBLISHED AGREEMENT");
  const boundaryFacts = boundary.facts.flat().join(" ");
  assert.match(boundaryFacts, /June 30, 2009/);
  assert.match(boundaryFacts, /Newfoundland Power equipment station extension, 66 kV steel bus, breaker, revenue CTs/);
  assert.match(boundaryFacts, /Seller equipment three-phase 66 kV line from FER-902E-DL/);
  assert.match(boundaryFacts, /Hydro equipment export bidirectional metering/);
});

test("Broad Cove keeps the 2021 station arrangement separate from the 2027 voltage record", () => {
  const broadCove = stationProfiles.find((station) => station.code === "BCV");
  assert.ok(broadCove);
  assert.deepEqual(broadCove.connectedCircuits.map(({ circuit }) => circuit), ["5L"]);
  assert.deepEqual(broadCove.feederRegister, ["BCV-01", "BCV-02", "BCV-03", "BCV-04"]);
  assert.deepEqual(broadCove.diagram.transformers, [{ label: "BCV-T1", rating: "25 MVA", from: "b1", to: "b2" }]);
  assert.equal(broadCove.diagram.buses[1].voltage, "12.5 kV");

  const stationFacts = broadCove.engineeringRecord.facts.flat().join(" ");
  assert.match(stationFacts, /Belbin's Road and Pendergast Road/);
  assert.match(stationFacts, /BCV-T1 25 MVA; 66\/12\.5 kV/);
  assert.match(stationFacts, /BCV-02 1,580 customers; includes Bell Island through a submarine cable/);

  const currentFacts = broadCove.planningRecord.facts.flat().join(" ");
  assert.match(currentFacts, /66\/25 kV; 25 MVA; 19\.79 MVA 2026 forecast/);
  assert.match(currentFacts, /Published voltage difference/);
  const proposedT2 = broadCove.historyRecords.find((record) => record.label === "2021 PROPOSED BCV-T2");
  assert.match(proposedT2.facts.flat().join(" "), /add 25 MVA, 66\/12\.5 kV BCV-T2 in parallel with BCV-T1/);
  assert.doesNotMatch(broadCove.diagram.transformers.map(({ label }) => label).join(" "), /BCV-T2/);
  const deferral = broadCove.historyRecords.find((record) => record.label === "2023 MODERNIZATION DEFERRAL");
  assert.match(deferral.facts.flat().join(" "), /deferred from 2023 for further engineering assessment/);
});

test("Chamberlains records the second bank, T1 replacement, CHA-04, and current transformer values", () => {
  const chamberlains = stationProfiles.find((station) => station.code === "CHA");
  assert.ok(chamberlains);
  assert.deepEqual(chamberlains.connectedCircuits.map(({ circuit }) => circuit), ["49L", "51L", "79L"]);
  assert.deepEqual(chamberlains.feederRegister, ["CHA-01", "CHA-02", "CHA-03", "CHA-04"]);
  assert.deepEqual(chamberlains.diagram.transformers.map(({ label, rating }) => [label, rating]), [["CHA-T1", "50 MVA"], ["CHA-T2", "25 MVA"]]);

  const existing = chamberlains.engineeringRecord.facts.flat().join(" ");
  assert.match(existing, /built in 1975/);
  assert.match(existing, /three 66 kV lines/);
  assert.match(existing, /CHA-T1 and CHA-T2 were each 25 MVA at 66\/25 kV/);

  const secondBank = chamberlains.historyRecords.find((record) => record.label === "2003 PROPOSED SECOND TRANSFORMER");
  assert.match(secondBank.facts.flat().join(" "), /peak load exceeded its nameplate rating.*second 25 MVA, 66\/25 kV transformer/s);
  const capacity = chamberlains.historyRecords.find((record) => record.label === "2017 PROPOSED CAPACITY AND FEEDER WORK");
  const capacityFacts = capacity.facts.flat().join(" ");
  assert.match(capacityFacts, /increase from 49\.3 MVA to 74\.4 MVA/);
  assert.match(capacityFacts, /0\.35 km of new 477 ASC trunk and 3\.00 km upgraded to three-phase 477 ASC/);

  const current = chamberlains.planningRecord.facts.flat().join(" ");
  assert.match(current, /CHA-T1 66\/25 kV; 50 MVA; 35\.34 MVA 2026 forecast/);
  assert.match(current, /CHA-T2 66\/25 kV; 25 MVA; 17\.02 MVA 2026 forecast/);
  const feederWork = chamberlains.historyRecords.find((record) => record.label === "2027 PROPOSED CHA-04 UPGRADE");
  assert.match(feederWork.facts.flat().join(" "), /93 A peak in 2025.*up to 163 A in 2027.*single-phase to three-phase/s);
  assert.deepEqual(chamberlains.referenceSheets.map(({ image }) => image), ["./reference-maps/cha-04-2027-route.jpeg"]);
});

test("Big Pond separates the current station record from historic capacity and 24L work", () => {
  const bigPond = stationProfiles.find((station) => station.code === "BIG");
  assert.ok(bigPond);
  assert.deepEqual(bigPond.connectedCircuits.map(({ circuit }) => circuit), ["17L", "24L"]);
  assert.deepEqual(bigPond.feederRegister, ["BIG-01", "BIG-02"]);
  assert.deepEqual(bigPond.diagram.transformers, [{ label: "BIG-T1", rating: "11.11 MVA", from: "b1", to: "b2" }]);

  const current = bigPond.engineeringRecord.facts.flat().join(" ");
  assert.match(current, /two customers; one served under Rate 2\.4/);
  assert.match(current, /BIG-02 approximately 1,300 customers/);
  assert.match(current, /Bay Bulls Big Pond Water Treatment Facility/);

  const cooling = bigPond.historyRecords.find((record) => record.label === "2006 PROPOSED TRANSFORMER COOLING ADDITION");
  assert.match(cooling.facts.flat().join(" "), /8\.4 MVA at 66\/12\.5 kV.*increase.*11\.2 MVA.*Della Drive/s);
  const loading = bigPond.historyRecords.find((record) => record.label === "2014/15 REPORTED TRANSFORMER LOAD");
  assert.match(loading.facts.flat().join(" "), /9\.08 MVA 2013\/14 forecast; 82 percent/);
  const line = bigPond.historyRecords.find((record) => record.label === "2010 PROPOSED 24L REBUILD");
  assert.match(line.facts.flat().join(" "), /20 km radial 66 kV.*7\.7 km.*69 MW/s);
});

test("Bayview records the two-bank station, fifth feeder, modernization, and route drawings", () => {
  const bayview = stationProfiles.find((station) => station.code === "BVS");
  assert.ok(bayview);
  assert.deepEqual(bayview.connectedCircuits.map(({ circuit }) => circuit), ["357L", "358L", "359L"]);
  assert.deepEqual(bayview.feederRegister, ["BVS-01", "BVS-02", "BVS-03", "BVS-04", "BVS-05"]);
  assert.deepEqual(bayview.diagram.transformers.map(({ label, rating }) => [label, rating]), [["BVS-T1", "20 MVA"], ["BVS-T2", "15 MVA"]]);

  const existing = bayview.engineeringRecord.facts.flat().join(" ");
  assert.match(existing, /built in 1971/);
  assert.match(existing, /BVS-T1 66\/12\.5 kV; 20 MVA; installed in 1976/);
  assert.match(existing, /BVS-T2 66\/12\.5 kV; 15 MVA; installed in 1969/);

  const relocation = bayview.historyRecords.find((record) => record.label === "2004 BVS-T2 RELOCATION");
  assert.match(relocation.facts.flat().join(" "), /unit 200145 relocated from Walbournes.*increased from 20 MVA to 35 MVA/s);
  const bvs05 = bayview.historyRecords.find((record) => record.label === "2016 PROPOSED BVS-05 ADDITION");
  assert.match(bvs05.facts.flat().join(" "), /transfer 2\.5 MVA.*construct 1\.0 km.*convert 1\.4 km.*3\.6 km/s);
  const modernization = bayview.historyRecords.find((record) => record.label === "2018 PROPOSED STATION MODERNIZATION");
  assert.match(modernization.facts.flat().join(" "), /six 66 kV side-break switches.*18 electromechanical relays/s);
  const bvs04 = bayview.historyRecords.find((record) => record.label === "2024 PROPOSED BVS-04 REFURBISHMENT");
  assert.match(bvs04.facts.flat().join(" "), /320 customers in 2008 and 478 in 2022.*125 A.*11\.0 km/s);
  assert.deepEqual(bayview.referenceSheets.map(({ image }) => image), ["./reference-maps/bvs-05-2016-feeder.jpeg", "./reference-maps/bvs-04-2024-route.jpeg"]);
});

test("Abrahams Cove records both 410L sections and the Lower Cove supply boundary", () => {
  const abrahamsCove = stationProfiles.find((station) => station.code === "ABC");
  assert.ok(abrahamsCove);
  assert.deepEqual(abrahamsCove.connectedCircuits.map(({ circuit }) => circuit), ["410L", "410L"]);
  assert.deepEqual(abrahamsCove.feederRegister, ["ABC-01", "ABC-02"]);
  assert.deepEqual(abrahamsCove.diagram.transformers, [{ label: "ABC-T1", rating: "13.33 MVA", from: "b1", to: "b2" }]);

  const supply = abrahamsCove.engineeringRecord.facts.flat().join(" ");
  assert.match(supply, /18\.7 km from Berry Head.*8\.9 km.*Lower Cove Mine/s);
  assert.match(supply, /approximately 1,800.*radial transmission system with no backup generation/s);
  const assignment = abrahamsCove.assignmentRecord.facts.flat().join(" ");
  assert.match(assignment, /ABC-01.*Rate 2\.4.*3\.6 km extension.*8\.9 km extension/s);
  const structure = abrahamsCove.historyRecords.find((record) => record.label === "1977 STRUCTURE RECORD");
  assert.match(structure.facts.flat().join(" "), /13\.3 MVA.*wood; installed in 1977; 66 kV.*wood; installed in 1977; 12\.47 kV/s);
});

test("Garnish records the 2009 main-line rebuild without inventing a high-voltage bus", () => {
  const garnish = stationProfiles.find((station) => station.code === "GAR");
  assert.ok(garnish);
  assert.deepEqual(garnish.connectedCircuits.map(({ circuit }) => circuit), ["301L"]);
  assert.deepEqual(garnish.feederRegister, ["GAR-01"]);
  assert.equal(garnish.diagram.buses[0].label, "301L tap point");
  assert.deepEqual(garnish.diagram.transformers, [{ label: "GAR-T1", rating: "3.72 MVA", from: "b1", to: "b2" }]);

  const rebuilt = garnish.engineeringRecord.facts.flat().join(" ");
  assert.match(rebuilt, /new station constructed in 2009.*no high-voltage bus/s);
  assert.match(rebuilt, /former 1\.6 km Garnish tap.*replacement station was constructed in the main line/s);
  assert.match(rebuilt, /existing transformer retained; all other station equipment replaced/);
  const proposed = garnish.historyRecords.find((record) => record.label === "2007 PROPOSED STATION REPLACEMENT");
  assert.match(proposed.facts.flat().join(" "), /approximately 430 customers.*Highway 210.*\$374,000/s);
  assert.match(garnish.assignmentRecord.facts.flat().join(" "), /66 kV loop.*Greenhill.*Webbers Cove/);
});

test("Blaketown combines documented circuits with the current transformer record", () => {
  const blaketown = stationProfiles.find((station) => station.code === "BLK");
  assert.ok(blaketown);
  assert.deepEqual(blaketown.connectedCircuits.map(({ circuit }) => circuit), ["48L", "64L", "55L", "80L", "86L", "94L"]);
  assert.deepEqual(blaketown.feederRegister, ["BLK-01", "BLK-02"]);
  const existingFacts = blaketown.engineeringRecord.facts.flat().join(" ");
  const proposedFacts = blaketown.historyRecords[0].facts.flat().join(" ");
  assert.match(existingFacts, /BLK-T3 138\/66 kV; 25\/33\.3\/41\.6 MVA; Westinghouse/);
  assert.match(existingFacts, /BLK-T2 tap changer faulted in 2021/);
  assert.match(blaketown.planningRecord.facts.flat().join(" "), /BLK-T2 138\/25 kV; 20 MVA; 16\.21 MVA 2026 forecast/);
  assert.match(proposedFacts, /retain BLK-T2 and BLK-T3; repair the BLK-T2 tap changer/);
  assert.match(proposedFacts, /commissioning planned for 2028/);
});

test("Laurentian retains its three 66 kV connections and proposed transformer replacement", () => {
  const laurentian = stationProfiles.find((station) => station.code === "LAU");
  assert.ok(laurentian);
  assert.deepEqual(laurentian.connectedCircuits.map(({ circuit }) => circuit), ["302L", "305L", "901E"]);
  assert.deepEqual(laurentian.feederRegister, ["LAU-01", "LAU-02"]);
  const existingFacts = laurentian.engineeringRecord.facts.flat().join(" ");
  const proposedFacts = laurentian.historyRecords[0].facts.flat().join(" ");
  assert.match(existingFacts, /LAU-T1 66\/12\.5 kV; 13\.3 MVA; Federal Pioneer; installed in 1976/);
  assert.match(existingFacts, /Newind 901E to Ryan's Hill Substation and the wind generation site/);
  assert.match(laurentian.planningRecord.facts.flat().join(" "), /6\.73 MVA 2026 forecast/);
  assert.match(proposedFacts, /10\/13\.3\/16\.6 MVA, 66\/12\.5\/25 kV/);
  assert.match(proposedFacts, /commissioning planned for 2028/);
});

test("Lookout Brook retains both hydro units and the documented transformer rating difference", () => {
  const lookoutBrook = stationProfiles.find((station) => station.code === "LBK");
  assert.ok(lookoutBrook);
  assert.deepEqual(lookoutBrook.connectedCircuits.map(({ circuit }) => circuit), ["403L", "403L Tap"]);
  assert.deepEqual(lookoutBrook.diagram.generators.map(({ label, rating }) => [label, rating]), [["G3", "3 MVA"], ["G4", "2.889 MVA"]]);
  const existingFacts = lookoutBrook.engineeringRecord.facts.flat().join(" ");
  const planningFacts = lookoutBrook.planningRecord.facts.flat().join(" ");
  const historyFacts = lookoutBrook.historyRecords.flatMap(({ facts }) => facts).flat().join(" ");
  const proposedFacts = lookoutBrook.historyRecords.find(({ label }) => label.includes("PROPOSED REPLACEMENT")).facts.flat().join(" ");
  assert.match(existingFacts, /installed at Lookout Brook in 1997 after relocation from Grand Falls/);
  assert.match(planningFacts, /LBK-T1 fleet-table rating 66\/2\.4 kV; 10 MVA/);
  assert.match(planningFacts, /station-specific report describes the installed transformer as 7\.5 MVA/);
  assert.match(historyFacts, /rewind the stator, rotor and exciter/);
  assert.match(historyFacts, /reported the Lookout Brook refurbishment complete/);
  assert.match(proposedFacts, /5\/6\.7\/8\.3 MVA, 66\/2\.4 kV/);
  assert.match(proposedFacts, /commissioning planned for 2029/);
});

test("Harmon retains both 66 kV supplies and the documented transformer rating difference", () => {
  const harmon = stationProfiles.find((station) => station.code === "HAR");
  assert.ok(harmon);
  assert.deepEqual(harmon.connectedCircuits.map(({ circuit }) => circuit), ["405L", "406L"]);
  assert.deepEqual(harmon.feederRegister, ["HAR-01", "HAR-02"]);
  assert.deepEqual(harmon.mapPages, [["HAR-01", 71], ["HAR-02", 72]]);
  const existingFacts = harmon.engineeringRecord.facts.flat().join(" ");
  const planningFacts = harmon.planningRecord.facts.flat().join(" ");
  const proposedFacts = harmon.historyRecords[0].facts.flat().join(" ");
  assert.match(existingFacts, /HAR-T1 66\/12\.5 kV; 11\.125 MVA station-specific rating/);
  assert.match(planningFacts, /HAR-T1 fleet-table rating 66\/12\.5 kV; 14\.9 MVA; 12\.84 MVA 2026 forecast/);
  assert.match(proposedFacts, /15\/20\/25 MVA, 66\/12\.5\/25 kV/);
  assert.match(proposedFacts, /15\.9 MVA maximum peak-load forecast over ten years/);
  assert.match(proposedFacts, /commissioning planned for 2029/);
});

test("Dunville separates its documented 2020 layout from the later 25 MVA transformer record", () => {
  const dunville = stationProfiles.find((station) => station.code === "DUN");
  assert.ok(dunville);
  assert.deepEqual(dunville.connectedCircuits.map(({ circuit }) => circuit), ["55L", "55L"]);
  assert.deepEqual(dunville.feederRegister, ["DUN-01", "DUN-02"]);
  assert.deepEqual(dunville.diagram.transformers.map(({ label, rating }) => [label, rating]), [["DUN-T1", "25 MVA"]]);
  const existingFacts = dunville.engineeringRecord.facts.flat().join(" ");
  const planningFacts = dunville.planningRecord.facts.flat().join(" ");
  const historyFacts = dunville.historyRecords.flatMap(({ facts }) => facts).flat().join(" ");
  assert.match(existingFacts, /DUN-T1 in 2020 66\/25 kV; 8\.3 MVA/);
  assert.match(existingFacts, /7\.6 MVA in 2009 and 8\.6 MVA in 2018; 8\.8 MVA forecast for 2021/);
  assert.match(planningFacts, /DUN-T1 66\/25 kV; 25 MVA; 7\.98 MVA 2026 forecast/);
  assert.match(historyFacts, /former 25 MVA Lewisporte transformer LEW-T1/);
  assert.match(historyFacts, /773 days.*transformer rewind/);
  assert.match(historyFacts, /divide 55L into 55L from Blaketown to Dunville and new 50L from Dunville to Clarkes Pond/);
});

test("Clarkes Pond retains the documented parallel transformer bank and three feeders", () => {
  const clarkesPond = stationProfiles.find((station) => station.code === "CLK");
  assert.ok(clarkesPond);
  assert.deepEqual(clarkesPond.connectedCircuits.map(({ circuit }) => circuit), ["55L"]);
  assert.deepEqual(clarkesPond.feederRegister, ["CLK-02", "CLK-03", "CLK-04"]);
  assert.deepEqual(clarkesPond.diagram.transformers.map(({ label, rating }) => [label, rating]), [["CLK-T1", "10 MVA"], ["CLK-T2", "10 MVA"]]);
  const existingFacts = clarkesPond.engineeringRecord.facts.flat().join(" ");
  const planningFacts = clarkesPond.planningRecord.facts.flat().join(" ");
  assert.match(existingFacts, /operated in parallel with CLK-T2/);
  assert.match(existingFacts, /approximately 750 customers in Placentia/);
  assert.match(planningFacts, /CLK-T1 66\/12\.5 kV; 10 MVA; 5\.21 MVA 2026 forecast/);
  assert.match(planningFacts, /CLK-T2 66\/12\.5 kV; 10 MVA; 5\.53 MVA 2026 forecast/);
});

test("Walbournes combines its filed equipment record with the project completion report", () => {
  const walbournes = stationProfiles.find((station) => station.code === "WAL");
  assert.ok(walbournes);
  assert.deepEqual(walbournes.connectedCircuits.map(({ circuit }) => circuit), ["351L", "352L", "353L"]);
  assert.deepEqual(walbournes.feederRegister, ["WAL-01", "WAL-02", "WAL-04", "WAL-05", "WAL-06", "WAL-07"]);
  assert.deepEqual(walbournes.mapPages, [["WAL-01", 163], ["WAL-02", 164], ["WAL-04", 165], ["WAL-05", 166]]);
  const existingFacts = walbournes.engineeringRecord.facts.flat().join(" ");
  const planningFacts = walbournes.planningRecord.facts.flat().join(" ");
  const historyFacts = walbournes.historyRecords.flatMap(({ facts }) => facts).flat().join(" ");
  assert.match(existingFacts, /WAL-T1 66\/12\.5 kV; 20 MVA; Westinghouse; manufactured in 1976/);
  assert.match(existingFacts, /prevented parallel operation of WAL-T1 and WAL-T2/);
  assert.match(planningFacts, /WAL-T1 66\/12\.5 kV; 20 MVA; 20\.74 MVA 2026 forecast/);
  assert.match(historyFacts, /replace the 1965 switchgear with an outdoor steel bus/);
  assert.match(historyFacts, /reported the Walbournes refurbishment and modernization complete/);
});

test("Frenchman's Cove retains its radial supply and dated transformer records", () => {
  const frenchmansCove = stationProfiles.find((station) => station.code === "FRN");
  assert.ok(frenchmansCove);
  assert.deepEqual(frenchmansCove.connectedCircuits.map((record) => [record.circuit, record.from_code, record.to_code]), [
    ["353L", "WAL", "FRN"]
  ]);
  assert.deepEqual(frenchmansCove.feederRegister, ["FRN-01", "FRN-02"]);
  assert.match(frenchmansCove.engineeringRecord.facts.flat().join(" "), /approximately 1,400/);
  assert.match(frenchmansCove.historyRecords[0].facts.flat().join(" "), /wood 66 kV and 12\.47 kV structures installed in 1977/);
  assert.match(frenchmansCove.historyRecords[1].facts.flat().join(" "), /insufficient electrical-equipment clearances/);
  assert.match(frenchmansCove.historyRecords[3].facts.flat().join(" "), /6\.34 MVA forecast peak; 95% of rating/);
  assert.match(frenchmansCove.historyRecords[5].facts.flat().join(" "), /more than 800 customers/);
  assert.equal(transformerRegister.transformers.find((record) => record.designation === "FRN-T1").forecast_2026_mva, 4.92);
});

test("Gillams retains its radial supply and dated loading records", () => {
  const gillams = stationProfiles.find((station) => station.code === "GIL");
  assert.ok(gillams);
  assert.deepEqual(gillams.connectedCircuits.map((record) => [record.circuit, record.from_code, record.to_code]), [
    ["358L", "BVS", "GIL"]
  ]);
  assert.deepEqual(gillams.feederRegister, ["GIL-01", "GIL-02"]);
  assert.match(gillams.engineeringRecord.facts.flat().join(" "), /two 12 kV feeders serving approximately 1,400 customers/);
  assert.match(gillams.historyRecords[3].facts.flat().join(" "), /replace significantly rusted radiators/);
  assert.match(gillams.historyRecords[4].facts.flat().join(" "), /GIL-01-R and GIL-02-R reclosers replaced/);
  assert.match(gillams.historyRecords[5].facts.flat().join(" "), /4\.55 MVA forecast peak; 68% of rating/);
  assert.match(gillams.historyRecords[6].facts.flat().join(" "), /6\.4 MVA forecast peak; 95\.52% of rating/);
  assert.equal(transformerRegister.transformers.find((record) => record.designation === "GIL-T1").forecast_2026_mva, 7.11);
});

test("Gambo retains both voltage transformations and the completed 2024 modernization", () => {
  const gambo = stationProfiles.find((station) => station.code === "GAM");
  assert.ok(gambo);
  assert.deepEqual(gambo.connectedCircuits.map(({ circuit }) => circuit), ["121L", "146L", "115L"]);
  assert.deepEqual(gambo.feederRegister, ["GAM-01", "GAM-02"]);
  assert.deepEqual(gambo.diagram.transformers.map(({ label, rating }) => [label, rating]), [["GAM-T1", "6.67 MVA"], ["GAM-T2", "41.6 MVA"]]);
  const existingFacts = gambo.engineeringRecord.facts.flat().join(" ");
  const planningFacts = gambo.planningRecord.facts.flat().join(" ");
  const historyFacts = gambo.historyRecords.flatMap(({ facts }) => facts).flat().join(" ");
  assert.match(existingFacts, /GAM-T1 138\/12\.5\/25 kV; 6\.67 MVA/);
  assert.match(existingFacts, /GAM-T2 138\/66 kV; 41\.6 MVA/);
  assert.match(existingFacts, /radial 66 kV supply to Hare Bay, Trinity, Greenspond, and Wesleyville/);
  assert.match(planningFacts, /GAM-T1 138\/25 kV operating record; 6\.67 MVA; 6\.42 MVA 2026 forecast/);
  assert.match(historyFacts, /add tie-breaker B1\/B2-B/);
  assert.match(historyFacts, /commissioning complete in the fourth quarter of 2024/);
});

test("Terra Nova retains its 124L tap, voltage distinction, and completed line rebuild", () => {
  const terraNova = stationProfiles.find((station) => station.code === "TNS");
  assert.ok(terraNova);
  assert.deepEqual(terraNova.connectedCircuits.map(({ circuit, from_code, to_code }) => [circuit, from_code, to_code]), [
    ["124L tap", null, "TNS"]
  ]);
  assert.deepEqual(terraNova.feederRegister, ["TNS-01"]);
  assert.deepEqual(terraNova.diagram.buses.map(({ voltage }) => voltage), ["138 kV", "25 kV"]);
  assert.deepEqual(terraNova.diagram.transformers.map(({ label, rating }) => [label, rating]), [["TNS-T1", "1.0 MVA"]]);
  const feederFacts = terraNova.engineeringRecord.facts.flat().join(" ");
  const planningFacts = terraNova.planningRecord.facts.flat().join(" ");
  const historyFacts = terraNova.historyRecords.flatMap(({ facts }) => facts).flat().join(" ");
  assert.match(feederFacts, /TNS-01 at 25 kV/);
  assert.match(feederFacts, /0\.6 MVA; 8\.3% of planning capacity/);
  assert.match(planningFacts, /138\/14\.4 kV; 1\.00 MVA; 0\.91 MVA 2026 forecast/);
  assert.match(historyFacts, /wood 138 kV and 14\.4 kV structures installed in 1973/);
  assert.match(historyFacts, /Transmission Line 124L rebuild was completed in 2022/);
  assert.equal(transformerRegister.transformers.find((record) => record.designation === "TNS-T1").forecast_2026_mva, 0.91);
});

test("Trepassey retains its radial supply, sole feeder, conductor record, and Cape Race change", () => {
  const trepassey = stationProfiles.find((station) => station.code === "TRP");
  assert.ok(trepassey);
  assert.deepEqual(trepassey.connectedCircuits.map(({ circuit, from_code, to_code }) => [circuit, from_code, to_code]), [
    ["95L", "RVH", "TRP"]
  ]);
  assert.deepEqual(trepassey.feederRegister, ["TRP-01"]);
  assert.deepEqual(trepassey.diagram.buses.map(({ voltage }) => voltage), ["66 kV", "12.5 kV"]);
  assert.deepEqual(trepassey.diagram.transformers.map(({ label, rating }) => [label, rating]), [["TRP-T1", "15 MVA"]]);
  const feederFacts = trepassey.engineeringRecord.facts.flat().join(" ");
  const planningFacts = trepassey.planningRecord.facts.flat().join(" ");
  const historyFacts = trepassey.historyRecords.flatMap(({ facts }) => facts).flat().join(" ");
  assert.match(feederFacts, /only feeder originating at Trepassey/);
  assert.match(feederFacts, /4 km west of Trepassey using #4\/0 AASC/);
  assert.match(feederFacts, /17 km three-phase cross-country section/);
  assert.match(planningFacts, /66\/12\.5 kV; 15 MVA; 2\.49 MVA 2026 forecast/);
  assert.match(historyFacts, /wood 66 kV and 12\.47 kV structures installed before 1972/);
  assert.match(historyFacts, /reduce 14 km of TRP-01 from three-phase to single-phase and dismantle 2 km/);
  assert.match(historyFacts, /filed rebuild expenditures in 2026, 2027, and 2028/);
  assert.equal(trepassey.referenceSheets[0].pages, "physical PDF p. 335");
  assert.equal(transformerRegister.transformers.find((record) => record.designation === "TRP-T1").forecast_2026_mva, 2.49);
});

test("Riverhead retains the filed 94L and 95L topology, replacement transformer, and RVH-02 record", () => {
  const riverhead = stationProfiles.find((station) => station.code === "RVH");
  assert.ok(riverhead);
  assert.deepEqual(riverhead.connectedCircuits.map(({ circuit, from_code, to_code }) => [circuit, from_code, to_code]), [
    ["94L", "SCT", "RVH"],
    ["95L", "RVH", "TRP"]
  ]);
  assert.deepEqual(riverhead.feederRegister, ["RVH-01", "RVH-02"]);
  assert.deepEqual(riverhead.diagram.buses.map(({ voltage }) => voltage), ["66 kV", "12.5 kV"]);
  assert.deepEqual(riverhead.diagram.transformers.map(({ label, rating }) => [label, rating]), [["RVH-T1", "8.33 MVA"]]);
  const existingFacts = riverhead.engineeringRecord.facts.flat().join(" ");
  const planningFacts = riverhead.planningRecord.facts.flat().join(" ");
  const historyFacts = riverhead.historyRecords.flatMap(({ facts }) => facts).flat().join(" ");
  assert.match(existingFacts, /94L toward St\. Catherines and 95L toward Trepassey/);
  assert.match(existingFacts, /12\.5 kV main bus with a transfer bus/);
  assert.match(planningFacts, /66\/25 kV; 8\.33 MVA; 3\.36 MVA 2026 forecast/);
  assert.match(planningFacts, /66\/12\.5 kV; 8\.33 MVA; replacement action in 2017/);
  assert.match(historyFacts, /high acetylene/);
  assert.match(historyFacts, /Portable Substation No\. 1/);
  assert.match(historyFacts, /29\.5 km total; tie to RVH-01/);
  assert.match(historyFacts, /4\/0 AASC main trunk/);
  assert.equal(riverhead.referenceSheets[0].pages, "physical PDF p. 27");
  assert.equal(riverhead.referenceSheets[1].pages, "physical PDF p. 350");
  assert.equal(transformerRegister.transformers.find((record) => record.designation === "RVH-T1").forecast_2026_mva, 3.36);
});

test("St. Catherines closes both 94L sections and retains the cascaded transformer banks", () => {
  const stCatherines = stationProfiles.find((station) => station.code === "SCT");
  assert.ok(stCatherines);
  assert.deepEqual(stCatherines.connectedCircuits.map(({ circuit, from_code, to_code }) => [circuit, from_code, to_code]), [
    ["94L", "BLK", "SCT"],
    ["94L", "SCT", "RVH"]
  ]);
  assert.deepEqual(stCatherines.feederRegister, ["SCT-01", "SCT-02"]);
  assert.deepEqual(stCatherines.diagram.buses.map(({ voltage }) => voltage), ["66 kV", "25 kV", "12.5 kV"]);
  assert.deepEqual(stCatherines.diagram.transformers.map(({ label, rating }) => [label, rating]), [["SCT-T1", "6.67 MVA"], ["SCT-T2", "4.0 MVA"]]);
  const existingFacts = stCatherines.engineeringRecord.facts.flat().join(" ");
  const planningFacts = stCatherines.planningRecord.facts.flat().join(" ");
  const historyFacts = stCatherines.historyRecords.flatMap(({ facts }) => facts).flat().join(" ");
  assert.match(existingFacts, /66 kV radial line from Blaketown through St\. Catherines to Riverhead/);
  assert.match(existingFacts, /21\.5 km Riverhead to St\. Catherines rebuild was placed in service in 2023/);
  assert.match(planningFacts, /SCT-T1 66\/25 kV; 6\.67 MVA; 1\.70 MVA 2026 forecast/);
  assert.match(planningFacts, /SCT-T2 25\/12\.5 kV; 4\.00 MVA; 0\.98 MVA 2026 forecast/);
  assert.match(historyFacts, /complete steel 66 kV and 25 kV substation built in 2000/);
  assert.match(historyFacts, /SCT-01 25 kV; 474 A rating/);
  assert.match(historyFacts, /SCT-02 12\.47 kV; 474 A rating/);
  assert.match(historyFacts, /12\.5 km from St\. Catherines/);
  assert.match(historyFacts, /final 27\.5 km/);
  assert.equal(stCatherines.referenceSheets[0].pages, "physical PDF p. 532");
  assert.equal(stCatherines.referenceSheets[1].pages, "physical PDF p. 539");
  assert.equal(transformerRegister.transformers.find((record) => record.designation === "SCT-T1").forecast_2026_mva, 1.7);
  assert.equal(transformerRegister.transformers.find((record) => record.designation === "SCT-T2").forecast_2026_mva, 0.98);
});

test("Old Perlican retains the radial supply and both published transformer ratings", () => {
  const oldPerlican = stationProfiles.find((station) => station.code === "OPL");
  assert.ok(oldPerlican);
  assert.deepEqual(oldPerlican.connectedCircuits.map(({ circuit }) => circuit), ["65L"]);
  assert.deepEqual(oldPerlican.feederRegister, ["OPL-01", "OPL-02", "OPL-03"]);
  const existingFacts = oldPerlican.engineeringRecord.facts.flat().join(" ");
  const planningFacts = oldPerlican.planningRecord.facts.flat().join(" ");
  const historyFacts = oldPerlican.historyRecords.flatMap(({ facts }) => facts).flat().join(" ");
  assert.match(existingFacts, /radial 65L from New Chelsea Substation/);
  assert.match(existingFacts, /OPL-T1 station report 66\/12\.5 kV; 13\.3 MVA/);
  assert.match(planningFacts, /OPL-T1 fleet-table rating 66\/12\.5 kV; 15 MVA; 8\.18 MVA 2026 forecast/);
  assert.match(planningFacts, /station-specific report describes OPL-T1 as 13\.3 MVA/);
  assert.match(historyFacts, /retain OPL-T1, the three feeder reclosers, and the voltage regulators/);
  assert.match(historyFacts, /commissioning complete in the fourth quarter of 2024/);
});

test("Islington separates the former transformer record from the completed modernization", () => {
  const islington = stationProfiles.find((station) => station.code === "ISL");
  assert.ok(islington);
  assert.deepEqual(islington.connectedCircuits.map(({ circuit }) => circuit), ["80L"]);
  assert.deepEqual(islington.feederRegister, ["ISL-01"]);
  assert.deepEqual(islington.diagram.circuits.map(({ label, destination }) => [label, destination]), [["80L", "Heart's Content"], ["80L", "New Harbour"]]);
  const existingFacts = islington.engineeringRecord.facts.flat().join(" ");
  const planningFacts = islington.planningRecord.facts.flat().join(" ");
  const historyFacts = islington.historyRecords.flatMap(({ facts }) => facts).flat().join(" ");
  assert.match(existingFacts, /ISL-T1 before replacement 69\/13\.8 kV; 4 MVA; English Electric; manufactured in 1958/);
  assert.match(existingFacts, /ISL-01 at 12\.5 kV; approximately 1,100 customers/);
  assert.match(planningFacts, /ISL-T1 fleet-table record 66\/12\.5 kV; 4 MVA; 3\.94 MVA 2026 forecast/);
  assert.match(historyFacts, /install two line breakers to divide 80L into two sections/);
  assert.match(historyFacts, /refurbishment complete; final demolition to remove retired equipment remained in progress/);
});

test("New Harbour retains its local 80L connections, feeder capacities and dated station record", () => {
  const newHarbour = stationProfiles.find((station) => station.code === "NHR");
  assert.ok(newHarbour);
  assert.deepEqual(newHarbour.connectedCircuits.map(({ circuit, to_code }) => [circuit, to_code]), [["80L", "ISL"], ["80L", "BLK"]]);
  assert.deepEqual(newHarbour.feederRegister, ["NHR-01", "NHR-02"]);
  assert.deepEqual(newHarbour.diagram.transformers.map(({ label, rating }) => [label, rating]), [["NHR-T1", "13.33 MVA"]]);
  const existingFacts = newHarbour.engineeringRecord.facts.flat().join(" ");
  const planningFacts = newHarbour.planningRecord.facts.flat().join(" ");
  const historyFacts = newHarbour.historyRecords.flatMap(({ facts }) => facts).flat().join(" ");
  assert.match(existingFacts, /wood 66 kV and 12\.47 kV structures installed in 1981/);
  assert.match(planningFacts, /66\/12\.5 kV; 13\.33 MVA; 7\.60 MVA 2026 forecast/);
  assert.match(historyFacts, /NHR-01 12\.47 kV; 474 A rating; 356 A winter planning value/);
  assert.match(historyFacts, /NHR-02 12\.47 kV; 303 A rating; 228 A winter planning value/);
  assert.match(historyFacts, /automate the two New Harbour distribution feeders/);
  assert.match(historyFacts, /New Harbour is on the Islington to Blaketown portion of 80L/);
  assert.match(historyFacts, /80L from Blaketown to Heart's Content/);
});

test("Quartz preserves the 55L tap and its conflicting transformer and feeder voltage records", () => {
  const quartz = stationProfiles.find((station) => station.code === "QTZ");
  assert.ok(quartz);
  assert.deepEqual(quartz.connectedCircuits.map(({ circuit }) => circuit), ["55L tap"]);
  assert.deepEqual(quartz.feederRegister, ["QTZ-01"]);
  assert.deepEqual(quartz.diagram.transformers.map(({ label, rating }) => [label, rating]), [["QTZ-T1", "0.75 MVA"]]);
  assert.equal(quartz.diagram.circuits.some(({ label }) => label === "QTZ-01"), false);
  assert.deepEqual(quartz.referenceSheets.map(({ pages }) => pages), ["physical PDF p. 462"]);
  const existingFacts = quartz.engineeringRecord.facts.flat().join(" ");
  const planningFacts = quartz.planningRecord.facts.flat().join(" ");
  const historyFacts = quartz.historyRecords.flatMap(({ facts }) => facts).flat().join(" ");
  assert.match(existingFacts, /wood 66 kV and 4\.16 kV structures installed in 1968/);
  assert.match(planningFacts, /66\/4\.2 kV; 0\.75 MVA; 0\.10 MVA 2026 forecast/);
  assert.match(historyFacts, /QTZ-01 12\.47 kV; 224 A rating; 168 A winter planning value/);
  assert.match(historyFacts, /Quartz tap constructed in 1981/);
  assert.match(historyFacts, /5 km near Whitbourne remained on the former line/);
  assert.match(historyFacts, /\$13\.032 million against the \$10\.612 million budget/);
});

test("Placentia Junction retains its 55L connection and 7.2 kV station record", () => {
  const placentiaJunction = stationProfiles.find((station) => station.code === "PJN");
  assert.ok(placentiaJunction);
  assert.deepEqual(placentiaJunction.connectedCircuits.map(({ circuit }) => circuit), ["55L connection"]);
  assert.deepEqual(placentiaJunction.feederRegister, ["PJN-01"]);
  assert.deepEqual(placentiaJunction.diagram.buses.map(({ voltage }) => voltage), ["66 kV", "7.2 kV"]);
  assert.deepEqual(placentiaJunction.diagram.transformers.map(({ label, rating }) => [label, rating]), [["PJN-T1", "0.33 MVA"]]);
  assert.deepEqual(placentiaJunction.referenceSheets.map(({ pages }) => pages), ["physical PDF p. 462"]);
  const existingFacts = placentiaJunction.engineeringRecord.facts.flat().join(" ");
  const planningFacts = placentiaJunction.planningRecord.facts.flat().join(" ");
  const historyFacts = placentiaJunction.historyRecords.flatMap(({ facts }) => facts).flat().join(" ");
  assert.match(existingFacts, /wood 66 kV and 7\.2 kV structures/);
  assert.match(existingFacts, /PJN-T1 replaced in 2003 with asset 200081/);
  assert.match(planningFacts, /66\/7\.2 kV; 0\.33 MVA; 0\.00 MVA 2026 forecast/);
  assert.match(historyFacts, /PJN-01 7\.2 kV; 303 A rating; 228 A winter planning value/);
  assert.match(historyFacts, /remove Placentia Junction and Quartz outages caused by faults between Dunville and Clarkes Pond/);
  assert.match(historyFacts, /Blaketown, Placentia Junction, Quartz, Dunville, and Clarkes Pond/);
});

test("Grand Beach closes the sectional 301L record and retains its 7.2 kV load", () => {
  const grandBeach = stationProfiles.find((station) => station.code === "GBE");
  assert.ok(grandBeach);
  assert.deepEqual(grandBeach.connectedCircuits.map(({ circuit, to_code }) => [circuit, to_code]), [["301L(B)", "GAR"], ["301L(C)", "GBE"]]);
  assert.deepEqual(grandBeach.feederRegister, ["GBE-01"]);
  assert.deepEqual(grandBeach.diagram.buses.map(({ voltage }) => voltage), ["66 kV", "7.2 kV"]);
  assert.deepEqual(grandBeach.diagram.transformers.map(({ label, rating }) => [label, rating]), [["GBE-T1", "0.33 MVA"]]);
  assert.deepEqual(grandBeach.referenceSheets.map(({ pages }) => pages), ["physical PDF p. 162"]);
  const existingFacts = grandBeach.engineeringRecord.facts.flat().join(" ");
  const planningFacts = grandBeach.planningRecord.facts.flat().join(" ");
  const assignmentFacts = grandBeach.assignmentRecord.facts.flat().join(" ");
  const historyFacts = grandBeach.historyRecords.flatMap(({ facts }) => facts).flat().join(" ");
  assert.match(existingFacts, /wood 66 kV structure installed in 1967/);
  assert.match(existingFacts, /wood 7\.2 kV structure installed before 1966/);
  assert.match(planningFacts, /66\/7\.2 kV; 0\.33 MVA; 0\.24 MVA 2026 forecast/);
  assert.match(assignmentFacts, /301L\(C\) from Greenhill to Grand Beach and 301L\(B\) from Grand Beach to the Garnish tap/);
  assert.match(assignmentFacts, /December 2025 customers 105/);
  assert.match(historyFacts, /32 km from Grand Beach to Salt Pond reported complete/);
  assert.match(historyFacts, /GBE-01 7\.2 kV; 224 A rating; 168 A winter planning value/);
});

test("Webbers Cove joins both 305L sections and retains its 25 kV load", () => {
  const webbersCove = stationProfiles.find((station) => station.code === "WBC");
  assert.ok(webbersCove);
  assert.deepEqual(webbersCove.connectedCircuits.map(({ circuit, from_code }) => [circuit, from_code]), [["305L(A)", "GRH"], ["305L(B)", "LAU"]]);
  assert.deepEqual(webbersCove.feederRegister, ["WBC-01"]);
  assert.deepEqual(webbersCove.diagram.buses.map(({ voltage }) => voltage), ["66 kV", "25 kV"]);
  assert.deepEqual(webbersCove.diagram.transformers.map(({ label, rating }) => [label, rating]), [["WBC-T1", "8.33 MVA"]]);
  assert.deepEqual(webbersCove.referenceSheets.map(({ pages }) => pages), ["physical PDF p. 162"]);
  const existingFacts = webbersCove.engineeringRecord.facts.flat().join(" ");
  const planningFacts = webbersCove.planningRecord.facts.flat().join(" ");
  const assignmentFacts = webbersCove.assignmentRecord.facts.flat().join(" ");
  const historyFacts = webbersCove.historyRecords.flatMap(({ facts }) => facts).flat().join(" ");
  assert.match(existingFacts, /complete substation built in 2001/);
  assert.match(existingFacts, /6\.7 MVA total capacity/);
  assert.match(planningFacts, /66\/25 kV; 8\.33 MVA; 4\.03 MVA 2026 forecast/);
  assert.match(assignmentFacts, /305L\(A\) between Greenhill and Webbers Cove; 305L\(B\) between Laurentian and Webbers Cove/);
  assert.match(assignmentFacts, /December 2025 customers 820/);
  assert.match(historyFacts, /Greenhill generation energized 305L at 10:15 p\.m\./);
  assert.match(historyFacts, /WBC-01 25 kV; 474 A rating; 356 A winter planning value/);
  assert.match(historyFacts, /projected to reach high climate risk by 2050/);
});

test("Northwest Brook retains its 109L connection and completed 2025 modernization", () => {
  const northwestBrook = stationProfiles.find((station) => station.code === "NWB");
  assert.ok(northwestBrook);
  assert.deepEqual(northwestBrook.connectedCircuits.map(({ circuit }) => circuit), ["109L"]);
  assert.deepEqual(northwestBrook.feederRegister, ["NWB-01", "NWB-02"]);
  assert.deepEqual(northwestBrook.diagram.circuits.map(({ label, destination }) => [label, destination]), [["109L", "Sunnyside"], ["109L", "Clarenville"]]);
  const existingFacts = northwestBrook.engineeringRecord.facts.flat().join(" ");
  const planningFacts = northwestBrook.planningRecord.facts.flat().join(" ");
  const historyFacts = northwestBrook.historyRecords.flatMap(({ facts }) => facts).flat().join(" ");
  assert.match(existingFacts, /NWB-T1 138\/25 kV; 11\.2 MVA; Westinghouse; manufactured in 1965/);
  assert.match(existingFacts, /NWB-01 and NWB-02 at 25 kV; approximately 1,790 customers/);
  assert.match(planningFacts, /NWB-T1 138\/25 kV; 11\.2 MVA; 5\.85 MVA 2026 forecast/);
  assert.match(historyFacts, /install two line breakers to divide 109L into sections/);
  assert.match(historyFacts, /reported the Northwest Brook refurbishment complete/);
});

test("Lockston preserves the legacy 46 kV plant connection and separates the in-progress replacement", () => {
  const lockston = stationProfiles.find((station) => station.code === "LOK");
  assert.ok(lockston);
  assert.deepEqual(lockston.connectedCircuits.map(({ circuit }) => circuit), ["110L", "111L", "113L"]);
  assert.deepEqual(lockston.feederRegister, ["LOK-01"]);
  assert.deepEqual(lockston.diagram.transformers.map(({ label, rating }) => [label, rating]), [["LOK-T2", "4 MVA"], ["LOK-T1", "2.5 MVA"], ["LOK-T4", "2.5 MVA"], ["LOK-T3", "4 MVA"]]);
  const existingFacts = lockston.engineeringRecord.facts.flat().join(" ");
  const planningFacts = lockston.planningRecord.facts.flat().join(" ");
  const historyFacts = lockston.historyRecords.flatMap(({ facts }) => facts).flat().join(" ");
  assert.match(existingFacts, /LOK-T1 and LOK-T4 step 6\.9 kV to 46 kV; LOK-T2 steps 46 kV to 66 kV/);
  assert.match(existingFacts, /LOK-T3 66\/12\.5 kV; 4 MVA; General Electric; manufactured in 1970/);
  assert.match(planningFacts, /LOK-T2 fleet-table rating 66\/46 kV; 7\.46 MVA/);
  assert.match(planningFacts, /station-specific table describes LOK-T2 as 4 MVA/);
  assert.match(historyFacts, /filing does not state its designation/);
  assert.match(historyFacts, /early construction had begun.*temporary transformer installation/);
});

test("Summerville retains its 113L through connection and in-progress modernization", () => {
  const summerville = stationProfiles.find((station) => station.code === "SMV");
  assert.ok(summerville);
  assert.deepEqual(summerville.connectedCircuits.map(({ circuit }) => circuit), ["113L"]);
  assert.deepEqual(summerville.feederRegister, ["SMV-01"]);
  assert.deepEqual(summerville.diagram.circuits.map(({ label, destination }) => [label, destination]), [["113L", "Princeton Pond"], ["113L", "Lethbridge"]]);
  const existingFacts = summerville.engineeringRecord.facts.flat().join(" ");
  const planningFacts = summerville.planningRecord.facts.flat().join(" ");
  const historyFacts = summerville.historyRecords.flatMap(({ facts }) => facts).flat().join(" ");
  assert.match(existingFacts, /SMV-T1 66\/25 kV; 4 MVA; Canadian General Electric; manufactured in 1971/);
  assert.match(existingFacts, /SMV-01 at 25 kV; approximately 1,130 customers/);
  assert.match(planningFacts, /SMV-T1 66\/25 kV; 4 MVA; 2\.87 MVA 2026 forecast/);
  assert.match(historyFacts, /install two line breakers to divide 113L into sections/);
  assert.match(historyFacts, /early construction had begun, including foundation work at Summerville/);
});

test("Lethbridge separates its former transformer from the current fleet-table record", () => {
  const lethbridge = stationProfiles.find((station) => station.code === "LET");
  assert.ok(lethbridge);
  assert.deepEqual(lethbridge.connectedCircuits.map(({ circuit }) => circuit), ["110L", "113L"]);
  assert.deepEqual(lethbridge.feederRegister, ["LET-01"]);
  assert.deepEqual(lethbridge.diagram.transformers.map(({ label, rating }) => [label, rating]), [["LET-T1", "16.67 MVA"]]);
  const existingFacts = lethbridge.engineeringRecord.facts.flat().join(" ");
  const planningFacts = lethbridge.planningRecord.facts.flat().join(" ");
  const historyFacts = lethbridge.historyRecords.flatMap(({ facts }) => facts).flat().join(" ");
  assert.match(existingFacts, /LET-T1 66\/25 kV; 6\.7 MVA/);
  assert.match(existingFacts, /LET-01; approximately 1,744 customers/);
  assert.match(planningFacts, /66\/25 kV; 16\.67 MVA; 8\.9 MVA 2026 forecast/);
  assert.match(historyFacts, /replace the 6\.7 MVA LET-T1 with a 16\.7 MVA, 66\/25 kV transformer/);
});

test("Milton joins its 110L supply, feeder service areas and dated renewal work", () => {
  const milton = stationProfiles.find((station) => station.code === "MIL");
  assert.ok(milton);
  assert.deepEqual(milton.connectedCircuits.map(({ circuit, from }) => [circuit, from]), [["110L", "Clarenville"]]);
  assert.deepEqual(milton.feederRegister, ["MIL-01", "MIL-02"]);
  assert.deepEqual(milton.diagram.transformers.map(({ label, rating }) => [label, rating]), [["MIL-T1", "16.67 MVA"]]);
  assert.equal(milton.referenceSheets[0].pages, "physical PDF p. 458");
  const existingFacts = milton.engineeringRecord.facts.flat().join(" ");
  const planningFacts = milton.planningRecord.facts.flat().join(" ");
  const historyFacts = milton.historyRecords.flatMap(({ facts }) => facts).flat().join(" ");
  assert.match(existingFacts, /MIL-01 approximately 4\.0 km of 4\/0 AASC main trunk; approximately 1,104 customers/);
  assert.match(existingFacts, /MIL-02 approximately 27\.0 km of 4\/0 AASC main trunk; approximately 1,438 customers/);
  assert.match(planningFacts, /66\/25 kV; 16\.67 MVA; 12\.85 MVA 2026 forecast/);
  assert.match(historyFacts, /upgrade 18 km of distribution line from two-phase to three-phase/);
  assert.match(historyFacts, /refurbish 2\.8 km in Milton and George's Brook/);
});

test("Catalina retains both transformation levels and the three filed transmission circuits", () => {
  const catalina = stationProfiles.find((station) => station.code === "CAT");
  assert.ok(catalina);
  assert.deepEqual(catalina.connectedCircuits.map(({ circuit }) => circuit), ["111L", "117L", "123L"]);
  assert.deepEqual(catalina.feederRegister, ["CAT-01", "CAT-02", "CAT-03"]);
  assert.deepEqual(catalina.diagram.transformers.map(({ label, rating }) => [label, rating]), [["CAT-T1", "16.7 MVA"], ["CAT-T2", "20 MVA"]]);
  const existingFacts = catalina.engineeringRecord.facts.flat().join(" ");
  const planningFacts = catalina.planningRecord.facts.flat().join(" ");
  const historyFacts = catalina.historyRecords.flatMap(({ facts }) => facts).flat().join(" ");
  assert.match(existingFacts, /CAT-T1 138\/66 kV; 16\.6 MVA; installed in 1972/);
  assert.match(existingFacts, /CAT-T2 138\/12\.5 kV; 20 MVA; installed in 1977/);
  assert.match(planningFacts, /CAT-T2 current fleet-table record 138\/12\.5 kV; 20 MVA; 5\.57 MVA 2026 forecast/);
  assert.match(historyFacts, /install a 138 kV breaker on 123L and remove two high-speed ground switches/);
});

test("Bonavista separates the 2018 transformer failure from the filed modernization", () => {
  const bonavista = stationProfiles.find((station) => station.code === "BVA");
  assert.ok(bonavista);
  assert.deepEqual(bonavista.connectedCircuits.map(({ circuit }) => circuit), ["117L"]);
  assert.deepEqual(bonavista.feederRegister, ["BVA-01", "BVA-02", "BVA-03"]);
  assert.deepEqual(bonavista.diagram.transformers.map(({ label, rating }) => [label, rating]), [["BVA-T1", "25 MVA"]]);
  const existingFacts = bonavista.engineeringRecord.facts.flat().join(" ");
  const planningFacts = bonavista.planningRecord.facts.flat().join(" ");
  const historyFacts = bonavista.historyRecords.flatMap(({ facts }) => facts).flat().join(" ");
  assert.match(existingFacts, /BVA-T1 138\/12\.5 kV; 25 MVA; installed in 1990/);
  assert.match(planningFacts, /138\/12\.5 kV; 25 MVA; 13\.81 MVA 2026 forecast/);
  assert.match(historyFacts, /23 hours and 54 minutes/);
  assert.match(historyFacts, /all 2,566 customers supplied from Bonavista Substation/);
  assert.match(historyFacts, /listed in service/);
});

test("Clarenville separates the 2014 arrangement from the present three-transformer record", () => {
  const clarenville = stationProfiles.find((station) => station.code === "CLV");
  assert.ok(clarenville);
  assert.deepEqual(clarenville.connectedCircuits.map(({ circuit }) => circuit), ["109L", "110L", "123L", "124L"]);
  assert.deepEqual(clarenville.feederRegister, ["CLV-01", "CLV-02", "CLV-03"]);
  assert.deepEqual(clarenville.diagram.transformers.map(({ label, rating }) => [label, rating]), [["CLV-T1", "25 MVA"], ["CLV-T2", "20 MVA"], ["CLV-T3", "25 MVA"]]);
  const existingFacts = clarenville.engineeringRecord.facts.flat().join(" ");
  const planningFacts = clarenville.planningRecord.facts.flat().join(" ");
  const historyFacts = clarenville.historyRecords.flatMap(({ facts }) => facts).flat().join(" ");
  assert.match(existingFacts, /CLV-T1 138\/66 kV; 25 MVA/);
  assert.match(existingFacts, /CLV-T2 138\/12\.5 kV; 20 MVA/);
  assert.match(planningFacts, /CLV-T3 138\/12\.5 kV; 25 MVA; 13\.01 MVA 2026 forecast/);
  assert.match(historyFacts, /replace 65 electromechanical relays with 14 digital relays/);
  assert.match(historyFacts, /41\.5 MVA for CLV-T2 and CLV-T3 operating in parallel/);
});

test("Port Blandford records the 124L tap, radial feeder and filed three-phase work", async () => {
  const portBlandford = stationProfiles.find((station) => station.code === "PBD");
  assert.ok(portBlandford);
  assert.deepEqual(portBlandford.connectedCircuits.map(({ circuit }) => circuit), ["124L tap"]);
  assert.deepEqual(portBlandford.feederRegister, ["PBD-01"]);
  assert.deepEqual(portBlandford.diagram.transformers.map(({ label, rating }) => [label, rating]), [["PBD-T1", "16.67 MVA"]]);
  const existingFacts = portBlandford.engineeringRecord.facts.flat().join(" ");
  const planningFacts = portBlandford.planningRecord.facts.flat().join(" ");
  const historyFacts = portBlandford.historyRecords.flatMap(({ facts }) => facts).flat().join(" ");
  assert.match(existingFacts, /PBD-01 was the only feeder; approximately 671 customers/);
  assert.match(existingFacts, /approximately 60 km total, including 5 km of three-phase line and 55 km of single-phase line/);
  assert.match(planningFacts, /138\/25 kV; 16\.67 MVA; 3\.17 MVA 2026 forecast/);
  assert.match(historyFacts, /steel 138 kV structure and wood 25 kV structure installed in 1990/);
  assert.match(historyFacts, /construct 700 m of new three-phase line and convert 2\.3 km/);
  assert.equal(portBlandford.referenceSheets[0].pages, "physical PDF p. 192");
  await readFile(new URL("../public/reference-maps/pbd-01-2021-upgrade.jpg", import.meta.url));
});

test("Princeton Pond is represented as a breakerless switching point", async () => {
  const princetonPond = stationProfiles.find((station) => station.code === "PRC");
  assert.ok(princetonPond);
  assert.equal(princetonPond.diagram.transformers.length, 0);
  assert.deepEqual(princetonPond.diagram.buses.map(({ voltage }) => voltage), ["138 kV", "66 kV"]);
  assert.deepEqual(princetonPond.diagram.circuits.map(({ label, destination }) => [label, destination]), [["123L", "Clarenville"], ["123L", "Catalina"], ["113L", "Summerville"], ["113L", "Lockston"]]);
  const facts = [
    ...princetonPond.engineeringRecord.facts.flat(),
    ...princetonPond.historyRecords.flatMap(({ facts }) => facts).flat()
  ].join(" ");
  assert.match(facts, /138 kV and 66 kV buses are not connected/);
  assert.match(facts, /station has no circuit breakers/);
  assert.match(facts, /portable substation can connect 113L at 66 kV to 123L at 138 kV/);
  assert.match(facts, /normally open point at Lethbridge/);
  assert.deepEqual(princetonPond.referenceSheets.map((sheet) => sheet.image), ["./reference-maps/prc-2024-single-line.png"]);
  await readFile(new URL("../public/reference-maps/prc-2024-single-line.png", import.meta.url));
});

test("Port Union separates current generation equipment from the Igor rebuild", () => {
  const portUnion = stationProfiles.find((station) => station.code === "PUN");
  assert.ok(portUnion);
  assert.deepEqual(portUnion.connectedCircuits.map(({ circuit }) => circuit), ["111L", "111L"]);
  assert.deepEqual(portUnion.diagram.transformers.map(({ label, rating }) => [label, rating]), [["PUN-T1-A", "0.33 MVA"], ["PUN-T1-B", "0.33 MVA"], ["PUN-T1-C", "0.33 MVA"]]);
  assert.deepEqual(portUnion.diagram.generators.map(({ label, rating }) => [label, rating]), [["G1 / G2", "0.52 MW plant rating"]]);
  const currentFacts = portUnion.engineeringRecord.facts.flat().join(" ");
  const transformerFacts = portUnion.planningRecord.facts.flat().join(" ");
  const historyFacts = portUnion.historyRecords.flatMap(({ facts }) => facts).flat().join(" ");
  assert.match(currentFacts, /35 MWh, approximately 2\.8 days/);
  assert.match(currentFacts, /464,232 kWh/);
  assert.match(transformerFacts, /PUN-T1-A 66\/2\.4 kV; 0\.33 MVA/);
  assert.match(historyFacts, /powerhouse flooded to approximately 2 m/);
  assert.match(historyFacts, /500 kW Caterpillar D398A unit was decommissioned/);
  assert.match(historyFacts, /rebuilt the Port Union hydroelectric plant/);
});

test("Glovertown separates the former radial tap from the completed loop arrangement", () => {
  const glovertown = stationProfiles.find((station) => station.code === "GLV");
  assert.ok(glovertown);
  assert.deepEqual(glovertown.connectedCircuits.map(({ circuit }) => circuit), ["121L", "124L"]);
  assert.deepEqual(glovertown.feederRegister, ["GLV-01", "GLV-02"]);
  assert.deepEqual(glovertown.diagram.transformers.map(({ label, rating }) => [label, rating]), [["GLV-T1", "20 MVA"]]);
  assert.deepEqual(glovertown.diagram.circuits.map(({ label, destination }) => [label, destination]), [["121L", "Gambo"], ["124L", "Clarenville"]]);
  const existingFacts = glovertown.engineeringRecord.facts.flat().join(" ");
  const planningFacts = glovertown.planningRecord.facts.flat().join(" ");
  const historyFacts = glovertown.historyRecords.flatMap(({ facts }) => facts).flat().join(" ");
  assert.match(existingFacts, /GLV-T1 138\/25 kV; 20 MVA/);
  assert.match(existingFacts, /approximately 2,730 customers/);
  assert.match(planningFacts, /12\.92 MVA 2026 forecast/);
  assert.match(historyFacts, /radial tap from 124L at Alexander Bay/);
  assert.match(historyFacts, /construction and commissioning complete/);
});

test("Twillingate combines the completed station work with measured winter voltage", () => {
  const twillingate = stationProfiles.find((station) => station.code === "TWG");
  assert.ok(twillingate);
  assert.deepEqual(twillingate.connectedCircuits.map(({ circuit }) => circuit), ["140L"]);
  assert.deepEqual(twillingate.feederRegister, ["TWG-01", "TWG-02", "TWG-03"]);
  assert.deepEqual(twillingate.diagram.transformers.map(({ label, rating }) => [label, rating]), [["TWG-T1", "13.33 MVA"]]);
  assert.deepEqual(twillingate.diagram.circuits.map(({ label, destination }) => [label, destination]), [["140L", "Summerford"]]);
  const existingFacts = twillingate.engineeringRecord.facts.flat().join(" ");
  const planningFacts = twillingate.planningRecord.facts.flat().join(" ");
  const historyFacts = twillingate.historyRecords.flatMap(({ facts }) => facts).flat().join(" ");
  assert.match(existingFacts, /66\/12.5 kV; 13.3 MVA/);
  assert.match(existingFacts, /three hydraulic reclosers/);
  assert.match(planningFacts, /13.33 MVA; 9.24 MVA 2026 forecast/);
  assert.match(historyFacts, /construction complete/);
  assert.match(historyFacts, /approximately 31% of the winter period/);
  assert.match(historyFacts, /0.873 pu on January 24, 2024/);
});

test("Trinity preserves the 116L tap control and the 2020 transformer failure", () => {
  const trinity = stationProfiles.find((station) => station.code === "TRN");
  assert.ok(trinity);
  assert.deepEqual(trinity.connectedCircuits.map(({ circuit }) => circuit), ["116L tap"]);
  assert.deepEqual(trinity.feederRegister, ["TRN-01", "TRN-02"]);
  assert.deepEqual(trinity.diagram.transformers.map(({ label, rating }) => [label, rating]), [["TRN-T1", "6.67 MVA"]]);
  const operatingFacts = trinity.engineeringRecord.facts.flat().join(" ");
  const planningFacts = trinity.planningRecord.facts.flat().join(" ");
  const historyFacts = trinity.historyRecords.flatMap(({ facts }) => facts).flat().join(" ");
  assert.match(operatingFacts, /TRN-116L-A3 automated air-break switch/);
  assert.match(operatingFacts, /remotely disable under-voltage tripping/);
  assert.match(planningFacts, /66\/25 kV; 6.67 MVA; 3.78 MVA 2026 forecast/);
  assert.match(historyFacts, /3,503 customers supplied from 115L and 116L/);
  assert.match(historyFacts, /25 hours and 58 minutes/);
  assert.match(historyFacts, /isolated to Trinity Substation customers/);
});

test("Hare Bay joins 115L and 116L with the reported distribution transfer", () => {
  const hareBay = stationProfiles.find((station) => station.code === "HBS");
  const trinity = stationProfiles.find((station) => station.code === "TRN");
  assert.ok(hareBay);
  assert.deepEqual(hareBay.connectedCircuits.map(({ circuit }) => circuit), ["115L", "116L"]);
  assert.deepEqual(hareBay.feederRegister, ["HBS-01", "HBS-02"]);
  assert.deepEqual(hareBay.diagram.transformers.map(({ label, rating }) => [label, rating]), [["HBS-T1", "6.67 MVA"]]);
  assert.deepEqual(hareBay.diagram.circuits.map(({ label, destination }) => [label, destination]), [["115L", "Gambo"], ["116L", "Wesleyville"]]);
  assert.deepEqual(trinity.diagram.circuits.map(({ label, destination }) => [label, destination]), [["116L tap", "Hare Bay"], ["116L tap", "Wesleyville"]]);
  const existingFacts = hareBay.engineeringRecord.facts.flat().join(" ");
  const planningFacts = hareBay.planningRecord.facts.flat().join(" ");
  const reliabilityFacts = hareBay.historyRecords.flatMap(({ facts }) => facts).flat().join(" ");
  assert.match(existingFacts, /approximately 1.1 MVA can be transferred from HBS-01 to GAM-01/);
  assert.match(existingFacts, /837 in December 2025/);
  assert.match(planningFacts, /66\/25 kV; 6.67 MVA; 4.02 MVA 2026 forecast/);
  assert.match(reliabilityFacts, /T-SAIDI 2.88; corporate average 0.62/);
  assert.match(reliabilityFacts, /T-SAIFI 3.49; corporate average 0.49/);
});

test("Wesleyville separates the existing derated turbine from the proposed replacement", () => {
  const wesleyville = stationProfiles.find((station) => station.code === "WES");
  assert.ok(wesleyville);
  assert.deepEqual(wesleyville.connectedCircuits.map(({ circuit }) => circuit), ["116L"]);
  assert.deepEqual(wesleyville.feederRegister, ["WES-01", "WES-02", "WES-03"]);
  assert.deepEqual(wesleyville.diagram.transformers.map(({ label, rating }) => [label, rating]), [["WES-T1", "13.33 MVA"], ["WES-T2", "16 MVA"]]);
  assert.deepEqual(wesleyville.diagram.generators.map(({ label, rating }) => [label, rating]), [["WES CTG", "8 MW derated"]]);
  const existingFacts = wesleyville.engineeringRecord.facts.flat().join(" ");
  const planningFacts = wesleyville.planningRecord.facts.flat().join(" ");
  const historyFacts = wesleyville.historyRecords.flatMap(({ facts }) => facts).flat().join(" ");
  assert.match(existingFacts, /WES-T2 station report 66\/13 kV; 20 MVA/);
  assert.match(planningFacts, /WES-T2 66\/13.8 kV generation transformer; 16 MVA/);
  assert.match(historyFacts, /originally 14.7 MW; derated to 8 MW/);
  assert.match(historyFacts, /install one nominal 15 MW combustion turbine generator/);
  assert.match(historyFacts, /synchronous-condenser capability/);
});

test("Greenhill keeps the transformer voltage conflict inside its station record", () => {
  const greenhill = stationProfiles.find((station) => station.code === "GRH");
  assert.ok(greenhill);
  assert.deepEqual(greenhill.connectedCircuits.map(({ circuit }) => circuit), ["301L", "305L"]);
  assert.deepEqual(greenhill.feederRegister, ["GRH-01", "GRH-02", "GRH-03"]);
  assert.deepEqual(greenhill.diagram.transformers.map(({ label }) => label), ["GRH-T2", "GRH-T1"]);
  assert.deepEqual(greenhill.diagram.generators.map(({ label, rating }) => [label, rating]), [["GRH CTG", "20 MW derated"]]);
  const existingFacts = greenhill.engineeringRecord.facts.flat().join(" ");
  const planningFacts = greenhill.planningRecord.facts.flat().join(" ");
  const historyFacts = greenhill.historyRecords.flatMap(({ facts }) => facts).flat().join(" ");
  assert.match(existingFacts, /originally 25 MW and derated to 20 MW in 1984/);
  assert.match(existingFacts, /approximately 2,300 Grand Bank customers/);
  assert.match(planningFacts, /register lists GRH-T2 at 138\/12.5 kV/);
  assert.match(planningFacts, /facility report identifies 66 kV, 12.5 kV, and 13.8 kV/);
  assert.match(historyFacts, /114 dispatch events; 3.7 hour average duration/);
  assert.match(historyFacts, /install two nominal 15 MW combustion turbine generators/);
});

test("Salt Pond separates its filed arrangement from proposed modernization work", () => {
  const saltPond = stationProfiles.find((station) => station.code === "SPO");
  assert.ok(saltPond);
  assert.deepEqual(saltPond.connectedCircuits.map(({ circuit }) => circuit), ["TL219", "308L", "301L", "302L"]);
  assert.deepEqual(saltPond.feederRegister, ["SPO-01", "SPO-02", "SPO-03"]);
  assert.deepEqual(saltPond.diagram.transformers.map(({ label, rating }) => [label, rating]), [["SPO-T4", "41.6 MVA"], ["SPO-T5", "41.6 MVA"], ["SPO-T1", "15 MVA"]]);
  assert.deepEqual(saltPond.diagram.circuits.map(({ label, destination }) => [label, destination]), [["TL219", "Sunnyside"], ["308L", "Marystown"], ["301L", "Greenhill"], ["302L", "Laurentian"]]);
  const existingFacts = saltPond.engineeringRecord.facts.flat().join(" ");
  const planningFacts = saltPond.planningRecord.facts.flat().join(" ");
  const proposedFacts = saltPond.historyRecords.flatMap(({ facts }) => facts).flat().join(" ");
  assert.match(existingFacts, /different winding configurations prevent parallel operation/);
  assert.match(existingFacts, /SPO-T1 in 1966, SPO-T4 in 1973, and SPO-T5 in 2003/);
  assert.match(planningFacts, /11.99 MVA 2026 forecast/);
  assert.match(proposedFacts, /2017 FILED MODERNIZATION|replace three hydraulic reclosers/i);
});

test("Marystown retains its two 138 kV connections and filed modernization", () => {
  const marystown = stationProfiles.find((station) => station.code === "MSY");
  assert.ok(marystown);
  assert.deepEqual(marystown.connectedCircuits.map(({ circuit }) => circuit), ["300L", "308L"]);
  assert.deepEqual(marystown.feederRegister, ["MSY-01", "MSY-02", "MSY-03", "MSY-04"]);
  assert.deepEqual(marystown.mapPages, [["MSY-01", 114]]);
  assert.deepEqual(marystown.diagram.transformers.map(({ label, rating }) => [label, rating]), [["MSY-T1", "20 MVA"]]);
  const existingFacts = marystown.engineeringRecord.facts.flat().join(" ");
  const planningFacts = marystown.planningRecord.facts.flat().join(" ");
  const proposedFacts = marystown.historyRecords.flatMap(({ facts }) => facts).flat().join(" ");
  assert.match(existingFacts, /installed in 1977/);
  assert.match(existingFacts, /high-speed ground switch and five electromechanical relays/);
  assert.match(planningFacts, /18.33 MVA 2026 forecast/);
  assert.match(proposedFacts, /install breakers and digital protection for 300L, 308L, and MSY-T1/);
});

test("Grand Bay keeps its dated 12.5 kV arrangement separate from the latest fleet table", () => {
  const grandBay = stationProfiles.find((station) => station.code === "GBS");
  assert.ok(grandBay);
  assert.deepEqual(grandBay.connectedCircuits.map(({ circuit }) => circuit), ["TL215", "416L", "417L"]);
  assert.deepEqual(grandBay.feederRegister, ["GBS-01", "GBS-02"]);
  assert.deepEqual(grandBay.diagram.transformers.map(({ label, rating }) => [label, rating]), [["GBS-T1", "14.93 MVA in 2019 filing"]]);
  assert.deepEqual(grandBay.diagram.generators.map(({ label, rating }) => [label, rating]), [["MGT", "mobile gas turbine"]]);
  const existingFacts = grandBay.engineeringRecord.facts.flat().join(" ");
  const planningFacts = grandBay.planningRecord.facts.flat().join(" ");
  const historyFacts = grandBay.historyRecords.flatMap(({ facts }) => facts).flat().join(" ");
  assert.match(existingFacts, /Westinghouse unit manufactured in 1966 and transferred from Deer Lake in 1992/);
  assert.match(planningFacts, /fleet table lists 66\/25 kV; 25 MVA; 8.78 MVA 2026 forecast/);
  assert.match(planningFacts, /2019 station report identifies a 12.5 kV distribution bus/);
  assert.match(historyFacts, /tap changer placed at a fixed position/);
  assert.match(historyFacts, /replace eleven electromechanical relays with three digital relays/);
});

test("Port aux Basques separates the 2010 generator connection from current transformer records", () => {
  const portAuxBasques = stationProfiles.find((station) => station.code === "PAB");
  assert.ok(portAuxBasques);
  assert.deepEqual(portAuxBasques.connectedCircuits.map(({ circuit }) => circuit), ["417L"]);
  assert.deepEqual(portAuxBasques.feederRegister, ["PAB-03", "PAB-05"]);
  assert.deepEqual(portAuxBasques.mapPages, [["PAB-03", 116], ["PAB-05", 117]]);
  assert.deepEqual(portAuxBasques.diagram.transformers.map(({ label, rating }) => [label, rating]), [["PAB-T5", "13.33 MVA"], ["PAB-T3", "4 MVA"]]);
  assert.deepEqual(portAuxBasques.diagram.generators.map(({ label, rating }) => [label, rating]), [["PAB DEG", "2.5 MW"]]);
  const currentFacts = portAuxBasques.engineeringRecord.facts.flat().join(" ");
  const planningFacts = portAuxBasques.planningRecord.facts.flat().join(" ");
  const historyFacts = portAuxBasques.historyRecords.flatMap(({ facts }) => facts).flat().join(" ");
  assert.match(currentFacts, /PAB-03 and PAB-05 at 12.5 kV/);
  assert.match(planningFacts, /PAB-T3 66\/4.2 kV generation transformer; 4 MVA/);
  assert.match(historyFacts, /PAB-T3 at 3 MVA connected the 2.5 MW diesel generator from 4.16 kV to 12.5 kV/);
  assert.match(historyFacts, /automate the installed Nulec reclosers/);
});

test("Long Lake connects 416L and the Rose Blanche plant feeder", () => {
  const longLake = stationProfiles.find((station) => station.code === "LGL");
  assert.ok(longLake);
  assert.deepEqual(longLake.connectedCircuits.map(({ circuit }) => circuit), ["416L"]);
  assert.deepEqual(longLake.feederRegister, ["LGL-01", "LGL-02"]);
  assert.deepEqual(longLake.mapPages, [["LGL-01", 106]]);
  assert.deepEqual(longLake.diagram.transformers.map(({ label, rating }) => [label, rating]), [["LGL-T1", "14.9 MVA fleet rating"]]);
  const existingFacts = longLake.engineeringRecord.facts.flat().join(" ");
  const planningFacts = longLake.planningRecord.facts.flat().join(" ");
  const historyFacts = longLake.historyRecords.flatMap(({ facts }) => facts).flat().join(" ");
  assert.match(existingFacts, /connects the 6.0 MW Rose Blanche plant through a 4.7 km distribution line/);
  assert.match(planningFacts, /66\/25 kV; 14.9 MVA; 6.19 MVA 2026 forecast/);
  assert.match(planningFacts, /2020 feeder report identifies two 12.5 kV feeders/);
  assert.match(historyFacts, /42 of 44 untreated cedar poles were deteriorated/);
  assert.match(historyFacts, /radial with no tie point or backup/);
});

test("Rose Blanche closes the LGL-02 plant connection and preserves its dual-turbine history", () => {
  const roseBlanche = stationProfiles.find((station) => station.code === "RBH");
  assert.ok(roseBlanche);
  assert.deepEqual(roseBlanche.connectedCircuits, [
    { circuit: "LGL-02", from: "Long Lake", from_code: "LGL", to: "Rose Blanche", to_code: "RBH" }
  ]);
  assert.deepEqual(roseBlanche.diagram.buses.map(({ voltage }) => voltage), ["25 kV", "6.9 kV"]);
  assert.deepEqual(roseBlanche.diagram.transformers.map(({ label, rating }) => [label, rating]), [["RBH-T1", "9.3 MVA"]]);
  assert.deepEqual(roseBlanche.diagram.generators.map(({ label, rating }) => [label, rating]), [["G1", "6.0 MW"]]);
  const plantFacts = roseBlanche.engineeringRecord.facts.flat().join(" ");
  const planningFacts = roseBlanche.planningRecord.facts.flat().join(" ");
  const historyFacts = roseBlanche.historyRecords.flatMap(({ facts }) => facts).flat().join(" ");
  assert.match(plantFacts, /two Francis turbines on a common shaft/);
  assert.match(plantFacts, /21\.90 GWh per year/);
  assert.match(plantFacts, /isolated southwest-coast system/);
  assert.match(planningFacts, /RBH-T1.*25\/6\.9 kV.*9\.3 MVA/);
  assert.match(historyFacts, /cracks in Turbine No\. 1 runner blades/);
  assert.match(historyFacts, /damage to the generator shaft/);
  assert.match(historyFacts, /repair and bury the damaged penstock/);
  assert.match(historyFacts, /generator rotor and G1 runner replaced in 2018/);
  assert.match(historyFacts, /original 8\.5 kW propane unit/);
  assert.match(historyFacts, /\$1\.728 million total budget/);
});

test("Humber separates its former dual-voltage banks from the filed conversion", () => {
  const humber = stationProfiles.find((station) => station.code === "HUM");
  assert.ok(humber);
  assert.deepEqual(humber.connectedCircuits.map(({ circuit }) => circuit), ["356L", "359L"]);
  assert.deepEqual(humber.mapPages, [["HUM-01", 77], ["HUM-08", 78], ["HUM-09", 79]]);
  assert.deepEqual(humber.diagram.transformers.map(({ label, rating }) => [label, rating]), [["HUM-T1", "25 MVA"]]);
  const existingFacts = humber.engineeringRecord.facts.flat().join(" ");
  const planningFacts = humber.planningRecord.facts.flat().join(" ");
  const proposedFacts = humber.historyRecords.flatMap(({ facts }) => facts).flat().join(" ");
  assert.match(existingFacts, /HUM-T2, 66\/4.16 kV and 7.46 MVA/);
  assert.match(existingFacts, /HUM-T3, 66\/12.5 kV and 13.3 MVA/);
  assert.match(existingFacts, /no customer impact while the loop remained in service/);
  assert.match(planningFacts, /66\/12.5 kV; 25 MVA; 16.58 MVA 2026 forecast/);
  assert.match(proposedFacts, /remove HUM-T2 and replace HUM-T3 with one 25 MVA/);
  assert.match(proposedFacts, /convert HUM-01, HUM-04, and HUM-07 from 4.16 kV to 12.5 kV/);
  assert.match(proposedFacts, /post-conversion design has three 12.5 kV feeders/);
});

test("Victoria links the radial distribution station and hydro generator", () => {
  const victoria = stationProfiles.find((station) => station.code === "VIC");
  assert.ok(victoria);
  assert.deepEqual(victoria.connectedCircuits.map(({ circuit }) => circuit), ["40L"]);
  assert.deepEqual(victoria.feederRegister, ["VIC-01", "VIC-02"]);
  assert.deepEqual(victoria.diagram.transformers.map(({ label, rating }) => [label, rating]), [["VIC-T1", "13.33 MVA"], ["VIC-T2", "0.6 MVA"]]);
  assert.deepEqual(victoria.diagram.generators.map(({ label, rating }) => [label, rating]), [["Victoria hydro", "500 kVA"]]);
  const existingFacts = victoria.engineeringRecord.facts.flat().join(" ");
  const planningFacts = victoria.planningRecord.facts.flat().join(" ");
  const proposedFacts = victoria.historyRecords.flatMap(({ facts }) => facts).flat().join(" ");
  assert.match(existingFacts, /approximately 2,060 Victoria-area customers/);
  assert.match(existingFacts, /connects the 500 kVA hydroelectric generator/);
  assert.match(planningFacts, /8.71 MVA 2026 forecast/);
  assert.match(proposedFacts, /replace two hydraulic reclosers with remotely controlled intelligent reclosers/);
  assert.match(proposedFacts, /install a 66 kV breaker, bypass switch, digital relays/);
});

test("Western Avalon joins the terminal and distribution records without merging their sources", async () => {
  const westernAvalon = stationProfiles.find((station) => station.code === "WAV");
  assert.ok(westernAvalon);
  assert.deepEqual(westernAvalon.connectedCircuits.map(({ circuit }) => circuit), ["TL267", "TL203", "TL237", "TL208", "TL201", "TL217", "64L", "86L"]);
  assert.deepEqual(westernAvalon.feederRegister, ["WAV-01", "WAV-02", "WAV-03"]);
  assert.deepEqual(westernAvalon.circuitSources.map(({ sourceId }) => sourceId), ["np-2018-pub-np-084", "np-2025-ca-np-168"]);
  assert.deepEqual(westernAvalon.diagram.transformers.map(({ label, rating }) => [label, rating]), [["WAV-T1", "25 MVA"], ["WAV-T2", "25 MVA"], ["WAV-T3", "41.7 MVA"], ["WAV-T4", "41.7 MVA"], ["WAV-T5", "125 MVA"], ["WAV-T6", "13.30 MVA"]]);
  const modelFacts = westernAvalon.engineeringRecord.facts.flat().join(" ");
  const distributionFacts = westernAvalon.historyRecords.flatMap(({ facts }) => facts).flat().join(" ");
  assert.match(modelFacts, /WAV-T1 17.0 MVA; WAV-T2 17.3 MVA/);
  assert.match(westernAvalon.planningRecord.facts.flat().join(" "), /66\/12.5 kV; 13.30 MVA; 6.78 MVA 2026 forecast/);
  assert.match(distributionFacts, /Type H mechanism replaced with a Type VV mechanism/);
  assert.match(distributionFacts, /one of three feeders leaving Western Avalon Substation/);
  assert.match(distributionFacts, /construct 6.5 km of three-phase line along Route 201/);
  const main = await readFile(new URL("../src/main.js", import.meta.url), "utf8");
  assert.match(main, /profile\.circuitSources/);
  assert.match(main, /circuitSources\.map/);
});

test("Kelligrews preserves its filed 12.47 kV arrangement and later register entry", () => {
  const kelligrews = stationProfiles.find((station) => station.code === "KEL");
  assert.ok(kelligrews);
  assert.deepEqual(kelligrews.connectedCircuits.map(({ circuit }) => circuit), ["51L", "52L"]);
  assert.deepEqual(kelligrews.feederRegister, ["KEL-01", "KEL-02", "KEL-03"]);
  assert.deepEqual(kelligrews.diagram.transformers.map(({ label, rating }) => [label, rating]), [["KEL-T1", "25 MVA"]]);
  const filedFacts = kelligrews.engineeringRecord.facts.flat().join(" ");
  const laterEntry = kelligrews.planningRecord.facts.flat().join(" ");
  const historyFacts = kelligrews.historyRecords.flatMap(({ facts }) => facts).flat().join(" ");
  assert.match(filedFacts, /66\/12.47 kV; 25 MVA/);
  assert.match(filedFacts, /KEL-01, KEL-02, and KEL-03; 12.47 kV/);
  assert.match(laterEntry, /66\/25 kV; 25 MVA; 21.47 MVA 2026 forecast/);
  assert.match(kelligrews.assignmentRecord.facts.flat().join(" "), /Station customer count 4,020/);
  assert.match(historyFacts, /1977 as a 12.5 kV distribution substation/);
  assert.match(historyFacts, /25 MVA, 66\/12.5 kV transformer/);
  assert.match(historyFacts, /new 25 MVA Kelligrews transformer installed in 2011/);
  assert.match(historyFacts, /construct KEL-03.*477 ASC conductor/);
});

test("2026 refurbishment history records completed work at ten documented stations", () => {
  const expected = {
    GFS: /switchgear-building configuration.*feeder automation/,
    GLV: /tap-changer controller.*transformer protection/,
    KEL: /potential transformer.*transformer power cables/,
    GAN: /grounding transformer.*control building/,
    CLK: /tap-changer controllers.*remote monitoring/,
    CLV: /constructed a control building.*protection and control/,
    LEW: /converted the station from 66 kV to 138 kV/,
    OXP: /foundations and lightning arresters.*feeder automation/,
    KBR: /switchgear building.*feeder automation/,
    RRD: /low-voltage bus-tie breaker.*grounding system/
  };

  for (const [code, pattern] of Object.entries(expected)) {
    const profile = stationProfiles.find((station) => station.code === code);
    const completed = profile.historyRecords
      .filter((record) => record.sourceId === "np-2027-pub-np-005")
      .flatMap((record) => record.facts)
      .flat()
      .join(" ");
    assert.match(completed, pattern, `${code} completed-work record`);
  }

  const source = sources.find((item) => item.id === "np-2027-pub-np-005");
  assert.equal(source.pages, "physical PDF pp. 2 to 5");
});

test("Botwood, Carbonear, Gallant Street, and Heart's Content have dedicated station records", () => {
  const botwood = stationProfiles.find((station) => station.code === "BOT");
  const carbonear = stationProfiles.find((station) => station.code === "CAR");
  const gallantStreet = stationProfiles.find((station) => station.code === "GAL");
  const heartsContent = stationProfiles.find((station) => station.code === "HCT");

  assert.deepEqual(botwood.connectedCircuits.map(({ circuit }) => circuit), ["134L"]);
  assert.deepEqual(botwood.feederRegister, ["BOT-01", "BOT-02", "BOT-03"]);
  assert.match(botwood.engineeringRecord.facts.flat().join(" "), /138\/25 kV; 20 MVA.*three 25 kV feeders/);
  const bot01 = botwood.historyRecords.find((record) => record.sourceId === "np-2006-bot01-study");
  assert.match(bot01.facts.flat().join(" "), /approximately 199 km.*1,607 customers.*140 interruptions.*2,709,850 customer-minutes/);
  assert.match(bot01.facts.flat().join(" "), /7\.2 kV sections to 14\.4 kV insulation standards.*\$2\.585 million/);
  assert.deepEqual(botwood.referenceSheets.map((sheet) => [sheet.image, sheet.pages]), [
    ["./reference-maps/bot-01-2005-route.png", "physical PDF p. 403"]
  ]);
  assert.equal(sources.find((source) => source.id === "np-2006-bot01-study").status, "proposed");
  const bot01Completion = botwood.historyRecords.find((record) => record.sourceId === "np-2010-distribution-reliability");
  assert.match(bot01Completion.facts.flat().join(" "), /sections of BOT-01.*\$630,000 in 2008/);

  assert.deepEqual(carbonear.connectedCircuits.map(({ circuit }) => circuit), ["40L", "41L", "56L", "68L"]);
  assert.deepEqual(carbonear.feederRegister, ["CAR-01", "CAR-02", "CAR-03", "CAR-04"]);
  assert.match(carbonear.engineeringRecord.facts.flat().join(" "), /66\/12\.5 kV; 25 MVA/);
  assert.match(carbonear.planningRecord.facts.flat().join(" "), /66\/25 kV; 25 MVA/);

  assert.deepEqual(gallantStreet.connectedCircuits.map(({ circuit }) => circuit), ["401L", "402L", "406L"]);
  assert.deepEqual(gallantStreet.feederRegister, ["GAL-01", "GAL-03", "GAL-04", "GAL-05"]);
  assert.match(gallantStreet.engineeringRecord.facts.flat().join(" "), /26\.7 MVA combined.*four 12 kV feeders/);

  assert.deepEqual(heartsContent.connectedCircuits.map(({ circuit }) => circuit), ["41L", "43L", "80L"]);
  assert.deepEqual(heartsContent.feederRegister, ["HCT-01"]);
  assert.match(heartsContent.engineeringRecord.facts.flat().join(" "), /66\/2\.4 kV; 3 MVA generation transformer/);
  assert.match(heartsContent.planningRecord.facts.flat().join(" "), /66\/4\.2 kV; 3 MVA generation transformer/);
});

test("Molloy's Lane has a filed station record and feeder route sheets", () => {
  const molloys = stationProfiles.find((station) => station.code === "MOL");
  assert.ok(molloys);
  assert.deepEqual(molloys.feederRegister, ["MOL-01", "MOL-02", "MOL-03", "MOL-04", "MOL-05", "MOL-06", "MOL-08", "MOL-09"]);
  assert.deepEqual(molloys.mapPages, [["MOL-01", 108], ["MOL-02", 109], ["MOL-04", 110], ["MOL-05", 111], ["MOL-06", 112], ["MOL-09", 113]]);
  assert.equal(molloys.diagram.transformers.length, 2);
  assert.deepEqual(molloys.diagram.circuits.slice(0, 2).map(({ label, stationCode }) => [label, stationCode]), [["15L", "SLA"], ["19L", "HWD"]]);
  const facts = molloys.engineeringRecord.facts.flat().join(" ");
  assert.match(facts, /Built in 1960/);
  assert.match(facts, /approximately 8,900 customers/);
  assert.match(facts, /2023 proposed work/);
});

test("Airport separates the filed design from installed and proposed records", () => {
  const airport = stationProfiles.find((station) => station.code === "APT");
  assert.ok(airport);
  assert.deepEqual(airport.connectedCircuits.map(({ circuit, from_code }) => [circuit, from_code]), [["35L", "KEN"]]);
  assert.deepEqual(airport.feederRegister, ["APT-01", "APT-02"]);
  assert.deepEqual(airport.diagram.circuits.slice(0, 2).map(({ label, stationCode }) => [label, stationCode]), [["35L", "KEN"], ["33L", "OXP"]]);
  assert.deepEqual(airport.diagram.transformers.map(({ label, rating }) => [label, rating]), [["AIR-T1", "25 MVA"]]);
  assert.deepEqual(airport.referenceSheets.map(({ pages }) => pages), ["physical PDF p. 42", "physical PDF p. 44", "physical PDF p. 353", "physical PDF p. 354"]);
  const completionFacts = airport.engineeringRecord.facts.flat().join(" ");
  const currentFacts = airport.planningRecord.facts.flat().join(" ");
  const historyFacts = airport.historyRecords.flatMap(({ facts }) => facts).flat().join(" ");
  assert.match(completionFacts, /transmission lines and station transformer/);
  assert.match(completionFacts, /three feeders connected/);
  assert.match(currentFacts, /66\/25 kV; 25 MVA/);
  assert.match(historyFacts, /25 MVA, 66\/12\.47 kV/);
  assert.match(historyFacts, /first energized in March 2023/);
  assert.match(historyFacts, /82 A on phase B and 109 A on phase C; 85 A planning criterion/);
});

test("Massey Drive separates the customer bank from the Newfoundland Power 66 kV buses", () => {
  const massey = stationProfiles.find((station) => station.code === "MAS");
  assert.ok(massey);
  assert.deepEqual(massey.connectedCircuits.map(({ circuit }) => circuit), ["TL211", "TL228", "TL248", "351L", "352L", "356L", "357L"]);
  assert.deepEqual(massey.feederRegister, []);
  assert.deepEqual(massey.diagram.buses.map(({ voltage }) => voltage), ["230 kV", "66 kV", "66 kV"]);
  assert.deepEqual(massey.diagram.transformers.map(({ label, rating }) => [label, rating]), [["T1", "75/100/125 MVA"], ["T2", "40/53.3/66.7 MVA"], ["T3", "75/100/125 MVA"]]);
  assert.deepEqual(massey.referenceSheets.map(({ pages }) => pages), ["physical PDF p. 40", "physical PDF p. 238", "physical PDF p. 57"]);
  const siteFacts = massey.engineeringRecord.facts.flat().join(" ");
  const loadingFacts = massey.planningRecord.facts.flat().join(" ");
  const historyFacts = massey.historyRecords.flatMap(({ facts }) => facts).flat().join(" ");
  assert.match(siteFacts, /shared by Newfoundland Power, NL Hydro, and Deer Lake Power/);
  assert.match(siteFacts, /351L and 352L to Walbournes; 356L to Humber; 357L to Bayview/);
  assert.match(loadingFacts, /T1 75\/100\/125 MVA; 59\.76 MVA, 47\.8 percent/);
  assert.match(loadingFacts, /T2 40\/53\.3\/66\.7 MVA; 37\.71 MVA, 56\.5 percent/);
  assert.match(loadingFacts, /T3 75\/100\/125 MVA; 66\.84 MVA, 53\.5 percent/);
  assert.match(historyFacts, /First Hydro 66 kV station selected for the protection scheme/);
  assert.match(historyFacts, /Replace fifteen electromechanical relays.*with four digital relays/);
  assert.match(historyFacts, /fire-protection system was installed/);

  const terminal = islandTerminalRecords.find((station) => station.code === "MAS");
  assert.deepEqual(terminal.diagram.circuits.map(({ label }) => label), ["TL211", "TL228", "TL248", "351L", "352L", "356L", "357L"]);
});

test("Buchans joins the terminal transformer and Newfoundland Power distribution record", () => {
  const buchans = stationProfiles.find((station) => station.code === "BUC");
  assert.ok(buchans);
  assert.deepEqual(buchans.connectedCircuits.map(({ circuit }) => circuit), ["TL205", "TL232", "TL228", "TL233", "TL264", "TL280"]);
  assert.deepEqual(buchans.feederRegister, ["BUC-01", "BUC-02"]);
  assert.deepEqual(buchans.diagram.buses.map(({ voltage }) => voltage), ["230 kV", "66 kV", "12.5 kV"]);
  assert.deepEqual(buchans.diagram.transformers.map(({ label, rating }) => [label, rating]), [["BUC-T1", "40/53.3/66.6 MVA"], ["Local transformer", "66/12.5 kV"]]);
  assert.deepEqual(buchans.referenceSheets.map(({ pages }) => pages), ["physical PDF p. 268", "physical PDF p. 453", "physical PDF p. 51", "physical PDF p. 36"]);
  const distributionFacts = buchans.engineeringRecord.facts.flat().join(" ");
  const completionFacts = buchans.planningRecord.facts.flat().join(" ");
  const historyFacts = buchans.historyRecords.flatMap(({ facts }) => facts).flat().join(" ");
  assert.match(distributionFacts, /Two 12\.5 kV distribution feeder terminations/);
  assert.match(distributionFacts, /2\.0 MW Buchans Lake hydro plant/);
  assert.match(completionFacts, /Replace Transformer T1, Buchans Status Complete/);
  assert.match(historyFacts, /Hardwoods spare, 230\/66 kV, 40\/53\.3\/66\.6 MVA/);
  assert.match(historyFacts, /Tap changer oil replacement, access hatch re-gasketing, and leak repairs/);
});

test("Sunnyside joins the Hydro terminal and Newfoundland Power distribution equipment", () => {
  const sunnyside = stationProfiles.find((station) => station.code === "SUN");
  assert.ok(sunnyside);
  assert.deepEqual(sunnyside.connectedCircuits.map(({ circuit }) => circuit), ["TL202", "TL206", "TL203", "TL207", "TL212", "TL219", "100L", "109L"]);
  assert.deepEqual(sunnyside.feederRegister, ["SUN-01", "SUN-03"]);
  assert.deepEqual(sunnyside.diagram.buses.map(({ voltage }) => voltage), ["230 kV", "138 kV", "25 kV"]);
  assert.deepEqual(sunnyside.diagram.transformers.map(({ label, rating }) => [label, rating]), [["T1", "75/100/125 MVA"], ["T4", "75/100/125 MVA"], ["SUN-T5", "25 MVA"]]);
  assert.deepEqual(sunnyside.referenceSheets.map(({ pages }) => pages), ["physical PDF p. 2", "physical PDF p. 492", "physical PDF p. 493"]);
  const operatingFacts = sunnyside.engineeringRecord.facts.flat().join(" ");
  const currentFacts = sunnyside.planningRecord.facts.flat().join(" ");
  const historyFacts = sunnyside.historyRecords.flatMap(({ facts }) => facts).flat().join(" ");
  assert.match(operatingFacts, /SUN-T5 138\/25 kV; 15\/20\/25 MVA/);
  assert.match(operatingFacts, /SUN-01 to Arnold's Cove and GBS site/);
  assert.match(currentFacts, /SUN-T5 138\/25 kV; 25 MVA/);
  assert.match(currentFacts, /9\.64 MVA/);
  assert.match(historyFacts, /Former Holyrood T8 moved to the Sunnyside T1 position/);
  assert.match(historyFacts, /SUN-03-R electronic recloser 230516/);
});

test("Howley joins the terminal routes and local distribution record", () => {
  const howley = stationProfiles.find((station) => station.code === "HOW");
  assert.ok(howley);
  assert.deepEqual(howley.connectedCircuits.map(({ circuit }) => circuit), ["TL245", "TL243", "TL224", "TL251"]);
  assert.deepEqual(howley.feederRegister, ["HOW-01"]);
  assert.deepEqual(howley.diagram.buses.map(({ voltage }) => voltage), ["138 kV", "69 kV"]);
  assert.deepEqual(howley.diagram.transformers.map(({ label, rating }) => [label, rating]), [["HOW-T2", "7.5/10/12.5 MVA"]]);
  assert.deepEqual(howley.referenceSheets.map(({ pages }) => pages), ["physical PDF p. 219", "physical PDF p. 220"]);
  const terminalFacts = howley.engineeringRecord.facts.flat().join(" ");
  const distributionFacts = howley.planningRecord.facts.flat().join(" ");
  const inspectionFacts = howley.historyRecords.flatMap(({ facts }) => facts).flat().join(" ");
  assert.match(terminalFacts, /138\/69\/4\.16 kV; 7\.5\/10\/12\.5 MVA/);
  assert.match(distributionFacts, /HOW-T3 25\/4\.2 kV; 1 MVA/);
  assert.match(inspectionFacts, /HOW-01-R and hydraulic recloser equipment 230371/);
});

test("Pepperell and Virginia Waters records separate completed work from rejected alternatives", () => {
  const pepperell = stationProfiles.find((station) => station.code === "PEP");
  const virginiaWaters = stationProfiles.find((station) => station.code === "VIR");
  const pepperellFacts = [
    ...pepperell.engineeringRecord.facts.flat(),
    ...pepperell.planningRecord.facts.flat()
  ].join(" ");
  const virginiaFacts = virginiaWaters.engineeringRecord.facts.flat().join(" ");
  assert.deepEqual(pepperell.feederRegister, ["PEP-01", "PEP-02", "PEP-03", "PEP-04", "PEP-05"]);
  assert.match(pepperellFacts, /PEP-T1 and PEP-T2, 25 MVA each/);
  assert.match(pepperellFacts, /collapsed underground ductwork/);
  assert.deepEqual(virginiaWaters.feederRegister, ["VIR-01", "VIR-02", "VIR-03", "VIR-04", "VIR-05", "VIR-06", "VIR-07", "VIR-08"]);
  assert.match(virginiaFacts, /new Airport Substation/);
  assert.match(virginiaFacts, /VIR-T4.*not part of the selected expansion/);
});

test("Pulpit Rock record separates the feeder bus from dual-secondary equipment", () => {
  const pulpit = stationProfiles.find((station) => station.code === "PUL");
  assert.deepEqual(pulpit.feederRegister, ["PUL-01", "PUL-02", "PUL-03", "PUL-04", "PUL-05"]);
  const facts = pulpit.engineeringRecord.facts.flat().join(" ");
  const history = pulpit.historyRecords.flatMap((record) => record.facts).flat().join(" ");
  assert.match(facts, /five 12\.5 kV feeders/);
  assert.match(facts, /66\/12\.5\/25 kV/);
  assert.match(facts, /third quarter of 2026/);
  assert.match(facts, /25 MVA replacement energized in 2011/);
  assert.match(facts, /commissioning record not located/);
  assert.match(history, /installed as SLA-T4 in 2021/);
  assert.match(history, /asset 200331/);
  assert.doesNotMatch(facts, /not found/);
});

test("Petty Harbour separates the 33 kV plant connection from 4.16 kV distribution", () => {
  const pettyHarbour = stationProfiles.find((station) => station.code === "PHR");
  assert.ok(pettyHarbour);
  assert.deepEqual(pettyHarbour.connectedCircuits, [
    { circuit: "3L", from: "Goulds", from_code: "GOU", to: "Petty Harbour", to_code: "PHR" }
  ]);
  assert.deepEqual(pettyHarbour.feederRegister, ["PHR-01"]);
  assert.deepEqual(pettyHarbour.diagram.buses.map(({ voltage }) => voltage), ["33 kV", "2.4 kV", "4.16 kV"]);
  assert.deepEqual(pettyHarbour.diagram.transformers.map(({ label, rating }) => [label, rating]), [
    ["PHR-T1", "6.70 MVA"],
    ["PHR-T3", "4.00 MVA"]
  ]);
  const operatingFacts = pettyHarbour.engineeringRecord.facts.flat().join(" ");
  const planningFacts = pettyHarbour.planningRecord.facts.flat().join(" ");
  const historyFacts = pettyHarbour.historyRecords.flatMap(({ facts }) => facts).flat().join(" ");
  assert.match(operatingFacts, /3L from Goulds; energized at 33 kV/);
  assert.match(operatingFacts, /three horizontal units; 5\.3 MW/);
  assert.match(planningFacts, /PHR-T1 generation transformer; table prints 66\/2\.4 kV; 6\.70 MVA/);
  assert.match(historyFacts, /PHR-T1 generation transformer; 33\/2\.4 kV; 6\.70 MVA/);
  assert.match(historyFacts, /PHR-3L-B, bulk-oil circuit breaker/);
  assert.match(historyFacts, /PHR-01-R recloser/);
  assert.match(historyFacts, /4,279 to 4,739 kW/);
  assert.match(historyFacts, /4,739 kW at the 1045 Island Time interval/);
  assert.match(historyFacts, /deferred for further engineering assessment/);
});

test("Tors Cove records the completed replacement and the filed generator arrangement", async () => {
  const torsCove = stationProfiles.find((station) => station.code === "TCV");
  assert.ok(torsCove);
  assert.deepEqual(torsCove.connectedCircuits, [
    { circuit: "11L", from: "Tors Cove", from_code: "TCV", to: "Mobile", to_code: "MOB" }
  ]);
  assert.deepEqual(torsCove.diagram.buses.map(({ voltage }) => voltage), ["66 kV", "6.9 kV"]);
  assert.deepEqual(torsCove.diagram.transformers.map(({ label, rating }) => [label, rating]), [["TCV-T1", "7.5 MVA"]]);
  assert.deepEqual(torsCove.diagram.generators.map(({ label, rating }) => [label, rating]), [
    ["G1", "2.35 MVA / 85% PF"],
    ["G2", "2.35 MVA / 85% PF"],
    ["G3", "2.75 MVA / 85% PF"]
  ]);
  const historyFacts = torsCove.historyRecords.flatMap(({ facts }) => facts).flat().join(" ");
  assert.match(historyFacts, /refurbishment completed, including a new power transformer/);
  assert.match(historyFacts, /new fenced yard approximately 50 m/);
  assert.match(historyFacts, /TCV-G1-B, TCV-G2-B and TCV-G3-B/);
  assert.match(historyFacts, /2,777 to 6,068 kW/);
  assert.match(historyFacts, /6,068 kW at the 1130 Island Time interval/);
  assert.deepEqual(torsCove.referenceSheets.map(({ image, pages }) => [image, pages]), [
    ["./reference-maps/tcv-2022-one-line.svg", "physical PDF p. 332"]
  ]);
  await readFile(new URL("../public/reference-maps/tcv-2022-one-line.svg", import.meta.url));
});

test("Horse Chops separates the rebuilt station from later generator and control work", () => {
  const horseChops = stationProfiles.find((station) => station.code === "HCP");
  assert.ok(horseChops);
  assert.deepEqual(horseChops.connectedCircuits, [
    { circuit: "21L", from: "Horse Chops", from_code: "HCP", to: "Horse Chops Tap", to_code: null }
  ]);
  assert.deepEqual(horseChops.diagram.buses.map(({ voltage }) => voltage), ["66 kV", "6.9 kV"]);
  assert.deepEqual(horseChops.diagram.transformers.map(({ label, rating }) => [label, rating]), [["HCP-T1", "12.0 MVA"]]);
  assert.deepEqual(horseChops.diagram.generators.map(({ label, rating }) => [label, rating]), [["G1", "9.0 MVA"]]);
  const plantFacts = horseChops.engineeringRecord.facts.flat().join(" ");
  const historyFacts = horseChops.historyRecords.flatMap(({ facts }) => facts).flat().join(" ");
  assert.match(plantFacts, /46\.70 GWh/);
  assert.match(plantFacts, /water passes through Horse Chops before flowing downstream to Cape Broyle/);
  assert.match(historyFacts, /substation refurbished in 2009/);
  assert.match(historyFacts, /66\/6\.9 kV; 8\.0 MVA; asset 200165/);
  assert.match(historyFacts, /1\.47 to 1\.79/);
  assert.match(historyFacts, /HCP-G-B air circuit breaker, asset 210611/);
  assert.match(historyFacts, /7,728 to 7,885 kW/);
  assert.match(historyFacts, /7,885 kW at the 1115 Island Time interval/);
  assert.match(historyFacts, /design complete; field work expected to begin in the third quarter of 2026/);
});

test("Pierre's Brook separates the installed 66 kV station from filed conversion and refurbishment scopes", () => {
  const pierresBrook = stationProfiles.find((station) => station.code === "PBK");
  assert.ok(pierresBrook);
  assert.deepEqual(pierresBrook.connectedCircuits, [
    { circuit: "23L", from: "Pierre's Brook", from_code: "PBK", to: "Mobile", to_code: "MOB" }
  ]);
  assert.deepEqual(pierresBrook.diagram.buses.map(({ voltage }) => voltage), ["66 kV", "6.9 kV"]);
  assert.deepEqual(pierresBrook.diagram.transformers.map(({ label, rating }) => [label, rating]), [["PBK-T1", "6.67 MVA"]]);
  assert.deepEqual(pierresBrook.diagram.generators.map(({ label, rating }) => [label, rating]), [["G1", "4.0 MVA / 80% PF"]]);
  const plantFacts = pierresBrook.engineeringRecord.facts.flat().join(" ");
  const historyFacts = pierresBrook.historyRecords.flatMap(({ facts }) => facts).flat().join(" ");
  assert.match(plantFacts, /4,100 kW actual peak output/);
  assert.match(historyFacts, /new 66 kV substation and replacement power transformer/);
  assert.match(historyFacts, /23L was a 5\.5 km, 33 kV radial line built in 1942/);
  assert.match(historyFacts, /2012 forecast peak 3\.98 MVA; 34\.6 A; 7% loading/);
  assert.match(historyFacts, /PBK-T1, asset 200356/);
  assert.match(historyFacts, /PBK-G-B air circuit breaker, asset 210551/);
  assert.match(historyFacts, /replacement of the 1972 assembly/);
  assert.match(historyFacts, /3,545 to 4,013 kW/);
  assert.match(historyFacts, /4,013 kW at the 1115 Island Time interval/);
  assert.equal(pierresBrook.historyRecords.find(({ label }) => label.includes("FILED ELECTRICAL"))?.sourceId, "np-2016-pierre-brook");
});

test("Rocky Pond joins the segmented 66 kV corridor to the rebuilt hydro plant", () => {
  const rockyPond = stationProfiles.find((station) => station.code === "ROP");
  assert.ok(rockyPond);
  assert.deepEqual(rockyPond.connectedCircuits, [
    { circuit: "20L(A)", from: "Rocky Pond", from_code: "ROP", to: "Mobile", to_code: "MOB" },
    { circuit: "20L(B)", from: "Horse Chops Tap", from_code: null, to: "Rocky Pond", to_code: "ROP" },
    { circuit: "22L", from: "Morris", from_code: "MRP", to: "Rocky Pond", to_code: "ROP" }
  ]);
  assert.deepEqual(rockyPond.diagram.buses.map(({ voltage }) => voltage), ["66 kV", "6.9 kV"]);
  assert.deepEqual(rockyPond.diagram.transformers.map(({ label, rating }) => [label, rating]), [["ROP-T1", "5.33 MVA"]]);
  assert.deepEqual(rockyPond.diagram.generators.map(({ label, rating }) => [label, rating]), [["G1", "3.25 MW plant capacity"]]);
  const plantFacts = rockyPond.engineeringRecord.facts.flat().join(" ");
  const historyFacts = rockyPond.historyRecords.flatMap(({ facts }) => facts).flat().join(" ");
  assert.match(plantFacts, /3\.25 MW under 32\.6 m net head/);
  assert.match(historyFacts, /shut the plant down for eight months/);
  assert.match(historyFacts, /governor, generator, penstock and substation refurbishment completed/);
  assert.match(historyFacts, /20L\(A\).*36\.96 MVA.*37% loading/);
  assert.match(historyFacts, /ROP-T1, asset 200148/);
  assert.match(historyFacts, /ROP-G1-B vacuum circuit breaker, asset 210675/);
  assert.match(historyFacts, /2,934 to 3,224 kW/);
  assert.match(historyFacts, /3,224 kW at the 1030 Island Time interval/);
  assert.match(historyFacts, /packing was described as a temporary fix/);
});

test("Morris closes the 22L branch and preserves its hydraulic link to Mobile", () => {
  const morris = stationProfiles.find((station) => station.code === "MRP");
  assert.ok(morris);
  assert.deepEqual(morris.connectedCircuits, [
    { circuit: "22L", from: "Morris", from_code: "MRP", to: "Rocky Pond", to_code: "ROP" }
  ]);
  assert.deepEqual(morris.diagram.buses.map(({ voltage }) => voltage), ["66 kV", "2.4 kV"]);
  assert.deepEqual(morris.diagram.transformers.map(({ label, rating }) => [label, rating]), [["MRP-T1", "1.50 MVA"]]);
  assert.deepEqual(morris.diagram.generators.map(({ label, rating }) => [label, rating]), [["G1", "1.135 MW plant capacity"]]);
  const plantFacts = morris.engineeringRecord.facts.flat().join(" ");
  const historyFacts = morris.historyRecords.flatMap(({ facts }) => facts).flat().join(" ");
  assert.match(plantFacts, /1,135 kW under 30\.0 m net head/);
  assert.match(historyFacts, /Morris to Rocky Pond; 66 kV/);
  assert.match(historyFacts, /MRP-T1, asset 200326/);
  assert.match(historyFacts, /MRP-G-B air circuit breaker, asset 210550/);
  assert.match(historyFacts, /SAGE 2100 remote terminal unit/);
  assert.match(historyFacts, /water is used first at Morris and then flows downstream to Mobile/);
  assert.match(historyFacts, /no programmable logic controller/);
  assert.match(historyFacts, /Morris Plant Substation to Morris Plant Tap/);
  assert.match(historyFacts, /960 to 963 kW/);
  assert.match(historyFacts, /963 kW at the 1030 Island Time interval/);
  assert.match(historyFacts, /held open with straps/);
});

test("New Chelsea joins the Heart's Content and Old Perlican corridor to generation and local distribution", () => {
  const newChelsea = stationProfiles.find((station) => station.code === "NCH");
  assert.ok(newChelsea);
  assert.deepEqual(newChelsea.connectedCircuits, [
    { circuit: "43L", from: "Heart's Content", from_code: "HCT", to: "New Chelsea", to_code: "NCH" },
    { circuit: "65L", from: "New Chelsea", from_code: "NCH", to: "Old Perlican", to_code: "OPL" }
  ]);
  assert.deepEqual(newChelsea.feederRegister, ["NCH-01", "NCH-02", "NCH-03"]);
  assert.deepEqual(newChelsea.diagram.buses.map(({ voltage }) => voltage), ["66 kV", "12.5 kV", "6.9 kV"]);
  assert.deepEqual(newChelsea.diagram.transformers.map(({ label, rating }) => [label, rating]), [
    ["NCH-T1", "6.67 MVA"],
    ["NCH-T2", "5.33 MVA"]
  ]);
  const plantFacts = newChelsea.engineeringRecord.facts.flat().join(" ");
  const planningFacts = newChelsea.planningRecord.facts.flat().join(" ");
  const historyFacts = newChelsea.historyRecords.flatMap(({ facts }) => facts).flat().join(" ");
  assert.match(plantFacts, /3\.70 MW maximum output under 83\.8 m net head/);
  assert.match(plantFacts, /83% at 3\.3 MW; 82% at 3\.7 MW/);
  assert.match(planningFacts, /NCH-T1.*66\/12\.5 kV.*6\.67 MVA.*4\.17 MVA 2026 forecast/);
  assert.match(planningFacts, /NCH-T2.*66\/6\.9 kV.*5\.33 MVA/);
  assert.match(historyFacts, /steel penstock/);
  assert.match(historyFacts, /high-efficiency stainless-steel runner/);
  assert.match(historyFacts, /stator, rotor and exciter being overhauled in Ontario/);
  assert.match(historyFacts, /43L.*8\.45 MVA.*10% loading/);
  assert.match(historyFacts, /65L.*9\.83 MVA.*18% loading/);
  assert.match(historyFacts, /NCH-T1, asset 200252/);
  assert.match(historyFacts, /NCH-T2, asset 200253/);
  assert.match(historyFacts, /3,583 to 4,144 kW/);
  assert.match(historyFacts, /4,144 kW at the 1030 Island Time interval/);
});

test("Pitmans Pond connects its induction generator to New Chelsea through NCH-03", () => {
  const pitmans = stationProfiles.find((station) => station.code === "PIT");
  assert.ok(pitmans);
  assert.deepEqual(pitmans.connectedCircuits, [
    { circuit: "NCH-03", from: "New Chelsea", from_code: "NCH", to: "Pitmans Pond", to_code: "PIT" }
  ]);
  assert.deepEqual(pitmans.diagram.buses.map(({ voltage }) => voltage), ["12.5 kV", "2.4 kV"]);
  assert.deepEqual(pitmans.diagram.transformers.map(({ label, rating }) => [label, rating]), [
    ["PIT-T1-A", "0.33 MVA"],
    ["PIT-T1-B", "0.33 MVA"],
    ["PIT-T1-C", "0.33 MVA"]
  ]);
  assert.deepEqual(pitmans.diagram.generators.map(({ label, rating }) => [label, rating]), [
    ["G1", "1,000 kVA induction, 85% PF"]
  ]);
  const plantFacts = pitmans.engineeringRecord.facts.flat().join(" ");
  const planningFacts = pitmans.planningRecord.facts.flat().join(" ");
  const historyFacts = pitmans.historyRecords.flatMap(({ facts }) => facts).flat().join(" ");
  assert.match(plantFacts, /625 kW under approximately 21\.3 m net head/);
  assert.match(plantFacts, /850 kW load rating/);
  assert.match(plantFacts, /NCH-03, a 12\.5 kV distribution feeder/);
  assert.match(planningFacts, /PIT-T1-A.*12\.5\/4\.2 kV.*0\.33 MVA/);
  assert.match(planningFacts, /2013 development and plant records identify the generator bus as 2\.4 kV/);
  assert.match(historyFacts, /failed unit replaced with spare equipment/);
  assert.match(historyFacts, /PLC-based digital gate positioner/);
  assert.match(historyFacts, /remote monitoring and control from New Chelsea/);
  assert.match(historyFacts, /installed capacity increased from 640 kW to 700 kW/);
  assert.match(historyFacts, /PIT-T1, asset 201054/);
  assert.match(historyFacts, /673 to 674 kW/);
});

test("Topsail separates its internal generation connection from the external transmission network", () => {
  const topsail = stationProfiles.find((station) => station.code === "TOP");
  assert.ok(topsail);
  assert.deepEqual(topsail.connectedCircuits, []);
  assert.deepEqual(topsail.diagram.buses.map(({ voltage }) => voltage), ["25 kV", "2.4 kV"]);
  assert.deepEqual(topsail.diagram.transformers.map(({ label, rating }) => [label, rating]), [["TOP-T1", "0.75 MVA"]]);
  assert.deepEqual(topsail.diagram.generators.map(({ label, rating }) => [label, rating]), [["G1", "2.6 MW"]]);
  const plantFacts = topsail.engineeringRecord.facts.flat().join(" ");
  const planningFacts = topsail.planningRecord.facts.flat().join(" ");
  const historyFacts = topsail.historyRecords.flatMap(({ facts }) => facts).flat().join(" ");
  assert.match(plantFacts, /2\.6 MW turbine-generator operating at 85\.5 m rated net head/);
  assert.match(plantFacts, /13\.3 GWh per year/);
  assert.match(planningFacts, /TOP-T1.*25\/2\.4 kV.*0\.75 MVA/);
  assert.match(historyFacts, /1,915 m long and 1,067 mm diameter/);
  assert.match(historyFacts, /no transmission into or out of Topsail Substation/);
  assert.match(historyFacts, /heavy cavitation damage/);
  assert.match(historyFacts, /\$8\.288 million actual/);
  assert.match(historyFacts, /TOP-T1, asset 201074/);
  assert.match(historyFacts, /combination thrust and guide bearing failures/);
  assert.match(historyFacts, /attempted repair that was unsuccessful/);
  assert.match(historyFacts, /1,190,064 kWh in 2025/);
});

test("Sandy Brook connects the rebuilt hydro plant to Grand Falls through 105L", () => {
  const sandyBrook = stationProfiles.find((station) => station.code === "SBK");
  assert.ok(sandyBrook);
  assert.deepEqual(sandyBrook.connectedCircuits, [
    { circuit: "105L", from: "Grand Falls", from_code: "GFS", to: "Sandy Brook", to_code: "SBK" }
  ]);
  assert.deepEqual(sandyBrook.diagram.buses.map(({ voltage }) => voltage), ["66 kV", "6.9 kV"]);
  assert.deepEqual(sandyBrook.diagram.transformers.map(({ label, rating }) => [label, rating]), [["SBK-T1", "7.0 MVA"]]);
  assert.deepEqual(sandyBrook.diagram.generators.map(({ label, rating }) => [label, rating]), [["SBK-G1", "6.31 MW"]]);
  const plantFacts = sandyBrook.engineeringRecord.facts.flat().join(" ");
  const planningFacts = sandyBrook.planningRecord.facts.flat().join(" ");
  const historyFacts = sandyBrook.historyRecords.flatMap(({ facts }) => facts).flat().join(" ");
  assert.match(plantFacts, /6\.31 MW unit operating at 33\.5 m rated net head/);
  assert.match(plantFacts, /29\.41 GWh per year/);
  assert.match(plantFacts, /requested generation 352 times/);
  assert.match(planningFacts, /SBK-T1.*66\/6\.9 kV.*7\.0 MVA/);
  assert.match(historyFacts, /105L.*40\.1 MVA.*5\.75 MVA.*14% loading/);
  assert.match(historyFacts, /runner and wicket gates replaced in 2001/);
  assert.match(historyFacts, /336 m long and 2\.6 m diameter/);
  assert.match(historyFacts, /joint leakage, stave brooming and decay/);
  assert.match(historyFacts, /rewind the generator stator and reinsulate the rotor poles/);
  assert.match(historyFacts, /completed in the fourth quarter of 2023/);
  assert.match(historyFacts, /SBK-T1, asset 200181/);
});

test("West Brook preserves the current transformer entries and dated plant records", () => {
  const westBrook = stationProfiles.find((station) => station.code === "WBK");
  assert.ok(westBrook);
  assert.deepEqual(westBrook.connectedCircuits, []);
  assert.deepEqual(westBrook.feederRegister, ["LAU-01"]);
  assert.deepEqual(westBrook.diagram.buses.map(({ voltage }) => voltage), ["12.5 kV", "4.2 kV"]);
  assert.deepEqual(westBrook.diagram.transformers.map(({ label, rating }) => [label, rating]), [["WBK-T1 A/B/C", "3 x 0.33 MVA"]]);
  assert.deepEqual(westBrook.diagram.generators.map(({ label, rating }) => [label, rating]), [["G1", "0.72 MW"]]);
  const plantFacts = westBrook.engineeringRecord.facts.flat().join(" ");
  const planningFacts = westBrook.planningRecord.facts.flat().join(" ");
  const historyFacts = westBrook.historyRecords.flatMap(({ facts }) => facts).flat().join(" ");
  assert.match(plantFacts, /constructed in 1942/);
  assert.match(plantFacts, /680 kW.*0\.72 MW/);
  assert.match(plantFacts, /47\.0 m net head/);
  assert.match(plantFacts, /run-of-river operation with no system storage/);
  assert.match(plantFacts, /3\.4 GWh per year/);
  assert.match(planningFacts, /three generation-transformer entries.*12\.5\/4\.2 kV.*0\.33 MVA/);
  assert.match(historyFacts, /three 6\.9\/12\.5 kV step-up transformer replacements/);
  assert.match(historyFacts, /1967 by a 24-inch butterfly valve/);
  assert.match(historyFacts, /actuator failed open in 2009/);
  assert.match(historyFacts, /1,742,324 kWh/);
  assert.match(historyFacts, /no capital project relating to West Brook was approved for 2026/);
});

test("Fall Pond preserves the LAU-01 connection and current generating bank", () => {
  const fallPond = stationProfiles.find((station) => station.code === "FPD");
  assert.ok(fallPond);
  assert.deepEqual(fallPond.connectedCircuits, []);
  assert.deepEqual(fallPond.feederRegister, ["LAU-01"]);
  assert.deepEqual(fallPond.diagram.buses.map(({ voltage }) => voltage), ["12.5 kV", "4.2 kV"]);
  assert.deepEqual(fallPond.diagram.transformers.map(({ label, rating }) => [label, rating]), [["FPD-T1 A/B/C", "3 x 0.25 MVA"]]);
  assert.deepEqual(fallPond.diagram.generators.map(({ label, rating }) => [label, rating]), [["G1", "0.35 MW"]]);
  const plantFacts = fallPond.engineeringRecord.facts.flat().join(" ");
  const planningFacts = fallPond.planningRecord.facts.flat().join(" ");
  const historyFacts = fallPond.historyRecords.flatMap(({ facts }) => facts).flat().join(" ");
  assert.match(plantFacts, /commissioned in 1939/);
  assert.match(plantFacts, /15\.2 m net head/);
  assert.match(plantFacts, /42 MWh of storage.*five days/);
  assert.match(plantFacts, /1\.2 GWh per year/);
  assert.match(planningFacts, /FPD-T1-A\/B\/C.*12\.5\/4\.2 kV.*0\.25 MVA/);
  assert.match(historyFacts, /dam rehabilitation from July through October/);
  assert.match(historyFacts, /allocated \$10,000 to replace the Fall Pond runner/);
  assert.match(historyFacts, /three 6\.9\/12\.5 kV step-up transformer replacements/);
  assert.match(historyFacts, /rehabilitate buttresses, decking and concrete faces/);
  assert.match(historyFacts, /891,892 kWh/);
  assert.match(historyFacts, /no capital project relating to Fall Pond was approved for 2026/);
});

test("Lawn separates its external connection, Igor repairs, and current outage", () => {
  const lawn = stationProfiles.find((station) => station.code === "LWN");
  assert.ok(lawn);
  assert.deepEqual(lawn.connectedCircuits, []);
  assert.deepEqual(lawn.feederRegister, ["WBC-01"]);
  assert.deepEqual(lawn.diagram.buses.map(({ voltage }) => voltage), ["25 kV"]);
  assert.deepEqual(lawn.diagram.transformers, []);
  assert.deepEqual(lawn.diagram.generators.map(({ label, rating }) => [label, rating]), [["G1, OUT OF SERVICE", "0.6 MW"]]);
  const plantFacts = lawn.engineeringRecord.facts.flat().join(" ");
  const planningFacts = lawn.planningRecord.facts.flat().join(" ");
  const historyFacts = lawn.historyRecords.flatMap(({ facts }) => facts).flat().join(" ");
  assert.match(plantFacts, /commissioned in 1929.*refurbished in 1983/);
  assert.match(plantFacts, /600 kW horizontal Francis turbine.*Ideal Electric generator/);
  assert.match(plantFacts, /two original Voith turbines/);
  assert.match(plantFacts, /24\.3 m net head/);
  assert.match(plantFacts, /WBC-01.*25 kV.*7\.2 MVA/);
  assert.match(planningFacts, /deferred from 2027 to 2031/);
  assert.match(historyFacts, /overtopped by 0\.45 m.*284 m3\/s/);
  assert.match(historyFacts, /six timber penstock supports washed out/);
  assert.match(historyFacts, /\$450,000.*2\.6 GWh/);
  assert.match(historyFacts, /concrete was breaking from the intake structure/);
  assert.match(historyFacts, /penstock failure in June 2025/);
  assert.match(historyFacts, /remained out of service.*September 17, 2026/);
  assert.match(historyFacts, /1,086,742 kWh/);
});

test("Memorial and Long Pond records preserve the filed Health Sciences supply paths", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const memorial = stationProfiles.find((station) => station.code === "MUN");
  const longPond = stationProfiles.find((station) => station.code === "LPD");
  const memorialFacts = memorial.engineeringRecord.facts.flat().join(" ");
  const longPondFacts = longPond.engineeringRecord.facts.flat().join(" ");
  assert.deepEqual(memorial.feederRegister, ["MUN-01", "MUN-02", "MUN-03", "MUN-04", "MUN-05", "MUN-06", "MUN-07", "MUN-08", "MUN-09", "MUN-10"]);
  assert.match(memorialFacts, /MUN-01 and MUN-08/);
  assert.deepEqual(longPond.connectedCircuits, [{ circuit: "36L", from: "Oxen Pond", from_code: "OXP", to: "Long Pond", to_code: "LPD" }]);
  assert.match(longPondFacts, /HSC #2 and HSC #5/);
  assert.deepEqual(longPond.historyRecords.map((record) => record.sourceId), ["gnl-2018-hsc-award", "np-2019-long-pond", "pu-5-2019-long-pond"]);
  assert.match(longPond.historyRecords[0].facts.flat().join(" "), /JSM Electrical Ltd\./);
  assert.match(longPond.historyRecords[0].facts.flat().join(" "), /\$4,422,267\.50/);
  assert.match(longPond.historyRecords[1].facts.flat().join(" "), /1\.4 km/);
  assert.match(longPond.historyRecords[1].facts.flat().join(" "), /3,200 m2 in Schedule B; 2,400 m2 in Schedule C/);
  assert.match(longPond.historyRecords[2].facts.flat().join(" "), /reimbursed Newfoundland Power/);
  assert.match(longPond.historyRecords[2].facts.flat().join(" "), /not recovered from other ratepayers/);
  assert.deepEqual(longPond.referenceSheets.map((sheet) => sheet.image), ["./reference-maps/lpd-2019-proposed-one-line.jpeg", "./reference-maps/lpd-2019-36l-route.jpeg"]);
  await readFile(new URL("../public/reference-maps/lpd-2019-proposed-one-line.jpeg", import.meta.url));
  await readFile(new URL("../public/reference-maps/lpd-2019-36l-route.jpeg", import.meta.url));
  assert.match(html, /aria-label="36L to Oxen Pond Terminal Station"/);
  assert.match(html, /LPD-B1\/B2-B/);
  assert.match(html, /MUN-29[\s\S]*MUN-20/);
});

test("MUN archive records retain the 1975 HSC equipment captions", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const note = await readFile(new URL("../research/MUN_HSC_ARCHIVAL_PHOTOGRAPHS.md", import.meta.url), "utf8");
  const archiveIds = ["mun-hsc-1975-substation-3", "mun-hsc-1975-deutz-diesels", "mun-hsc-1975-auxiliary-diesel"];
  for (const id of archiveIds) {
    const source = sources.find((item) => item.id === id);
    assert.ok(source);
    assert.match(source.url, /^https:\/\/collections\.mun\.ca\/digital\/collection\/ed_photos8\/id\//);
  }
  assert.equal((html.match(/data-component="mun-hsc-history"/g) || []).length, 2);
  assert.match(components["mun-hsc-history"].data.flat().join(" "), /1,500 kVA, 12.8 kV to 347\/600 V/);
  assert.match(components["mun-hsc-history"].data.flat().join(" "), /Three Deutz diesels/);
  assert.match(note, /reproduction requires written permission/);
});

test("King's Bridge and Ridge Road records preserve current and historical feeder counts", () => {
  const kingsBridge = stationProfiles.find((station) => station.code === "KBR");
  const ridgeRoad = stationProfiles.find((station) => station.code === "RRD");
  const kingsBridgeFacts = kingsBridge.engineeringRecord.facts.flat().join(" ");
  const ridgeRoadFacts = ridgeRoad.engineeringRecord.facts.flat().join(" ");
  assert.match(kingsBridgeFacts, /12L from Memorial; 16L from Pepperell; 30L from Ridge Road/);
  assert.match(kingsBridgeFacts, /six 12\.5 kV distribution feeders/);
  assert.match(kingsBridgeFacts, /43\.7 MVA/);
  assert.match(ridgeRoadFacts, /30L from King's Bridge; 32L and 67L from Oxen Pond/);
  assert.match(ridgeRoadFacts, /eight 12\.5 kV distribution feeders/);
  assert.match(ridgeRoadFacts, /34\.7 MVA/);
  assert.match(ridgeRoadFacts, /3\.1 MVA exposed/);
});

test("Goulds record connects the switching station, distribution bank, and feeder maps", () => {
  const goulds = stationProfiles.find((station) => station.code === "GOU");
  const facts = goulds.engineeringRecord.facts.flat().join(" ");
  assert.deepEqual(goulds.mapPages, [["GOU-01", 67], ["GOU-02", 68], ["GOU-03", 69]]);
  assert.match(facts, /4L and 25L to St\. John's Main/);
  assert.match(facts, /66\/33 kV supply to 3L and Petty Harbour/);
  assert.match(facts, /GOU-T2 and GOU-T3, 33 MVA combined at 12\.5 kV/);
  assert.deepEqual(goulds.planningRecord.facts, [
    ["GOU-02", "12.5 kV; 12.7 MVA feeder planning capacity"],
    ["GOU-T2 and GOU-T3", "20 MVA and 13.3 MVA"],
    ["Customers served by station", "4,471"]
  ]);
});

test("Glendale, St. John's Main, and Stamp's Lane retain their filed station records", () => {
  const hardwoods = stationProfiles.find((station) => station.code === "HWD");
  const glendale = stationProfiles.find((station) => station.code === "GDL");
  const stJohnsMain = stationProfiles.find((station) => station.code === "SJM");
  const stampsLane = stationProfiles.find((station) => station.code === "SLA");
  const glendaleFacts = glendale.engineeringRecord.facts.flat().join(" ");
  const stJohnsMainFacts = stJohnsMain.engineeringRecord.facts.flat().join(" ");
  const stampsLaneFacts = stampsLane.engineeringRecord.facts.flat().join(" ");

  assert.deepEqual(glendale.feederRegister, ["GDL-01", "GDL-02", "GDL-03", "GDL-04", "GDL-05", "GDL-06", "GDL-07", "GDL-08", "GDL-09"]);
  assert.deepEqual(glendale.mapPages, [["GDL-01", 58], ["GDL-02", 59], ["GDL-03", 60], ["GDL-04", 61], ["GDL-05", 62], ["GDL-06", 63]]);
  assert.match(glendale.historyRecords[0].facts.flat().join(" "), /normally open switch between GDL-01 and HWD-04/);
  assert.match(glendale.historyRecords[1].facts.flat().join(" "), /new 25 MVA power transformer/);
  const hardwoodsGlendaleTie = hardwoods.historyRecords.find((record) => record.sourceId === "np-2004-gdl01");
  assert.match(hardwoodsGlendaleTie.facts.flat().join(" "), /1\/0 AASC with 477 ASC/);
  assert.match(glendaleFacts, /GDL-T3; 25 MVA each; described as 66\/12\.5 kV/);
  assert.match(glendaleFacts, /installed in 2013/);
  assert.match(glendale.planningRecord.facts.flat().join(" "), /construction completed in 2021/);

  assert.deepEqual(stJohnsMain.mapPages, [["SJM-06", 135], ["SJM-08", 136], ["SJM-11", 137], ["SJM-13", 138]]);
  assert.match(stJohnsMainFacts, /SJM-T1 and SJM-T2, 25 MVA each at 66\/12\.5 kV/);
  assert.match(stJohnsMainFacts, /install 25 MVA SJM-T3/);
  assert.match(stJohnsMain.planningRecord.facts.flat().join(" "), /SJM-03, SJM-07 and SJM-08 interconnected/);
  assert.equal(stJohnsMain.referenceSheets[0].image, "./reference-maps/sjm-2011-water-street-existing.png");
  assert.equal(stJohnsMain.referenceSheets[0].pages, "physical PDF p. 425");

  assert.deepEqual(stampsLane.mapPages, [["SLA-02", 139], ["SLA-03", 140], ["SLA-05", 141], ["SLA-06", 142], ["SLA-07", 143], ["SLA-08", 144], ["SLA-10", 145], ["SLA-11", 146], ["SLA-12", 147], ["SLA-13", 148]]);
  assert.match(stampsLaneFacts, /50 MVA combined at 12\.5 kV and 21 MVA combined at 4\.16 kV/);
  assert.match(stampsLaneFacts, /13L, 14L, 15L, 31L, 69L and 70L/);
  assert.match(stampsLane.planningRecord.facts.flat().join(" "), /replaced in 2021 with repaired PUL-T2/);
  assert.match(stampsLane.historyRecords[0].facts.flat().join(" "), /SLA-02, SLA-03, SLA-05, SLA-06 and SLA-07/);
  assert.match(stampsLane.historyRecords[1].facts.flat().join(" "), /approximately 1\.26 MVA to SLA-08/);
  assert.match(stampsLane.historyRecords[3].facts.flat().join(" "), /approximately 135 A before conversion/);
  assert.match(stampsLane.historyRecords[5].facts.flat().join(" "), /deteriorated transformer radiators/);
});

test("2016 feeder growth records retain proposed currents, transfers, and route drawings", () => {
  const ridgeRoad = stationProfiles.find((station) => station.code === "RRD");
  const virginiaWaters = stationProfiles.find((station) => station.code === "VIR");
  const pulpitRock = stationProfiles.find((station) => station.code === "PUL");
  const source = sources.find((item) => item.id === "np-2016-feeder-growth");

  assert.equal(source.status, "proposed");
  const rrd2016 = ridgeRoad.historyRecords.find((record) => record.label === "2016 PROPOSED VIR-07 LOAD TRANSFER");
  assert.match(rrd2016.facts.flat().join(" "), /3 MVA from VIR-07/);
  assert.equal(ridgeRoad.referenceSheets[0].image, "./reference-maps/rrd-10-2016-upgrade.jpg");
  assert.match(virginiaWaters.historyRecords[1].facts.flat().join(" "), /602 A per phase.*590 A per-phase planning rating/);
  assert.match(virginiaWaters.historyRecords[1].facts.flat().join(" "), /3\.2 MVA to proposed PUL-05/);
  assert.equal(virginiaWaters.referenceSheets[3].pages, "physical PDF p. 419");
  const pul2016 = pulpitRock.historyRecords.find((record) => record.label === "2016 PROPOSED FEEDER WORK");
  assert.match(pul2016.facts.flat().join(" "), /193 A per phase.*153 A per-phase planning rating/);
  assert.match(pul2016.facts.flat().join(" "), /35\.8 MVA, 72%/);
  assert.equal(pulpitRock.referenceSheets[0].image, "./reference-maps/pul-02-2016-upgrade.jpg");
});

test("2022 PUL-03 and VIR-01 records separate measured project bases from completion", () => {
  const virginiaWaters = stationProfiles.find((station) => station.code === "VIR");
  const pulpitRock = stationProfiles.find((station) => station.code === "PUL");
  const filedSource = sources.find((item) => item.id === "np-2022-feeder-growth");
  const completionSource = sources.find((item) => item.id === "np-2022-q4-report");
  const virBasis = virginiaWaters.historyRecords.find((record) => record.label === "2022 VIR-01 PROJECT BASIS");
  const virCompletion = virginiaWaters.historyRecords.find((record) => record.label === "2022 VIR-01 COMPLETION");
  const pulBasis = pulpitRock.historyRecords.find((record) => record.label === "2022 PUL-03 PROJECT BASIS");
  const pulCompletion = pulpitRock.historyRecords.find((record) => record.label === "2022 PUL-03 COMPLETION");

  assert.equal(filedSource.status, "proposed");
  assert.equal(completionSource.status, "verified");
  assert.match(virBasis.facts.flat().join(" "), /113 A.*85 A maximum/);
  assert.match(virBasis.facts.flat().join(" "), /1\.8 km.*#4 copper.*1\/0 AASC/);
  assert.match(virCompletion.facts.flat().join(" "), /project completed/);
  assert.equal(virginiaWaters.referenceSheets.at(-1).image, "./reference-maps/vir-01-2022-upgrade.jpg");
  assert.match(pulBasis.facts.flat().join(" "), /198 A per phase.*168 A/);
  assert.match(pulCompletion.facts.flat().join(" "), /project completed/);
  assert.equal(pulpitRock.referenceSheets.at(-1).image, "./reference-maps/pul-03-2022-upgrade.jpg");
});

test("station history records retain source and page references", async () => {
  const sourceIds = new Set(sources.map((source) => source.id));
  for (const profile of stationProfiles.filter((station) => station.historyRecords)) {
    for (const record of profile.historyRecords) {
      assert.ok(sourceIds.has(record.sourceId));
      assert.match(record.pages, /PDF p/);
    }
  }
  const main = await readFile(new URL("../src/main.js", import.meta.url), "utf8");
  assert.match(main, /historyRecords\.map/);
  assert.match(main, /historySource\.url/);
});

test("every station record resolves to a source", () => {
  const sourceIds = new Set(sources.map((source) => source.id));
  for (const profile of stationProfiles) {
    for (const key of ["engineeringRecord", "planningRecord", "assignmentRecord", "circuitSource", "feederTieSource"]) {
      if (profile[key]) assert.ok(sourceIds.has(profile[key].sourceId), `${profile.code} ${key}: ${profile[key].sourceId}`);
    }
    for (const source of profile.circuitSources || []) {
      assert.ok(sourceIds.has(source.sourceId), `${profile.code} circuit source: ${source.sourceId}`);
    }
    for (const record of profile.historyRecords || []) {
      assert.ok(sourceIds.has(record.sourceId), `${profile.code} history record: ${record.sourceId}`);
    }
    for (const sheet of profile.referenceSheets || []) {
      assert.ok(sourceIds.has(sheet.sourceId), `${profile.code} reference sheet: ${sheet.sourceId}`);
    }
  }
});

test("station reference schematics remain expandable and locally preserved", async () => {
  const hardwoods = stationProfiles.find((station) => station.code === "HWD");
  const kenmount = stationProfiles.find((station) => station.code === "KEN");
  const goulds = stationProfiles.find((station) => station.code === "GOU");
  const stJohnsMain = stationProfiles.find((station) => station.code === "SJM");
  const kingsBridge = stationProfiles.find((station) => station.code === "KBR");
  const pepperell = stationProfiles.find((station) => station.code === "PEP");
  const virginiaWaters = stationProfiles.find((station) => station.code === "VIR");
  assert.deepEqual(stJohnsMain.referenceSheets.map((sheet) => [sheet.title, sheet.pages]), [
    ["2011 Water Street existing feeder schematic", "physical PDF p. 425"]
  ]);
  assert.equal(kingsBridge.referenceSheets[0].image, "./reference-maps/kbr-2019-service-area.png");
  assert.equal(pepperell.referenceSheets[0].pages, "physical PDF p. 37");
  assert.equal(virginiaWaters.referenceSheets[0].pages, "physical PDF p. 39");
  assert.equal(hardwoods.referenceSheets[0].image, "./reference-maps/hwd-08-2014-reclosers.png");
  assert.deepEqual(kenmount.referenceSheets.map((sheet) => sheet.pages), [
    "physical PDF p. 36",
    "physical PDF p. 37",
    "physical PDF p. 38",
    "physical PDF p. 39"
  ]);
  assert.deepEqual(goulds.referenceSheets.map((sheet) => sheet.pages), ["physical PDF p. 42", "physical PDF p. 43"]);
  assert.equal(virginiaWaters.referenceSheets[1].image, "./reference-maps/vir-06.png");
  const schematic = await readFile(new URL("../public/reference-maps/sjm-2011-water-street-existing.png", import.meta.url));
  const serviceArea = await readFile(new URL("../public/reference-maps/kbr-2019-service-area.png", import.meta.url));
  const hwd08Route = await readFile(new URL("../public/reference-maps/hwd-08-2014-reclosers.png", import.meta.url));
  const ken01Route = await readFile(new URL("../public/reference-maps/ken-01.png", import.meta.url));
  const gou01Route = await readFile(new URL("../public/reference-maps/gou-01.png", import.meta.url));
  assert.ok(schematic.length > 300_000);
  assert.ok(serviceArea.length > 1_000_000);
  assert.ok(hwd08Route.length > 700_000);
  assert.ok(ken01Route.length > 1_000_000);
  assert.ok(gou01Route.length > 500_000);
  const main = await readFile(new URL("../src/main.js", import.meta.url), "utf8");
  assert.match(main, /referenceSheets/);
  assert.match(main, /SYSTEM SCHEMATICS/);
});

test("2014 feeder service records preserve routes, customers, and proposed work", () => {
  const kenmount = stationProfiles.find((station) => station.code === "KEN");
  const goulds = stationProfiles.find((station) => station.code === "GOU");
  const virginiaWaters = stationProfiles.find((station) => station.code === "VIR");
  const pulpitRock = stationProfiles.find((station) => station.code === "PUL");

  assert.match(kenmount.historyRecords[0].facts.flat().join(" "), /approximately 1,800 residential customers/);
  assert.match(kenmount.historyRecords[0].label, /PROPOSED RECLOSERS/);
  assert.match(goulds.historyRecords[0].facts.flat().join(" "), /Lannon Street; approximately 100 customers/);
  assert.match(virginiaWaters.historyRecords[0].facts.flat().join(" "), /Outer Ring Road, then north along Torbay Road/);
  const pul2014 = pulpitRock.historyRecords.find((record) => record.label === "2014 PROPOSED PUL-04 CONDUCTOR WORK");
  assert.match(pul2014.facts.flat().join(" "), /reconductor 4\.3 km.*477 ASC/);
  assert.match(pul2014.facts.flat().join(" "), /approximately 4\.5 MVA/);
});

test("2014 rural recloser and Holyrood breaker records remain proposed", () => {
  const expected = {
    CAB: /CAB-01 approximately 1,300 customers/,
    FER: /FER-01 approximately 650 customers/,
    COL: /COL-01 and COL-02; approximately 1,400 customers combined/,
    SPF: /SPF-01, SPF-02, and SPF-03; approximately 3,100 customers combined/,
    HOL: /install two breakers on 39L during summer 2014/
  };

  for (const [code, pattern] of Object.entries(expected)) {
    const profile = stationProfiles.find((station) => station.code === code);
    assert.ok(profile, `${code} profile is present`);
    const proposed = profile.historyRecords.find((record) => record.sourceId === "np-2014-improvements");
    assert.ok(proposed, `${code} retains its 2014 proposal`);
    assert.match(proposed.label, /PROPOSED/);
    assert.match(proposed.facts.flat().join(" "), pattern);
  }
});

test("Colliers, Springfield, and Holyrood records separate filed scopes from completion evidence", () => {
  const colliers = stationProfiles.find((station) => station.code === "COL");
  const springfield = stationProfiles.find((station) => station.code === "SPF");
  const holyrood = stationProfiles.find((station) => station.code === "HOL");

  assert.equal(colliers.engineeringRecord.sourceId, "np-2015-substation-modernization");
  assert.match(colliers.engineeringRecord.facts.flat().join(" "), /COL-T1; 138\/12\.5 kV; 16\.7 MVA/);
  assert.match(colliers.engineeringRecord.facts.flat().join(" "), /42L to Holyrood and 46L to Springfield/);
  assert.equal(springfield.engineeringRecord.sourceId, "np-2015-substation-modernization");
  assert.match(springfield.engineeringRecord.facts.flat().join(" "), /47L to Bay Roberts and 46L to Colliers/);
  assert.equal(springfield.planningRecord.sourceId, "np-2027-pub-np-005");
  assert.match(springfield.planningRecord.label, /COMPLETION/);
  assert.match(springfield.planningRecord.facts.flat().join(" "), /communications and SCADA equipment/);
  assert.equal(holyrood.engineeringRecord.sourceId, "np-2014-capital");
  assert.match(holyrood.engineeringRecord.facts.flat().join(" "), /HOL-T1; 138\/12\.5 kV; 20 MVA/);
  assert.match(holyrood.engineeringRecord.facts.flat().join(" "), /split HOL-01 into two feeders/);
  assert.deepEqual(holyrood.connectedCircuits.map(({ circuit }) => circuit), ["39L", "42L"]);
  assert.deepEqual(holyrood.feederRegister, ["HOL-01", "HOL-02"]);
  assert.equal(holyrood.diagram.buses.find((bus) => bus.id === "b1").voltage, "138 kV");
  assert.match(holyrood.planningRecord.facts.flat().join(" "), /15\.04 MVA 2026 forecast/);
  const lineHistory = holyrood.historyRecords.flatMap((record) => record.facts).flat().join(" ");
  assert.match(lineHistory, /69 kV line between Holyrood Terminal Station and Seal Cove Substation/);
  assert.match(lineHistory, /installation of transmission-line breakers in 2014 and 2015 divided the former 39L designation/);
  assert.match(lineHistory, /\$1,609,731 before the remaining-life credit/);
  assert.equal(holyrood.referenceSheets[0].image, "./reference-maps/holyrood-38l-39l-relocation.svg");
});

test("Bay Roberts keeps the filed station, transformer addition, and feeder work separate", () => {
  const bayRoberts = stationProfiles.find((station) => station.code === "BRB");
  const recordText = bayRoberts.historyRecords.flatMap((record) => record.facts.flat()).join(" ");

  assert.deepEqual(bayRoberts.diagram.buses.map((bus) => bus.voltage), ["138 kV", "66 kV", "12.5 kV"]);
  assert.deepEqual(bayRoberts.diagram.transformers.map((transformer) => transformer.label), ["BRB-T2", "BRB-T3", "BRB-T1", "BRB-T4"]);
  assert.match(bayRoberts.engineeringRecord.facts.flat().join(" "), /39L to Springfield and 48L to Blaketown/);
  assert.match(recordText, /22\.1 MVA winter 2014 forecast for the 20 MVA BRB-T1/);
  assert.match(recordText, /p\. 243 footnote says 66\/12\.5 kV.*later transformer registers say 138\/12\.5 kV/);
  assert.match(recordText, /107 A forecast.*85 A planning maximum/);
  assert.match(recordText, /1\.3 km from two phase to three phase.*1\.1 km from single phase to three phase/);
  assert.equal(bayRoberts.historyRecords.find((record) => record.label.includes("2014/15")).sourceId, "np-2014-pub-np-274");
});

test("2019 feeder tie records link King's Bridge, Pepperell, and Virginia Waters", async () => {
  const kingsBridge = stationProfiles.find((station) => station.code === "KBR");
  const pepperell = stationProfiles.find((station) => station.code === "PEP");
  const virginiaWaters = stationProfiles.find((station) => station.code === "VIR");

  assert.deepEqual(kingsBridge.feederRegister, ["KBR-09", "KBR-10", "KBR-11", "KBR-12", "KBR-13", "KBR-15"]);
  assert.deepEqual(kingsBridge.feederTies[0], { feeder: "KBR-09", customers: 996, ties: ["RRD-02", "PEP-01"] });
  assert.deepEqual(pepperell.feederTies[0].ties, ["KBR-09", "PEP-04", "VIR-03", "VIR-05", "VIR-08"]);
  assert.deepEqual(virginiaWaters.feederTies[7].ties, ["RRD-03", "RRD-07", "PEP-01", "VIR-05"]);

  const main = await readFile(new URL("../src/main.js", import.meta.url), "utf8");
  assert.match(main, /profile\.feederTies/);
  assert.match(main, /data-station-record/);
  assert.match(main, /2019 FEEDER TIE POINTS/);
});

test("documented feeder assignments and bus breakers retain their filed scope", async () => {
  const sourceIds = new Set(sources.map((source) => source.id));
  const assignedProfiles = stationProfiles.filter((station) => station.assignmentRecord);
  const assignments = Object.fromEntries(assignedProfiles.map((station) => [
    station.code,
    station.assignmentRecord.facts.flat().join(" ")
  ]));
  const main = await readFile(new URL("../src/main.js", import.meta.url), "utf8");

  assert.ok(assignedProfiles.length >= 10);
  for (const profile of assignedProfiles) {
    assert.ok(sourceIds.has(profile.assignmentRecord.sourceId));
  }
  assert.match(assignments.GDL, /GDL-T1\/T2-B and GDL-T2\/T3-B/);
  assert.match(assignments.SJM, /SJM-T1\/T2 SJM-03, SJM-06 and SJM-09/);
  assert.match(assignments.SLA, /SLA-T3 SLA-08; 12.5 kV SLA-T4 SLA-11/);
  assert.match(assignments.VIR, /VIR-T1\/T2 VIR-01 and VIR-06/);
  assert.match(assignments.SJM, /SJM-T3 SJM-10 and SJM-14/);
  assert.match(assignments.SLA, /SLA-T3 SLA-08/);
  assert.match(assignments.SLA, /SLA-T4 SLA-11/);
  assert.match(assignments.VIR, /VIR-T1\/T2 VIR-01 and VIR-06/);
  assert.match(main, /assignmentRecord\.facts/);
  assert.match(main, /assignmentSource\.url/);
});

test("map selection stays in place and feeder maps are expandable", async () => {
  const main = await readFile(new URL("../src/main.js", import.meta.url), "utf8");
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  assert.match(main, /event\.preventDefault\(\);[\s\S]*event\.stopImmediatePropagation\(\);[\s\S]*showHandbookStation/);
  assert.match(main, /handbook-detail-station-link/);
  assert.match(main, /stationDetailAnchors = \{[\s\S]*HWD: "#substation-hwd"/);
  assert.match(main, /<details class="feeder-map">/);
  assert.match(main, /\.\/feeder-maps\/\$\{feeder\.toLowerCase\(\)\}\.jpg/);
  assert.match(html, /id="handbook-detail-station-link"/);
  assert.match(html, /M940 168 H968 V236 H940 M940 304 H968 V372 H940/);
});

test("dynamic one-line diagrams open centred on narrow screens", async () => {
  const main = await readFile(new URL("../src/main.js", import.meta.url), "utf8");
  assert.match(main, /function centerDynamicDiagram\(container\)/);
  assert.match(main, /diagramScroll\.scrollLeft = Math\.max\(0, \(diagramScroll\.scrollWidth - diagramScroll\.clientWidth\) \/ 2\)/);
  assert.match(main, /centerDynamicDiagram\(document\.querySelector\("#station-profile"\)\)/);
  assert.match(main, /centerDynamicDiagram\(document\.querySelector\("#hydro-terminal-record"\)\)/);
});

test("two-transformer one-lines keep both banks inside the centred mobile view", async () => {
  const renderer = await readFile(new URL("../src/terminal-diagram.js", import.meta.url), "utf8");
  assert.match(renderer, /count === 2\s*\? spread\(index, count, 420, 700\)/);
});

test("geographic reference maps retain their source pages", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  assert.match(html, /reference-maps\/oxen-2013-st-johns-system\.jpg/);
  assert.match(html, /Oxen Pond transformer application \/ physical PDF p\. 15/);
  assert.match(html, /reference-maps\/np-2026-iis-study-area\.png/);
  assert.match(html, /Supplemental application \/ physical PDF p\. 183/);
  assert.match(html, /reference-maps\/nlh-2012-provincial-grid\.svg/);
  assert.match(html, /2013 General Rate Application, Volume II \/ physical PDF p\. 79/);
});

test("island overview and Avalon map use cited geographic references", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  assert.match(html, /ISLAND OVERVIEW \/ NOVEMBER 2012/);
  assert.match(html, /href="#terminal-wav"[\s\S]*href="#terminal-hrd"[\s\S]*href="#terminal-hwd"[\s\S]*href="#terminal-opd"/);
  assert.match(html, /SEMI-GEOGRAPHIC \/ STATION ORDER FROM 2012 AND 2013 MAPS/);
  assert.match(html, /M360 330 H650/);
  assert.match(html, /M650 330 L520 190/);
  assert.match(html, /M520 190 C610 65 750 70 840 155/);
});

test("Hydro upload findings distinguish installed and proposed work", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const sourceIds = new Set(sources.map((source) => source.id));
  assert.ok(sourceIds.has("nlh-2024-rra"));
  assert.ok(sourceIds.has("nlh-2025-capital"));
  assert.ok(sourceIds.has("nlh-2025-avalon-ct"));
  assert.equal(components["hrd-g3"].status, "verified");
  assert.match(components["hrd-g3"].data.flat().join(" "), /Pony motor and SSS clutch/);
  assert.match(components["hrd-g3"].data.flat().join(" "), /April 2022 operation 373 hours/);
  assert.match(components["hrd-g3"].data.flat().join(" "), /Spring 2030/);
  assert.match(components["hrd-g3"].data.flat().join(" "), /beyond 2035.*condition-monitoring instrumentation/);
  assert.match(components["hrd-g3"].data.flat().join(" "), /STATCOMs.*grid-forming inverters/);
  assert.match(components["hrd-summary"].data.flat().join(" "), /Unit 1 overhaul completed February 2025/);
  assert.match(components["hrd-summary"].data.flat().join(" "), /Six containerized CAT 3516B/);
  assert.match(components["hrd-summary"].data.flat().join(" "), /SST34 feed 66 kV underground cable replacement completed in 2019/);
  assert.match(components["hrd-summary"].data.flat().join(" "), /38L supply.*1.5 MVA.*69-2.4\/4.16 kV/);
  assert.match(components["hrd-summary"].data.flat().join(" "), /lower-cost Newfoundland Power supply connection/);
  assert.match(components["hrd-summary"].data.flat().join(" "), /292\.827 million capital.*330\.915 million operating.*623\.742 million total/);
  assert.match(components["wav-summary"].data.flat().join(" "), /Replacement began in 2019/);
  assert.match(components["hwd-summary"].data.flat().join(" "), /T5 45\/60\/75 MVA, 66\/13.8 kV/);
  assert.match(components["hwd-g1"].data.flat().join(" "), /2026 study model 25 MW/);
  assert.doesNotMatch(components["hwd-summary"].data.flat().join(" "), /2025 capital record/);
  assert.ok(timeline.some((event) => event.title === "Dynamic line rating entered service on TL201" && event.status === "verified"));
  assert.ok(timeline.some((event) => event.title === "Avalon combustion turbine connection was proposed" && event.status === "proposed"));
  assert.match(html, /Avalon combustion turbine connection/);
  assert.match(html, /TL201 \/ MARCH 2024/);
});

test("Oxen Pond and Hardwoods capacitor banks are clickable and sourced", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  for (const id of ["opd-c1", "opd-c2", "hwd-c1", "hwd-c2"]) {
    assert.match(html, new RegExp(`data-component="${id}"`));
    assert.ok(components[id]);
    assert.match(components[id].data.flat().join(" "), /MVAR/);
    assert.equal(components[id].sources[0].sourceId, "oxen-2013");
  }
});

test("Oxen Pond retains the dated 66 kV bus and circuit assignments", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  assert.match(html, /data-component="opd-bus-tie"/);
  assert.match(html, /B3 \/ NEWFOUNDLAND POWER/);
  assert.match(html, /B4 \/ NEWFOUNDLAND POWER/);
  assert.match(html, /aria-label="70L to Stamp's Lane Substation"/);
  assert.match(html, /aria-label="35L to Kenmount Substation"/);
  assert.match(components["opd-summary"].data.flat().join(" "), /B3 circuits 70L, 32L, 34L/);
  assert.match(components["opd-summary"].data.flat().join(" "), /B4 circuits 67L, 58L, 35L, 31L/);
  assert.match(components["opd-bus-tie"].data.flat().join(" "), /B2 and B5/);
  assert.equal(components["opd-bus-tie"].sources[0].sourceId, "oxen-2013");
});

test("Virginia Waters retains the documented 2016 logical arrangement", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const source = sources.find((item) => item.id === "np-2016-vir-modernization");
  assert.equal(source.pages, "physical PDF pp. 261 to 263");
  assert.match(html, /id="substation-vir"/);
  assert.match(html, /data-claim-id="virginia-waters-substation-one-line"/);
  for (const circuit of ["34L", "58L", "59L", "74L"]) assert.match(html, new RegExp(`${circuit} to`));
  for (const transformer of ["vir-t1", "vir-t2", "vir-t3"]) assert.ok(components[transformer]);
  for (const feeder of ["01", "02", "03", "04", "05", "06", "07", "08"]) {
    assert.match(html, new RegExp(`data-component="vir-${feeder}"`));
    assert.equal(components[`vir-${feeder}`].data[0][1], "12.5 kV");
  }
  assert.match(components["vir-summary"].data.flat().join(" "), /8 side-break switches; 1 bus-tie switch; 3 transformer air-break switches/);
  assert.match(components["vir-t2"].data.flat().join(" "), /2027 register 66\/25 kV, 25 MVA/);
  assert.match(components["vir-t2"].data.flat().join(" "), /2026 forecast 22.53 MVA/);
});

test("Ridge Road retains the split 12.5 kV bus and completed tie", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const source = sources.find((item) => item.id === "np-2015-rrd-modernization");
  assert.equal(source.pages, "physical PDF p. 427");
  assert.match(html, /data-claim-id="ridge-road-substation-one-line"/);
  assert.match(html, /data-component="rrd-bus-tie"/);
  assert.match(html, /32L to Oxen Pond Substation/);
  assert.match(html, /30L to King's Bridge Substation/);
  assert.match(html, /67L to Oxen Pond Substation/);
  assert.match(components["rrd-summary"].data.flat().join(" "), /Two 12.5 kV bus sections; 4 feeders on each section/);
  assert.match(components["rrd-bus-tie"].data.flat().join(" "), /Installed in 2015/);
  assert.match(components["rrd-t2"].data.flat().join(" "), /2026 forecast 15.57 MVA/);
  assert.match(components["rrd-t3"].data.flat().join(" "), /2026 forecast 17.54 MVA/);
});

test("King's Bridge retains the current six-feeder station record", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  assert.match(html, /data-claim-id="kings-bridge-substation-one-line"/);
  assert.match(html, /12L to Memorial Substation/);
  assert.match(html, /16L to Pepperrell Substation/);
  assert.match(html, /30L to Ridge Road Substation/);
  for (const feeder of ["09", "10", "11", "12", "13", "15"]) {
    assert.match(html, new RegExp(`data-component="kbr-${feeder}"`));
    assert.equal(components[`kbr-${feeder}`].data[0][1], "12.5 kV");
  }
  assert.match(components["kbr-summary"].data.flat().join(" "), /KBR-T3 and KBR-T4; 25 MVA each/);
  assert.equal(components["kbr-t3"].status, "proposed");
  assert.match(components["kbr-t3"].data.flat().join(" "), /Proposed commissioning in 2028/);
});

test("Pepperrell retains the completed two-transformer and five-feeder arrangement", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const main = await readFile(new URL("../src/main.js", import.meta.url), "utf8");
  assert.match(html, /data-claim-id="pepperrell-substation-one-line"/);
  assert.match(html, /16L to King's Bridge Substation/);
  assert.match(html, /74L to Virginia Waters Substation/);
  assert.match(main, /PEP: "#substation-pep"/);
  for (const feeder of ["01", "02", "03", "04", "05"]) {
    assert.match(html, new RegExp(`data-component="pep-${feeder}"`));
    assert.equal(components[`pep-${feeder}`].data[0][1], "12.5 kV");
  }
  assert.match(components["pep-summary"].data.flat().join(" "), /PEP-T1 and PEP-T2; 25 MVA each/);
  assert.match(components["pep-t1"].data.flat().join(" "), /2019 station record 66\/12.47 kV, 25 MVA/);
  assert.match(components["pep-t1"].data.flat().join(" "), /2027 equipment table 66\/25 kV, 25 MVA/);
  assert.match(components["pep-t2"].data.flat().join(" "), /2019 actual expenditure \$1.514 million/);
});

test("Glendale retains its circuits, three transformers and nine feeder records", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const main = await readFile(new URL("../src/main.js", import.meta.url), "utf8");
  assert.match(html, /data-claim-id="glendale-substation-one-line"/);
  assert.match(html, /18L to Goulds Substation/);
  assert.match(html, /73L to Hardwoods Substation/);
  assert.match(main, /GDL: "#substation-gdl"/);
  for (const transformer of ["1", "2", "3"]) {
    assert.match(html, new RegExp(`data-component="gdl-t${transformer}"`));
    assert.match(components[`gdl-t${transformer}`].data.flat().join(" "), /2019 station record 66\/12.5 kV, 25 MVA/);
  }
  for (const feeder of ["01", "02", "03", "04", "05", "06", "07", "08", "09"]) {
    assert.match(html, new RegExp(`data-component="gdl-${feeder}"`));
  }
  assert.match(components["gdl-summary"].data.flat().join(" "), /GDL-T1\/T2-B and GDL-T2\/T3-B/);
  assert.match(components["gdl-09"].data.flat().join(" "), /Completed 2021/);
});

test("St. John's Main retains the dated 2015 parallel-bank arrangement", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const main = await readFile(new URL("../src/main.js", import.meta.url), "utf8");
  assert.match(html, /data-claim-id="st-johns-main-2015-one-line"/);
  assert.match(html, /4L to Goulds Substation/);
  assert.match(html, /13L to Stamp's Lane Substation/);
  assert.match(html, /25L to Goulds Substation/);
  assert.match(main, /SJM: "#substation-sjm"/);
  for (const transformer of ["t1", "t2", "t3", "t4"]) {
    assert.match(html, new RegExp(`data-component="sjm-${transformer}"`));
    assert.ok(components[`sjm-${transformer}`]);
  }
  for (const feeder of ["03", "06", "09", "10", "14", "12"]) {
    assert.match(html, new RegExp(`data-component="sjm-${feeder}"`));
    assert.ok(components[`sjm-${feeder}`]);
  }
  assert.match(components["sjm-summary"].data.flat().join(" "), /70.8 MVA with three transformers in parallel/);
  assert.match(components["sjm-t1"].data.flat().join(" "), /2027 equipment table 66\/25 kV, 25 MVA/);
  assert.match(components["sjm-t2"].data.flat().join(" "), /2026 forecast 17.19 MVA/);
  assert.match(components["sjm-t3"].data.flat().join(" "), /2015 project estimate \$1.479 million/);
  assert.match(components["sjm-t4"].data.flat().join(" "), /2027 transformer table Not listed/);
});

test("Stamp's Lane separates the documented 4.16 and 12.5 kV banks", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const main = await readFile(new URL("../src/main.js", import.meta.url), "utf8");
  assert.match(html, /data-claim-id="stamps-lane-substation-one-line"/);
  assert.match(main, /SLA: "#substation-sla"/);
  for (const transformer of ["t1", "t2", "t3", "t4"]) {
    assert.match(html, new RegExp(`data-component="sla-${transformer}"`));
    assert.ok(components[`sla-${transformer}`]);
  }
  for (const feeder of ["02", "03", "05", "06", "07", "08", "09", "10", "11"]) {
    assert.match(html, new RegExp(`data-component="sla-${feeder}"`));
    assert.ok(components[`sla-${feeder}`]);
  }
  assert.match(components["sla-summary"].data.flat().join(" "), /SLA-T1, 13.3 MVA; SLA-T2, 10.4 MVA/);
  assert.match(components["sla-t3"].data.flat().join(" "), /19.86 MVA/);
  assert.match(components["sla-t4"].data.flat().join(" "), /Repaired PUL-T2 installed in 2021/);
  assert.match(components["sla-05"].data.flat().join(" "), /4.16 kV/);
  assert.match(components["sla-08"].data.flat().join(" "), /SLA-T3/);
  assert.match(components["sla-11"].data.flat().join(" "), /SLA-T4/);
});

test("Hardwoods distribution feeders remain on their documented voltage buses", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  assert.match(components["hwd-np-summary"].data.flat().join(" "), /12.5 kV feeders HWD-01, 02, 03, 04, 06/);
  assert.match(components["hwd-np-summary"].data.flat().join(" "), /25 kV feeders HWD-07, 08, 09/);
  assert.match(components["hwd-np-hwd07"].data.flat().join(" "), /Voltage 25 kV/);
  assert.match(html, /aria-label="12.5 kilovolt Hardwoods feeders"/);
  assert.match(html, /data-component="hwd-np-hwd07"/);
});

test("Springdale keeps the filed Hydro interface and proposed 2014 work separate", () => {
  const springdale = stationProfiles.find((station) => station.code === "SPR");
  assert.ok(springdale);
  assert.equal(springdale.voltage, "138/25 kV");
  assert.deepEqual(springdale.connectedCircuits.map(({ circuit }) => circuit), ["TL222", "TL223"]);
  assert.deepEqual(springdale.feederRegister, ["SPR-01", "SPR-02", "SPR-03", "SPR-04"]);
  assert.deepEqual(springdale.diagram.transformers, [{ label: "SPR-T1", rating: "16.7 MVA", from: "b1", to: "b2" }]);
  assert.match(springdale.engineeringRecord.facts.flat().join(" "), /Hydro owns and maintains the 138 kV bus and breakers/);
  assert.match(springdale.historyRecords[0].facts.flat().join(" "), /replace original electromechanical transformer relays and four hydraulic feeder reclosers/);
  assert.equal(sources.find((source) => source.id === "np-2014-springdale").status, "proposed");
});

test("Bay L'Argent keeps the existing TL212 corridor separate from the studied TL219 tie", () => {
  const bayLArgent = stationProfiles.find((station) => station.code === "BLA");
  assert.ok(bayLArgent);
  assert.deepEqual(bayLArgent.connectedCircuits.map(({ circuit }) => circuit), ["TL212", "TL212"]);
  assert.deepEqual(bayLArgent.connectedCircuits.map(({ from, to }) => `${from} to ${to}`), [
    "Monkstown to Bay L'Argent",
    "Bay L'Argent to Linton Lake"
  ]);
  assert.deepEqual(bayLArgent.diagram.transformers, [{ label: "BLA-T1", rating: "6.67 MVA", from: "b1", to: "b2" }]);
  assert.deepEqual(
    transformerRegister.transformers.find((record) => record.designation === "BLA-T1"),
    {
      designation: "BLA-T1",
      station_code: "BLA",
      type: "distribution",
      high_kv: 138,
      low_kv: 25,
      size_mva: 6.67,
      forecast_2026_mva: 4.54,
      physical_page: 546
    }
  );
  assert.match(bayLArgent.historyRecords[0].facts.flat().join(" "), /tap TL219 into Monkstown and Bay L'Argent/);
  assert.match(bayLArgent.historyRecords[0].label, /STUDIED/);
});

test("Monkstown and Linton Lake complete the documented TL212 corridor", () => {
  const monkstown = stationProfiles.find((station) => station.code === "MKS");
  const lintonLake = stationProfiles.find((station) => station.code === "LLK");

  assert.ok(monkstown);
  assert.deepEqual(
    monkstown.connectedCircuits.map((record) => [record.circuit, record.from_code, record.to_code]),
    [["TL212", "SUN", "MKS"], ["TL212", "MKS", "BLA"]]
  );
  assert.equal(monkstown.diagram.transformers[0].rating, "14.9 MVA");
  assert.deepEqual(monkstown.feederRegister, ["MKS-01", "MKS-02"]);
  assert.match(monkstown.historyRecords[1].facts.flat().join(" "), /two new 138 kV breakers at Monkstown/);
  assert.equal(transformerRegister.transformers.find((record) => record.designation === "MKS-T1").forecast_2026_mva, 8);

  assert.ok(lintonLake);
  assert.deepEqual(
    lintonLake.connectedCircuits.map((record) => [record.circuit, record.from_code, record.to_code]),
    [["TL212", "BLA", "LLK"], ["300L", "LLK", "MSY"]]
  );
  assert.equal(lintonLake.diagram.transformers[0].rating, "20 MVA");
  assert.deepEqual(lintonLake.feederRegister, ["LLK-01", "LLK-02", "LLK-03"]);
  assert.match(lintonLake.historyRecords[0].facts.flat().join(" "), /rebuilt in 1982/);
  assert.equal(transformerRegister.transformers.find((record) => record.designation === "LLK-T1").forecast_2026_mva, 6.05);
});

test("Baie Verte Junction and Seal Cove Road close the 363L radial record", () => {
  const baieVerteJunction = stationProfiles.find((station) => station.code === "BVJ");
  const sealCoveRoad = stationProfiles.find((station) => station.code === "SCR");

  assert.ok(baieVerteJunction);
  assert.deepEqual(baieVerteJunction.connectedCircuits, [
    { circuit: "363L", from: "Baie Verte Junction", from_code: "BVJ", to: "Seal Cove Road", to_code: "SCR" }
  ]);
  assert.equal(baieVerteJunction.diagram.transformers[0].rating, "2.67 MVA");
  assert.match(baieVerteJunction.engineeringRecord.facts.flat().join(" "), /Hydro's Indian River Substation/);
  assert.match(baieVerteJunction.historyRecords[0].facts.flat().join(" "), /478 two-pole and three-pole H-frame structures/);
  assert.match(baieVerteJunction.historyRecords[1].facts.flat().join(" "), /completed by Newfoundland Power in 2020/);

  assert.ok(sealCoveRoad);
  assert.deepEqual(sealCoveRoad.connectedCircuits, baieVerteJunction.connectedCircuits);
  assert.deepEqual(sealCoveRoad.feederRegister, ["SCR-01", "SCR-02"]);
  assert.equal(sealCoveRoad.diagram.transformers[0].rating, "8.3 MVA");
  assert.match(sealCoveRoad.historyRecords[0].facts.flat().join(" "), /7.7 km from Seal Cove Road to the abandoned asbestos mine/);

  assert.equal(transformerRegister.transformers.find((record) => record.designation === "BVJ-T1").forecast_2026_mva, 0.29);
  assert.equal(transformerRegister.transformers.find((record) => record.designation === "SCR-T1").forecast_2026_mva, 5.97);
});

test("Berry Head connects the Gallant Street and Abrahams Cove radial sections", () => {
  const berryHead = stationProfiles.find((station) => station.code === "BHD");

  assert.ok(berryHead);
  assert.deepEqual(
    berryHead.connectedCircuits.map((record) => [record.circuit, record.from_code, record.to_code]),
    [["402L", "GAL", "BHD"], ["410L", "BHD", "ABC"]]
  );
  assert.deepEqual(berryHead.feederRegister, ["BHD-01"]);
  assert.equal(berryHead.diagram.transformers[0].rating, "7.46 MVA");
  assert.match(berryHead.historyRecords[0].facts.flat().join(" "), /none at Berry Head/);
  assert.match(berryHead.historyRecords[1].facts.flat().join(" "), /January 2010/);
  assert.match(berryHead.historyRecords[2].facts.flat().join(" "), /unplanned service interruption/);
  assert.equal(transformerRegister.transformers.find((record) => record.designation === "BHD-T1").forecast_2026_mva, 3.82);
});

test("Doyles joins the Hydro terminal and Newfoundland Power distribution records", () => {
  const doyles = stationProfiles.find((station) => station.code === "DOY");
  const grandBay = stationProfiles.find((station) => station.code === "GBS");
  const bottomBrook = islandTerminalRecords.find((station) => station.code === "BBK");

  assert.ok(doyles);
  assert.deepEqual(
    doyles.connectedCircuits.map((record) => [record.circuit, record.from_code, record.to_code]),
    [["TL214", "BBK", "DOY"], ["TL215", "DOY", "GBS"]]
  );
  assert.deepEqual(doyles.feederRegister, ["DOY-01"]);
  assert.deepEqual(doyles.diagram.transformers.map((record) => [record.label, record.rating]), [
    ["DOY-T1", "41.7 MVA"],
    ["DOY-T2", "6.67 MVA"]
  ]);
  assert.match(doyles.engineeringRecord.facts.flat().join(" "), /approximately 1,700 customers/);
  assert.match(doyles.historyRecords[1].facts.flat().join(" "), /former Lethbridge 6.7 MVA/);
  assert.match(doyles.historyRecords[4].facts.flat().join(" "), /bypass disconnect/);
  assert.match(doyles.historyRecords[5].facts.flat().join(" "), /remote terminal unit replaced/);
  assert.equal(transformerRegister.transformers.find((record) => record.designation === "DOY-T2").forecast_2026_mva, 5.13);
  assert.equal(grandBay.connectedCircuits[0].from_code, "DOY");
  assert.equal(bottomBrook.diagram.circuits.find((record) => record.label === "TL214").destinationCode, "DOY");
});

test("the 403L records preserve the main line and Robinsons radial tap", () => {
  const stGeorges = stationProfiles.find((station) => station.code === "STG");
  const robinsons = stationProfiles.find((station) => station.code === "ROB");
  const lookoutBrook = stationProfiles.find((station) => station.code === "LBK");

  assert.ok(stGeorges);
  assert.deepEqual(stGeorges.connectedCircuits.map((record) => [record.circuit, record.from_code, record.to_code]), [
    ["407L", "STV", "STG"],
    ["403L", "STG", "LBK"]
  ]);
  assert.deepEqual(stGeorges.feederRegister, ["STG-01", "STG-02"]);
  assert.match(stGeorges.historyRecords[0].facts.flat().join(" "), /remove the 66\/33 kV step-down transformer/);
  assert.match(stGeorges.historyRecords[1].facts.flat().join(" "), /33 kV section retired in 2008/);

  assert.ok(robinsons);
  assert.equal(robinsons.connectedCircuits[0].circuit, "403L Tap");
  assert.deepEqual(robinsons.feederRegister, ["ROB-01", "ROB-02"]);
  assert.match(robinsons.engineeringRecord.facts.flat().join(" "), /4.0 km three-phase radial tap/);
  assert.match(robinsons.engineeringRecord.facts.flat().join(" "), /46 single-pole structures/);
  assert.match(robinsons.historyRecords[1].facts.flat().join(" "), /converted from 33 kV to 66 kV in 2008/);
  assert.equal(transformerRegister.transformers.find((record) => record.designation === "ROB-T1").forecast_2026_mva, 3.92);
  assert.equal(transformerRegister.transformers.find((record) => record.designation === "STG-T1").forecast_2026_mva, 3.5);

  assert.ok(lookoutBrook);
  assert.deepEqual(lookoutBrook.connectedCircuits.map((record) => record.circuit), ["403L", "403L Tap"]);
  assert.match(lookoutBrook.engineeringRecord.facts.flat().join(" "), /main line to St. George's/);
});

test("Greenhill code conflict is contextual and the latest code is preferred", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const main = await readFile(new URL("../src/main.js", import.meta.url), "utf8");
  assert.match(html, /id="source-conflict" role="note" hidden/);
  assert.match(html, /<strong>GRH<\/strong> is used in the 2027 Greenhill filing/);
  assert.match(main, /greenhill \? "GRH" : plant\.code/);
});

test("documented circuit links open the available other-end record", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const main = await readFile(new URL("../src/main.js", import.meta.url), "utf8");
  assert.match(html, /data-hydro-terminal-record="CBC" aria-label="TL237 to Come By Chance"/);
  assert.match(html, /data-hydro-terminal-record="SUN" aria-label="TL203 to Sunnyside"/);
  assert.match(html, /data-hydro-terminal-record="VBN" aria-label="TL208 to Voisey's Bay Nickel terminal"/);
  assert.match(html, /href="#substation-sla" aria-label="31L to Stamp's Lane"/);
  assert.match(html, /href="#substation-sla" aria-label="70L to Stamp's Lane"/);
  assert.match(html, /href="#substation-sla" aria-label="14L to Stamp's Lane Substation"/);
  assert.match(main, /link\.matches\("\[data-station-record\], \[data-hydro-terminal-record\]"\)/);
});

