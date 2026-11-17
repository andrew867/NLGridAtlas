import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const inputPath = path.join(root, "index.html");
const outputPath = path.join(root, "research", "derived", "ux-baseline-inventory.json");
const html = await readFile(inputPath, "utf8");

const unique = (values) => [...new Set(values)].sort((a, b) => a.localeCompare(b));
const matches = (pattern, group = 1) => [...html.matchAll(pattern)].map((match) => match[group]);
const externalCitations = [...html.matchAll(/<a\b[^>]*class="[^"]*(?:source-tag|evidence-link)[^"]*"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)]
  .map((match, index) => ({
    id: `legacy-static-citation-${String(index + 1).padStart(4, "0")}`,
    href: match[1],
    label: match[2].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
  }));

const inventory = {
  schemaVersion: 1,
  capturedAt: "2026-11-17",
  source: {
    path: "index.html",
    bytes: Buffer.byteLength(html),
    sha256: createHash("sha256").update(html).digest("hex")
  },
  counts: {
    ids: unique(matches(/\bid="([^"]+)"/g)).length,
    localFragmentLinks: matches(/\bhref="#([^"]+)"/g).length,
    sourceCitationLinks: externalCitations.length,
    diagrams: unique(matches(/\bdata-diagram="([^"]+)"/g)).length,
    components: unique(matches(/\bdata-component="([^"]+)"/g)).length,
    terminalSelectors: unique(matches(/\bdata-hydro-terminal-record="([^"]+)"/g)).length,
    stationSelectors: unique(matches(/\bdata-station-profile="([^"]+)"/g)).length,
    disclosures: matches(/<details\b/g, 0).length,
    images: matches(/<img\b/g, 0).length
  },
  ids: unique(matches(/\bid="([^"]+)"/g)),
  localFragmentTargets: unique(matches(/\bhref="#([^"]+)"/g)),
  diagrams: unique(matches(/\bdata-diagram="([^"]+)"/g)),
  components: unique(matches(/\bdata-component="([^"]+)"/g)),
  terminalSelectors: unique(matches(/\bdata-hydro-terminal-record="([^"]+)"/g)),
  stationSelectors: unique(matches(/\bdata-station-profile="([^"]+)"/g)),
  imageReferences: unique(matches(/<img\b[^>]*\bsrc="([^"]+)"/g)),
  citations: externalCitations,
  destinationPages: {
    top: "index.html",
    handbook: "network.html",
    network: "stations.html",
    substations: "stations.html",
    transmission: "transmission.html",
    loads: "loads.html",
    timeline: "history.html",
    telephone: "telephone.html",
    telecom: "telecom.html",
    evidence: "sources.html"
  }
};

await writeFile(outputPath, `${JSON.stringify(inventory, null, 2)}\n`, "utf8");
console.log(`Wrote ${path.relative(root, outputPath)} with ${inventory.counts.ids} targets and ${inventory.counts.sourceCitationLinks} static citations.`);
