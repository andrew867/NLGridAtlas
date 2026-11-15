import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { timeline } from "../src/data.js";

test("1909 archive search does not turn Ontario plants into Newfoundland events", () => {
  assert.equal(timeline.some((entry) => entry.date === "1909"), false);

  const record = fs.readFileSync(new URL("../research/NP_1909_SYSTEM_RECORD.md", import.meta.url), "utf8");
  assert.match(record, /No named 1909 Newfoundland/);
  assert.match(record, /physical PDF p\. 19 places them in Ontario/);
  assert.match(record, /1908, not 1909/);
  assert.match(record, /f886b2ec225a92093c9306ba1849340e006c0b95d44d4a1beee2f145311827e7/);
});

test("1909 work item records the negative search", () => {
  const workItems = JSON.parse(fs.readFileSync(new URL("../docs/work-items.json", import.meta.url), "utf8"));
  const item = workItems.work_items.find((candidate) => candidate.id === "NPREG-119");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.completion_evidence, ["research/NP_1909_SYSTEM_RECORD.md", "tests/np-1909-system.test.js"]);
});
