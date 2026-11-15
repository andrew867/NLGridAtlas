import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { staticClaims, timeline } from "../src/data.js";

test("1938 search does not invent a public system event", () => {
  assert.equal(timeline.some((entry) => entry.date === "1938"), false);
  assert.equal(staticClaims.some((claim) => claim.id === "np-1938-system-record"), false);
  const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
  assert.doesNotMatch(html, /data-claim-id="np-1938-system-record"/);
});

test("1938 research-only work item is closed with evidence", () => {
  const workItems = JSON.parse(fs.readFileSync(new URL("../docs/work-items.json", import.meta.url), "utf8"));
  const item = workItems.work_items.find((candidate) => candidate.id === "NPREG-090");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.completion_evidence, ["research/NP_1938_SYSTEM_RECORD.md", "tests/np-1938-system.test.js"]);
  const record = fs.readFileSync(new URL("../research/NP_1938_SYSTEM_RECORD.md", import.meta.url), "utf8");
  assert.match(record, /no 1938 public card or timeline entry/);
});
