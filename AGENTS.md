# NL Grid Atlas contributor rules

These rules apply to all research, writing, code, and visual work in this repository.

## Purpose

Build an unofficial, source-cited engineering atlas of Newfoundland and Labrador electrical infrastructure. Make regulatory records useful without presenting this site as an official utility publication.

## Evidence rules

1. Do not publish a technical claim without a source URL and an exact PDF page or document section.
2. Keep measured values, forecasts, planning assumptions, proposals, approvals, and completed work in separate categories.
3. Do not infer elapsed time, equipment status, circuit endpoints, ownership, or causation from document order or visual proximity.
4. Preserve conflicts in the record. Do not silently choose the convenient number.
5. Use the physical PDF page as the primary locator. Add the printed page when it differs.
6. Preserve the original source URL, retrieval date, local filename, and SHA-256 digest.
7. Mark a diagram as schematic, geographic, historical, proposed, or inferred. Never mix these categories without a visible label.
8. Use `verified`, `reported`, `proposed`, `inferred`, and `unresolved` as controlled evidence states.
9. Prefer primary PUB, Newfoundland and Labrador Hydro, Newfoundland Power, government, and manufacturer records.
10. Do not overwrite or alter original source documents. Store derived text, images, and data separately.

## Writing rules

Use an ASD-STE100-informed house style. This repository does not claim formal ASD-STE100 compliance.

- Use one term for one component or action.
- Use short, direct sentences. Put the subject before the action when practical.
- Prefer active voice when the actor is known.
- Use concrete verbs. Write `Hydro installed`, not `installation was undertaken`.
- Define abbreviations at first use on each major page.
- Put the unit beside every technical value.
- Use SI units. Retain an original imperial value when it is material to an old drawing.
- Keep dates in `YYYY-MM-DD` in data and use unambiguous dates in prose.
- Do not use em dashes or en dashes.
- Do not use marketing filler, inflated claims, or generic AI phrases.
- Do not write `delve`, `unlock`, `seamless`, `robust`, `cutting-edge`, `game-changing`, or `revolutionize` unless a quoted source uses the word.
- Do not begin with an interjection.
- Dry humor is permitted when it does not obscure a technical fact.
- State what is not known. Do not make a plausible guess sound measured.

## Visual rules

The site must not resemble a generic AI dashboard or venture-backed software landing page.

- Do not use decorative color gradients, glassmorphism, glowing blobs, or a purple and blue default palette.
- Do not use pill-shaped buttons or repeated rounded cards.
- Do not place three generic feature cards below a hero.
- Do not use stock photographs of engineers, transmission towers, or control rooms.
- Do not use unexplained icons, fake live indicators, or decorative metrics.
- Use warm paper, graphite, copper, porcelain, water blue, phase red, phase amber, and phase green.
- Use Barlow Condensed for display text, Source Serif 4 for reading text, and IBM Plex Mono for data.
- Use two sharp corners and two phase-wave corners on primary evidence panels.
- Use line weight, labels, and patterns as well as color. Voltage or status must never depend on color alone.
- Treat whitespace as part of the engineering drawing. Do not fill every area.
- Animation must explain state or topology. Respect `prefers-reduced-motion`.

## Diagram rules

- Follow one-line diagram conventions where the evidence supports them.
- Show voltage class on every bus and transmission segment.
- Put circuit identifiers on lines, not in a detached legend only.
- Show open, removed, proposed, and out-of-service elements with distinct line patterns.
- Link every interactive component to its evidence entry.
- State when a diagram omits protection, grounding, disconnects, or distribution detail.

## Code rules

- Use semantic HTML and accessible controls.
- Keep the research data separate from presentation code.
- Validate source references and evidence states in tests.
- Do not add a dependency when a small standards-based implementation is clearer.
- Keep the static build compatible with GitHub Pages.
- Do not commit credentials, browser profiles, temporary renders, or crawler state.

