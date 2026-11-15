import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { sources, timeline } from "../src/data.js";
import workItems from "../docs/work-items.json" with { type: "json" };

test("1861 Cape Race notice remains a scheduled service", () => {
  const event = timeline.find((entry) => entry.date === "1861-04-15");
  assert.ok(event);
  assert.equal(event.status, "proposed");
  assert.equal(event.category, "telecommunications proposal");
  assert.match(event.body, /vigilant watch at Cape Race/);
  assert.match(event.body, /flag and number/);
  assert.match(event.body, /\$1\.50/);
  assert.match(event.body, /does not confirm that the watch began/);
});

test("1861 Chapel Arm record retains measured loss and operating effects", () => {
  const event = timeline.find((entry) => entry.date === "1861-06-03");
  assert.ok(event);
  assert.equal(event.status, "reported");
  assert.equal(event.category, "telecommunications fault");
  assert.match(event.body, /more than half a mile of wire/);
  assert.match(event.body, /operator carried business between the two ends/);
  assert.match(event.body, /stop sending European business/);
});

test("1861 Harbor Main record uses the publication date", () => {
  const event = timeline.find((entry) => entry.date === "1861-06-07" && /Harbor Main/.test(entry.title));
  assert.ok(event);
  assert.match(event.body, /nearly half a mile/);
  assert.match(event.body, /publication date/);
});

test("1861 Chapel Arm repair record keeps the relative return date", () => {
  const event = timeline.find((entry) => entry.date === "1861-06-21");
  assert.ok(event);
  assert.match(event.body, /following Friday/);
  assert.match(event.body, /Blue Jacket/);
  assert.match(event.body, /wire and insulators/);
  assert.match(event.body, /does not print the reconnection date/);
});

test("1861 diplomatic delay retains month precision and source limits", () => {
  const event = timeline.find((entry) => entry.date === "1861-11");
  assert.ok(event);
  assert.equal(event.status, "reported");
  assert.match(event.body, /British Minister at Washington/);
  assert.match(event.body, /exact cutting location and date are not stated/);
});

test("1861 source locators retain physical pages and evidence states", () => {
  const expected = new Map([
    ["mun-daily-news-1861-cape-race-watch", ["physical PDF p. 3", "proposed"]],
    ["mun-daily-news-1861-chapel-arm-outage", ["physical PDF p. 2", "reported"]],
    ["mun-daily-news-1861-chapel-arm-repair", ["physical PDF p. 2", "reported"]],
    ["mun-daily-news-1862-diplomatic-delay", ["physical PDF pp. 2 to 3", "reported"]]
  ]);
  for (const [sourceId, [pageText, status]] of expected) {
    const source = sources.find((entry) => entry.id === sourceId);
    assert.ok(source, sourceId);
    assert.equal(source.pages, pageText);
    assert.equal(source.status, status);
  }
});

test("1861 research record retains primary-source hashes", () => {
  const record = fs.readFileSync(new URL("../research/NP_1861_SYSTEM_RECORD.md", import.meta.url), "utf8");
  for (const hash of [
    "c6bee17d2c95d69a1d12c9a67b0d6f6f3ef31126dbe528dad371419923ba5881",
    "5cec4e9dbe3c74cd97ae343cbb2cd45f2e0d5304ade0f51e039f50a3702b78ae",
    "acfa33dc37dbbb6e187423e7c08be686d8164661cd47f50b3afd23c3095e456d",
    "6ce8c73d0b060260b5ad3cdc3ee6b384bc3fde19d7982944b57dd13765099dbe"
  ]) {
    assert.match(record, new RegExp(hash));
  }
});

test("1861 work item follows the 1862 closeout", () => {
  const item = workItems.work_items.find((candidate) => candidate.id === "NPREG-167");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-166"]);
  assert.deepEqual(item.completion_evidence, ["research/NP_1861_SYSTEM_RECORD.md", "src/data.js", "tests/np-1861-system.test.js"]);
});
