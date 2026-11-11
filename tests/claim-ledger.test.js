import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { sources, staticClaims } from "../src/data.js";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const sourceIds = new Set(sources.map((source) => source.id));
const states = new Set(["verified", "reported", "proposed", "inferred", "unresolved"]);

test("static technical claim groups have stable unique identifiers", () => {
  const ids = staticClaims.map((claim) => claim.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const claim of staticClaims) {
    assert.match(claim.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.ok(claim.scope.trim(), `${claim.id} requires scope`);
    assert.ok(states.has(claim.status), `${claim.id} has invalid state`);
  }
});

test("static technical claim groups resolve to page-level sources", () => {
  for (const claim of staticClaims) {
    assert.ok(claim.sources.length, `${claim.id} requires a source`);
    for (const reference of claim.sources) {
      assert.ok(sourceIds.has(reference.sourceId), `${claim.id} has unknown source ${reference.sourceId}`);
      assert.ok(reference.pages.trim(), `${claim.id} requires a page locator`);
    }
  }
});

test("every static claim ledger entry is attached to one rendered region", () => {
  const rendered = [...html.matchAll(/data-claim-id="([^"]+)"/g)].map((match) => match[1]);
  const ledger = staticClaims.map((claim) => claim.id);
  assert.equal(new Set(rendered).size, rendered.length, "rendered claim IDs must be unique");
  assert.deepEqual([...rendered].sort(), [...ledger].sort());
});
