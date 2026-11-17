import {
  components,
  islandTerminalRecords,
  sources as gridSources,
  stationProfiles
} from "./data.js";
import handbook from "../research/derived/np-2006-handbook.json";
import feederRegister2018 from "../research/derived/np-2018-feeder-register.json";
import transmissionRegister2022 from "../research/derived/np-2022-transmission-register.json";
import transformerRegister from "../research/derived/np-2027-transformer-register.json";
import { avalonLabelOffsets, avalonNodePositions } from "./avalon-layout.js";
import { initGeographicMap } from "./geographic-map.js";
import { initIslandBackbone } from "./island-backbone.js";
import { renderTerminalDiagram } from "./terminal-diagram.js";
import { createNavigationController } from "./navigation/controller.js";

const sources = gridSources;
const sourceById = new Map(sources.map((source) => [source.id, source]));
const sourceByUrl = new Map(sources.map((source) => [source.url.split("#")[0].replace(/^https?:\/\/(?:www\.)?/, "").replace("pub.nl.ca", "pub.nf.ca").toLowerCase(), source]));
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
  const station = stationDirectory.get(profile.code);
  stationDirectory.set(profile.code, {
    code: profile.code,
    name: profile.name || station?.name || profile.code,
    feeders: profile.feederRegister || station?.feeders || [],
    source_page: station?.source_page || null
  });
}
const handbookEndpoints = new Map();
for (const line of handbook.transmission_lines) {
  if (line.from_code) handbookEndpoints.set(line.from_code, { name: line.from, source_page: line.source_page });
  if (line.to_code) handbookEndpoints.set(line.to_code, { name: line.to, source_page: line.source_page });
}
let activeRegister = "lines-2022";
let activeStationProfile = "HWD";
let activeHydroTerminal = "SUN";
let stationTabQuery = "";
let stationController = null;
let networkController = null;
const stationSectionAnchors = {
  GDL: "#substation-gdl",
  GOU: "#substation-gou",
  HWD: "#terminal-hwd",
  KBR: "#substation-kbr",
  KEN: "#substation-ken",
  MUN: "#substation-mun",
  OXP: "#terminal-opd",
  PEP: "#substation-pep",
  PUL: "#substation-pul",
  RRD: "#substation-rrd",
  SLA: "#substation-sla",
  SJM: "#substation-sjm",
  VIR: "#substation-vir",
  WAV: "#terminal-wav"
};
const stationDetailAnchors = {
  GDL: "#substation-gdl",
  GOU: "#substation-gou",
  HWD: "#substation-hwd",
  KBR: "#substation-kbr",
  KEN: "#substation-ken",
  MUN: "#substation-mun",
  OXP: "#substation-oxp",
  PEP: "#substation-pep",
  PUL: "#substation-pul",
  RRD: "#substation-rrd",
  SLA: "#substation-sla",
  SJM: "#substation-sjm",
  VIR: "#substation-vir",
  WAV: "#terminal-wav"
};

function placeTerminalLayouts() {
  const terminalSheets = document.querySelector("#network .station-sheets");
  if (!terminalSheets) return;
  document.querySelectorAll("[data-terminal-layout]").forEach((layout) => terminalSheets.append(layout));
}

