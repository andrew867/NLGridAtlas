import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const OUTPUT_DIR = resolve(ROOT, "research", "derived");
const RETRIEVED = "2026-11-11";

const CANVEC_LAYER = "https://dnrmaps.gov.nl.ca/arcgis/rest/services/GeoAtlas/Map_Layers/MapServer/16";
const CANVEC_QUERY = `${CANVEC_LAYER}/query`;
const NALCOR_LAYER = "https://dnrmaps.gov.nl.ca/arcgis/rest/services/GeoAtlas/Map_Layers/MapServer/15";
const NALCOR_QUERY = `${NALCOR_LAYER}/query`;
const ISLAND_SELECTION_ENVELOPE = {
  west: -59.7,
  south: 46.45,
  east: -52.4,
  north: 51.0
};

const stationObjects = [
  { id: "opd", atlasName: "Oxen Pond Terminal Station", osmType: "way", osmId: 113031677 },
  { id: "hwd", atlasName: "Hardwoods Terminal Station", osmType: "way", osmId: 252505650 },
  { id: "hol", atlasName: "Holyrood Terminal Station", osmType: "way", osmId: 229936554 },
  { id: "spd", atlasName: "Soldiers Pond Terminal Station", osmType: "way", osmId: 1293515683 },
  { id: "wav", atlasName: "Western Avalon Terminal Station", osmType: "way", osmId: 132014003 },
  { id: "apt", atlasName: "Airport Substation", osmType: "way", osmId: 1425073497 },
  { id: "bcv", atlasName: "Broad Cove Substation", osmType: "way", osmId: 767405572 },
  { id: "cha", atlasName: "Chamberlains Substation", osmType: "way", osmId: 940524714 },
  { id: "gdl", atlasName: "Glendale Substation", osmType: "way", osmId: 775556176 },
  { id: "gou", atlasName: "Goulds Substation", osmType: "way", osmId: 775556178 },
  { id: "kbr", atlasName: "King's Bridge Station", osmType: "way", osmId: 216941660 },
  { id: "kel", atlasName: "Kelligrews Substation", osmType: "way", osmId: 938223783 },
  { id: "ken", atlasName: "Kenmount Substation", osmType: "way", osmId: 256872235 },
  { id: "lpd", atlasName: "Long Pond Substation", osmType: "way", osmId: 1293488213 },
  { id: "mol", atlasName: "Molloy's Lane Substation", osmType: "way", osmId: 937372866 },
  { id: "mun", atlasName: "Memorial Substation", osmType: "way", osmId: 118116948 },
  { id: "pep", atlasName: "Pepperrell Substation", osmType: "way", osmId: 918985168 },
  { id: "rrd", atlasName: "Ridge Road Substation", osmType: "way", osmId: 260768602 },
  { id: "scv", atlasName: "Seal Cove Substation", osmType: "way", osmId: 259757163 },
  { id: "sjm", atlasName: "St. John's Main", osmType: "way", osmId: 1427754728 },
  { id: "sla", atlasName: "Stamp's Lane Substation", osmType: "way", osmId: 260955557 },
  { id: "vir", atlasName: "Virginia Waters Substation", osmType: "way", osmId: 381389667 },
];

