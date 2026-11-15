import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { sources, timeline } from "../src/data.js";
import workItems from "../docs/work-items.json" with { type: "json" };

test("1834 lighthouse act preserves system scope and controls", () => {
  const event = timeline.find((entry) => entry.sourceId === "mun-statutes-1834-st-johns-cape-spear-lighthouse-act");
  assert.ok(event);
  assert.equal(event.date, "1834-06-12");
  assert.equal(event.status, "verified");
  assert.match(event.body, /Fort Amherst already had a lighthouse building and lighting apparatus/);
  assert.match(event.body, /loan of up to £1,000/);
  assert.match(event.body, /plans, estimates and contracts/);
  assert.match(event.body, /harbour buoys, chains and moorings/);
});

test("1834 Fort Amherst records separate announcement from supply evidence", () => {
  const notice = timeline.find((entry) => entry.sourceId === "mun-public-ledger-1834-fort-amherst-light-notice");
  const supply = timeline.find((entry) => entry.sourceId === "mun-royal-gazette-1834-fort-amherst-oil-wick-tender");
  assert.ok(notice);
  assert.equal(notice.date, "1834-07-07");
  assert.equal(notice.status, "reported");
  assert.match(notice.body, /sunset to sunrise/);
  assert.match(notice.body, /not a later operating log/);
  assert.ok(supply);
  assert.equal(supply.date, "1834-10-06");
  assert.equal(supply.status, "verified");
  assert.match(supply.body, /pale seal oil and lamp wick/);
  assert.match(supply.body, /12 months/);
});

test("1834 Cape Spear tender preserves project state", () => {
  const event = timeline.find((entry) => entry.sourceId === "mun-public-ledger-1834-cape-spear-construction-tender");
  assert.ok(event);
  assert.equal(event.date, "1834-07-23");
  assert.equal(event.status, "verified");
  assert.match(event.body, /erect a lighthouse at Cape Spear/);
  assert.match(event.body, /plan and specification/);
  assert.match(event.body, /August 2/);
});

test("1834 sources retain exact page locators and evidence states", () => {
  const expected = new Map([
    ["mun-statutes-1834-st-johns-cape-spear-lighthouse-act", ["physical PDF pp. 14 to 16, printed pp. 17 to 19", "verified"]],
    ["mun-public-ledger-1834-fort-amherst-light-notice", ["physical PDF p. 3", "reported"]],
    ["mun-public-ledger-1834-cape-spear-construction-tender", ["physical PDF p. 3", "verified"]],
    ["mun-royal-gazette-1834-fort-amherst-oil-wick-tender", ["physical PDF p. 3", "verified"]]
  ]);
  for (const [sourceId, [pages, status]] of expected) {
    const source = sources.find((entry) => entry.id === sourceId);
    assert.ok(source, sourceId);
    assert.equal(source.pages, pages);
    assert.equal(source.status, status);
  }
});

test("1834 research record preserves hashes and evidence boundaries", () => {
  const record = fs.readFileSync(new URL("../research/NP_1834_SYSTEM_RECORD.md", import.meta.url), "utf8");
  for (const hash of [
    "ac7fe685ef8dc28c413434d11243a16938f45e40ce8eabb65fedfe54a88c0f80",
    "dbc7428e5410b4e505eaa14cf698d63889a8ceba0e30f2da251cae120c1d18ab",
    "059f9a6b516af2b6f98ca035753d80b5a07ff036407e165e686db24ffa672e3b",
    "e52b622215e2d7d2a37cb4d447a80c731112de3c75a8935d8acc83349d1a0f34"
  ]) {
    assert.match(record, new RegExp(hash));
  }
  assert.match(record, /official service announcement, not a later operating log/);
  assert.match(record, /No named 1834 Newfoundland telegraph instrument/);
});

test("1834 work item is complete", () => {
  const item = workItems.work_items.find((entry) => entry.id === "NPREG-194");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-193"]);
  assert.deepEqual(item.completion_evidence, ["research/NP_1834_SYSTEM_RECORD.md", "src/data.js", "tests/np-1834-system.test.js"]);
});
