import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { sources, timeline } from "../src/data.js";
import workItems from "../docs/work-items.json" with { type: "json" };

test("1845 operating-telegraph description remains foreign technical context", () => {
  const event = timeline.find((entry) => entry.sourceId === "mun-morning-post-1845-cooke-wheatstone");
  assert.ok(event);
  assert.equal(event.date, "1845-02-22");
  assert.equal(event.status, "reported");
  assert.match(event.body, /one pair of wires/);
  assert.match(event.body, /more than one hundred messages/);
  assert.match(event.body, /system was in England/);
  assert.match(event.body, /not a Newfoundland line/);
});

test("1845 source locators retain the newspaper and mail baseline pages", () => {
  const expected = new Map([
    ["mun-morning-post-1845-cooke-wheatstone", "physical PDF p. 1"],
    ["mun-almanac-1845-post-office", "physical PDF pp. 29 to 30"]
  ]);
  for (const [sourceId, pages] of expected) {
    const source = sources.find((entry) => entry.id === sourceId);
    assert.ok(source, sourceId);
    assert.equal(source.pages, pages);
    assert.equal(source.status, "reported");
  }
});

test("1845 research record retains source hashes and infrastructure boundary", () => {
  const record = fs.readFileSync(new URL("../research/NP_1845_SYSTEM_RECORD.md", import.meta.url), "utf8");
  for (const hash of [
    "9790fe2368d9324882654dc9367bdf441966f28fc9f9b28a504357b2fa154a9e",
    "29f7550db67c4af00be27fb7edbc8eebec12ab91a937864450df2566df55743f"
  ]) {
    assert.match(record, new RegExp(hash));
  }
  assert.match(record, /physical PDF pp\. 29 to 30/);
  assert.match(record, /not a Newfoundland installation/);
  assert.match(record, /No named 1845 Newfoundland telegraph line/);
});

test("1845 work item is complete", () => {
  const item = workItems.work_items.find((entry) => entry.id === "NPREG-183");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-182"]);
  assert.deepEqual(item.completion_evidence, ["research/NP_1845_SYSTEM_RECORD.md", "src/data.js", "tests/np-1845-system.test.js"]);
});
