# NL Grid Atlas project status

Updated: 2026-11-12

## Repository and hosting

- GitHub repository: `andrew867/NLGridAtlas`.
- Repository visibility: public.
- Default branch: `main`.
- The local `main` branch tracks `origin/main`.
- A GitHub Pages workflow builds with Node.js 20, runs the complete test suite, builds the Vite site, and deploys the `dist` artifact.
- GitHub Pages is live at `https://andrew867.github.io/NLGridAtlas/`.
- GitHub Actions run `43049501960` passed the complete test, build, and deployment workflow for commit `e2194ac`.
- The published build passed desktop and 390 by 844 px browser checks. Its assets loaded under `/NLGridAtlas/`, the MUN-08 detail interaction worked, and the browser reported no warnings or errors.

## Verified in the current work session

- Added the 1975 Memorial University Health Sciences Centre transformer and emergency-generation records.
- Linked MUN-01 and MUN-08 to the Health Sciences electrical-plant evidence panel.
- Kept the six MUN archive photographs as external records because the archive reserves reproduction rights.
- Passed the automated test suite, source-hash verification, and the production build.
- Verified the Memorial diagram and evidence interaction in the browser.
- Published and verified the atlas on GitHub Pages.
- Added a clickable, source-cited St. John's Main logical one-line for the 2015 selected arrangement.
- Added a clickable Stamp's Lane logical one-line that separates the documented 4.16 kV and 12.5 kV banks.
- Verified the Stamp's Lane diagram at 1440 by 1000 px and 390 by 844 px with no page overflow, out-of-bounds SVG text, browser warnings, or browser errors.
- Linked documented circuit ends to the available detailed diagram, station record, or island terminal record.
- Qualified public commit `af61cb5` from a fresh clone: 71 tests, production build, 66 pinned PDF hashes, and a clean worktree passed.
- Added the interactive 2018 island AC backbone with all 58 filed Hydro circuit designations and 68 filed route segments.
- Added voltage filters, circuit records, station connection records, and links to the existing terminal records.
- Verified one detail panel, circuit and station selection, filtering, zero browser warnings or errors, and a 390 px layout with no page overflow.
- Replaced the ten island terminal summary cards with dated connection diagrams and equipment records.
- Added the filed Sunnyside T1 breaker arrangement, Stony Brook transformer ratings, Buchans T1 replacement rating, Deer Lake transformation ratings, Bottom Brook and Stephenville post-retirement planning arrangement, Massey Drive transformer assignments, and all four Come By Chance capacitor banks.
- Added individual records for Upper Salmon, Granite Canal, Cat Arm, and Hinds Lake with filed plant ratings, energy capability, and documented transmission connections.
- Corrected the 2013 island plant-assignment source reference from physical PDF p. 663 to physical PDF p. 80. Physical PDF p. 663 remains the Holyrood demolition drawing.
- Verified Upper Salmon and Cat Arm record rendering at 1440 by 1000 px and 390 by 844 px. The mobile page has no horizontal page overflow; the one-line remains horizontally scrollable inside its own frame.
- Added a dedicated Molloy's Lane record with 15L and 19L supplies, both transformer records, eight 12.5 kV feeders, the 2023 proposed modernization scope, and six filed feeder route sheets.
- Verified the Molloy's Lane diagram and MOL-01 route sheet at 1440 by 1000 px and 390 by 844 px. The mobile page has no horizontal page overflow; the one-line remains horizontally scrollable inside its frame.
- Added individual west-coast, Northern Peninsula, and rural records for Berry Hill, Peter's Barren, Plum Point, Bear Cove, St. Anthony Airport, Hawke's Bay, Howley, South Brook, Doyles, Grandy Brook, and English Harbour West.
- Verified Berry Hill map selection, station navigation, and record rendering at 1440 by 1000 px and 390 by 844 px. The map selection stayed in place; the record link opened the station register; the mobile page had no horizontal page overflow.
- Added the 2003 staged transformer ratings for Howley, Deer Lake, and Stony Brook.
- Added the 1998 Massey Drive 230/66 kV transformer replacement record from the 2001 prefiled testimony.
- Separated the original Holyrood T8 from the later Holyrood T8 model after locating the 2014 relocation record. The original unit entered service in the Sunnyside T1 position by December 2014.
- Added Buchans T1's 1970 Massey Drive installation, 1998 Buchans relocation, and 2018 replacement plan.
- Confirmed the replacement Holyrood T8 was installed in 2014 at 75/100/125 MVA.
- Added the Holyrood T7 equipment chain: the 1969 Canadian General Electric unit, the 2018 removal from service, the Churchill Falls T31 replacement, and project completion in 2024.
- Located Holyrood sheet B, revision 17, dated December 18, 2014. It updates one station section but is not a complete post-2012 station drawing set.
- Added Bay d'Espoir station 1 and station 2 equipment records from the filed one-lines: six original unit banks and generators, G7 and T7, the two 230/69 kV interface transformers, and the 69/24 kV local transformer.
- Added the 2014 Come By Chance facility arrangement: two 30/40/50 MVA, 230/13.8 kV transformers manufactured in 1972, the split B1/B2 bus, the documented 13.8 kV equipment, and the later Braya-specific cost assignment.
- Deferred unsupported lower-voltage rural records and current rural breaker drawings so the transformer ledger and main island network can proceed.
- Added a Soldiers Pond record that separates the six-circuit 230 kV yard, two LCC poles, three 175 MVAr synchronous condensers, converter-transformer spare, and EL3/4 electrode line. The island map now opens the station record.
- Added dated system diagrams for the Labrador-Island Link and Maritime Link, including converter technology, pole designations, transfer ratings, AC interfaces, submarine cables, and ground-return facilities.
- Separated the commissioned LIL date and Maritime Link operating record from earlier design-basis and preliminary one-line evidence.
- Added the historical Corner Brook 50 Hz to 60 Hz rotating converter arrangement, including the 25 MVA motor-generator set, both 21/28 MVA transformers, the starting system, the Deer Lake and Massey Drive interfaces, the 2017 upgrade record, and the 2018 sale and abandonment approval.
- Kept post-sale operation open because the 2018 order approves the transaction but does not provide a later as-built or operating one-line.
- Closed the island transformer ledger for the published evidence located to date. Unsupported rural nameplates, current rural breaker drawings, and later Grand Falls and Bishop's Falls equipment drawings remain deferred rather than inferred.
- Deferred the remaining Avalon feeder-to-bus assignments because the archive does not contain the required operating or protection one-lines.
- Deferred a current complete Holyrood station drawing after a targeted 2020 to 2026 search returned planning loop diagrams and transformer tables, but no complete as-built station one-line.
- Deferred the final Avalon combustion-turbine connection. Hydro's 2025-12-12 filing remained an early-execution request while the build application was under review. It records design, procurement, TL218 work, and Newfoundland Power line relocations, but no issued-for-construction or as-built one-line.
- Completed the dated telecommunications record. Separate diagrams now show the 2001 conventional network, the proposed 2004 trunked replacement, and the P25 plus vehicle-data project reported in 2026.
- Added the 1999 to 2003 microwave work, the 2004 replacement economics, the four Hydro-owned frequency records, and expandable copies of the complete existing-site and potential-site sheets.
- Added the 2013/2014 Newfoundland Power and Avalon actual winter peaks without treating them as coincident measurements.
- Added the January 2020 Nostradamus data-import failure with the separately reported forecast, actual peak, and error values for January 2 and January 3.
- Added a planning table for the eight highest 2026 transformer forecast-to-rating ratios in the 2027 transformer register. The table identifies them as planning values, not measured loading.
- Corrected the King's Bridge and Ridge Road maximum-peak labels to state that they are five-year forecasts.
- Deferred missing rural measured-load records rather than holding up the documented load section.
- Added 588 Newfoundland island transmission-line features from the Government of Newfoundland and Labrador GeoAtlas Canvec layer. Their validation years run from 1979 through 1991, so the dataset is retained as a historical geographic reference.
- Expanded the checked station-boundary register from 8 to 22 records. The Avalon additions cover Airport, Broad Cove, Chamberlains, Glendale, King's Bridge, Kelligrews, Kenmount, Long Pond, Molloy's Lane, Memorial, Pepperrell, Seal Cove, St. John's Main, and Stamp's Lane. The register preserves each OpenStreetMap object, version, and timestamp.
- Kept circuit designations out of the geographic route layer because the GeoAtlas records do not provide them.
- Added island and Avalon geographic views. Station selection updates a fixed detail panel; the station-record link performs navigation.
- Added the GeoAtlas `TL_ID` 3501 feature as a separate L3501 geographic route. The source layer has no voltage field or separate L3502 geometry.
- Added a complete digest manifest for the 66 committed evidence PDFs, including the eight catalog records that previously lacked pinned hashes.
- Defined the external archive snapshot as immutable SHA-256 objects plus mirror path indexes. Current PUB, NL Hydro, and Newfoundland Power mirror counts and control-file hashes are recorded.
- Reconciled the original TOD Access table with its text export. Row counts, recorder IDs, per-recorder counts, primary keys, dates, and zero-value counts match. The export rounds the maximum Access value from 30966.601 to 30966.60.
- Corrected TL208's current eastern endpoint from the retired Long Harbour terminal to the Voisey's Bay Nickel terminal. The new terminal entered service in 2012 after TL208 was extended; the historical Long Harbour equipment remains in the source record.
- Added the 2022 Holyrood condition-study transformer inventory, including the three generator transformers, three excitation transformers, three unit-service transformers, and two station-service transformers.
- Added the July 2026 Unit 3 operating record: 0 generating hours and 697 synchronous-condensing hours.
- Separated the 2012 Muskrat Falls plan to convert Units 1 and 2 from later Holyrood backup, life-extension, and post-steam planning records.
- Confirmed from the 2020 capital RFI that Hydro had dropped Units 1 and 2 from the synchronous-condenser operating plan; only Unit 3 remained.
- Added the February 2025 Unit 1 overhaul completion record and the September 2025 list of reactive-power alternatives under assessment.
- Added Glovertown's filed 2022 station equipment, former radial tap, completed 121L and 124L loop arrangement, feeder set, and current transformer-register value.
- Added Twillingate's filed station equipment, completed 2013 modernization, current transformer-register value, radial 140L connection, feeder set, and measured 2023 to 2024 winter-voltage record.
- Added Trinity's 116L tap, 66/25 kV transformer and feeder record, 2005 sectionalizing-control description, and the documented 2020 TRN-T1 bushing failure.
- Added Hare Bay's 115L and 116L series connection, current transformer and feeder records, HBS-01 to GAM-01 distribution transfer, customer count, and observed 2021 to 2025 transmission-supply reliability.
- Added Wesleyville's distribution and generation transformers, three feeders, 116L connection, existing 8 MW derated combustion turbine, and the separately labeled 2027 to 2031 replacement proposal.
- Added Greenhill's 301L and 305L connections, distribution and generation transformers, three feeders, existing 20 MW derated turbine, operating history, and the proposed two-unit replacement. The GRH-T2 voltage discrepancy is confined to the station detail.
- Added Salt Pond's 138 kV, 66 kV, and 12.5 kV arrangement, four line connections, three transformers, three feeders, transformer installation years, current transformer ratings, and the separately labeled 2017 modernization filing.
- Added Marystown's 300L and 308L connections, four feeders, current transformer rating and forecast, 2019 filed equipment, and the separately labeled 2020 modernization filing.
- Added Grand Bay's three 66 kV connections, two feeders, former transformer and tap-changer record, mobile gas turbine role, filed 2020 work, and current fleet-table value. The published 12.5 kV and 25 kV records remain dated and separate.
- Added Port aux Basques' 417L connection, two mapped feeders, present diesel generator and transformer records, the 2010 arrangement, and the separately labeled 2011 modernization filing.
- Added Long Lake's 416L connection, two feeder records, the Rose Blanche hydro plant tap, current transformer value, and the filed LGL-02 pole replacement. The 12.5 kV feeder and 25 kV fleet-table records remain dated and separate.
- Added Humber's 356L and 359L connections, former 4.16 kV and 12.5 kV banks, the 2019 bus-insulator failure, current transformer record, and the separately labeled 2022 voltage-conversion filing.
- Added Victoria's radial 40L connection, both feeders, both transformer records, 500 kVA hydro generator, and the separately labeled 2016 modernization filing.
- Added Mobile's four filed line connections, two distribution feeders, dated distribution and generation transformer records, current MOB-T2 fleet-table value, and the separately labeled 2008 refurbishment. The Mobile Hydro Plant remains a separate MOP record.
- Added Seal Cove's 38L and 52L connections, two distribution feeders, dated generation and distribution equipment, and current transformer-register values. The 12.5 kV and 25 kV SCV-T2 records remain dated and separate.
- Identified the current internal Holyrood drawing numbers `1403-500-E001` and `1403-500-E004` in the 2022 study document register. The drawings were named but not filed.
- Added the March 2025 Holyrood Capital Plan Refresh, including Unit 3 condition-monitoring and auxiliary-system findings plus the six CAT 3516B black-start sets.
- Added the 2017 Holyrood plant-service arrangements and the 2019 completion records for the SST34 cable replacement and the lower-cost Newfoundland Power auxiliary supply connection.
- Deferred publication of the external archive snapshot at the user's request.

