import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { sources, timeline } from "../src/data.js";
import workItems from "../docs/work-items.json" with { type: "json" };
import manifest from "../research/derived/np-1822-newspaper-issue-manifest.json" with { type: "json" };

test("1822 packet records retain routes, capacity and handling arrangements", () => {
  const speedwell = timeline.find((entry) => entry.sourceId === "mun-mercantile-1822-speedwell-packet");
  assert.ok(speedwell);
  assert.equal(speedwell.date, "1822-10-10");
  assert.equal(speedwell.status, "reported");
  assert.match(speedwell.body, /between Portugal Cove and Harbour Grace/);
  assert.match(speedwell.body, /six oars/);
  assert.match(speedwell.body, /Patrick Kough/);
  assert.match(speedwell.body, /Michael Dooley/);

  const lively = timeline.find((entry) => entry.sourceId === "mun-mercantile-1822-lively-packet");
  assert.ok(lively);
  assert.equal(lively.date, "1822-11-13");
  assert.equal(lively.status, "reported");
  assert.match(lively.body, /twice a week/);
  assert.match(lively.body, /five shillings/);
  assert.match(lively.body, /nine pence/);
  assert.match(lively.body, /James Neary/);
});

test("1822 governance records retain condition and private pilotage controls", () => {
  const institutions = timeline.find((entry) => entry.sourceId === "mun-mercantile-1822-public-institutions");
  assert.ok(institutions);
  assert.equal(institutions.date, "1822-10-24");
  assert.equal(institutions.category, "governance");
  assert.match(institutions.body, /fire-engine and lighthouse institutions/);
  assert.match(institutions.body, /dwindled or were dwindling/);
  assert.match(institutions.body, /lacked a lawful means to appoint qualified pilots/);
  assert.match(institutions.body, /did not name the lighthouse or locate the fire engine/);

  const pilotage = timeline.find((entry) => entry.sourceId === "mun-mercantile-1822-private-pilotage");
  assert.ok(pilotage);
  assert.equal(pilotage.date, "1822-10-31");
  assert.equal(pilotage.category, "navigation infrastructure");
  assert.match(pilotage.body, /certificate from their appointed committee/);
  assert.match(pilotage.body, /two respectable sureties/);
});

test("1822 harbour report does not invent a signal mechanism", () => {
  const event = timeline.find((entry) => entry.sourceId === "mun-mercantile-1822-harbour-signal");
  assert.ok(event);
  assert.equal(event.date, "1822-12-16");
  assert.equal(event.status, "reported");
  assert.match(event.body, /signal was hauled down/);
  assert.match(event.body, /passed northward/);
  assert.match(event.body, /did not identify the signal's mechanism, operator or location/);
  assert.doesNotMatch(event.body, /flag|gun|signal station/i);
});

test("1822 sources retain physical page locators", () => {
  const expected = new Map([
    ["mun-mercantile-1822-speedwell-packet", "https://dai.mun.ca/pdfs/nl_mercantile/NewfoundlandMercantileJournal18221010no442.pdf"],
    ["mun-mercantile-1822-public-institutions", "https://dai.mun.ca/pdfs/nl_mercantile/NewfoundlandMercantileJournal18221024no444.pdf"],
    ["mun-mercantile-1822-private-pilotage", "https://dai.mun.ca/pdfs/nl_mercantile/NewfoundlandMercantileJournal18221107no446.pdf"],
    ["mun-mercantile-1822-lively-packet", "https://dai.mun.ca/pdfs/nl_mercantile/NewfoundlandMercantileJournal18221114no447.pdf"],
    ["mun-mercantile-1822-harbour-signal", "https://dai.mun.ca/pdfs/nl_mercantile/NewfoundlandMercantileJournal18221219no452.pdf"]
  ]);
  for (const [id, url] of expected) {
    const source = sources.find((entry) => entry.id === id);
    assert.ok(source, id);
    assert.equal(source.year, 1822);
    assert.match(source.pages, /^physical PDF p\. [23]$/);
    assert.equal(source.status, "reported");
    assert.equal(source.url, url);
  }
});

test("1822 manifest preserves the 42 surviving MUN DAI issues", () => {
  assert.equal(manifest.year, 1822);
  assert.equal(manifest.issue_count, 42);
  assert.equal(manifest.collections.length, 1);
  assert.deepEqual(manifest.collections.map((entry) => [entry.name, entry.issue_count]), [
    ["Newfoundland Mercantile Journal", 42]
  ]);
  const items = manifest.collections.flatMap((entry) => entry.items);
  assert.equal(items.length, 42);
  assert.deepEqual(items.map((entry) => entry.date), [
    "18220103", "18220110", "18220117", "18220124", "18220207", "18220214", "18220221", "18220228",
    "18220307", "18220314", "18220321", "18220328", "18220404", "18220411", "18220418", "18220425",
    "18220502", "18220509", "18220516", "18220523", "18220530", "18220606", "18220613", "18220620",
    "18220627", "18220704", "18220711", "18220718", "18220725", "18220801", "18220822", "18221003",
    "18221010", "18221017", "18221024", "18221107", "18221114", "18221121", "18221128", "18221205",
    "18221219", "18221226"
  ]);
  for (const item of items) {
    assert.match(item.url, /^https:\/\/dai\.mun\.ca\/pdfs\/nl_mercantile\/NewfoundlandMercantileJournal1822\d{4}no\d+\.pdf$/);
    assert.match(item.sha256, /^[a-f0-9]{64}$/);
    assert.ok(item.bytes > 500_000);
  }
});

test("1822 research preserves event-date and collection boundaries", () => {
  const record = fs.readFileSync(new URL("../research/NP_1822_SYSTEM_RECORD.md", import.meta.url), "utf8");
  assert.match(record, /merchants' notice dated October 31 and printed on November 7/);
  assert.match(record, /notice dated November 13, 1822/);
  assert.match(record, /signal's mechanism, operator or location/);
  assert.match(record, /notices printed early in 1822 are dated November 29, 1821/);
  assert.match(record, /all 42 surviving 1822 files listed in the MUN DAI \*Newfoundland Mercantile Journal\* collection/);
  assert.match(record, /Manifest SHA-256 `9068cd7e8d0cb47c37b4e9a0876b77e724b143a68f933d383e9279ecaeee53d9`/);
});

test("1822 work item is complete", () => {
  const item = workItems.work_items.find((entry) => entry.id === "NPREG-206");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-205"]);
  assert.deepEqual(item.completion_evidence, [
    "research/NP_1822_SYSTEM_RECORD.md",
    "research/derived/np-1822-newspaper-issue-manifest.json",
    "src/data.js",
    "tests/np-1822-system.test.js"
  ]);
});
