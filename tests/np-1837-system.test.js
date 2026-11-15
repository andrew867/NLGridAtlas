import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { sources, timeline } from "../src/data.js";
import workItems from "../docs/work-items.json" with { type: "json" };

test("1837 lighthouse act retains financing and control terms", () => {
  const event = timeline.find((entry) => entry.sourceId === "mun-statutes-1837-harbour-grace-lighthouse-completion-act");
  assert.ok(event);
  assert.equal(event.date, "1837-11-18");
  assert.equal(event.status, "verified");
  assert.match(event.body, /up to £500/);
  assert.match(event.body, /six percent interest/);
  assert.match(event.body, /keeper appointment with the Governor/);
  assert.match(event.body, /public tenders/);
  assert.match(event.body, /receipts and costs/);
});

test("1837 fixed-light notice records completion and service date", () => {
  const event = timeline.find((entry) => entry.sourceId === "mun-royal-gazette-1837-harbour-grace-fixed-light");
  assert.ok(event);
  assert.equal(event.date, "1837-11-21");
  assert.equal(event.status, "verified");
  assert.match(event.body, /lighthouse was complete/);
  assert.match(event.body, /sunset to sunrise/);
  assert.match(event.body, /November 21/);
  assert.match(event.body, /north to southwest/);
});

test("1837 electric-telegraph item remains proposed foreign context", () => {
  const event = timeline.find((entry) => entry.sourceId === "mun-times-1837-steinheil-electric-telegraph");
  assert.ok(event);
  assert.equal(event.status, "proposed");
  assert.match(event.body, /Professor Steinheil/);
  assert.match(event.body, /Gauss's plan/);
  assert.match(event.body, /iron rods/);
  assert.match(event.body, /not a Newfoundland electric circuit/);
});

test("1837 sources retain exact page locators and evidence states", () => {
  const expected = new Map([
    ["mun-times-1837-steinheil-electric-telegraph", ["physical PDF p. 4", "proposed"]],
    ["mun-statutes-1837-harbour-grace-lighthouse-completion-act", ["physical PDF pp. 45 to 46, printed pp. 41 to 42", "verified"]],
    ["mun-royal-gazette-1837-harbour-grace-fixed-light", ["physical PDF p. 3", "verified"]]
  ]);
  for (const [sourceId, [pages, status]] of expected) {
    const source = sources.find((entry) => entry.id === sourceId);
    assert.ok(source, sourceId);
    assert.equal(source.pages, pages);
    assert.equal(source.status, status);
  }
});

test("1837 research record preserves source hashes and boundaries", () => {
  const record = fs.readFileSync(new URL("../research/NP_1837_SYSTEM_RECORD.md", import.meta.url), "utf8");
  for (const hash of [
    "e21a02250e9f075d3bc9523b9e2436a81150aca1099a148d9edeef84b24f5db7",
    "ec70406e1434b51b3e2f876807a3653e5f6656924a8bc042b8fdcb17eb7fcf5",
    "32237de3b7f5420b1a43bfb01de170a098bc31242a96d8c37110d007e1237ae8"
  ]) {
    assert.match(record, new RegExp(hash));
  }
  assert.match(record, /statute documents financing and control/);
  assert.match(record, /notices document completion/);
  assert.match(record, /No named 1837 Newfoundland electric-telegraph instrument/);
});

test("1837 work item is complete", () => {
  const item = workItems.work_items.find((entry) => entry.id === "NPREG-191");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-190"]);
  assert.deepEqual(item.completion_evidence, ["research/NP_1837_SYSTEM_RECORD.md", "src/data.js", "tests/np-1837-system.test.js"]);
});
