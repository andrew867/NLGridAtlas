import { readAtlasHtmlSync } from "./page-fixture.js";
import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { staticClaims, timeline } from "../src/data.js";

test("1927 source ranges do not become commissioning events", () => {
  assert.equal(timeline.some((entry) => entry.date === "1927"), false);
  assert.equal(staticClaims.some((claim) => claim.id === "np-1927-system-record"), false);
  const html = readAtlasHtmlSync();
  assert.doesNotMatch(html, /data-claim-id="np-1927-system-record"/);
});

test("1927 research preserves the Seal Cove and Petty Harbour conflicts", () => {
  const workItems = JSON.parse(fs.readFileSync(new URL("../docs/work-items.json", import.meta.url), "utf8"));
  const item = workItems.work_items.find((candidate) => candidate.id === "NPREG-101");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.completion_evidence, ["research/NP_1927_SYSTEM_RECORD.md", "tests/np-1927-system.test.js"]);

  const record = fs.readFileSync(new URL("../research/NP_1927_SYSTEM_RECORD.md", import.meta.url), "utf8");
  assert.match(record, /Seal Cove plant with two units, years 1922 to 1927/);
  assert.match(record, /does not establish that a Seal Cove unit entered service in 1927/);
  assert.match(record, /three commissioning years as 1900, 1908 and 1926/);
  assert.match(record, /no separate 1927 public card or timeline entry/);
});
