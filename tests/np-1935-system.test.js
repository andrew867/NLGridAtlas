import { readAtlasHtmlSync } from "./page-fixture.js";
import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { staticClaims, timeline } from "../src/data.js";

test("1935 search does not invent a public system event", () => {
  assert.equal(timeline.some((entry) => entry.date === "1935"), false);
  assert.equal(staticClaims.some((claim) => claim.id === "np-1935-system-record"), false);
  const html = readAtlasHtmlSync();
  assert.doesNotMatch(html, /data-claim-id="np-1935-system-record"/);
});

test("1935 research retains the unassigned civil-property vintage", () => {
  const record = fs.readFileSync(new URL("../research/NP_1935_SYSTEM_RECORD.md", import.meta.url), "utf8");
  assert.match(record, /\$2,300 of original cost from 1935/);
  assert.match(record, /account 321\.00, Roads, Trails, and Bridges/);
  assert.match(record, /Neither filing identifies a plant, road, trail or bridge/);
  assert.match(record, /no 1935 public card or timeline entry/);

  const workItems = JSON.parse(fs.readFileSync(new URL("../docs/work-items.json", import.meta.url), "utf8"));
  const item = workItems.work_items.find((candidate) => candidate.id === "NPREG-093");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.completion_evidence, ["research/NP_1935_SYSTEM_RECORD.md", "tests/np-1935-system.test.js"]);
});
