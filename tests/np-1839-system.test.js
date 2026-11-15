import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { sources, timeline } from "../src/data.js";
import workItems from "../docs/work-items.json" with { type: "json" };

test("1839 Cape Spear records preserve proposal and readiness states", () => {
  const proposal = timeline.find((entry) => entry.sourceId === "mun-newfoundlander-1839-cape-spear-telegraph-proposal");
  assert.ok(proposal);
  assert.equal(proposal.date, "1839-05-09");
  assert.equal(proposal.status, "proposed");
  assert.match(proposal.body, /Cape Spear/);
  assert.match(proposal.body, /Signal Hill/);
  assert.match(proposal.body, /distinguishing signal and house flag/);

  const readiness = timeline.find((entry) => entry.sourceId === "mun-public-ledger-1839-cape-spear-telegraph-readiness");
  assert.ok(readiness);
  assert.equal(readiness.date, "1839-10-11");
  assert.equal(readiness.status, "reported");
  assert.match(readiness.title, /reported/);
  assert.doesNotMatch(readiness.body, /operating circuit|completed transmission/);
});

test("1839 steam act preserves conditional service terms", () => {
  const event = timeline.find((entry) => entry.sourceId === "mun-statutes-1839-steam-communication-act");
  assert.ok(event);
  assert.equal(event.date, "1839-10-12");
  assert.equal(event.status, "verified");
  assert.match(event.body, /£1,500/);
  assert.match(event.body, /£500 annually for three years/);
  assert.match(event.body, /at least 80 horsepower/);
  assert.match(event.body, /£3,000 bond/);
  assert.match(event.body, /two trips per month/);
  assert.match(event.body, /does not prove that a vessel entered service/);
});

test("1839 galvanic telegraph remains foreign technical context", () => {
  const event = timeline.find((entry) => entry.sourceId === "mun-newfoundlander-1839-great-western-galvanic-telegraph");
  assert.ok(event);
  assert.equal(event.status, "reported");
  assert.match(event.body, /Paddington and Drayton/);
  assert.match(event.body, /Brass keys used galvanic power/);
  assert.match(event.body, /Two wires ran through a hollow iron tube/);
  assert.match(event.body, /not a Newfoundland electric circuit/);
});

test("1839 sources retain page locators and evidence states", () => {
  const expected = new Map([
    ["mun-public-ledger-1839-halifax-steam-circular", ["physical PDF p. 3", "proposed"]],
    ["mun-newfoundlander-1839-cape-spear-telegraph-proposal", ["physical PDF p. 3", "proposed"]],
    ["mun-public-ledger-1839-cape-spear-telegraph-readiness", ["physical PDF p. 4", "reported"]],
    ["mun-statutes-1839-steam-communication-act", ["physical PDF pp. 33 to 34, printed pp. 29 to 30", "verified"]],
    ["mun-newfoundlander-1839-great-western-galvanic-telegraph", ["physical PDF pp. 1 to 2", "reported"]]
  ]);
  for (const [sourceId, [pages, status]] of expected) {
    const source = sources.find((entry) => entry.id === sourceId);
    assert.ok(source, sourceId);
    assert.equal(source.pages, pages);
    assert.equal(source.status, status);
  }
});

test("1839 research record preserves hashes and source boundaries", () => {
  const record = fs.readFileSync(new URL("../research/NP_1839_SYSTEM_RECORD.md", import.meta.url), "utf8");
  for (const hash of [
    "122115638ce06afef74e609c04dd34294186d4e5aabacca61f1c4e24181077b0",
    "dc80eab1a39f07dd34363e95f32dc03503ff92b93fea5703d397d7b4960e505a",
    "e56e4e690ae49b38732ebe244c3e901885854397e75f30547974ec1572648369",
    "4fd5b4927eeac74bb92783ddd068329b7032565ca759a38a18b4ffea8253b2da",
    "fee9c7b9d9042a1ce9c91722b25a26206617c396e5235c02258a9eef4424e469"
  ]) {
    assert.match(record, new RegExp(hash));
  }
  assert.match(record, /optical flag telegraph/);
  assert.match(record, /conditional service terms/);
  assert.match(record, /No named 1839 Newfoundland electric-telegraph company/);
});

test("1839 work item is complete", () => {
  const item = workItems.work_items.find((entry) => entry.id === "NPREG-189");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-188"]);
  assert.deepEqual(item.completion_evidence, ["research/NP_1839_SYSTEM_RECORD.md", "src/data.js", "tests/np-1839-system.test.js"]);
});
