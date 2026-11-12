# TOD Access database reconciliation

Updated: 2026-11-11

The preserved Access file contains one user table, `TOD Rate Study Load Data`. It was opened read-only through the installed 64-bit Microsoft Access ODBC driver.

| Check | Access table | Text export |
| --- | ---: | ---: |
| Total rows | 4,175,709 | 4,175,709 |
| Measurement rows | 4,175,472 | 4,175,472 |
| Separator rows | 237 | 237 |
| Recorder IDs | 238 | 238 |
| Measurements per recorder | 17,544 | 17,544 |
| Primary-key range | 1 to 4,175,709 | 1 to 4,175,709 |
| Date range | 111201 to 131130 | 2011-12-01 to 2013-11-30 |
| Zero-value rows | 304,371 | 304,371 |

The recorder-ID sets are identical. No ID occurs only in the database or only in the export.

The Access columns are `PrimaryKey` COUNTER, `RECORDER_ID` VARCHAR, `DATE` INTEGER, `HOUR` INTEGER, and `WATTS` DOUBLE.

The maximum Access value is 30966.601 at primary key 3,579,359, recorder W1N-009, date 111208, hour 1100. The exported row stores `30966.60`. The export therefore does not preserve that DOUBLE value's third decimal place. A complete value-by-value comparison was not performed.

The database SHA-256 digest is `764336fae7b8d7f505822367e6011c5f9e6ab809a7b0e362751e398e2ed0a4c4`. The export SHA-256 digest is `4f1e865baa2259d74dffccebc3ede06605584569478b6faf378c2b99ecc8ba10`.
