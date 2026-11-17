# NL Grid Atlas

NL Grid Atlas is a source-cited engineering history of Newfoundland and Labrador's electrical and communications infrastructure. It reconstructs network topology, station equipment and system change from regulatory filings, utility drawings, government records, technical manuals, annual reports and archival collections.

[Open the published atlas](https://andrew867.github.io/NLGridAtlas/)

## What the atlas contains

### Electrical system

- An island transmission overview covering the documented 230 kV, 138 kV, 69 kV and 66 kV systems.
- Semi-geographic route maps tied to published geographic records.
- Interactive one-line diagrams for terminal stations, generating stations, converter stations and Newfoundland Power substations.
- Transformer, switchgear, capacitor-bank, transmission-line and feeder records with dated ratings and equipment states.
- Newfoundland Power feeder maps and circuit registers, including urban and rural stations.
- Labrador-Island Link, Maritime Link, Soldiers Pond and Corner Brook frequency-conversion records.
- Measured loads, forecasts, interruptions, reliability events, capital work and equipment failures kept as separate evidence classes.

### Communications and system history

- Newfoundland and Labrador Hydro and Newfoundland Power telecommunications records, including VHF, microwave, fibre, satellite and later radio systems.
- The public telephone network from the first reported private line through manual exchanges, dial conversion, microwave, digital switching and fibre transport.
- DMS-10 and DMS-100 host and remote architecture, including RLM, RLCM, RSC, DMS-1U and emergency stand-alone operation.
- Telegraph, cable and early electrical-communications records connected to the later utility history.
- A dated chronology assembled from public records rather than a retrospective summary alone.

## Engineering method

Every published technical record retains its original URL and a physical PDF page or named document section. Locally preserved evidence files also retain SHA-256 digests. Drawings and tables are visually checked when text extraction cannot establish layout or connectivity.

The diagrams are new engineering schematics based on cited records. A proposed installation is not shown as completed, a forecast is not reported as a measured load, and a missing circuit is not completed by guesswork. Conflicting records remain dated and visible.

The site includes automated checks for source references, topology, component interactions, calculations, responsive layout data and evidence-state consistency. It builds without requiring the source websites at runtime.

## Project records

- [Current project status](docs/PROJECT_STATUS.md)
- [Atlas specification](docs/ATLAS_SPECIFICATION.md)
- [Research method](docs/RESEARCH_METHOD.md)
- [Editorial style](docs/EDITORIAL_STYLE.md)
- [Phased development plan](docs/DEVELOPMENT_PLAN.md)
- [Verification plan](docs/VERIFICATION_PLAN.md)
- [Public evidence package](docs/PUBLIC_EVIDENCE_PACKAGE.md)
- [Authoritative work-item register](docs/work-items.json)

## Run locally

```powershell
npm install
npm run dev
```

Run the complete test suite and production build:

```powershell
npm test
npm run build
```

Verify the pinned evidence files:

```powershell
npm run verify:sources
```

## Publication

Pushes to `main` run the GitHub Pages workflow. The workflow installs the locked dependencies, runs the test suite, builds the static site and deploys the `dist` artifact.

## Repository layout

- `src/`: site code, diagrams and curated evidence data
- `docs/`: specification, research, editorial and verification records
- `research/sources/`: pinned copies of cited public records
- `research/derived/`: structured records extracted from cited pages
- `research/catalog.json`: source URLs, local paths and page-level notes
- `scripts/`: extraction and evidence-integrity tools
- `tests/`: source, data, calculation, topology and interface validation

## Evidence states

- `verified`: checked against the cited page, including visual inspection where layout matters
- `reported`: stated by a source but not independently established
- `proposed`: requested or planned work, not evidence of completion
- `inferred`: an identified interpretation based on cited records
- `unresolved`: conflicting or incomplete evidence

## Rights and attribution

Repository code and original atlas material are provided under the [MIT License](LICENSE). Public filings, archival images, maps, technical manuals, trademarks and other third-party material retain their original rights and terms. See [Rights and source attribution](NOTICE.md) for the source collections and acknowledgements.

Major research collections include the PUB filing archive, utility records, Memorial University Libraries' Digital Archives Initiative and Collections catalogue, McGill University Library's Canadian corporate reports, government publications and technical-document archives. Joe Z, owner and maintainer of [DMS-100.net](http://www.dms-100.net/), is credited for preserving the Nortel manual sets used in the telephone-system research.

NL Grid Atlas is independent research. It is not affiliated with the Board of Commissioners of Public Utilities, Newfoundland and Labrador Hydro, Newfoundland Power, Memorial University, the Government of Newfoundland and Labrador or the other organizations cited by the project.

