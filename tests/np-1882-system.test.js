import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { sources, timeline } from "../src/data.js";
import workItems from "../docs/work-items.json" with { type: "json" };

test("1882 record separates the built Harbor Breton branch from the Twillingate proposal", () => {
  const built = timeline.find((entry) => entry.date === "1882");
  const proposed = timeline.find((entry) => entry.date === "1882-07-14");
  assert.ok(built);
  assert.equal(built.category, "telecommunications");
  assert.match(built.title, /Coon River.*Harbor Breton/);
  assert.equal(built.status, "reported");
  assert.ok(proposed);
  assert.equal(proposed.category, "telecommunications proposal");
  assert.match(proposed.body, /Twillingate, Fogo/);
  assert.equal(proposed.status, "proposed");
});

test("1882 sources preserve both physical PDF pages", () => {
  const history = sources.find((entry) => entry.id === "mun-evening-mercury-1885-telegraph-history");
  const editorial = sources.find((entry) => entry.id === "mun-twillingate-sun-1882-telegraph-extension");
  assert.equal(history.pages, "physical PDF p. 2");
  assert.equal(editorial.pages, "physical PDF p. 54");
});

test("1882 research record retains source hashes and evidence boundaries", () => {
  const record = fs.readFileSync(new URL("../research/NP_1882_SYSTEM_RECORD.md", import.meta.url), "utf8");
  assert.match(record, /does not give the route length, conductor, pole construction, office equipment or opening date/);
  assert.match(record, /does not establish that a Twillingate or Fogo line was authorized or built in 1882/);
  assert.match(record, /f65cb202c6b44a6847245fd0b3cfee3c7ce4fa3899c6e7badc6e5b9ff22bce82/);
  assert.match(record, /009fb1a6c252a20bac2e187ce95a1664b47d771acce4ba5ab60b8ccb941787a2/);
});

test("1882 work item follows the 1883 queue", () => {
  const item = workItems.work_items.find((candidate) => candidate.id === "NPREG-146");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-145"]);
  assert.deepEqual(item.completion_evidence, ["research/NP_1882_SYSTEM_RECORD.md", "src/data.js", "tests/np-1882-system.test.js"]);
});
