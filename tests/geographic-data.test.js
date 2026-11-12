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
