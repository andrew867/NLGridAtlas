# Newfoundland Power direct regulatory mirror

Inventory generated: 2026-11-11T01:56:03Z  
Download log: 2026-11-11T01:57:19Z to 2026-11-11T01:58:36Z  
Source page: [Newfoundland Power, Regulation](https://www.newfoundlandpower.com/en/About/Who-We-Are/Regulation)

## Result

The source page linked 13 PDF documents. The mirror contains all 13 files, 208,202,772 bytes and 3,074 PDF pages. No crawl or download errors were recorded.

Six documents are rate or capital filings. They contain 2,972 pages:

| Filing | Pages | Bytes | SHA-256 | Identical PUB hash |
| --- | ---: | ---: | --- | --- |
| [2024 Capital Budget Application](https://www.newfoundlandpower.com/-/media/PDFs/About-Us/Regulatory-Matters/2024-NP-Capital-Budget-Application.pdf) | 614 | 51,568,196 | `9eb1f103128578345b75b1cc058149494a73b37310d8a03838ddba53ed9a8056` | Yes |
| [2025 Capital Budget Application](https://www.newfoundlandpower.com/-/media/PDFs/About-Us/Regulatory-Matters/2025-NP-Capital-Budget-Application-(1).pdf) | 650 | 36,084,597 | `22f88572f07c1706cdbca14a5ad92f7a2609c2514d6b077c179112dfd630275c` | No |
| [2025/2026 General Rate Application](https://www.newfoundlandpower.com/-/media/PDFs/About-Us/Regulatory-Matters/NFPower_2025-2026_GeneralRateApplication_20250701.pdf) | 96 | 1,709,866 | `52d10c5a1ce3d2757532c4c8a063f0a0a9db294190f0294bb8796781e0fc2518` | No |
| [2026 Capital Budget Application](https://www.newfoundlandpower.com/-/media/PDFs/About-Us/Regulatory-Matters/NFP_CapitalBudgetApplication-2026_20250627.pdf) | 540 | 22,688,036 | `5a7f83834afe356c05c3db5ae25f4c100fa1642a72ce67ff84999ec99f454340` | Yes |
| [2027 Capital Budget Application](https://www.newfoundlandpower.com/-/media/PDFs/About-Us/Regulatory-Matters/NP-2027-Capital-Budget-Application.pdf) | 605 | 36,039,544 | `be16ff3fec757717fd64ed42839f5398361bffc8f53412bf679a41cf11dfa7b5` | No |
| [2027 Thermal Generation Supplemental Application](https://www.newfoundlandpower.com/-/media/PDFs/About-Us/Regulatory-Matters/2027-NP-Thermal-Generation-Supplemental-Application.pdf) | 467 | 56,021,927 | `f712a7a14a2834d7d9dedb32d4396104f80fc5f14062cd81a5be74efae208633` | Yes |

The other seven files are the current rate book, CIAC policy, inter-affiliate code, three Fortis supply-chain reports and the rate-filing news release. They remain in the searchable corpus. Financial, policy and corporate records will be checked for asset additions, capital timing, outages, impairment notes and system-risk disclosures, even when they contain no engineering drawings.

## PUB comparison

The SHA-256 values were compared with the `documents` table in `C:\src\misc\PUB\metadata\pub.sqlite` while the final PUB run was active.

- 3 direct files have a byte-identical PUB document.
- 10 direct files have no identical hash in the PUB mirror.
- A non-match means only that the PUB mirror has no byte-identical file. It does not prove that equivalent content is absent from every PUB filing.

## Files

- Inventory: `C:\src\misc\NewfoundlandPowerRegulatory\inventory.json`
- Download and hash log: `C:\src\misc\NewfoundlandPowerRegulatory\downloads.jsonl`
- PDFs: `C:\src\misc\NewfoundlandPowerRegulatory\files`
- Reproducible mirror script: `scripts/sync_newfoundland_power_regulatory.py`

The inventory covers PDFs linked directly from the Regulation page at the recorded time. It does not enumerate unlinked historical Sitecore media. Re-running the script refreshes the link inventory and downloads newly linked files without replacing a verified local copy.
