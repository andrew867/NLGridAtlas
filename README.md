# NL Grid Atlas

NL Grid Atlas is an unofficial, source-cited engineering atlas of Newfoundland and Labrador electrical infrastructure. It converts public regulatory filings into diagrams, timelines, station records, and load comparisons that retain exact evidence links.

The first release focuses on the Island Interconnected System, a June 2005 Newfoundland Power network register, the Northeast Avalon delivery network, major transmission and terminal-station work, and Hydro's historical VHF system.

## Project status

This repository is at the first working-site stage. The initial evidence set is real, but it is not a complete network model. Each page identifies omissions and unresolved facts.

Project control:

- [Atlas specification](docs/ATLAS_SPECIFICATION.md)
- [Phased development plan](docs/DEVELOPMENT_PLAN.md)
- [Verification plan](docs/VERIFICATION_PLAN.md)
- [Authoritative work-item register](docs/work-items.json)
- [Newfoundland Power direct regulatory mirror](research/NEWFOUNDLAND_POWER_DIRECT_MIRROR.md)

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

## Newfoundland Power regulatory mirror

Inventory or resume the PDFs linked from Newfoundland Power's Regulation page:

```powershell
python scripts\sync_newfoundland_power_regulatory.py mirror --out C:\src\misc\NewfoundlandPowerRegulatory
```

The output directory contains `inventory.json`, `downloads.jsonl`, and the verified PDF files. Keep the mirror outside this repository.

Search one or more PDF trees and retain physical page references:

```powershell
python scripts\search_pdf_pages.py C:\src\misc\PUB\mirror\applications\NP2027Capital --term "Pulpit Rock" --term "PUL-T2"
```

Search the PUB full-text index without changing the archive:

```powershell
python scripts\search_pub_index.py C:\src\misc\PUB\metadata\pub.sqlite '"Transmission Line Listing"' --limit 20
```

The register-successor search and its exact page references are recorded in
[research/NP_REGISTER_SUCCESSORS.md](research/NP_REGISTER_SUCCESSORS.md).

Regenerate the text-native feeder and transmission-loading layers:

```powershell
python scripts\extract_np_register_layers.py --feeder-pdf C:\path\to\PUB-NP-5.pdf --loading-pdf C:\path\to\PUB-NP-275.pdf --out research\derived\np-register-layers-2008-2013.json
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

