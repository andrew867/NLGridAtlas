import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { sources, timeline } from "../src/data.js";
import workItems from "../docs/work-items.json" with { type: "json" };

test("1838 steam appropriation preserves the statutory conditions", () => {
  const event = timeline.find((entry) => entry.sourceId === "mun-statutes-1838-transatlantic-steam-service-act");
  assert.ok(event);
  assert.equal(event.date, "1838-10-25");
  assert.equal(event.status, "verified");
  assert.match(event.body, /£500 per year for three years/);
  assert.match(event.body, /steam power or burden/);
  assert.match(event.body, /four outward and four homeward trips/);
  assert.match(event.body, /does not prove that a vessel entered service/);
});

test("1838 proposal, law, editorial and notice remain separate", () => {
  const proposal = timeline.find((entry) => entry.sourceId === "mun-public-ledger-1838-transatlantic-steamer-call-proposal");
  assert.ok(proposal);
  assert.equal(proposal.status, "proposed");
  assert.match(proposal.body, /Liverpool and New York steamers/);

  const editorial = timeline.find((entry) => entry.sourceId === "mun-royal-gazette-1838-steam-navigation-editorial");
  assert.ok(editorial);
  assert.equal(editorial.status, "reported");
  assert.match(editorial.body, /suitable smaller vessel/);
  assert.match(editorial.body, /newspaper's interpretation/);

  const notice = timeline.find((entry) => entry.sourceId === "mun-royal-gazette-1838-steam-service-public-notice");
  assert.ok(notice);
  assert.equal(notice.date, "1838-11-05");
  assert.equal(notice.status, "verified");
  assert.match(notice.body, /solicited an operator/);
  assert.doesNotMatch(notice.body, /operator entered service/);
});

test("1838 sources retain exact page locators and evidence states", () => {
  const expected = new Map([
    ["mun-public-ledger-1838-transatlantic-steamer-call-proposal", ["physical PDF p. 4", "proposed"]],
    ["mun-statutes-1838-transatlantic-steam-service-act", ["physical PDF pp. 69 and 75, printed pp. 65 and 71", "verified"]],
    ["mun-royal-gazette-1838-steam-navigation-editorial", ["physical PDF p. 3", "reported"]],
    ["mun-royal-gazette-1838-steam-service-public-notice", ["physical PDF p. 3", "verified"]]
  ]);
  for (const [sourceId, [pages, status]] of expected) {
    const source = sources.find((entry) => entry.id === sourceId);
    assert.ok(source, sourceId);
    assert.equal(source.pages, pages);
    assert.equal(source.status, status);
  }
});

test("1838 research record preserves hashes and source conflict", () => {
  const record = fs.readFileSync(new URL("../research/NP_1838_SYSTEM_RECORD.md", import.meta.url), "utf8");
  for (const hash of [
    "90de7bd25e521ae7d4b52fc245da822fb7e28fd5d1f4b72a4710f50f8bb30b0e",
    "b126e8c2057f1135b0c4dda6f5a4966d5b59380252db6dae297f339e64476000",
    "750263d91faf51d3ae19bd8009e4026d71cf02af3e8a3af24ea27eb8e93cf124",
    "0c0e439eb9f719cf49b7a7165076d5375d47ae2d1fdda95044395ee7f695b678"
  ]) {
    assert.match(record, new RegExp(hash));
  }
  assert.match(record, /editorial interpretation/);
  assert.match(record, /full £1,500 appropriation remained unappropriated/);
  assert.match(record, /No named 1838 Newfoundland electric-telegraph circuit/);
});

test("1838 work item is complete", () => {
  const item = workItems.work_items.find((entry) => entry.id === "NPREG-190");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-189"]);
  assert.deepEqual(item.completion_evidence, ["research/NP_1838_SYSTEM_RECORD.md", "src/data.js", "tests/np-1838-system.test.js"]);
});
