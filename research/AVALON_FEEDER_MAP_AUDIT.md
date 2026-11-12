# CA-NP-020 feeder map audit

Updated: 2026-11-11

## Source

Newfoundland Power, CA-NP-020, Supply Issues and Power Outages:  
<http://www.pub.nf.ca/applications/IslandInterconnectedSystem/files/rfi/CA-NP-020.pdf>

Attachment B contains 112 consecutive feeder index-grid sheets on physical PDF pp. 58 to 169. The atlas preserves each sheet as a 144 dpi JPEG without cropping. The filename is the lowercase feeder designation.

## Filed sheets

| Station | Feeder sheets | Physical PDF pages |
| --- | --- | --- |
| GDL | GDL-01 to GDL-06 | 58 to 63 |
| GFS | GFS-07, GFS-08 | 64 to 65 |
| GLV | GLV-01 | 66 |
| GOU | GOU-01 to GOU-03 | 67 to 69 |
| GRH | GRH-03 | 70 |
| HAR | HAR-01, HAR-02 | 71 to 72 |
| HBS | HBS-02 | 73 |
| HGR | HGR-01 | 74 |
| HOL | HOL-01, HOL-02 | 75 to 76 |
| HUM | HUM-01, HUM-08, HUM-09 | 77 to 79 |
| HWD | HWD-01 to HWD-04, HWD-06, HWD-07 | 80 to 85 |
| ILC | ILC-01, ILC-02 | 86 to 87 |
| KBR | KBR-02 to KBR-06, KBR-08 to KBR-12 | 88 to 97 |
| KEL | KEL-01 to KEL-03 | 98 to 100 |
| KEN | KEN-01 to KEN-04 | 101 to 104 |
| LAU | LAU-01 | 105 |
| LGL | LGL-01 | 106 |
| MOB | MOB-02 | 107 |
| MOL | MOL-01, MOL-02, MOL-04 to MOL-06, MOL-09 | 108 to 113 |
| MSY | MSY-01 | 114 |
| OXP | OXP-01 | 115 |
| PAB | PAB-03, PAB-05 | 116 to 117 |
| PAS | PAS-01 | 118 |
| PEP | PEP-01 to PEP-04 | 119 to 122 |
| PUL | PUL-01 to PUL-04 | 123 to 126 |
| RRD | RRD-02 to RRD-05, RRD-07, RRD-08, RRD-10 | 127 to 133 |
| SCV | SCV-01 | 134 |
| SJM | SJM-06, SJM-08, SJM-11, SJM-13 | 135 to 138 |
| SLA | SLA-02, SLA-03, SLA-05 to SLA-08, SLA-10 to SLA-13 | 139 to 148 |
| SPF | SPF-02, SPF-03 | 149 to 150 |
| STX | STX-01 | 151 |
| TRN | TRN-02 | 152 |
| TWG | TWG-01, TWG-02 | 153 to 154 |
| VIC | VIC-02 | 155 |
| VIR | VIR-01 to VIR-06, VIR-08 | 156 to 162 |
| WAL | WAL-01, WAL-02, WAL-04, WAL-05 | 163 to 166 |
| WAV | WAV-01 | 167 |
| WES | WES-01, WES-02 | 168 to 169 |

## Later feeders

CA-NP-020 does not contain sheets for later additions such as HWD-08, HWD-09, PEP-05, PUL-05, and VIR-07. Filed route drawings are used where they exist. The station register date and the feeder-sheet date remain separate in the interface.

## Verification

- The page sequence test requires one unique sheet for every physical PDF page from 58 through 169.
- The asset test requires every JPEG in `public/feeder-maps` to appear in one station record.
- Visual checks covered the first newly extracted group, a middle group, and the last group.
