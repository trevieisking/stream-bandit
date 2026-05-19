# Stream Bandit Repo Cleanup Inventory V7

Purpose: reduce repo confusion without breaking the app. This is an inventory only. Do not delete, move, rename or promote anything from this document until the current route map is confirmed and a backup branch exists.

## Golden rule

Do not clean the repo by guessing.

First confirm the current active route map from the shared menu overlay, current Web Builder hub and current registry. Then archive old files in small batches.

## Current safe branch state

Last restored safe checkpoint:

- `cb59d2d0e5e38c434e18e5c012a76a0017c4ba20`
- Registry page: `final-run-through-registry-v7-6-0-test.html`

Known recovered Web Builder current hub:

- `web-builder-current-links-v7-9-8-test.html`

Known latest shared Web Builder shell hub:

- `web-builder-workflow-shared-shell-v7-9-7-test.html`

## Do not delete yet

These files are part of the active shell, account, menu, saves, routing or final-run checkpoint. They should stay in root until a full route map proves otherwise.

### Core live and shared shell files

- `index.html`
- `stream-bandit-shell-v6-24.js`
- `stream-bandit-menu-saves-count-v6-72-1.js`
- `stream-bandit-auth-profile-v6-31.js`
- `stream-bandit-auth-sync-v6-31-7.js`
- `stream-bandit-core-saves-v6-75.js`

### Current final-run / registry files

- `final-run-through-registry-v7-6-0-test.html`
- `all-pages-version-registry-v6-29-test.html`
- `all-pages-version-registry-admin-shell-v6-61-test.html`
- `STREAM_BANDIT_ROUTE_REGISTRY_V6_90_12.md`

### Current account/auth files

- `account-landing-sync-v6-72-2-test.html`
- `account-landing-login-v6-72-1-test.html`
- `account-login-style-borrow-v6-72-0-test.html`
- `auth-profile-shell-v6-31-test.html`

### Current Web Builder chain

- `web-builder-current-links-v7-9-8-test.html`
- `web-builder-workflow-shared-shell-v7-9-7-test.html`
- `web-builder-workflow-auth-shell-v7-9-6-test.html`
- `web-builder-workflow-final-shell-v7-9-5-test.html`
- `web-builder-workflow-global-shell-v7-9-4-test.html`
- `web-builder-workflow-shell-v7-9-2-test.html`
- `web-builder-theme-studio-controls-v7-8-9-test.html`
- `web-builder-shared-style-preview-v7-9-0-test.html`
- `web-builder-shared-style-block-v7-9-0-test.html`
- `web-builder-full-edit-lock-v7-8-5-test.html`
- `web-builder-form-save-v7-6-5-test.html`
- `web-builder-form-viewer-v7-6-6-test.html`
- `web-builder-registry-prep-v7-7-9-test.html`

### Current Watch/Browse/Creator/Admin route families

Keep the newest current shell route for each menu page until the menu overlay is checked:

- `home-watch-shell-v6-32-test.html`
- `details-artwork-16x9-v6-77-7-test.html`
- `player-watch-shell-v6-34-test.html`
- `continue-watching-watch-shell-v6-35-test.html`
- `watch-history-watch-shell-v6-36-test.html`
- `watchlist-watch-shell-v6-37-test.html`
- `favourites-watch-shell-v6-38-test.html`
- `liked-watch-shell-v6-39-test.html`
- `accessibility-watch-shell-v6-40-test.html`
- `library-browse-shell-v6-41-test.html`
- `about-browse-shell-v6-42-test.html`
- `supabase-library-browse-shell-v6-43-test.html`
- `genres-browse-shell-v6-44-test.html`
- `channels-browse-shell-v6-45-test.html`
- `collections-browse-shell-v6-46-1-test.html`
- `playlists-browse-shell-v6-47-test.html`
- `my-channel-creator-shell-v6-48-test.html`
- `submit-video-creator-shell-v6-49-test.html`
- `rules-creator-shell-v6-50-test.html`
- `review-queue-creator-shell-v6-51-test.html`
- `global-search-admin-shell-v6-52-test.html`
- `admin-centre-admin-shell-v6-53-test.html`
- `settings-admin-shell-v6-54-test.html`
- `settings-studio-admin-shell-v6-55-test.html`
- `profile-settings-admin-shell-v6-56-test.html`
- `web-builder-admin-shell-v6-57-test.html`
- `platform-builder-admin-shell-v6-58-test.html`
- `final-shell-navigation-admin-shell-v6-59-test.html`
- `live-readiness-admin-shell-v6-60-test.html`
- `test-checklist-admin-shell-v6-62-test.html`
- `tools-page-admin-shell-v6-63-test.html`
- `health-check-admin-shell-v6-64-test.html`
- `mux-manager-admin-shell-v6-65-test.html`
- `storage-prep-admin-shell-v6-66-test.html`
- `backup-safety-admin-shell-v6-67-test.html`
- `user-dashboard-concept-v6-68-test.html`
- `plans-pricing-matrix-v6-69-test.html`
- `permissions-matrix-v6-70-test.html`
- `policy-faq-centre-v6-71-test.html`

## Likely archive later

These are probably useful history but should not clutter root long-term. Move to archive only after the active menu route map is confirmed.

Recommended target folder later:

- `archive/old-checkpoints/`
- `archive/old-menu-upgrades/`
- `archive/old-standalone-pages/`
- `archive/old-index-tests/`
- `archive/old-plan-docs/`

### Old index test builds

Archive later:

