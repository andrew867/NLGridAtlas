# NL Grid Atlas specification

Status: controlled baseline  
Version: 1.0  
Updated: 2026-11-10

## 1. Purpose

NL Grid Atlas is an unofficial engineering reference for the Newfoundland and Labrador electrical system. It converts public regulatory records into source-linked network diagrams, station records, timelines, load records, and telecommunications records.

The atlas must show what the evidence supports. It must not complete a missing circuit, transformer connection, equipment state, route, or date by guesswork.

## 2. Authoritative project records

- `docs/work-items.json` is the authoritative task and blocker register.
- `docs/DEVELOPMENT_PLAN.md` defines phase order and exit gates.
- `docs/VERIFICATION_PLAN.md` defines the tests required for each deliverable.
- `research/catalog.json` and `src/data.js` contain curated evidence records.
- `research/REQUEST_RECONCILIATION.md` records earlier user requests and known evidence gaps.

If two records conflict, `docs/work-items.json` controls task status. Source documents control engineering facts.

## 3. Evidence requirements

Every published technical claim must contain:

1. A stable evidence identifier.
2. The original public URL.
3. A physical PDF page or named document section.
4. The local evidence filename when a local copy exists.
5. A SHA-256 digest for every pinned local source.
6. One controlled evidence state: `verified`, `reported`, `proposed`, `inferred`, or `unresolved`.

A diagram must identify whether it is geographic, semi-geographic, schematic, historical, proposed, or inferred.

## 4. Functional requirements

### SPEC-SRC-001, source ledger

The site shall provide a searchable source ledger. Each station, transformer, line, feeder, event, and telecommunications record shall resolve to one or more page-level sources.

### SPEC-NET-001, network hierarchy

The site shall use this navigation order:

1. Island generation and transmission overview.
2. Interactive transmission network.
3. Terminal-station one-lines.
4. Newfoundland Power substation one-lines and station records.
5. Distribution feeder records and maps.

A circuit or transmission line shall open the record at the other documented end. It shall not stop at a decorative map point when a station record exists.

### SPEC-TER-001, terminal stations

Each detailed terminal station shall use the same drawing frame and evidence panel. Supported transformers, buses, capacitor banks, generators, transmission lines, and recorded events shall be selectable.

The default panel shall summarize the components for which evidence exists. A component-specific event shall appear only when that component is selected.

### SPEC-SUB-001, substations

Each detailed Newfoundland Power substation shall show:

- Documented upstream circuits.
- Bus voltage labels.
- Documented transformer designations, winding voltages, ratings, and dates.
- Documented outgoing feeder designations.
- Bus ties and normal states only when a drawing states them.
- Expandable feeder-map sheets when an extracted sheet exists.

If the evidence does not assign feeders to a transformer or bus section, the diagram shall not imply that assignment.

### SPEC-ISL-001, island AC system

The island network shall cover the documented 230 kV, 138 kV, 69 kV, and 66 kV backbone. Major generation and terminal stations shall have linked records. The site shall distinguish the source year from current operating status.

### SPEC-HVDC-001, converter systems

The atlas shall provide separate source-linked records for the Labrador-Island Link, Maritime Link, Soldiers Pond converter station, associated AC yards, and the Corner Brook frequency converter. It shall not combine HVDC, frequency conversion, and AC transformation into one unexplained symbol.

### SPEC-GEO-001, geography

Geographic coordinates and line routes shall come from a published map, geographic dataset, drawing, or measured extraction. Until such data exist, the site shall label the network semi-geographic or schematic.

### SPEC-TEL-001, telecommunications

The telecommunications section shall keep historical conventional VHF, proposed trunked VHF, later P25, satellite, cellular, and microwave records separate. Frequencies, sites, radio models, antenna data, and ownership shall be published only when a source states them.

### SPEC-LOAD-001, load records

Measured loads, interruption loads, transformer forecasts, nameplate ratings, and planning limits shall remain separate data classes. Every value shall retain its date, unit, and source page.

### SPEC-UX-001, interaction and responsive layout

The site shall support keyboard and pointer operation. Map selection shall not scroll the page. Explicit station links may scroll to a detailed record. At widths below 640 px, nonessential drawing captions may be hidden. Technical labels, buses, and component values shall remain readable.

### SPEC-REL-001, reproducible release

A release shall build from a clean checkout. It shall not depend on the PUB or utility websites for its interface. Pinned evidence files shall pass digest verification. Large archive mirrors shall remain outside Git and have documented inventory and recovery procedures.

## 5. Definition of done

A work item is `done` only when:

1. Its stated scope is implemented.
2. Its completion evidence is recorded in `docs/work-items.json`.
3. Applicable automated tests pass.
4. Page-level sources and local hashes pass verification.
5. Desktop and mobile checks pass for user-visible work.
6. The work item has no unresolved acceptance criterion.
7. The change is committed.

Research notes, downloaded documents, or a plausible diagram do not by themselves satisfy this definition.

## 6. Change control

Update the work item before starting implementation. Set it to `in_progress` and record the current branch or commit in `notes`. If progress stops because a required external fact or decision is unavailable, set it to `blocked` and state the exact blocker. Do not use `done` for partial coverage.
