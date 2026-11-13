# Island AC topology dataset

Updated: 2026-11-11

## Filed circuit layer

`research/derived/island-ac-topology-2018.json` transcribes the Hydro transmission-line tables in [PUB-NP-084, Attachment A](http://www.pub.nl.ca/applications/2018/2018ratemitigation/responses/PUB-NP-084.PDF), physical PDF pp. 24 to 26, Attachment A pp. 22 to 24.

The layer contains 58 circuit designations:

| Filed voltage | Circuits |
| --- | ---: |
| 66 kV | 16 |
| 138 kV | 16 |
| 230 kV | 26 |

Seven circuit designations contain more than one route segment in the table. Those segments remain grouped under the filed circuit designation.

The interactive backbone in `src/island-backbone.js` preserves this 58-circuit assessment layer and adds a separate four-circuit generation collection layer for TL235, TL247, TL248, and TL269. Every endpoint has a stable slug identifier and an explicit schematic position. The positions organize the filed topology for inspection; they are not surveyed coordinates.

## Open reconciliation

- The table is a 2018 record. Later additions, removals, taps, and endpoint changes require newer circuit-specific evidence.
- The 2023 asset report gives 648 km for Hydro's 69 kV class but does not name individual circuits. The dataset does not relabel the 2018 table's 66 kV circuits as 69 kV.
- Endpoint names retain the spelling in the filed table.

## 66 kV and 69 kV terminology

Older circuit-specific filings call TL215, TL220, TL221, TL226, TL227, TL229, TL251, TL252, and TL261 69 kV. The later 2018 table records those same circuit designations in its 66 kV table. The JSON layer retains the 2018 filed voltage and stores the older 69 kV statements separately under `historical_voltage_records`.

This is not evidence that every line in the 2018 66 kV table had a 69 kV operating designation. For example, the 2006 GRA describes TL264 as a 66 kV line from Buchans to Duck Pond. Circuit-level records remain controlling.
