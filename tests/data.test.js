import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { components, sources, timeline } from "../src/data.js";
import { avalonNodePositions } from "../src/avalon-layout.js";

const handbook = JSON.parse(await readFile(new URL("../research/derived/np-2006-handbook.json", import.meta.url), "utf8"));

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

test("2006 handbook extraction matches the source-reported registers", () => {
  assert.equal(handbook.source.sha256, "54cfa1347e25bdf937dd09acbe5d84da7c0ac8b08c87e1284a8a84d23085a5ff");
  assert.equal(handbook.source.physical_pages, 18);
  assert.equal(handbook.transmission_lines.length, 104);
  assert.equal(handbook.substations.length, 136);
  assert.equal(handbook.substations.reduce((total, station) => total + station.feeders.length, 0), 302);
  assert.equal(new Set(handbook.transmission_lines.map((line) => line.circuit)).size, 104);
  assert.equal(new Set(handbook.substations.map((station) => station.code)).size, 136);
});

test("Avalon schematic only uses handbook station codes and line endpoints", () => {
  const knownCodes = new Set(handbook.substations.map((station) => station.code));
  for (const line of handbook.transmission_lines) {
    if (line.from_code) knownCodes.add(line.from_code);
    if (line.to_code) knownCodes.add(line.to_code);
  }
  for (const code of Object.keys(avalonNodePositions)) {
    assert.ok(knownCodes.has(code), `unknown Avalon station or endpoint code: ${code}`);
  }
  const drawable = handbook.transmission_lines.filter((line) => (
    line.from_code in avalonNodePositions && line.to_code in avalonNodePositions
  ));
  assert.ok(drawable.length >= 40);
  for (const line of drawable) {
    assert.match(line.circuit, /^\d+L$/);
    assert.ok(line.source_page >= 6 && line.source_page <= 9);
  }
});

