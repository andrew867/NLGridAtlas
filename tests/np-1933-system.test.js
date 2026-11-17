import { readAtlasHtmlSync } from "./page-fixture.js";
import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { staticClaims, timeline } from "../src/data.js";

test("1933 search does not invent a public system event", () => {
  assert.equal(timeline.some((entry) => entry.date === "1933"), false);
  assert.equal(staticClaims.some((claim) => claim.id === "np-1933-system-record"), false);
  const html = readAtlasHtmlSync();
  assert.doesNotMatch(html, /data-claim-id="np-1933-system-record"/);
});

test("1933 research retains both unassigned property vintages", () => {
  const record = fs.readFileSync(new URL("../research/NP_1933_SYSTEM_RECORD.md", import.meta.url), "utf8");
  assert.match(record, /\$1,270 of original cost/);
  assert.match(record, /\$6,049 addition and balance/);
  assert.match(record, /plant additions that no longer existed/);
  assert.match(record, /no 1933 public card or timeline entry/);

  const workItems = JSON.parse(fs.readFileSync(new URL("../docs/work-items.json", import.meta.url), "utf8"));
  const item = workItems.work_items.find((candidate) => candidate.id === "NPREG-095");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.completion_evidence, ["research/NP_1933_SYSTEM_RECORD.md", "tests/np-1933-system.test.js"]);
});
