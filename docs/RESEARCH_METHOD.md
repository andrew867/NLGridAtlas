# Research method

## Collection

Collect from the PUB proceeding archive, compliance-report indexes, Newfoundland Power regulatory pages, utility reports, government records, and manufacturer documents. Prefer plain HTTP for PUB records when HTTPS fails.

The PUB site uses both `pub.nf.ca` and `pub.nl.ca`. Treat these domains as source aliases, but preserve the URL that returned each file.

## Archive handling

1. Save the original file without modification.
2. Record the source URL and referring proceeding page.
3. Calculate SHA-256.
4. Extract text with physical PDF page markers.
5. Render drawing and table pages for visual inspection.
6. Create structured evidence records separately.
7. Keep an unresolved record when the source conflicts with itself.

## Page references

Use the physical PDF page first because it is stable in the archived file. Add the printed page or appendix label when it helps the reader.

Example:

> PDF p. 68, printed Appendix E p. E39

## Diagram reconstruction

A reconstructed one-line is not a copy of the utility drawing. It is a new schematic based on cited equipment and circuit evidence.

Each diagram must state:

- applicable year
- geographic or schematic status
- omitted detail
- evidence status
- source pages

Do not connect two stations because they appear close on a map. Require a circuit record, one-line drawing, route drawing, or explicit text.

## Quality gates

- All displayed numbers include units.
- All technical claims resolve to a source record.
- Every proposal is visibly different from completed work.
- Calculated values have tested inputs and arithmetic.
- Drawing pages receive visual inspection.
- A reviewer can reach the original filing from the site.

