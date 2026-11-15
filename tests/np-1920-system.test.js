import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { staticClaims, timeline } from "../src/data.js";

test("unidentified 1920 accounting placements do not become system events", () => {
  assert.equal(timeline.some((entry) => entry.date === "1920"), false);
  assert.equal(staticClaims.some((claim) => claim.id === "np-1920-system-record"), false);
  const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
  assert.doesNotMatch(html, /data-claim-id="np-1920-system-record"/);
});

test("1920 research preserves three account classes without inventing locations", () => {
  const record = fs.readFileSync(new URL("../research/NP_1920_SYSTEM_RECORD.md", import.meta.url), "utf8");
  assert.match(record, /\$2,400 in account 323\.00/);
  assert.match(record, /\$13,548 in account 324\.00/);
  assert.match(record, /\$885 in account 341\.00/);
  assert.match(record, /not assigned to named atlas assets/);

  const workItems = JSON.parse(fs.readFileSync(new URL("../docs/work-items.json", import.meta.url), "utf8"));
  const item = workItems.work_items.find((candidate) => candidate.id === "NPREG-108");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.completion_evidence, ["research/NP_1920_SYSTEM_RECORD.md", "tests/np-1920-system.test.js"]);
});
