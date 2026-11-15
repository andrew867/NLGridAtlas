import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { sources, timeline } from "../src/data.js";
import workItems from "../docs/work-items.json" with { type: "json" };

test("1877 record retains only the contemporary eastern connections", () => {
  const event = timeline.find((entry) => entry.date === "1877-10");
  assert.ok(event);
  for (const place of ["Trinity", "Catalina", "Bonavista"]) {
    assert.match(event.body, new RegExp(place.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.match(event.body, /western line as an arrangement for future construction/);
  assert.match(event.body, /conflicts with the contemporary sequence/);
  assert.equal(event.status, "reported");
});

test("1877 telegraph protection record retains the named equipment", () => {
  const event = timeline.find((entry) => entry.date === "1877-04-26");
  assert.ok(event);
  assert.match(event.body, /batteries, machinery, wire-cable and posts/);
  assert.match(event.body, /electric or magnetic telegraph/);
  assert.equal(event.status, "verified");
});

test("1877 sources preserve contemporary, review and statute locators", () => {
  const contemporary = sources.find((entry) => entry.id === "mun-north-star-1878-telegraph-status");
  const review = sources.find((entry) => entry.id === "mun-evening-mercury-1885-telegraph-history");
  const statute = sources.find((entry) => entry.id === "nl-statutes-1877-telegraph-protection");
  assert.equal(contemporary?.pages, "physical PDF p. 2");
  assert.equal(contemporary?.status, "reported");
  assert.equal(review?.pages, "physical PDF p. 2");
  assert.equal(review?.status, "reported");
  assert.equal(statute?.pages, "physical PDF pp. 391 to 393, printed pp. 56 to 58");
  assert.equal(statute?.status, "verified");
});

test("1877 research record retains source hashes and evidence boundaries", () => {
  const record = fs.readFileSync(new URL("../research/NP_1877_SYSTEM_RECORD.md", import.meta.url), "utf8");
  assert.match(record, /Trinity, Catalina and Bonavista had been connected with the capital since October 1877/);
  assert.match(record, /western construction beginning and King's Cove still pending during 1878/);
  assert.match(record, /not an inventory of the equipment installed on a particular line/);
  assert.match(record, /16c0e898ea2543e1eb1dc3a0fdc937693bf5982d74ab5b139b70676189d16b03/);
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