function stationUrl(code, collection = "np", view = "overview") {
  const url = new URL("./stations.html", window.location.href);
  url.searchParams.set("collection", collection);
  url.searchParams.set("station", code);
  url.searchParams.set("view", view);
  url.hash = "station-record";
  return `${url.pathname.split("/").pop()}${url.search}${url.hash}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function sourceForUrl(url) {
  const key = String(url).split("#")[0].replace(/^https?:\/\/(?:www\.)?/, "").replace("pub.nl.ca", "pub.nf.ca").toLowerCase();
  return sourceByUrl.get(key) || null;
}

function citationMarkup(sourceOrUrl, label, className = "evidence-link") {
  const source = typeof sourceOrUrl === "string" ? sourceForUrl(sourceOrUrl) : sourceOrUrl;
  const documentUrl = typeof sourceOrUrl === "string" ? sourceOrUrl : sourceOrUrl?.url;
  if (!source) return `<a class="${escapeHtml(className)}" href="${escapeHtml(documentUrl)}" target="_blank" rel="noreferrer">${escapeHtml(label)}</a>`;
  const url = new URL("./sources.html", window.location.href);
  url.searchParams.set("source", source.id);
  url.hash = `source-${source.id}`;
  return `<a class="${escapeHtml(className)}" href="${escapeHtml(url.href)}" data-source-id="${escapeHtml(source.id)}" data-document-url="${escapeHtml(documentUrl)}" data-locator="${escapeHtml(label)}">${escapeHtml(label)}</a>`;
}

function showComponent(requestedId, allowReset = true) {
  const requested = components[requestedId];
  if (!requested) return null;
  const panel = document.querySelector(`[data-diagram-panel="${requested.diagram}"]`);
  if (!panel) return null;
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
    return citationMarkup(source, `${label} / ${reference.pages}`, "evidence-link stacked-link");
  }).join("");
  panel.dataset.selectedComponent = componentId === defaultId ? "" : componentId;
  document.querySelectorAll(`.component[data-diagram="${requested.diagram}"]`).forEach((element) => {
    const selected = element.dataset.component === componentId && componentId !== defaultId;
    element.classList.toggle("selected", selected);
    element.setAttribute("aria-pressed", String(selected));
  });
  return componentId;
}

function renderStationProfile(code, requestedView = "overview") {
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
      ? `<a href="${escapeHtml(stationUrl(destinationCode))}" data-station-record="${escapeHtml(destinationCode)}">${escapeHtml(destinationLabel)}</a>`
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
  const referenceSheets = (profile.referenceSheets || []).map((sheet) => {
    const sheetSource = sourceById.get(sheet.sourceId);
    return `
      <details class="feeder-map reference-sheet">
        <summary>${escapeHtml(sheet.title)}</summary>
        <a class="feeder-map-image" href="${escapeHtml(sheet.image)}" target="_blank" rel="noreferrer" aria-label="Open full-size ${escapeHtml(sheet.title)}">
          <img src="${escapeHtml(sheet.image)}" loading="lazy" alt="${escapeHtml(sheet.alt)}" />
        </a>
        <a class="feeder-map-source" href="${escapeHtml(sheetSource.url)}" target="_blank" rel="noreferrer">${escapeHtml(sheetSource.title)} / ${escapeHtml(sheet.pages)}</a>
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
  const planningRecord = profile.planningRecord;
  const planningSource = planningRecord ? sourceById.get(planningRecord.sourceId) : null;
  const renderAutomaticTransformerRegister = transformers.length && planningRecord?.sourceId !== "np-2027-transformers";
  const assignmentRecord = profile.assignmentRecord;
  const assignmentSource = assignmentRecord ? sourceById.get(assignmentRecord.sourceId) : null;
  const historyRecords = profile.historyRecords || [];
  const circuitSourceRefs = profile.circuitSources || (profile.circuitSource ? [profile.circuitSource] : []);
  const circuitSources = circuitSourceRefs
    .map((reference) => ({ reference, source: sourceById.get(reference.sourceId) }))
    .filter(({ source }) => source);
  const feederTieSource = profile.feederTieSource ? sourceById.get(profile.feederTieSource.sourceId) : null;
  const feederTieRows = (profile.feederTies || []).map((record) => {
    const ties = record.ties.map((tie) => {
      const stationCode = tie.split("-")[0];
      return stationDirectory.has(stationCode)
        ? `<a href="${escapeHtml(stationUrl(stationCode))}" data-station-record="${escapeHtml(stationCode)}">${escapeHtml(tie)}</a>`
        : `<span>${escapeHtml(tie)}</span>`;
    }).join(" ");
    return `<div><dt><strong>${escapeHtml(record.feeder)}</strong><small>${record.customers.toLocaleString()} customers</small></dt><dd>${ties}</dd></div>`;
  }).join("");
  const availableViews = [
    ["overview", "Overview", true],
    ["one-line", "One-line", Boolean(profile.diagram)],
    ["equipment", "Equipment", Boolean(transformers.length || planningRecord || assignmentRecord || profile.eventLoads.length)],
    ["circuits", "Circuits and feeders", Boolean(!profile.hideCircuitRegister || !profile.hideFeederRegister || feederTieRows)],
    ["maps", "Maps", Boolean(feederMaps || referenceSheets)],
    ["history", "History", Boolean(historyRecords.length || record)]
  ].filter(([, , available]) => available);
  const view = availableViews.some(([id]) => id === requestedView) ? requestedView : "overview";
  const recordNav = availableViews.map(([id, label]) => `<a href="${escapeHtml(stationUrl(code, "np", id))}" data-station-view="${escapeHtml(id)}"${id === view ? ' aria-current="page"' : ""}>${escapeHtml(label)}</a>`).join("");
  const hiddenUnless = (id) => id === view ? "" : " hidden";
  const profileContainer = document.querySelector("#station-profile");
  if (!profileContainer) return;
  profileContainer.innerHTML = `
    <header class="profile-heading">
      <div><span>${escapeHtml(profile.code)} / STATION RECORD</span><h4>${escapeHtml(profile.name)}</h4></div>
      <strong>${escapeHtml(stationVoltage)}</strong>
    </header>
    <nav class="record-view-nav" aria-label="${escapeHtml(profile.name)} record views">${recordNav}</nav>
    <section class="record-view record-overview" data-record-view="overview"${hiddenUnless("overview")}>
      <dl class="record-overview-facts">
        <div><dt>Documented supply circuits</dt><dd>${escapeHtml(connected.length ? connected.map((line) => line.circuit).join(", ") : "Not listed")}</dd></div>
        <div><dt>Registered feeders</dt><dd>${profile.feederRegister.length.toLocaleString()}</dd></div>
        <div><dt>Transformer records</dt><dd>${transformers.length.toLocaleString()}</dd></div>
        <div><dt>Available map sheets</dt><dd>${(profile.mapPages.length + (profile.referenceSheets || []).length).toLocaleString()}</dd></div>
      </dl>
    </section>
    ${profile.diagram ? `<section class="record-view" data-record-view="one-line"${hiddenUnless("one-line")}>${renderTerminalDiagram(profile.diagram, escapeHtml, "station")}</section>` : ""}
    <div class="profile-grid">
      ${profile.hideCircuitRegister ? "" : `<section class="record-view" data-record-view="circuits"${hiddenUnless("circuits")}>
        <span class="profile-label">${escapeHtml(profile.circuitRegisterLabel || "2005 CIRCUIT REGISTER")}</span>
        <ul class="circuit-list">${circuitRows || "<li><span>No connected transmission circuit in the register</span></li>"}</ul>
        ${circuitSources.length
          ? circuitSources.map(({ reference, source }) => citationMarkup(source, `${source.title} / ${reference.pages}`, "evidence-link stacked-link")).join("")
          : citationMarkup(`${handbook.source.source_url}#page=6`, "Electrical System Handbook / PDF pp. 6 to 7")}
      </section>`}
      ${profile.hideFeederRegister && !feederTieRows ? "" : `<section class="record-view" data-record-view="circuits"${hiddenUnless("circuits")}>
        ${profile.hideFeederRegister ? "" : `<span class="profile-label">${escapeHtml(profile.feederRegisterLabel || "2005 FEEDER REGISTER")}</span>
        <div class="feeder-tags">${profile.feederRegister.length
          ? profile.feederRegister.map((feeder) => `<span>${escapeHtml(feeder)}</span>`).join("")
          : /^NO DISTRIBUTION FEEDERS/.test(profile.feederRegisterLabel || "") ? "" : "<span>No feeder designation</span>"}</div>`}
        ${feederTieRows ? `
          <span class="profile-label map-label">2019 FEEDER TIE POINTS</span>
          <dl class="feeder-tie-list">${feederTieRows}</dl>
          ${citationMarkup(feederTieSource, `${feederTieSource.title} / ${profile.feederTieSource.pages}`)}` : ""}
      </section>`}
      ${feederMaps || referenceSheets ? `<section class="record-view" data-record-view="maps"${hiddenUnless("maps")}>
        ${feederMaps ? `<span class="profile-label map-label">2014 FEEDER MAP SHEETS</span><div class="feeder-maps">${feederMaps}</div>` : ""}
        ${referenceSheets ? `<span class="profile-label map-label">${escapeHtml(profile.referenceSheetLabel || "SYSTEM SCHEMATICS")}</span><div class="feeder-maps reference-sheets">${referenceSheets}</div>` : ""}
        ${profile.mapNote ? `<p class="profile-note">${escapeHtml(profile.mapNote)}</p>` : ""}
      </section>` : ""}
      <section class="station-equipment record-view" data-record-view="equipment"${hiddenUnless("equipment")}>
        ${renderAutomaticTransformerRegister ? `
          <span class="profile-label">2027 TRANSFORMER REGISTER</span>
          <dl>${transformerRows}</dl>
          ${citationMarkup(`${transformerRegister.source.source_url}#page=${transformerPages[0]}`, `Power Transformer Listing / physical PDF ${transformerPages.length === 1 ? `p. ${transformerPages[0]}` : `pp. ${transformerPages.join(", ")}`}`)}` : ""}
        ${profile.eventLoads.length ? `
          <div class="event-loads">
            <span class="profile-label">2014-01-05 RECORDED OUTAGE LOAD</span>
            <dl>${profile.eventLoads.map(([feeder, load]) => `<div><dt>${escapeHtml(feeder)}</dt><dd>${escapeHtml(load)}</dd></div>`).join("")}</dl>
            ${citationMarkup(`${mapBase}#page=14`, "CA-NP-020 / physical PDF p. 14")}
          </div>` : ""}
        ${planningRecord ? `
          <div class="event-loads">
            <span class="profile-label">${escapeHtml(planningRecord.label)}</span>
            <dl>${planningRecord.facts.map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`).join("")}</dl>
            ${citationMarkup(planningSource, `${planningSource.title} / ${planningRecord.pages}`)}
          </div>` : ""}
        ${assignmentRecord ? `
          <div class="event-loads">
            <span class="profile-label">${escapeHtml(assignmentRecord.label)}</span>
            <dl>${assignmentRecord.facts.map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`).join("")}</dl>
            ${citationMarkup(assignmentSource, `${assignmentSource.title} / ${assignmentRecord.pages}`)}
          </div>` : ""}
      </section>
    </div>
    ${historyRecords.length || record ? `<section class="record-view record-history" data-record-view="history"${hiddenUnless("history")}>
      ${historyRecords.map((historyRecord) => {
        const historySource = sourceById.get(historyRecord.sourceId);
        return `<article class="event-loads"><span class="profile-label">${escapeHtml(historyRecord.label)}</span><dl>${historyRecord.facts.map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`).join("")}</dl>${citationMarkup(historySource, `${historySource.title} / ${historyRecord.pages}`)}</article>`;
      }).join("")}
      ${record ? `
      <section class="profile-record">
        <header><span>${escapeHtml(record.date)}</span><strong>${escapeHtml(record.title)}</strong></header>
        <dl>${record.facts.map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`).join("")}</dl>
        ${citationMarkup(recordSource, `${recordSource.title} / ${record.pages}`)}
      </section>` : ""}</section>` : ""}`;
  document.title = `${profile.name}, ${availableViews.find(([id]) => id === view)?.[1] || "Overview"} | NL Grid Atlas`;
  centerDynamicDiagram(profileContainer);
  renderStationTabs(stationTabQuery);
}

