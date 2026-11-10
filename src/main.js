import "@fontsource/barlow-condensed/400.css";
import "@fontsource/barlow-condensed/500.css";
import "@fontsource/barlow-condensed/600.css";
import "@fontsource/barlow-condensed/700.css";
import "@fontsource/source-serif-4/400.css";
import "@fontsource/source-serif-4/600.css";
import "@fontsource/ibm-plex-mono/400.css";
import "./styles.css";
import { components, sources, stationProfiles, timeline } from "./data.js";
import handbook from "../research/derived/np-2006-handbook.json";
import transformerRegister from "../research/derived/np-2027-transformer-register.json";
import { avalonLabelOffsets, avalonNodePositions } from "./avalon-layout.js";

const sourceById = new Map(sources.map((source) => [source.id, source]));
const handbookStations = new Map(handbook.substations.map((station) => [station.code, station]));
const detailedStationProfiles = new Map(stationProfiles.map((station) => [station.code, station]));
const stationNameOverrides = { APT: "Airport", LPD: "Long Pond", MOP: "Mobile Hydro Plant" };
const stationDirectory = new Map(handbookStations);
const transformersByStation = new Map();
for (const transformer of transformerRegister.transformers) {
  const stationTransformers = transformersByStation.get(transformer.station_code) || [];
  stationTransformers.push(transformer);
  transformersByStation.set(transformer.station_code, stationTransformers);
  if (!stationDirectory.has(transformer.station_code)) {
    stationDirectory.set(transformer.station_code, {
      code: transformer.station_code,
      name: stationNameOverrides[transformer.station_code] || transformer.station_code,
      feeders: [],
      source_page: null
    });
  }
}
for (const profile of stationProfiles) {
  if (!stationDirectory.has(profile.code)) stationDirectory.set(profile.code, { code: profile.code, name: profile.name, feeders: [], source_page: null });
}
const handbookEndpoints = new Map();
for (const line of handbook.transmission_lines) {
  if (line.from_code) handbookEndpoints.set(line.from_code, { name: line.from, source_page: line.source_page });
  if (line.to_code) handbookEndpoints.set(line.to_code, { name: line.to, source_page: line.source_page });
}
let activeRegister = "lines";
let activeStationProfile = "HWD";
let stationTabQuery = "";
const stationSectionAnchors = {
  HWD: "#terminal-hwd",
  MUN: "#substation-mun",
  OXP: "#terminal-opd",
  PUL: "#substation-pul",
  WAV: "#terminal-wav"
};
const stationDetailAnchors = {
  HWD: "#substation-hwd",
  MUN: "#substation-mun",
  OXP: "#substation-oxp",
  PUL: "#substation-pul",
  WAV: "#terminal-wav"
};

