import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { components, islandTerminalRecords, sources, stationProfiles, timeline } from "../src/data.js";
import { avalonNodePositions } from "../src/avalon-layout.js";

const handbook = JSON.parse(await readFile(new URL("../research/derived/np-2006-handbook.json", import.meta.url), "utf8"));
const transformerRegister = JSON.parse(await readFile(new URL("../research/derived/np-2027-transformer-register.json", import.meta.url), "utf8"));
const todStudy = JSON.parse(await readFile(new URL("../research/derived/np-2018-tod-study.json", import.meta.url), "utf8"));

const allowedStates = new Set(["verified", "reported", "proposed", "inferred", "unresolved"]);

test("source records have stable identifiers and primary locators", () => {
  const ids = new Set();
  for (const source of sources) {
    assert.match(source.id, /^[a-z0-9-]+$/);
    assert.ok(!ids.has(source.id), `duplicate source id: ${source.id}`);
    ids.add(source.id);
    assert.match(source.url, /^https?:\/\//);
    assert.match(source.pages, /PDF p/);
    assert.ok(Number.isInteger(source.year));
    assert.ok(allowedStates.has(source.status));
    assert.ok(source.topics.length > 0);
  }
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
      assert.match(reference.pages, /PDF p/);
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
    "#substation-hwd", "#substation-oxp", "#station-BCV", "#station-SLA"
  ]) {
    assert.match(html, new RegExp(`href="${href}"`), `missing network link: ${href}`);
  }
  assert.match(html, /TL203[\s\S]*SUNNYSIDE/);
  assert.match(html, /TL237[\s\S]*COME BY CHANCE/);
  assert.match(html, /TL208[\s\S]*LONG HARBOUR/);
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

test("island terminal records retain page-level sources", async () => {
  const sourceIds = new Set(sources.map((source) => source.id));
  assert.deepEqual(islandTerminalRecords.map((record) => record.code), ["SUN", "STB", "BDE", "BUC", "DLK", "BBK", "GFS", "MAS", "STV", "CBC"]);
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
  assert.match(components["pul-np-summary"].summary, /25\.0 kV/);
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

test("Pulpit Rock record preserves the unresolved secondary-voltage evidence", () => {
  const pulpit = stationProfiles.find((station) => station.code === "PUL");
  assert.deepEqual(pulpit.feederRegister, ["PUL-01", "PUL-02", "PUL-03", "PUL-04", "PUL-05"]);
  const facts = pulpit.engineeringRecord.facts.flat().join(" ");
  assert.match(facts, /five 12\.5 kV feeders/);
  assert.match(facts, /66\/12\.5\/25 kV/);
  assert.match(facts, /not found/);
});

test("Memorial and Long Pond records preserve the filed Health Sciences supply paths", () => {
  const memorial = stationProfiles.find((station) => station.code === "MUN");
  const longPond = stationProfiles.find((station) => station.code === "LPD");
  const memorialFacts = memorial.engineeringRecord.facts.flat().join(" ");
  const longPondFacts = longPond.engineeringRecord.facts.flat().join(" ");
  assert.deepEqual(memorial.feederRegister, ["MUN-01", "MUN-02", "MUN-03", "MUN-04", "MUN-05", "MUN-06", "MUN-07", "MUN-08", "MUN-09", "MUN-10"]);
  assert.match(memorialFacts, /MUN-01 and MUN-08/);
  assert.deepEqual(longPond.connectedCircuits, [{ circuit: "36L", from: "Oxen Pond", from_code: "OXP", to: "Long Pond", to_code: "LPD" }]);
  assert.match(longPondFacts, /HSC #2 and HSC #5/);
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
  assert.match(html, /M360 300 H650/);
  assert.match(html, /M650 300 L520 440/);
  assert.match(html, /M840 155 C825 390 730 470 520 440/);
});

test("Hydro upload findings distinguish installed and proposed work", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const sourceIds = new Set(sources.map((source) => source.id));
  assert.ok(sourceIds.has("nlh-2024-rra"));
  assert.ok(sourceIds.has("nlh-2025-capital"));
  assert.ok(sourceIds.has("nlh-2025-avalon-ct"));
  assert.equal(components["hrd-g3"].status, "proposed");
  assert.match(components["hrd-g3"].data.flat().join(" "), /Spring 2030/);
  assert.match(components["wav-summary"].data.flat().join(" "), /Replacement began in 2019/);
  assert.match(components["hwd-summary"].data.flat().join(" "), /75 MVA, 230\/66 kV/);
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

test("Greenhill code conflict is contextual and the latest code is preferred", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const main = await readFile(new URL("../src/main.js", import.meta.url), "utf8");
  assert.match(html, /id="source-conflict" role="note" hidden/);
  assert.match(html, /<strong>GRH<\/strong> is used in the 2027 Greenhill filing/);
  assert.match(main, /greenhill \? "GRH" : plant\.code/);
});

