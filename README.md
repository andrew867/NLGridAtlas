# NL Grid Atlas

NL Grid Atlas is an unofficial, source-cited engineering atlas of Newfoundland and Labrador electrical infrastructure. It converts public regulatory filings into diagrams, timelines, station records, and load comparisons that retain exact evidence links.

The first release focuses on the Island Interconnected System, a June 2005 Newfoundland Power network register, the Northeast Avalon delivery network, major transmission and terminal-station work, and Hydro's historical VHF system.

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

## Hydro upload mirror

The mirror tool crawls only the dated public directories under `nlhydro.com/wp-content/uploads/`. It excludes WordPress plugin, form-upload, import, and temporary directories.

Inventory without downloading:

```powershell
python scripts\sync_nlhydro_uploads.py inventory --out C:\src\misc\NLHydroUploads
```

Download or resume the document mirror:

```powershell
python scripts\sync_nlhydro_uploads.py mirror --out C:\src\misc\NLHydroUploads
```

The output directory contains `inventory.json`, `downloads.jsonl`, and the mirrored files. Keep the mirror outside this repository.

Search one or more PDF trees and retain physical page references:

```powershell
python scripts\search_pdf_pages.py C:\src\misc\PUB\mirror\applications\NP2027Capital --term "Pulpit Rock" --term "PUL-T2"
```

## Repository layout

- `src/`: site code and curated evidence data
- `docs/`: design, writing, and research rules
- `research/sources/`: unmodified copies of public filings
- `research/derived/`: structured records extracted from cited source pages
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

