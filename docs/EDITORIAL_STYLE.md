# Editorial style

## Scope

This is an STE-informed house style for public engineering research. It uses principles from ASD-STE100 Issue 9 without claiming formal compliance or reproducing its controlled dictionary.

Official reference: <https://www.asd-ste100.org/>

## Voice

Write like a competent engineer explaining the record to another competent person. Use direct language. Show the evidence. State uncertainty without ceremony.

Good:

> Broad Cove T1 was rated 25 MVA. The measured load reached 28.5 MVA on 2014-01-02.

Bad:

> In a remarkable illustration of the grid's complex and evolving operational landscape, Broad Cove experienced a significant transformer capacity event.

## Controlled terms

| Use | Do not substitute without a technical reason |
| --- | --- |
| transformer | unit, device, machine |
| transmission line | corridor, wire, link |
| terminal station | substation, facility |
| measured load | demand figure, observed usage |
| forecast load | expected demand, predicted usage |
| entered service | launched, came online |
| removed from service | decommissioned, retired |
| proposed | planned, approved, completed |
| reported | proved, confirmed |

Use `substation` when the source or equipment function uses that term. Do not rewrite every substation as a terminal station.

## Evidence verbs

- `The filing states` means the source contains the claim.
- `The drawing shows` means the feature was visually checked.
- `The table lists` means the value is present in a table.
- `The Board approved` requires an order or approval record.
- `Hydro completed` requires a completion or execution record.
- `The atlas infers` identifies our interpretation.

Do not use `confirmed` when only one source reports a fact.

## Numbers and units

- Write `230 kV`, not `230KV` or `230kv`.
- Write `75 MVA`, not `75MVA`.
- Retain decimal precision from the source. Do not add false precision.
- Use a nonbreaking space between a value and its unit in rendered content when practical.
- Do not calculate a percentage unless each input is cited and the arithmetic is tested.
- State whether a value is a nameplate rating, planning limit, forecast, measured peak, or interrupted load.

## Dates and status

Use complete dates when the source gives them. Do not infer a date from upload order or a nearby filing.

Keep these states separate:

1. proposed
2. approved
3. ordered or procured
4. installed
5. energized
6. completed
7. in service
8. removed from service

## Human writing rules

- Do not begin with `Ah`, `Oh`, `Great`, `Alright`, or `Wow`.
- Do not use em dashes or en dashes.
- Avoid canned transitions and repeated summary paragraphs.
- Use dry humor only after the fact is clear.
- Do not pretend that an unresolved record is a mystery solved by confidence.

