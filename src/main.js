import "@fontsource/barlow-condensed/400.css";
import "@fontsource/barlow-condensed/500.css";
import "@fontsource/barlow-condensed/600.css";
import "@fontsource/barlow-condensed/700.css";
import "@fontsource/source-serif-4/400.css";
import "@fontsource/source-serif-4/600.css";
import "@fontsource/ibm-plex-mono/400.css";
import "./styles.css";
import { components, sources, timeline } from "./data.js";
import handbook from "../research/derived/np-2006-handbook.json";
import { avalonLabelOffsets, avalonNodePositions } from "./avalon-layout.js";

const sourceById = new Map(sources.map((source) => [source.id, source]));
const handbookStations = new Map(handbook.substations.map((station) => [station.code, station]));
const handbookEndpoints = new Map();
for (const line of handbook.transmission_lines) {
  if (line.from_code) handbookEndpoints.set(line.from_code, { name: line.from, source_page: line.source_page });
  if (line.to_code) handbookEndpoints.set(line.to_code, { name: line.to, source_page: line.source_page });
}
let activeRegister = "lines";

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

function showComponent(componentId) {
  const component = components[componentId];
  if (!component) return;
  document.querySelector("#component-code").textContent = component.code;
  document.querySelector("#component-title").textContent = component.title;
  document.querySelector("#component-summary").textContent = component.summary;
  document.querySelector("#component-data").innerHTML = component.data
    .map(([term, value]) => `<div><dt>${escapeHtml(term)}</dt><dd>${escapeHtml(value)}</dd></div>`)
    .join("");
  document.querySelector("#component-source").textContent = component.pages;
  document.querySelectorAll(".component").forEach((element) => {
    element.classList.toggle("selected", element.dataset.component === componentId);
  });
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
    return `
      <g class="map-edge" data-from="${line.from_code}" data-to="${line.to_code}">
        <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"></line>
        <text x="${midX}" y="${midY - 5}">${escapeHtml(line.circuit)}</text>
      </g>`;
  }).join("");
  const nodeMarkup = Object.entries(avalonNodePositions).map(([code, [x, y]]) => {
    const station = handbookStations.get(code) || handbookEndpoints.get(code);
    const [dx, dy] = avalonLabelOffsets[code] || [10, -10];
    return `
      <g class="map-node" tabindex="0" role="button" data-station="${code}" aria-label="${escapeHtml(station.name)} station, ${code}">
        <circle cx="${x}" cy="${y}" r="8"></circle>
        <text x="${x + dx}" y="${y + dy}">${code}</text>
      </g>`;
  }).join("");
  svg.innerHTML = `
    <g class="map-grid" aria-hidden="true">
      <path d="M40 120H1040 M40 300H1040 M40 480H1040 M40 660H1040 M40 840H1040"></path>
      <path d="M120 30V890 M320 30V890 M520 30V890 M720 30V890 M920 30V890"></path>
    </g>
    <g class="map-edges">${edgeMarkup}</g>
    <g class="map-nodes">${nodeMarkup}</g>`;

  document.querySelectorAll(".map-node").forEach((node) => {
    const select = () => showHandbookStation(node.dataset.station);
    node.addEventListener("click", select);
    node.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        select();
      }
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
    document.querySelector(`.one-line .layer.${button.dataset.layer}`).classList.toggle("hidden", pressed);
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

renderAvalonNetwork();
showHandbookStation("OXP");
renderHandbookRegister();
renderTimeline();
renderSources();

