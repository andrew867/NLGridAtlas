import { sources as gridSources } from "../data.js";
import { telephoneSources } from "../telephone-data.js";

const sources = [...gridSources, ...telephoneSources];
export const sourceById = new Map(sources.map((source) => [source.id, source]));

function normalizeUrl(value) {
  try {
    const url = new URL(value, window.location.href);
    url.hash = "";
    url.hostname = url.hostname.replace(/^www\./, "").replace("pub.nl.ca", "pub.nf.ca");
    return url.href.toLowerCase();
  } catch {
    return String(value || "").toLowerCase();
  }
}

const byUrl = new Map();
for (const source of sources) {
  const key = normalizeUrl(source.url);
  const records = byUrl.get(key) || [];
  records.push(source);
  byUrl.set(key, records);
}

export function resolveCitation(link) {
  const explicit = link.dataset.sourceId ? sourceById.get(link.dataset.sourceId) : null;
  const documentUrl = link.dataset.documentUrl || link.href;
  const candidates = explicit ? [explicit] : (byUrl.get(normalizeUrl(documentUrl)) || []);
  const label = link.dataset.locator || link.textContent.trim();
  const source = candidates.find((candidate) => label.toLowerCase().includes(String(candidate.pages || "").toLowerCase())) || candidates[0] || null;
  return {
    id: link.dataset.citationId || `ref-${simpleHash(`${link.href}|${label}|${link.closest("[id]")?.id || "page"}`)}`,
    source,
    locator: label,
    contextId: link.closest("[id]")?.id || document.body.dataset.page,
    documentUrl
  };
}

export function allSources() {
  return sources;
}

export function simpleHash(value) {
  let hash = 2166136261;
  for (const character of value) {
    hash ^= character.codePointAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}
