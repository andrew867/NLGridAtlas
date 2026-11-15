import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { sources, timeline } from "../src/data.js";
import workItems from "../docs/work-items.json" with { type: "json" };

test("1888 record retains the contract and reported incandescent expansion", () => {
  const event = timeline.find((entry) => entry.date === "1888");
  assert.ok(event);
  assert.match(event.title, /contracted for street lighting/);
  assert.match(event.body, /16 candlepower/);
  assert.match(event.body, /Government House and the Colonial Building/);
  assert.match(event.body, /private-home installations/);
});

test("1888 sources preserve the page locators, proposal boundary and hashes", () => {
  const source = sources.find((entry) => entry.id === "mun-enl-1888-electricity");
  assert.equal(source.pages, "physical PDF p. 92, printed p. 752");
  const record = fs.readFileSync(new URL("../research/NP_1888_SYSTEM_RECORD.md", import.meta.url), "utf8");
  assert.match(record, /does not state that all nine recommended electric lamps were installed/);
  assert.match(record, /notice does not report the meeting result/);
  assert.match(record, /6f57b53e8035b6f8ec2bb59542e72e0527b2bc97f4ffa74ad2179af37498f788/);
  assert.match(record, /47a6e79cf22e8a9f86dd20951e48b7c5ab3fe230622ab87d9eba24505bacb5f0/);
  assert.match(record, /e91e6f3ec48b5881befca773073e805fc34129ed55fec6bd440bd043fcc0cd2e/);
});

test("1888 work item follows the 1889 queue", () => {
  const item = workItems.work_items.find((candidate) => candidate.id === "NPREG-140");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-139"]);
  assert.deepEqual(item.completion_evidence, ["research/NP_1888_SYSTEM_RECORD.md", "src/data.js", "tests/np-1888-system.test.js"]);
});
