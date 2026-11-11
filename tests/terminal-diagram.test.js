import test from "node:test";
import assert from "node:assert/strict";
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
