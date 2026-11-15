import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { sources, timeline } from "../src/data.js";
import workItems from "../docs/work-items.json" with { type: "json" };

test("1883 record retains Bell's Newfoundland telephone proposal", () => {
  const event = timeline.find((entry) => entry.date === "1883-03-06");
  assert.ok(event);
  assert.equal(event.category, "telecommunications proposal");
  assert.match(event.title, /Bell petitioned for a Newfoundland telephone charter/);
  assert.match(event.body, /manufacture, sell or lease telephones/);
  assert.match(event.body, /construct and operate telephone lines/);
  assert.match(event.body, /select committee/);
  assert.equal(event.status, "proposed");
});

test("1883 sources preserve the legislative and patent-notice pages", () => {
  const petition = sources.find((entry) => entry.id === "nl-assembly-1883-bell-telephone-petition");
  const notices = sources.find((entry) => entry.id === "mun-times-1883-bell-telephone-patents");
  assert.equal(petition.pages, "physical PDF pp. 88 to 89 and 93, printed pp. 55 to 56 and 60");
  assert.equal(notices.pages, "physical PDF p. 3");
});

test("1883 research record retains source hashes and proposal boundary", () => {
  const record = fs.readFileSync(new URL("../research/NP_1883_SYSTEM_RECORD.md", import.meta.url), "utf8");
  assert.match(record, /not an enacted Bell charter or an operating Bell system/);
  assert.match(record, /dfc29a2c6ad2a3cda04f995cb5e7ea4bdc75dd1c8c1105bd5cafd86e75761b43/);
  assert.match(record, /19914fb4a8aa3f2e17a7b639c8b3c663a8af7979e0bcd8a4d37b704757a8ebfb/);
});

test("1883 work item follows the 1884 queue", () => {
  const item = workItems.work_items.find((candidate) => candidate.id === "NPREG-145");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-144"]);
  assert.deepEqual(item.completion_evidence, ["research/NP_1883_SYSTEM_RECORD.md", "src/data.js", "tests/np-1883-system.test.js"]);
});
