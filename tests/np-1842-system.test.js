import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { sources, timeline } from "../src/data.js";
import workItems from "../docs/work-items.json" with { type: "json" };

test("1842 records keep local steam activity separate from foreign electrical context", () => {
  const galvanic = timeline.find((entry) => entry.sourceId === "mun-public-ledger-1842-galvanic-blasting");
  assert.ok(galvanic);
  assert.equal(galvanic.date, "1842-06-14");
  assert.equal(galvanic.status, "reported");
  assert.match(galvanic.body, /battery and connecting wires/);
  assert.match(galvanic.body, /occurred outside Newfoundland/);

  const steam = timeline.find((entry) => entry.sourceId === "mun-royal-gazette-1842-st-johns-steamships");
  assert.ok(steam);
  assert.equal(steam.date, "1842-08-09");
  assert.equal(steam.status, "reported");
  assert.match(steam.body, /120 horsepower and 220 tons/);
  assert.match(steam.body, /proposed John M'Adam excursion/);
});

test("1842 source locators preserve reported and proposed states", () => {
  const expected = new Map([
    ["mun-public-ledger-1842-galvanic-blasting", ["physical PDF p. 2", "reported"]],
    ["mun-royal-gazette-1842-st-johns-steamships", ["physical PDF p. 2", "reported"]],
    ["mun-royal-gazette-1842-steam-mail-proposal", ["physical PDF p. 3", "proposed"]],
    ["mun-royal-gazette-1842-acoustic-submarine-telegraph", ["physical PDF p. 4", "reported"]]
  ]);
  for (const [sourceId, [pages, status]] of expected) {
    const source = sources.find((entry) => entry.id === sourceId);
    assert.ok(source, sourceId);
    assert.equal(source.pages, pages);
    assert.equal(source.status, status);
  }
});

test("1842 record preserves hashes and technology boundaries", () => {
  const record = fs.readFileSync(new URL("../research/NP_1842_SYSTEM_RECORD.md", import.meta.url), "utf8");
  for (const hash of [
    "909763a66cb29080e2c0d90ae194238fbdeece9c9c93750a3907c89d34d54001",
    "10d4365c1df740e6da9ba435449e7260f70fd45c4046c03e4170c35d929c22af",
    "31c2717bb762600671ef7998720562155a0598eb19a854fa387198dbee13c865"
  ]) {
    assert.match(record, new RegExp(hash));
  }
  assert.match(record, /did not use an electric circuit or submarine cable/);
  assert.match(record, /route remained a proposal/);
  assert.match(record, /No named 1842 Newfoundland electric-telegraph line/);
});

test("1842 work item is complete", () => {
  const item = workItems.work_items.find((entry) => entry.id === "NPREG-186");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-185"]);
  assert.deepEqual(item.completion_evidence, ["research/NP_1842_SYSTEM_RECORD.md", "src/data.js", "tests/np-1842-system.test.js"]);
});
