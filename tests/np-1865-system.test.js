import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { sources, timeline } from "../src/data.js";
import workItems from "../docs/work-items.json" with { type: "json" };

test("1865 Heart's Content preparations remain a construction record", () => {
  const event = timeline.find((entry) => entry.date === "1865-07-14");
  assert.ok(event);
  assert.equal(event.status, "reported");
  assert.equal(event.category, "telecommunications construction");
  assert.match(event.body, /telegraph house was almost finished/);
  assert.match(event.body, /more than 100 feet deep close to shore/);
  assert.match(event.body, /Fritter's Cove near Perlican/);
});

test("1865 loss of signals keeps the cause unresolved", () => {
  const event = timeline.find((entry) => entry.date === "1865-08-02" && entry.sourceId === "mun-daily-news-1865-signals-ceased");
  assert.ok(event);
  assert.equal(event.status, "reported");
  assert.match(event.body, /cause remained a mystery/);
  assert.match(event.body, /impression, not a finding/);
});

test("1865 cable parting uses the retrospective expedition value", () => {
  const event = timeline.find((entry) => entry.date === "1865-08-02" && entry.sourceId === "mun-times-1866-1865-cable-retrospective");
  assert.ok(event);
  assert.equal(event.status, "reported");
  assert.match(event.title, /1,213 miles/);
  assert.match(event.body, /retrospective account printed during the 1866 expedition/);
});

test("1865 Heart's Content failure report preserves the recovery attempt", () => {
  const event = timeline.find((entry) => entry.date === "1865-08-15");
  assert.ok(event);
  assert.equal(event.status, "reported");
  assert.match(event.body, /cable had been severed/);
  assert.match(event.body, /after repeated recovery attempts/);
  assert.match(event.body, /put back to England/);
});

test("1865 source locators retain physical pages and evidence states", () => {
  const sourceIds = [
    "mun-chronicle-1865-heart-content-preparations",
    "mun-daily-news-1865-cable-rumour",
    "mun-daily-news-1865-signals-ceased",
    "mun-chronicle-1865-cable-failure",
    "mun-times-1866-1865-cable-retrospective"
  ];
  for (const sourceId of sourceIds) {
    const source = sources.find((entry) => entry.id === sourceId);
    assert.ok(source, sourceId);
    assert.match(source.pages, /physical PDF p\./);
    assert.equal(source.status, "reported");
  }
});

test("1865 research record retains primary-source hashes", () => {
  const record = fs.readFileSync(new URL("../research/NP_1865_SYSTEM_RECORD.md", import.meta.url), "utf8");
  for (const hash of [
    "6284e175614bc72817b655588dbe12c4848f214057294a36b77cee7c9f787a73",
    "954e96e53a5e9c52dcf2b208d8221207c2de36a38ce768a6ffa6a97ab7dc39c5",
    "3095c41a739b98c2b33dfb865aebe69e00f3c79a61f3c890a3969768d0777f86",
    "572f7305c989328ee6ceb47604500df4977b2c14e59ded61df0b111544cae151",
    "df234e38f9755bfceeb88a1bf283c153c1b1ad9539e9e213c90436036f3e14c0"
  ]) {
    assert.match(record, new RegExp(hash));
  }
});

test("1865 work item follows the 1866 closeout", () => {
  const item = workItems.work_items.find((candidate) => candidate.id === "NPREG-163");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-162"]);
  assert.deepEqual(item.completion_evidence, ["research/NP_1865_SYSTEM_RECORD.md", "src/data.js", "tests/np-1865-system.test.js"]);
});
