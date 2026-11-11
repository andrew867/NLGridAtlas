# Claim and source audit

Started: 2026-11-11  
Work item: `SRC-001`

## Registered coverage

| Record class | Count | Source control |
| --- | ---: | --- |
| Static technical regions | 33 | `staticClaims` in `src/data.js`; attached to the rendered region by `data-claim-id` |
| Selectable diagram components | 141 | `components` in `src/data.js` |
| Timeline events | 27 | `timeline` in `src/data.js` |
| Island terminal records | 10 | `islandTerminalRecords` in `src/data.js` |
| Detailed Newfoundland Power profiles | 19 | `stationProfiles` in `src/data.js` |
| Source records | 78 | `sources` in `src/data.js` |

The static ledger covers the system-length panel, island and Avalon network views, terminal-station and Newfoundland Power one-lines, Avalon transmission work, load records, and the VHF records.

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
| `oxen-pond-terminal-one-line` | Oxen Pond application, physical PDF pp. 43 to 44; 2026 loop study, PDF p. 188 | The 2013 arrangement supports buses B2, B5, B3, and B4; breaker B2B5; TL236 and TL218; the seven Newfoundland Power circuit assignments; and capacitor-bank values. The 2026 study supports the displayed transformer ratings. |
| `hardwoods-terminal-one-line` | Oxen Pond application, physical PDF p. 61; 2026 loop study, PDF p. 188 | The 2013 drawing supports the bus arrangement, capacitor banks, G1 and T5. The 2026 study supports the displayed T1 through T4 model ratings and the 25 MW HWD-G1 model. G1 and T5 were added to the site because the registered claim previously included a generator that the drawing omitted. |
| `western-avalon-terminal-one-line` | Exhibit 114, PDF p. 7; 2014 T5 application, PDF pp. 12, 17 and 19 to 20; 2026 loop study, PDF pp. 194 to 195 | T1 through T5 voltages and staged ratings match. The T5 failure and Type H to Type VV tap-changer replacement match the 2014 application. The claim scope was corrected because the station drawing does not show a generator. |
| `holyrood-historical-one-line` | 2013 GRA Volume II, physical PDF p. 663; 2022 T2 final report, PDF pp. 5 to 13; 2024 reliability study, physical PDF pp. 100 and 182 | The historical bus and transformer arrangement matches the December 2012 demolition drawing. The T2 failure, replacement-transformer nameplate, reduced cooling capability, and January 13, 2022 return to service match the final report. The Unit 3 2030 synchronous-condensing entry remains identified as a planning case. |
| `hardwoods-substation-one-line` | 2027 power-transformer listing, physical PDF p. 548; 2011 Capital Budget Application, physical PDF pp. 310 and 334; 2016 HWD-07 reliability filing, physical PDF pp. 380 to 382; 2014 Capital Budget Application, physical PDF pp. 37, 42, 256 to 257, 348 and 351; 2006 handbook, PDF p. 14 | The prior drawing incorrectly placed every registered feeder on the 25 kV bus. The 2011 filing assigns five feeders to HWD-T1 and HWD-T2 at 12.5 kV and assigns HWD-07 and HWD-08 to HWD-T3 at 25 kV. The 2014 filing adds HWD-09 at 25 kV. The one-line now shows HWD-01, HWD-02, HWD-03, HWD-04, and HWD-06 on the 12.5 kV bus, with HWD-07, HWD-08, and HWD-09 on the 25 kV bus. |
| `oxen-pond-substation-one-line` | 2027 power-transformer listing, physical PDF p. 549; 2006 handbook, PDF p. 14; CA-NP-020, physical PDF pp. 14 and 115 | The one-line shows OXP-T1 at 66/12.5 kV, feeder OXP-01, and the seven registered 66 kV circuits. The 13.33 MVA rating and 9.87 MVA forecast are from the 2027 table. |
| `pulpit-rock-substation-one-line` | 2025 Capital Budget Application, PDF pp. 458 and 463 to 470; 2026 Capital Budget Application, PDF pp. 39, 197 and 370; 2027 power-transformer listing, physical PDF p. 549 | The 2025 station description supports 59L from Virginia Waters, two 25 MVA transformers, and five 12.5 kV feeders. The PUL-T2 asset and its replacement specification are dual-secondary 66/12.5/25 kV units. The later portable-equipment table records 25.0 kV as the low operating voltage, but it does not document a feeder-bus conversion. The drawing therefore uses the direct 12.5 kV feeder-bus record. |
| `memorial-substation-one-line` | Memorial transformer application, PDF pp. 14, 15, 25 and 29 to 33; CA-NP-158, physical PDF pp. 1 to 3; 2027 power-transformer listing, physical PDF p. 549 | The one-line follows the filed 12L and 14L supplies, two 66/12.5 kV transformers, split customer switchgear, and normally open bus tie. The displayed ratings are the current register values. |
| `long-pond-substation-one-line` | 2023 Long Pond capacity application, PDF pp. 109 to 111; CA-NP-158, physical PDF pp. 4 to 5; 2027 power-transformer listing, physical PDF pp. 548 to 549 | The drawing now includes 36L from Oxen Pond, B1 and B2 12.5 kV bus sections, the bus tie, and MUN-20 through MUN-29. CA-NP-158 shows LPD-T2 and several customer circuits as future work. The 2027 register supports showing both 25 MVA transformers in the station summary. |
| `kenmount-substation-one-line` | 2015 Capital Budget Application, physical PDF pp. 523 to 530; CA-NP-255, physical PDF p. 4; 2027 power-transformer listing, physical PDF p. 548; 2006 handbook, PDF pp. 6 to 7 and 14 | The simplified one-line shows the documented 35L, 54L, and 69L connections, parallel 66/25 kV transformer bank, and KEN-01 through KEN-05. Breaker and bus-section details are not reconstructed. |
| `goulds-substation-one-line` | PUB-NP-033, physical PDF pp. 29 to 30; 2027 power-transformer listing, physical PDF pp. 547 and 553; 2006 handbook, PDF pp. 6 to 7 and 13; 2014 Electrical System Improvements, physical PDF pp. 20, 42 and 43 | The simplified one-line separates GOU-T1 and the 33 kV 3L branch from the GOU-T2/T3 12.5 kV distribution bank. It shows the five documented 66 kV circuits and three distribution feeders without reconstructing breaker positions. |
| `virginia-waters-substation-one-line` | 2016 Capital Budget Application, physical PDF pp. 261 to 263; 2021 St. John's North and Portugal Cove study, physical PDF pp. 6 to 14; 2027 power-transformer listing, physical PDF p. 551 | The dated logical one-line uses the 2016 existing-station description: four 66 kV circuits, three 25 MVA transformers, one 12.5 kV bus structure, eight distribution feeders, eight side-break switches, one bus-tie switch, and three transformer air-break switches. It does not invent breaker positions. The evidence panel preserves the later voltage-record conflict for VIR-T2 and VIR-T3. |
| `ridge-road-substation-one-line` | 2015 Capital Budget Application, physical PDF p. 427; 2027 Ridge Road transformer replacement record, physical PDF pp. 105 to 108 and 511 to 518; PUB-NP-005, physical PDF p. 5; 2027 power-transformer listing, physical PDF p. 550 | The one-line follows the documented three 66 kV circuits, two 20 MVA transformers, two separate 12.5 kV bus sections, and four feeders per transformer. PUB-NP-005 confirms that the low-voltage bus-tie breaker was installed in 2015. Historical feeder designations are kept in the station browser because the 2015 arrangement does not identify the four feeders on each bus. |
| `kings-bridge-substation-one-line` | 2026 Capital Budget Application, physical PDF pp. 72 to 75 and 427 to 434; 2019 Pepperrell supplemental application, physical PDF p. 35; CA-NP-255, physical PDF p. 4 | The simplified one-line uses the current station description for 12L, 16L, 30L, KBR-T3, KBR-T4, and six 12.5 kV feeders. The 2019 feeder table supplies KBR-09, 10, 11, 12, 13, and 15. The T3 evidence panel keeps the proposed 2028 replacement separate from the existing transformer. |
| `pepperrell-substation-one-line` | 2019 Capital Budget Application, physical PDF pp. 231 to 232; 2019 Pepperrell supplemental application, physical PDF pp. 8, 24, 33 and 37; 2019 Capital Expenditure Report, physical PDF pp. 8, 20 and 24; 2027 power-transformer listing, physical PDF p. 549 | The logical one-line shows 16L, 74L, the parallel 25 MVA transformer bank, the 12.5 kV bus, and PEP-01 through PEP-05. It does not reconstruct breaker positions. The transformer panels retain the conflict between the 2019 12.5 kV station records and the 2027 equipment table's 25 kV entries. |
| `glendale-substation-one-line` | 2006 handbook, PDF pp. 6 to 7 and 12; 2020 Capital Budget Application, physical PDF pp. 447 to 453; PUB-NP-064 Attachment G, physical PDF pp. 148 to 152; CA-NP-176, physical PDF pp. 6 to 7; 2027 power-transformer listing, physical PDF p. 547 | The logical one-line shows 18L to Goulds, 73L to Hardwoods, three 25 MVA transformers, and GDL-01 through GDL-09. It does not assign feeders to bus sections because no public source located in this pass provides those assignments. The transformer evidence preserves the 12.5 kV station record and the later 25 kV equipment-table entries. |
| `st-johns-main-2015-one-line` | 2006 handbook, PDF pp. 6 and 15; 2011 Capital Budget Application, physical PDF pp. 413 to 416; 2015 Capital Budget Application, physical PDF pp. 502 to 507; CA-NP-255, physical PDF p. 4; 2027 power-transformer listing, physical PDF p. 550 | The dated logical one-line shows 4L, 13L and 25L; the selected 2015 SJM-T3 addition in parallel with SJM-T1 and SJM-T2; the historical SJM-T4 and SJM-12 4.16 kV branch; and the five later feeder assignments. The transformer panels preserve the conflict between the 2015 12.5 kV station record and the 2027 equipment table's 25 kV entries for SJM-T1 and SJM-T3. Breaker positions are not reconstructed. |
| `stamps-lane-substation-one-line` | 2006 handbook, PDF pp. 6 to 7 and 16; 2011 Capital Budget Application, physical PDF pp. 297 to 298; PUB-NP-276, physical PDF p. 6 and attachment p. 4; CA-NP-255, physical PDF p. 4; CA-NP-065, physical PDF p. 1; 2027 power-transformer listing, physical PDF p. 550 | The logical one-line separates the SLA-T1 and SLA-T2 4.16 kV bank from the SLA-T3 and SLA-T4 12.5 kV bank. It shows the six documented 66 kV circuits and the nine feeders with filed 2014 voltage assignments. SLA-08 and SLA-11 retain their documented transformer assignments. Breaker positions are not reconstructed. |

The May 18, 2010 construction register pages and the 2013 loading tables were also inspected during `SRC-002`. Their extracted data is controlled separately in `research/derived/np-register-layers-2008-2013.json`.

## Remaining manual gate

The automated checks establish traceability. They do not prove that a voltage, rating, designation, date, circuit endpoint or prose statement was transcribed correctly from the cited page.

Before `SRC-001` can close, each registered region and each component value must be compared with its cited physical PDF page. Drawing and table pages require visual inspection. Any mismatch must be corrected or changed to `unresolved`; the existence of a citation is not sufficient.
