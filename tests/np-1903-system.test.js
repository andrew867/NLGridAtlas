import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { sources, timeline } from "../src/data.js";
import workItems from "../docs/work-items.json" with { type: "json" };

test("1903 record keeps Black River mechanical water power separate from electric generation", () => {
  const event = timeline.find((entry) => entry.date === "1903");
  assert.ok(event);
  assert.equal(event.category, "industrial water power");
  assert.match(event.title, /Black River pulp mill/);
  assert.match(event.body, /12,000 hp/);
  assert.match(event.body, /does not identify electric generation or a grid connection/);
  assert.doesNotMatch(event.body, /MW/);
});

test("1903 sources retain exact pages and file hashes", () => {
  const quarterly = sources.find((entry) => entry.id === "mun-1998-black-river-pulp-mill");
  assert.equal(quarterly.pages, "physical PDF p. 16, printed p. 14");
  const survey = sources.find((entry) => entry.id === "dfo-1966-black-river-survey");
  assert.equal(survey.pages, "physical PDF p. 12, report p. 7");

  const record = fs.readFileSync(new URL("../research/NP_1903_SYSTEM_RECORD.md", import.meta.url), "utf8");
  assert.match(record, /direct mechanical water power/);
  assert.match(record, /not converted into an electrical megawatt rating/);
  assert.match(record, /6b501adf29cbd85be795b84f686b1fdcce664af4d446d01b9da132c6c1342434/);
  assert.match(record, /4a926bf30bbbdc60d70cd4217064ca61d29aa532cc051364893f9cc1754ed520/);
});

test("1903 work item follows the 1904 queue", () => {
  const item = workItems.work_items.find((candidate) => candidate.id === "NPREG-125");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-124"]);
  assert.deepEqual(item.completion_evidence, ["research/NP_1903_SYSTEM_RECORD.md", "src/data.js", "tests/np-1903-system.test.js"]);
});
