# Claim and source audit

Started: 2026-11-11  
Work item: `SRC-001`

## Registered coverage

| Record class | Count | Source control |
| --- | ---: | --- |
| Static technical regions | 23 | `staticClaims` in `src/data.js`; attached to the rendered region by `data-claim-id` |
| Selectable diagram components | 49 | `components` in `src/data.js` |
| Timeline events | 25 | `timeline` in `src/data.js` |
| Island terminal records | 10 | `islandTerminalRecords` in `src/data.js` |
| Detailed Newfoundland Power profiles | 9 | `stationProfiles` in `src/data.js` |
| Source records | 35 | `sources` in `src/data.js` |

The static ledger covers the system-length panel, island and Avalon network views, four terminal-station one-lines, five detailed Newfoundland Power one-lines, Avalon transmission work, four load records, and the VHF records.

## Automated checks

`tests/claim-ledger.test.js` checks that:

1. Static claim identifiers are unique and stable.
2. Evidence states use the controlled vocabulary.
3. Every static claim has at least one page-level source.
4. Every cited source ID exists.
5. Every static ledger entry is attached to exactly one rendered region.

Existing data tests perform the same source-resolution checks for timeline events, diagram components, island terminals and station profiles.

## Remaining manual gate

The automated checks establish traceability. They do not prove that a voltage, rating, designation, date, circuit endpoint or prose statement was transcribed correctly from the cited page.

Before `SRC-001` can close, each registered region and each component value must be compared with its cited physical PDF page. Drawing and table pages require visual inspection. Any mismatch must be corrected or changed to `unresolved`; the existence of a citation is not sufficient.
