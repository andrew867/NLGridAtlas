import { readAtlasHtmlSync } from "./page-fixture.js";
import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { staticClaims, timeline } from "../src/data.js";

test("unidentified 1919 accounting placements do not become system events", () => {
  assert.equal(timeline.some((entry) => entry.date === "1919"), false);
  assert.equal(staticClaims.some((claim) => claim.id === "np-1919-system-record"), false);
  const html = readAtlasHtmlSync();
  assert.doesNotMatch(html, /data-claim-id="np-1919-system-record"/);
});

test("1919 research preserves three account classes without inventing locations", () => {
  const record = fs.readFileSync(new URL("../research/NP_1919_SYSTEM_RECORD.md", import.meta.url), "utf8");
  assert.match(record, /\$9,750 in account 323\.00/);
  assert.match(record, /\$32,000 in account 324\.00/);
  assert.match(record, /\$8,770 in account 326\.00/);
  assert.match(record, /not assigned to named atlas assets/);

  const workItems = JSON.parse(fs.readFileSync(new URL("../docs/work-items.json", import.meta.url), "utf8"));
  const item = workItems.work_items.find((candidate) => candidate.id === "NPREG-109");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.completion_evidence, ["research/NP_1919_SYSTEM_RECORD.md", "tests/np-1919-system.test.js"]);
});
