import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { sources as gridSources } from "../src/data.js";
import { telephoneSources } from "../src/telephone-data.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pageFiles = ["index.html", "network.html", "stations.html", "transmission.html", "loads.html", "history.html", "telephone.html", "telecom.html"];
const registeredSources = [...gridSources, ...telephoneSources];

function escapeHtml(value) {
  return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

function decodeHtml(value) {
  return String(value).replaceAll("&amp;", "&").replaceAll("&quot;", '"').replaceAll("&#039;", "'").replaceAll("&lt;", "<").replaceAll("&gt;", ">");
}

function textContent(value) {
  return decodeHtml(value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

function normalizeUrl(value) {
  try {
    const url = new URL(value, "https://atlas.invalid/");
    url.hash = "";
    const hostname = url.hostname.replace(/^www\./, "").replace("pub.nl.ca", "pub.nf.ca");
    return `${hostname}${decodeURIComponent(url.pathname)}${url.search}`.toLowerCase();
  } catch {
    return String(value || "").toLowerCase();
  }
}

function hash(value) {
  return createHash("sha256").update(value).digest("hex").slice(0, 12);
}

function attribute(attributes, name) {
  return attributes.match(new RegExp(`\\b${name}="([^"]*)"`, "i"))?.[1] || null;
}

function setAttribute(attributes, name, value) {
  const escaped = escapeHtml(value);
  const pattern = new RegExp(`\\s+${name}="[^"]*"`, "i");
  return pattern.test(attributes) ? attributes.replace(pattern, ` ${name}="${escaped}"`) : `${attributes} ${name}="${escaped}"`;
}

function removeAttribute(attributes, name) {
  return attributes.replace(new RegExp(`\\s+${name}="[^"]*"`, "gi"), "");
}

const sourceById = new Map(registeredSources.map((source) => [source.id, source]));
const sourcesByUrl = new Map();
for (const source of registeredSources) {
  const key = normalizeUrl(source.url);
  const records = sourcesByUrl.get(key) || [];
  records.push(source);
  sourcesByUrl.set(key, records);
}

const occurrencesBySource = new Map();
const unresolvedSources = new Map();
const manifestOccurrences = [];

for (const pageFile of pageFiles) {
  const filePath = path.join(root, pageFile);
  let html = await readFile(filePath, "utf8");
  html = html.replace(/<([a-z][\w-]*)([^>]*\bdata-claim-id="([^"]+)"[^>]*)>/gi, (full, tag, attributes, claimId) => {
    if (/\s+id="[^"]+"/i.test(attributes)) return full;
    return `<${tag}${setAttribute(attributes, "id", claimId)}>`;
  });
  let ordinal = 0;
  let cursor = 0;
  let currentContext = "main";
  const tokenPattern = /\sid="([^"]+)"|<a\b([^>]*)>([\s\S]*?)<\/a>/gi;
  let output = "";
  for (const match of html.matchAll(tokenPattern)) {
    if (match[1]) {
      currentContext = match[1];
      continue;
    }
    const full = match[0];
    let attributes = match[2];
    const inner = match[3];
    const classes = attribute(attributes, "class") || "";
    if (!/(?:^|\s)(?:source-tag|evidence-link)(?:\s|$)/.test(classes)) continue;
    const originalHref = attribute(attributes, "data-document-url") || attribute(attributes, "href");
    if (!originalHref) continue;
    const label = textContent(inner);
    const explicitId = attribute(attributes, "data-source-id");
    let source = explicitId ? sourceById.get(explicitId) : null;
    if (!source) source = sourcesByUrl.get(normalizeUrl(originalHref))?.[0] || null;
    if (!source) {
      const id = `static-${hash(normalizeUrl(originalHref))}`;
      if (!unresolvedSources.has(id)) {
        let organization = "Organization not recorded";
        try { organization = new URL(originalHref).hostname; } catch {}
        unresolvedSources.set(id, {
          id,
          year: "Not recorded",
          organization,
          title: label || originalHref,
          topics: [],
          pages: label || "Locator not recorded",
          status: "static reference",
          url: originalHref
        });
      }
      source = unresolvedSources.get(id);
      sourceById.set(id, source);
    }
    ordinal += 1;
    const citationId = attribute(attributes, "data-citation-id") || `citation-${hash(`${pageFile}|${currentContext}|${ordinal}|${source.id}|${label}`)}`;
    const sourceHref = `./sources.html?source=${encodeURIComponent(source.id)}&ref=${encodeURIComponent(citationId)}#source-${encodeURIComponent(source.id)}`;
    attributes = setAttribute(attributes, "href", sourceHref);
    attributes = setAttribute(attributes, "data-document-url", originalHref);
    attributes = setAttribute(attributes, "data-source-id", source.id);
    attributes = setAttribute(attributes, "data-citation-id", citationId);
    attributes = setAttribute(attributes, "data-locator", label);
    attributes = removeAttribute(removeAttribute(attributes, "target"), "rel");
    const replacement = `<a${attributes}>${inner}</a>`;
    output += html.slice(cursor, match.index) + replacement;
    cursor = match.index + full.length;
    const occurrence = { id: citationId, sourceId: source.id, page: pageFile, contextId: currentContext, locator: label };
    const sourceOccurrences = occurrencesBySource.get(source.id) || [];
    sourceOccurrences.push(occurrence);
    occurrencesBySource.set(source.id, sourceOccurrences);
    manifestOccurrences.push(occurrence);
  }
  if (cursor) html = output + html.slice(cursor);
  await writeFile(filePath, html, "utf8");
}

