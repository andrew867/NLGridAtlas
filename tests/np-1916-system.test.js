import { readAtlasHtmlSync } from "./page-fixture.js";
import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { staticClaims, timeline } from "../src/data.js";

test("the 1916 archive search does not turn numeric matches into system events", () => {
  assert.equal(timeline.some((entry) => entry.date === "1916"), false);
  assert.equal(staticClaims.some((claim) => claim.id === "np-1916-system-record"), false);
  const html = readAtlasHtmlSync();
  assert.doesNotMatch(html, /data-claim-id="np-1916-system-record"/);
});

test("1916 research records the customer-number false positive", () => {
  const record = fs.readFileSync(new URL("../research/NP_1916_SYSTEM_RECORD.md", import.meta.url), "utf8");
  assert.match(record, /customer 1916 in a 2003 rate-impact table/);
  assert.match(record, /not a date or utility-plant record/);
  assert.match(record, /no placement dated 1916/);

  const workItems = JSON.parse(fs.readFileSync(new URL("../docs/work-items.json", import.meta.url), "utf8"));
  const item = workItems.work_items.find((candidate) => candidate.id === "NPREG-112");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.completion_evidence, ["research/NP_1916_SYSTEM_RECORD.md", "tests/np-1916-system.test.js"]);
});
