import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const study = JSON.parse(await readFile(
  new URL("../research/derived/np-2018-tod-study.json", import.meta.url),
  "utf8",
));
const audit = JSON.parse(await readFile(
  new URL("../research/derived/np-2018-tod-export-audit.json", import.meta.url),
  "utf8",
));

test("TOD export audit reconciles the derived hourly-data record", () => {
  assert.equal(audit.source_sha256, study.source.csv_export_sha256);
  assert.equal(audit.source_bytes, study.source.csv_export_bytes);
  assert.equal(audit.measurement_rows, study.hourly_data.measurement_rows);
  assert.equal(audit.separator_rows, study.hourly_data.separator_rows);
  assert.equal(audit.recorder_series, study.hourly_data.recorder_series);
  assert.equal(audit.first_date, study.hourly_data.first_date);
  assert.equal(audit.last_date, study.hourly_data.last_date);
  assert.equal(audit.minimum_watts, study.hourly_data.minimum_watts);
  assert.equal(audit.maximum_watts, study.hourly_data.maximum_watts);
  assert.equal(audit.zero_watt_rows, study.hourly_data.zero_watt_rows);
});

test("TOD export has complete primary keys and uniform recorder series", () => {
  assert.deepEqual(audit.measurements_per_recorder, { "17544": 238 });
  assert.equal(audit.distinct_dates, 731);
  assert.equal(audit.hours.length, 24);
  assert.equal(audit.primary_key.first, 1);
  assert.equal(audit.primary_key.last, audit.total_data_rows);
  assert.equal(audit.primary_key.discontinuities, 0);
});

test("TOD source record identifies the preserved Access database", () => {
  assert.equal(study.source.attachment_a_bytes, 238297088);
  assert.equal(
    study.source.attachment_a_sha256,
    "764336fae7b8d7f505822367e6011c5f9e6ab809a7b0e362751e398e2ed0a4c4",
  );
  assert.match(study.source.attachment_a_local_path, /TOD Rate Study Load Data\.ACCDB$/);
});
