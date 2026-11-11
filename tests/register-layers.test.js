import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const data = JSON.parse(await readFile(
  new URL("../research/derived/np-register-layers-2008-2013.json", import.meta.url),
  "utf8"
));
const handbook = JSON.parse(await readFile(
  new URL("../research/derived/np-2006-handbook.json", import.meta.url),
  "utf8"
));

test("later Newfoundland Power register layers retain their source files", () => {
  assert.match(data.sources.feeder_register.sha256, /^[a-f0-9]{64}$/);
  assert.match(data.sources.line_loading.sha256, /^[a-f0-9]{64}$/);
  assert.equal(data.sources.feeder_register.physical_pages, "3 to 8");
  assert.equal(data.sources.line_loading.physical_pages, "3 to 11");
});

test("PUB-NP-5 republishes the June 2005 station and feeder register unchanged", () => {
  const first = handbook.substations.map(({ code, name, feeders }) => ({ code, name, feeders }));
  const second = data.feeder_stations.map(({ code, name, feeders }) => ({ code, name, feeders }));
  assert.deepEqual(second, first);
  assert.equal(second.length, 136);
  assert.equal(second.reduce((sum, station) => sum + station.feeders.length, 0), 302);
});

test("2008 substation and feeder listing expands abbreviated feeder numbers", () => {
  const station = new Map(data.feeder_stations.map((item) => [item.code, item]));
  assert.deepEqual(station.get("HWD").feeders, ["HWD-01", "HWD-02", "HWD-03", "HWD-04", "HWD-06", "HWD-07", "HWD-08"]);
  assert.deepEqual(station.get("OXP").feeders, ["OXP-01"]);
  assert.deepEqual(station.get("PUL").feeders, ["PUL-01", "PUL-02", "PUL-03"]);
  assert.deepEqual(station.get("MUN").feeders, []);
});

test("2013 loading register preserves circuit endpoints, ratings, and forecast values", () => {
  assert.equal(data.transmission_line_loading.length, 153);
  assert.equal(new Set(data.transmission_line_loading.map((item) => item.circuit)).size, 144);
  const row = data.transmission_line_loading.find((item) => item.circuit === "54L");
  assert.deepEqual(row, {
    circuit: "54L",
    source_circuit: "054L",
    footnote_marker: null,
    from: "HWD",
    to: "KEN",
    voltage_kv: 66,
    winter_continuous_rating_mva: 114.8,
    winter_continuous_rating_amps: 1003.9,
    forecast_2012_peak_mva: 49.18,
    forecast_2012_peak_amps: 416.7,
    forecast_percent_rating: 42,
    region: "St. John's",
    source_page: 3
  });
});

test("loading records retain sectional circuit identifiers and normally-open notes", () => {
  const circuits = new Set(data.transmission_line_loading.map((item) => item.circuit));
  assert.ok(circuits.has("20L(A)"));
  assert.ok(circuits.has("124L(E)"));
  assert.ok(circuits.has("114L(A)"));
  assert.ok(circuits.has("404L"));
});
