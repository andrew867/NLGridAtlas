import { writeFile } from "node:fs/promises";
import { buildPinnedEvidenceManifest, manifestPath } from "./evidence-manifest-lib.mjs";

const manifest = await buildPinnedEvidenceManifest();
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(`Wrote ${manifest.file_count} pinned PDFs and ${manifest.total_bytes} bytes to ${manifestPath}`);
