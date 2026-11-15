import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { staticClaims, timeline } from "../src/data.js";

test("1928 gauging evidence does not become an asset event", () => {
  assert.equal(timeline.some((entry) => entry.date === "1928"), false);
  assert.equal(staticClaims.some((claim) => claim.id === "np-1928-system-record"), false);
  const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
  assert.doesNotMatch(html, /data-claim-id="np-1928-system-record"/);
});

test("1928 research-only work item is closed with its hydrologic boundary", () => {
  const workItems = JSON.parse(fs.readFileSync(new URL("../docs/work-items.json", import.meta.url), "utf8"));
  const item = workItems.work_items.find((candidate) => candidate.id === "NPREG-100");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.completion_evidence, ["research/NP_1928_SYSTEM_RECORD.md", "tests/np-1928-system.test.js"]);

  const record = fs.readFileSync(new URL("../research/NP_1928_SYSTEM_RECORD.md", import.meta.url), "utf8");
  assert.match(record, /Exploits River gauging record used to develop inflow records starts in 1928/);
  assert.match(record, /does not establish construction or commissioning/);
  assert.match(record, /no separate 1928 public card or timeline entry/);
});
