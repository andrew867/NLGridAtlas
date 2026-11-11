# NL Grid Atlas project status

Updated: 2026-11-11

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
- Passed 92 automated tests, source-hash verification, and the production build.
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

## Active work

1. Complete island transformer nameplate and age records, `ISL-006`.
2. Resolve remaining Avalon feeder-to-transformer and bus-section assignments, `AVL-002`.
3. Find the latest supported Holyrood station arrangement, `GEN-001`.

## Island backbone progress

The structured and interactive 2018 layer contains all 58 Hydro circuit designations in PUB-NP-084 Attachment A, physical PDF pp. 24 to 26: 16 at 66 kV, 16 at 138 kV, and 26 at 230 kV. Every filed segment is rendered with a stable endpoint identifier and source-page detail. Current 69 kV circuit assignments remain open because the 2023 asset report gives only the class total, not circuit designations.

## Remaining Avalon evidence target

The detailed-station pass is complete for the public evidence located to date. Remaining work is not another register-based drawing. It requires protection or operating one-lines that assign feeders to transformer banks and bus sections, especially at Hardwoods, Glendale, Ridge Road, and Stamp's Lane.

Direct circuit navigation is complete where the opposite endpoint has a detailed diagram or station record. TL208 remains labelled to Long Harbour without a destination record.

## Open release gates

- The public evidence-package strategy is not complete.
