import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { staticClaims, timeline } from "../src/data.js";

test("unidentified 1913 accounting placements do not become system events", () => {
  assert.equal(timeline.some((entry) => entry.date === "1913"), false);
  assert.equal(staticClaims.some((claim) => claim.id === "np-1913-system-record"), false);
  const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
  assert.doesNotMatch(html, /data-claim-id="np-1913-system-record"/);
});

test("1913 research preserves placement and survivor values without inventing locations", () => {
  const record = fs.readFileSync(new URL("../research/NP_1913_SYSTEM_RECORD.md", import.meta.url), "utf8");
  assert.match(record, /\$37,500 in account 323\.00/);
  assert.match(record, /\$33,500 of original cost/);
  assert.match(record, /\$39,000 in account 325\.00/);
  assert.match(record, /\$25,518 of original cost/);
  assert.match(record, /not assigned to named atlas assets/);

  const workItems = JSON.parse(fs.readFileSync(new URL("../docs/work-items.json", import.meta.url), "utf8"));
  const item = workItems.work_items.find((candidate) => candidate.id === "NPREG-115");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.completion_evidence, ["research/NP_1913_SYSTEM_RECORD.md", "tests/np-1913-system.test.js"]);
});
