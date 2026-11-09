import test from "node:test";
import assert from "node:assert/strict";
import { components, sources, timeline } from "../src/data.js";

const allowedStates = new Set(["verified", "reported", "proposed", "inferred", "unresolved"]);

test("source records have stable identifiers and primary locators", () => {
  const ids = new Set();
  for (const source of sources) {
    assert.match(source.id, /^[a-z0-9-]+$/);
    assert.ok(!ids.has(source.id), `duplicate source id: ${source.id}`);
    ids.add(source.id);
    assert.match(source.url, /^https?:\/\//);
    assert.match(source.pages, /PDF p/);
    assert.ok(Number.isInteger(source.year));
    assert.ok(allowedStates.has(source.status));
    assert.ok(source.topics.length > 0);
  }
});

test("timeline events resolve to a source and evidence state", () => {
  const sourceIds = new Set(sources.map((source) => source.id));
  for (const event of timeline) {
    assert.ok(sourceIds.has(event.sourceId), `unknown source: ${event.sourceId}`);
    assert.ok(allowedStates.has(event.status), `unknown status: ${event.status}`);
    assert.match(event.pages, /PDF p/);
    assert.ok(event.body.endsWith("."));
  }
});

test("diagram components include voltage, rating, and source page", () => {
  for (const [id, component] of Object.entries(components)) {
    assert.match(id, /^opd-t[1-3]$/);
    assert.match(component.pages, /PDF p\. 17/);
    const terms = new Set(component.data.map(([term]) => term));
    assert.ok(terms.has("Voltage"));
    assert.ok(terms.has("Rating"));
    assert.ok(terms.has("In service"));
    const rating = component.data.find(([term]) => term === "Rating")[1];
    assert.match(rating, /MVA/);
  }
});

