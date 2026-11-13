import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const register = JSON.parse(
  await readFile(new URL("../research/derived/np-2018-feeder-register.json", import.meta.url), "utf8")
);

test("PUB-NP-081 feeder register preserves all 300 rows", () => {
  assert.equal(register.source.sha256, "a95d862df02f36a44c57ed17ce14db70ddccc3a69ceb92357c0aee3a853558cc");
  assert.equal(register.records.length, 300);
  assert.equal(new Set(register.records.map(({ feeder }) => feeder)).size, 300);
  assert.deepEqual(register.region_counts, { "St. John's": 108, Eastern: 87, Western: 105 });
});

test("published feeder loading percentages reconcile", () => {
  for (const row of register.records) {
    const calculated = row.forecast_winter_peak_mva / row.planning_capacity_mva * 100;
    assert.ok(Math.abs(calculated - row.loading_vs_planning_percent) <= 0.02, row.feeder);
  }
  const highest = register.records.reduce((left, right) => left.loading_vs_planning_percent > right.loading_vs_planning_percent ? left : right);
  assert.equal(highest.feeder, "VIR-07");
  assert.equal(highest.loading_vs_planning_percent, 99.21);
});

test("interface exposes the dated feeder register", async () => {
  const [html, main] = await Promise.all([
    readFile(new URL("../index.html", import.meta.url), "utf8"),
    readFile(new URL("../src/main.js", import.meta.url), "utf8")
  ]);
  assert.match(html, /data-register="feeders-2018"[^>]*>2018 feeders</);
  assert.match(main, /np-2018-feeder-register\.json/);
  assert.match(main, /feederRegister2018\.records/);
});