function renderStationTabs(query = "") {
  stationTabQuery = query.trim().toLowerCase();
  const stations = [...stationDirectory.values()]
    .filter((station) => `${station.code} ${station.name} ${station.feeders.join(" ")}`.toLowerCase().includes(stationTabQuery))
    .sort((left, right) => left.name.localeCompare(right.name));
  const selectedOutsideResults = activeStationProfile && !stations.some((station) => station.code === activeStationProfile);
  document.querySelector("#station-record-count").textContent = `${stations.length} station${stations.length === 1 ? "" : "s"}${selectedOutsideResults ? "; selected record is outside these results" : ""}`;
  const directory = document.querySelector("#station-tabs");
  if (!directory) return;
  directory.innerHTML = stations.map((station) => {
    const selected = station.code === activeStationProfile;
    return `<a class="station-tab${selected ? " active" : ""}" href="${escapeHtml(stationUrl(station.code))}"${selected ? ' aria-current="page"' : ""} data-station-profile="${escapeHtml(station.code)}"><strong>${escapeHtml(station.code)}</strong><span>${escapeHtml(station.name)}</span></a>`;
  }).join("");
}

function openStationRecord(code, scroll = true) {
  if (!stationDirectory.has(code)) return;
  if (stationController) {
    stationController.transition({ collection: "np", station: code, view: "overview", fragment: "station-record" }, {
      preserveScroll: !scroll,
      focus: "#station-profile"
    });
    return;
  }
  renderStationProfile(code);
  if (scroll) document.querySelector("#station-browser").scrollIntoView({ block: "start" });
}

