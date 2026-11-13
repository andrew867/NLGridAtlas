import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { islandTerminalRecords, sources, timeline } from "../src/data.js";

const record = JSON.parse(
  await readFile(new URL("../research/derived/bde-unit7-electrical-2023.json", import.meta.url), "utf8")
);

test("Bay d'Espoir Unit 7 electrical record retains source hashes and filed values", () => {
  assert.equal(record.source.application_sha256, "1CF1F6663569A6C5DAE6F4495F207BE3E0B523A380E0392261C7E6648E6E021C");
  assert.equal(record.source.order_sha256, "E6C4434AA7325C7BBDDC60B16839D2D40C1B02688A648543F76B28E2B8042B36");
  assert.deepEqual(record.generator, {
    inspection_date: "2023-08-08 to 2023-08-10",
    manufacturer: "GE",
    installation_year: 1977,
    rating_mva: 172,
    voltage_v: 13800,
    current_a: 7196,
    frequency_hz: 60,
    power_factor: 0.9,
    rated_speed_rpm: 225,
    runaway_speed_rpm: 380,
    physical_pdf_page: 211
  });
  assert.equal(record.excitation_system.transformer.rating_kva, 1175);
  assert.deepEqual(record.excitation_system.transformer.hv_rating_v, [13800, 7970]);
  assert.equal(record.excitation_system.transformer.lv_rating_v, 559);
  assert.equal(record.excitation_system.transformer.impedance_percent, 5.64);
  assert.equal(record.neutral_grounding_cubicle.rated_voltage_kv, 18);
  assert.equal(record.neutral_grounding_cubicle.maximum_voltage_kv, 24.94);
  assert.equal(record.approval.approved_capital_cad, 66265000);
});

test("Unit 7 equipment and approval are connected to the Bay d'Espoir record", () => {
  const application = sources.find(({ id }) => id === "nlh-bde-u7-life-extension-2025");
  const order = sources.find(({ id }) => id === "pub-2026-bde-u7-order");
  const station = islandTerminalRecords.find(({ code }) => code === "BDE");
  const facts = station.facts.flat().join(" ");
  const approval = timeline.find(({ sourceId }) => sourceId === "pub-2026-bde-u7-order");

  assert.equal(application.status, "reported");
  assert.equal(application.pages, "physical PDF pp. 211, 218 to 219, and 221");
  assert.equal(order.status, "verified");
  assert.match(facts, /172 MVA, 13\.8 kV, 7,196 A, 60 Hz, 0\.9 power factor, 225 rpm/);
  assert.match(facts, /1,175 kVA.*13\.8\/7\.97 kV to 559 V, 5\.64% impedance.*2014/);
  assert.match(facts, /18 kV rated voltage and 24\.94 kV maximum voltage/);
  assert.match(facts, /\$66,265,000 on April 21, 2026/);
  assert.equal(approval.date, "2026-04-21");
  assert.equal(approval.status, "verified");
  assert.ok(station.sources.some(({ sourceId }) => sourceId === application.id));
  assert.ok(station.sources.some(({ sourceId }) => sourceId === order.id));
});
