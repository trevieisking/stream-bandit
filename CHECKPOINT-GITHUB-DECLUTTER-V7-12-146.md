# Stream Bandit GitHub Declutter Checkpoint — V7.12.146

Date: 2026-05-30

## Purpose

This checkpoint records the safe GitHub repository declutter pass. The cleanup goal is to reduce old test-page clutter while protecting current routes, global helpers, shell files, assets, checkpoints, and any old URLs still used by the menu overlay.

## Cleanup rules used

- Delete in tiny batches only.
- Fetch file/SHA before deleting.
- Do not delete current old-menu-recognised URLs.
- Do not delete source helpers, global shell files, assets, or checkpoints.
- Do not delete backup-folder files during this pass.
- Skip any file if the connector blocks or times out.
- Prefer old V5/V6/V7 temporary test pages, wrapper experiments, route auditors, and superseded version-chain pages.
- Protect accessibility/audio comfort work until the real all-in-one Accessibility page is rebuilt and promoted.

## Confirmed deleted groups

### Tools/global helper failed experiments

- tools-page-original-global-pass-v7-12-138-test.html
- test-checklist-global-helpers-v7-12-143-test.html
- tools-page-global-helpers-v7-12-131-test.html
- tools-page-global-helpers-v7-12-134-test.html
- tools-page-global-helpers-v7-12-132-test.html
- tools-page-original-global-pass-v7-12-139-test.html
- tools-avatar-fix-v7-12-133.js
- tools-global-theme-avatar-fix-v7-12-134.js
- test-checklist-global-helpers-v7-12-141-test.html
- test-checklist-avatar-visible-fix-v7-12-143.js

### Old Tools V5 pages

- tools-v5-15.html
- tools-v5-18.html
- tools-v5-18-1.html
- tools-v5-19-1.html
- tools-v5-20-1.html
- tools-v5-20-2.html

### Old storage/channels/audit utilities

- storage-v5-39.html
- channels-image-uploader-v6-94-1-test.html
- channels-direct-canonical-v6-94-0-test.html
- menu-overlay-test-board-v7-12-57-test.html
- repository-route-census-v7-12-37-test.html
- platform-control-tower-route-link-audit-v7-12-28-test.html
- platform-control-tower-live-machine-route-doctor-v7-12-32-test.html
- platform-control-tower-route-guard-proof-v7-12-33-test.html
- full-app-action-audit-v7-12-63-test.html

### Submit Video version chain

Kept newest known keeper: submit-video-clean-machine-v7-12-78-test.html

Deleted older superseded variants:

- submit-video-clean-machine-v7-12-59-test.html
- submit-video-clean-machine-v7-12-60-test.html
- submit-video-clean-machine-v7-12-66-test.html
- submit-video-clean-machine-v7-12-67-test.html
- submit-video-clean-machine-v7-12-71-test.html
- submit-video-clean-machine-v7-12-72-test.html
- submit-video-clean-machine-v7-12-73-test.html
- submit-video-clean-machine-v7-12-74-test.html
- submit-video-clean-machine-v7-12-75-test.html
- submit-video-clean-machine-v7-12-76-test.html
- submit-video-clean-machine-v7-12-77-test.html
- submit-video-clean-machine-v7-12-65-test.html
- submit-video-clean-machine-v7-12-68-test.html

### Rules and One Machine chains

Kept:

- rules-clean-machine-v7-12-82-test.html
- stream-bandit-one-machine-v7-12-73-test.html

Deleted:

- rules-clean-machine-v7-12-54-test.html
- rules-clean-machine-v7-12-81-test.html
- stream-bandit-one-machine-v7-12-68-test.html
- stream-bandit-one-machine-v7-12-72-test.html
- stream-bandit-clean-machine-menu-v7-12-40-test.html

### Old V5 index and backup test pages

- index-v5-21-3-backup-test.html
- index-v5-26-watch-page-tidy-test.html
- index-v5-27-admin-tabs-tidy-test.html
- backup-page-v5-21-test.html
- backup-page-v5-21-1-test.html

### Old V5 standalone page tests

- home-standalone-v5-44-test.html
- details-standalone-v5-45-test.html
- watch-standalone-v5-46-test.html
- watchlist-standalone-v5-49-test.html
- liked-standalone-v5-51-test.html
- genres-standalone-v5-57-test.html

### Old V5 admin/control/storage/search/genre tests

- admin-centre-v5-40-2-test.html
- admin-centre-v5-40-3-test.html
- control-centre-v5-41-test.html
- control-centre-v5-41-1-test.html
- storage-centre-v5-39-1-test.html
- genre-tools-v5-83-test.html

### Old V5 menu-upgrade tests

- home-menu-upgrade-v5-87-test.html
- library-menu-upgrade-v5-86-test.html
- details-menu-upgrade-v5-88-test.html
- watch-player-upgrade-v5-89-test.html
- continue-watching-menu-upgrade-v5-90-test.html
- watch-history-menu-upgrade-v5-91-test.html
- watchlist-menu-upgrade-v5-92-test.html
- favourites-menu-upgrade-v5-93-test.html
- liked-menu-upgrade-v5-94-test.html

## Known blocked/skipped files

These were skipped because the connector blocked, timed out, or they need manual review later:

- tools-page-global-helpers-v7-12-133-test.html
- tools-page-global-helpers-v7-12-135-test.html
- tools-page-original-global-pass-v7-12-137-test.html
- test-checklist-global-helpers-v7-12-142-test.html
- test-checklist-global-theme-avatar-fix-v7-12-142.js
- tools-v5-16.html
- tools-v5-17.html
- tools-v5-19.html
- tools-v5-20.html
- channels-image-column-fix-v6-94-2-test.html
- full-app-action-audit-v7-12-63-test.html was later successfully deleted
- child-button-route-auditor-v7-12-60-test.html
- clickable-child-button-auditor-v7-12-61-test.html
- overlay-route-truth-machine-v7-12-66-test.html
- stream-bandit-route-pointer-machine-v7-12-36-test.html
- platform-control-tower-machine-gated-route-doctor-v7-12-31-test.html
- stream-bandit-route-pointer-machine-v7-12-36-test.html
- global-search-v5-80-test.html
- home-menu-upgrade-v5-87-1-test.html

## Protected files / families

Do not delete during this pass:

- index.html
- current V7 route pages
- old menu-recognised current URLs
- stream-bandit-global-helper-shell-v7-12-125-test.html
- stream-bandit-global-helper-loader-v7-12-126.js
- stream-bandit-shell-v7-12-124-test.js
- shared/global helper source files
- assets folder
- image/icon files
- checkpoints
- backups folder
- current keepers including submit-video-clean-machine-v7-12-78-test.html, rules-clean-machine-v7-12-82-test.html, and stream-bandit-one-machine-v7-12-73-test.html
- accessibility-menu-upgrade-v5-95-test.html until a real all-in-one Accessibility page is rebuilt, tested, and promoted

## Accessibility protection note

The old V5 Accessibility menu-upgrade test is not to be deleted blindly. It may still contain useful accessibility/audio comfort/player comfort logic. Stream Bandit needs one rebuilt Accessibility page that combines player 1 / player 2 comfort needs, louder audio, captions, readability, focus mode, and global settings behaviour before the old V5 accessibility test can be retired.

## Next cleanup targets

Continue with old V5 pages only, such as:

- old Supabase standalone V5 test pages
- old upload-url V5 test pages
- old admin form/editor V5 test pages
- blocked old V5 pages only if the connector later allows deletion

Do not touch V7 current route work until a route scan confirms what is safe.
