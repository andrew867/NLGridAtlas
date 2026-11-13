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

test("east Avalon circuit details preserve dated engineering records", () => {
  const byCircuit = Object.fromEntries(topology.lines.map((line) => [line.circuit, line]));
  assert.deepEqual(byCircuit.TL201.engineering_records.map(({ year }) => year), [1996, 2014, 2024]);
  assert.match(byCircuit.TL201.engineering_records[0].facts.join(" "), /81 km.*636 kcmil.*1192 kcmil/);
  assert.deepEqual(byCircuit.TL201.engineering_records[1].ambient_ratings_mva, {
    0: 322.2,
    15: 260.2,
    25: 207.7,
    30: 175.5
  });
  assert.match(byCircuit.TL201.engineering_records[2].facts[0], /March 2024/);
  assert.match(byCircuit.TL217.engineering_records[1].facts[0], /804 kcmil AACSR\/TW.*795 kcmil/);
  assert.match(byCircuit.TL242.engineering_records[0].facts[0], /804 kcmil, 23\/19 AACSR\/TW/);
  assert.match(byCircuit.TL266.engineering_records[0].facts[0], /636 kcmil, 26\/7 ACSR Grosbeak/);
  assert.equal(byCircuit.TL218.engineering_records[0].year, 1996);
  assert.match(byCircuit.TL218.engineering_records[0].label, /Pre-Soldiers Pond/);
});

test("Bay d'Espoir to Western Avalon circuits retain dated ratings and upgrade states", () => {
  const byCircuit = Object.fromEntries(topology.lines.map((line) => [line.circuit, line]));
  assert.deepEqual(byCircuit.TL202.engineering_records[1].ambient_ratings_mva, {
    0: 369.5,
    15: 297.7,
    25: 236.9,
    30: 199.3
  });
  assert.equal(byCircuit.TL202.engineering_records[2].status, "proposed");
  assert.match(byCircuit.TL203.engineering_records[0].facts.join(" "), /562\.5 kcmil.*636 kcmil/);
  assert.deepEqual(byCircuit.TL203.engineering_records[2].ambient_ratings_mva, {
    0: 347.0,
    15: 307.8,
    25: 278.0,
    30: 261.7
  });
  assert.match(byCircuit.TL207.engineering_records[1].facts.join(" "), /1968.*2002.*three-inch ice load/);
  assert.match(byCircuit.TL237.engineering_records[2].facts[0], /80 °C/);
  assert.equal(byCircuit.TL267.engineering_records[0].status, "proposed");
  assert.match(byCircuit.TL267.engineering_records[1].facts[0], /Commissioned.*2017|Commissioned as a 230 kV line/);
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
