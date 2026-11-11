import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const topology = JSON.parse(
  await readFile(new URL("../research/derived/island-ac-topology-2018.json", import.meta.url), "utf8")
);

test("2018 island AC topology preserves the filed line tables", () => {
  assert.equal(topology.as_of_year, 2018);
  assert.equal(topology.lines.length, 58);
  assert.deepEqual(topology.voltage_classes_kv, [66, 138, 230]);
  assert.equal(new Set(topology.lines.map((line) => line.circuit)).size, topology.lines.length);
  assert.equal(topology.lines.filter((line) => line.voltage_kv === 66).length, 16);
  assert.equal(topology.lines.filter((line) => line.voltage_kv === 138).length, 16);
  assert.equal(topology.lines.filter((line) => line.voltage_kv === 230).length, 26);
});

test("every island AC circuit has endpoints and a physical PDF page", () => {
  for (const line of topology.lines) {
    assert.match(line.circuit, /^TL\d+[A-Z]?$/);
    assert.ok([66, 138, 230].includes(line.voltage_kv));
    assert.ok([24, 25, 26].includes(line.physical_pdf_page));
    assert.ok(line.segments.length >= 1);
    for (const segment of line.segments) {
      assert.ok(segment.from.length > 0);
      assert.ok(segment.to.length > 0);
      assert.notEqual(segment.from, segment.to);
    }
  }
});

test("critical 230 kV paths match PUB-NP-084 Attachment A", () => {
  const byCircuit = Object.fromEntries(topology.lines.map((line) => [line.circuit, line]));
  assert.deepEqual(byCircuit.TL202.segments, [{ from: "Bay d'Espoir", to: "Sunnyside" }]);
  assert.deepEqual(byCircuit.TL267.segments, [{ from: "Bay d'Espoir", to: "Western Avalon" }]);
  assert.deepEqual(byCircuit.TL201.segments, [{ from: "Western Avalon", to: "Soldiers Pond" }]);
  assert.deepEqual(byCircuit.TL242.segments, [{ from: "Soldiers Pond", to: "Hardwoods" }]);
  assert.deepEqual(byCircuit.TL218.segments, [{ from: "Holyrood Generating Station", to: "Oxen Pond" }]);
});

test("69 kV circuit assignment remains an explicit evidence gap", () => {
  assert.equal(topology.lines.some((line) => line.voltage_kv === 69), false);
  assert.match(topology.open_gaps.join(" "), /69 kV asset-class designations/);
  const historical69 = new Set(topology.historical_voltage_records.flatMap((record) => record.circuits));
  for (const circuit of ["TL215", "TL220", "TL221", "TL226", "TL227", "TL229", "TL251", "TL252", "TL261"]) {
    assert.ok(historical69.has(circuit));
    assert.equal(topology.lines.find((line) => line.circuit === circuit).voltage_kv, 66);
  }
});
