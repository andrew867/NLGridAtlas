import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { buildPinnedEvidenceManifest, manifestPath } from "./evidence-manifest-lib.mjs";

const expected = await buildPinnedEvidenceManifest();
const recorded = JSON.parse(await readFile(manifestPath, "utf8"));
assert.deepEqual(recorded, expected, "Pinned evidence manifest is stale. Run npm run build:evidence-manifest.");

for (const file of expected.files) {
  console.log(`${file.sha256}  ${file.bytes}  ${file.local_path}`);
}
console.log(`Verified ${expected.file_count} pinned PDFs and ${expected.total_bytes} bytes.`);

