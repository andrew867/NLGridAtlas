import { createHash } from "node:crypto";
import { readFile, readdir, stat } from "node:fs/promises";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = new URL("../research/sources/", import.meta.url);

async function walk(directory) {
  const paths = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) paths.push(...await walk(path));
    if (entry.isFile() && entry.name.toLowerCase().endsWith(".pdf")) paths.push(path);
  }
  return paths;
}

const basePath = fileURLToPath(root);
const files = await walk(basePath);

if (!files.length) {
  console.error("No source PDFs were found in research/sources.");
  process.exitCode = 1;
} else {
  for (const file of files.sort()) {
    const content = await readFile(file);
    const digest = createHash("sha256").update(content).digest("hex");
    const details = await stat(file);
    console.log(`${digest}  ${details.size}  ${relative(basePath, file).replaceAll("\\", "/")}`);
  }
}