function placeTerminalLayouts() {
  const terminalSheets = document.querySelector("#network .station-sheets");
  document.querySelectorAll("[data-terminal-layout]").forEach((layout) => terminalSheets.append(layout));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderTimeline(filter = "all") {
  const list = document.querySelector("#timeline-list");
  const events = timeline.filter((event) => filter === "all" || event.category === filter);
  list.innerHTML = events.map((event) => {
    const source = sourceById.get(event.sourceId);
    return `
      <article class="timeline-entry" data-category="${escapeHtml(event.category)}">
        <time>${escapeHtml(event.date)}</time>
        <span class="timeline-node" aria-hidden="true"></span>
        <div>
          <span class="event-type">${escapeHtml(event.category)} / ${escapeHtml(event.status)}</span>
          <h3>${escapeHtml(event.title)}</h3>
          <p>${escapeHtml(event.body)}</p>
          <a href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer">${escapeHtml(source.title)} / ${escapeHtml(event.pages)}</a>
        </div>
      </article>`;
  }).join("");
}

function renderSources(query = "") {
  const normalized = query.trim().toLowerCase();
  const filtered = sources.filter((source) => {
    const haystack = [source.title, source.organization, source.year, ...source.topics].join(" ").toLowerCase();
    return haystack.includes(normalized);
  });
  const list = document.querySelector("#source-list");
  list.innerHTML = filtered.map((source) => `
    <article class="source-record">
      <div class="source-index">${String(source.year).slice(-2)}.${escapeHtml(source.id.toUpperCase())}</div>
      <div>
        <span class="source-org">${escapeHtml(source.organization)} / ${escapeHtml(source.status)}</span>
        <h3>${escapeHtml(source.title)}</h3>
        <p>${escapeHtml(source.topics.join(" · "))}</p>
      </div>
      <div class="source-action">
        <span>${escapeHtml(source.pages)}</span>
        <a href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer">Open filing <span aria-hidden="true">↗</span></a>
      </div>
    </article>`).join("");
  if (!filtered.length) {
    list.innerHTML = `<p class="empty-state">No source record matches “${escapeHtml(query)}”.</p>`;
  }
}

function showComponent(requestedId, allowReset = true) {
  const requested = components[requestedId];
  if (!requested) return;
  const panel = document.querySelector(`[data-diagram-panel="${requested.diagram}"]`);
  if (!panel) return;
  const defaultId = panel.dataset.defaultComponent;
  const componentId = allowReset && panel.dataset.selectedComponent === requestedId
    ? defaultId
    : requestedId;
  const component = components[componentId];
  const state = panel.querySelector('[data-field="state"]');
  state.textContent = component.status.toUpperCase();
  state.className = `evidence-state ${component.status}`;
  panel.querySelector('[data-field="code"]').textContent = component.code;
  panel.querySelector('[data-field="title"]').textContent = component.title;
  panel.querySelector('[data-field="summary"]').textContent = component.summary;
  panel.querySelector('[data-field="data"]').innerHTML = component.data
    .map(([term, value]) => `<div><dt>${escapeHtml(term)}</dt><dd>${escapeHtml(value)}</dd></div>`)
    .join("");
  panel.querySelector('[data-field="sources"]').innerHTML = component.sources.map((reference) => {
    const source = sourceById.get(reference.sourceId);
    const label = reference.label || source.title;
    return `<a class="evidence-link stacked-link" href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer">${escapeHtml(label)} / ${escapeHtml(reference.pages)}</a>`;
  }).join("");
  panel.dataset.selectedComponent = componentId === defaultId ? "" : componentId;
  document.querySelectorAll(`.component[data-diagram="${requested.diagram}"]`).forEach((element) => {
    const selected = element.dataset.component === componentId && componentId !== defaultId;
    element.classList.toggle("selected", selected);
    element.setAttribute("aria-pressed", String(selected));
  });
}

function renderStationProfile(code) {
  const station = stationDirectory.get(code);
  if (!station) return;
  const detailed = detailedStationProfiles.get(code) || {};
  const profile = {
    code,
    name: station.name,
    feederRegister: station.feeders,
    mapPages: [],
    eventLoads: [],
    ...detailed
  };
  activeStationProfile = code;
  const connected = profile.connectedCircuits || handbook.transmission_lines.filter((line) => line.from_code === code || line.to_code === code);
  const circuitRows = connected.map((line) => {
    const destination = line.from_code === code ? line.to : line.from;
    const destinationCode = line.from_code === code ? line.to_code : line.from_code;
    const destinationLabel = `${destination}${destinationCode ? ` / ${destinationCode}` : ""}`;
    return `<li><strong>${escapeHtml(line.circuit)}</strong>${destinationCode && stationDirectory.has(destinationCode)
      ? `<a href="#station-browser" data-station-record="${escapeHtml(destinationCode)}">${escapeHtml(destinationLabel)}</a>`
      : `<span>${escapeHtml(destinationLabel)}</span>`}</li>`;
  }).join("");
  const mapBase = sourceById.get("np-island-ca-020").url;
  const feederMaps = profile.mapPages.map(([feeder, page]) => {
    const imagePath = `./feeder-maps/${feeder.toLowerCase()}.jpg`;
    return `
      <details class="feeder-map">
        <summary>${escapeHtml(feeder)}</summary>
        <a class="feeder-map-image" href="${escapeHtml(imagePath)}" target="_blank" rel="noreferrer" aria-label="Open full-size ${escapeHtml(feeder)} feeder map">
          <img src="${escapeHtml(imagePath)}" loading="lazy" alt="${escapeHtml(feeder)} feeder map extracted from CA-NP-020 physical PDF page ${page}" />
        </a>
        <a class="feeder-map-source" href="${escapeHtml(mapBase)}#page=${page}" target="_blank" rel="noreferrer">CA-NP-020 / physical PDF p. ${page}</a>
      </details>`;
  }).join("");
  const transformers = transformersByStation.get(code) || [];
  const transformerPages = [...new Set(transformers.map((transformer) => transformer.physical_page))];
  const transformerRows = transformers.map((transformer) => {
    const voltage = transformer.low_kv === null ? `${transformer.high_kv} kV` : `${transformer.high_kv}/${transformer.low_kv} kV`;
    const forecast = transformer.forecast_2026_mva === null ? "" : `, ${transformer.forecast_2026_mva} MVA forecast`;
    return `
    <div>
      <dt>${escapeHtml(transformer.designation)}</dt>
      <dd>${escapeHtml(`${voltage}, ${transformer.size_mva} MVA, ${transformer.type}${forecast}`)}</dd>
    </div>`;
  }).join("");
  const operatingVoltages = [...new Set(transformers.map((transformer) => transformer.low_kv === null
    ? `${transformer.high_kv} kV`
    : `${transformer.high_kv}/${transformer.low_kv} kV`))];
  const stationVoltage = detailed.voltage || (operatingVoltages.length ? operatingVoltages.join("; ") : "Station register");
  const record = profile.engineeringRecord;
  const recordSource = record ? sourceById.get(record.sourceId) : null;
  const circuitSource = profile.circuitSource ? sourceById.get(profile.circuitSource.sourceId) : null;
  document.querySelector("#station-profile").innerHTML = `
    <header class="profile-heading">
      <div><span>${escapeHtml(profile.code)} / STATION RECORD</span><h4>${escapeHtml(profile.name)}</h4></div>
      <strong>${escapeHtml(stationVoltage)}</strong>
    </header>
    <div class="profile-grid">
      <section>
        <span class="profile-label">${escapeHtml(profile.circuitRegisterLabel || "2005 CIRCUIT REGISTER")}</span>
        <ul class="circuit-list">${circuitRows || "<li><span>No connected transmission circuit in the register</span></li>"}</ul>
        ${circuitSource
          ? `<a class="evidence-link" href="${escapeHtml(circuitSource.url)}" target="_blank" rel="noreferrer">${escapeHtml(circuitSource.title)} / ${escapeHtml(profile.circuitSource.pages)}</a>`
          : `<a class="evidence-link" href="${escapeHtml(handbook.source.source_url)}#page=6" target="_blank" rel="noreferrer">Electrical System Handbook / PDF pp. 6 to 7</a>`}
      </section>
      <section>
        <span class="profile-label">${escapeHtml(profile.feederRegisterLabel || "2005 FEEDER REGISTER")}</span>
        <div class="feeder-tags">${profile.feederRegister.length
          ? profile.feederRegister.map((feeder) => `<span>${escapeHtml(feeder)}</span>`).join("")
          : "<span>No feeder designation</span>"}</div>
        ${feederMaps ? `<span class="profile-label map-label">2014 FEEDER MAP SHEETS</span><div class="feeder-maps">${feederMaps}</div>` : ""}
        ${profile.mapNote ? `<p class="profile-note">${escapeHtml(profile.mapNote)}</p>` : ""}
      </section>
      <section class="station-equipment">
        ${transformers.length ? `
          <span class="profile-label">2027 TRANSFORMER REGISTER</span>
          <dl>${transformerRows}</dl>
          <a class="evidence-link" href="${escapeHtml(transformerRegister.source.source_url)}#page=${transformerPages[0]}" target="_blank" rel="noreferrer">Power Transformer Listing / physical PDF ${transformerPages.length === 1 ? `p. ${transformerPages[0]}` : `pp. ${transformerPages.join(", ")}`}</a>` : ""}
        ${profile.eventLoads.length ? `
          <div class="event-loads">
            <span class="profile-label">2014-01-05 RECORDED OUTAGE LOAD</span>
            <dl>${profile.eventLoads.map(([feeder, load]) => `<div><dt>${escapeHtml(feeder)}</dt><dd>${escapeHtml(load)}</dd></div>`).join("")}</dl>
            <a class="evidence-link" href="${escapeHtml(mapBase)}#page=14" target="_blank" rel="noreferrer">CA-NP-020 / physical PDF p. 14</a>
          </div>` : ""}
      </section>
    </div>
    ${record ? `
      <section class="profile-record">
        <header><span>${escapeHtml(record.date)}</span><strong>${escapeHtml(record.title)}</strong></header>
        <dl>${record.facts.map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`).join("")}</dl>
        <a class="evidence-link" href="${escapeHtml(recordSource.url)}" target="_blank" rel="noreferrer">${escapeHtml(recordSource.title)} / ${escapeHtml(record.pages)}</a>
      </section>` : ""}`;
  renderStationTabs(stationTabQuery);
}

function renderStationTabs(query = "") {
  stationTabQuery = query.trim().toLowerCase();
  const stations = [...stationDirectory.values()]
    .filter((station) => `${station.code} ${station.name} ${station.feeders.join(" ")}`.toLowerCase().includes(stationTabQuery))
    .sort((left, right) => left.name.localeCompare(right.name));
  document.querySelector("#station-record-count").textContent = `${stations.length} station${stations.length === 1 ? "" : "s"}`;
  document.querySelector("#station-tabs").innerHTML = stations.map((station) => {
    const selected = station.code === activeStationProfile;
    return `<button class="station-tab${selected ? " active" : ""}" type="button" role="tab" aria-selected="${selected}" data-station-profile="${escapeHtml(station.code)}"><strong>${escapeHtml(station.code)}</strong><span>${escapeHtml(station.name)}</span></button>`;
  }).join("");
}

function openStationRecord(code, scroll = true) {
  if (!stationDirectory.has(code)) return;
  renderStationProfile(code);
  if (scroll) document.querySelector("#station-browser").scrollIntoView({ block: "start" });
}

function avalonLines() {
  return handbook.transmission_lines.filter((line) => (
    line.from_code in avalonNodePositions && line.to_code in avalonNodePositions
  ));
}

function edgeGeometry(lines) {
  const groups = new Map();
  for (const line of lines) {
    const key = [line.from_code, line.to_code].sort().join(":");
    const group = groups.get(key) || [];
    group.push(line);
    groups.set(key, group);
  }
  return lines.map((line) => {
    const [x1, y1] = avalonNodePositions[line.from_code];
    const [x2, y2] = avalonNodePositions[line.to_code];
    const key = [line.from_code, line.to_code].sort().join(":");
    const group = groups.get(key);
    const index = group.indexOf(line);
    const offset = (index - (group.length - 1) / 2) * 12;
    const length = Math.hypot(x2 - x1, y2 - y1) || 1;
    const ox = -(y2 - y1) / length * offset;
    const oy = (x2 - x1) / length * offset;
    return { line, x1: x1 + ox, y1: y1 + oy, x2: x2 + ox, y2: y2 + oy, ox, oy };
  });
}

function renderAvalonNetwork() {
  const svg = document.querySelector("#avalon-network");
  const lines = avalonLines();
  const edgeMarkup = edgeGeometry(lines).map(({ line, x1, y1, x2, y2 }) => {
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    const target = stationSectionAnchors[line.to_code] || `#station-${line.to_code}`;
    return `
      <a class="map-edge" href="${escapeHtml(target)}" data-from="${line.from_code}" data-to="${line.to_code}" aria-label="${escapeHtml(line.circuit)} from ${escapeHtml(line.from)} to ${escapeHtml(line.to)}">
        <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"></line>
        <text x="${midX}" y="${midY - 5}">${escapeHtml(line.circuit)}</text>
      </a>`;
  }).join("");
  const nodeMarkup = Object.entries(avalonNodePositions).map(([code, [x, y]]) => {
    const station = handbookStations.get(code) || handbookEndpoints.get(code);
    const [dx, dy] = avalonLabelOffsets[code] || [10, -10];
    const target = stationSectionAnchors[code] || `#station-${code}`;
    return `
      <a id="station-${code}" class="map-node" href="${escapeHtml(target)}" data-station="${code}" aria-label="${escapeHtml(station.name)} station, ${code}">
        <circle cx="${x}" cy="${y}" r="8"></circle>
        <text x="${x + dx}" y="${y + dy}">${code}</text>
      </a>`;
  }).join("");
  svg.innerHTML = `
    <g class="map-grid" aria-hidden="true">
      <path d="M40 120H1040 M40 300H1040 M40 480H1040 M40 660H1040 M40 840H1040"></path>
      <path d="M120 30V890 M320 30V890 M520 30V890 M720 30V890 M920 30V890"></path>
    </g>
    <g class="map-edges">${edgeMarkup}</g>
    <g class="map-nodes">${nodeMarkup}</g>`;

  document.querySelectorAll(".map-node").forEach((node) => {
    node.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      showHandbookStation(node.dataset.station);
    });
  });
}

