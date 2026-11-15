import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { sources, timeline } from "../src/data.js";
import workItems from "../docs/work-items.json" with { type: "json" };

test("1866 Atlantic cable record preserves the local telegraphic report", () => {
  const event = timeline.find((entry) => entry.date === "1866-07-27" && entry.sourceId === "mun-express-1866-atlantic-cable");
  assert.ok(event);
  assert.equal(event.status, "reported");
  assert.match(event.body, /St\. John's received telegraphic notice/);
  assert.match(event.body, /Heart's Content/);
  assert.match(event.body, /successful laying of the Atlantic cable/);
});

test("1866 Cape Ray fault remains separate from the Atlantic cable landing", () => {
  const event = timeline.find((entry) => entry.date === "1866-07-27" && entry.sourceId === "mun-times-1866-cape-ray-cable-fault");
  assert.ok(event);
  assert.equal(event.status, "reported");
  assert.match(event.body, /Cape Ray, Newfoundland, and Cape North, Cape Breton Island/);
  assert.match(event.body, /does not give the failure date or the return-to-service date/);
});

test("1865 Atlantic cable recovery and traffic use separate sources", () => {
  const recovery = timeline.find((entry) => entry.date === "1866-09-02" && entry.sourceId === "mun-express-1866-cable-recovery");
  const traffic = timeline.find((entry) => entry.date === "1866-09-02" && entry.sourceId === "mun-express-1866-recovered-cable-traffic");
  assert.ok(recovery);
  assert.ok(traffic);
  assert.equal(recovery.status, "reported");
  assert.equal(traffic.status, "reported");
  assert.match(recovery.body, /hooked the 1865 cable at 8 o'clock/);
  assert.match(traffic.body, /17 messages/);
  assert.match(traffic.body, /Willoughby Smith certified/);
});

test("1865 Atlantic cable landing retains the reported shore-end times", () => {
  const event = timeline.find((entry) => entry.date === "1866-09-08");
  assert.ok(event);
  assert.equal(event.status, "reported");
  assert.match(event.body, /about 11:30 a\.m\./);
  assert.match(event.body, /landed from the Medway/);
  assert.match(event.body, /fixed in place by 4:30 p\.m\./);
});

test("1866 Gulf cable report does not invent endpoints or completion", () => {
  const event = timeline.find((entry) => entry.date === "1866-09-12");
  assert.ok(event);
  assert.equal(event.status, "reported");
  assert.match(event.body, /HMS Terrible and the Medway/);
  assert.match(event.body, /HMS Lily/);
  assert.match(event.body, /did not identify the Gulf cable endpoints or report completion/);
});

test("1866 source locators preserve physical pages and states", () => {
  const programme = sources.find((entry) => entry.id === "mun-express-1866-atlantic-cable");
  const fault = sources.find((entry) => entry.id === "mun-times-1866-cape-ray-cable-fault");
  const recovery = sources.find((entry) => entry.id === "mun-express-1866-cable-recovery");
  const traffic = sources.find((entry) => entry.id === "mun-express-1866-recovered-cable-traffic");
  const gulf = sources.find((entry) => entry.id === "mun-courier-1866-gulf-cable");
  assert.equal(programme?.pages, "physical PDF pp. 1 and 3");
  assert.equal(fault?.pages, "physical PDF p. 4");
  assert.equal(recovery?.pages, "physical PDF p. 3");
  assert.equal(traffic?.pages, "physical PDF p. 4");
  assert.equal(gulf?.pages, "physical PDF pp. 2 to 3");
  assert.equal(programme?.status, "reported");
  assert.equal(gulf?.status, "reported");
});

test("1866 research record retains primary-source hashes", () => {
  const record = fs.readFileSync(new URL("../research/NP_1866_SYSTEM_RECORD.md", import.meta.url), "utf8");
  for (const hash of [
    "4b28389ca417d1047aabf2d48b0cad7572401e9eee3f805b8ec724db4dd59d88",
    "df234e38f9755bfceeb88a1bf283c153c1b1ad9539e9e213c90436036f3e14c0",
    "7cee317314c9f02ece9473b4d2cf73cbe46d3e5e0aaf268e12bab1fcf29a5b4d",
    "24216da83aa3b0d61e19ce439f10b7feadcf92f4fedf22dd8cfc08fe781990fa",
    "ef5257254b841707d85c9edce75ca44e912ca55117fb9a441e568ff09d99ecf9"
  ]) {
    assert.match(record, new RegExp(hash));
  }
});

test("1866 work item follows the 1867 closeout", () => {
  const item = workItems.work_items.find((candidate) => candidate.id === "NPREG-162");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-161"]);
  assert.deepEqual(item.completion_evidence, ["research/NP_1866_SYSTEM_RECORD.md", "src/data.js", "tests/np-1866-system.test.js"]);
});
