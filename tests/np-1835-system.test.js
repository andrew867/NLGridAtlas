import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { sources, timeline } from "../src/data.js";
import workItems from "../docs/work-items.json" with { type: "json" };

test("1835 Cape Spear act preserves financing and project state", () => {
  const event = timeline.find((entry) => entry.sourceId === "mun-statutes-1835-cape-spear-further-loan-act");
  assert.ok(event);
  assert.equal(event.date, "1835-05-08");
  assert.equal(event.status, "verified");
  assert.match(event.body, /first £1,000 was insufficient/);
  assert.match(event.body, /lighting apparatus/);
  assert.match(event.body, /up to £500/);
  assert.match(event.body, /repayment starting after two years/);
});

test("1835 Harbour Grace act preserves governance and operating controls", () => {
  const event = timeline.find((entry) => entry.sourceId === "mun-statutes-1835-harbour-grace-lighthouse-establishment-act");
  assert.ok(event);
  assert.equal(event.status, "verified");
  assert.match(event.body, /five-commissioner/);
  assert.match(event.body, /loan of up to £1,000/);
  assert.match(event.body, /material and workmanship requirements/);
  assert.match(event.body, /Governor in Council/);
  assert.match(event.body, /completion-triggered light duty/);
});

test("1835 tender identifies a wooden Harbour Grace lighthouse", () => {
  const event = timeline.find((entry) => entry.sourceId === "mun-royal-gazette-1835-harbour-grace-wood-lighthouse-tender");
  assert.ok(event);
  assert.equal(event.date, "1835-07-16");
  assert.equal(event.status, "verified");
  assert.match(event.body, /wooden lighthouse/);
  assert.match(event.body, /plans and further particulars/);
  assert.match(event.body, /William J\. Henderson/);
});

test("1835 sources retain exact page locators and evidence states", () => {
  const expected = new Map([
    ["mun-statutes-1835-cape-spear-further-loan-act", ["physical PDF pp. 16 to 17, printed pp. 25 to 26", "verified"]],
    ["mun-statutes-1835-harbour-grace-lighthouse-establishment-act", ["physical PDF pp. 18 to 20, printed pp. 29 to 31", "verified"]],
    ["mun-royal-gazette-1835-harbour-grace-wood-lighthouse-tender", ["physical PDF p. 3", "verified"]]
  ]);
  for (const [sourceId, [pages, status]] of expected) {
    const source = sources.find((entry) => entry.id === sourceId);
    assert.ok(source, sourceId);
    assert.equal(source.pages, pages);
    assert.equal(source.status, status);
  }
});

test("1835 research record preserves hashes and completion boundary", () => {
  const record = fs.readFileSync(new URL("../research/NP_1835_SYSTEM_RECORD.md", import.meta.url), "utf8");
  for (const hash of [
    "4ef0828b49bb20075b2041ec7a64b9da165a60442a9413e1d7c94abe249d0464",
    "f3d65ec028d6418ac5a3e617beaef886e45be460dad0835eeee0fb90a6a29496"
  ]) {
    assert.match(record, new RegExp(hash));
  }
  assert.match(record, /lighting apparatus as part of the incomplete project/);
  assert.match(record, /Neither source establishes completion in 1835/);
  assert.match(record, /No named 1835 Newfoundland telegraph instrument/);
});

test("1835 work item is complete", () => {
  const item = workItems.work_items.find((entry) => entry.id === "NPREG-193");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-192"]);
  assert.deepEqual(item.completion_evidence, ["research/NP_1835_SYSTEM_RECORD.md", "src/data.js", "tests/np-1835-system.test.js"]);
});
