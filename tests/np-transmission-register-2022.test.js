import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const register = JSON.parse(
  await readFile(new URL("../research/derived/np-2022-transmission-register.json", import.meta.url), "utf8")
);

test("2022 cost-date transmission register reconciles to CA-NP-168", () => {
  assert.equal(register.source.sha256, "94e1720d54e98dc6126f4faa2106584de6c28a84d143ccb3e11adb5fd8793c56");
  assert.equal(register.cost_date, "2022-12-31");
  assert.equal(register.records.length, 109);
  assert.equal(new Set(register.records.map(({ circuit }) => circuit)).size, 109);
  assert.equal(register.records.reduce((sum, row) => sum + row.historical_cost_thousands, 0), 186897);
  assert.equal(register.undistributed_cost_thousands, 54);
  assert.equal(register.total_cost_thousands, 186951);
});

test("exceptional tap and allocation records are retained", () => {
  const robinsons = register.records.find(({ circuit }) => circuit === "403L Rob Tap");
  const lowerCove = register.records.find(({ circuit }) => circuit === "410L");
  assert.equal(robinsons.historical_cost_thousands, 885);
  assert.match(robinsons.description, /Robinson's Substation/);
  assert.equal(lowerCove.allocation, "Common/Specific");
  assert.equal(lowerCove.historical_cost_thousands, 2720);
  assert.equal(lowerCove.footnote, 2);
});

test("interface keeps 2022 and 2005 line registers separate", async () => {
  const [html, main] = await Promise.all([
    readFile(new URL("../index.html", import.meta.url), "utf8"),
    readFile(new URL("../src/main.js", import.meta.url), "utf8")
  ]);
  assert.match(html, /data-register="lines-2022"[^>]*>2022 lines</);
  assert.match(html, /data-register="lines-2005"[^>]*>2005 lines</);
  assert.match(main, /np-2022-transmission-register\.json/);
  assert.match(main, /transmissionRegister2022\.records/);
});
