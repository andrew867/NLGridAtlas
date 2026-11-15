import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { sources, timeline } from "../src/data.js";
import workItems from "../docs/work-items.json" with { type: "json" };

const eventBySource = (sourceId) => timeline.find((entry) => entry.sourceId === sourceId);

test("1857 statute record retains the enacted authority and penalties", () => {
  const event = eventBySource("mun-statutes-1857-telegraph-amendment");
  assert.ok(event);
  assert.equal(event.status, "verified");
  assert.match(event.body, /bringing it into a joint station/);
  assert.match(event.body, /authorized consolidation/);
  assert.match(event.body, /fine not exceeding £5/);
  assert.match(event.body, /one calendar month/);
});

test("1857 weather interruptions preserve their stated limits", () => {
  const thaw = eventBySource("mun-telegraph-1857-silver-thaw");
  const gale = eventBySource("mun-telegraph-1857-gale-wire");
  assert.ok(thaw);
  assert.ok(gale);
  assert.match(thaw.body, /He supposed that silver thaw/);
  assert.match(thaw.body, /does not confirm the fault location or repair time/);
  assert.match(gale.body, /previous week's gale/);
  assert.match(gale.body, /does not identify the damaged section or the repair date/);
});

test("1857 cable failure retains the measured report without claiming a landing", () => {
  const event = eventBySource("mun-times-1857-cable-parting");
  assert.ok(event);
  assert.equal(event.date, "1857-08-11");
  assert.match(event.body, /335 nautical miles/);
  assert.match(event.body, /more than two miles deep/);
  assert.match(event.body, /over five knots/);
  assert.match(event.body, /Niagara was making four knots/);
  assert.match(event.body, /cable parted/);
  assert.doesNotMatch(event.body, /landed|completed/);
});

test("1857 Cape Race record does not infer the ship-contact date", () => {
  const event = eventBySource("mun-telegraph-1857-havre-steamer");
  assert.ok(event);
  assert.equal(event.date, "1857-11-18");
  assert.match(event.body, /Havre steamer off Cape Race/);
  assert.match(event.body, /does not state the calendar date of the ship contact/);
});

test("1857 source locators retain physical pages and evidence states", () => {
  const expected = new Map([
    ["mun-telegraph-1857-archibald", ["physical PDF p. 3", "reported"]],
    ["mun-statutes-1857-telegraph-amendment", ["physical PDF pp. 1 to 3", "verified"]],
    ["mun-telegraph-1857-silver-thaw", ["physical PDF p. 1", "reported"]],
    ["mun-times-1857-cable-parting", ["physical PDF p. 2", "reported"]],
    ["mun-telegraph-1857-havre-steamer", ["physical PDF p. 3", "reported"]],
    ["mun-telegraph-1857-gale-wire", ["physical PDF p. 2", "reported"]]
  ]);
  for (const [sourceId, [pages, status]] of expected) {
    const source = sources.find((entry) => entry.id === sourceId);
    assert.ok(source, sourceId);
    assert.equal(source.pages, pages);
    assert.equal(source.status, status);
  }
});

test("1857 research record retains source hashes", () => {
  const record = fs.readFileSync(new URL("../research/NP_1857_SYSTEM_RECORD.md", import.meta.url), "utf8");
  for (const hash of [
    "7b855a176b6dd886dd20ffd192a73fdafc57d5eb22208578a07a781f60ec3609",
    "74ef580397d59a05a387100fbee2340beec9f9a9655d6c8b384ebcfa40f31fab",
    "79f6e3a5f2684a50902e5e145f574b67eed4d3e087aa38e96d2b5c83da8518af",
    "18af00df10411bb235a23349915431dd75e17db37523e7cd6711492965eb0d83",
    "76fa99e30ea40b7f32fe390cc1ccc62b643d528ef0b30d6c1041bbdbaef33222",
    "cb9f7a51fdce40f8929a710d4b1109f8382be1852fd4eaf20e040dae3fc1ccaf"
  ]) {
    assert.match(record, new RegExp(hash));
  }
});

test("1857 work item follows the 1858 closeout", () => {
  const item = workItems.work_items.find((candidate) => candidate.id === "NPREG-171");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-170"]);
  assert.deepEqual(item.completion_evidence, ["research/NP_1857_SYSTEM_RECORD.md", "src/data.js", "tests/np-1857-system.test.js"]);
});
