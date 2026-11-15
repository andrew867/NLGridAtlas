import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { sources, timeline } from "../src/data.js";
import workItems from "../docs/work-items.json" with { type: "json" };

const eventBySource = (sourceId) => timeline.find((entry) => entry.sourceId === sourceId);

test("1850 Halifax to Ireland report remains a proposal", () => {
  const event = eventBySource("mun-courier-1850-halifax-ireland-cable");
  assert.ok(event);
  assert.equal(event.date, "1850-03-27");
  assert.equal(event.status, "proposed");
  assert.match(event.body, /Halifax to western Ireland/);
  assert.match(event.body, /Newfoundland Banks/);
  assert.match(event.body, /three to four million/);
});

test("1850 J.T.M. route retains proposed geography and distances", () => {
  const event = eventBySource("mun-courier-1854-jtm-1850-route-reprint");
  assert.ok(event);
  assert.equal(event.date, "1850-11-08");
  assert.equal(event.status, "proposed");
  assert.match(event.body, /Holyrood/);
  assert.match(event.body, /Trinity and Placentia Bays/);
  assert.match(event.body, /41 to 45 mile/);
  assert.match(event.body, /little more than 12 miles/);
  assert.match(event.body, /not survey results/);
});

test("1850 St. John's station proposal retains printed comparison", () => {
  const event = eventBySource("mun-courier-1850-st-johns-station-editorial");
  assert.ok(event);
  assert.equal(event.date, "1850-11-20");
  assert.equal(event.status, "proposed");
  assert.match(event.body, /2,155 miles/);
  assert.match(event.body, /little more than 1,600 miles/);
  assert.match(event.body, /not construction/);
});

test("1850 source locators retain physical pages and evidence states", () => {
  const expected = new Map([
    ["mun-courier-1850-halifax-ireland-cable", ["physical PDF p. 2", "reported"]],
    ["mun-courier-1850-st-johns-station-editorial", ["physical PDF p. 2", "reported"]],
    ["mun-courier-1854-jtm-1850-route-reprint", ["physical PDF p. 2", "reported"]]
  ]);
  for (const [sourceId, [pages, status]] of expected) {
    const source = sources.find((entry) => entry.id === sourceId);
    assert.ok(source, sourceId);
    assert.equal(source.pages, pages);
    assert.equal(source.status, status);
  }
});

test("1850 research record retains source hashes", () => {
  const record = fs.readFileSync(new URL("../research/NP_1850_SYSTEM_RECORD.md", import.meta.url), "utf8");
  for (const hash of [
    "7af5f872f01885f35d33e019dc68cd9b8473dcf00cd9df1c5b734bb26e144d72",
    "8059202f6c5d02a6066b2fed02372e49b1e47ba8c1d8de32f4f45b64d995c180",
    "2e4f6f31b58da45c0ccd07afa5c51d1797e93ac83ac4d29da3c62848857dd11c"
  ]) {
    assert.match(record, new RegExp(hash));
  }
});

test("1850 work item is complete", () => {
  const item = workItems.work_items.find((entry) => entry.id === "NPREG-178");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-177"]);
  assert.deepEqual(item.completion_evidence, ["research/NP_1850_SYSTEM_RECORD.md", "src/data.js", "tests/np-1850-system.test.js"]);
});
