# Stream Bandit Focused Scope Scanner Must-Use Checkpoint V7.12.50

Date: 2026-05-25

Purpose: Trevor ran the V7.12.49 Focused Keep Scope Scanner and confirmed this is the machine/rule to use for fixing the app from here.

## Must-use scanner

`focused-keep-scope-scanner-v7-12-49-test.html`

Use this scanner as the main cleanup/fix guide from now on.

## Why this scanner is the right one

It follows Trevor's simple product rule:

- Keep overlay menu pages.
- Keep global/settings/control pages.
- Keep the buttons, tabs, child pages, helper scripts and assets those pages lead to.
- Everything outside that focused app scope is Review / Not Needed Right Now.

This replaces the confusing broad runtime/history scanners for cleanup decisions.

## Scanner result from Trevor screenshot

V7.12.49 Focused Keep Scope Scanner result:

- Repo files: 953
- HTML pages: 598
- Scope roots: 69
- Keep files: 385
- Keep pages: 361
- Review files: 351
- Missing in scope: 29

## Meaning

- The app scope now has 385 protected files.
- The protected page count is 361.
- 351 files are outside the focused app scope and are Review / Not Needed Right Now.
- 29 missing references are inside the focused scope and should be fixed first.

## Current cleanup rule

### KEEP

- The 69 focused scope roots.
- Any page/file reached from those roots.
- Shared helper JS/CSS/assets used by those pages.
- Menu overlay pages and global/settings/control pages.

### FIX FIRST

- The 29 Missing In Scope results.
- Scope root missing entries must be checked first.
- Repeated logo fallback references should be cleaned or treated through the brand helper.
- Scanner-generated report names should be filtered, not made into real app dependencies.

### REVIEW / NOT NEEDED RIGHT NOW

- The 351 Review files.
- These are not delete-approved yet.
- These should only be archived later in small reversible batches after focused verification passes.

## Missing in scope observed from screenshot

Known missing entries shown:

- `player-two-clean-machine-v7-12-56-test.html` — scope root missing.
- `favicon-app-icon-builder-v7-12-20-test.html` — scope root missing.
- `brand-icons-favicon-v7-12-19-test.html` — scope root missing.
- repeated `stream_bandit_original_logo_square_256.png` references.
- repeated `logo-1779203548544.png` references.
- scanner/report generated names such as focused/runtime/global graph `.js` names.
- old media/sample references such as `HLS.js`, `test.html`, `x.m3u8`, `t.html`, `row.js`.

## Action order from here

1. Fix the three missing scope roots or replace them with the correct current page names.
2. Fix or suppress repeated logo fallback missing refs through the brand logo helper.
3. Filter scanner/report generated `.js` names from missing refs.
4. Rerun `focused-keep-scope-scanner-v7-12-49-test.html`.
5. Only after Missing In Scope is clean or understood, prepare archive batches for Review files.

## Safety rule

- No deletes from this checkpoint.
- No index/live promotion from this checkpoint.
- No Supabase writes from this checkpoint.
- Keep the backup branch `backup-before-cleanup-v7-12-38`.
