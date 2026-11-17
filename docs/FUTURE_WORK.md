# NL Grid Atlas future work and research queue

Updated: 2026-11-17

This document preserves work that is useful but not complete. `docs/work-items.json` remains the authoritative status register. An item in this document is not evidence that the work occurred.

## Current controlled work

The controlled register has four deferred or blocked items:

| Item | Priority | State | Completion evidence required |
| --- | --- | --- | --- |
| `AVL-002` | P0 | deferred | Current operating or protection one-lines that establish feeder-to-transformer and bus-section assignments, especially at Hardwoods, Glendale, Ridge Road and Stamp's Lane. |
| `GEN-002` | P1 | blocked | A commissioned drawing, as-built record or operating report for the permanent Holyrood Unit 3 post-steam synchronous-condensing arrangement. The public record still treats this as a planning case. |
| `GEN-003` | P1 | deferred | Issued-for-construction, commissioning or as-built drawings for the Avalon combustion-turbine terminal, generator step-up transformers, TL218 tie-in and related line work. The located 2024 switchyard drawings are fully redacted. |
| `REL-005` | P2 | deferred | A selected public object store, published content-addressed archive objects and a clean restore that reproduces the recorded archive inventory without contacting the source sites. |

`NPREG-224` is the next historical research item. It covers surviving 1804 transport, communications, defence-infrastructure and public-works evidence. It corrects the earlier status note that named 1804 without creating a work-register item.

## Electrical evidence gaps

### Avalon distribution and terminal stations

1. Locate current operating one-lines for Glendale, Virginia Waters, Stamp's Lane, St. John's Main and Pepperell. The atlas currently has dated logical diagrams, not current breaker arrangements.
2. Locate current feeder-to-transformer and bus-section assignments. Hardwoods, Glendale, Ridge Road and Stamp's Lane are the highest-value targets because the public records identify equipment but do not close every present connection.
3. Locate a current circuit and feeder register. The last complete public register located by this project is dated June 2005.
4. Locate PUL-T2 commissioning evidence and a post-work Pulpit Rock one-line. The filing record establishes planned 2026 installation, not commissioning.
5. Extract and connect additional feeder map sheets when a filing supplies a physical PDF page. Do not draw missing routes from register names alone.

### Island transmission, generation and conversion

1. Tie published circuit identifiers to measured geographic routes. The historical GeoAtlas layer does not identify present utility circuits or voltage classes.
2. Locate current Labrador-Island Link and Maritime Link converter-station as-builts, including converter-transformer nameplate data where public.
3. Establish the post-sale operating status and present arrangement of the Corner Brook frequency converter from a dated primary record.
4. Monitor Holyrood Unit 3 filings for a final post-steam decision and commissioned arrangement.
5. Monitor Avalon combustion-turbine filings for unredacted construction, commissioning and as-built drawings.
6. Add new station and equipment records when evidence appears. Do not repeat broad archive searches for a drawing that the public filing states is redacted or not yet issued.

## Public telephone and carrier research

### Named evidence gaps

1. Locate the final step-by-step or crossbar exchange and its cutover date.
2. Locate complete exchange-equipment registers for Newfoundland Telephone, Terra Nova Telecommunications and predecessor systems.
3. Locate route drawings and microwave hop sheets for the analog and digital carrier networks.
4. Date the major trans-Newfoundland fibre routes and connect them to the DMS host-and-remote conversion without assigning a remote type that the source does not state.
5. Reconcile the CNT mainland radio descriptions. One source describes a 12-channel system installed in 1950; a later account describes six voice channels established by 1952. The record does not yet show whether these are one-way carrier channels paired into six four-wire trunks, separate equipment stages or inconsistent retrospective descriptions.

### Field leads requiring corroboration

The user reports seeing a DMS-1U at Blackhead near Cape Spear and another roadside unit on the Southern Shore route toward Fermeuse. These are useful search leads, not yet publishable site assignments. Record a site only after at least one dated photograph, equipment label, property or construction record, network drawing, tariff record or carrier document establishes the location and equipment type.

For each field lead, seek:

- the precise location and observation date;
- cabinet or building photographs that do not expose private access details;
- manufacturer and equipment labels;
- host office and transport path;
- installation or retirement date;
- whether the installation was a DMS-1U, an RCU arrangement, another subscriber carrier system or a later replacement in the same enclosure.

### Technical questions worth answering

1. Which Newfoundland remotes were RLM, RLCM, RSC, RCU or DMS-1U installations?
2. Which remotes had emergency stand-alone service, and what trunk or local-call capability did their actual card set and software release provide?
3. Which microwave systems carried voice-frequency E&M trunks, digital T-carrier or later fibre-restoration traffic?
4. When did each DMS host enter service, gain remote sites and leave service?
5. Which manual, step-by-step and crossbar offices survived latest, and what replaced each one?

