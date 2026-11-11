import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { islandTerminalRecords } from "../src/data.js";
import { renderTerminalDiagram } from "../src/terminal-diagram.js";

const escapeHtml = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

test("every major island record has a sourced connection diagram", () => {
  for (const record of islandTerminalRecords) {
    assert.ok(record.diagram, `${record.code} requires a diagram`);
    assert.ok(record.diagram.buses.length > 0, `${record.code} requires a bus`);
    assert.ok(record.diagram.label, `${record.code} requires an as-of label`);
    const busIds = new Set(record.diagram.buses.map((bus) => bus.id));
    for (const transformer of record.diagram.transformers) {
      assert.ok(busIds.has(transformer.from), `${record.code} ${transformer.label} has an unknown source bus`);
      assert.ok(busIds.has(transformer.to), `${record.code} ${transformer.label} has an unknown destination bus`);
    }
    for (const circuit of record.diagram.circuits) {
      assert.ok(busIds.has(circuit.bus), `${record.code} ${circuit.label} has an unknown bus`);
    }
  }
});

test("terminal diagrams link documented routes to the opposite station or island view", () => {
  const sunnyside = islandTerminalRecords.find((record) => record.code === "SUN");
  const html = renderTerminalDiagram(sunnyside.diagram, escapeHtml);
  assert.match(html, /data-hydro-terminal-record="BDE"/);
  assert.match(html, /data-hydro-terminal-record="CBC"/);
  assert.match(html, /data-island-circuit="TL203"/);
  assert.match(html, /75\/100\/125 MVA/);
});

test("Come By Chance renders four filed capacitor banks", () => {
  const comeByChance = islandTerminalRecords.find((record) => record.code === "CBC");
  assert.equal(comeByChance.diagram.shunts.length, 4);
  assert.ok(comeByChance.diagram.shunts.every((bank) => bank.rating === "38.35 MVAR"));
  const html = renderTerminalDiagram(comeByChance.diagram, escapeHtml);
  assert.match(html, /C1/);
  assert.match(html, /C4/);
});

test("four hydro generating stations have individual sourced records", () => {
  const expected = {
    USL: { name: "Upper Salmon Generating Station", rating: "84 MW", circuits: ["TL234", "TL263"] },
    GRC: { name: "Granite Canal Generating Station", rating: "40 MW", circuits: ["TL270"] },
    CAT: { name: "Cat Arm Generating Station", rating: "127 MW", circuits: ["TL247"] },
    HLA: { name: "Hinds Lake Generating Station", rating: "75 MW", circuits: ["TL243"] }
  };

  for (const [code, recordExpected] of Object.entries(expected)) {
    const record = islandTerminalRecords.find((entry) => entry.code === code);
    assert.ok(record, `${code} requires an individual record`);
    assert.equal(record.name, recordExpected.name);
    assert.equal(record.diagram.generators[0].rating, recordExpected.rating);
    assert.deepEqual(record.diagram.circuits.map((circuit) => circuit.label), recordExpected.circuits);
    assert.ok(record.sources.every((source) => source.pages), `${code} requires page-level sources`);
  }
});

test("Cat Arm TL247 remains unlinked until its opposite endpoint is established", () => {
  const catArm = islandTerminalRecords.find((record) => record.code === "CAT");
  const html = renderTerminalDiagram(catArm.diagram, escapeHtml);
  assert.doesNotMatch(html, /data-island-circuit="TL247"/);
  assert.match(html, />TL247</);
});

test("plant-assignment records cite physical PDF page 80", () => {
  for (const code of ["USL", "GRC", "CAT", "HLA"]) {
    const record = islandTerminalRecords.find((entry) => entry.code === code);
    const systemSource = record.sources.find((source) => source.sourceId === "gra-2013-v2");
    assert.equal(systemSource.pages, "physical PDF p. 80");
  }
});

test("Newfoundland Power circuit links open the station browser", () => {
  const diagram = {
    label: "Station link test",
    buses: [{ id: "b1", label: "bus", voltage: "66 kV" }],
    transformers: [],
    circuits: [{ label: "15L", destination: "Stamp's Lane", bus: "b1", stationCode: "SLA" }]
  };
  const html = renderTerminalDiagram(diagram, escapeHtml);
  assert.match(html, /href="#station-browser"/);
  assert.match(html, /data-station-record="SLA"/);
});

test("diagram text masks conductor strokes", async () => {
  const css = await readFile(new URL("../src/styles.css", import.meta.url), "utf8");
  assert.match(css, /\.terminal-diagram text\s*\{[^}]*paint-order:\s*stroke fill/s);
  assert.match(css, /\.terminal-diagram text\s*\{[^}]*stroke-width:\s*8px/s);
});

test("western and northern rural station records retain filed transformation and routes", () => {
  const expected = {
    BRH: ["138/66 kV", ["TL239", "TL259", "TL226"]],
    PBR: ["138/66 kV", ["TL259", "TL241", "TL262"]],
    PLP: ["138/12.5 kV", ["TL241", "TL244"]],
    BRC: ["138/12.5 kV", ["TL244", "TL256"]],
    SAA: ["138/69 kV", ["TL256", "TL257B", "TL261"]],
    HAW: ["66/12.5 kV", ["TL221"]],
    HOW: ["138/69 kV", ["TL245", "TL243", "TL224", "TL251"]],
    SBR: ["138/25 kV", ["TL222", "TL222"]],
    DOY: ["138/66 kV", ["TL214", "TL215"]],
    GRB: ["138/25 kV", ["TL250"]],
    EHW: ["69/25 kV", ["TL220", "TL220"]]
  };

  for (const [code, [ratio, circuits]] of Object.entries(expected)) {
    const record = islandTerminalRecords.find((entry) => entry.code === code);
    assert.ok(record, `${code} requires an individual record`);
    assert.equal(record.diagram.transformers[0].rating, ratio);
    assert.deepEqual(record.diagram.circuits.map((circuit) => circuit.label), circuits);
    assert.ok(record.sources.every((source) => source.pages), `${code} requires page-level sources`);
  }
});
