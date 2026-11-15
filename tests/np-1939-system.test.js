import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { sources, staticClaims, stationProfiles, timeline } from "../src/data.js";

const fallPondText = () => JSON.stringify(stationProfiles.find((candidate) => candidate.code === "FPD"));

test("1939 Fall Pond record preserves the filed capacity values", () => {
  const event = timeline.find((entry) => entry.date === "1939" && entry.category === "generation");
  assert.ok(event);
  assert.equal(event.status, "unresolved");
  assert.match(event.body, /400 kW/);
  assert.match(event.body, /380 kW Voith horizontal Francis turbine/);
  assert.match(event.body, /350 kW/);
  assert.match(event.body, /15\.2 m net head/);
});

test("1939 Fall Pond waterworks retain their dimensions", () => {
  const text = fallPondText();
  assert.match(text, /13 m long, 1,219 mm diameter woodstave penstock/);
  assert.match(text, /129 m concrete buttress dam/);
  assert.match(text, /33 m overflow spillway/);
});

test("1939 Fall Pond station record remains separate from the current transformer record", () => {
  const text = fallPondText();
  assert.match(text, /step-up from 2\.4 kV to 12\.5 kV/);
  assert.match(text, /no separate transmission line/);
  assert.match(text, /three generation transformers; each 12\.5\/4\.2 kV and 0\.25 MVA/);
});

test("1939 claim and public card retain exact source pages", () => {
  const claim = staticClaims.find((candidate) => candidate.id === "np-1939-system-record");
  assert.ok(claim);
  assert.equal(claim.status, "unresolved");
  assert.equal(claim.sources.length, 3);
  assert.equal(sources.find((source) => source.id === "np-1939-fall-pond-development")?.pages, "physical PDF pp. 275 to 276");
  const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
  assert.match(html, /data-claim-id="np-1939-system-record"/);
  assert.match(html, /400 kW development rating; 380 kW turbine; later records give 350 kW/);
  assert.match(html, /2\.4 kV to 12\.5 kV; tied to a Laurentian distribution feeder; no separate transmission line/);
});
