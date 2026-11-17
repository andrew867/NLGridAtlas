import { createNavigationController } from "./navigation/controller.js";

const PAGE_SIZES = new Set([25, 50]);

function yearPeriod(value) {
  const year = Number.parseInt(value, 10);
  if (!Number.isInteger(year)) return "unknown";
  if (year < 1900) return "before-1900";
  if (year < 1950) return "1900-1949";
  if (year < 2000) return "1950-1999";
  if (year < 2010) return "2000-2009";
  if (year < 2020) return "2010-2019";
  return "2020-2029";
}

function addOption(select, value, label = value) {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = label;
  select.append(option);
}

export function initSourcesPage() {
  const searchForm = document.querySelector("#source-search-form");
  const search = document.querySelector("#source-search");
  const organization = document.querySelector("#source-organization");
  const period = document.querySelector("#source-period");
  const topic = document.querySelector("#source-topic");
  const sort = document.querySelector("#source-sort");
  const pageSizeControl = document.querySelector("#source-page-size");
  const clear = document.querySelector("#source-clear");
  const previous = document.querySelector("#source-previous");
  const next = document.querySelector("#source-next");
  const count = document.querySelector("#source-result-count");
  const status = document.querySelector("#source-page-status");
  const routeMessage = document.querySelector("#source-route-message");
  const records = [...document.querySelectorAll("#source-list > .source-record")];
  let controller;

  const organizations = [...new Set(records.map((record) => record.dataset.organization).filter(Boolean))]
    .sort((left, right) => left.localeCompare(right));
  organizations.forEach((value) => addOption(organization, value));

  const topicCounts = new Map();
  records.forEach((record) => {
    record.dataset.topics.split("|").filter(Boolean).forEach((value) => topicCounts.set(value, (topicCounts.get(value) || 0) + 1));
  });
  [...topicCounts.entries()]
    .filter(([, frequency]) => frequency >= 3)
    .sort(([left], [right]) => left.localeCompare(right))
    .slice(0, 100)
    .forEach(([value]) => addOption(topic, value));

  function render({ state }) {
    const query = (state.q || "").trim().toLowerCase();
    const requestedOrganization = state.organization || "";
    const requestedPeriod = state.period || "";
    const requestedTopic = state.topic || "";
    const requestedSort = ["title", "year", "organization"].includes(state.sort) ? state.sort : "title";
    const parsedPageSize = Number.parseInt(state.pageSize, 10);
    const pageSize = PAGE_SIZES.has(parsedPageSize) ? parsedPageSize : 25;
    const selected = state.source ? records.find((record) => record.dataset.sourceId === state.source) : null;
    const unknownSource = Boolean(state.source && !selected);
    let matching = records.filter((record) => {
      if (!record.dataset.search.includes(query)) return false;
      if (requestedOrganization && record.dataset.organization !== requestedOrganization) return false;
      if (requestedPeriod && yearPeriod(record.dataset.year) !== requestedPeriod) return false;
      if (requestedTopic && !record.dataset.topics.split("|").includes(requestedTopic)) return false;
      return true;
    });
    matching.sort((left, right) => {
      if (requestedSort === "year") {
        const leftYear = Number.parseInt(left.dataset.year, 10) || Number.MAX_SAFE_INTEGER;
        const rightYear = Number.parseInt(right.dataset.year, 10) || Number.MAX_SAFE_INTEGER;
        return leftYear - rightYear || left.dataset.title.localeCompare(right.dataset.title) || left.dataset.sourceId.localeCompare(right.dataset.sourceId);
      }
      if (requestedSort === "organization") {
        return left.dataset.organization.localeCompare(right.dataset.organization) || left.dataset.title.localeCompare(right.dataset.title) || left.dataset.sourceId.localeCompare(right.dataset.sourceId);
      }
      return left.dataset.title.localeCompare(right.dataset.title) || left.dataset.sourceId.localeCompare(right.dataset.sourceId);
    });
    if (selected && !matching.includes(selected)) matching = [selected, ...matching];
    const requestedPage = Math.max(1, Number.parseInt(state.page, 10) || 1);
    const selectedIndex = selected ? matching.indexOf(selected) : -1;
    const selectedPage = selectedIndex >= 0 ? Math.floor(selectedIndex / pageSize) + 1 : requestedPage;
    const pageCount = Math.max(1, Math.ceil(matching.length / pageSize));
    const page = Math.min(selected ? selectedPage : requestedPage, pageCount);
    const start = (page - 1) * pageSize;
    const visible = new Set(matching.slice(start, start + pageSize));
    records.forEach((record) => {
      record.hidden = !visible.has(record);
      record.classList.toggle("selected", record === selected);
    });
    search.value = state.q || "";
    organization.value = organizations.includes(requestedOrganization) ? requestedOrganization : "";
    period.value = [...period.options].some((option) => option.value === requestedPeriod) ? requestedPeriod : "";
    topic.value = [...topic.options].some((option) => option.value === requestedTopic) ? requestedTopic : "";
    sort.value = requestedSort;
    pageSizeControl.value = String(pageSize);
    count.textContent = matching.length ? `${start + 1} to ${Math.min(start + pageSize, matching.length)} of ${matching.length} sources` : "No source records match the selected filters";
    routeMessage.hidden = !unknownSource;
    routeMessage.textContent = unknownSource ? `Source record “${state.source}” was not found. The catalogue remains available below.` : "";
    status.textContent = `Page ${page} of ${pageCount}`;
    previous.disabled = page <= 1;
    next.disabled = page >= pageCount;
    previous.dataset.page = String(page - 1);
    next.dataset.page = String(page + 1);
    clear.disabled = !(query || requestedOrganization || requestedPeriod || requestedTopic || requestedSort !== "title" || pageSize !== 25);
  }

  controller = createNavigationController({ page: "sources", render });
  searchForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    controller.transition({ q: search.value.trim() || null, page: "1", source: null, fragment: "evidence" });
  });
  organization?.addEventListener("change", () => controller.transition({ organization: organization.value || null, page: "1", source: null, fragment: "evidence" }));
  period?.addEventListener("change", () => controller.transition({ period: period.value || null, page: "1", source: null, fragment: "evidence" }));
  topic?.addEventListener("change", () => controller.transition({ topic: topic.value || null, page: "1", source: null, fragment: "evidence" }));
  sort?.addEventListener("change", () => controller.transition({ sort: sort.value === "title" ? null : sort.value, page: "1", source: null, fragment: "evidence" }));
  pageSizeControl?.addEventListener("change", () => controller.transition({ pageSize: pageSizeControl.value === "25" ? null : pageSizeControl.value, page: "1", source: null, fragment: "evidence" }));
  clear?.addEventListener("click", () => controller.transition({ q: null, organization: null, period: null, topic: null, sort: null, pageSize: null, page: "1", source: null, fragment: "evidence" }, { focus: "#source-search" }));
  previous?.addEventListener("click", () => controller.transition({ page: previous.dataset.page, source: null, fragment: "evidence" }));
  next?.addEventListener("click", () => controller.transition({ page: next.dataset.page, source: null, fragment: "evidence" }));
  controller.hydrate();
}
