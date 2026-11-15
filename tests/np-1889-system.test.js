import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { sources, timeline } from "../src/data.js";
import workItems from "../docs/work-items.json" with { type: "json" };

test("1889 record retains the completed incandescent plant and equipment values", () => {
  const event = timeline.find((entry) => entry.date === "1889-04-27");
  assert.ok(event);
  assert.match(event.title, /incandescent plant entered service/);
  assert.match(event.body, /300 A and 125 V at 650 r\/min/);
  assert.match(event.body, /30 A and 158 V at 1,050 r\/min/);
  assert.match(event.body, /2,800 yd/);
});

test("1889 source retains the physical page, calculations and source hashes", () => {
  const source = sources.find((entry) => entry.id === "mun-1889-evening-mercury-incandescent-plant");
  assert.equal(source.pages, "physical PDF p. 4");
  const record = fs.readFileSync(new URL("../research/NP_1889_SYSTEM_RECORD.md", import.meta.url), "utf8");
  assert.match(record, /37.5 kW and 4.74 kW/);
  assert.match(record, /Manchester Edison Swan Company Limited/);
  assert.match(record, /4e06e700773187be3ce2cf621a0c31b98efdd923bdbc48703f63b495d6cf8698/);
  assert.match(record, /8595d438b53ee06b70e25c4c11d9d97c100a2801eb016dadd17362b9ba4a56d3/);
});

test("1889 work item follows the 1890 queue", () => {
  const item = workItems.work_items.find((candidate) => candidate.id === "NPREG-139");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-138"]);
  assert.deepEqual(item.completion_evidence, ["research/NP_1889_SYSTEM_RECORD.md", "src/data.js", "tests/np-1889-system.test.js"]);
});
