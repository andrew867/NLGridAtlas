import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const collection = JSON.parse(
  await readFile(new URL("../research/derived/generation-collection-lines.json", import.meta.url), "utf8")
);

const byCircuit = Object.fromEntries(collection.lines.map((line) => [line.circuit, line]));

test("generation collection layer has four source-specific 230 kV circuits", () => {
  assert.equal(collection.lines.length, 4);
  assert.deepEqual(collection.lines.map((line) => line.circuit), ["TL235", "TL247", "TL248", "TL269"]);
  for (const line of collection.lines) {
    assert.equal(line.voltage_kv, 230);
    assert.match(line.source.url, /^http:\/\/www\.pub\.nl\.ca\//);
    assert.match(line.source.physical_pdf_pages, /^\d+/);
    assert.ok(line.segments.length > 0);
    assert.ok(line.engineering_records.length > 0);
    for (const record of line.engineering_records) {
      assert.match(record.source.url, /^http:\/\/www\.pub\.nl\.ca\//);
      assert.match(record.source.physical_pdf_pages, /^\d+/);
    }
  }
});

test("TL235 preserves its filed planning and route values", () => {
  const facts = byCircuit.TL235.engineering_records.flatMap(({ facts }) => facts).join(" ");
  assert.match(facts, /322\.2 MVA/);
  assert.match(facts, /86\.1 MVA/);
  assert.match(facts, /64\.3 MVA/);
  assert.match(facts, /0\.620 km/);
});

test("TL247 and TL248 preserve Deer Lake history, ratings, loads, and lengths", () => {
  const tl247 = byCircuit.TL247.engineering_records.flatMap(({ facts }) => facts).join(" ");
  const tl248 = byCircuit.TL248.engineering_records.flatMap(({ facts }) => facts).join(" ");
  assert.match(tl247, /constructed in 1984/);
  assert.match(tl247, /466\.6 MVA/);
  assert.match(tl247, /132\.5 MVA/);
  assert.match(tl247, /85\.3 MVA/);
  assert.match(tl247, /122\.909 km/);
  assert.match(tl248, /constructed in 1983/);
  assert.match(tl248, /466\.6 MVA/);
  assert.match(tl248, /127\.2 MVA/);
  assert.match(tl248, /85\.5 MVA/);
  assert.match(tl248, /55\.119 km/);
});

test("TL269 separates the modelled post-HVDC record from reported service", () => {
  assert.deepEqual(byCircuit.TL269.engineering_records.map(({ year, status }) => [year, status]), [
    [2016, "modelled"],
    [2017, "reported"]
  ]);
  const facts = byCircuit.TL269.engineering_records.flatMap(({ facts }) => facts).join(" ");
  assert.match(facts, /180 km/);
  assert.match(facts, /460 MVA/);
  assert.match(facts, /was in service/);
});
