import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { sources, timeline } from "../src/data.js";
import workItems from "../docs/work-items.json" with { type: "json" };

const eventBySource = (sourceId) => timeline.find((entry) => entry.sourceId === sourceId);

test("1849 contemporary report retains the working model", () => {
  const event = eventBySource("mun-public-ledger-1849-humphrey-telegraph");
  assert.ok(event);
  assert.equal(event.date, "1849-12-18");
  assert.equal(event.status, "reported");
  assert.match(event.body, /working miniature electric telegraph/);
  assert.match(event.body, /perforated paper strip/);
  assert.match(event.body, /model station/);
  assert.match(event.body, /characters were dotted onto paper/);
});

test("1849 contemporary report retains only its stated cable geography", () => {
  const event = eventBySource("mun-public-ledger-1849-humphrey-telegraph");
  assert.match(event.body, /Newfoundland to British North America/);
  assert.match(event.body, /southwestern Ireland/);
  assert.doesNotMatch(event.body, /Cape Ray/);
  assert.doesNotMatch(event.body, /Cape Breton/);
  assert.doesNotMatch(event.body, /Gisborne/);
});

test("1849 specific route remains a later attribution", () => {
  const event = eventBySource("mun-express-1855-gisborne-1849-origin-claim");
  assert.ok(event);
  assert.equal(event.date, "1849-12");
  assert.equal(event.status, "reported");
  assert.match(event.body, /1855 Newfoundland Express/);
  assert.match(event.body, /F\. N\. Gisborne/);
  assert.match(event.body, /St. John's to Cape Ray/);
  assert.match(event.body, /submarine cable to Cape Breton/);
  assert.match(event.body, /does not print those route names or the Gisborne attribution/);
});

test("1849 source locators retain pages and evidence states", () => {
  const expected = new Map([
    ["mun-public-ledger-1849-humphrey-telegraph", ["physical PDF p. 2", "reported"]],
    ["mun-express-1855-gisborne-1849-origin-claim", ["physical PDF p. 2", "reported"]]
  ]);
  for (const [sourceId, [pages, status]] of expected) {
    const source = sources.find((entry) => entry.id === sourceId);
    assert.ok(source, sourceId);
    assert.equal(source.pages, pages);
    assert.equal(source.status, status);
  }
});

test("1849 research record retains source hashes", () => {
  const record = fs.readFileSync(new URL("../research/NP_1849_SYSTEM_RECORD.md", import.meta.url), "utf8");
  for (const hash of [
    "d9def07b258b33def9009b8e6d8ef775f534d8c0e63d222c1bd44270f7d33d97",
    "b48231aa313e01a1747c98404f8fb4116df584e7db9488f49cf11b5924aca5aa"
  ]) {
    assert.match(record, new RegExp(hash));
  }
});

test("1849 work item is complete", () => {
  const item = workItems.work_items.find((entry) => entry.id === "NPREG-179");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-178"]);
  assert.deepEqual(item.completion_evidence, ["research/NP_1849_SYSTEM_RECORD.md", "src/data.js", "tests/np-1849-system.test.js"]);
});
