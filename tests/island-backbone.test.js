import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  generationCollection,
  islandNodeLayout,
  islandRenderedLines,
  islandStationId,
  islandStationTargets,
  islandTopology
} from "../src/island-backbone.js";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const css = await readFile(new URL("../src/styles.css", import.meta.url), "utf8");
const workItems = JSON.parse(await readFile(new URL("../docs/work-items.json", import.meta.url), "utf8"));

test("island backbone has a schematic position and stable identifier for every filed endpoint", () => {
  const endpoints = new Set(islandRenderedLines.flatMap((line) => line.segments.flatMap((segment) => [segment.from, segment.to])));
  assert.equal(Object.keys(islandNodeLayout).length, endpoints.size);
  for (const endpoint of endpoints) assert.deepEqual(islandNodeLayout[endpoint].length, 2, endpoint);
  const identifiers = [...endpoints].map(islandStationId);
  assert.equal(new Set(identifiers).size, identifiers.length);
  assert.ok(identifiers.every((identifier) => /^island-[a-z0-9-]+$/.test(identifier)));
});

test("island backbone exposes the dated source, voltage filters, and accessible map shell", () => {
  assert.match(html, /id="island-backbone"/);
  assert.match(html, /2017 TO 2018 FILED LINE RECORDS/);
  assert.match(html, /id="island-backbone-map"/);
  assert.match(html, /aria-label="Scrollable island transmission schematic"/);
  assert.match(css, /\.island-circuit\.voltage-230/);
  assert.match(css, /\.island-circuit\.voltage-138/);
  assert.match(css, /\.island-circuit\.voltage-66/);
  assert.match(css, /\.island-backbone-scroll[^}]*overflow-x: auto/);
});

test("generation collection layer adds four separately sourced 230 kV circuits", () => {
  assert.equal(islandTopology.lines.length, 58);
  assert.equal(generationCollection.lines.length, 4);
  assert.equal(islandRenderedLines.length, 62);
  assert.equal(islandRenderedLines.filter((line) => line.voltage_kv === 230).length, 30);
  assert.deepEqual(generationCollection.lines.map((line) => line.circuit), ["TL235", "TL247", "TL248", "TL269"]);
  assert.match(html, /58 circuit designations in the 2018 transmission assessment asset list and four generation collection circuits/);
});

test("Avalon layouts place Holyrood north of Soldiers Pond and TL201", () => {
  const holyrood = islandNodeLayout["Holyrood Generating Station"];
  const soldiersPond = islandNodeLayout["Soldiers Pond"];
  const hardwoods = islandNodeLayout.Hardwoods;
  assert.ok(holyrood[1] < soldiersPond[1]);
  assert.ok(holyrood[0] < hardwoods[0]);
  assert.match(html, /M520 190 C610 65 750 70 840 155/);
  assert.match(html, /M360 330 H650/);
});

test("Molloy's Lane dedicated record is complete", () => {
  const item = workItems.work_items.find((entry) => entry.id === "AVL-007");
  assert.equal(item.status, "done");
  assert.match(item.scope, /Molloy's Lane/);
  assert.ok(item.completion_evidence.includes("src/data.js"));
});

test("island map generation nodes open their individual records", () => {
  assert.equal(islandStationTargets["Upper Salmon"].code, "USL");
  assert.equal(islandStationTargets["Granite Canal"].code, "GRC");
  assert.equal(islandStationTargets["Hinds Lake"].code, "HLA");
  assert.equal(islandStationTargets["Grand Falls Frequency Converter"].code, "GFC");
});

test("Soldiers Pond opens its converter-station record", () => {
  assert.equal(islandStationTargets["Soldiers Pond"].code, "SDP");
  assert.equal(islandStationTargets["Soldiers Pond"].href, "#hydro-terminal-browser");
});

test("western and northern station nodes open their individual records", () => {
  const expected = {
    "Berry Hill": "BRH",
    "Peter's Barron": "PBR",
    "Plum Point": "PLP",
    "Bear Cove": "BRC",
    "St. Anthony Airport": "SAA",
    "Hawkes Bay": "HAW",
    Howley: "HOW",
    "South Brook": "SBR",
    Doyles: "DOY",
    "Grandy Brook": "GRB",
    "English Harbour West": "EHW"
  };
  for (const [station, code] of Object.entries(expected)) {
    assert.equal(islandStationTargets[station].code, code);
  }
});
