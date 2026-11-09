import "@fontsource/barlow-condensed/400.css";
import "@fontsource/barlow-condensed/500.css";
import "@fontsource/barlow-condensed/600.css";
import "@fontsource/barlow-condensed/700.css";
import "@fontsource/source-serif-4/400.css";
import "@fontsource/source-serif-4/600.css";
import "@fontsource/ibm-plex-mono/400.css";
import "./styles.css";
import { components, sources, timeline } from "./data.js";

const sourceById = new Map(sources.map((source) => [source.id, source]));

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

renderTimeline();
renderSources();

