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
- Passed 66 automated tests and the production build.
- Verified the Memorial diagram and evidence interaction in the browser.
- Published and verified the atlas on GitHub Pages.
- Added a clickable, source-cited St. John's Main logical one-line for the 2015 selected arrangement.
- Linked documented circuit ends to the available detailed diagram, station record, or island terminal record.

## Active work

1. Resolve remaining Avalon feeder-to-transformer and bus-section assignments, `AVL-002`.
2. Add dated logical one-lines where the public record supports them, `AVL-006`.
3. Complete the 390, 768, 1440, and 1920 px visual matrix, `QA-001`.

## Next station target

Stamp's Lane has a four-transformer record, six 66 kV line terminations, ten feeder maps, and later feeder-voltage and transformer-replacement records. A detailed drawing remains blocked on the current 4.16 kV bus arrangement and the remaining feeder-to-transformer assignments.

Direct circuit navigation is complete where the opposite endpoint has a detailed diagram or station record. TL208 remains labelled to Long Harbour without a destination record.

## Open release gates

- The clean-clone qualification is not complete.
- The public evidence-package strategy is not complete.
- The full responsive audit is not complete.
