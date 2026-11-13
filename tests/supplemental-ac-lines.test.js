import test from "node:test";
import assert from "node:assert/strict";
import { islandRenderedLines, supplementalAcLines } from "../src/island-backbone.js";

test("supplemental AC layer adds TL225 and TL257 with explicit filed voltages", () => {
  assert.deepEqual(supplementalAcLines.lines.map((line) => [line.circuit, line.voltage_kv]), [
    ["TL225", 66],
    ["TL257", 69]
  ]);
  assert.deepEqual(supplementalAcLines.lines[0].segments, [{ from: "Deer Lake Power", to: "Deer Lake" }]);
  assert.equal(supplementalAcLines.lines[1].segments[0].from, "St. Anthony Airport");
  assert.equal(supplementalAcLines.lines[1].segments[0].to, "Roddicktown Wood Chip");
});

test("supplemental circuits retain endpoint, construction, and source-page evidence", () => {
  const byCircuit = Object.fromEntries(supplementalAcLines.lines.map((line) => [line.circuit, line]));
  assert.match(byCircuit.TL225.engineering_records[0].facts.join(" "), /66 kV.*Deer Lake Power.*Deer Lake Terminal Station/);
  assert.equal(byCircuit.TL225.source.physical_pdf_pages, "4");
  assert.equal(byCircuit.TL257.source.physical_pdf_pages, "35");
});

test("supplemental circuits receive their 2015 planning records", () => {
  const byCircuit = Object.fromEntries(islandRenderedLines.map((line) => [line.circuit, line]));
  for (const circuit of ["TL225", "TL257"]) {
    assert.ok(byCircuit[circuit].engineering_records.some((record) => record.label.includes("filed rating and load record")));
  }
});
