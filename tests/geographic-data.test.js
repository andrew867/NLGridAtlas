import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const routes = JSON.parse(await readFile(
  new URL("../research/derived/gnl-canvec-newfoundland-transmission-lines.geojson", import.meta.url),
  "utf8"
));
const stations = JSON.parse(await readFile(
  new URL("../research/derived/station-coordinate-register.json", import.meta.url),
  "utf8"
));
const l3501 = JSON.parse(await readFile(
  new URL("../research/derived/gnl-nalcor-l3501-route.geojson", import.meta.url),
  "utf8"
));

function coordinatePairs(geometry) {
  const pairs = [];
  const walk = (value) => {
    if (!Array.isArray(value)) return;
    if (value.length >= 2 && Number.isFinite(value[0]) && Number.isFinite(value[1])) {
      pairs.push([value[0], value[1]]);
      return;
    }
    value.forEach(walk);
  };
  walk(geometry.coordinates);
  return pairs;
}

test("historical GeoAtlas route export retains its source and selection counts", () => {
  assert.equal(routes.type, "FeatureCollection");
  assert.equal(routes.source.publisher, "Government of Newfoundland and Labrador, GeoAtlas");
  assert.equal(routes.source.layer, "Canvec Transmission Lines, MapServer layer 16");
  assert.equal(routes.source.url, "https://dnrmaps.gov.nl.ca/arcgis/rest/services/GeoAtlas/Map_Layers/MapServer/16");
  assert.equal(routes.source.evidenceState, "reported");
  assert.equal(routes.selection.fullLayerFeatureCount, 671);
  assert.equal(routes.selection.selectedFeatureCount, 588);
  assert.deepEqual(routes.selection.validationDateRange, [1979, 1991]);
  assert.equal(routes.features.length, 588);
  assert.ok(routes.limits.some((limit) => /not a current utility as-built record/.test(limit)));
});

test("route export contains only finite line geometry inside the island selection result", () => {
  for (const feature of routes.features) {
    assert.ok(["LineString", "MultiLineString"].includes(feature.geometry.type));
    const pairs = coordinatePairs(feature.geometry);
    assert.ok(pairs.length >= 2, `feature ${feature.properties.OBJECTID_12} has no route geometry`);
    for (const [longitude, latitude] of pairs) {
      assert.ok(Number.isFinite(longitude));
      assert.ok(Number.isFinite(latitude));
    }
  }
});

test("GeoAtlas retains the published L3501 geographic route", () => {
  assert.equal(l3501.type, "FeatureCollection");
  assert.equal(l3501.source.layer, "Nalcor Transmission Line, MapServer layer 15");
  assert.equal(l3501.source.url, "https://dnrmaps.gov.nl.ca/arcgis/rest/services/GeoAtlas/Map_Layers/MapServer/15");
  assert.equal(l3501.selection.fullLayerFeatureCount, 4);
  assert.equal(l3501.selection.selectedFeatureCount, 1);
  assert.equal(l3501.features.length, 1);
  assert.equal(String(l3501.features[0].properties.TL_ID), "3501");
  const pairs = coordinatePairs(l3501.features[0].geometry);
  assert.ok(pairs.some(([longitude, latitude]) => (
    longitude >= l3501.selection.envelopeWgs84.west
    && longitude <= l3501.selection.envelopeWgs84.east
    && latitude >= l3501.selection.envelopeWgs84.south
    && latitude <= l3501.selection.envelopeWgs84.north
  )));
  assert.ok(l3501.limits.some((limit) => /does not contain.*L3502/.test(limit)));
});

test("station coordinate register contains the 22 checked station boundaries", () => {
  assert.equal(stations.coordinateSystem, "WGS 84, EPSG:4326");
  assert.deepEqual(
    stations.stations.map((station) => station.id),
    [
      "opd", "hwd", "hol", "spd", "wav", "apt", "bcv", "cha", "gdl", "gou", "kbr",
      "kel", "ken", "lpd", "mol", "mun", "pep", "rrd", "scv", "sjm", "sla", "vir"
    ]
  );
  assert.ok(stations.limits.some((limit) => /does not establish circuit topology/.test(limit)));

  const byId = new Map(stations.stations.map((station) => [station.id, station]));
  assert.equal(byId.get("hwd").sourceRef, "HWDTS");
  assert.equal(byId.get("apt").sourceRef, "APT");
  assert.equal(byId.get("kbr").sourceRef, "KBR");
  assert.equal(byId.get("lpd").sourceRef, "LPD");
  assert.equal(byId.get("mol").sourceRef, "MOL");
  assert.equal(byId.get("sjm").sourceRef, "SJM");
  assert.equal(byId.get("rrd").sourceRef, "RRD");
  assert.equal(byId.get("vir").sourceRef, "VIR");
  assert.equal(byId.get("gou").sourceRef, "GOU");

  for (const station of stations.stations) {
    assert.ok(station.latitude >= 46.45 && station.latitude <= 51.0);
    assert.ok(station.longitude >= -59.7 && station.longitude <= -52.4);
    assert.match(station.coordinateMethod, /published OSM station boundary/);
    assert.equal(station.source.evidenceState, "reported");
    assert.match(station.source.object, /^way\/\d+$/);
    assert.equal(station.source.url, `https://www.openstreetmap.org/${station.source.object}`);
    assert.equal(station.source.apiUrl, `https://api.openstreetmap.org/api/0.6/${station.source.object}/full.json`);
    assert.equal(station.source.license, "ODbL 1.0");
  }
});
