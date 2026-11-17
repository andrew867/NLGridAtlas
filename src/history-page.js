import { timeline as gridTimeline, sources as gridSources } from "./data.js";
import { telephoneTimeline, telephoneSources } from "./telephone-data.js";
import { createNavigationController } from "./navigation/controller.js";

const sources = [...gridSources, ...telephoneSources];
const sourceById = new Map(sources.map((source) => [source.id, source]));
const timeline = [...gridTimeline, ...telephoneTimeline].sort((left, right) => {
  const leftYear = Number.parseInt(String(left.date).match(/\d{4}/)?.[0] || "9999", 10);
  const rightYear = Number.parseInt(String(right.date).match(/\d{4}/)?.[0] || "9999", 10);
  return leftYear - rightYear;
});

function escapeHtml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

function sourceRecordHref(source, event) {
  const url = new URL("./sources.html", window.location.href);
  url.searchParams.set("source", source.id);
  url.hash = `source-${source.id}`;
  return url.href;
}

function renderTimeline(filter) {
  const events = timeline.filter((event) => filter === "all" || event.category === filter);
  document.querySelector("#timeline-list").innerHTML = events.map((event) => {
    const source = sourceById.get(event.sourceId);
    return `<article class="timeline-entry" data-category="${escapeHtml(event.category)}">
      <time>${escapeHtml(event.date)}</time><span class="timeline-node" aria-hidden="true"></span>
      <div><span class="event-type">${escapeHtml(event.category)} / ${escapeHtml(event.status)}</span>
      <h3>${escapeHtml(event.title)}</h3><p>${escapeHtml(event.body)}</p>
      <a class="evidence-link" data-source-id="${escapeHtml(source.id)}" data-document-url="${escapeHtml(source.url)}" href="${escapeHtml(sourceRecordHref(source, event))}">${escapeHtml(source.title)} / ${escapeHtml(event.pages)}</a></div>
    </article>`;
  }).join("");
}

export function initHistoryPage() {
  const controller = createNavigationController({
    page: "history",
    render: ({ state }) => {
      const filter = state.category || "all";
      document.querySelectorAll(".filter").forEach((button) => button.classList.toggle("active", button.dataset.filter === filter));
      renderTimeline(filter);
    }
  });
  document.querySelectorAll(".filter").forEach((button) => button.addEventListener("click", () => controller.transition({ category: button.dataset.filter }, { preserveScroll: true })));
  controller.hydrate();
}
