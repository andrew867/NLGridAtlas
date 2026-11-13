import test from "node:test";
import assert from "node:assert/strict";
import { islandRenderedLines, northernLineHistory2001 } from "../src/island-backbone.js";

const expectedCircuits = ["TL221", "TL241", "TL244", "TL256", "TL261", "TL257"];

test("northern line history includes every circuit answered in IC-270", () => {
  assert.deepEqual(northernLineHistory2001.records.map((record) => record.circuit), expectedCircuits);
  assert.equal(northernLineHistory2001.source.physical_pdf_pages, "34 to 35");
});

test("northern line history preserves the filed build and conversion chronology", () => {
  const byCircuit = Object.fromEntries(northernLineHistory2001.records.map((record) => [record.circuit, record.engineering_records]));
  assert.deepEqual(byCircuit.TL221.map((record) => record.year), [1970, 1990]);
  assert.match(byCircuit.TL221[1].facts.join(" "), /TL262/);
  assert.deepEqual(byCircuit.TL241.map((record) => record.year), [1983, 1995]);
  assert.match(byCircuit.TL241[0].facts.join(" "), /138 kV standard.*66 kV/);
  assert.deepEqual(byCircuit.TL244.map((record) => record.year), [1983, 1995]);
  assert.match(byCircuit.TL244[1].facts.join(" "), /138 kV/);
  assert.equal(byCircuit.TL256[0].year, 1995);
  assert.equal(byCircuit.TL261[0].year, 1996);
  assert.match(byCircuit.TL261[0].facts.join(" "), /69 kV/);
  assert.equal(byCircuit.TL257[0].year, 1989);
});

test("construction history is attached to rendered circuit records", () => {
  const byCircuit = Object.fromEntries(islandRenderedLines.map((line) => [line.circuit, line]));
  for (const circuit of expectedCircuits) {
    assert.ok(byCircuit[circuit].engineering_records.some((record) => record.label.includes("Construction record")));
  }
});
