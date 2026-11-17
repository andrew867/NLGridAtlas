# Usability refactor visual review

Checked: 2026-11-17

## Matrix

| Viewport | Width | Result |
| --- | ---: | --- |
| Phone | 390 px | Passed after source-filter width correction |
| Tablet | 768 px | Passed |
| Desktop | 1,440 px | Passed |
| Wide desktop | 1,920 px | Passed after hiding the small-screen Menu control |

The checked subjects were Home, geographic network, Newfoundland Power station record, Hydro terminal record, Loads, Telephone, Utility radio and Sources. Captures were made from production output beneath `/NLGridAtlas/`.

## Corrections made during review

- Source filter controls no longer enlarge the document on phones.
- The Menu control appears only when the complete navigation is collapsed.
- Station record tabs wrap without clipping.
- Diagram component selection remains visible after route restoration.
- Dense tables and drawings scroll inside their own labelled regions.
- Small-screen diagram captions use the existing compact rule.

## Retained visual system

The refactor keeps the warm paper, faint drawing grid, graphite, copper, water blue, phase colors, condensed display type, serif prose, monospaced data, square rules, clipped panel corners and phase-wave marks. Page hierarchy and control spacing changed; the underlying drawing and evidence styles did not.
