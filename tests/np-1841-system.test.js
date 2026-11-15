import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { sources, timeline } from "../src/data.js";
import workItems from "../docs/work-items.json" with { type: "json" };

test("1841 timeline separates local infrastructure from foreign electrical context", () => {
  const mail = timeline.find((entry) => entry.sourceId === "mun-newfoundlander-1841-admiralty-mail-packets");
  assert.ok(mail);
  assert.equal(mail.date, "1841-01-21");
  assert.equal(mail.status, "reported");
  assert.match(mail.body, /Sandwich and Charles Buchan/);
  assert.match(mail.body, /forty-eight hours/);

  const telegraph = timeline.find((entry) => entry.sourceId === "mun-times-1841-magnetic-printing-telegraph");
  assert.ok(telegraph);
  assert.equal(telegraph.date, "1841-10-20");
  assert.equal(telegraph.status, "reported");
  assert.match(telegraph.body, /outside Newfoundland/);
  assert.match(telegraph.body, /does not establish a local telegraph circuit/);

  const gas = timeline.find((entry) => entry.sourceId === "mun-royal-gazette-1841-st-johns-gas-company");
  assert.ok(gas);
  assert.equal(gas.status, "proposed");
  assert.match(gas.body, /no further step had been taken/);
});

test("1841 sources retain page locators and evidence states", () => {
  const expected = new Map([
    ["mun-newfoundlander-1841-admiralty-mail-packets", ["physical PDF p. 1", "reported"]],
    ["mun-newfoundlander-1841-electromagnetic-soundings", ["physical PDF p. 4", "reported"]],
    ["mun-times-1841-magnetic-printing-telegraph", ["physical PDF p. 4", "reported"]],
    ["mun-royal-gazette-1841-st-johns-gas-company", ["physical PDF p. 2", "proposed"]]
  ]);
  for (const [sourceId, [pages, status]] of expected) {
    const source = sources.find((entry) => entry.id === sourceId);
    assert.ok(source, sourceId);
    assert.equal(source.pages, pages);
    assert.equal(source.status, status);
  }
});

test("1841 research record preserves hashes and boundaries", () => {
  const record = fs.readFileSync(new URL("../research/NP_1841_SYSTEM_RECORD.md", import.meta.url), "utf8");
  for (const hash of [
    "af03be2e62fa29ec0222615187b2e8bdc1dc8ba0d583b685d6882e5e65276929",
    "20d037abace0f854b036160cce4470e6acb58324b00ccf2c4898d22b1a2fe2fd",
    "c793bf570bf491888cbdce0cd26ea73df8e6723745c7c6b7607b95bba3c91df2",
    "1f1ca7c7b7bac14a580dc595e43a01bdee0bdf16b42fad8d8854fe72f75e2e4f"
  ]) {
    assert.match(record, new RegExp(hash));
  }
  assert.match(record, /does not place the device aboard a Newfoundland vessel/);
  assert.match(record, /proposal at the estimate stage, not construction or operation/);
  assert.match(record, /No named 1841 Newfoundland electric-telegraph line/);
});

test("1841 work item is complete", () => {
  const item = workItems.work_items.find((entry) => entry.id === "NPREG-187");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-186"]);
  assert.deepEqual(item.completion_evidence, ["research/NP_1841_SYSTEM_RECORD.md", "src/data.js", "tests/np-1841-system.test.js"]);
});
