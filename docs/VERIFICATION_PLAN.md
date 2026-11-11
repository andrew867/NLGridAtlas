# NL Grid Atlas verification plan

Updated: 2026-11-10

## 1. Required gates

Every user-visible change must pass the applicable gates below. A phase is not complete until its exit gate and the complete regression suite pass.

## 2. Automated data tests

### TEST-DATA-001, source identifiers

- Every source ID is unique.
- Every cited source exists.
- Every source has a URL and page locator.
- Every pinned source has a matching SHA-256 digest.

### TEST-DATA-002, evidence states

- Evidence states use only the controlled values.
- Proposed work is not labelled installed or current.
- Conflicting values remain represented as unresolved records.

### TEST-DATA-003, topology

- Every circuit has two documented endpoints.
- Both endpoint station codes exist in the station directory or endpoint register.
- Circuit voltage and source year are present when the source states them.
- A diagram link resolves to the record at the other end.

### TEST-DATA-004, transformer records

- Designations are unique within a station.
- Every rating has a unit.
- Winding voltages retain the source value.
- Cooling-stage ratings are not collapsed into one unexplained value.
- Manufacture, installation, forecast, and replacement dates remain distinct.

### TEST-DATA-005, feeder maps

- Every extracted image is exposed by one station record.
- The feeder designation matches the filename and source page.
- A missing image does not produce a broken expander.

### TEST-PLAN-001, work register

- Work item IDs are unique and use the approved format.
- Every item has a valid phase, priority, and status.
- Every dependency resolves to another work item.
- A blocked item states a blocker.
- A done item records completion evidence.
- Every work item appears in the phased development plan.

## 3. Browser interaction tests

### TEST-UI-001, map selection

Selecting an Avalon map point shall update the evidence panel without changing the page scroll position.

### TEST-UI-002, explicit navigation

Selecting an explicit station link, transmission line, or circuit shall open the correct destination record. Terminal and substation bus links shall work in both directions.

### TEST-UI-003, component evidence

Selecting a transformer, capacitor bank, generator, feeder, bus, or recorded event shall update only the related evidence panel. The default summary shall return when the selection is cleared or the page is reloaded.

### TEST-UI-004, feeder maps

Each available feeder map shall expand below its feeder record and open the full-resolution image without navigating away from the atlas tab.

### TEST-UI-005, keyboard operation

Every interactive diagram component, station tab, map point, disclosure control, and source link shall be reachable and usable with a keyboard. Focus shall remain visible.

## 4. Visual matrix

Check every major section at these viewport widths:

| Class | Width | Minimum checks |
| --- | ---: | --- |
| Phone | 390 px | no horizontal page overflow, readable buses and labels, captions hidden where specified |
| Tablet | 768 px | one-column evidence layout where required, no clipped diagrams |
| Desktop | 1440 px | correct evidence-panel alignment, no overlapping labels or symbols |
| Wide desktop | 1920 px | content remains bounded, diagrams do not stretch into unreadable spacing |

For each detailed one-line, inspect:

- Top and bottom clipping.
- Text behind buses or outgoing lines.
- Transformer, generator, and capacitor symbol centering.
- Multi-line label alignment.
- Phase-wave corner visibility.
- Evidence-panel vertical alignment.
- Source-link wrapping.

Store temporary screenshots outside Git. Record the checked commit and viewport results in the work item's completion evidence.

## 5. Research verification

For every new document finding:

1. Open the cited physical PDF page.
2. Inspect the page visually when it contains a drawing, scan, map, or table.
3. Record the exact wording needed to classify installed, planned, proposed, removed, or historical equipment.
4. Compare designations against the station, circuit, feeder, and transformer registers.
5. Record any conflict instead of selecting the convenient value.
6. Add the local file and digest only when the source is selected for preservation.

## 6. Release gate

Run:

```powershell
npm test
npm run verify:sources
npm run build
git diff --check
git status --short
```

Then complete:

- Broken-link check for all internal anchors and source URLs.
- Browser console check with zero errors and zero warnings introduced by the change.
- Phone and desktop smoke test from the built output.
- Clean-clone build test before a public release.
- Review of the work register for active or blocked P0 items.

A public release is blocked while an active P0 item affects factual correctness, navigation, source integrity, or readable presentation.
