import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pages = ["index.html", "network.html", "stations.html", "transmission.html", "loads.html", "history.html", "telephone.html", "telecom.html", "sources.html"];
const inventory = JSON.parse(await readFile(path.join(root, "research", "derived", "ux-baseline-inventory.json"), "utf8"));
const pageMarkup = new Map(await Promise.all(pages.map(async (page) => [page, await readFile(path.join(root, page), "utf8")])));
const idsByPage = new Map([...pageMarkup].map(([page, html]) => [page, new Set([...html.matchAll(/\s+id="([^"]+)"/g)].map((match) => match[1]))]));
const runtimeDestinations = new Map([
  ["bde-2026-frazil-event", "loads.html"],
  ["gnp-2001-forecast-comparison", "loads.html"],
  ["gnp-2021-2025-reliability", "loads.html"],
  ["historical-vhf-system", "telecom.html"],
  ["np-2014-mobile-radio", "telecom.html"],
  ["island-ac-backbone-2018", "network.html"],
  ...[
    "glendale-substation-one-line", "goulds-substation-one-line", "hardwoods-substation-one-line",
    "hardwoods-terminal-one-line", "holyrood-historical-one-line", "kenmount-substation-one-line",
    "kings-bridge-substation-one-line", "long-pond-substation-one-line", "memorial-substation-one-line",
    "oxen-pond-substation-one-line", "oxen-pond-terminal-one-line", "pepperrell-substation-one-line",
    "pulpit-rock-substation-one-line", "ridge-road-substation-one-line", "st-johns-main-2015-one-line",
    "stamps-lane-substation-one-line", "virginia-waters-substation-one-line", "western-avalon-terminal-one-line"
  ].map((id) => [id, "stations.html"])
]);

const records = inventory.ids.map((id) => {
  const staticDestinations = pages.filter((page) => idsByPage.get(page).has(id));
  const runtimeDestination = runtimeDestinations.get(id);
  const destinations = runtimeDestination ? [...new Set([...staticDestinations, runtimeDestination])] : staticDestinations;
  return { id, destinations, retained: destinations.length > 0, basis: staticDestinations.length ? "static HTML" : runtimeDestination ? "generated from src/data.js" : "missing" };
});

const manifest = {
  schemaVersion: 1,
  generatedAt: "2026-11-17",
  baselineIdCount: records.length,
  retainedIdCount: records.filter((record) => record.retained).length,
  missingIdCount: records.filter((record) => !record.retained).length,
  records
};

await writeFile(path.join(root, "research", "derived", "content-retention-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(`Retained ${manifest.retainedIdCount} of ${manifest.baselineIdCount} baseline IDs; ${manifest.missingIdCount} are missing.`);
if (manifest.missingIdCount) process.exitCode = 1;
