import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { islandNodeLayout, islandStationId, islandTopology } from "../src/island-backbone.js";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const css = await readFile(new URL("../src/styles.css", import.meta.url), "utf8");
const workItems = JSON.parse(await readFile(new URL("../docs/work-items.json", import.meta.url), "utf8"));

test("island backbone has a schematic position and stable identifier for every filed endpoint", () => {
  const endpoints = new Set(islandTopology.lines.flatMap((line) => line.segments.flatMap((segment) => [segment.from, segment.to])));
  assert.equal(Object.keys(islandNodeLayout).length, endpoints.size);
  for (const endpoint of endpoints) assert.deepEqual(islandNodeLayout[endpoint].length, 2, endpoint);
  const identifiers = [...endpoints].map(islandStationId);
  assert.equal(new Set(identifiers).size, identifiers.length);
  assert.ok(identifiers.every((identifier) => /^island-[a-z0-9-]+$/.test(identifier)));
});

test("island backbone exposes the dated source, voltage filters, and accessible map shell", () => {
  assert.match(html, /id="island-backbone"/);
  assert.match(html, /2018 FILED LINE TABLES/);
  assert.match(html, /id="island-backbone-map"/);
  assert.match(html, /aria-label="Scrollable island transmission schematic"/);
  assert.match(css, /\.island-circuit\.voltage-230/);
  assert.match(css, /\.island-circuit\.voltage-138/);
  assert.match(css, /\.island-circuit\.voltage-66/);
  assert.match(css, /\.island-backbone-scroll[^}]*overflow-x: auto/);
});

test("Molloy's Lane dedicated record remains tracked after its generic register entry was identified", () => {
  const item = workItems.work_items.find((entry) => entry.id === "AVL-007");
  assert.equal(item.status, "in_progress");
  assert.match(item.scope, /Molloy's Lane/);
});
