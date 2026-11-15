import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { sources, timeline } from "../src/data.js";
import workItems from "../docs/work-items.json" with { type: "json" };

test("1862 company notice retains the offices and two tariffs", () => {
  const event = timeline.find((entry) => entry.date === "1862-02-19");
  assert.ok(event);
  assert.equal(event.status, "reported");
  assert.equal(event.category, "telecommunications operations");
  assert.match(event.body, /Market House Buildings in St\. John's/);
  assert.match(event.body, /Temperance Hall Building in Harbor Grace/);
  assert.match(event.body, /cost 25 cents/);
  assert.match(event.body, /cost \$1\.50/);
});

test("1862 court record remains an indictment rather than a conviction", () => {
  const event = timeline.find((entry) => entry.date === "1862-05-05");
  assert.ok(event);
  assert.equal(event.category, "telecommunications regulation");
  assert.match(event.body, /true bill against Phelan/);
  assert.match(event.body, /an indictment, not a conviction/);
});

test("1862 Aquaforte fault uses the publication date and preserves the repair dispatch", () => {
  const event = timeline.find((entry) => entry.date === "1862-05-10");
  assert.ok(event);
  assert.equal(event.status, "reported");
  assert.equal(event.category, "telecommunications fault");
  assert.match(event.body, /Tuesday night before publication/);
  assert.match(event.body, /conveyance left St\. John's with replacement wire/);
  assert.match(event.body, /communication with Cape Race and Europe was unavailable for a time/);
  assert.match(event.body, /no damaged length or return-to-service time/);
});

test("1862 South Shore record retains the measured loss and relative timing", () => {
  const event = timeline.find((entry) => entry.date === "1862-05-24");
  assert.ok(event);
  assert.match(event.body, /About 30 yards of wire/);
  assert.match(event.body, /Renews/);
  assert.match(event.body, /Aquaforte and Cape Broyle/);
  assert.match(event.body, /same evening within four hours/);
  assert.match(event.body, /no exact incident dates or repair status/);
});

test("1862 source locators retain physical pages and evidence states", () => {
  const expected = new Map([
    ["mun-almanac-1862-telegraph-company", "physical PDF p. 53"],
    ["mun-daybook-1862-aquaforte-telegraph", "physical PDF pp. 2 to 4"],
    ["mun-daybook-1862-south-shore-wire-cutting", "physical PDF p. 1"]
  ]);
  for (const [sourceId, pageText] of expected) {
    const source = sources.find((entry) => entry.id === sourceId);
    assert.ok(source, sourceId);
    assert.match(source.pages, new RegExp(pageText.replaceAll(".", "\\.")));
    assert.equal(source.status, "reported");
  }
});

test("1862 research record retains primary-source hashes", () => {
  const record = fs.readFileSync(new URL("../research/NP_1862_SYSTEM_RECORD.md", import.meta.url), "utf8");
  for (const hash of [
    "d9140f2c9311454d3a6946369f79ee63294117d448bab8f0b2fad914bdcff56f",
    "2837dbd0f6697f7373a5dffed8d65fac2f04d406393b4482961f3325e6a9885e",
    "be32c279f8133721cdb090d8920960795e81675e26a259b488c75b139d11b33c"
  ]) {
    assert.match(record, new RegExp(hash));
  }
});

test("1862 work item follows the 1863 closeout", () => {
  const item = workItems.work_items.find((candidate) => candidate.id === "NPREG-166");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-165"]);
  assert.deepEqual(item.completion_evidence, ["research/NP_1862_SYSTEM_RECORD.md", "src/data.js", "tests/np-1862-system.test.js"]);
});
