import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pages = ["index.html", "network.html", "stations.html", "transmission.html", "loads.html", "history.html", "telephone.html", "telecom.html", "sources.html"];
const documents = new Map(await Promise.all(pages.map(async (name) => [name, await readFile(path.join(root, name), "utf8")])));
const ids = new Map([...documents].map(([name, html]) => [name, new Set([...html.matchAll(/\sid=["']([^"']+)["']/g)].map((match) => match[1]))]));
const failures = [];
let checked = 0;

for (const [sourcePage, html] of documents) {
  for (const match of html.matchAll(/\shref=["']([^"']+)["']/g)) {
    const raw = match[1].replaceAll("&amp;", "&");
    if (!raw || /^(?:https?:|mailto:|tel:|javascript:)/i.test(raw)) continue;
    const parsed = new URL(raw, `https://atlas.invalid/${sourcePage}`);
    const targetPage = parsed.pathname.split("/").pop() || sourcePage;
    if (!targetPage.endsWith(".html")) {
      const relativeAsset = decodeURIComponent(parsed.pathname.slice(1));
      try { await stat(path.join(root, relativeAsset)); }
      catch {
        try { await stat(path.join(root, "public", relativeAsset)); }
        catch { failures.push(`${sourcePage}: missing asset ${raw}`); }
      }
      checked += 1;
      continue;
    }
    if (!documents.has(targetPage)) {
      failures.push(`${sourcePage}: missing page ${raw}`);
      continue;
    }
    if (parsed.hash) {
      const fragment = decodeURIComponent(parsed.hash.slice(1));
      if (!ids.get(targetPage).has(fragment)) failures.push(`${sourcePage}: missing target ${targetPage}#${fragment}`);
    }
    checked += 1;
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else console.log(`Checked ${checked.toLocaleString("en-CA")} internal page, fragment and asset links across ${pages.length} entries.`);