## Active work

1. Continue source-specific western and rural station additions under `ISL-005` when a filing establishes equipment, connections, or a dated project state.

The current Holyrood one-line search is deferred. The archive pass identified internal drawing numbers `1403-500-E001` and `1403-500-E004`, but no public filing reproduces either drawing. The atlas retains the dated December 2012 diagram and later equipment records without inventing the missing breaker arrangement.

Phase 4 geography is complete for the sources located to date. Current AC circuit-to-route matching remains deferred because the available island route layer has no utility circuit designations.

## Island backbone progress

The structured and interactive 2018 layer contains all 58 Hydro circuit designations in PUB-NP-084 Attachment A, physical PDF pp. 24 to 26: 16 at 66 kV, 16 at 138 kV, and 26 at 230 kV. Every filed segment is rendered with a stable endpoint identifier and source-page detail. Current 69 kV circuit assignments remain open because the 2023 asset report gives only the class total, not circuit designations.

## Remaining Avalon evidence target

The detailed-station pass is complete for the public evidence located to date. Remaining work is not another register-based drawing. It requires protection or operating one-lines that assign feeders to transformer banks and bus sections, especially at Hardwoods, Glendale, Ridge Road, and Stamp's Lane.

Direct circuit navigation is complete where the opposite endpoint has a detailed diagram or station record. TL208 now opens the Voisey's Bay Nickel record; Long Harbour is retained as the retired historical predecessor.

## Open release gates

- The full external mirror snapshot is not public. Publication is deferred; the repository's 66 pinned evidence PDFs remain public and independently verified.