function showHashStation() {
  const match = window.location.hash.match(/^#station-([A-Z0-9]+)$/);
  if (match) showHandbookStation(match[1]);
}

function bindInternalDiagramLinks() {
  document.querySelectorAll('svg a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      const target = document.getElementById(href.slice(1));
      if (!target) return;
      event.preventDefault();
      window.location.hash = href;
      target.scrollIntoView({ block: "start" });
      showHashStation();
    });
  });
}

function showHandbookStation(code) {
  const stationRecord = handbookStations.get(code);
  const station = stationRecord || handbookEndpoints.get(code);
  if (!station) return;
  const connected = handbook.transmission_lines.filter((line) => line.from_code === code || line.to_code === code);
  document.querySelector("#handbook-detail-code").textContent = `${code} / ${stationRecord ? "STATION" : "LINE ENDPOINT"}`;
  document.querySelector("#handbook-detail-title").textContent = station.name;
  const stationLink = document.querySelector("#handbook-detail-station-link");
  stationLink.hidden = !stationRecord;
  if (stationRecord) {
    stationLink.href = "#station-browser";
    stationLink.dataset.stationRecord = code;
    stationLink.textContent = `Open ${station.name} station record`;
  }
  document.querySelector("#handbook-detail-data").innerHTML = [
    ["Feeders", stationRecord ? (stationRecord.feeders.length ? stationRecord.feeders.join(", ") : "None listed") : "Not in station register"],
    ["Circuits", connected.length ? connected.map((line) => line.circuit).join(", ") : "None listed"],
    ["Station register", stationRecord ? `PDF p. ${stationRecord.source_page}` : "No matching designation"],
    ["Line register", connected.length ? `PDF pp. ${[...new Set(connected.map((line) => line.source_page))].join(", ")}` : "Not applicable"]
  ].map(([term, value]) => `<div><dt>${escapeHtml(term)}</dt><dd>${escapeHtml(value)}</dd></div>`).join("");
  document.querySelector("#handbook-detail-source").textContent = `Electrical System Handbook / PDF p. ${station.source_page}`;
  document.querySelectorAll(".map-node").forEach((node) => node.classList.toggle("selected", node.dataset.station === code));
  document.querySelectorAll(".map-edge").forEach((edge) => {
    edge.classList.toggle("related", edge.dataset.from === code || edge.dataset.to === code);
    edge.classList.toggle("dimmed", edge.dataset.from !== code && edge.dataset.to !== code);
  });
}

