import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { sources, timeline } from "../src/data.js";
import workItems from "../docs/work-items.json" with { type: "json" };

const eventBySource = (sourceId) => timeline.find((entry) => entry.sourceId === sourceId);

test("1856 inland construction record retains the measured gap and named endpoints", () => {
  const event = eventBySource("mun-public-ledger-1856-inland-line");
  assert.ok(event);
  assert.match(event.body, /Long Harbour in Fortune Bay/);
  assert.match(event.body, /about six miles/);
  assert.match(event.body, /Bay Despair/);
  assert.match(event.body, /Conn River/);
});

test("1856 operating records distinguish internal and through messages", () => {
  const internal = eventBySource("mun-morning-post-1856-bay-despair-messages");
  const through = eventBySource("mun-morning-post-1856-baddeck-message");
  assert.ok(internal);
  assert.ok(through);
  assert.match(internal.body, /messages passed between St\. John's and Bay Despair/);
  assert.match(internal.body, /completion to Port Hood as probable, not completed/);
  assert.match(through.body, /Baddeck, Cape Breton/);
  assert.match(through.body, /answer was promptly sent back/);
  assert.match(through.body, /predates the company's formal public-opening notice/);
});

test("1856 submarine cable record does not invent dates or landing points", () => {
  const event = eventBySource("mun-telegraph-1856-regional-cables");
  assert.ok(event);
  assert.match(event.body, /successfully laying submarine cables/);
  assert.match(event.body, /Cape Breton and Newfoundland/);
  assert.match(event.body, /New Brunswick and Prince Edward Island/);
  assert.match(event.body, /does not state the cable-laying dates or landing points/);
});

test("1856 interruption preserves the unresolved fault and time", () => {
  const event = eventBySource("mun-morning-post-1856-bay-despair-outage");
  assert.ok(event);
  assert.match(event.body, /between Bay Despair and Port aux Basques/);
  assert.match(event.body, /preceding Saturday morning/);
  assert.match(event.body, /does not identify the fault, exact incident date or repair time/);
});

test("1856 public opening retains service area, hours and manager", () => {
  const event = eventBySource("mun-times-1856-public-opening");
  assert.ok(event);
  assert.equal(event.date, "1856-11-14");
  assert.equal(event.category, "telecommunications commissioning");
  assert.match(event.body, /complete and open to the public/);
  assert.match(event.body, /United States and British North America/);
  assert.match(event.body, /three daily service periods/);
  assert.match(event.body, /A\. Shea as local manager/);
});

test("1856 source locators retain physical pages and reported state", () => {
  const expected = new Map([
    ["mun-public-ledger-1856-inland-line", "physical PDF p. 2"],
    ["mun-morning-post-1856-bay-despair-messages", "physical PDF p. 2"],
    ["mun-telegraph-1856-regional-cables", "physical PDF p. 3"],
    ["mun-morning-post-1856-baddeck-message", "physical PDF p. 2"],
    ["mun-morning-post-1856-bay-despair-outage", "physical PDF p. 2"],
    ["mun-times-1856-public-opening", "physical PDF p. 3"]
  ]);
  for (const [sourceId, pages] of expected) {
    const source = sources.find((entry) => entry.id === sourceId);
    assert.ok(source, sourceId);
    assert.equal(source.pages, pages);
    assert.equal(source.status, "reported");
  }
});

test("1856 research record retains source hashes", () => {
  const record = fs.readFileSync(new URL("../research/NP_1856_SYSTEM_RECORD.md", import.meta.url), "utf8");
  for (const hash of [
    "6bf15976f62b4dc6e1b5063e286d6eb6029b219516fa6bc8e1fd55198451123a",
    "76dc533d80c24ff1bf55ad1c41f6b1874766da2f1819096c5742e9ec78f98c28",
    "3045acc4ce5285b1f2baa8ba1dbc666e997ba4aa548e95b732506114cb39b65c",
    "2df57b43223787b9bec0e8d50e10cc34762e86ec3ba8fe42e6ed598927887eb9",
    "e541dedd59a8bd0d287b6e6ca45ad4c328532ddc0b22ae5c9c8453f948a0325f",
    "c4cf599d9fa0530271ce5071b534b0ce226dd628643f8ab183319f45c94824aa"
  ]) {
    assert.match(record, new RegExp(hash));
  }
});

test("1856 work item follows the 1857 closeout", () => {
  const item = workItems.work_items.find((candidate) => candidate.id === "NPREG-172");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-171"]);
  assert.deepEqual(item.completion_evidence, ["research/NP_1856_SYSTEM_RECORD.md", "src/data.js", "tests/np-1856-system.test.js"]);
});
