import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { sources, timeline } from "../src/data.js";
import workItems from "../docs/work-items.json" with { type: "json" };

test("1867 route petition remains a proposal", () => {
  const event = timeline.find((entry) => entry.date === "1867-02-26");
  assert.ok(event);
  assert.equal(event.status, "proposed");
  assert.match(event.body, /St\. John's to Port Hood/);
  assert.match(event.body, /Placentia to the continent of America/);
  assert.match(event.body, /Heart's Content to Placentia/);
  assert.match(event.body, /does not establish construction or completion/);
});

test("1867 committee record preserves the reported Trepassey line removal", () => {
  const event = timeline.find((entry) => entry.date === "1867-03-15");
  assert.ok(event);
  assert.equal(event.status, "reported");
  assert.match(event.body, /between St\. John's and Trepassey had been taken down/);
  assert.match(event.body, /does not give the removal date/);
});

test("1867 statute records capital authority without inventing construction", () => {
  const event = timeline.find((entry) => entry.date === "1867-04-26");
  assert.ok(event);
  assert.equal(event.status, "verified");
  assert.match(event.body, /\$3 million to \$6 million/);
  assert.match(event.body, /operative section changed the authorized capital/);
  assert.match(event.body, /did not establish that either work was built/);
});

test("1867 road report preserves the observed pole position", () => {
  const event = timeline.find((entry) => entry.date === "1867-12-31");
  assert.ok(event);
  assert.equal(event.status, "reported");
  assert.match(event.body, /Half-way House and Salmonier Bridge/);
  assert.match(event.body, /no more than five feet from the centre of the road/);
});

test("1867 source locators preserve pages and controlled states", () => {
  const journal = sources.find((entry) => entry.id === "mun-house-journal-1867-telegraph");
  const statute = sources.find((entry) => entry.id === "nl-statutes-1867-telegraph-capital");
  const road = sources.find((entry) => entry.id === "mun-house-journal-1868-road-report-1867");
  assert.ok(journal);
  assert.ok(statute);
  assert.ok(road);
  assert.equal(journal.pages, "archival record, physical compound-object images 62 and 99 to 100, printed pp. 56 and 93 to 94");
  assert.equal(statute.pages, "physical PDF pp. 107 to 108, chapter pp. 1 to 2");
  assert.equal(statute.status, "verified");
  assert.equal(road.pages, "physical PDF p. 655, printed p. 578");
});

test("1867 research record retains primary-source hashes", () => {
  const record = fs.readFileSync(new URL("../research/NP_1867_SYSTEM_RECORD.md", import.meta.url), "utf8");
  for (const hash of [
    "f6f41b2de4dd9533f36038b08c50f0ab6a395e77196578ae0c54cf4ac52e4c2e",
    "891d5bcc2a78d3af072cffbbd799edd204f24055384f245f656ca134cc073213",
    "85ba25fc06ee6522b2f711d94a473ae8b683d3f18d4ab6b67bc832f5fae44a0e",
    "161f7331d0dc4c1fce2c42ed73c5e3c2cbf1a02d2f7d704eb632415b39943b48",
    "2f79446d8af69396dc1bb73c0c187f0247144f413362c872898f9c696ef4490f"
  ]) {
    assert.match(record, new RegExp(hash));
  }
});

test("1867 work item follows the 1868 closeout", () => {
  const item = workItems.work_items.find((candidate) => candidate.id === "NPREG-161");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-160"]);
  assert.deepEqual(item.completion_evidence, ["research/NP_1867_SYSTEM_RECORD.md", "src/data.js", "tests/np-1867-system.test.js"]);
});
