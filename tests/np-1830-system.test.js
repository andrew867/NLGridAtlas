import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { sources, timeline } from "../src/data.js";
import workItems from "../docs/work-items.json" with { type: "json" };
import manifest from "../research/derived/np-1830-newfoundlander-issue-manifest.json" with { type: "json" };

test("1830 January notices retain the three packet communication routes", () => {
  const event = timeline.find((entry) => entry.sourceId === "mun-newfoundlander-1830-packet-notices");
  assert.ok(event);
  assert.equal(event.date, "1830-01-07");
  assert.equal(event.status, "reported");
  assert.match(event.body, /Express/);
  assert.match(event.body, /Matthew Guswell's newly launched packet boat/);
  assert.match(event.body, /Carbonear on Monday, Cubits on Wednesday and Harbour Grace on Friday/);
  assert.match(event.body, /09:00 returns/);
  assert.match(event.body, /James Doyle's Dart/);
  assert.match(event.body, /All three notices included letter carriage/);
});

test("1830 Express record retains timetable and communication function", () => {
  const event = timeline.find((entry) => entry.sourceId === "mun-public-ledger-1830-conception-bay-packets" && entry.date === "1830-04-17");
  assert.ok(event);
  assert.equal(event.status, "reported");
  assert.match(event.body, /thorough repair/);
  assert.match(event.body, /Monday, Wednesday and Friday at 09:00/);
  assert.match(event.body, /weather permitting/);
  assert.match(event.body, /passengers, parcels and letters/);
  assert.match(event.body, /Henry Winton and Robert Oke/);
});

test("1830 Arrow record retains route, timetable and letter transfer", () => {
  const event = timeline.find((entry) => entry.sourceId === "mun-public-ledger-1830-conception-bay-packets" && entry.date === "1830-05-01");
  assert.ok(event);
  assert.equal(event.status, "reported");
  assert.match(event.body, /Thomas Butler/);
  assert.match(event.body, /Cubits at 08:00 on Wednesday/);
  assert.match(event.body, /Brigus, Port de Grave and Bay Roberts/);
  assert.match(event.body, /Public Ledger office/);
  assert.match(event.body, /11:00 on Thursday/);
});

test("1830 packet source retains exact page and state", () => {
  const source = sources.find((entry) => entry.id === "mun-public-ledger-1830-conception-bay-packets");
  assert.ok(source);
  assert.equal(source.pages, "physical PDF p. 1");
  assert.equal(source.status, "reported");
  const januarySource = sources.find((entry) => entry.id === "mun-newfoundlander-1830-packet-notices");
  assert.ok(januarySource);
  assert.equal(januarySource.pages, "physical PDF p. 1");
  assert.equal(januarySource.status, "reported");
});

test("1830 issue manifest preserves every surviving regular issue and supplement", () => {
  assert.equal(manifest.year, 1830);
  assert.equal(manifest.issue_count, 55);
  assert.equal(manifest.items.length, 55);
  assert.equal(new Set(manifest.items.map((entry) => entry.filename)).size, 55);
  assert.equal(manifest.items.filter((entry) => entry.filename.includes("Supplement")).length, 4);
  for (const item of manifest.items) {
    assert.match(item.url, /^https:\/\/dai\.mun\.ca\/[Pp][Dd][Ff]s\/newfoundland\/Newfoundlander1830\d{4}(?:Supplement)?\.pdf$/);
    assert.match(item.sha256, /^[a-f0-9]{64}$/);
    assert.ok(item.bytes > 500_000);
  }
});

test("1830 research preserves coverage and claim boundaries", () => {
  const record = fs.readFileSync(new URL("../research/NP_1830_SYSTEM_RECORD.md", import.meta.url), "utf8");
  assert.match(record, /51 surviving regular 1830 issues and four supplements/);
  assert.match(record, /July 15 issue is missing/);
  assert.match(record, /wording \*usual trips\* does not establish/);
  assert.match(record, /10 shillings for a cabin passenger/);
  assert.match(record, /10 shillings for ladies and gentlemen/);
  assert.match(record, /launched a packet boat built to carry letters and passengers/);
  assert.match(record, /52ba949d77366c55ff24e00df1e36fc5431133959e41496c3eadbd2a1aada727/);
  assert.match(record, /No named 1830 Newfoundland lighthouse project/);
  assert.match(record, /9c1dfdb7d98362715c648a7b198dbb041d12c593537e60295d26a649a2c2015e/);
  assert.match(record, /4f90291f7a31c70b2d6434f8e48ffaeb666212b12d24e943aac3458667927178/);
});

test("1830 work item is complete", () => {
  const item = workItems.work_items.find((entry) => entry.id === "NPREG-198");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-197"]);
  assert.deepEqual(item.completion_evidence, [
    "research/NP_1830_SYSTEM_RECORD.md",
    "research/derived/np-1830-newfoundlander-issue-manifest.json",
    "src/data.js",
    "tests/np-1830-system.test.js"
  ]);
});
