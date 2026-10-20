# Build verification

20 October 2026, Node 22 on Linux.

- npm install: complete, no dependency audit findings.
- npm test: PASS. All 30 CLI operations exercised. Successful workflow checks include exact decimal reconciliation, changed-figure approval invalidation, return then approval, closed-cycle locking, dry-run rollback, failed-file rollback, repeat imports and custom header mapping.
- npm run demo: PASS on a fresh temporary database. Eight HTML documents and three read-only views rendered.
- Browser inspection: disclosure pack at desktop width and evidence view at phone width. Generated reports escape record text; wide data is contained in horizontally scrollable regions.
- Brand lint: no errors. No author placeholders or prohibited voice terms remain.
- The schema runs through PGlite's Postgres engine. A separately hosted Postgres server has not been exercised in this build.
- A GitHub workflow covers Node 22 on Windows and Linux. Remote workflow results are recorded separately when available.

Tests use temporary folders, disable DATABASE_URL and never need a live business database. The demo figures are fictional. Page examples are captured command output, not handwritten results.
