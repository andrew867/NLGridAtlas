import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { sources, timeline } from "../src/data.js";
import workItems from "../docs/work-items.json" with { type: "json" };

test("1877 record retains both completed telegraph line groups", () => {
  const event = timeline.find((entry) => entry.date === "1877" && /Two telegraph line groups/.test(entry.title));
  assert.ok(event);
  for (const place of ["Trinity", "Catalina", "Bonavista", "King's Cove", "St. George's Bay", "Bay of Islands", "Bonne Bay", "Batt's Cove", "Tilt Cove", "Little Bay"]) {
    assert.match(event.body, new RegExp(place.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.equal(event.status, "reported");
});

test("1877 telegraph protection record retains the named equipment", () => {
  const event = timeline.find((entry) => entry.date === "1877-04-26");
  assert.ok(event);
  assert.match(event.body, /batteries, machinery, wire-cable and posts/);
  assert.match(event.body, /electric or magnetic telegraph/);
  assert.equal(event.status, "verified");
});

test("1877 sources preserve review and statute locators", () => {
  const review = sources.find((entry) => entry.id === "mun-evening-mercury-1885-telegraph-history");
  const statute = sources.find((entry) => entry.id === "nl-statutes-1877-telegraph-protection");
  assert.equal(review?.pages, "physical PDF p. 2");
  assert.equal(review?.status, "reported");
  assert.equal(statute?.pages, "physical PDF pp. 391 to 393, printed pp. 56 to 58");
  assert.equal(statute?.status, "verified");
});

test("1877 research record retains source hashes and evidence boundaries", () => {
  const record = fs.readFileSync(new URL("../research/NP_1877_SYSTEM_RECORD.md", import.meta.url), "utf8");
  assert.match(record, /completion year remains reported because the account was published eight years later/);
  assert.match(record, /not an inventory of the equipment installed on a particular line/);
  assert.match(record, /f65cb202c6b44a6847245fd0b3cfee3c7ce4fa3899c6e7badc6e5b9ff22bce82/);
  assert.match(record, /c0d7b134de700686abc6d5f283aab7f6bacf3c6d0cd9d8650e525d54c762770d/);
});

test("1877 work item follows the 1878 queue", () => {
  const item = workItems.work_items.find((candidate) => candidate.id === "NPREG-151");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-150"]);
  assert.deepEqual(item.completion_evidence, ["research/NP_1877_SYSTEM_RECORD.md", "src/data.js", "tests/np-1877-system.test.js"]);
});
