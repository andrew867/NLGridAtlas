import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { sources, stationProfiles, timeline } from "../src/data.js";

test("1914 Victoria records preserve the equipment and development dates", () => {
  const event = timeline.find((entry) => entry.date === "1914");
  assert.ok(event);
  assert.match(event.title, /Victoria hydro turbine was installed/);
  assert.match(event.body, /450 kW Voith turbine installed in 1914/);
  assert.match(event.body, /development to 1904/);

  const victoria = stationProfiles.find((station) => station.code === "VIC");
  assert.ok(victoria);
  const history = victoria.historyRecords.map(({ label, facts }) => `${label} ${facts.flat().join(" ")}`).join(" ");
  assert.match(history, /1914 GENERATING UNIT.*450 kW Voith turbine installed in 1914/);
  assert.match(history, /Generator Westinghouse/);
  assert.match(history, /commissioning to 1904/);
});

test("1914 research retains the two filed unit ratings", () => {
  for (const id of ["np-1914-victoria-turbine", "np-1914-victoria-unit"]) {
    assert.ok(sources.some((source) => source.id === id), `missing source ${id}`);
  }

  const record = fs.readFileSync(new URL("../research/NP_1914_SYSTEM_RECORD.md", import.meta.url), "utf8");
  assert.match(record, /450 kW Voith turbine/);
  assert.match(record, /VIC-G at 0\.4 MW/);
  assert.match(record, /equipment installation rather than the development's commissioning date/);

  const workItems = JSON.parse(fs.readFileSync(new URL("../docs/work-items.json", import.meta.url), "utf8"));
  const item = workItems.work_items.find((candidate) => candidate.id === "NPREG-114");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.completion_evidence, ["research/NP_1914_SYSTEM_RECORD.md", "src/data.js", "tests/np-1914-system.test.js"]);
});
