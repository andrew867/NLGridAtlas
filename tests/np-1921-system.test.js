import { readAtlasHtmlSync } from "./page-fixture.js";
import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { staticClaims, timeline } from "../src/data.js";

test("unidentified 1921 accounting placement does not become a system event", () => {
  assert.equal(timeline.some((entry) => entry.date === "1921"), false);
  assert.equal(staticClaims.some((claim) => claim.id === "np-1921-system-record"), false);
  const html = readAtlasHtmlSync();
  assert.doesNotMatch(html, /data-claim-id="np-1921-system-record"/);
});

test("1921 research preserves the accounting evidence and its identification limit", () => {
  const record = fs.readFileSync(new URL("../research/NP_1921_SYSTEM_RECORD.md", import.meta.url), "utf8");
  assert.match(record, /\$15,300 placement in 1921 under account 371\.10/);
  assert.match(record, /does not identify an asset, site or operating function/);
  assert.match(record, /no separate 1921 public card or timeline entry/);

  const workItems = JSON.parse(fs.readFileSync(new URL("../docs/work-items.json", import.meta.url), "utf8"));
  const item = workItems.work_items.find((candidate) => candidate.id === "NPREG-107");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.completion_evidence, ["research/NP_1921_SYSTEM_RECORD.md", "tests/np-1921-system.test.js"]);
});
