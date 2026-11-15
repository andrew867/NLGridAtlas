import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { sources, timeline } from "../src/data.js";
import workItems from "../docs/work-items.json" with { type: "json" };

test("1875 record retains the withdrawn Direct Cable offer", () => {
  const event = timeline.find((entry) => entry.date === "1875-02-16");
  assert.ok(event);
  assert.match(event.body, /£30,000/);
  assert.match(event.body, /exercise pre-emption/);
  assert.match(event.body, /Faraday failed to lay the cable/);
  assert.equal(event.status, "reported");
});

test("1875 House motion remains proposed", () => {
  const event = timeline.find((entry) => entry.date === "1875-04-17");
  assert.ok(event);
  assert.match(event.body, /purchase rights under the 1854 charter/);
  assert.match(event.body, /prorogued the session before the journal recorded a vote/);
  assert.equal(event.status, "proposed");
});

test("1875 tariff record retains the operating station network", () => {
  const event = timeline.find((entry) => entry.date === "1875-11-06");
  assert.ok(event);
  for (const place of ["St. John's", "Holyrood", "Salmonier", "Placentia", "Brigus", "Bay Roberts", "Harbor Grace", "Carbonear", "Heart's Content"]) {
    assert.match(event.body, new RegExp(place.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.match(event.body, /75 cents to 50 cents per word/);
  assert.equal(event.status, "reported");
});

test("1875 sources preserve exact physical page locators", () => {
  const offer = sources.find((entry) => entry.id === "nl-assembly-1875-direct-cable-offer");
  const motion = sources.find((entry) => entry.id === "nl-assembly-1875-telegraph-motion");
  const tariff = sources.find((entry) => entry.id === "mun-north-star-1875-telegraph-tariff");
  assert.equal(offer?.pages, "physical PDF pp. 1368 to 1369, printed pp. 1145 to 1146");
  assert.equal(motion?.pages, "physical PDF p. 213, printed p. 205");
  assert.equal(tariff?.pages, "physical PDF p. 2");
});

test("1875 research record retains source hashes and evidence boundaries", () => {
  const record = fs.readFileSync(new URL("../research/NP_1875_SYSTEM_RECORD.md", import.meta.url), "utf8");
  assert.match(record, /withdrawn proposal and failed cable-laying attempt/);
  assert.match(record, /before the journal recorded a vote/);
  assert.match(record, /does not identify line lengths, conductor construction, office equipment or traffic volume/);
  assert.match(record, /37c6216a83ba95ed715565111ff91790b5381cb32b84f3abdd47f0d700ec4473/);
  assert.match(record, /b1b4be62029d6604431d60c4ba82ff15b02e5ab558dd92da2269521f86ebb220/);
});

test("1875 work item follows the 1876 queue", () => {
  const item = workItems.work_items.find((candidate) => candidate.id === "NPREG-153");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-152"]);
  assert.deepEqual(item.completion_evidence, ["research/NP_1875_SYSTEM_RECORD.md", "src/data.js", "tests/np-1875-system.test.js"]);
});
