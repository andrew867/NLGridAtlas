import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { islandTerminalRecords, sources, timeline } from "../src/data.js";

const record = JSON.parse(
  await readFile(new URL("../research/derived/bde-unit8-design-and-status-2026.json", import.meta.url), "utf8")
);

test("Bay d'Espoir Unit 8 retains the filed design and source hashes", () => {
  assert.equal(record.source.basis_of_design_sha256, "CAAB7447B174BAEAF82553F3B5E1E7ACD2D60B7C1E4836009CC92321BDE8F92A");
  assert.equal(record.source.october_update_sha256, "777A2BC9773103050644BB116B6974A6A518DBAD982747F5F9964D493E2E4CCF");
  assert.equal(record.source.order_17_2025_sha256, "8833F47F111894F7F09DF8F80E7431A42172182F5115926038D28DD7C701683F");
  assert.equal(record.source.order_21_2026_sha256, "8914B27C653A9B888FC2203CEDB9A3D8D17A5F892D2614CC3D409345D9A990F7");
  assert.equal(record.design.status, "proposed");
  assert.equal(record.design.nominal_capacity_mw, 150);
  assert.deepEqual(record.design.generator_step_up_transformer.rating_mva, [129, 172]);
  assert.equal(record.design.generator_step_up_transformer.low_voltage_kv, 13.8);
  assert.equal(record.design.generator_step_up_transformer.high_voltage_kv, 230);
  assert.equal(record.early_execution.total_approved_cad, 22300000);
  assert.equal(record.early_execution.order_17_2025_approved_cad + record.early_execution.order_21_2026_approved_cad, record.early_execution.total_approved_cad);
});

test("Unit 8 remains proposed in the Bay d'Espoir record", () => {
  const design = sources.find(({ id }) => id === "nlh-2025-bde-u8-basis");
  const update = sources.find(({ id }) => id === "nlh-2026-bde-u8-october-update");
  const station = islandTerminalRecords.find(({ code }) => code === "BDE");
  const facts = station.facts.flat().join(" ");
  const order = timeline.find(({ sourceId }) => sourceId === "pub-2026-bde-u8-early-order");

  assert.equal(design.status, "proposed");
  assert.equal(update.status, "reported");
  assert.match(facts, /Proposed Unit 8 design/);
  assert.match(facts, /Francis.*synchronous-condenser.*129\/172 MVA.*13\.8\/230 kV/);
  assert.match(facts, /\$22,300,000/);
  assert.match(facts, /commercial operation date was unknown/);
  assert.equal(order.date, "2026-07-08");
  assert.equal(order.status, "verified");
  assert.ok(station.sources.some(({ sourceId }) => sourceId === design.id));
  assert.ok(station.sources.some(({ sourceId }) => sourceId === update.id));
  assert.equal(station.diagram.generators.some(({ label }) => /Unit 8/i.test(label)), false);
});
