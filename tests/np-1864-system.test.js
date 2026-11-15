import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { sources, timeline } from "../src/data.js";
import workItems from "../docs/work-items.json" with { type: "json" };

test("1864 directory retains the operating station list and tariffs", () => {
  const event = timeline.find((entry) => entry.date === "1864" && entry.sourceId === "hutchinson-1864-telegraph-directory");
  assert.ok(event);
  assert.equal(event.status, "reported");
  assert.equal(event.category, "telecommunications operations");
  assert.match(event.body, /15 Newfoundland stations and four Cape Breton stations/);
  assert.match(event.body, /St\. Johns to Port au Basque tariff was \$2/);
  assert.match(event.body, /Port Hood to Newfoundland tariff was \$3/);
});

test("1864 Holyrood record uses the publication date without inventing the damage date", () => {
  const event = timeline.find((entry) => entry.date === "1864-11-12");
  assert.ok(event);
  assert.equal(event.status, "reported");
  assert.equal(event.category, "telecommunications fault");
  assert.match(event.title, /reported recent telegraph-wire damage near Holyrood/);
  assert.match(event.body, /does not give the event date/);
});

test("1864 Caplin Bay record identifies the pole and method", () => {
  const event = timeline.find((entry) => entry.date === "1864-11-21");
  assert.ok(event);
  assert.equal(event.status, "reported");
  assert.match(event.body, /one telegraph pole on the Caplin Bay road/);
  assert.match(event.body, /cut down with an axe and carried away/);
  assert.match(event.body, /does not identify the second incident/);
});

test("1864 source locators retain physical pages and evidence states", () => {
  const expected = new Map([
    ["hutchinson-1864-telegraph-directory", "physical PDF pp. 329 to 330"],
    ["mun-daybook-1864-holyrood-wire-damage", "physical PDF p. 1"],
    ["mun-daybook-1864-caplin-bay-pole", "physical PDF p. 2"]
  ]);
  for (const [sourceId, pageText] of expected) {
    const source = sources.find((entry) => entry.id === sourceId);
    assert.ok(source, sourceId);
    assert.match(source.pages, new RegExp(pageText.replaceAll(".", "\\.")));
    assert.equal(source.status, "reported");
  }
});

test("1864 research record retains primary-source hashes", () => {
  const record = fs.readFileSync(new URL("../research/NP_1864_SYSTEM_RECORD.md", import.meta.url), "utf8");
  for (const hash of [
    "98f370ce7e1949639c82ce0f26d7d62fbdd0292762b717dbf539d914bb3a9d18",
    "6f7383a99062023fa025df5f2c108ef9c03bb78a074f14365005fa23b4349060",
    "a9cdd4cafa90f3c94f0c54542ef7340d5e9aca9bca1fa2b9531e260ca2389f38"
  ]) {
    assert.match(record, new RegExp(hash));
  }
});

test("1864 work item follows the 1865 closeout", () => {
  const item = workItems.work_items.find((candidate) => candidate.id === "NPREG-164");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-163"]);
  assert.deepEqual(item.completion_evidence, ["research/NP_1864_SYSTEM_RECORD.md", "src/data.js", "tests/np-1864-system.test.js"]);
});
