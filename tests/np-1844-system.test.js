import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { sources, timeline } from "../src/data.js";
import workItems from "../docs/work-items.json" with { type: "json" };

test("1844 Highton report remains foreign technical context", () => {
  const event = timeline.find((entry) => entry.sourceId === "mun-public-ledger-1844-highton-telegraph");
  assert.ok(event);
  assert.equal(event.date, "1844-06-18");
  assert.equal(event.status, "reported");
  assert.match(event.body, /ten-mile experimental wire/);
  assert.match(event.body, /insulated with glass/);
  assert.match(event.body, /experiment occurred in England/);
  assert.match(event.body, /does not establish Newfoundland telegraph infrastructure/);
});

test("1844 source locators preserve evidence and proposal states", () => {
  const expected = new Map([
    ["mun-public-ledger-1844-highton-telegraph", ["physical PDF p. 4", "reported"]],
    ["mun-almanac-1844-post-office", ["physical PDF p. 47, printed p. 41", "proposed"]],
    ["mun-times-1843-liverpool-collegiate", ["physical PDF pp. 1 and 4", "reported"]]
  ]);
  for (const [sourceId, [pages, status]] of expected) {
    const source = sources.find((entry) => entry.id === sourceId);
    assert.ok(source, sourceId);
    assert.equal(source.pages, pages);
    assert.equal(source.status, status);
  }
});

test("1844 record rejects an unsupported St. John's lecture assignment", () => {
  const record = fs.readFileSync(new URL("../research/NP_1844_SYSTEM_RECORD.md", import.meta.url), "utf8");
  for (const hash of [
    "7d2b408864a1f7915914198127a2b3f1f64af8b5c424f8e0f390993951f2dffc",
    "6451ec3f14edfdc10974a4f2bf0c6c079750453bce67a1391892c62bb81e2146",
    "1b537b5e78655a27b2cf4dc8e9f4cfee612ca559d6fc87ef5174afe66558588c"
  ]) {
    assert.match(record, new RegExp(hash));
  }
  assert.match(record, /words "in this town" therefore cannot be assigned to St\. John's/);
  assert.match(record, /does not create an 1843 Newfoundland demonstration/);
  assert.match(record, /proposed service change in the almanac, not completion evidence/);
});

test("1844 work item is complete", () => {
  const item = workItems.work_items.find((entry) => entry.id === "NPREG-184");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-183"]);
  assert.deepEqual(item.completion_evidence, ["research/NP_1844_SYSTEM_RECORD.md", "src/data.js", "tests/np-1844-system.test.js"]);
});
