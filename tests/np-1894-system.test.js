import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { sources, timeline } from "../src/data.js";
import workItems from "../docs/work-items.json" with { type: "json" };

test("1894 record retains Low's measured Grand Falls values", () => {
  const event = timeline.find((entry) => entry.date === "1894");
  assert.ok(event);
  assert.match(event.title, /Low surveyed Grand Falls/);
  assert.match(event.body, /760 ft/);
  assert.match(event.body, /302 ft/);
  assert.match(event.body, /50,000 ft3\/s/);
  assert.doesNotMatch(event.body, /horsepower|megawatt|kilowatt/i);
});

test("1894 source retains the expedition and survey pages", () => {
  const source = sources.find((entry) => entry.id === "gsc-1896-low-grand-falls-survey");
  assert.equal(source.pages, "physical PDF pp. 6 and 140 to 142, printed pp. 6L and 140L to 142L");
  const record = fs.readFileSync(new URL("../research/NP_1894_SYSTEM_RECORD.md", import.meta.url), "utf8");
  assert.match(record, /1,660 ft above sea level/);
  assert.match(record, /aaa088290ce9b3762f83e1e4c8c00b95c48172c80d175d654b0a396862c5e8da/);
  assert.match(record, /does not calculate electrical output/);
});

test("1894 work item follows the 1895 queue", () => {
  const item = workItems.work_items.find((candidate) => candidate.id === "NPREG-134");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-133"]);
  assert.deepEqual(item.completion_evidence, ["research/NP_1894_SYSTEM_RECORD.md", "src/data.js", "tests/np-1894-system.test.js"]);
});
