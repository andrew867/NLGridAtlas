import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { sources, timeline } from "../src/data.js";
import workItems from "../docs/work-items.json" with { type: "json" };

const eventBySource = (sourceId) => timeline.find((entry) => entry.sourceId === sourceId);

test("1851 statute retains capital, route and government terms", () => {
  const event = eventBySource("mun-statutes-1851-telegraph-act");
  assert.ok(event);
  assert.equal(event.date, "1851-05-31");
  assert.equal(event.status, "verified");
  assert.match(event.body, /£20,000 in 1,000 shares of £20/);
  assert.match(event.body, /no more than £10,000/);
  assert.match(event.body, /Cape Ray/);
  assert.match(event.body, /Trepassey/);
  assert.match(event.body, /Cape North/);
});

test("1851 construction records do not imply operating service", () => {
  const plan = eventBySource("mun-morning-post-1851-carbonear-plan");
  const poles = eventBySource("mun-morning-post-1851-brigus-poles");
  const wire = eventBySource("mun-morning-post-1851-harbor-grace-wire");
  assert.equal(plan.status, "proposed");
  assert.match(plan.body, /not operating service/);
  assert.match(poles.body, /does not establish an operating circuit/);
  assert.match(wire.body, /does not establish public service/);
});

test("1851 survey records preserve field estimates and stopping point", () => {
  const costs = eventBySource("mun-gisborne-1851-survey-costs");
  const returned = eventBySource("mun-gisborne-1851-survey-return");
  assert.equal(costs.status, "verified");
  assert.match(costs.body, /£25 and £30 per mile/);
  assert.match(costs.body, /£10 to £80/);
  assert.match(costs.body, /not final construction costs/);
  assert.equal(returned.date, "1851-12-04");
  assert.match(returned.body, /13 or 14 miles/);
  assert.match(returned.body, /snow prevented/);
  assert.match(returned.body, /Salmonier on December 2/);
  assert.match(returned.body, /Holyrood on December 3/);
});

test("1851 completion conflict remains unresolved", () => {
  const conflict = eventBySource("mun-public-ledger-1851-completion-conflict");
  const status = eventBySource("mun-public-ledger-1851-line-status");
  assert.equal(conflict.status, "unresolved");
  assert.match(conflict.body, /said.*complete/);
  assert.match(conflict.body, /disputed/);
  assert.match(conflict.body, /Topsail/);
  assert.match(status.body, /very nearly complete/);
  assert.match(status.body, /does not establish public operation/);
});

test("1851 source locators retain pages and evidence states", () => {
  const expected = new Map([
    ["mun-morning-post-1851-carbonear-plan", ["physical PDF p. 2", "reported"]],
    ["mun-statutes-1851-telegraph-act", ["physical PDF pp. 36 to 40, Chapter 7", "verified"]],
    ["mun-morning-post-1851-commissioners", ["physical PDF p. 2", "reported"]],
    ["mun-courier-1851-cape-ray-survey", ["physical PDF p. 2", "reported"]],
    ["mun-morning-post-1851-brigus-poles", ["physical PDF p. 2", "reported"]],
    ["mun-morning-post-1851-harbor-grace-wire", ["physical PDF p. 2", "reported"]],
    ["mun-gisborne-1851-survey-costs", ["physical PDF pp. 9, 10, 15, 16, 18, 23, 25 and 27", "verified"]],
    ["mun-public-ledger-1851-post-damage", ["physical PDF p. 2", "reported"]],
    ["mun-public-ledger-1851-completion-conflict", ["physical PDF p. 2", "unresolved"]],
    ["mun-gisborne-1851-survey-return", ["physical PDF pp. 31 and 36", "verified"]],
    ["mun-public-ledger-1851-line-status", ["physical PDF p. 2", "reported"]]
  ]);
  for (const [sourceId, [pages, status]] of expected) {
    const source = sources.find((entry) => entry.id === sourceId);
    assert.ok(source, sourceId);
    assert.equal(source.pages, pages);
    assert.equal(source.status, status);
  }
});

test("1851 research record retains all source hashes", () => {
  const record = fs.readFileSync(new URL("../research/NP_1851_SYSTEM_RECORD.md", import.meta.url), "utf8");
  for (const hash of [
    "e08d00e0cc42625d58244a67da9d33be956a55caf1f9b8b002805dcfe86260c6",
    "8095f89b8be9dc618f0481c3249f64581d13d034885937b7956c25c8d2d9dc70",
    "e94688655a357da8ca4327f4f2a8adb182bd1ad84bd6bbe7582842f1b8865557",
    "3c081577ff5a804ed6124848322854319d797222db7b8af30d21adbd55f7b105",
    "6baafd7dd070d2c66cc115f99343e78eb6d962d9454d6c9610bff67290b2486f",
    "8576cc2e434ef351bd32b5d2d06ec5f20c1aafcb73d2861644b0a50579453aed",
    "f0cc53a83788fd1da37298ba7c5370498835adfc56ed13bfe3eae65237e05367",
    "17ac4526ec2dedd8284beb94106649f71498208d3ec129b71a1a071ab568ade6",
    "c514324c2216600abc0c551ce64f01ed4a10b7e6eb33dbdef1458beca1714f60",
    "1e3df19507080ebbdba232e915e7ad795ae420942bb04b9981d516b4ef3380bd"
  ]) {
    assert.match(record, new RegExp(hash));
  }
});

test("1851 work item is complete", () => {
  const item = workItems.work_items.find((entry) => entry.id === "NPREG-177");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-176"]);
  assert.deepEqual(item.completion_evidence, ["research/NP_1851_SYSTEM_RECORD.md", "src/data.js", "tests/np-1851-system.test.js"]);
});