function centerDynamicDiagram(container) {
  container.querySelectorAll(".terminal-diagram-scroll").forEach((diagramScroll) => {
    diagramScroll.scrollLeft = Math.max(0, (diagramScroll.scrollWidth - diagramScroll.clientWidth) / 2);
  });
}

function renderHydroTerminalTabs() {
  const directory = document.querySelector("#hydro-terminal-tabs");
  if (!directory) return;
  directory.innerHTML = islandTerminalRecords.map((record) => {
    const selected = record.code === activeHydroTerminal;
    return `<a class="station-tab${selected ? " active" : ""}" href="${escapeHtml(stationUrl(record.code, "hydro"))}"${selected ? ' aria-current="page"' : ""} data-hydro-terminal-profile="${escapeHtml(record.code)}"><strong>${escapeHtml(record.code)}</strong><span>${escapeHtml(record.name)}</span></a>`;
  }).join("");
}

function renderHydroTerminalRecord(code, requestedView = "overview") {
  const record = islandTerminalRecords.find((item) => item.code === code);
  if (!record) return;
  activeHydroTerminal = record.code;
  const factRows = record.facts.map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`).join("");
  const sourceLinks = record.sources.map((reference) => {
    const source = sourceById.get(reference.sourceId);
    return citationMarkup(source, `${source.title} / ${reference.pages}`, "evidence-link stacked-link");
  }).join("");
  const diagrams = [record.diagram, ...(record.additionalDiagrams || [])];
  const view = ["overview", "one-line", "equipment"].includes(requestedView) ? requestedView : "overview";
  const hiddenUnless = (id) => id === view ? "" : " hidden";
  const recordContainer = document.querySelector("#hydro-terminal-record");
  if (!recordContainer) return;
  recordContainer.innerHTML = `
    <header class="profile-heading">
      <div><span>${escapeHtml(record.code)} / ISLAND SYSTEM</span><h4>${escapeHtml(record.name)}</h4></div>
      <span class="evidence-state ${escapeHtml(record.status)}">${escapeHtml(record.status.toUpperCase())}</span>
    </header>
    <nav class="record-view-nav" aria-label="${escapeHtml(record.name)} record views">
      ${[["overview", "Overview"], ["one-line", "One-line"], ["equipment", "Equipment"]].map(([id, label]) => `<a href="${escapeHtml(stationUrl(code, "hydro", id))}" data-hydro-terminal-view="${id}"${view === id ? ' aria-current="page"' : ""}>${label}</a>`).join("")}
    </nav>
    <section class="record-view record-overview" data-record-view="overview"${hiddenUnless("overview")}>${record.summary ? `<p>${escapeHtml(record.summary)}</p>` : `<dl class="record-overview-facts">${factRows}</dl>`}</section>
    <section class="record-view" data-record-view="one-line"${hiddenUnless("one-line")}>${diagrams.map((diagram) => renderTerminalDiagram(diagram, escapeHtml)).join("")}</section>
    <div class="hydro-terminal-record-grid record-view" data-record-view="equipment"${hiddenUnless("equipment")}>
      <dl>${factRows}</dl>
      <div class="hydro-terminal-sources"><span class="profile-label">SOURCE RECORDS</span>${sourceLinks}</div>
    </div>`;
  document.title = `${record.name}, ${view === "one-line" ? "One-line" : view === "equipment" ? "Equipment" : "Overview"} | NL Grid Atlas`;
  centerDynamicDiagram(recordContainer);
  renderHydroTerminalTabs();
}

function openHydroTerminalRecord(code, scroll = true) {
  if (!islandTerminalRecords.some((record) => record.code === code)) return;
  if (stationController) {
    stationController.transition({ collection: "hydro", station: code, view: "overview", fragment: "station-record" }, {
      preserveScroll: !scroll,
      focus: "#hydro-terminal-record"
    });
    return;
  }
  renderHydroTerminalRecord(code);
  if (scroll) document.querySelector("#hydro-terminal-browser").scrollIntoView({ block: "start" });
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
    const target = stationUrl(line.to_code);
    return `
      <a class="map-edge" href="${escapeHtml(target)}" data-from="${line.from_code}" data-to="${line.to_code}" aria-label="${escapeHtml(line.circuit)} from ${escapeHtml(line.from)} to ${escapeHtml(line.to)}">
        <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"></line>
        <text x="${midX}" y="${midY - 5}">${escapeHtml(line.circuit)}</text>
      </a>`;
  }).join("");
  const nodeMarkup = Object.entries(avalonNodePositions).map(([code, [x, y]]) => {
    const station = handbookStations.get(code) || handbookEndpoints.get(code);
    const [dx, dy] = avalonLabelOffsets[code] || [10, -10];
    const target = stationUrl(code);
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
      networkController?.transition({ networkStation: node.dataset.station }, { preserveScroll: true });
    });
  });
}

function showHashStation() {
  const match = window.location.hash.match(/^#station-([A-Z0-9]+)$/);
  if (match) showHandbookStation(match[1]);
}

function bindInternalDiagramLinks() {
  document.querySelectorAll('svg a[href^="#"]').forEach((link) => {
    if (link.matches("[data-station-record], [data-hydro-terminal-record]")) return;
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
    stationLink.href = stationUrl(code);
    stationLink.dataset.stationRecord = code;
    stationLink.textContent = `Open ${station.name} station record`;
    stationLink.setAttribute("aria-label", `Open ${station.name} station record`);
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
      search: [station.code, station.name, ...station.feeders].join(" "),
      sourceUrl: handbook.source.source_url,
      sourceLabel: `PDF p. ${station.source_page}`,
      cells: [station.code, station.name, station.feeders.length ? station.feeders.join(", ") : "None listed"]
    }));
  }
  if (activeRegister === "plants") {
    return handbook.generation_plants.map((plant) => {
      const greenhill = plant.name === "Greenhill";
      return {
        key: greenhill ? "GRH" : plant.code,
        title: plant.name,
        detail: plant.category.replaceAll("_", " "),
        page: plant.source_page,
        conflict: greenhill,
        search: [plant.code, greenhill ? "GRH" : "", plant.name, plant.category].join(" "),
        sourceUrl: handbook.source.source_url,
        sourceLabel: `PDF p. ${plant.source_page}`,
        cells: [greenhill ? "GRH" : plant.code, plant.name, plant.category.replaceAll("_", " ")]
      };
    });
  }
  if (activeRegister === "lines-2022") {
    return transmissionRegister2022.records.map((line) => ({
      key: line.circuit,
      title: line.description,
      detail: `${line.allocation}; $${line.historical_cost_thousands.toLocaleString()} thousand historical cost`,
      page: line.physical_pdf_page,
      search: [line.circuit, line.description, line.allocation, ...(line.endpoint_codes || [])].join(" "),
      sourceUrl: transmissionRegister2022.source.url,
      sourceLabel: `Physical PDF p. ${line.physical_pdf_page}`,
      cells: [line.circuit, line.description, line.allocation, line.historical_cost_thousands.toLocaleString("en-CA")]
    }));
  }
  if (activeRegister === "feeders-2018") {
    return feederRegister2018.records.map((feeder) => ({
      key: feeder.feeder,
      title: `${feeder.region} region; ${feeder.operating_voltage_kv} kV`,
      detail: `${feeder.forecast_winter_peak_mva} MVA forecast; ${feeder.loading_vs_planning_percent}% of planning capacity`,
      page: feeder.physical_pdf_page,
      search: [feeder.feeder, feeder.station_code, feeder.region, feeder.operating_voltage_kv].join(" "),
      sourceUrl: feederRegister2018.source.url,
      sourceLabel: `Physical PDF p. ${feeder.physical_pdf_page}`,
      cells: [feeder.feeder, feeder.station_code, feeder.region, feeder.operating_voltage_kv, feeder.forecast_winter_peak_mva, feeder.loading_vs_planning_percent]
    }));
  }
  return handbook.transmission_lines.map((line) => ({
    key: line.circuit,
    title: `${line.from}${line.from_code ? ` (${line.from_code})` : ""} to ${line.to}${line.to_code ? ` (${line.to_code})` : ""}`,
    detail: "Transmission circuit",
    page: line.source_page,
    search: [line.circuit, line.from, line.from_code, line.to, line.to_code].filter(Boolean).join(" "),
    sourceUrl: handbook.source.source_url,
    sourceLabel: `PDF p. ${line.source_page}`,
    cells: [line.circuit, `${line.from}${line.from_code ? ` (${line.from_code})` : ""}`, `${line.to}${line.to_code ? ` (${line.to_code})` : ""}`]
  }));
}

function registerDefinition() {
  if (activeRegister === "stations") return { caption: "Newfoundland Power stations in the 2006 Electrical System Handbook", headers: ["Code", "Station", "Registered feeders", "Source"] };
  if (activeRegister === "plants") return { caption: "Generation plants in the 2006 Electrical System Handbook", headers: ["Code", "Plant", "Category", "Source"] };
  if (activeRegister === "lines-2022") return { caption: "2022 transmission asset register, historical cost in CAD thousands", headers: ["Circuit", "Source description", "Allocation", "Historical cost, CAD thousands", "Source"] };
  if (activeRegister === "feeders-2018") return { caption: "2018 feeder forecast register", headers: ["Feeder", "Station", "Region", "Operating voltage, kV", "Forecast, MVA", "Planning capacity, %", "Source"] };
  return { caption: "Transmission circuits in the 2006 Electrical System Handbook", headers: ["Circuit", "From", "To", "Source"] };
}

function renderHandbookRegister(query = "") {
  const normalized = query.trim().toLowerCase();
  const rows = registerRows().filter((row) => row.search.toLowerCase().includes(normalized));
  document.querySelector("#source-conflict").hidden = !["grh", "grt"].includes(normalized);
  document.querySelector("#register-count").textContent = `${rows.length} record${rows.length === 1 ? "" : "s"}`;
  const definition = registerDefinition();
  document.querySelector("#handbook-register").innerHTML = `<table class="register-table"><caption>${escapeHtml(definition.caption)}</caption><thead><tr>${definition.headers.map((header) => `<th scope="col">${escapeHtml(header)}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `
    <tr class="${row.conflict ? "conflict-record" : ""}"${row.conflict ? ` data-conflict-code="${escapeHtml(row.key)}" tabindex="0" aria-controls="source-conflict"` : ""}>
      ${row.cells.map((cell, index) => `<${index === 0 ? "th scope=\"row\"" : "td"}>${escapeHtml(cell)}</${index === 0 ? "th" : "td"}>`).join("")}
      <td>${citationMarkup(row.sourceUrl, row.sourceLabel)}</td>
    </tr>`).join("")}</tbody></table>`;
}

function bindDiagramInteractions() {
  document.querySelectorAll(".toggle").forEach((button) => {
    button.addEventListener("click", () => {
      const pressed = button.getAttribute("aria-pressed") === "true";
      button.setAttribute("aria-pressed", String(!pressed));
      button.classList.toggle("active", !pressed);
      button.closest(".station-sheet")?.querySelector(`.layer.${button.dataset.layer}`)?.classList.toggle("hidden", pressed);
    });
  });
  const activateComponent = (component) => {
    const diagram = component.dataset.diagram;
    const selected = showComponent(component.dataset.component);
    if (!stationController || !selected) return;
    const panel = document.querySelector(`[data-diagram-panel="${diagram}"]`);
    const next = (stationController.getState().sets?.component || []).filter((value) => !value.startsWith(`${diagram}:`));
    if (selected !== panel?.dataset.defaultComponent) next.push(`${diagram}:${selected}`);
    stationController.transition({ sets: { component: next } }, { preserveScroll: true });
  };
  document.addEventListener("click", (event) => {
    const component = event.target.closest(".component[data-component]");
    if (component) activateComponent(component);
  });
  document.addEventListener("keydown", (event) => {
    const component = event.target.closest(".component[data-component]");
    if (component && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      activateComponent(component);
    }
  });
  document.querySelectorAll("[data-diagram-panel]").forEach((panel) => showComponent(panel.dataset.defaultComponent, false));
}

export async function initNetworkPage() {
  placeTerminalLayouts();
  renderAvalonNetwork();
  bindInternalDiagramLinks();
  const backbone = initIslandBackbone({
    onStateChange: (patch) => networkController?.transition(patch, { preserveScroll: true })
  });
  const geographicMap = await initGeographicMap({
    onStateChange: (patch) => networkController?.transition(patch, { preserveScroll: true })
  });

  const search = document.querySelector("#handbook-search");
  const searchForm = document.querySelector("#handbook-search-form");
  const register = document.querySelector("#handbook-register");
  networkController = createNavigationController({
    page: "network",
    render: ({ state }) => {
      activeRegister = state.register || "lines-2022";
      if (search) search.value = state.q || "";
      document.querySelectorAll(".register-tab").forEach((button) => {
        const selected = button.dataset.register === activeRegister;
        button.classList.toggle("active", selected);
        button.setAttribute("aria-pressed", String(selected));
      });
      renderHandbookRegister(state.q || "");
      showHandbookStation((state.networkStation || "OXP").toUpperCase());
      backbone?.applyState({ circuit: state.circuit, voltages: state.voltages });
      if (state.mapStation) geographicMap?.selectStation(state.mapStation.toLowerCase());
    }
  });
  searchForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    networkController.transition({ q: search.value.trim() || null, page: "1" }, { preserveScroll: true });
  });
  register?.addEventListener("click", (event) => {
    const row = event.target.closest("[data-conflict-code]");
    if (row) document.querySelector("#source-conflict").hidden = false;
  });
  register?.addEventListener("keydown", (event) => {
    const row = event.target.closest("[data-conflict-code]");
    if (row && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      document.querySelector("#source-conflict").hidden = false;
    }
  });
  document.querySelectorAll(".register-tab").forEach((button) => button.addEventListener("click", () => {
    networkController.transition({ register: button.dataset.register, page: "1" }, { preserveScroll: true });
  }));
  networkController.hydrate();
}