- `index-v5-*`
- `index-v6-72-3-live-menu-counts-backup.html`
- `index-v5-39-3-pre-v6-30-2-live-promotion-backup.html`
- `index-v5-39-3-menu-safe.html`

Reason: these are historical app builds/backups. Keep them in archive, not root.

### Old standalone pages

Archive later when corresponding shell route is confirmed current:

- `*-standalone-v5-*.html`
- `storage-v5-39.html`
- `backup-v5-37-8-lite.html`
- `tools-v5-14.html` through older `tools-v5-*` variants, except current known keepers.

Reason: current route should be the shell version, not old standalone pages.

### Old menu-upgrade pages

Archive later after the menu overlay confirms current shell pages:

- `*-menu-upgrade-v5-*.html`
- `*-menu-upgrade-v6-*.html`

Reason: many are intermediate audit pages. Current shared shell routes should replace them.

### Old Web Builder intermediate files

Archive later after V7.9.8 route map is confirmed:

- `web-builder-action-preview-v7-7-3-test.html`
- `web-builder-action-repair-v7-7-2-test.html`
- `web-builder-actions-live-v7-6-3-test.html`
- `web-builder-auto-actions-v7-7-4-test.html`
- `web-builder-block-options-v7-5-6-test.html`
- `web-builder-block-pack-v7-5-5-test.html`
- `web-builder-block-page-runner-v7-8-0-test.html`
- `web-builder-colour-pickers-v7-7-6-test.html`
- `web-builder-control-hub-polish-v7-6-8-test.html`
- `web-builder-control-hub-v7-6-7-test.html`
- `web-builder-draft-builder-v7-5-1-test.html`
- `web-builder-edit-lock-v7-5-2-test.html`
- `web-builder-form-runner-v7-6-0-test.html`
- `web-builder-form-submit-v7-6-4-test.html`
- `web-builder-full-restore-library-fix-v7-8-4-test.html`
- `web-builder-full-restore-v7-8-3-test.html`
- `web-builder-live-page-v7-5-8-test.html`
- `web-builder-live-page-v7-5-9-test.html`
- `web-builder-page-actions-v7-6-2-test.html`
- `web-builder-page-manager-v7-5-4-test.html`
- `web-builder-preview-block-focus-v7-7-1-test.html`
- `web-builder-preview-block-pages-v7-8-1-test.html`
- `web-builder-published-renderer-v7-5-3-test.html`
- `web-builder-renderer-v7-5-3-test.html`
- `web-builder-repeater-canvas-v7-5-7-test.html`
- `web-builder-route-resolver-v7-6-1-test.html`
- `web-builder-shared-style-source-v7-8-8-test.html`
- `web-builder-studio-style-sync-v7-8-7-test.html`
- `web-builder-style-preview-v7-7-7-test.html`
- `web-builder-supabase-check-v7-5-0-test.html`
- `web-builder-unified-shell-v7-7-5-test.html`
- `web-builder-workflow-current-v7-8-6-test.html`
- `web-builder-workflow-hub-v7-7-8-test.html`

Reason: V7.9.8 now acts as the recovered current Web Builder links hub, while these are earlier steps.

### Old checkpoint markdown files

Archive later, do not delete:

- `CHECKPOINT-*.md`
- `PLAN*.md`
- `TODAY-PAGE-TIDY-PLAN-V5.28.md`
- `WATCH_AREA_*.md`
- `STREAM_BANDIT_PLATFORM_BUILDER_VISION.md`
- `STREAM-BANDIT-LONG-TERM-ROADMAP.md`

Reason: useful project history, but not active app code.

## Potential duplicate families to audit

These families have many versions. Keep the newest current route and archive older attempts after confirmation.

- `genres-*`
- `channels-*`
- `collections-*`
- `playlists-*`
- `supabase-library-*`
- `watch-history-*`
- `player-*`
- `details-*`
- `settings-studio-*`
- `admin-centre-*`

## Never delete until manually confirmed

These may look old but can contain unique functionality or data migration logic.

- `sql/`
- `assets/`
- `backups/`
- `docs/`
- `supabase-migration-standalone-v5-65-test.html`
- `supabase-migration-menu-upgrade-v6-06-test.html`
- `supabase-test-standalone-v5-63-test.html`
- `supabase-test-menu-upgrade-v6-04-test.html`
- `storage-prep-admin-shell-v6-66-test.html`
- `backup-safety-admin-shell-v6-67-test.html`
- `mux-manager-admin-shell-v6-65-test.html`
- any file that writes to Supabase, uploads images, manages Mux, exports/imports backups, or changes live readiness.

## Proposed cleanup phases

### Phase 0: Backup

Create a branch before any cleanup:

- `archive-before-root-cleanup-v7`

No deletes before this branch exists.

### Phase 1: Active route map

Make `STREAM-BANDIT-ACTIVE-ROUTE-MAP-V7.md` from the current menu overlay. It should list exactly one current file per page.

### Phase 2: Archive markdown and old index tests

Move documentation and old index variants first. These are lowest risk because current app routes should not depend on them directly.

### Phase 3: Archive old standalone/menu-upgrade pages

Only after current shell route for each page has passed.

### Phase 4: Archive old Web Builder intermediates

Only after V7.9.8, V7.9.7, V7.8.9, V7.8.5 and V7.9.0 pages are confirmed.

### Phase 5: Archive duplicate feature-family tests

Handle genres, channels, collections, playlists, Supabase Library, watch-history, details and player one family at a time.

## Current next action

Do not delete anything yet.

Next safe task is to build the active route map from the shared menu overlay, then compare that route map against this cleanup inventory.
