import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { sources, timeline } from "../src/data.js";
import workItems from "../docs/work-items.json" with { type: "json" };

test("1843 local electrical experiments remain distinct from telegraph operation", () => {
  const event = timeline.find((entry) => entry.sourceId === "mun-public-ledger-1843-st-johns-electrical-machine");
  assert.ok(event);
  assert.equal(event.date, "1843-12-08");
  assert.equal(event.status, "reported");
  assert.match(event.body, /about forty members/);
  assert.match(event.body, /electrical machine/);
  assert.match(event.body, /did not print the society's name/);
  assert.match(event.body, /did not describe an electric telegraph/);
});

test("1843 source locators separate electrical and optical systems", () => {
  const expected = new Map([
    ["mun-public-ledger-1843-st-johns-electrical-machine", ["physical PDF pp. 2 to 3", "reported"]],
    ["mun-public-ledger-1843-optical-telegraph", ["physical PDF pp. 1 to 2", "reported"]]
  ]);
  for (const [sourceId, [pages, status]] of expected) {
    const source = sources.find((entry) => entry.id === sourceId);
    assert.ok(source, sourceId);
    assert.equal(source.pages, pages);
    assert.equal(source.status, status);
  }
});

test("1843 record preserves hashes and identification boundaries", () => {
  const record = fs.readFileSync(new URL("../research/NP_1843_SYSTEM_RECORD.md", import.meta.url), "utf8");
  for (const hash of [
    "f53fbce3232e1631dc3a13fff1cde3fa99bcbbd27087ebb45d5d80e94a096591",
    "09497f71ad25127717f2c414cefdb6e6da8c3430003da17a72f0602fe87db196"
  ]) {
    assert.match(record, new RegExp(hash));
  }
  assert.match(record, /leaves the organization unnamed/);
  assert.match(record, /optical semaphore network, not an electric telegraph/);
  assert.match(record, /local electrical apparatus and experimentation only/);
});

test("1843 work item is complete", () => {
  const item = workItems.work_items.find((entry) => entry.id === "NPREG-185");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-184"]);
  assert.deepEqual(item.completion_evidence, ["research/NP_1843_SYSTEM_RECORD.md", "src/data.js", "tests/np-1843-system.test.js"]);
});
