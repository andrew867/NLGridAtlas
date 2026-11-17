# Usability refactor baseline

Captured: 2026-11-17

## Repository

- Branch: `main`
- HEAD: `9f3c7dfdf1d8aa052eb0c35afc9b059962d6123e`
- Deployment base: `./`, published below `/NLGridAtlas/`
- Node package: `nl-grid-atlas@0.1.0`
- Vite: 7.1.12
- Starting test result: 1,383 passed, 0 failed
- Starting build: passed
- Known untracked research, render and scratch files were present before this refactor. They are outside its scope.

## Production and local build

The production site and the local build loaded the same generated asset names during the baseline check:

- JavaScript: `assets/index-4p7CWDAu.js`
- CSS: `assets/index-DHuCH2Jn.css`

Both rendered:

- 29,680 elements
- 3,074 links
- 1,447 source records
- 27 section elements
- edition label `FIELD EDITION 0.1`

The production page did not display a commit identifier. Matching asset names establish that the inspected production and local builds used the same generated files. They do not independently establish which Git commit produced those files.

## Starting production build

| Asset | Built size | Gzip size when reported |
| --- | ---: | ---: |
| `index.html` | 346.32 kB | 55.47 kB |
| Main JavaScript | 2,066.06 kB | 438.09 kB |
| Main CSS | 82.26 kB | 13.71 kB |
| Historical GeoAtlas route data | 803.37 kB | Not reported |
| L3501 route data | 235.82 kB | Not reported |

The starting build emitted one HTML page. Vite reported that the main JavaScript chunk exceeded 500 kB.

## Visual baseline

The production baseline covers Home, the network, station directory, loads, history, Telephone, Utility radio and Sources at 390, 768, 1,440 and 1,920 CSS px. The local build has matching representative captures at 390 and 1,440 CSS px.

Temporary screenshots are stored outside tracked source:

- `output/playwright/baseline-9f3c7df/`
- `output/playwright/baseline-local-9f3c7df/`

The package's `VISUAL_REVIEW.md` remains the defect list. The current capture confirms the same single-page structure and displayed edition at the implementation start.

## Content inventory

`research/derived/ux-baseline-inventory.json` records the starting HTML digest, IDs, fragment targets, diagrams, components, station selectors, image references and static citation occurrences. This inventory is the retention comparison for the page split.