## High-value atlas additions

### Dated network states

Create selectable historical states instead of one composite diagram. Each state must use equipment and circuit records that were simultaneously valid or must display the date conflict. Useful initial states are the earliest documented island interconnection, the 230 kV build-out, the pre-HVDC system and the latest fully supported public arrangement.

Completion evidence:

- a machine-readable validity interval or source date for each displayed component;
- tests that prevent a proposed asset from appearing in an earlier or commissioned state;
- a visible date and evidence state on each diagram;
- links from each changed component to the source page.

### Station equipment change tables

Add a compact dated table for each major station. Track transformers, buses, breakers, capacitor banks, generation, circuit endpoints and material changes. Keep planned, approved, installed, commissioned, failed, repaired, retired and removed states separate.

Start with Holyrood, Hardwoods, Oxen Pond, Western Avalon, Sunnyside, Bay d'Espoir, Soldiers Pond, Corner Brook and Pulpit Rock.

### Engineering explanations tied to local equipment

Add short technical notes that explain the real records already shown in the atlas:

- OA, FA, FOA and multi-stage transformer MVA ratings;
- line-to-line and line-to-neutral voltage, grounded-wye and delta connections;
- transformer percent impedance, per-unit values and fault-current limits;
- on-load tap changers, regulators and bus ties;
- breaker-and-one-half, ring-bus and sectionalized-bus arrangements;
- capacitor-bank MVAr and voltage support;
- host, remote and emergency stand-alone operation in DMS networks;
- voice-frequency E&M supervision, multifrequency address signalling and four-wire carrier channels.

Each note must use a cited Newfoundland example. A generic explanation without a connection to a displayed record adds little.

### Illustrated engineering history

Develop an illustrated manuscript from the verified atlas record. A practical chapter sequence is:

1. submarine telegraph and overland line;
2. early telephone companies and manual exchanges;
3. early electric utilities and hydroelectric development;
4. rural electrification and provincial network consolidation;
5. Bay d'Espoir, Holyrood and the island interconnection;
6. the 230 kV backbone and Newfoundland Power urban network;
7. utility radio, microwave and fibre systems;
8. digital telephone switching and host-and-remote architecture;
9. HVDC interconnection and the modern island system;
10. evidence gaps, conflicting records and preservation.

The manuscript should reuse atlas citations, diagrams and structured data. It must not convert unresolved evidence into a smooth narrative merely because the story reads better that way.

### Reusable engineering data

Publish versioned JSON and CSV exports for stations, circuits, transformers, generators, communications sites, events and citations. Include schema version, evidence state, effective date or source date, source URL, physical PDF page, local digest and field-level notes for conflicts.

Add citation exports for common reference managers only after the underlying source catalogue has stable identifiers.

## UX package integration

The pending UX package may change layout, spacing, navigation and interaction. It must preserve:

- the established paper, graphite, copper, water-blue and phase-color system;
- Barlow Condensed, Source Serif 4 and IBM Plex Mono roles;
- the two-sharp-corner and two-phase-wave panel treatment;
- source links and component evidence panels;
- evidence-state labels and dated diagram labels;
- keyboard access and phone-width operation;
- diagram legibility without text crossing conductors or buswork;
- map selection without unexpected page scrolling.

Do not start a parallel visual redesign before the package arrives. Reconcile the package against `docs/DESIGN_SYSTEM.md`, `docs/ATLAS_SPECIFICATION.md`, the responsive test matrix and these evidence constraints.

## Recommended execution order

1. Correct project control, add and complete `NPREG-224` for 1804.
2. Close `AVL-002` only if new primary drawings establish the missing assignments.
3. Research the telephone cutover, equipment-register, fibre-route and microwave-channel gaps.
4. Investigate the two DMS-1U field leads as unverified site candidates.
5. Build dated network-state data and station equipment change tables.
6. Add the Newfoundland-specific engineering explanations.
7. Draft the illustrated history from the verified record.
8. Publish versioned data and citation exports.
9. Resume `REL-005` only when the archive release is no longer deferred.

## Search discipline

- Search annual reports and financial filings as well as engineering applications. They can identify existing problems, forecasts, approvals and completed capital work.
- Prefer a new dated record over another copy of the same planning statement.
- Preserve negative results when the source explicitly withholds or redacts the required drawing.
- Stop a search when the evidence cannot answer the question. Record the blocker and move to the next item.
- Never treat a user observation, plausible topology, equipment-era assumption or map proximity as a verified engineering connection.
