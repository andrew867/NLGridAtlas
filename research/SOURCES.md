# Archived source documents

This directory contains unmodified copies of public regulatory filings used by NL Grid Atlas.

The copies reduce dependence on unstable source URLs. They do not replace citations to the original publisher. Source PDFs retain the rights and terms of their publishers and authors.

Run `npm run verify:sources` to calculate SHA-256 digests and file sizes.

The initial collection includes:

- Newfoundland Power 2006 Capital Budget Electrical System Handbook
- NL Hydro 2004 Capital Budget Application
- NL Hydro 2013 General Rate Application, Volume II
- Oxen Pond 2013 application and RFIs
- Labrador West 2017 230 kV acquisition application and RFIs
- Newfoundland Power 2014 Electrical System Improvements application
- Newfoundland Power 2023 Memorial transformer application
- Newfoundland Power 2025 38L and 39L relocation application
- NL Hydro 2023 transmission and terminal-station asset report
- NL Hydro 2024 short-term load forecast accuracy report

Derived data from the handbook is stored in `research/derived/np-2006-handbook.json`. Run
`python scripts/extract_np2006_handbook.py` to rebuild it from the archived PDF. The extractor
checks the source-reported totals of 104 transmission lines, 136 substations, and 302 feeders.

