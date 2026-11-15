import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { staticClaims, timeline } from "../src/data.js";

test("the 1915 archive search does not turn numeric matches into system events", () => {
  assert.equal(timeline.some((entry) => entry.date === "1915"), false);
  assert.equal(staticClaims.some((claim) => claim.id === "np-1915-system-record"), false);
  const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
  assert.doesNotMatch(html, /data-claim-id="np-1915-system-record"/);
});

test("1915 research records the penstock-length false positive", () => {
  const record = fs.readFileSync(new URL("../research/NP_1915_SYSTEM_RECORD.md", import.meta.url), "utf8");
  assert.match(record, /1,915 m penstock installed in 1983/);
  assert.match(record, /number is a length, not a year/);
  assert.match(record, /no placement dated 1915/);

  const workItems = JSON.parse(fs.readFileSync(new URL("../docs/work-items.json", import.meta.url), "utf8"));
  const item = workItems.work_items.find((candidate) => candidate.id === "NPREG-113");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.completion_evidence, ["research/NP_1915_SYSTEM_RECORD.md", "tests/np-1915-system.test.js"]);
});
