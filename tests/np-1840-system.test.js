import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { sources, timeline } from "../src/data.js";
import workItems from "../docs/work-items.json" with { type: "json" };

test("1840 steam records preserve legislation, operation, deferral and contract states", () => {
  const act = timeline.find((entry) => entry.sourceId === "mun-royal-gazette-1840-steam-communication-act");
  assert.ok(act);
  assert.equal(act.date, "1840-04-29");
  assert.equal(act.status, "verified");
  assert.match(act.body, /£3,000/);
  assert.match(act.body, /three annual instalments of £1,000/);
  assert.match(act.body, /after the communication was established/);

  const mail = timeline.find((entry) => entry.sourceId === "mun-public-ledger-1840-roseway-mail");
  assert.ok(mail);
  assert.equal(mail.status, "reported");
  assert.match(mail.body, /Roseway/);
  assert.match(mail.body, /Britannia/);
  assert.match(mail.body, /Halifax to St. John's leg still needed a steam vessel/);

  const deferral = timeline.find((entry) => entry.sourceId === "mun-public-ledger-1840-halifax-steam-deferral");
  assert.ok(deferral);
  assert.match(deferral.body, /abandoned its plan/);
  assert.match(deferral.body, /£7,000/);

  const packet = timeline.find((entry) => entry.sourceId === "mun-public-ledger-1840-admiralty-mail-packets");
  assert.ok(packet);
  assert.match(packet.body, /Sandwich and Charles Buchan/);
  assert.match(packet.body, /forty-eight hours/);
});

test("1840 galvanic-demolition record remains foreign technical context", () => {
  const event = timeline.find((entry) => entry.sourceId === "mun-royal-gazette-1840-royal-george-galvanic-demolition");
  assert.ok(event);
  assert.equal(event.status, "reported");
  assert.match(event.body, /2,250 pounds/);
  assert.match(event.body, /connecting wires from a voltaic battery/);
  assert.match(event.body, /occurred at Spithead, not in Newfoundland/);
});

test("1840 sources retain page locators and evidence states", () => {
  const expected = new Map([
    ["mun-public-ledger-1840-scientific-institution", ["physical PDF p. 2", "proposed"]],
    ["mun-royal-gazette-1840-steam-communication-act", ["physical PDF p. 1", "verified"]],
    ["mun-public-ledger-1840-roseway-mail", ["physical PDF p. 2", "reported"]],
    ["mun-public-ledger-1840-halifax-steam-deferral", ["physical PDF p. 2", "reported"]],
    ["mun-royal-gazette-1840-royal-george-galvanic-demolition", ["physical PDF p. 1", "reported"]],
    ["mun-public-ledger-1840-admiralty-mail-packets", ["physical PDF p. 3", "reported"]]
  ]);
  for (const [sourceId, [pages, status]] of expected) {
    const source = sources.find((entry) => entry.id === sourceId);
    assert.ok(source, sourceId);
    assert.equal(source.pages, pages);
    assert.equal(source.status, status);
  }
});

test("1840 research record preserves hashes and source boundaries", () => {
  const record = fs.readFileSync(new URL("../research/NP_1840_SYSTEM_RECORD.md", import.meta.url), "utf8");
  for (const hash of [
    "22a40d6a689af32511e314a6052362501dec594c3e4fe952bec06c2f8ab68185",
    "3a8886a973fecc72ea71c0310c4f3827357a72faf3ce669b393f2d982083f961",
    "2964fce4ee902e0506d936ccb9b9728262a58be1f019c7f26551ed61c5a4d603",
    "5b7512f287564cb6eef37d52eabfbd163e63b878bb529771a42bd3747d5c3f41",
    "bade9c3501b359b95f58d07af00b833ca5853f4a4badab238f5b47ef59722376",
    "aa6881c283c0a6d59afe512e1d52681cf2f51209132d9259f5781b75711e8cfb"
  ]) {
    assert.match(record, new RegExp(hash));
  }
  assert.match(record, /does not identify electrical apparatus or telegraph work/);
  assert.match(record, /five different states: legislation, an operating Cunard-connected sailing mail, a failed fall steam-vessel start, a proposed spring start and the later sailing-packet contract/);
  assert.match(record, /No named 1840 Newfoundland electric-telegraph line/);
});

test("1840 work item is complete", () => {
  const item = workItems.work_items.find((entry) => entry.id === "NPREG-188");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-187"]);
  assert.deepEqual(item.completion_evidence, ["research/NP_1840_SYSTEM_RECORD.md", "src/data.js", "tests/np-1840-system.test.js"]);
});
