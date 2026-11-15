import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { sources, timeline } from "../src/data.js";
import workItems from "../docs/work-items.json" with { type: "json" };

test("1895 record keeps the Reid electrical tramway notice at proposal state", () => {
  const event = timeline.find((entry) => entry.date === "1895");
  assert.ok(event);
  assert.match(event.title, /electrical tramway proposal/);
  assert.match(event.body, /September/);
  assert.match(event.body, /published a notice daily for a month/);
  assert.match(event.body, /did not establish construction or operation/);
});

test("1895 source retains its exact page and file hash", () => {
  const source = sources.find((entry) => entry.id === "mun-1965-st-johns-electrical-tramway-notice");
  assert.equal(source.pages, "physical PDF p. 6, printed p. 4");
  const record = fs.readFileSync(new URL("../research/NP_1895_SYSTEM_RECORD.md", import.meta.url), "utf8");
  assert.match(record, /8b429721b73b312ea8bc11faca11173e0789988b38cd1cc3f2f16b40fb88ff95/);
  assert.match(record, /does not establish an incorporated company, an approved charter, construction or operation/);
});

test("1895 work item follows the 1896 queue", () => {
  const item = workItems.work_items.find((candidate) => candidate.id === "NPREG-133");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-132"]);
  assert.deepEqual(item.completion_evidence, ["research/NP_1895_SYSTEM_RECORD.md", "src/data.js", "tests/np-1895-system.test.js"]);
});
