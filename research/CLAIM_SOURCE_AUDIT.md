# Claim and source audit

Started: 2026-11-11  
Work item: `SRC-001`

## Registered coverage

| Record class | Count | Source control |
| --- | ---: | --- |
| Static technical regions | 23 | `staticClaims` in `src/data.js`; attached to the rendered region by `data-claim-id` |
| Selectable diagram components | 50 | `components` in `src/data.js` |
| Timeline events | 25 | `timeline` in `src/data.js` |
| Island terminal records | 10 | `islandTerminalRecords` in `src/data.js` |
| Detailed Newfoundland Power profiles | 9 | `stationProfiles` in `src/data.js` |
| Source records | 41 | `sources` in `src/data.js` |

The static ledger covers the system-length panel, island and Avalon network views, four terminal-station one-lines, five detailed Newfoundland Power one-lines, Avalon transmission work, four load records, and the VHF records.

## Automated checks

`tests/claim-ledger.test.js` checks that:

1. Static claim identifiers are unique and stable.
2. Evidence states use the controlled vocabulary.
3. Every static claim has at least one page-level source.
4. Every cited source ID exists.
5. Every static ledger entry is attached to exactly one rendered region.

Existing data tests perform the same source-resolution checks for timeline events, diagram components, island terminals and station profiles.

## Completed manual checks

| Claim ID | Pages inspected | Result |
| --- | --- | --- |
| `island-system-lengths` | 2023 asset report, physical PDF pp. 5 and 7 | Matched 4,432 km total, 2,246 km at 230 kV, 1,538 km at 138 kV, and 648 km at 69 kV. |
| `island-generation-transmission-overview` | 2013 GRA Volume II, physical PDF p. 79; 2006 handbook, PDF pp. 2, 4 and 6 to 18 | The map is dated November 26, 2012. Extracted handbook totals match 104 transmission lines, 136 substations, and 302 feeders. |
| `avalon-230-semi-geographic` | Exhibit 114, PDF p. 7; 2013 GRA Volume II, physical PDF p. 663; Oxen Pond application, physical PDF p. 15 | The displayed TL208, TL237, TL203, TL201, TL217, TL236, TL242, and TL218 endpoints match the drawings. The Oxen Pond map supports the west-to-east station placement. |
| `avalon-66-semi-geographic` | 2006 handbook, PDF pp. 6 to 16; Oxen Pond application, physical PDF p. 15 | Automated endpoint checks reproduce the June 2005 register. The station placement follows the filed semi-geographic map. |
| `oxen-pond-terminal-one-line` | Oxen Pond application, physical PDF p. 43; 2026 loop study, PDF p. 188 | The bus arrangement, TL236 and TL218 terminals, transformer ratings, and capacitor-bank values match. The incorrect citation to the 2027 Newfoundland Power distribution-transformer listing was replaced with the loop-study page that supports the 2026 Hydro terminal ratings. |
| `hardwoods-terminal-one-line` | Oxen Pond application, physical PDF p. 61; 2026 loop study, PDF p. 188 | The 2013 drawing supports the bus arrangement, capacitor banks, G1 and T5. The 2026 study supports the displayed T1 through T4 model ratings and the 25 MW HWD-G1 model. G1 and T5 were added to the site because the registered claim previously included a generator that the drawing omitted. |
| `western-avalon-terminal-one-line` | Exhibit 114, PDF p. 7; 2014 T5 application, PDF pp. 12, 17 and 19 to 20; 2026 loop study, PDF pp. 194 to 195 | T1 through T5 voltages and staged ratings match. The T5 failure and Type H to Type VV tap-changer replacement match the 2014 application. The claim scope was corrected because the station drawing does not show a generator. |
| `holyrood-historical-one-line` | 2013 GRA Volume II, physical PDF p. 663; 2022 T2 final report, PDF pp. 5 to 13; 2024 reliability study, physical PDF pp. 100 and 182 | The historical bus and transformer arrangement matches the December 2012 demolition drawing. The T2 failure, replacement-transformer nameplate, reduced cooling capability, and January 13, 2022 return to service match the final report. The Unit 3 2030 synchronous-condensing entry remains identified as a planning case. |

The May 18, 2010 construction register pages and the 2013 loading tables were also inspected during `SRC-002`. Their extracted data is controlled separately in `research/derived/np-register-layers-2008-2013.json`.

## Remaining manual gate

The automated checks establish traceability. They do not prove that a voltage, rating, designation, date, circuit endpoint or prose statement was transcribed correctly from the cited page.

Before `SRC-001` can close, each registered region and each component value must be compared with its cited physical PDF page. Drawing and table pages require visual inspection. Any mismatch must be corrected or changed to `unresolved`; the existence of a citation is not sufficient.
