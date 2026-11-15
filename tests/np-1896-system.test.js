import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { sources, timeline } from "../src/data.js";
import workItems from "../docs/work-items.json" with { type: "json" };

test("1896 record preserves the proposed electric railway and withheld assent", () => {
  const event = timeline.find((entry) => entry.date === "1896");
  assert.ok(event);
  assert.match(event.title, /awaited royal assent/);
  assert.match(event.body, /Governor declined assent/);
  assert.match(event.body, /does not establish company incorporation, construction or operation/);

  const notice = sources.find((entry) => entry.id === "mun-1896-evening-herald-street-railway-notice");
  assert.equal(notice.status, "proposed");
  assert.match(JSON.stringify(notice.topics), /electric traction/);
});

test("1896 sources retain exact pages and file hashes", () => {
  const notice = sources.find((entry) => entry.id === "mun-1896-evening-herald-street-railway-notice");
  const bill = sources.find((entry) => entry.id === "mun-1896-daily-news-street-railway-bill");
  assert.equal(notice.pages, "physical PDF p. 1");
  assert.equal(bill.pages, "physical PDF p. 4");
  const record = fs.readFileSync(new URL("../research/NP_1896_SYSTEM_RECORD.md", import.meta.url), "utf8");
  assert.match(record, /c0eadfc6f13f3a85d38181208497fb1d734342c1f3f9998bc0618acd5bd0b6a9/);
  assert.match(record, /7df15216849ddb603e8674957fb9a08503c570e40e1f7eaf5d3d884c1eaf526a/);
  assert.match(record, /not proof of an incorporated company or operating electrical system/);
});

test("1896 work item follows the 1897 queue", () => {
  const item = workItems.work_items.find((candidate) => candidate.id === "NPREG-132");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-131"]);
  assert.deepEqual(item.completion_evidence, ["research/NP_1896_SYSTEM_RECORD.md", "src/data.js", "tests/np-1896-system.test.js"]);
});
