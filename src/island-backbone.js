import islandTopology from "../research/derived/island-ac-topology-2018.json" with { type: "json" };

const nodeLayout = {
  "Grand Bay (NP)": [70, 785],
  Doyles: [155, 735],
  "Bottom Brook": [285, 690],
  Stephenville: [300, 835],
  "Massey Drive": [425, 735],
  Buchans: [560, 620],
  "Stoney Brook": [735, 535],
  "Bay d'Espoir": [850, 735],
  "Upper Salmon": [700, 835],
  "Granite Canal Tap": [590, 865],
  "Granite Canal": [485, 895],
  Sunnyside: [1030, 510],
  "Come By Chance": [1140, 405],
  "Western Avalon": [1260, 590],
  "Voisey's Bay Nickel Mine": [1155, 755],
  "Soldiers Pond": [1370, 590],
  "Holyrood Generating Station": [1430, 755],
  Hardwoods: [1470, 545],
  "Oxen Pond": [1530, 420],
  "Linton Lake (NP)": [980, 375],
  "Salt Pond (NP)": [1060, 320],
  "Deer Lake": [365, 505],
  "Grandy Brook": [170, 555],
  Wiltondale: [245, 425],
  "Rocky Harbour": [115, 390],
  "Berry Hill": [330, 390],
  Glenburnie: [175, 315],
  "Sally's Cove": [150, 260],
  "Cow Head": [135, 205],
  "Parson's Pond": [125, 150],
  "Daniel's Harbour": [145, 95],
  "Peter's Barron": [265, 95],
  "Hawkes Bay": [340, 55],
  "Plum Point": [355, 120],
  "Bear Cove": [455, 95],
  "St. Anthony Airport": [565, 90],
  "Main Brook": [640, 155],
  "Roddicktown Wood Chip": [715, 125],
  "St. Anthony Diesel Plant": [585, 35],
  Howley: [485, 455],
  "Hinds Lake": [545, 520],
  "Hampden Tap": [430, 350],
  Hampden: [360, 300],
  "Jackson's Arm Tap": [510, 300],
  "Jackson's Arm": [540, 240],
  "Coney Arm": [450, 230],
  "Rattle Brook": [590, 275],
  "Seal Cove Road (NP)": [620, 415],
  "Bottom Waters": [685, 360],
  "Indian River": [645, 445],
  "Springdale (NP)": [745, 410],
  "South Brook": [815, 455],
  "Cobb's Pond (NP)": [865, 365],
  "Boyd's Cove (NP)": [900, 280],
  "Farewell Head": [970, 235],
  "Duck Pond": [500, 555],
  "Star Lake": [475, 640],
  "English Harbour West": [865, 635],
  Barachoix: [930, 665]
};

const stationTargets = {
  "Bay d'Espoir": { href: "#hydro-terminal-browser", code: "BDE" },
  "Bottom Brook": { href: "#hydro-terminal-browser", code: "BBK" },
  Buchans: { href: "#hydro-terminal-browser", code: "BUC" },
  "Come By Chance": { href: "#hydro-terminal-browser", code: "CBC" },
  "Deer Lake": { href: "#hydro-terminal-browser", code: "DLK" },
  Hardwoods: { href: "#terminal-hwd" },
  "Holyrood Generating Station": { href: "#terminal-hrd" },
  "Massey Drive": { href: "#hydro-terminal-browser", code: "MAS" },
  "Oxen Pond": { href: "#terminal-opd" },
  Stephenville: { href: "#hydro-terminal-browser", code: "STV" },
  "Stoney Brook": { href: "#hydro-terminal-browser", code: "STB" },
  Sunnyside: { href: "#hydro-terminal-browser", code: "SUN" },
  "Western Avalon": { href: "#terminal-wav" }
};

const labelOverrides = {
  "Holyrood Generating Station": "HOLYROOD",
  "Roddicktown Wood Chip": "RODDICKTON WOOD CHIP",
  "St. Anthony Diesel Plant": "ST. ANTHONY DIESEL",
  "Voisey's Bay Nickel Mine": "VOISEY'S BAY NICKEL",
  "Granite Canal Tap": "GRANITE CANAL TAP"
};

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function islandStationId(name) {
  return `island-${name.toLowerCase()
    .replaceAll("&", "and")
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/^-|-$/g, "")}`;
}