export function initStationsPage() {
  bindDiagramInteractions();
  bindInternalDiagramLinks();
  const search = document.querySelector("#station-search");
  const searchForm = document.querySelector("#station-search-form");
  const clearSearch = document.querySelector("#station-search-clear");
  stationController = createNavigationController({
    page: "stations",
    render: ({ state }) => {
      const query = state.q || "";
      if (search) search.value = query;
      stationTabQuery = query;
      const hydroRequested = state.collection === "hydro";
      if (hydroRequested) {
        const requested = state.station || "SUN";
        activeHydroTerminal = islandTerminalRecords.some((record) => record.code === requested) ? requested : null;
      } else {
        const requested = state.station || "HWD";
        activeStationProfile = stationDirectory.has(requested) ? requested : null;
      }
      renderStationTabs(query);
      if (activeStationProfile) renderStationProfile(activeStationProfile, state.view || "overview");
      else document.querySelector("#station-profile").innerHTML = `<div class="route-message" role="status"><h4>Station not found</h4><p>The requested Newfoundland Power station code is not in this atlas.</p><a href="./stations.html?collection=np#station-browser">Open the station directory</a></div>`;
      renderHydroTerminalTabs();
      if (activeHydroTerminal) renderHydroTerminalRecord(activeHydroTerminal, state.view || "overview");
      else document.querySelector("#hydro-terminal-record").innerHTML = `<div class="route-message" role="status"><h4>Station not found</h4><p>The requested Hydro station code is not in this atlas.</p><a href="./stations.html?collection=hydro#hydro-terminal-browser">Open the Hydro directory</a></div>`;
      document.querySelectorAll("[data-diagram-panel]").forEach((panel) => showComponent(panel.dataset.defaultComponent, false));
      for (const selection of state.sets?.component || []) {
        const separator = selection.indexOf(":");
        if (separator > 0) showComponent(selection.slice(separator + 1), false);
      }
      if (!hydroRequested && activeStationProfile) {
        const selected = stationDirectory.get(activeStationProfile);
        const label = document.querySelector('#station-profile [data-station-view][aria-current="page"]')?.textContent?.trim() || "Overview";
        document.title = `${selected.name}, ${label} | NL Grid Atlas`;
      }
    }
  });
  searchForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    stationController.transition({ q: search.value.trim() || null }, { preserveScroll: true });
  });
  clearSearch?.addEventListener("click", () => stationController.transition({ q: null }, { preserveScroll: true, focus: "#station-search" }));
  document.addEventListener("click", (event) => {
    const stationLink = event.target.closest("[data-station-record], [data-station-profile]");
    if (stationLink && event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
      event.preventDefault();
      openStationRecord(stationLink.dataset.stationRecord || stationLink.dataset.stationProfile);
      return;
    }
    const hydroLink = event.target.closest("[data-hydro-terminal-record], [data-hydro-terminal-profile]");
    if (hydroLink && event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
      event.preventDefault();
      openHydroTerminalRecord(hydroLink.dataset.hydroTerminalRecord || hydroLink.dataset.hydroTerminalProfile);
      return;
    }
    const stationView = event.target.closest("[data-station-view]");
    if (stationView && event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
      event.preventDefault();
      stationController.transition({ collection: "np", station: activeStationProfile, view: stationView.dataset.stationView, fragment: "station-record" }, { preserveScroll: true });
      return;
    }
    const hydroView = event.target.closest("[data-hydro-terminal-view]");
    if (hydroView && event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
      event.preventDefault();
      stationController.transition({ collection: "hydro", station: activeHydroTerminal, view: hydroView.dataset.hydroTerminalView, fragment: "station-record" }, { preserveScroll: true });
    }
  });
  stationController.hydrate();
}
