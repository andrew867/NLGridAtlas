import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { sources, timeline } from "../src/data.js";
import workItems from "../docs/work-items.json" with { type: "json" };

test("1885 record retains the Flavin Lane generating system", () => {
  const event = timeline.find((entry) => entry.date === "1885");
  assert.ok(event);
  assert.match(event.title, /Flavin Lane steam plant/);
  assert.match(event.body, /3,700 V direct current/);
  assert.match(event.body, /200 candlepower arc lamps/);
  assert.equal(event.status, "reported");
});

test("1885 timeline retains the first test and communications-wire incident", () => {
  const firstTest = timeline.find((entry) => entry.date === "1885-10-17");
  const contact = timeline.find((entry) => entry.date === "1885-10-19");
  assert.match(firstTest.body, /headquarters lamps had been lit for the first time/);
  assert.match(contact.body, /telegraph and telephone wires/);
  assert.match(contact.body, /50 drops opened/);
  assert.match(contact.body, /Holyrood/);
});

test("1885 sources preserve page locators and file hashes", () => {
  const source = sources.find((entry) => entry.id === "mun-1885-evening-mercury-wire-contact");
  assert.equal(source.pages, "physical PDF p. 3");
  const record = fs.readFileSync(new URL("../research/NP_1885_SYSTEM_RECORD.md", import.meta.url), "utf8");
  assert.match(record, /f24c80a2df96721b8cef06f7a6e5715239693e0fb4ec613c585c72cafd6e8f12/);
  assert.match(record, /be41fcc4f0ceddcf27dbd63bc5dbd1b553be04c801f782531206192a3427938c/);
  assert.match(record, /6f57b53e8035b6f8ec2bb59542e72e0527b2bc97f4ffa74ad2179af37498f788/);
});

test("1885 work item follows the 1886 queue", () => {
  const item = workItems.work_items.find((candidate) => candidate.id === "NPREG-143");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-142"]);
  assert.deepEqual(item.completion_evidence, ["research/NP_1885_SYSTEM_RECORD.md", "src/data.js", "tests/np-1885-system.test.js"]);
});
