import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { sources, timeline } from "../src/data.js";
import workItems from "../docs/work-items.json" with { type: "json" };

const eventBySource = (sourceId) => timeline.find((entry) => entry.sourceId === sourceId);

test("1853 regional cable records retain the message and cable-laying details", () => {
  const message = eventBySource("mun-public-ledger-1853-first-cable-message");
  const cable = eventBySource("mun-courier-1853-regional-cable");
  assert.ok(message);
  assert.ok(cable);
  assert.match(message.body, /Charlottetown to Cape Tormentine/);
  assert.match(message.body, /Gisborne forwarded the message from Cape Tormentine/);
  assert.match(cable.body, /Carlton Head/);
  assert.match(cable.body, /kedge anchor, four horses and oxen/);
  assert.match(cable.body, /eleven hours/);
});

test("1853 design and procurement records do not imply completion", () => {
  const route = eventBySource("mun-public-ledger-1853-route-design");
  const materials = eventBySource("mun-courier-1853-line-materials");
  assert.ok(route);
  assert.ok(materials);
  assert.equal(route.status, "proposed");
  assert.match(route.body, /underground construction/);
  assert.match(route.body, /139-mile submarine crossing/);
  assert.match(materials.body, /overland wire had arrived/);
  assert.match(materials.body, /expected shipment and hiring remain plans/);
});

test("1853 statutes retain exact capital and damage-compensation terms", () => {
  const capital = eventBySource("mun-statutes-1853-telegraph-capital");
  const damage = eventBySource("mun-statutes-1853-wire-damage-compensation");
  assert.ok(capital);
  assert.ok(damage);
  assert.equal(capital.status, "verified");
  assert.equal(damage.status, "verified");
  assert.match(capital.body, /£100,000 to £300,000/);
  assert.match(capital.body, /1,000 to 3,000 shares at £100 each/);
  assert.match(damage.body, /£86 13s 4d/);
  assert.match(damage.body, /line-protection grant not be spent/);
});

test("1853 field report retains measured road and trench details", () => {
  const event = eventBySource("mun-morning-post-1853-ship-harbour-road");
  assert.ok(event);
  assert.match(event.body, /trenches for subterranean electric wires/);
  assert.match(event.body, /28 miles to Long Harbour/);
  assert.match(event.body, /Fourteen miles/);
  assert.match(event.body, /seven feet wide/);
});

test("1853 labour and finance records retain their evidentiary limits", () => {
  const labour = eventBySource("mun-courier-1853-unpaid-labour");
  const finance = eventBySource("mun-courier-1853-financing-claim");
  assert.ok(labour);
  assert.ok(finance);
  assert.match(labour.body, /recover their wages/);
  assert.match(labour.body, /without giving a restart date/);
  assert.match(finance.body, /£11,000/);
  assert.match(finance.body, /does not record a completed financing transaction/);
});

test("1853 source locators retain pages and evidence states", () => {
  const expected = new Map([
    ["mun-public-ledger-1853-first-cable-message", ["physical PDF p. 2", "reported"]],
    ["mun-courier-1853-regional-cable", ["physical PDF p. 4", "reported"]],
    ["mun-public-ledger-1853-route-design", ["physical PDF p. 2", "reported"]],
    ["mun-courier-1853-line-materials", ["physical PDF p. 3", "reported"]],
    ["mun-statutes-1853-telegraph-capital", ["physical PDF p. 70, Chapter 11", "verified"]],
    ["mun-statutes-1853-wire-damage-compensation", ["physical PDF pp. 86 and 91, Chapter 16", "verified"]],
    ["mun-morning-post-1853-ship-harbour-road", ["physical PDF p. 2", "reported"]],
    ["mun-courier-1853-unpaid-labour", ["physical PDF p. 2", "reported"]],
    ["mun-courier-1853-financing-claim", ["physical PDF p. 2", "reported"]]
  ]);
  for (const [sourceId, [pages, status]] of expected) {
    const source = sources.find((entry) => entry.id === sourceId);
    assert.ok(source, sourceId);
    assert.equal(source.pages, pages);
    assert.equal(source.status, status);
  }
});

test("1853 research record retains source hashes", () => {
  const record = fs.readFileSync(new URL("../research/NP_1853_SYSTEM_RECORD.md", import.meta.url), "utf8");
  for (const hash of [
    "cf97fcdc989ec591557a9faeb01675f26d835662b27b3f1a7c50318633390fce",
    "59440902d8398f2f36b348cb0584b41380335099fbfc496d0c24315fc988d9ad",
    "3a36b34ae428cf06eb14e4a75051056092297edb487caee7d7d575a3f5af6e1a",
    "c5697c66368fb52ee479ee2df0d45620a5e0fd7eef13f84674a979a08d5bd1ee",
    "232b7d23ac3aeaa025ca6ca82619b4b92ed83c0a526e415c99bd6cd59cb99e37",
    "5c945acea2e247e7cd2c3cdc0c3edecbd7ec45577c1add1f1010ca348330a708",
    "15a2ee2da3f4f8d11dd854aca829ca04e147590a51b0db9950080ee0c2d89b12",
    "8d2ccd25dbc401779fa5bc73b3b7b0668d5fb950535c86ec23f07925acde448a"
  ]) {
    assert.match(record, new RegExp(hash));
  }
});

test("1853 work item is complete", () => {
  const item = workItems.work_items.find((entry) => entry.id === "NPREG-175");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.completion_evidence, ["research/NP_1853_SYSTEM_RECORD.md", "src/data.js", "tests/np-1853-system.test.js"]);
});
