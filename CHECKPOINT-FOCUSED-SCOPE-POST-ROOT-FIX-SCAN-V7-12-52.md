# Stream Bandit Focused Scope Post Root-Fix Scan V7.12.52

Date: 2026-05-25

Trevor reran the must-use focused scanner after the protected root alias fixes.

Scanner used:

`focused-keep-scope-scanner-v7-12-49-test.html`

Result from screenshot:

- Repo files: 958
- HTML pages: 601
- Scope roots: 69
- Keep files: 388
- Keep pages: 364
- Review files: 351
- Missing in scope: 23

Meaning:

- The three previous Scope Root Missing rows are no longer shown in the Missing tab.
- The focused app keep scope is stable at 388 files / 364 pages.
- The remaining 23 Missing In Scope rows are not missing menu roots now; they are mostly fallback/logo/report/sample references.

Remaining Missing In Scope categories shown:

## Logo / brand fallback refs

- `stream_bandit_original_logo_square_256.png`
- `logo-1779203548544.png`

These appear from app pages or brand helper fallback strings. Fix/suppress them through the brand logo system rather than deleting pages.

## Scanner/report generated refs

- `stream-bandit-focused-keep-scope-v7-12-49.js`
- `stream-bandit-runtime-keep-graph-v7-12-41.js`
- `stream-bandit-runtime-keep-graph-v7-12-40.js`
- `stream-bandit-global-dependency-graph-v7-12-39.js`
- `stream-bandit-full-route-graph-v7-12-38.js`

These are not real app dependencies. They should be filtered from future scanner missing counts.

## Old sample/media refs

- `HLS.js`
- `test.html`
- `x.m3u8`
- `t.html`
- `row.js`

These appear to come from old app/script references and should be reviewed separately, not used as a reason to delete or block the current menu/global/settings app.

Next action order:

1. Clean the scanner output so report-generated names do not count as app missing refs.
2. Fix or suppress repeated logo fallback refs through brand helper / current logo system.
3. Confirm the focused scanner still protects the same keep files/pages.
4. Keep Review files untouched until app scope is stable.

Safety rule remains:

- No deletes.
- No live/index promotion.
- No Supabase writes.
- Continue small verified batches only.
