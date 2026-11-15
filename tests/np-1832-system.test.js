import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { sources, timeline } from "../src/data.js";
import workItems from "../docs/work-items.json" with { type: "json" };

test("1832 review does not create a technical timeline event", () => {
  const events = timeline.filter((entry) => entry.date.startsWith("1832-"));
  assert.deepEqual(events, []);
});

test("1832 chronology source retains exact pages and evidence state", () => {
  const source = sources.find((entry) => entry.id === "parks-canada-1975-cape-spear-chronology");
  assert.ok(source);
  assert.equal(source.pages, "physical PDF pp. 43 to 44, report pp. 2 to 3");
  assert.equal(source.status, "reported");
  assert.match(source.url, /parkscanadahistory\.com\/series\/mrs\/386\.pdf$/);
});

test("1832 research record preserves chronology and search limits", () => {
  const record = fs.readFileSync(new URL("../research/NP_1832_SYSTEM_RECORD.md", import.meta.url), "utf8");
  assert.match(record, /representative government to 1832/);
  assert.match(record, /January 3, 1833/);
  assert.match(record, /June 12, 1834/);
  assert.match(record, /adds no 1832 technical timeline event/);
  assert.match(record, /not a complete review of every 1832 issue/);
  assert.match(record, /cceb233be15a1a08889fce11d6ef2da17be71afa13985b962c535ea5abdf1b14/);
  assert.match(record, /No named 1832 Newfoundland telegraph instrument/);
});

test("1832 work item is complete", () => {
  const item = workItems.work_items.find((entry) => entry.id === "NPREG-196");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-195"]);
  assert.deepEqual(item.completion_evidence, ["research/NP_1832_SYSTEM_RECORD.md", "src/data.js", "tests/np-1832-system.test.js"]);
});
