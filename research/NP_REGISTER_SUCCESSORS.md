# Newfoundland Power register successor search

Updated: 2026-11-10

## Result

No current complete public replacement for the June 2005 circuit and feeder registers has been located.

Three later-filed records define the strongest available layers. The feeder attachment is a republication, not an update:

| Record | Coverage | Exact source pages |
| --- | --- | --- |
| PUB-NP-5, Attachment A | Republication of the June 2005 station and feeder register | PDF pp. 3 to 8; attachment pp. 1 to 6 |
| 2010 Depreciation Study, Appendix A | Transmission-line sections, endpoints, length, year built, structure type, voltage, and conductor | PDF pp. 280 to 286; appendix pp. A1 to A6 |
| PUB-NP-275, Attachment A | Transmission-line endpoints, voltage, winter continuous rating, and 2012 forecast peak load | PDF pp. 3 to 11; attachment pp. 1 to 9 |

These records have different dates and cannot be merged as if they describe one current system state.

## Substation and feeder listing

PUB-NP-5 was filed in the 2009 Capital Budget Application. The PDF metadata creation date is August 18, 2008. The attachment does not print an as-of date.

The six-page attachment lists station designation, station name, and feeder numbers. Extraction produced 136 station records and 302 feeder designations. A record-by-record comparison found no difference from the June 2005 register in the 2006 handbook. PUB-NP-5 republishes the earlier register; it does not establish a 2008 or 2009 system state.

Source: [PUB-NP-5](http://www.pub.nl.ca/applications/ARCHIVE/2009/NP2009Capital/files/rfi/PUB-NP-5.pdf), PDF pp. 1 and 3 to 8.

## Transmission construction register

Appendix A of the 2010 Depreciation Study is explicitly dated May 18, 2010. Each row represents a physical line section, not necessarily one complete numbered circuit.

The table columns are:

- line number;
- from and to location;
- length in kilometres;
- year built;
- structure or line type;
- loop or radial classification;
- voltage in kilovolts;
- conductor size and type.

The six table pages were visually checked because their rows are embedded as page images and ordinary PDF text extraction returns only the headers and footers.

Source: [CA-NP-088](http://www.pub.nl.ca/applications/ARCHIVE/2013/NP2013GRA/files/rfi/CA-NP-088.pdf), PDF pp. 280 to 286.

## Transmission loading register

PUB-NP-275 asks for all Newfoundland Power transmission lines by voltage, ampacity, and next-winter peak demand. Attachment A is titled `2013 Transmission Line Loading`.

The response states that the peak values are based on the 2011 substation-transformer forecast for 2012. The attachment separates St. John's, Avalon, Burin, Bonavista, Gander, Grand Falls, Corner Brook, and Stephenville tables. It identifies normally open sections in table notes.

Extraction produced 153 regional loading rows and 144 distinct circuit-section labels. Sections 102L(A) to 102L(C), 124L(A) to 124L(E), and 136L appear in two regional tables. Those duplicate labels retain separate regional forecast values in the derived data.

Source: [PUB-NP-275](http://www.pub.nl.ca/applications/IslandInterconnectedSystem/files/rfi/PUB-NP-275.pdf), PDF pp. 1 and 3 to 11.

## Later update layers

- CA-NP-156 lists the transmission lines that were 40 years old or older in 2021, with the age of each line. It also states the inspection and rebuild criteria. Source: [CA-NP-156](http://www.pub.nl.ca/applications/2022/NP2022Capital/rfis/CA-NP-156.PDF), PDF pp. 1 to 2.
- CA-NP-124 states that Newfoundland Power owns 111 transmission lines spanning approximately 2,000 km, and that the company does not have a current list of lines that fail current construction standards. Source: [CA-NP-124](http://www.pub.nl.ca/applications/2025/NP2025Capital/responses/CA-NP-124.PDF), PDF p. 1.
- CA-NP-069 lists all transmission-line rebuild projects from 2006 through the 2025 forecast year, with approved and actual or forecast costs. Source: [CA-NP-069](http://www.pub.nl.ca/applications/2026/NP2026Capital/responses/CA-NP-069.PDF), PDF pp. 1 to 2.

These update layers identify changed assets and dates. They do not publish a current complete endpoint or feeder register.

## Search record

The local PUB full-text index was searched for the exact phrases `Substation/Feeder Listing`, `Transmission Line Listing`, `list of all Newfoundland Power transmission lines`, and `Transmission Line Loading`.

- `Substation/Feeder Listing` returned the 2006 handbook and PUB-NP-5. The two extracted registers are identical.
- `Transmission Line Listing` returned the 2006 handbook and the May 18, 2010 appendix.
- `list of all Newfoundland Power transmission lines` returned PUB-NP-275 and a compiled RFI package containing the same request.
- Searches restricted to 2024, 2025, 2026, and 2027 filings did not locate a later complete transmission-line listing.

The direct Newfoundland Power mirror was also searched page by page. Its 13 PDFs contain 3,074 pages. The 2024 through 2027 capital applications contain project tables, five-year station forecasts, transformer schedules, and individual system studies. They do not contain a complete circuit and feeder register under the searched terms.

The complete PUB audit was still running when this note was written. The exact searches must be repeated after the final index is closed before SRC-002 can be marked complete.

The text-native feeder and loading tables are preserved in `research/derived/np-register-layers-2008-2013.json`. Regenerate the file with `scripts/extract_np_register_layers.py`.
