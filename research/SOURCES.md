# Archived source documents

This directory contains unmodified copies of public regulatory filings used by NL Grid Atlas. The copies preserve filings when source URLs fail.

Run `npm run verify:sources` to calculate SHA-256 digests and file sizes.

The initial collection includes:

- Newfoundland Power 2006 Capital Budget Electrical System Handbook
- NL Hydro 2004 Capital Budget Application
- NL Hydro 2013 General Rate Application, Volume II
- Oxen Pond 2013 application and RFIs
- Labrador West 2017 230 kV acquisition application and RFIs
- Newfoundland Power 2014 Electrical System Improvements application
- Newfoundland Power 2014 Capital Budget Application
- Newfoundland Power 2025 Capital Budget Application, Pulpit Rock excerpts
- Newfoundland Power 2026 Capital Budget Application, Pulpit Rock excerpts
- Newfoundland Power 2027 supplemental application, including the May 2026 138 kV and 66 kV loop assessment
- Newfoundland Power 2027 Capital Budget Application, power-transformer listing excerpt
- Newfoundland Power 2026 Capital Budget Application, King's Bridge station record excerpt
- Newfoundland Power 2027 Capital Budget Application, Ridge Road station record excerpt
- Newfoundland Power 2024 PUB-NP-033, Goulds station record excerpt
- Newfoundland Power 2024 CA-NP-030, feeder planning and customer table excerpt
- NL Hydro 2024 Reliability and Resource Adequacy Study, selected Holyrood and Avalon transmission pages
- NL Hydro 2025 Capital Budget Application, selected Hardwoods and Western Avalon pages
- NL Hydro Bay d'Espoir Unit 8 and Avalon Combustion Turbine Application, selected Avalon connection pages
- NL Hydro 2011 Western Avalon transmission corridor report and station single-line
- Newfoundland Power 2023 Memorial transformer application
- Newfoundland Power 2025 38L and 39L relocation application
- NL Hydro 2023 transmission and terminal-station asset report
- NL Hydro 2024 short-term load forecast accuracy report
- Newfoundland Power 2024 CA-NP-158, Memorial and Long Pond single-line diagrams

Derived data from the handbook is stored in `research/derived/np-2006-handbook.json`. Run
`python scripts/extract_np2006_handbook.py` to rebuild it from the archived PDF. The extractor
checks the source-reported totals of 104 transmission lines, 136 substations, and 302 feeders.

The 2027 transformer register is stored in `research/derived/np-2027-transformer-register.json`.
It contains 187 unique designations at 123 station codes from physical PDF pp. 546 to 553 of
the Newfoundland Power 2027 Capital Budget Application.

