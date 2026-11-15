import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { sources, timeline } from "../src/data.js";
import workItems from "../docs/work-items.json" with { type: "json" };

test("1884 record retains the private St. John's telephone line", () => {
  const event = timeline.find((entry) => entry.date === "1884");
  assert.ok(event);
  assert.equal(event.category, "telecommunications");
  assert.match(event.title, /private telephone line/);
  assert.match(event.body, /store and its manager's Devon Row residence/);
  assert.match(event.body, /not a public exchange/);
  assert.equal(event.status, "reported");
});

test("1884 sources retain exact page locators", () => {
  const encyclopedia = sources.find((entry) => entry.id === "mun-enl-1884-private-telephone");
  const chronology = sources.find((entry) => entry.id === "mun-when-was-that-1884-telephone");
  assert.equal(encyclopedia.pages, "physical PDF p. 15, printed p. 349");
  assert.equal(chronology.pages, "physical PDF p. 136, printed p. 128");
});

test("1884 research record preserves the store-attribution conflict and hashes", () => {
  const record = fs.readFileSync(new URL("../research/NP_1884_SYSTEM_RECORD.md", import.meta.url), "utf8");
  assert.match(record, /Store attribution conflict/);
  assert.match(record, /do not establish the same business description/);
  assert.match(record, /71cc87a4f940c4fc71c5f50d4337c80cd8f00caad8943725bbd834235eb51df6/);
  assert.match(record, /307c7817e695909f6dfd4048e86a559d2732113bf5fd15ae9aadf619af51fff7/);
});

test("1884 work item follows the 1885 queue", () => {
  const item = workItems.work_items.find((candidate) => candidate.id === "NPREG-144");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-143"]);
  assert.deepEqual(item.completion_evidence, ["research/NP_1884_SYSTEM_RECORD.md", "src/data.js", "tests/np-1884-system.test.js"]);
});