function registerRows() {
  if (activeRegister === "stations") {
    return handbook.substations.map((station) => ({
      key: station.code,
      title: station.name,
      detail: station.feeders.length ? station.feeders.join(", ") : "No feeder listed",
      page: station.source_page,
      search: [station.code, station.name, ...station.feeders].join(" ")
    }));
  }
  if (activeRegister === "plants") {
    return handbook.generation_plants.map((plant) => ({
      key: plant.code,
      title: plant.name,
      detail: plant.category.replaceAll("_", " "),
      page: plant.source_page,
      search: [plant.code, plant.name, plant.category].join(" ")
    }));
  }
  return handbook.transmission_lines.map((line) => ({
    key: line.circuit,
    title: `${line.from}${line.from_code ? ` (${line.from_code})` : ""} to ${line.to}${line.to_code ? ` (${line.to_code})` : ""}`,
    detail: "Transmission circuit",
    page: line.source_page,
    search: [line.circuit, line.from, line.from_code, line.to, line.to_code].filter(Boolean).join(" ")
  }));
}

function renderHandbookRegister(query = "") {
  const normalized = query.trim().toLowerCase();
  const rows = registerRows().filter((row) => row.search.toLowerCase().includes(normalized));
  document.querySelector("#register-count").textContent = `${rows.length} record${rows.length === 1 ? "" : "s"}`;
  document.querySelector("#handbook-register").innerHTML = rows.map((row) => `
    <article class="register-row">
      <strong>${escapeHtml(row.key)}</strong>
      <div><span>${escapeHtml(row.title)}</span><small>${escapeHtml(row.detail)}</small></div>
      <a href="${escapeHtml(handbook.source.source_url)}" target="_blank" rel="noreferrer">PDF p. ${row.page}</a>
    </article>`).join("");
}