function buildSegments() {
  const segments = islandTopology.lines.flatMap((line) => line.segments.map((segment, segmentIndex) => ({
    ...segment,
    circuit: line.circuit,
    voltage: line.voltage_kv,
    page: line.physical_pdf_page,
    segmentIndex
  })));
  const parallelGroups = new Map();
  for (const segment of segments) {
    const key = [segment.from, segment.to].sort().join("|");
    const group = parallelGroups.get(key) || [];
    group.push(segment);
    parallelGroups.set(key, group);
  }
  return segments.map((segment) => {
    const [x1, y1] = nodeLayout[segment.from];
    const [x2, y2] = nodeLayout[segment.to];
    const key = [segment.from, segment.to].sort().join("|");
    const group = parallelGroups.get(key);
    const index = group.indexOf(segment);
    const offset = (index - (group.length - 1) / 2) * 9;
    const length = Math.hypot(x2 - x1, y2 - y1) || 1;
    const ox = -(y2 - y1) / length * offset;
    const oy = (x2 - x1) / length * offset;
    return { ...segment, x1: x1 + ox, y1: y1 + oy, x2: x2 + ox, y2: y2 + oy };
  });
}

function connectedCircuits(name) {
  return islandTopology.lines.filter((line) => line.segments.some((segment) => segment.from === name || segment.to === name));
}

function sourceUrl(page) {
  return `${islandTopology.source.url}#page=${page}`;
}

function stationLink(name) {
  const target = stationTargets[name];
  if (!target) return "";
  const data = target.code ? ` data-hydro-terminal-record="${target.code}"` : "";
  return `<a class="island-detail-action" href="${target.href}"${data}>Open station record</a>`;
}

function circuitDetail(line) {
  const routes = line.segments.map((segment) => `${segment.from} to ${segment.to}`).join("; ");
  return `
    <span class="profile-label">SELECTED CIRCUIT</span>
    <h4>${escapeHtml(line.circuit)}</h4>
    <strong class="island-detail-voltage voltage-${line.voltage_kv}">${line.voltage_kv} kV</strong>
    <dl>
      <div><dt>Filed route</dt><dd>${escapeHtml(routes)}</dd></div>
      <div><dt>Source year</dt><dd>${islandTopology.as_of_year}</dd></div>
      <div><dt>Table</dt><dd>${escapeHtml(line.table)}</dd></div>
    </dl>
    <a class="evidence-link" href="${escapeHtml(sourceUrl(line.physical_pdf_page))}" target="_blank" rel="noreferrer">PUB-NP-084 Attachment A / physical PDF p. ${line.physical_pdf_page}</a>`;
}

function stationDetail(name) {
  const circuits = connectedCircuits(name);
  const circuitList = circuits.map((line) => `<button type="button" data-island-circuit-select="${escapeHtml(line.circuit)}"><strong>${escapeHtml(line.circuit)}</strong><span>${line.voltage_kv} kV</span></button>`).join("");
  return `
    <span class="profile-label">SELECTED STATION OR TAP</span>
    <h4>${escapeHtml(name)}</h4>
    <p>${circuits.length} filed circuit designation${circuits.length === 1 ? "" : "s"} at this point.</p>
    <div class="island-connected-circuits">${circuitList}</div>
    ${stationLink(name)}
    <a class="evidence-link" href="${escapeHtml(sourceUrl(circuits[0]?.physical_pdf_page || 24))}" target="_blank" rel="noreferrer">PUB-NP-084 Attachment A / 2018 line tables</a>`;
}

function initialDetail() {
  return `
    <span class="profile-label">2018 FILED NETWORK</span>
    <h4>58 circuit designations</h4>
    <dl>
      <div><dt>230 kV</dt><dd>26 circuits</dd></div>
      <div><dt>138 kV</dt><dd>16 circuits</dd></div>
      <div><dt>66 kV</dt><dd>16 circuits</dd></div>
    </dl>
    <p>Select a line for its filed route and source page, or select a station for its connected circuits.</p>
    <a class="evidence-link" href="${escapeHtml(sourceUrl(24))}" target="_blank" rel="noreferrer">PUB-NP-084 Attachment A / physical PDF pp. 24 to 26</a>`;
}

