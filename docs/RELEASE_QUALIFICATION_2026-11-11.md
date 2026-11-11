# Release qualification

Date: 2026-11-11  
Commit: `af61cb5858f4f3be98286c3eaed8b47e1fc7a2f3`

## Public-clone gate

The gate ran from a new shallow clone of `https://github.com/andrew867/NLGridAtlas.git` after Git LFS completed checkout.

| Check | Result |
| --- | --- |
| Locked dependency install | Passed; `npm ci` reported 0 vulnerabilities |
| Automated tests | Passed; 71 of 71 |
| Production build | Passed; Vite built 15 modules |
| Pinned source verification | Passed; 66 PDF files hashed |
| Repository state after checks | Clean |
| Checked commit | `af61cb5858f4f3be98286c3eaed8b47e1fc7a2f3` |

The first check began before Git LFS completed and was discarded. The recorded result is the rerun after all 66 PDF objects were present and the repository index was clean.