placeTerminalLayouts();

document.querySelectorAll(".filter").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".filter").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    renderTimeline(button.dataset.filter);
  });
});

document.querySelectorAll(".toggle").forEach((button) => {
  button.addEventListener("click", () => {
    const pressed = button.getAttribute("aria-pressed") === "true";
    button.setAttribute("aria-pressed", String(!pressed));
    button.classList.toggle("active", !pressed);
    button.closest(".station-sheet").querySelector(`.layer.${button.dataset.layer}`).classList.toggle("hidden", pressed);
  });
});

document.querySelectorAll(".component").forEach((component) => {
  component.addEventListener("click", () => showComponent(component.dataset.component));
  component.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      showComponent(component.dataset.component);
    }
  });
});

document.querySelectorAll("[data-diagram-panel]").forEach((panel) => {
  showComponent(panel.dataset.defaultComponent, false);
});

document.querySelector("#source-search").addEventListener("input", (event) => renderSources(event.target.value));
document.querySelector("#handbook-search").addEventListener("input", (event) => renderHandbookRegister(event.target.value));
document.querySelectorAll(".register-tab").forEach((button) => {
  button.addEventListener("click", () => {
    activeRegister = button.dataset.register;
    document.querySelectorAll(".register-tab").forEach((item) => {
      const selected = item === button;
      item.classList.toggle("active", selected);
      item.setAttribute("aria-pressed", String(selected));
    });
    renderHandbookRegister(document.querySelector("#handbook-search").value);
  });
});
document.querySelector("#station-search").addEventListener("input", (event) => renderStationTabs(event.target.value));
document.querySelector("#station-tabs").addEventListener("click", (event) => {
  const button = event.target.closest("[data-station-profile]");
  if (button) renderStationProfile(button.dataset.stationProfile);
});
document.addEventListener("click", (event) => {
  const link = event.target.closest("[data-station-record]");
  if (!link) return;
  event.preventDefault();
  openStationRecord(link.dataset.stationRecord);
});

renderAvalonNetwork();
bindInternalDiagramLinks();
showHandbookStation("OXP");
showHashStation();
window.addEventListener("hashchange", showHashStation);
renderStationTabs();
renderStationProfile(activeStationProfile);
renderHandbookRegister();
renderTimeline();
renderSources();

