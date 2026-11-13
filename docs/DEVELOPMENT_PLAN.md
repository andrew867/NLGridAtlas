# NL Grid Atlas phased development plan

Updated: 2026-11-13

`docs/work-items.json` is the authoritative status register. This plan defines execution order and phase exit gates.

## Priority order

- `P0`: required to correct or complete the present atlas.
- `P1`: required for the intended island engineering atlas.
- `P2`: valuable expansion after the electrical backbone is complete.
- `P3`: optional enhancement that must not delay higher priorities.

Within a phase, complete P0 items before P1 items. Do not begin a later diagram phase merely because an earlier research task is tedious.

## Phase 0, control and evidence baseline

Objective: make scope, status, evidence, and blockers auditable.

Work items:

- PLAN-001
- ARC-001
- ARC-002
- ARC-003
- SRC-001
- SRC-002
- DB-001

Exit gate:

1. The specification, plan, verification plan, and work register exist.
2. The PUB and NL Hydro archive inventories have dated completion reports.
3. Direct Newfoundland Power sources have an inventory or a recorded access blocker.
4. Every existing page-level source passes the digest and locator checks.
5. The original TOD database is preserved or its absence is recorded.

## Phase 1, finish the Avalon station model

Objective: remove the known gaps in the existing 66 kV and terminal-station sections before expanding west.

Work items:

- AVL-001
- AVL-002
- AVL-003
- AVL-004
- AVL-005
- AVL-006
- AVL-007
- NAV-001
- QA-001

Exit gate:

1. Every detailed Avalon station has a source-supported current or dated historical diagram.
2. Glendale, Virginia Waters, Stamp's Lane, St. John's Main, and Pepperell have either detailed one-lines or explicit source-gap records.
3. Kenmount and Goulds use the same clickable one-line pattern as the other detailed substations.
4. Every documented circuit can open the record at its other end.
5. Pulpit Rock is either resolved by an as-built record or remains visibly unresolved.
6. All available feeder maps are connected to the correct station and feeder.
7. The complete desktop, tablet, and phone visual matrix passes.

## Phase 2, build the island AC backbone

Objective: replace the source-image-only overview with a navigable, dated island network model.

Work items:

- ISL-001
- ISL-002
- ISL-003
- ISL-004
- ISL-005
- ISL-006
- ISL-007
- ISL-008
- ISL-009
- ISL-010

Exit gate:

1. The documented 230 kV, 138 kV, 69 kV, and 66 kV backbone is represented in structured data.
2. Each line has documented endpoints, voltage, source year, and source page.
3. Sunnyside, Stony Brook, Bay d'Espoir, Buchans, Deer Lake, Bottom Brook, Grand Falls, Massey Drive, Stephenville, and Come By Chance have diagrams or explicit evidence-gap records.
4. Upper Salmon, Granite Canal, Cat Arm, and Hinds Lake have individual records.
5. Rural and western stations are not hidden inside one generic map image.
6. Published conductor, line-length, and seasonal rating records are attached to their dated circuits.

## Phase 3, generation, HVDC, and converter systems

Objective: document the systems that cannot be represented as ordinary AC terminal stations.

Work items:

- GEN-001
- GEN-002
- GEN-003
- HVDC-001
- HVDC-002
- CONV-001

Exit gate:

1. Holyrood's dated historical arrangement and latest supported arrangement are separate.
2. The Unit 3 synchronous-condensing record states whether it is planned, under construction, or commissioned.
3. The Avalon combustion turbine connection reflects the latest available design or as-built record.
4. Soldiers Pond, the Labrador-Island Link, and the Maritime Link have source-linked system diagrams.
5. The Corner Brook frequency converter and Deer Lake connection have a dedicated record.

## Phase 4, telecommunications, loads, and geography

Objective: complete the supporting infrastructure and move from schematic placement to defensible geography.

Work items:

- TEL-001
- TEL-002
- LOAD-001
- GEO-001
- GEO-002

Exit gate:

1. VHF, P25, microwave, cellular, and satellite records are separated by date and system.
2. Published site, frequency, radio, antenna, and route data are indexed.
3. Measured load, outage load, forecast, and equipment rating records remain separate.
4. A geographic or semi-geographic coordinate dataset exists with a source for each coordinate or route.
5. The interface labels every map according to its actual geographic accuracy.

## Phase 5, release and preservation

Objective: publish a reproducible public example without losing the source trail.

Work items:

- REL-001
- REL-002
- REL-003
- REL-004
- REL-005

Current deployment state:

- `REL-001` is complete. The public `andrew867/NLGridAtlas` repository is connected and `main` is synchronized.
- `REL-003` is complete. GitHub Pages is live at `https://andrew867.github.io/NLGridAtlas/`; the workflow passed and the published build passed browser and phone-width checks.
- `REL-002` is complete. The repository evidence manifest and external archive snapshot format are defined.
- `REL-005` was deferred by the user on 2026-11-12. When publication resumes, it remains incomplete until a public object-store destination is selected and a clean restore passes without contacting the source sites.

Exit gate:

1. The repository has an approved GitHub remote and visibility.
2. A clean clone passes source verification, tests, and production build.
3. GitHub Pages or the selected static host serves the committed build.
4. The large external archives have inventory files and restore instructions.
5. The release contains no crawler state, credentials, temporary renders, or unverified claims.

## Execution rule

At the start of each work session:

1. Select the highest-priority unblocked item in the active phase.
2. Set it to `in_progress`.
3. Record the source search or implementation target.
4. Complete its verification cases.
5. Record evidence and commit the change.
6. Set the item to `done`, or record a precise blocker.

At the end of each phase, run the complete release gate. Do not rely only on tests added during that phase.
