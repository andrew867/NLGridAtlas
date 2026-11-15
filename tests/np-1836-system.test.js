import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { sources, timeline } from "../src/data.js";
import workItems from "../docs/work-items.json" with { type: "json" };

test("1836 Harbour Grace act preserves financing and approval controls", () => {
  const event = timeline.find((entry) => entry.sourceId === "mun-statutes-1836-harbour-grace-lighthouse-loan-act");
  assert.ok(event);
  assert.equal(event.date, "1836-05-06");
  assert.equal(event.status, "verified");
  assert.match(event.body, /up to £1,000/);
  assert.match(event.body, /six percent interest/);
  assert.match(event.body, /work and machinery specification/);
  assert.match(event.body, /cost estimate/);
});

test("1836 Cape Spear tender and operating notice remain separate", () => {
  const tender = timeline.find((entry) => entry.sourceId === "mun-public-ledger-1836-cape-spear-completion-tender");
  assert.ok(tender);
  assert.equal(tender.date, "1836-08-05");
  assert.equal(tender.status, "verified");
  assert.match(tender.body, /carpenter work and materials/);
  assert.match(tender.body, /secretary John Shea/);

  const notice = timeline.find((entry) => entry.sourceId === "mun-public-ledger-1836-cape-spear-light-notice");
  assert.ok(notice);
  assert.equal(notice.date, "1836-09-01");
  assert.equal(notice.status, "reported");
  assert.match(notice.body, /275-foot elevation/);
  assert.match(notice.body, /one-minute intervals/);
  assert.match(notice.body, /not a post-start operating log/);
});

test("1836 telegraph item remains foreign non-electrical context", () => {
  const event = timeline.find((entry) => entry.sourceId === "mun-times-1836-liverpool-holyhead-telegraph-report");
  assert.ok(event);
  assert.equal(event.status, "reported");
  assert.match(event.body, /Liverpool Telegraph-office logbook/);
  assert.match(event.body, /station to station/);
  assert.match(event.body, /one o'clock time signal/);
  assert.match(event.body, /did not describe an electrical circuit or a Newfoundland installation/);
});

test("1836 sources retain exact page locators and evidence states", () => {
  const expected = new Map([
    ["mun-statutes-1836-harbour-grace-lighthouse-loan-act", ["physical PDF p. 55, printed p. 51", "verified"]],
    ["mun-public-ledger-1836-cape-spear-completion-tender", ["physical PDF p. 3", "verified"]],
    ["mun-public-ledger-1836-cape-spear-light-notice", ["physical PDF p. 3", "reported"]],
    ["mun-times-1836-liverpool-holyhead-telegraph-report", ["physical PDF p. 2", "reported"]]
  ]);
  for (const [sourceId, [pages, status]] of expected) {
    const source = sources.find((entry) => entry.id === sourceId);
    assert.ok(source, sourceId);
    assert.equal(source.pages, pages);
    assert.equal(source.status, status);
  }
});

test("1836 research record preserves hashes and source boundaries", () => {
  const record = fs.readFileSync(new URL("../research/NP_1836_SYSTEM_RECORD.md", import.meta.url), "utf8");
  for (const hash of [
    "fdbf4379212ceb7c239765414bfdeacc5c9d18e9c75f869edd73d96bb7d3e720",
    "dd1e8f9853e0e939af87c85667f29c3b3c511928f6c0b6fa2aec1ccaed7f063c",
    "5357b5ef1d839d618756fba769bc4b191030dec3e73f9475c6648f952f264035",
    "f6becc1f2410b1493f683bbaa92af6d8a3ff36a3a966bb9c16acacafb29dc666"
  ]) {
    assert.match(record, new RegExp(hash));
  }
  assert.match(record, /statute establishes financing and an engineering-approval control/);
  assert.match(record, /No post-start log was located/);
  assert.match(record, /No named 1836 Newfoundland telegraph instrument/);
});

test("1836 work item is complete", () => {
  const item = workItems.work_items.find((entry) => entry.id === "NPREG-192");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-191"]);
  assert.deepEqual(item.completion_evidence, ["research/NP_1836_SYSTEM_RECORD.md", "src/data.js", "tests/np-1836-system.test.js"]);
});
