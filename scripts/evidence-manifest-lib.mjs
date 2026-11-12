import { createHash } from "node:crypto";
import { readFile, readdir, stat } from "node:fs/promises";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

export const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
export const sourcesRoot = join(repositoryRoot, "research", "sources");
export const catalogPath = join(repositoryRoot, "research", "catalog.json");
export const manifestPath = join(repositoryRoot, "research", "pinned-evidence-manifest.json");

async function walkPdfs(directory) {
  const paths = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) paths.push(...await walkPdfs(path));
    if (entry.isFile() && entry.name.toLowerCase().endsWith(".pdf")) paths.push(path);
  }
  return paths;
}

function slash(path) {
  return path.replaceAll("\\", "/");
}

export async function readCatalog() {
  return JSON.parse(await readFile(catalogPath, "utf8"));
}

export async function buildPinnedEvidenceManifest() {
  const catalog = await readCatalog();
  const catalogByPath = new Map();
  for (const document of catalog.documents) {
    const path = document.local_path;
    if (!path?.startsWith("sources/") || !path.toLowerCase().endsWith(".pdf")) {
      throw new Error(`Catalog document ${document.id} has an invalid local_path.`);
    }
    const ids = catalogByPath.get(path) || [];
    ids.push(document.id);
    catalogByPath.set(path, ids);
  }

  const files = [];
  for (const path of (await walkPdfs(sourcesRoot)).sort()) {
    const content = await readFile(path);
    const localPath = `sources/${slash(relative(sourcesRoot, path))}`;
    files.push({
      local_path: localPath,
      bytes: (await stat(path)).size,
      sha256: createHash("sha256").update(content).digest("hex"),
      catalog_ids: catalogByPath.get(localPath) || []
    });
  }

  const filePaths = new Set(files.map((file) => file.local_path));
  for (const document of catalog.documents) {
    if (!filePaths.has(document.local_path)) {
      throw new Error(`Catalog document ${document.id} is missing ${document.local_path}.`);
    }
    if (!/^[0-9a-f]{64}$/.test(document.sha256 || "")) {
      throw new Error(`Catalog document ${document.id} has no SHA-256 digest.`);
    }
    const file = files.find((item) => item.local_path === document.local_path);
    if (file.sha256 !== document.sha256) {
      throw new Error(`Catalog digest mismatch for ${document.id}.`);
    }
  }

  return {
    schema_version: 1,
    scope: "All PDF files committed under research/sources",
    source_catalog: "research/catalog.json",
    file_count: files.length,
    total_bytes: files.reduce((sum, file) => sum + file.bytes, 0),
    files
  };
}
