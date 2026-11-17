import { readAtlasHtmlSync } from "./page-fixture.js";
import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { staticClaims, timeline } from "../src/data.js";

test("1934 search does not invent a public system event", () => {
  assert.equal(timeline.some((entry) => entry.date === "1934"), false);
  assert.equal(staticClaims.some((claim) => claim.id === "np-1934-system-record"), false);
  const html = readAtlasHtmlSync();
  assert.doesNotMatch(html, /data-claim-id="np-1934-system-record"/);
});

test("1934 research retains both unassigned property vintages", () => {
  const record = fs.readFileSync(new URL("../research/NP_1934_SYSTEM_RECORD.md", import.meta.url), "utf8");
  assert.match(record, /\$13,454 of original cost/);
  assert.match(record, /\$10,168 addition/);
  assert.match(record, /do not identify a generating plant, water-control structure, circuit, community or work order/);
  assert.match(record, /no 1934 public card or timeline entry/);

  const workItems = JSON.parse(fs.readFileSync(new URL("../docs/work-items.json", import.meta.url), "utf8"));
  const item = workItems.work_items.find((candidate) => candidate.id === "NPREG-094");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.completion_evidence, ["research/NP_1934_SYSTEM_RECORD.md", "tests/np-1934-system.test.js"]);
});
