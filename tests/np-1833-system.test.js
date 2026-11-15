import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { sources, timeline } from "../src/data.js";
import workItems from "../docs/work-items.json" with { type: "json" };

test("1833 governor message separates existing Fort Amherst practice from Cape Spear proposal", () => {
  const fort = timeline.find((entry) => entry.title === "Governor described the Fort Amherst fog-warning gun");
  const cape = timeline.find((entry) => entry.title === "Governor proposed an ordinary light and heavy gun at Cape Spear");
  assert.ok(fort);
  assert.equal(fort.date, "1833-01-10");
  assert.equal(fort.status, "reported");
  assert.match(fort.body, /gun was fired occasionally from Fort Amherst/);
  assert.match(fort.body, /sound to carry far/);
  assert.ok(cape);
  assert.equal(cape.status, "proposed");
  assert.match(cape.body, /ordinary light and a heavy gun/);
  assert.match(cape.body, /moderate expense/);
  assert.equal(fort.sourceId, cape.sourceId);
});

test("1833 Chamber report preserves unnamed lighthouse sites and Narrows mooring work", () => {
  const sites = timeline.find((entry) => entry.title === "Chamber reported a coastal lighthouse-site review");
  const buoys = timeline.find((entry) => entry.title === "Chamber reported mooring buoys installed in the Narrows");
  assert.ok(sites);
  assert.equal(sites.date, "1833-08-07");
  assert.equal(sites.status, "reported");
  assert.match(sites.body, /committee identified/);
  assert.match(sites.body, /does not name the sites/);
  assert.ok(buoys);
  assert.equal(buoys.status, "reported");
  assert.match(buoys.body, /mooring buoys in the Narrows/);
  assert.match(buoys.body, /November gale/);
  assert.match(buoys.body, /Captain Bonifant/);
});

test("1833 sources retain exact page locators and states", () => {
  const expected = new Map([
    ["mun-public-ledger-1833-fort-amherst-cape-spear-governor-message", ["physical PDF pp. 1 and 4", "reported"]],
    ["mun-times-1833-chamber-lighthouse-sites-mooring-buoys", ["physical PDF p. 1", "reported"]]
  ]);
  for (const [sourceId, [pages, status]] of expected) {
    const source = sources.find((entry) => entry.id === sourceId);
    assert.ok(source, sourceId);
    assert.equal(source.pages, pages);
    assert.equal(source.status, status);
  }
});

test("1833 research record preserves hashes and evidence limits", () => {
  const record = fs.readFileSync(new URL("../research/NP_1833_SYSTEM_RECORD.md", import.meta.url), "utf8");
  for (const hash of [
    "8131d9d259695f5bbff0e13aa8f20c88f67cf4ba4459f5d776b228160c92d4ad",
    "58de6f1e1b4d21835029cac60cb86895631e13dc100867a29e6446a869a744c5",
    "66963d561a2023c55d0e8451c33e20d7bb40916f0fc7c10f2a306292b382e38a"
  ]) {
    assert.match(record, new RegExp(hash));
  }
  assert.match(record, /not an operating log/);
  assert.match(record, /does not establish construction or operation in 1833/);
  assert.match(record, /No named 1833 Newfoundland telegraph instrument/);
});

test("1833 work item is complete", () => {
  const item = workItems.work_items.find((entry) => entry.id === "NPREG-195");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-194"]);
  assert.deepEqual(item.completion_evidence, ["research/NP_1833_SYSTEM_RECORD.md", "src/data.js", "tests/np-1833-system.test.js"]);
});
