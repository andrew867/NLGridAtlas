# Request reconciliation

Updated: 2026-11-11

## Implemented

- [x] Separate system overview, terminal station, substation, transmission, timeline, load, telecom, and source sections.
- [x] Consistent terminal-station and substation drawing frames with an evidence panel on the right.
- [x] Clickable transformer, capacitor, generator, feeder, and bus records where a source supports the component.
- [x] Default station summaries when no component is selected.
- [x] Terminal circuit links open the documented station at the other end.
- [x] Newfoundland Power substation 66 kV links return to the supplying terminal station.
- [x] Avalon map points update the evidence panel without scrolling the browser.
- [x] The evidence-panel station link opens the detailed station record.
- [x] Expandable extracted feeder maps for Hardwoods, Kenmount, Oxen Pond, and Goulds.
- [x] Station browser for all 136 handbook stations plus Airport, Long Pond, and Mobile Hydro Plant.
- [x] Mobile layouts use one column, scale the drawings, and hide drawing captions below 640 px.
- [x] Repeater antennas and four-wire link labels do not overlap.
- [x] Terminal and Newfoundland Power buses use `66 kV` labels. Equipment records retain their stated winding voltages.
- [x] Holyrood gas turbine branch moved below the main buses.
- [x] Provincial vector source map promoted to the island overview.
- [x] Avalon 230 kV station order corrected to Western Avalon, Holyrood, Hardwoods, and Oxen Pond.
- [x] 66 kV network identified as semi-geographic, using the 2013 and 2026 source maps for station placement.
- [x] Hydro upload findings added to the site: TL201 dynamic line rating, Western Avalon controls, Avalon combustion-turbine connection, and the Holyrood 2030 planning case.
- [x] Island station register added for Sunnyside, Stony Brook, Bay d'Espoir, Buchans, Deer Lake, Bottom Brook, Grand Falls and Bishop's Falls, Massey Drive, Stephenville, and Come By Chance.
- [x] All feeder-map images currently extracted from the archive are linked from their station records.
- [x] The 2016 PUL-02, RRD-10, and PUL-05 route drawings are extracted and linked from Pulpit Rock, Ridge Road, and Virginia Waters.
- [x] The 2022 PUL-03 and VIR-01 route drawings are linked to their measured project bases and completion records.
- [x] Dated logical one-lines added for Glendale, Virginia Waters, Stamp's Lane, St. John's Main, and Pepperell, limited to the topology supported by public filings.

## Evidence gaps

- [ ] Current operating one-lines for Glendale, Virginia Waters, Stamp's Lane, St. John's Main, and Pepperell. Dated logical diagrams are published, but current breaker and bus-section arrangements were not located.
- [ ] Current feeder-to-transformer and bus-section assignments for stations that have only register data.
- [ ] Current circuit and feeder registers. The complete available register is dated June 2005.
- [ ] Feeder map sheets beyond those preserved for Hardwoods, Kenmount, Oxen Pond, Goulds, Glendale, St. John's Main, Stamp's Lane, King's Bridge, Pepperell, and Virginia Waters. The HWD-08 route and recloser drawing is preserved; the CA-NP-020 attachment has no HWD-08 feeder sheet.
- [ ] Geographic coordinates or route data suitable for a measured line map. The available utility maps are semi-geographic.
- [ ] Holyrood Unit 3 permanent post-steam as-built drawing. The reversible synchronous-condenser arrangement dates to 1986. The July 2026 operating report still records synchronous-condensing hours under the reversible arrangement; the future post-steam role remains a planning assumption under review.
- [ ] Pulpit Rock replacement-transformer commissioning record or post-work one-line. The 12.5 kV feeder-bus record is established; the replacement installation status remains open.

## Next archive searches

1. Search Newfoundland Power capital applications and RFIs for station-specific protection drawings and one-lines.
2. Search Hydro uploads for issued-for-construction and commissioning records for the Avalon combustion turbine and Holyrood Unit 3 permanent post-steam arrangement.
3. Extract additional feeder map sheets when a filing identifies their physical PDF pages.
4. Replace the new western island station records with current detailed one-lines when source drawings are found.