function renderMap(svg) {
  const segments = buildSegments();
  const lineMarkup = segments.map((segment) => {
    const midX = (segment.x1 + segment.x2) / 2;
    const midY = (segment.y1 + segment.y2) / 2;
    return `<g class="island-circuit voltage-${segment.voltage}" tabindex="0" role="button" data-island-circuit="${escapeHtml(segment.circuit)}" data-voltage="${segment.voltage}" aria-label="${escapeHtml(segment.circuit)}, ${segment.voltage} kilovolts, ${escapeHtml(segment.from)} to ${escapeHtml(segment.to)}">
      <line x1="${segment.x1}" y1="${segment.y1}" x2="${segment.x2}" y2="${segment.y2}"></line>
      <text x="${midX}" y="${midY - 9}">${escapeHtml(segment.circuit)}</text>
    </g>`;
  }).join("");

  const degrees = new Map(Object.keys(nodeLayout).map((name) => [name, connectedCircuits(name).length]));
  const nodeMarkup = Object.entries(nodeLayout).map(([name, [x, y]]) => {
    const major = stationTargets[name] || degrees.get(name) > 2;
    const labelY = y < 120 ? y + 22 : y - 13;
    return `<g class="island-node${major ? " major" : ""}" id="${islandStationId(name)}" tabindex="0" role="button" data-island-station="${escapeHtml(name)}" aria-label="${escapeHtml(name)}, ${degrees.get(name)} connected circuit designations">
      <circle cx="${x}" cy="${y}" r="${major ? 7 : 5}"></circle>
      <text x="${x}" y="${labelY}">${escapeHtml(labelOverrides[name] || name.toUpperCase())}</text>
    </g>`;
  }).join("");

  svg.insertAdjacentHTML("beforeend", `
    <g class="island-grid" aria-hidden="true">
      <path d="M55 50H1545M55 215H1545M55 380H1545M55 545H1545M55 710H1545M55 875H1545"></path>
    </g>
    <g class="island-circuits">${lineMarkup}</g>
    <g class="island-nodes">${nodeMarkup}</g>`);
}

export function initIslandBackbone() {
  const svg = document.querySelector("#island-backbone-map");
  const controls = document.querySelector(".island-voltage-controls");
  const shell = document.querySelector(".island-backbone-layout");
  if (!svg || !controls || !shell) return;

  const detail = shell.querySelector("#island-backbone-detail");
  if (!detail) return;
  detail.innerHTML = initialDetail();
  renderMap(svg);

  const counts = Object.fromEntries([66, 138, 230].map((voltage) => [voltage, islandTopology.lines.filter((line) => line.voltage_kv === voltage).length]));
  controls.innerHTML = [230, 138, 66].map((voltage) => `<button type="button" aria-pressed="true" data-island-voltage="${voltage}"><strong>${voltage} kV</strong><span>${counts[voltage]} circuits</span></button>`).join("");

  function selectCircuit(circuit) {
    const line = islandTopology.lines.find((item) => item.circuit === circuit);
    if (!line) return;
    svg.querySelectorAll(".island-circuit").forEach((item) => item.classList.toggle("selected", item.dataset.islandCircuit === circuit));
    svg.querySelectorAll(".island-node").forEach((item) => item.classList.remove("selected"));
    detail.innerHTML = circuitDetail(line);
  }

  function selectStation(name) {
    svg.querySelectorAll(".island-node").forEach((item) => item.classList.toggle("selected", item.dataset.islandStation === name));
    const connected = new Set(connectedCircuits(name).map((line) => line.circuit));
    svg.querySelectorAll(".island-circuit").forEach((item) => item.classList.toggle("selected", connected.has(item.dataset.islandCircuit)));
    detail.innerHTML = stationDetail(name);
  }

  function activateMapItem(item) {
    if (item.matches("[data-island-circuit]")) selectCircuit(item.dataset.islandCircuit);
    if (item.matches("[data-island-station]")) selectStation(item.dataset.islandStation);
  }

  svg.addEventListener("click", (event) => {
    const item = event.target.closest("[data-island-circuit], [data-island-station]");
    if (item) activateMapItem(item);
  });
  svg.addEventListener("keydown", (event) => {
    const item = event.target.closest("[data-island-circuit], [data-island-station]");
    if (!item || !["Enter", " "].includes(event.key)) return;
    event.preventDefault();
    activateMapItem(item);
  });
  controls.addEventListener("click", (event) => {
    const button = event.target.closest("[data-island-voltage]");
    if (!button) return;
    const pressed = button.getAttribute("aria-pressed") !== "true";
    button.setAttribute("aria-pressed", String(pressed));
    svg.querySelectorAll(`.island-circuit[data-voltage="${button.dataset.islandVoltage}"]`).forEach((item) => item.classList.toggle("filtered-out", !pressed));
  });
  detail.addEventListener("click", (event) => {
    const button = event.target.closest("[data-island-circuit-select]");
    if (button) selectCircuit(button.dataset.islandCircuitSelect);
  });
}

export { islandTopology, nodeLayout as islandNodeLayout };
