import { readFile, readFileSync } from "node:fs";
import { promisify } from "node:util";

const readFileAsync = promisify(readFile);
const pageNames = ["index", "network", "stations", "transmission", "loads", "history", "telephone", "telecom"];

export async function readAtlasHtml() {
  const pages = await Promise.all(pageNames.map(async (name) => {
    const html = await readFileAsync(new URL(`../${name}.html`, import.meta.url), "utf8");
    return `<!-- ${name}.html -->\n${html}`;
  }));
  return pages.join("\n");
}

export function readAtlasHtmlSync() {
  return pageNames.map((name) => `<!-- ${name}.html -->\n${readFileSync(new URL(`../${name}.html`, import.meta.url), "utf8")}`).join("\n");
}
