# PUB mirror audit, 2026-11-11

The final export and audit run finished on 2026-11-10 at 23:27:33 NST. The crawl has no pending pages, pending documents, or transient failures. It is not a complete mirror because the source contains permanent missing and redirect-loop URLs.

## Final inventory

| Measure | Audit value |
| --- | ---: |
| Known URLs | 54,623 |
| Fetched URLs | 52,954 |
| Stored documents | 49,293 |
| Extracted pages | 504,049 |
| Stored document bytes | 38,263,979,683 |
| Files on disk | 52,931 |
| Bytes on disk | 40,130,031,268 |
| Distinct file hashes | 49,286 |
| Indexed findings | 5,000 |

The findings count is the configured research-index limit, not the number of potentially relevant passages in the archive. The full page-text export contains 504,049 page records.

## Unresolved URLs

| State | Count | Meaning |
| --- | ---: | --- |
| `missing`, permanent, HTTP 404 | 1,587 | 945 document links and 642 page or support-file links returned 404. |
| `queued`, permanent | 79 | Every record is an IIS `_notes` directory that entered a redirect loop. |
| `absent`, HTTP 404 | 3 | Optional probes for `robots.txt`, `sitemap.xml`, and `sitemap_index.xml`. |

The audit contains no transient failures. Re-running the crawler will not repair these records unless the PUB server changes.

## Recovered retry set

The files that timed out during the preceding run were recovered and verified with HTTP 200 records:

- `PUB-CA-011.PDF` through `PUB-CA-025.PDF` in the 2025 Newfoundland Power GRA responses
- `IR-PUB-NLH-048.PDF`
- `IR-PUB-NLH-049.PDF`

## Audit record

- Audit: `C:\src\misc\PUB\reports\audit.json`
- Audit SHA-256: `60D2B3A5A525F848F6FC463ED9C671227CAE0CCEFA9B57D296E8B9B1518B4545`
- Database: `C:\src\misc\PUB\metadata\pub.sqlite`
- Page exports: `C:\src\misc\PUB\reports\pages.csv` and `pages.json`
- Audit field `complete_mirror`: `false`

`ARC-001` records the crawl and audit as finished. It does not claim that every discovered PUB URL exists or was mirrored.
