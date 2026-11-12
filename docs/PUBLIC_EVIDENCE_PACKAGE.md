# Public evidence package

Updated: 2026-11-11

## Repository evidence

The Git repository contains the source documents required by the published atlas. The current set has 66 PDFs and 222,565,583 bytes under `research/sources/`.

`research/pinned-evidence-manifest.json` records the path, byte count, SHA-256 digest, and matching catalog identifier for every committed PDF. `npm run verify:sources` fails if a PDF changes, a catalog digest is absent, or the manifest is stale.

Commit a complete filing when its size is reasonable and several pages are used. Commit a page extract when the original filing is unusually large and the atlas uses a small, fixed page set. Each extract retains the original URL, original page count, original digest when available, and physical PDF page references in `research/catalog.json`.

## External archives

The crawler mirrors remain outside Git.

| Archive | Files | Bytes | Control record |
| --- | ---: | ---: | --- |
| PUB | 52,931 | 40,130,031,268 | `C:/src/misc/PUB/reports/audit.json` |
| NL Hydro uploads | 2,539 | 9,402,399,683 | `inventory.json` and `downloads.jsonl` |
| Newfoundland Power direct | 13 | 208,202,772 | `inventory.json` and `downloads.jsonl` |

`research/external-archive-manifest.json` records these counts and the SHA-256 digests of the control records. The PUB audit records 49,293 documents, 49,286 distinct hashes, and 504,049 extracted page records. Its permanent source failures remain part of the audit record.

## Snapshot format

Publish external mirror files as immutable content-addressed objects:

`sha256/{first two digest characters}/{full SHA-256 digest}`

Publish one path index for each mirror. Each index row contains the original URL, mirror-relative path, byte count, SHA-256 digest, media type, and retrieval timestamp. Publish the mirror's inventory, download log, and audit record beside the path index.

This layout stores duplicate files once and reconstructs the original directory tree from the path index. A replacement snapshot adds objects and a new dated index; it does not overwrite an older object.

## Restore sequence

1. Download the dated path index and control records.
2. Verify their published SHA-256 digests.
3. Download each content-addressed object not already present locally.
4. Verify every object digest and byte count.
5. Recreate each mirror-relative path from the index. Identical hashes may use hard links when the file system supports them.
6. Run the mirror audit and compare its counts with `research/external-archive-manifest.json`.

The public object-store location is not selected. Until it is published, the complete external archives are recoverable from the local snapshots only. The 66 repository PDFs remain independently recoverable from GitHub.
