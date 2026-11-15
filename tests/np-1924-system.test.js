import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { sources, stationProfiles, timeline } from "../src/data.js";

const historyText = (code) => {
  const station = stationProfiles.find((candidate) => candidate.code === code);
  assert.ok(station, `missing station ${code}`);
  return station.historyRecords.map(({ label, facts }) => `${label} ${facts.flat().join(" ")}`).join(" ");
};

test("1924 records retain Seal Cove commissioning and Petty Harbour rights", () => {
  const event = timeline.find((entry) => entry.date === "1924");
  assert.ok(event);
  assert.match(event.title, /Seal Cove hydroelectric development entered service/);
  assert.match(event.body, /two-unit Seal Cove development/);

  assert.match(historyText("SCV"), /1924 DEVELOPMENT COMMISSIONING.*1,220 m.*2,134 mm/);
  assert.match(historyText("SCV"), /1924 G1 GENERATOR.*Allis Chalmers/);
  assert.match(historyText("PHR"), /1924 WATER-RIGHTS DEED.*granted the rights perpetually/);
  assert.match(historyText("PHR"), /1924 REPORTED PHR-G3 INSTALLATION.*1\.8 MW/);
  assert.match(historyText("PHR"), /does not identify PHR-G3 as the separate historical machine commissioned in 1926/);
});

test("1924 sources and work item remain traceable", () => {
  for (const id of ["np-1924-seal-cove-development", "np-1924-seal-cove-g1", "np-1924-petty-harbour-water-rights"]) {
    assert.ok(sources.some((source) => source.id === id), `missing source ${id}`);
  }

  const record = fs.readFileSync(new URL("../research/NP_1924_SYSTEM_RECORD.md", import.meta.url), "utf8");
  assert.match(record, /Later sources do not publish one stable capacity for the plant/);
  assert.match(record, /records remain separate/);

  const workItems = JSON.parse(fs.readFileSync(new URL("../docs/work-items.json", import.meta.url), "utf8"));
  const item = workItems.work_items.find((candidate) => candidate.id === "NPREG-104");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.completion_evidence, ["research/NP_1924_SYSTEM_RECORD.md", "src/data.js", "tests/np-1924-system.test.js"]);
});