const allSources = [...registeredSources, ...unresolvedSources.values()].sort((left, right) => {
  const title = String(left.title).localeCompare(String(right.title));
  return title || left.id.localeCompare(right.id);
});

const recordMarkup = allSources.map((source) => {
  const occurrences = occurrencesBySource.get(source.id) || [];
  const topics = source.topics || [];
  const search = [source.id, source.title, source.organization, source.year, ...topics].join(" ").toLowerCase();
  const numericYear = String(source.year || "").match(/\b(1[0-9]{3}|20[0-9]{2})\b/)?.[1] || "";
  const occurrenceMarkup = occurrences.length
    ? `<details class="source-occurrences"><summary>Cited in the atlas, ${occurrences.length} occurrence${occurrences.length === 1 ? "" : "s"}</summary><ul>${occurrences.map((item) => `<li><a href="./${escapeHtml(item.page)}#${escapeHtml(item.contextId)}">${escapeHtml(item.page.replace(".html", ""))}, ${escapeHtml(item.locator)}</a></li>`).join("")}</ul></details>`
    : "";
  const provenanceMarkup = `<details class="source-provenance"><summary>Provenance details</summary><dl>
    <div><dt>Original URL</dt><dd><a href="${escapeHtml(source.url)}">${escapeHtml(source.url)}</a></dd></div>
    <div><dt>Retrieval date</dt><dd>${escapeHtml(source.retrievedAt || source.retrieval_date || "Not recorded")}</dd></div>
    <div><dt>Preserved filename</dt><dd>${escapeHtml(source.localFilename || source.local_filename || "Not recorded")}</dd></div>
    <div><dt>SHA-256</dt><dd>${escapeHtml(source.sha256 || "Not recorded")}</dd></div>
  </dl></details>`;
  return `<article class="source-record" id="source-${escapeHtml(source.id)}" data-source-id="${escapeHtml(source.id)}" data-search="${escapeHtml(search)}" data-title="${escapeHtml(source.title)}" data-organization="${escapeHtml(source.organization)}" data-year="${escapeHtml(numericYear)}" data-topics="${escapeHtml(topics.join("|"))}">
    <div class="source-index">${escapeHtml(source.id)}</div>
    <div><span class="source-org">${escapeHtml(source.organization)} / ${escapeHtml(source.year)} / ${escapeHtml(source.status)}</span><h3>${escapeHtml(source.title)}</h3><p>${escapeHtml(topics.join(" · "))}</p>${occurrenceMarkup}${provenanceMarkup}</div>
    <div class="source-action"><span>${escapeHtml(source.pages || "Locator not recorded")}</span><a href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer">Open document <span aria-hidden="true">↗</span></a></div>
  </article>`;
}).join("\n");

const sourcesPath = path.join(root, "sources.html");
let sourceHtml = await readFile(sourcesPath, "utf8");
const generatedRecords = `<!-- GENERATED SOURCE RECORDS START -->\n${recordMarkup}\n<!-- GENERATED SOURCE RECORDS END -->`;
if (sourceHtml.includes("<!-- GENERATED SOURCE RECORDS START -->")) {
  sourceHtml = sourceHtml.replace(/<!-- GENERATED SOURCE RECORDS START -->[\s\S]*?<!-- GENERATED SOURCE RECORDS END -->/, generatedRecords);
} else {
  sourceHtml = sourceHtml.replace('<div id="source-list" class="source-list" aria-live="polite"></div>', `<div id="source-list" class="source-list" aria-live="polite">\n${generatedRecords}\n</div>`);
}
await writeFile(sourcesPath, sourceHtml, "utf8");

const manifest = {
  schemaVersion: 1,
  generatedAt: "2026-11-17",
  sourceCount: allSources.length,
  registeredSourceCount: registeredSources.length,
  staticReferenceSourceCount: unresolvedSources.size,
  occurrenceCount: manifestOccurrences.length,
  occurrences: manifestOccurrences
};
await writeFile(path.join(root, "research", "derived", "source-citation-registry.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(`Generated ${allSources.length} source records and rewrote ${manifestOccurrences.length} citation occurrences; ${unresolvedSources.size} static URLs were not in the structured registry.`);
