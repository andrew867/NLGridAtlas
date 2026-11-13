import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { islandRenderedLines, islandTopology, planningLoads2015, supplementalAcLines } from "../src/island-backbone.js";

const sourceFile = JSON.parse(
  await readFile(new URL("../research/derived/transmission-loads-2015.json", import.meta.url), "utf8")
);

const byCircuit = Object.fromEntries(sourceFile.records.map((record) => [record.circuit, record]));

test("2015 planning layer contains all filed 138 kV and 66/69 kV rows", () => {
  assert.equal(planningLoads2015.records.length, 32);
  assert.equal(planningLoads2015.records.filter((record) => record.source_table === "138 kV").length, 16);
  assert.equal(planningLoads2015.records.filter((record) => record.source_table === "66/69 kV").length, 16);
  assert.equal(new Set(planningLoads2015.records.map((record) => record.circuit)).size, 32);

  const topologyCircuits = new Set([...islandTopology.lines, ...supplementalAcLines.lines].map((line) => line.circuit));
  for (const record of planningLoads2015.records) {
    assert.ok(topologyCircuits.has(record.circuit), record.circuit);
    assert.ok([4, 5].includes(record.physical_pdf_page));
    assert.ok(record.rating_at_0c_mva > 0);
    assert.ok(record.anticipated_winter_peak_mva >= 0);
    assert.ok(record.anticipated_2015_average_mva >= 0);
    assert.ok(record.filed_average_to_peak_percent >= 0 && record.filed_average_to_peak_percent <= 100);
  }
});

test("138 kV records preserve filed values and operating notes", () => {
  assert.deepEqual(byCircuit.TL210, {
    circuit: "TL210",
    source_table: "138 kV",
    physical_pdf_page: 4,
    rating_at_0c_mva: 144.1,
    anticipated_winter_peak_mva: 67.6,
    anticipated_2015_average_mva: 43.9,
    filed_average_to_peak_percent: 65
  });
  assert.match(byCircuit.TL222.notes.join(" "), /Hinds Lake and Cat Arm.*Deer Lake and Stony Brook/);
  assert.match(byCircuit.TL241.notes.join(" "), /Two 5 MVAR.*shunt reactors/);
  assert.match(byCircuit.TL243.notes.join(" "), /Hinds Lake Generating Station.*Hinds Lake production/);
  assert.match(byCircuit.TL256.notes.join(" "), /St\. Anthony and Roddickton.*Three 3 MVAR/);
});

test("66/69 kV records preserve filed values and operating notes", () => {
  assert.equal(byCircuit.TL215.rating_at_0c_mva, 46.0);
  assert.equal(byCircuit.TL215.anticipated_winter_peak_mva, 22.1);
  assert.match(byCircuit.TL215.notes[0], /Rose Blanche Brook.*5\.7 MW/);
  assert.match(byCircuit.TL225.notes.join(" "), /Deer Lake Power.*Corner Brook Pulp and Paper/);
  assert.match(byCircuit.TL264.notes[0], /Duck Pond Mine.*2015/);
  assert.equal(byCircuit.TL280.filed_average_to_peak_percent, 96);
  assert.match(byCircuit.TL280.notes.join(" "), /Star Lake Generating Station.*Star Lake production/);
});

test("planning records render without changing later circuit voltage values", () => {
  const renderedByCircuit = Object.fromEntries(islandRenderedLines.map((line) => [line.circuit, line]));
  for (const record of planningLoads2015.records) {
    const engineering = renderedByCircuit[record.circuit].engineering_records.find((item) => item.label.includes("filed rating and load record"));
    assert.ok(engineering, record.circuit);
    assert.equal(engineering.year, 2015);
    assert.equal(engineering.source.physical_pdf_pages, String(record.physical_pdf_page));
  }
  assert.equal(renderedByCircuit.TL215.voltage_kv, 66);
  assert.equal(renderedByCircuit.TL222.voltage_kv, 138);
});
