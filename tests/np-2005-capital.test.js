import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { sources, stationProfiles } from "../src/data.js";

const station = (code) => stationProfiles.find((candidate) => candidate.code === code);
const stationText = (code) => JSON.stringify(station(code));

test("2005 capital sources retain physical pages and evidence states", () => {
  const expected = new Map([
    ["np-2005-hydro-rehabilitation", ["physical PDF pp. 163 to 169", "proposed"]],
    ["np-2005-wesleyville-overhaul", ["physical PDF pp. 170 to 174", "proposed"]],
    ["np-2005-pub-31-1", ["physical PDF p. 1", "reported"]],
    ["np-2005-rattling-brook", ["physical PDF pp. 188 to 193 and 283 to 301", "proposed"]],
    ["np-2005-pub-32-1", ["physical PDF p. 1", "reported"]],
    ["np-2005-substation-program", ["physical PDF pp. 34 to 38 and 312 to 318", "proposed"]],
    ["np-2005-transmission-rebuild", ["physical PDF pp. 319 to 321", "proposed"]],
    ["np-2005-east-end-planning", ["physical PDF pp. 356 to 371", "proposed"]]
  ]);

  for (const [id, [pages, status]] of expected) {
    const source = sources.find((candidate) => candidate.id === id);
    assert.ok(source, id);
    assert.equal(source.pages, pages, id);
    assert.equal(source.status, status, id);
  }
});

test("Wesleyville separates inspection, filed overhaul, and completion evidence", () => {
  assert.match(stationText("WES"), /three.*inspections|Inspection sequence/i);
  assert.match(stationText("WES"), /both 2003 Rolls-Royce inspections recommended overhaul/);
  assert.match(stationText("WES"), /zero-hour-rated refurbished unit/);
});

test("Rattling Brook keeps the 2005 design request distinct from 2007 completion", () => {
  assert.match(stationText("RBK"), /vacuum-tube synchronizer/);
  assert.match(stationText("RBK"), /requested \$350,000 for detailed assessment and design/);
  assert.match(stationText("RBK"), /2007 COMPLETED 66 KV STATION MODERNIZATION/);
});

test("2005 substation records preserve ratings, condition, and filed scope", () => {
  assert.match(stationText("HUM"), /purchased in 1968 and 1974/);
  assert.match(stationText("HWD"), /12\.5 kA.*approximately 16 kA/);
  assert.match(stationText("ROP"), /27 years.*obsolete/);
  assert.match(stationText("SJM"), /three 15 kV metalclad switchgear sections containing 17 air circuit breakers/);
});

test("east end stations expose the dated planning sheet", async () => {
  for (const code of ["BCV", "RRD", "VIR", "PUL"]) {
    assert.match(stationText(code), /east-end-2005-network-371\.png/, code);
  }
  assert.match(stationText("VIR"), /Selected 2005 work.*VIR-08/);
  assert.match(stationText("RRD"), /one 2\.2 MVA bank.*two 20 MVA banks/);

  const image = await readFile(new URL("../public/reference-maps/east-end-2005-network-371.png", import.meta.url));
  assert.ok(image.length > 100_000);
});
