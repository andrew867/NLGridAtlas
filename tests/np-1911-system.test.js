import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { islandTerminalRecords, sources, timeline } from "../src/data.js";

test("1911 record separates Goodyear's Dam from the Grand Falls grinder turbines", () => {
  const event = timeline.find((entry) => entry.date === "1911");
  assert.ok(event);
  assert.match(event.title, /Goodyear's Dam.*Grand Falls/);
  assert.match(event.body, /approximately 4 km upstream/);
  assert.match(event.body, /drive pulp grinders/);
  assert.match(event.body, /converted to electric generation in 1976/);

  const generation = islandTerminalRecords.find((entry) => entry.code === "GFS");
  assert.ok(generation);
  const facts = generation.facts.flat().join(" ");
  assert.match(facts, /Original G5 to G8 turbines.*1911.*pulp grinders/);
  assert.match(facts, /not electric generators/);
});

test("1911 research retains exact pages and archive identity", () => {
  for (const id of ["nlh-1911-goodyears-dam", "nlh-1911-grand-falls-turbines"]) {
    assert.ok(sources.some((source) => source.id === id), `missing source ${id}`);
  }

  const record = fs.readFileSync(new URL("../research/NP_1911_SYSTEM_RECORD.md", import.meta.url), "utf8");
  assert.match(record, /physical PDF pp\. 599 to 600/);
  assert.match(record, /physical PDF pp\. 947 and 983 to 984/);
  assert.match(record, /7295b73cf565c32382d53881a6e3e6e655d42a1c7c7d9d74665fc8d096097f02/);
  assert.match(record, /not described as 1911 electric generators/);

  const workItems = JSON.parse(fs.readFileSync(new URL("../docs/work-items.json", import.meta.url), "utf8"));
  const item = workItems.work_items.find((candidate) => candidate.id === "NPREG-117");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.completion_evidence, ["research/NP_1911_SYSTEM_RECORD.md", "src/data.js", "tests/np-1911-system.test.js"]);
});
