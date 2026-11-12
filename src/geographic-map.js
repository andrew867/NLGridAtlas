import routesUrl from "../research/derived/gnl-canvec-newfoundland-transmission-lines.geojson?url";
import stationRegister from "../research/derived/station-coordinate-register.json" with { type: "json" };

let routes;

const islandBounds = { west: -59.7, south: 46.45, east: -52.4, north: 51.0 };
const avalonBounds = { west: -54.0, south: 47.25, east: -52.55, north: 47.75 };
const stationTargets = {
  opd: { href: "#terminal-opd", label: "Open terminal station" },
  hwd: { href: "#terminal-hwd", label: "Open terminal station" },
  hol: { href: "#terminal-hrd", label: "Open terminal station" },
  spd: { href: "#hydro-terminal-browser", label: "Open terminal station", hydroCode: "SDP" },
  wav: { href: "#terminal-wav", label: "Open terminal station" },
  rrd: { href: "#station-browser", label: "Open substation", stationCode: "RRD" },
  vir: { href: "#station-browser", label: "Open substation", stationCode: "VIR" },
  gou: { href: "#station-browser", label: "Open substation", stationCode: "GOU" }
};
const avalonLabelOffsets = {
  opd: [12, 18],
  hwd: [-48, 4],
  hol: [12, -10],
  spd: [12, 18],
  wav: [12, -10],
  rrd: [-42, 4],
  vir: [12, -14],
  gou: [12, 18]
};

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function geometryLines(geometry) {
  if (geometry.type === "LineString") return [geometry.coordinates];
  if (geometry.type === "MultiLineString") return geometry.coordinates;
  return [];
}

function intersectsBounds(line, bounds) {
  return line.some(([longitude, latitude]) => (
    longitude >= bounds.west
    && longitude <= bounds.east
    && latitude >= bounds.south
    && latitude <= bounds.north
  ));
}

function project([longitude, latitude], bounds, width, height, padding) {
  const centreLatitude = (bounds.north + bounds.south) / 2;
  const longitudeScale = Math.cos(centreLatitude * Math.PI / 180);
  const spanX = (bounds.east - bounds.west) * longitudeScale;
  const spanY = bounds.north - bounds.south;
  const scale = Math.min((width - 2 * padding) / spanX, (height - 2 * padding) / spanY);
  const usedWidth = spanX * scale;
  const usedHeight = spanY * scale;
  return [
    (width - usedWidth) / 2 + (longitude - bounds.west) * longitudeScale * scale,
    (height - usedHeight) / 2 + (bounds.north - latitude) * scale
  ];
}

function routePaths(bounds, width, height, className) {
  return routes.features.flatMap((feature) => geometryLines(feature.geometry)
    .filter((line) => intersectsBounds(line, bounds))
    .map((line) => {
      const points = line.map((point) => project(point, bounds, width, height, 26));
      const path = points.map(([x, y], index) => `${index ? "L" : "M"}${x.toFixed(2)} ${y.toFixed(2)}`).join(" ");
      return `<path class="${className}" d="${path}"></path>`;
    })).join("");
}

function stationPoints(bounds, width, height, includeLabels) {
  return stationRegister.stations
    .filter((station) => (
      station.longitude >= bounds.west
      && station.longitude <= bounds.east
      && station.latitude >= bounds.south
      && station.latitude <= bounds.north
    ))
    .map((station) => {
      const [x, y] = project([station.longitude, station.latitude], bounds, width, height, 26);
      const [labelX, labelY] = avalonLabelOffsets[station.id] || [11, -10];
      const label = includeLabels
        ? `<text x="${x + labelX}" y="${y + labelY}">${escapeHtml(station.id.toUpperCase())}</text>`
        : "";
      return `<g class="geographic-station" tabindex="0" role="button" data-geographic-station="${escapeHtml(station.id)}" aria-label="${escapeHtml(station.atlasName)}">
        <circle cx="${x}" cy="${y}" r="7"></circle>
        ${label}
      </g>`;
    }).join("");
}