const requestHeaders = {
  "User-Agent": "NLGridAtlas/0.1 (https://github.com/andrew867/NLGridAtlas)"
};

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: { ...requestHeaders, ...(options.headers || {}) }
  });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${url}`);
  return response.json();
}

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

function intersectsSelectionEnvelope(feature) {
  return coordinatePairs(feature.geometry).some(([longitude, latitude]) => (
    longitude >= ISLAND_SELECTION_ENVELOPE.west
    && longitude <= ISLAND_SELECTION_ENVELOPE.east
    && latitude >= ISLAND_SELECTION_ENVELOPE.south
    && latitude <= ISLAND_SELECTION_ENVELOPE.north
  ));
}

function polygonCentroid(points) {
  if (points.length < 3) throw new Error("A station way needs at least three nodes.");
  const ring = points[0][0] === points.at(-1)[0] && points[0][1] === points.at(-1)[1]
    ? points
    : [...points, points[0]];
  let areaTwice = 0;
  let longitudeSum = 0;
  let latitudeSum = 0;
  for (let index = 0; index < ring.length - 1; index += 1) {
    const [x1, y1] = ring[index];
    const [x2, y2] = ring[index + 1];
    const cross = x1 * y2 - x2 * y1;
    areaTwice += cross;
    longitudeSum += (x1 + x2) * cross;
    latitudeSum += (y1 + y2) * cross;
  }
  if (Math.abs(areaTwice) < 1e-12) {
    const unique = ring.slice(0, -1);
    return {
      longitude: unique.reduce((sum, [longitude]) => sum + longitude, 0) / unique.length,
      latitude: unique.reduce((sum, [, latitude]) => sum + latitude, 0) / unique.length,
      method: "vertex mean"
    };
  }
  return {
    longitude: longitudeSum / (3 * areaTwice),
    latitude: latitudeSum / (3 * areaTwice),
    method: "polygon centroid"
  };
}

async function fetchCanvecRoutes() {
  const query = new URLSearchParams({
    where: "1=1",
    outFields: "OBJECTID_12,CODE,ACCURACY,DATANAME,VALDATE,PROVIDER,ID,NOLINES,TYPE,THEME,Shape_Length",
    returnGeometry: "true",
    outSR: "4326",
    returnZ: "false",
    returnM: "false",
    f: "geojson"
  });
  const geojson = await fetchJson(`${CANVEC_QUERY}?${query}`, {
    headers: { Referer: `${CANVEC_LAYER}/query` }
  });
  const features = geojson.features.filter(intersectsSelectionEnvelope);
  const years = features
    .map((feature) => Number.parseInt(feature.properties.VALDATE, 10))
    .filter(Number.isFinite);
  return {
    type: "FeatureCollection",
    source: {
      publisher: "Government of Newfoundland and Labrador, GeoAtlas",
      layer: "Canvec Transmission Lines, MapServer layer 16",
      url: CANVEC_LAYER,
      queryUrl: `${CANVEC_QUERY}?${query}`,
      retrieved: RETRIEVED,
      evidenceState: "reported"
    },
    selection: {
      description: "Features that intersect the Newfoundland island selection envelope",
      envelopeWgs84: ISLAND_SELECTION_ENVELOPE,
      fullLayerFeatureCount: geojson.features.length,
      selectedFeatureCount: features.length,
      validationDateRange: years.length ? [Math.min(...years), Math.max(...years)] : []
    },
    limits: [
      "The layer does not identify Hydro or Newfoundland Power circuit designations.",
      "The validation-date field is historical and varies by feature.",
      "The routes are a geographic reference layer, not a current utility as-built record."
    ],
    features
  };
}

async function fetchL3501Route() {
  const query = new URLSearchParams({
    where: "1=1",
    outFields: "OBJECTID,Id,TL_ID,Shape_Length",
    returnGeometry: "true",
    outSR: "4326",
    returnZ: "false",
    returnM: "false",
    f: "geojson"
  });
  const geojson = await fetchJson(`${NALCOR_QUERY}?${query}`, {
    headers: { Referer: `${NALCOR_LAYER}/query` }
  });
  const features = geojson.features.filter((feature) => (
    String(feature.properties.TL_ID) === "3501"
    && intersectsSelectionEnvelope(feature)
  ));
  return {
    type: "FeatureCollection",
    source: {
      publisher: "Government of Newfoundland and Labrador, GeoAtlas",
      layer: "Nalcor Transmission Line, MapServer layer 15",
      url: NALCOR_LAYER,
      queryUrl: `${NALCOR_QUERY}?${query}`,
      retrieved: RETRIEVED,
      evidenceState: "reported"
    },
    selection: {
      description: "TL_ID 3501 features that intersect the Newfoundland island selection envelope",
      envelopeWgs84: ISLAND_SELECTION_ENVELOPE,
      fullLayerFeatureCount: geojson.features.length,
      selectedFeatureCount: features.length,
      fullLayerCircuitIds: [...new Set(geojson.features.map((feature) => String(feature.properties.TL_ID)))].sort()
    },
    limits: [
      "The layer contains one island-intersecting TL_ID 3501 route feature.",
      "The layer does not contain a voltage field or separate geometry for L3502.",
      "The route geometry does not establish conductor, structure, or as-built equipment details."
    ],
    features
  };
}

async function fetchStationCoordinate(station) {
  const sourceUrl = `https://api.openstreetmap.org/api/0.6/${station.osmType}/${station.osmId}/full.json`;
  const payload = await fetchJson(sourceUrl);
  const way = payload.elements.find((element) => element.type === station.osmType && element.id === station.osmId);
  if (!way) throw new Error(`OSM object not found: ${station.osmType}/${station.osmId}`);
  const nodes = new Map(payload.elements
    .filter((element) => element.type === "node")
    .map((node) => [node.id, [node.lon, node.lat]]));
  const points = way.nodes.map((nodeId) => nodes.get(nodeId));
  if (points.some((point) => !point)) throw new Error(`OSM way has a missing node: ${station.osmId}`);
  const centroid = polygonCentroid(points);
  return {
    id: station.id,
    atlasName: station.atlasName,
    sourceName: way.tags?.name || null,
    sourceRef: way.tags?.ref || null,
    sourceOperator: way.tags?.operator || null,
    latitude: Number(centroid.latitude.toFixed(6)),
    longitude: Number(centroid.longitude.toFixed(6)),
    coordinateMethod: `${centroid.method} of the published OSM station boundary`,
    source: {
      publisher: "OpenStreetMap contributors",
      object: `${station.osmType}/${station.osmId}`,
      url: `https://www.openstreetmap.org/${station.osmType}/${station.osmId}`,
      apiUrl: sourceUrl,
      objectTimestamp: way.timestamp,
      objectVersion: way.version,
      retrieved: RETRIEVED,
      license: "ODbL 1.0",
      evidenceState: "reported"
    }
  };
}

