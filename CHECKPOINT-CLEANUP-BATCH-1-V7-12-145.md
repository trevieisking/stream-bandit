# CHECKPOINT - CLEANUP BATCH 1 V7.12.145

Date: 2026-05-29
Project: Stream Bandit
Area: GitHub cleanup
Status: COMPLETED

## Summary

GitHub root directory was becoming overcrowded and GitHub showed a directory truncation warning.

Cleanup is being handled in tiny batches only.

No old menu-recognised URLs were deleted.
No current source helpers were deleted.
No assets were deleted.
No checkpoints were deleted.

## Deleted files

### 1. `tools-page-original-global-pass-v7-12-138-test.html`

Reason:
- Confirmed broken Tools loader test.
- It stacked loader logic incorrectly and displayed the wrong page/fallback behaviour.
- It was explicitly rejected and replaced by the passed V7.12.140 Tools behaviour promoted onto the old Tools URL.

Delete commit:

`db760aa7652fe8fd3c1510edef0158f7212159de`

### 2. `test-checklist-global-helpers-v7-12-143-test.html`

Reason:
- Broken Test Checklist wrapper/loader experiment.
- The user reported it stopped on the opening/loading card instead of acting as the desired page.
- The current direction is source-helper fixes, not more wrapper stacking.

Delete commit:

`3935e96dc67e8c7b44c02150071bd5293ccc57c3`

## Preserved files

Important preserved route files include:

- `tools-page-global-helpers-v7-10-1-test.html`
- `test-checklist-global-helpers-v7-10-5-test.html`
- `live-readiness-global-helpers-v7-10-2-test.html`
- `all-pages-version-registry-v7-1-4-full-test.html`
- `admin-centre-command-deck-v7-12-121-test.html`

These must not be deleted just because their filenames look old. They may be menu-recognised current routes.

## Cleanup rule going forward

Use only tiny cleanup batches.

Each batch must be obvious:

- confirmed broken experiments
- failed wrapper pages
- duplicate helper experiments replaced by source fixes

Do not mass delete.
Do not delete old menu-recognised URLs.
Do not delete source helpers or assets without a specific reason.

## Final status

Cleanup batch 1 completed safely.
