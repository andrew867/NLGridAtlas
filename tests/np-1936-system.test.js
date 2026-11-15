import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { staticClaims, timeline } from "../src/data.js";

test("1936 search does not invent a public system event", () => {
  assert.equal(timeline.some((entry) => entry.date === "1936"), false);
  assert.equal(staticClaims.some((claim) => claim.id === "np-1936-system-record"), false);
  const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
  assert.doesNotMatch(html, /data-claim-id="np-1936-system-record"/);
});

test("1936 research retains the unassigned breaker without placing it", () => {
  const record = fs.readFileSync(new URL("../research/NP_1936_SYSTEM_RECORD.md", import.meta.url), "utf8");
  assert.match(record, /company number 210043/);
  assert.match(record, /serial number LSORT24/);
  assert.match(record, /33,000 V/);
  assert.match(record, /does not identify the station, circuit or operating role/);
  assert.match(record, /no 1936 public card or timeline entry/);

  const workItems = JSON.parse(fs.readFileSync(new URL("../docs/work-items.json", import.meta.url), "utf8"));
  const item = workItems.work_items.find((candidate) => candidate.id === "NPREG-092");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.completion_evidence, ["research/NP_1936_SYSTEM_RECORD.md", "tests/np-1936-system.test.js"]);
});
