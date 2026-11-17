import { readAtlasHtmlSync } from "./page-fixture.js";
import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { staticClaims, timeline } from "../src/data.js";

test("1922 source range does not become a commissioning event", () => {
  assert.equal(timeline.some((entry) => entry.date === "1922"), false);
  assert.equal(staticClaims.some((claim) => claim.id === "np-1922-system-record"), false);
  const html = readAtlasHtmlSync();
  assert.doesNotMatch(html, /data-claim-id="np-1922-system-record"/);
});

test("1922 research retains the Seal Cove conflict", () => {
  const record = fs.readFileSync(new URL("../research/NP_1922_SYSTEM_RECORD.md", import.meta.url), "utf8");
  assert.match(record, /two units, years 1922 to 1927 and 3,150 kW/);
  assert.match(record, /does not establish a 1922 Seal Cove commissioning event/);
  assert.match(record, /no separate 1922 public card or timeline entry/);

  const workItems = JSON.parse(fs.readFileSync(new URL("../docs/work-items.json", import.meta.url), "utf8"));
  const item = workItems.work_items.find((candidate) => candidate.id === "NPREG-106");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.completion_evidence, ["research/NP_1922_SYSTEM_RECORD.md", "tests/np-1922-system.test.js"]);
});
