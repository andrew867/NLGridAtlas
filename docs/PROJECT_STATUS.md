# NL Grid Atlas project status

Updated: 2026-11-11

## Repository and hosting

- GitHub repository: `andrew867/NLGridAtlas`.
- Repository visibility: public.
- Default branch: `main`.
- The local `main` branch tracks `origin/main`.
- A GitHub Pages workflow builds with Node.js 20, runs the complete test suite, builds the Vite site, and deploys the `dist` artifact.
- GitHub Pages is live at `https://andrew867.github.io/NLGridAtlas/`.
- GitHub Actions run `43044518353` passed the complete test and build workflow.
- The published build passed desktop and 390 by 844 px browser checks. Its assets loaded under `/NLGridAtlas/`, the MUN-08 detail interaction worked, and the browser reported no warnings or errors.

## Verified in the current work session

- Added the 1975 Memorial University Health Sciences Centre transformer and emergency-generation records.
- Linked MUN-01 and MUN-08 to the Health Sciences electrical-plant evidence panel.
- Kept the six MUN archive photographs as external records because the archive reserves reproduction rights.
- Passed 64 automated tests and the production build.
- Verified the Memorial diagram and evidence interaction in the browser.
- Published and verified the atlas on GitHub Pages.

## Active work

1. Resolve remaining Avalon feeder-to-transformer and bus-section assignments, `AVL-002`.
2. Add dated logical one-lines where the public record supports them, `AVL-006`.
3. Link documented circuits directly to their other-end records, `NAV-001`.
4. Complete the 390, 768, 1440, and 1920 px visual matrix, `QA-001`.

## Next station target

St. John's Main has direct 2015 evidence for SJM-T1, SJM-T2, SJM-T3, and the historical SJM-T4 branch. The 2027 transformer register omits SJM-T4 and prints 66/25 kV for SJM-T1 and SJM-T3 while other station records use a 12.5 kV distribution bus. The atlas will keep those records separate until a later operating or completion drawing resolves the current arrangement.

## Open release gates

- The clean-clone qualification is not complete.
- The public evidence-package strategy is not complete.
- The full responsive audit is not complete.
