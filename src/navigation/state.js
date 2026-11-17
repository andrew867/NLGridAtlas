const PAGE_KEYS = {
  index: [],
  network: ["register", "q", "sort", "dir", "page", "pageSize", "circuit", "voltages", "mapStation", "networkStation", "component", "layer", "open", "tab"],
  stations: ["collection", "station", "view", "q", "component", "layer", "open", "tab"],
  transmission: ["q", "open", "tab"],
  loads: ["q", "sort", "dir", "page", "pageSize", "open", "tab"],
  history: ["category", "from", "to", "event", "q", "sort", "dir", "page", "pageSize", "open"],
  telephone: ["open", "tab"],
  telecom: ["open", "tab"],
  sources: ["source", "ref", "returnTo", "q", "organization", "period", "topic", "sort", "dir", "page", "pageSize"]
};

const SET_KEYS = new Set(["component", "layer", "open", "tab"]);
const IDENTITY_KEYS = new Set(["collection", "station", "source", "view"]);
const PRESENTATION_DEFAULTS = { dir: "asc", page: "1", pageSize: "25" };
const PARAMETER_ORDER = [
  "collection", "station", "view", "register", "q", "organization", "period", "topic",
  "sort", "dir", "page", "pageSize", "category", "from", "to", "event", "circuit",
  "voltages", "mapStation", "networkStation", "source", "ref", "returnTo", "tab", "component", "layer", "open"
];

function valuesFor(params, key) {
  return params.getAll(key).map((value) => value.trim()).filter(Boolean);
}

function collapseScalar(values, key, messages, errors) {
  if (!values.length) return null;
  const unique = [...new Set(values)];
  if (unique.length === 1) return unique[0];
  if (IDENTITY_KEYS.has(key)) {
    errors.push({ key, code: "conflicting-identity", values: unique });
    return null;
  }
  messages.push(`${key} was reset because the URL supplied conflicting values.`);
  return PRESENTATION_DEFAULTS[key] ?? null;
}

function normalizeGrouped(values, key, errors) {
  const unique = [...new Set(values)].sort((a, b) => a.localeCompare(b));
  if (unique.includes("none") && unique.length > 1) {
    errors.push({ key, code: "mixed-none", values: unique });
    return [];
  }
  if (!["component", "tab"].includes(key)) return unique;
  const groups = new Map();
  for (const value of unique) {
    const separator = value.indexOf(":");
    if (separator < 1 || separator === value.length - 1) {
      errors.push({ key, code: "invalid-grouped-value", values: [value] });
      continue;
    }
    const group = value.slice(0, separator);
    const selected = value.slice(separator + 1);
    const existing = groups.get(group);
    if (existing && existing !== selected) {
      errors.push({ key, code: "conflicting-group", values: [existing, selected], group });
      groups.delete(group);
      continue;
    }
    groups.set(group, selected);
  }
  return [...groups.entries()].map(([group, value]) => `${group}:${value}`).sort((a, b) => a.localeCompare(b));
}

export function pageNameFromPath(pathname) {
  const filename = pathname.split("/").pop() || "index.html";
  return filename.replace(/\.html$/i, "") || "index";
}

export function parseRoute(input, page = null) {
  const baseUrl = globalThis.location?.href || "http://localhost/";
  const url = input instanceof URL ? new URL(input) : new URL(input, baseUrl);
  const pageName = page || pageNameFromPath(url.pathname);
  const allowed = new Set(PAGE_KEYS[pageName] || []);
  const messages = [];
  const errors = [];
  const state = { route: pageName, fragment: decodeURIComponent(url.hash.slice(1)), sets: {} };

  for (const key of PARAMETER_ORDER) {
    if (!allowed.has(key)) continue;
    const values = valuesFor(url.searchParams, key);
    if (SET_KEYS.has(key)) state.sets[key] = normalizeGrouped(values, key, errors);
    else state[key] = collapseScalar(values, key, messages, errors);
  }

  if (allowed.has("voltages")) {
    const raw = state.voltages;
    if (raw === "none") state.voltages = [];
    else if (raw) {
      const values = [...new Set(raw.split(",").map((value) => value.trim()).filter(Boolean))].sort();
      if (values.includes("none") && values.length > 1) {
        errors.push({ key: "voltages", code: "mixed-none", values });
        state.voltages = null;
      } else state.voltages = values;
    }
  }

  if (state.returnTo && !isAllowedReturnTo(state.returnTo, url)) {
    state.returnTo = null;
    messages.push("The return destination was removed because it is outside this atlas.");
  }

  for (const [key, fallback] of Object.entries(PRESENTATION_DEFAULTS)) {
    if (!allowed.has(key)) continue;
    if (!state[key]) state[key] = fallback;
  }
  const pageNumber = Number.parseInt(state.pageSize ? state.page : "1", 10);
  if (state.page && (!Number.isInteger(pageNumber) || pageNumber < 1)) {
    state.page = "1";
    messages.push("The requested page number was reset to 1.");
  }

  return { url, state, messages, errors, allowed };
}

export function serializeRoute(state, baseUrl = window.location.href) {
  const url = new URL(baseUrl);
  url.search = "";
  const allowed = new Set(PAGE_KEYS[state.route] || []);
  for (const key of PARAMETER_ORDER) {
    if (!allowed.has(key)) continue;
    if (SET_KEYS.has(key)) {
      for (const value of [...new Set(state.sets?.[key] || [])].sort((a, b) => a.localeCompare(b))) url.searchParams.append(key, value);
      continue;
    }
    const value = state[key];
    if (value == null || value === "") continue;
    if (key === "voltages" && Array.isArray(value)) {
      url.searchParams.set(key, value.length ? [...new Set(value)].sort().join(",") : "none");
      continue;
    }
    if (PRESENTATION_DEFAULTS[key] === String(value)) continue;
    url.searchParams.set(key, String(value));
  }
  url.hash = state.fragment ? `#${encodeURIComponent(state.fragment)}` : "";
  return url;
}

export function updateRoute(current, patch) {
  const next = {
    ...current,
    ...patch,
    sets: { ...(current.sets || {}), ...(patch.sets || {}) }
  };
  return next;
}

export function isAllowedReturnTo(value, currentUrl = new URL(window.location.href)) {
  try {
    const candidate = new URL(value, currentUrl);
    const basePath = currentUrl.pathname.slice(0, currentUrl.pathname.lastIndexOf("/") + 1);
    return candidate.origin === currentUrl.origin && candidate.pathname.startsWith(basePath) && !candidate.pathname.includes(".." );
  } catch {
    return false;
  }
}

export const routeKeysByPage = PAGE_KEYS;
