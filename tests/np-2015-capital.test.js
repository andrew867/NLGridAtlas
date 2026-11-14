import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { sources, stationProfiles, timeline } from "../src/data.js";

const station = (code) => stationProfiles.find((candidate) => candidate.code === code);
const recordText = (code) => JSON.stringify(station(code));
const historyFrom = (code, sourceId) => station(code).historyRecords.filter((record) => record.sourceId === sourceId);

test("2015 capital sources retain page locators and evidence states", () => {
  const expected = new Map([
    ["np-2015-transmission-lines", ["physical PDF pp. 552 to 569", "proposed"]],
    ["np-2015-reliability-feeders", ["physical PDF pp. 75, 598 to 599, 615 to 619 and 629 to 633", "proposed"]],
    ["np-2015-feeder-growth", ["physical PDF pp. 73, 646 to 649 and 653", "proposed"]],
    ["np-2015-plants", ["physical PDF pp. 28, 30, 342 to 343, 356 and 361", "proposed"]],
    ["np-2015-scada", ["physical PDF pp. 110 to 111 and 783 to 789", "proposed"]],
    ["np-2021-ca-np-001-2015-actuals", ["physical PDF pp. 3 to 5", "reported"]]
  ]);

  for (const [id, [pages, status]] of expected) {
    const source = sources.find((candidate) => candidate.id === id);
    assert.ok(source, id);
    assert.equal(source.pages, pages);
    assert.equal(source.status, status);
  }
});

test("2015 transmission records retain the filed line details and route sheets", async () => {
  const mun = recordText("MUN");
  const mol = recordText("MOL");
  const kbr = recordText("KBR");
  const ken = recordText("KEN");
  const sla = recordText("SLA");

  assert.match(mun, /1\.13 km aerial and 1\.13 km underground/);
  assert.match(mol, /4\.22 km; 73 mainly single-pole structures; built in 1958/);
  assert.match(kbr, /2\.9 km; 87 single-pole structures; built in 1959/);
  assert.match(ken, /summary table gives 1951; the project text says the line was originally constructed in 1959/);
  assert.match(sla, /715\.5 ASC/);

  const maps = [
    "14l-2015-route.png",
    "15l-2015-route.png",
    "69l-2015-route.png"
  ];
  for (const name of maps) {
    const image = await readFile(new URL(`../public/reference-maps/${name}`, import.meta.url));
    assert.ok(image.length > 1_000_000, name);
  }
});

test("2015 reliability and load-growth feeder records stay attached to their stations", async () => {
  assert.match(recordText("KBR"), /SAIFI 1\.21; SAIDI 2\.20 hours; CHIKM 313\.0; CIKM 172\.3/);
  assert.match(recordText("MOL"), /SAIFI 1\.73; SAIDI 2\.13 hours; CHIKM 403\.4; CIKM 327\.2/);
  assert.match(recordText("MOB"), /356 A planning rating; 407 A filed 2015 forecast per phase/);
  assert.match(recordText("RBK"), /approximately 6\.0 km of RBK-01 from single-phase to three-phase/);

  const maps = [
    "kbr-10-2015-route.png",
    "mol-09-2015-route.png",
    "mob-01-2015-route.png"
  ];
  for (const name of maps) {
    const image = await readFile(new URL(`../public/reference-maps/${name}`, import.meta.url));
    assert.ok(image.length > 300_000, name);
  }
});

test("2015 plant scope and later expenditure remain separate records", () => {
  const scvFiled = historyFrom("SCV", "np-2015-plants");
  const scvActual = historyFrom("SCV", "np-2021-ca-np-001-2015-actuals");
  const tcvFiled = historyFrom("TCV", "np-2015-plants");
  const tcvActual = historyFrom("TCV", "np-2021-ca-np-001-2015-actuals");

  assert.equal(scvFiled.length, 1);
  assert.equal(scvActual.length, 1);
  assert.match(JSON.stringify(scvFiled), /rewind the 16 rotor poles/);
  assert.match(JSON.stringify(scvActual), /\$156,000 budget; \$165,000 actual/);
  assert.equal(tcvFiled.length, 1);
  assert.equal(tcvActual.length, 1);
  assert.match(JSON.stringify(tcvFiled), /25\.4 GWh in the application summary; 25\.9 GWh after the work/);
  assert.match(JSON.stringify(tcvActual), /\$1\.777 million budget; \$2\.122 million actual/);
  assert.doesNotMatch(JSON.stringify([...scvActual, ...tcvActual]), /commissioned|completed/);
});

test("2015 SCADA timeline entry preserves the filed system scale", () => {
  const entry = timeline.find(({ sourceId }) => sourceId === "np-2015-scada");
  assert.ok(entry);
  assert.equal(entry.status, "proposed");
  assert.match(entry.body, /71 substations, 25 hydro generators, two gas turbines, 187 feeders, 78 power transformers/);
  assert.match(entry.body, /approximately 40,000 points/);
});
