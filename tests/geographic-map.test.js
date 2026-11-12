import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("geographic map uses the sourced route and station registers", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const main = await readFile(new URL("../src/main.js", import.meta.url), "utf8");
  const module = await readFile(new URL("../src/geographic-map.js", import.meta.url), "utf8");
  const routes = JSON.parse(await readFile(new URL("../research/derived/gnl-canvec-newfoundland-transmission-lines.geojson", import.meta.url), "utf8"));
  const l3501 = JSON.parse(await readFile(new URL("../research/derived/gnl-nalcor-l3501-route.geojson", import.meta.url), "utf8"));
  const stations = JSON.parse(await readFile(new URL("../research/derived/station-coordinate-register.json", import.meta.url), "utf8"));

  assert.equal(routes.selection.selectedFeatureCount, 588);
  assert.equal(l3501.selection.selectedFeatureCount, 1);
  assert.equal(stations.stations.length, 22);
  assert.match(module, /const islandBounds = \{ west: -59\.7, south: 46\.45, east: -52\.4, north: 51\.0 \}/);
  assert.match(module, /const avalonBounds = \{ west: -54\.0, south: 47\.25, east: -52\.55, north: 47\.75 \}/);
  assert.match(module, /geojson\?url/);
  assert.match(module, /routes = await response\.json\(\)/);
  assert.match(module, /l3501Routes = await l3501Response\.json\(\)/);
  assert.match(module, /geographic-hvdc-route/);
  assert.match(module, /apt: \{ href: "#station-browser"/);
  assert.match(module, /lpd: \{ href: "#station-browser"/);
  assert.match(module, /mol: \{ href: "#station-browser"/);
  assert.match(module, /sjm: \{ href: "#station-browser"/);
  assert.match(module, /function spreadLabels\(items, height\)/);
  assert.match(module, /geographic-label-leader/);
  assert.match(html, /id="geographic-network"/);
  assert.match(html, /id="geographic-island-map"/);
  assert.match(html, /id="geographic-avalon-map"/);
  assert.match(html, /1979 TO 1991 ROUTE VALIDATION YEARS/);
  assert.match(html, /GEOATLAS TL_ID 3501/);
  assert.match(main, /initGeographicMap\(\)/);
});

test("map selection updates detail without navigating the page", async () => {
  const module = await readFile(new URL("../src/geographic-map.js", import.meta.url), "utf8");
  assert.match(module, /data-geographic-station/);
  assert.match(module, /function selectStation\(id\)/);
  assert.doesNotMatch(module, /location\.hash|scrollIntoView/);
  assert.match(module, /data-station-record/);
  assert.match(module, /data-hydro-terminal-record/);
});