function stationDetail(station) {
  const target = stationTargets[station.id];
  const dataAttribute = target.stationCode
    ? ` data-station-record="${escapeHtml(target.stationCode)}"`
    : target.hydroCode
      ? ` data-hydro-terminal-record="${escapeHtml(target.hydroCode)}"`
      : "";
  return `
    <span class="profile-label">CHECKED STATION BOUNDARY</span>
    <h4>${escapeHtml(station.atlasName)}</h4>
    <dl>
      <div><dt>Latitude</dt><dd>${station.latitude.toFixed(6)}</dd></div>
      <div><dt>Longitude</dt><dd>${station.longitude.toFixed(6)}</dd></div>
      <div><dt>Method</dt><dd>OSM boundary centroid</dd></div>
      <div><dt>Object</dt><dd>${escapeHtml(station.source.object)}</dd></div>
    </dl>
    <a class="island-detail-action" href="${target.href}"${dataAttribute}>${escapeHtml(target.label)}</a>
    <a class="evidence-link" href="${escapeHtml(station.source.url)}" target="_blank" rel="noreferrer">OpenStreetMap object / version ${station.source.objectVersion}</a>`;
}

function initialDetail() {
  return `
    <span class="profile-label">GEOGRAPHIC REFERENCE</span>
    <h4>Eight checked stations</h4>
    <dl>
      <div><dt>Route features</dt><dd>${routes.selection.selectedFeatureCount}</dd></div>
      <div><dt>Route validation</dt><dd>${routes.selection.validationDateRange.join(" to ")}</dd></div>
      <div><dt>Coordinates</dt><dd>WGS 84</dd></div>
    </dl>
    <p>Select a station for its coordinate and source object.</p>
    <a class="evidence-link" href="${escapeHtml(routes.source.url)}" target="_blank" rel="noreferrer">Government of Newfoundland and Labrador GeoAtlas / layer 16</a>`;
}

export async function initGeographicMap() {
  const island = document.querySelector("#geographic-island-map");
  const avalon = document.querySelector("#geographic-avalon-map");
  const detail = document.querySelector("#geographic-map-detail");
  if (!island || !avalon || !detail) return;

  const response = await fetch(routesUrl);
  if (!response.ok) {
    detail.textContent = "Geographic route data could not be loaded.";
    return;
  }
  routes = await response.json();

  island.insertAdjacentHTML("beforeend", `
    <g class="geographic-routes">${routePaths(islandBounds, 780, 760, "geographic-route")}</g>
    <g class="geographic-stations">${stationPoints(islandBounds, 780, 760, false)}</g>`);
  avalon.insertAdjacentHTML("beforeend", `
    <g class="geographic-grid" aria-hidden="true"><path d="M70 30V590M210 30V590M350 30V590M490 30V590M630 30V590M30 120H690M30 260H690M30 400H690M30 540H690"></path></g>
    <g class="geographic-routes">${routePaths(avalonBounds, 720, 620, "geographic-route")}</g>
    <g class="geographic-stations">${stationPoints(avalonBounds, 720, 620, true)}</g>`);
  detail.innerHTML = initialDetail();

  const maps = [island, avalon];
  function selectStation(id) {
    const station = stationRegister.stations.find((item) => item.id === id);
    if (!station) return;
    maps.forEach((map) => map.querySelectorAll("[data-geographic-station]").forEach((item) => {
      item.classList.toggle("selected", item.dataset.geographicStation === id);
    }));
    detail.innerHTML = stationDetail(station);
  }

  function activate(event) {
    const item = event.target.closest("[data-geographic-station]");
    if (item) selectStation(item.dataset.geographicStation);
  }

  maps.forEach((map) => {
    map.addEventListener("click", activate);
    map.addEventListener("keydown", (event) => {
      if (!["Enter", " "].includes(event.key)) return;
      const item = event.target.closest("[data-geographic-station]");
      if (!item) return;
      event.preventDefault();
      selectStation(item.dataset.geographicStation);
    });
  });
}

export { avalonBounds, islandBounds, stationRegister as geographicStations };
