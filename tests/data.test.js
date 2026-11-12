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
  assert.match(ganderFacts, /GAN-T1 138\/12\.5 kV; 20 MVA/);
  assert.match(ganderFacts, /three single-phase 69\/6\.9 kV, 1\.667 MVA transformers/);
  assert.match(gander.planningRecord.facts.flat().join(" "), /GAN-T3 66 kV grounding-transformer bank; 3\.5 MVA/);
  assert.match(gander.historyRecords[0].facts.flat().join(" "), /remove the 66 kV system from Gander/);
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
  assert.deepEqual(lookoutBrook.connectedCircuits.map(({ circuit }) => circuit), ["403L"]);
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
  assert.match(historyFacts, /does not treat the 50L designation as current/);
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