await mkdir(OUTPUT_DIR, { recursive: true });
const [routes, l3501, stations] = await Promise.all([
  fetchCanvecRoutes(),
  fetchL3501Route(),
  Promise.all(stationObjects.map(fetchStationCoordinate))
]);

const stationRegister = {
  generated: RETRIEVED,
  coordinateSystem: "WGS 84, EPSG:4326",
  method: "Centroids are calculated from published OSM station-boundary nodes. Coordinates support map placement only.",
  limits: [
    "OpenStreetMap is a community-maintained geographic dataset, not a utility asset register.",
    "A coordinate does not establish circuit topology, equipment ownership, voltage, or operating state.",
    "Station records without a checked boundary remain outside this register."
  ],
  stations
};

const routesPath = resolve(OUTPUT_DIR, "gnl-canvec-newfoundland-transmission-lines.geojson");
const l3501Path = resolve(OUTPUT_DIR, "gnl-nalcor-l3501-route.geojson");
const stationsPath = resolve(OUTPUT_DIR, "station-coordinate-register.json");
await Promise.all([
  writeFile(routesPath, `${JSON.stringify(routes, null, 2)}\n`, "utf8"),
  writeFile(l3501Path, `${JSON.stringify(l3501, null, 2)}\n`, "utf8"),
  writeFile(stationsPath, `${JSON.stringify(stationRegister, null, 2)}\n`, "utf8")
]);

console.log(`Wrote ${routes.selection.selectedFeatureCount} route features to ${routesPath}`);
console.log(`Wrote ${l3501.selection.selectedFeatureCount} L3501 route feature to ${l3501Path}`);
console.log(`Wrote ${stations.length} station coordinates to ${stationsPath}`);
