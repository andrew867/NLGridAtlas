import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const pinned = JSON.parse(await readFile(new URL("../research/pinned-evidence-manifest.json", import.meta.url), "utf8"));
const external = JSON.parse(await readFile(new URL("../research/external-archive-manifest.json", import.meta.url), "utf8"));
const catalog = JSON.parse(await readFile(new URL("../research/catalog.json", import.meta.url), "utf8"));

test("pinned evidence manifest covers the committed PDF set", () => {
  assert.equal(pinned.file_count, 66);
  assert.equal(pinned.total_bytes, 222565583);
  assert.equal(pinned.files.length, pinned.file_count);
  assert.equal(new Set(pinned.files.map((file) => file.local_path)).size, pinned.file_count);
  for (const file of pinned.files) {
    assert.match(file.local_path, /^sources\/.+\.pdf$/i);
    assert.match(file.sha256, /^[0-9a-f]{64}$/);
    assert.ok(file.bytes > 0);
  }
});

test("every catalog document has a pinned digest", () => {
  const byPath = new Map(pinned.files.map((file) => [file.local_path, file]));
  for (const document of catalog.documents) {
    assert.match(document.sha256, /^[0-9a-f]{64}$/);
    assert.equal(byPath.get(document.local_path)?.sha256, document.sha256, document.id);
  }
});

test("external archive record preserves exact local snapshot counts", () => {
  const byId = new Map(external.archives.map((archive) => [archive.id, archive]));
  assert.equal(byId.get("pub").file_count, 52931);
  assert.equal(byId.get("pub").document_count, 49293);
  assert.equal(byId.get("pub").page_records, 504049);
  assert.equal(byId.get("nlhydro-uploads").pdf_count, 2521);
  assert.equal(byId.get("newfoundland-power-direct").pdf_count, 13);
  assert.equal(external.public_snapshot_base_url, null);
});
