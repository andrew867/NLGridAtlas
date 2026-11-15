import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { sources, timeline } from "../src/data.js";
import workItems from "../docs/work-items.json" with { type: "json" };

const eventBySource = (sourceId) => timeline.find((entry) => entry.sourceId === sourceId);

test("1854 statute retains corporate, route and finance terms", () => {
  const event = eventBySource("mun-statutes-1854-telegraph-reorganization");
  assert.ok(event);
  assert.equal(event.status, "verified");
  assert.match(event.body, /£312,500, or \$1\.5 million/);
  assert.match(event.body, /St\. John's toward Cape Ray and Trepassey/);
  assert.match(event.body, /St\. John's and Carbonear line/);
  assert.match(event.body, /fifty-year exclusive right/);
  assert.match(event.body, /fifty £1,000 bonds/);
  assert.match(event.body, /transferred the earlier company's telegraph property/);
});

test("1854 construction records retain workforce and measured road status", () => {
  const labour = eventBySource("mun-times-1854-first-labour");
  const road = eventBySource("mun-times-1854-long-harbour-road");
  assert.ok(labour);
  assert.ok(road);
  assert.match(labour.body, /first load of workers/);
  assert.match(road.body, /Peak/);
  assert.match(road.body, /five or six miles/);
  assert.match(road.body, /Long Harbour/);
});

test("1854 construction notice remains proposed", () => {
  const event = eventBySource("mun-courier-1854-construction-proposals");
  assert.ok(event);
  assert.equal(event.status, "proposed");
  assert.match(event.body, /Cape Ray and St\. John's/);
  assert.match(event.body, /Renews to Trepassey/);
  assert.match(event.body, /poles and braces/);
});

test("1854 route report retains the printed endpoint conflict", () => {
  const event = eventBySource("mun-times-1854-mainland-route-report");
  assert.ok(event);
  assert.match(event.body, /Prince Edward Island had been abandoned/);
  assert.match(event.body, /Cape Race to Nova Scotia at or near Cape North/);
  assert.match(event.body, /later construction records use Cape Ray/);
});

test("1854 Carbonear record retains inspection and wire damage", () => {
  const event = eventBySource("mun-courier-1854-carbonear-line");
  assert.ok(event);
  assert.match(event.body, /Hartley J\. Gisborne/);
  assert.match(event.body, /very bad condition/);
  assert.match(event.body, /deliberately cut/);
});

test("1854 source locators retain pages and evidence states", () => {
  const expected = new Map([
    ["mun-statutes-1854-telegraph-reorganization", ["physical PDF pp. 3 to 4 and 7 to 15", "verified"]],
    ["mun-times-1854-first-labour", ["physical PDF p. 2", "reported"]],
    ["mun-times-1854-long-harbour-road", ["physical PDF p. 3", "reported"]],
    ["mun-courier-1854-construction-proposals", ["physical PDF p. 3", "reported"]],
    ["mun-times-1854-mainland-route-report", ["physical PDF p. 2", "reported"]],
    ["mun-courier-1854-carbonear-line", ["physical PDF p. 2", "reported"]]
  ]);
  for (const [sourceId, [pages, status]] of expected) {
    const source = sources.find((entry) => entry.id === sourceId);
    assert.ok(source, sourceId);
    assert.equal(source.pages, pages);
    assert.equal(source.status, status);
  }
});

test("1854 research record retains source hashes", () => {
  const record = fs.readFileSync(new URL("../research/NP_1854_SYSTEM_RECORD.md", import.meta.url), "utf8");
  for (const hash of [
    "20c112ba9b8600edbadd0b8cf2d9c420ad54f2ec39b1b5e72879be276c0e0436",
    "35aea2c7111b0124ef118df1bbbf6e9470e1cad2a68761065b8b8f2bae0d74c4",
    "06821fc5eb17e0a74af68db21a6a1dc92c9600b80fae6072fd1bb88b0c7c889b",
    "0252ea2d69ed029406e2c78594ddfd2d548644405cd2f3097eac7094ed24007f",
    "98f473274ee0056d6361d13083b7c6df68bc5e33a4592ac1b51bd7d970b3cf62",
    "1c34c19eb8e144b42457f9b1c7e15d3e8404ad23db9967245b827cc735bc67fc"
  ]) {
    assert.match(record, new RegExp(hash));
  }
});

test("1854 work item follows the 1855 closeout", () => {
  const item = workItems.work_items.find((candidate) => candidate.id === "NPREG-174");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-173"]);
  assert.deepEqual(item.completion_evidence, ["research/NP_1854_SYSTEM_RECORD.md", "src/data.js", "tests/np-1854-system.test.js"]);
});
