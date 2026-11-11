# Responsive QA, 2026-11-11

## Browser matrix

| Viewport | Page overflow | Component overflow | SVG text outside diagram bounds |
| --- | ---: | ---: | ---: |
| 390 x 844 | 0 px | 0 | 0 |
| 768 x 1024 | 0 px | 0 | 0 |
| 1440 x 1000 | 0 px | 0 | 0 |
| 1920 x 1080 | 0 px | 0 | 0 |

The audit covered every top-level section, station layout, framed diagram, station browser, and island-terminal browser. It also checked every visible text element in terminal, substation, and terminal-network SVGs against the rendered SVG bounds.

## Interaction checks

- TL203 opens the Sunnyside terminal record.
- 31L opens the Stamp's Lane station record.
- The phone layout hides diagram notes.
- The 390 px page has no horizontal overflow.
- The browser console reported no warnings or errors during the mobile interaction checks.

## Automated checks

The complete 66-test suite and production build passed after the responsive and navigation checks.
