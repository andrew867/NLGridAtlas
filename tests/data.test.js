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
    ["np-2027-loop-study", "PDF pp. 183, 188 to 195"],
    ["np-2027-transformers", "physical PDF pp. 545 to 551"]
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

  assert.equal(mapRows.length, 112);
  assert.deepEqual(mapRows.map(({ page }) => page), Array.from({ length: 112 }, (_, index) => index + 58));
  assert.deepEqual(mapRows[0], { feeder: "GDL-01", page: 58, station: "GDL" });
  assert.deepEqual(mapRows.at(-1), { feeder: "WES-02", page: 169, station: "WES" });
  assert.equal(new Set(mapRows.map(({ feeder }) => feeder)).size, 112);
  assert.deepEqual(mapRows.slice(-21).map(({ feeder, page }) => [feeder, page]), [
    ["SPF-02", 149], ["SPF-03", 150], ["STX-01", 151], ["TRN-02", 152],
    ["TWG-01", 153], ["TWG-02", 154], ["VIC-02", 155],
    ["VIR-01", 156], ["VIR-02", 157], ["VIR-03", 158], ["VIR-04", 159],
    ["VIR-05", 160], ["VIR-06", 161], ["VIR-08", 162],
    ["WAL-01", 163], ["WAL-02", 164], ["WAL-04", 165], ["WAL-05", 166],
    ["WAV-01", 167], ["WES-01", 168], ["WES-02", 169]
  ]);
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
  assert.match(main, /data-station-record/);
  assert.match(html, /id="station-search"/);
  assert.match(html, /id="station-tabs"/);
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
  assert.match(facts, /five 12\.5 kV feeders/);
  assert.match(facts, /66\/12\.5\/25 kV/);
  assert.match(facts, /third quarter of 2026/);
  assert.doesNotMatch(facts, /not found/);
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
  assert.match(ridgeRoad.historyRecords[0].facts.flat().join(" "), /3 MVA from VIR-07/);
  assert.equal(ridgeRoad.referenceSheets[0].image, "./reference-maps/rrd-10-2016-upgrade.jpg");
  assert.match(virginiaWaters.historyRecords[1].facts.flat().join(" "), /602 A per phase.*590 A per-phase planning rating/);
  assert.match(virginiaWaters.historyRecords[1].facts.flat().join(" "), /3\.2 MVA to proposed PUL-05/);
  assert.equal(virginiaWaters.referenceSheets[3].pages, "physical PDF p. 419");
  assert.match(pulpitRock.historyRecords[1].facts.flat().join(" "), /193 A per phase.*153 A per-phase planning rating/);
  assert.match(pulpitRock.historyRecords[1].facts.flat().join(" "), /35\.8 MVA, 72%/);
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
  assert.match(pulpitRock.historyRecords[0].facts.flat().join(" "), /reconductor 4\.3 km.*477 ASC/);
  assert.match(pulpitRock.historyRecords[0].facts.flat().join(" "), /approximately 4\.5 MVA/);
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
    assert.equal(profile.historyRecords[0].sourceId, "np-2014-improvements");
    assert.match(profile.historyRecords[0].label, /PROPOSED/);
    assert.match(profile.historyRecords[0].facts.flat().join(" "), pattern);
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

