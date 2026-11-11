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
- Passed 67 automated tests, source-hash verification, and the production build.
- Verified the Memorial diagram and evidence interaction in the browser.
- Published and verified the atlas on GitHub Pages.
- Added a clickable, source-cited St. John's Main logical one-line for the 2015 selected arrangement.
- Added a clickable Stamp's Lane logical one-line that separates the documented 4.16 kV and 12.5 kV banks.
- Verified the Stamp's Lane diagram at 1440 by 1000 px and 390 by 844 px with no page overflow, out-of-bounds SVG text, browser warnings, or browser errors.
- Linked documented circuit ends to the available detailed diagram, station record, or island terminal record.

## Active work

1. Resolve remaining Avalon feeder-to-transformer and bus-section assignments, `AVL-002`.

## Remaining Avalon evidence target

The detailed-station pass is complete for the public evidence located to date. Remaining work is not another register-based drawing. It requires protection or operating one-lines that assign feeders to transformer banks and bus sections, especially at Hardwoods, Glendale, Ridge Road, and Stamp's Lane.

Direct circuit navigation is complete where the opposite endpoint has a detailed diagram or station record. TL208 remains labelled to Long Harbour without a destination record.

## Open release gates

- The clean-clone qualification is not complete.
- The public evidence-package strategy is not complete.
