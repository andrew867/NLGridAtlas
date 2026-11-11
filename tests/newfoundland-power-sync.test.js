import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const script = await readFile(
  new URL("../scripts/sync_newfoundland_power_regulatory.py", import.meta.url),
  "utf8",
);

test("Newfoundland Power mirror is limited to direct regulation-page PDFs", () => {
  assert.match(script, /REGULATION_PAGE = "https:\/\/www\.newfoundlandpower\.com\/en\/About\/Who-We-Are\/Regulation"/);
  assert.match(script, /PDF_PATH_RE/);
  assert.match(script, /ALLOWED_HOSTS/);
  assert.match(script, /source_page/);
});

test("Newfoundland Power mirror records hashes and rejects non-PDF responses", () => {
  assert.match(script, /sha256/);
  assert.match(script, /first\.startswith\(b"%PDF-"\)/);
  assert.match(script, /downloads\.jsonl/);
  assert.match(script, /\.part/);
});
