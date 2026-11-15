import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { sources, timeline } from "../src/data.js";
import workItems from "../docs/work-items.json" with { type: "json" };

test("1874 record retains the reported Faraday cable attempt", () => {
  const event = timeline.find((entry) => entry.date === "1874-07-26");
  assert.ok(event);
  assert.match(event.body, /Direct United States Cable Company/);
  assert.match(event.body, /several miles within the bay's headlands/);
  assert.match(event.body, /United States and the United Kingdom through Newfoundland/);
  assert.equal(event.status, "reported");
});

test("1874 record retains the limited injunction", () => {
  const event = timeline.find((entry) => entry.date === "1874-08-29");
  assert.ok(event);
  assert.match(event.body, /bringing a submarine cable to shore or landing one/);
  assert.match(event.body, /constructing land lines/);
  assert.match(event.body, /operating a telegraph line on the island/);
  assert.equal(event.status, "reported");
});

test("1874 sources preserve exact physical page locators", () => {
  const attempt = sources.find((entry) => entry.id === "mun-times-1874-faraday-cable-attempt");
  const injunction = sources.find((entry) => entry.id === "mun-times-1874-cable-injunction");
  assert.equal(attempt?.pages, "physical PDF p. 1");
  assert.equal(injunction?.pages, "physical PDF pp. 1 to 2");
});

test("1874 research record retains the source hash and court limits", () => {
  const record = fs.readFileSync(new URL("../research/NP_1874_SYSTEM_RECORD.md", import.meta.url), "utf8");
  assert.match(record, /three miles east of Harbor Grace Island/);
  assert.match(record, /limited the interim order to work within Newfoundland jurisdiction/);
  assert.match(record, /5eb9816140bd2779023988342e1425e22b4d82e4db68d63f73294a5f1fb27123/);
});

test("1874 work item follows the 1875 queue", () => {
  const item = workItems.work_items.find((candidate) => candidate.id === "NPREG-154");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-153"]);
  assert.deepEqual(item.completion_evidence, ["research/NP_1874_SYSTEM_RECORD.md", "src/data.js", "tests/np-1874-system.test.js"]);
});
