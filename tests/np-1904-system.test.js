import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { sources, stationProfiles, timeline } from "../src/data.js";
import workItems from "../docs/work-items.json" with { type: "json" };

test("1904 record separates Victoria commissioning from the 1914 turbine", () => {
  const event = timeline.find((entry) => entry.date === "1904");
  assert.ok(event);
  assert.match(event.title, /Victoria hydroelectric development/);
  assert.match(event.body, /500 kW/);
  assert.match(event.body, /0\.55 MW/);
  assert.match(event.body, /installed later, in 1914/);

  const victoria = stationProfiles.find((station) => station.code === "VIC");
  const history = victoria.historyRecords.find((entry) => entry.label === "1904 HYDROELECTRIC DEVELOPMENT");
  assert.ok(history);
  assert.match(JSON.stringify(history.facts), /494 m penstock/);
  assert.match(JSON.stringify(history.facts), /original turbine-generators/);
});

test("1904 sources retain the capacity difference and exact provenance", () => {
  const development = sources.find((entry) => entry.id === "np-1914-victoria-turbine");
  assert.match(JSON.stringify(development.topics), /1904/);
  const operations = sources.find((entry) => entry.id === "np-2008-victoria-operations");
  assert.equal(operations.pages, "physical PDF p. 95");
  assert.equal(operations.status, "reported");

  const record = fs.readFileSync(new URL("../research/NP_1904_SYSTEM_RECORD.md", import.meta.url), "utf8");
  assert.match(record, /present unit must not be treated as the original 1904 machine/);
  assert.match(record, /0\.55 MW value differs from the 500 kW total/);
  assert.match(record, /1b27d6b0a58416c06045f8e54618c33b2902f26dda83d53780a4b01b5e14b477/);
  assert.match(record, /c1bb6fbdaa468ff1e28393c485f9e31deae14adfe782aa4df41f45dea62fd3db/);
  assert.match(record, /4adb017b3e4308d57d981686482f7169494fd4b69a1be02d3b1624a75c24ad39/);
});

test("1904 work item follows the 1905 queue", () => {
  const item = workItems.work_items.find((candidate) => candidate.id === "NPREG-124");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-123"]);
  assert.deepEqual(item.completion_evidence, ["research/NP_1904_SYSTEM_RECORD.md", "src/data.js", "tests/np-1904-system.test.js"]);
});
