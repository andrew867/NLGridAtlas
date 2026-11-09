# NL Grid Atlas

NL Grid Atlas is an unofficial, source-cited engineering atlas of Newfoundland and Labrador electrical infrastructure. It converts public regulatory filings into diagrams, timelines, station records, and load comparisons that retain exact evidence links.

The first release focuses on the Island Interconnected System, the Northeast Avalon delivery network, major transmission and terminal-station work, and Hydro's historical VHF system.

## Project status

This repository is at the first working-site stage. The initial evidence set is real, but it is not a complete network model. Each page identifies omissions and unresolved facts.

## Run locally

```powershell
npm install
npm run dev
```

Build and test:

```powershell
npm test
npm run build
```

## Repository layout

- `src/`: site code and curated evidence data
- `docs/`: design, writing, and research rules
- `research/sources/`: unmodified copies of public filings
- `research/catalog.json`: source URLs, local paths, and page-level notes
- `scripts/`: research integrity tools
- `tests/`: data and citation validation

## Evidence status

- `verified`: checked against the cited page, including visual inspection where layout matters
- `reported`: stated by a primary source but not independently verified
- `proposed`: requested or planned work, not proof of completion
- `inferred`: a stated interpretation based on multiple sources
- `unresolved`: conflicting or incomplete evidence

## Rights and attribution

Code and original site content are licensed under the MIT License. Source PDFs retain the rights and terms of their publishers and authors. They are stored as research evidence with their original URLs and are not relicensed by this repository.

This project is not affiliated with the Board of Commissioners of Public Utilities, Newfoundland and Labrador Hydro, Newfoundland Power, or the Government of Newfoundland and Labrador.

