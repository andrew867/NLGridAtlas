# Usability refactor verification

Checked: 2026-11-17

## Implemented behavior

- Nine independent static entries: Home, Networks, Stations, Transmission, Loads, History, Telephone, Utility radio and Sources.
- Shared desktop and small-screen navigation with ordinary links, a skip link and current-page state.
- URL restoration for page sections, station collection, station record, record view, register, committed search, source filters, source record, map station, network station, circuit, voltage selection and grouped diagram components.
- Legacy fragment replacement through the generated alias registry.
- A separate 1,450-record source catalogue with stable records, 347 migrated citation occurrences, provenance details and citation backlinks.
- Citation previews use the occurrence locator. Desktop uses an anchored dialog. Narrow screens use a focus-managed modal dialog.
- Station links use complete names and collection-qualified routes. Hydro and Newfoundland Power records remain distinct.
- Repeated registers use semantic tables with captions, headers, aligned numeric cells and contained horizontal scrolling.

## Automated results

| Gate | Result |
| --- | --- |
| Unit and factual tests | 1,396 passed, 0 failed |
| Source digest verification | 66 PDFs, 222,565,583 bytes verified |
| Baseline retention | 267 of 267 baseline IDs retained |
| Legacy aliases | 29 of 29 targets resolved, 0 unresolved, 0 ambiguous |
| Source catalogue | 1,450 records, 347 occurrence links, 3 static URL records |
| Internal links | 933 page, fragment and asset links checked |
| Browser suite | 57 passed, 1 desktop-only applicability skip, 0 failed |
| Production build | Passed for all nine entries beneath `/NLGridAtlas/` |

The browser suite used installed Chrome through Playwright at desktop and Pixel 5 viewports. It covered direct static requests, copied station and source routes, Back and Forward restoration, diagram component restoration, source filters, citation dialog behavior, named navigation and dialog roles, reduced-motion rendering, legacy fragments, small-screen navigation, map selection without page movement and page-wide overflow.

The locked install, factual tests, source and retention checks, internal-link audit, production build and browser suite were also run from a separate clean checkout. The clean checkout reproduced the results above.

## Visual review

Temporary captures are stored in `output/ux-refactor/after/` and are not release assets. The matrix covers 390, 768, 1,440 and 1,920 CSS pixel widths for Home, Networks, Newfoundland Power and Hydro station records, Loads, Telephone, Utility radio and Sources.

The review retained the paper, graphite, copper, water blue, phase colors, grid, phase-wave corners and existing type roles. It also confirmed bounded wide layouts, phone wrapping, locally contained diagrams and source records without document-level horizontal overflow.

## Build observations

- `sources.html` is 2,491.00 kB before gzip and 271.56 kB after gzip. This is intentional because the no-JavaScript source ledger contains one real record for every source.
- The shared data chunk is 1,784.98 kB before gzip. Vite reports its existing large-chunk warning. Reading pages no longer construct the complete source ledger, but the shared research data still warrants later page-specific splitting.
- The visual review and semantic browser checks were automated. No separate assistive-technology session was available, so this record does not claim manual Narrator, NVDA or VoiceOver verification.

## Reproduction

```powershell
npm ci
npm test
npm run verify:sources
npm run verify:retention
npm run verify:links
npm run build
npx playwright test tests/browser/atlas.spec.js
$env:VISUAL_REVIEW='1'
npx playwright test tests/browser/visual-review.spec.js
git diff --check
```
