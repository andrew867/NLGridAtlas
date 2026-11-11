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

## Open reconciliation

- The table is a 2018 record. Later additions, removals, taps, and endpoint changes require newer circuit-specific evidence.
- The 2023 asset report gives 648 km for Hydro's 69 kV class but does not name individual circuits. The dataset does not relabel the 2018 table's 66 kV circuits as 69 kV.
- Endpoint names retain the spelling in the filed table. Stable station identifiers will be added after the station register and ownership records are reconciled.
