import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const manifest = JSON.parse(await readFile(new URL("../research/derived/source-citation-registry.json", import.meta.url), "utf8"));
const sourcesHtml = await readFile(new URL("../sources.html", import.meta.url), "utf8");

test("source catalogue has one static record for every registered source", () => {
  assert.equal(manifest.registeredSourceCount, 1447);
  assert.equal(manifest.sourceCount, 1450);
  assert.equal((sourcesHtml.match(/<article class="source-record"/g) || []).length, manifest.sourceCount);
});

test("every migrated citation has a stable occurrence and source record", async () => {
  assert.equal(manifest.occurrenceCount, 347);
  const ids = manifest.occurrences.map((item) => item.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const occurrence of manifest.occurrences) {
    assert.match(sourcesHtml, new RegExp(`id="source-${occurrence.sourceId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`));
    const page = await readFile(new URL(`../${occurrence.page}`, import.meta.url), "utf8");
    assert.match(page, new RegExp(`data-citation-id="${occurrence.id}"`));
  }
});

test("source records state absent preservation metadata instead of inventing it", () => {
  assert.match(sourcesHtml, /<dt>Retrieval date<\/dt><dd>Not recorded<\/dd>/);
  assert.match(sourcesHtml, /<dt>Preserved filename<\/dt><dd>Not recorded<\/dd>/);
  assert.match(sourcesHtml, /<dt>SHA-256<\/dt><dd>Not recorded<\/dd>/);
});

test("source records expose structured fields for catalogue filtering", () => {
  assert.match(sourcesHtml, /data-organization="Newfoundland Power"/);
  assert.match(sourcesHtml, /data-year="2026"/);
  assert.match(sourcesHtml, /data-topics="[^"]+"/);
  assert.match(sourcesHtml, /id="source-organization"/);
  assert.match(sourcesHtml, /id="source-period"/);
  assert.match(sourcesHtml, /id="source-topic"/);
  assert.match(sourcesHtml, /id="source-sort"/);
});
