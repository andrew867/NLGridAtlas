import { readAtlasHtmlSync } from "./page-fixture.js";
import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { staticClaims, timeline } from "../src/data.js";

test("the 1912 archive search does not turn numeric matches into system events", () => {
  assert.equal(timeline.some((entry) => entry.date === "1912"), false);
  assert.equal(staticClaims.some((claim) => claim.id === "np-1912-system-record"), false);
  const html = readAtlasHtmlSync();
  assert.doesNotMatch(html, /data-claim-id="np-1912-system-record"/);
});

test("1912 research records the address false positive", () => {
  const record = fs.readFileSync(new URL("../research/NP_1912_SYSTEM_RECORD.md", import.meta.url), "utf8");
  assert.match(record, /1912 West Anderson Lane/);
  assert.match(record, /not a year or Newfoundland utility record/);
  assert.match(record, /no placement dated 1912/);

  const workItems = JSON.parse(fs.readFileSync(new URL("../docs/work-items.json", import.meta.url), "utf8"));
  const item = workItems.work_items.find((candidate) => candidate.id === "NPREG-116");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.completion_evidence, ["research/NP_1912_SYSTEM_RECORD.md", "tests/np-1912-system.test.js"]);
});
