# Stream Bandit Current App Manifest V7.12.189

Date: 2026-06-02

Purpose: this is the protected current-app map after the Owner Brand Route Truth full pass and the start of the clean group shell refit.

## V7.12.189 route / ownership alignment

- Active overlay entries: 53.
- Unique current URLs: 50.
- Home remains the safe app route.
- Every active page should move toward the clean pattern: Header Shell + Page Content + Footer Shell + Theme Projector.
- Brand / App Icons, Brand Image Helper and Favicon / App Icon Builder are separate owner routes.
- Collections route truth remains V7.12.51.
- Player 2 route truth remains V7.12.58.
- Deleted Owner machine entries are not active routes and may remain only as historical support or witness files when referenced by current pages.

## Hard rule

The overlay menu is the master protected list. If a page appears in the overlay menu, it is protected. Do not use it as a blank test page. Do not delete it. Do not replace it with an experiment.

## Build method from this point

- No broad blind patching.
- No helper patch files for page cleanup.
- No page-level scripts forcing shell-owned state.
- No stale route sanitizers sending current pages backward.
- Test pages must use a reusable test slot or a page proven to be unused.
- A page is not unused just because its version number is old.
- Real promoted pages must be clean full page code.
- Header problems belong in the header shell.
- Footer problems belong in the footer shell.
- Page layout/content belongs in the page code.
- Theme/global visual settings belong in the Theme Studio / theme projector path.

## Clean target pattern

Reference page:

- `home-global-helpers-v7-4-4-test.html`

Clean pattern:

- Header Shell
- Page-owned content/body
- Footer Shell
- Theme Projector / theme bridge
- Current search fallback when needed
- Current saves/count helpers where needed
- No old visual shell fighting the current shell

## Protected shell and helper files

These filenames are protected because current pages load or depend on them:

- `stream-bandit-header-shell-v7-12-156.js`
- `stream-bandit-footer-shell-v7-12-156.js`
- `stream-bandit-theme-projector-v7-12-156.js`
- `stream-bandit-settings-global-v7-1-8.js`
- `stream-bandit-brand-logo-v7-12-12.js`
- `stream-bandit-menu-saves-count-v6-72-1.js`
- `stream-bandit-core-saves-v6-75.js`
- `live-readiness-search-supabase-fallback-v7-12-130.js`
- `stream-bandit-profile-signin-v7-12-156.js`
- `stream-bandit-shell-v6-24.js`
- `stream-bandit-global-helper-loader-v7-12-126.js`

## Route truth sanitizer full pass

Do not revert these route-truth fixes:

- `stream-bandit-global-helper-loader-v7-12-126.js` — V7.12.186 Owner Brand route truth.
- `stream-bandit-shell-v6-24.js` — V7.12.187 Owner Brand route truth.
- `live-readiness-search-supabase-fallback-v7-12-130.js` — V7.12.188 Owner Brand route truth.
- `index.html` — V7.12.188 current app map.

Final Owner Brand route truth:

- Brand / App Icons -> `settings-brand-icons-promoted-v7-12-21-test.html`
- Brand Image Helper -> `brand-logo-helper-responsive-v7-12-20-test.html`
- Favicon / App Icon Builder -> `favicon-app-icon-builder-v7-12-15-test.html`

## Protected source / dependency notes

- `collections-clean-machine-v7-12-50-test.html` is protected. It is a source/dependency for `collections-clean-machine-v7-12-51-test.html`. Do not use it as a test page.
- Any page loaded with `fetch()` by a protected page is protected until the dependency is removed in clean full page code.

## Current route truth by overlay group

### Watch

1. Home — `home-global-helpers-v7-4-4-test.html`
2. Library — `library-global-helpers-v7-4-8-test.html`
3. Details — `details-clean-machine-v7-12-38-test.html`
4. Player 1 — `player-one-global-helpers-v7-3-3-test.html`
5. Continue Watching — `continue-watching-global-helpers-v7-3-9-test.html`
6. Watch History — `watch-history-global-helpers-v7-4-0-test.html`
7. Watchlist — `watchlist-clean-machine-v7-12-43-test.html`
8. Favourites — `favourites-clean-machine-v7-12-41-test.html`
9. Likes / Liked — `likes-clean-machine-v7-12-42-test.html`
10. Accessibility — `accessibility-clean-machine-v7-12-44-test.html`

### Browse

1. Supabase Library Editor — `supabase-library-home-header-form-fix-v7-12-34-test.html`
2. Genres — `genres-clean-machine-v7-12-45-test.html`
3. Global Search — `global-search-global-helpers-v7-4-9-test.html`
4. About — `about-global-helpers-v7-4-7-test.html`

Important: Library belongs to Watch only, not Browse.

### Creator

1. Submit Video — `submit-video-clean-machine-v7-12-79-test.html`
2. Rules — `rules-clean-machine-v7-12-82-test.html`
3. Review Queue — `review-queue-clean-machine-v7-12-80-publish-test.html`

### Group Play

1. Playlists — `playlists-global-helpers-v7-5-2-test.html`
2. Channels — `channels-global-helpers-v7-5-3-test.html`
3. My Channel — `my-channel-clean-machine-v7-12-47-test.html`
4. Collections — `collections-clean-machine-v7-12-51-test.html`
5. Player 2 — `player-2-clean-machine-v7-12-58-test.html`

Protected ownership rule:

- Single movie Play = Player 1.
- Play All / queue playback = Player 2.
- Player 2 queue keys remain protected: `streamBanditQueueV1`, `streamBanditUpNextV1`, `streamBanditPlayer2Queue`.

### Settings

1. Settings / Settings Hub — `settings-platform-control-hub-v7-12-85-test.html`
2. Settings Studio / Theme Studio — `web-builder-theme-studio-controls-v7-8-9-test.html`
3. Profile Settings — `profile-settings-live-ready-v7-12-90-test.html`
4. Web Builder — `web-builder-live-studio-v7-12-116-test.html?page=test-page`

### Policy

1. Policy & FAQ Centre / Policy Documents — `policy-documents-centre-v7-12-119-test.html`
2. Published Policy Proof / Policy Proof — `policy-reader-v7-12-119-test.html?policy=terms`
3. Policy Admin Editor — `policy-admin-documents-v7-12-120-test.html?policy=terms`

### Admin

1. Admin Centre — `admin-centre-command-deck-v7-12-121-test.html`
2. Live Readiness — `live-readiness-global-helpers-v7-10-2-test.html`
3. Current Routes Registry — `all-pages-version-registry-v7-12-122-current-routes-test.html`
4. Test Checklist — `test-checklist-global-helpers-v7-10-5-test.html`
5. Tools — `tools-page-original-global-pass-v7-12-136-test.html`
6. Health Check — `health-check-global-helpers-v7-10-6-test.html`
7. Mux Manager — `mux-manager-global-helpers-v7-10-7-test.html`
8. Storage Prep — `storage-prep-global-helpers-v7-10-8-test.html`
9. Backup / Safety — `backup-safety-global-helpers-v7-10-9-test.html`

### Owner

1. Form Inbox — `web-builder-form-submissions-v7-12-94-test.html?page=test-page`
2. Advanced Form — `web-builder-form-save-v7-12-94-test.html?page=test-page`
3. Web Builder Studio — `web-builder-live-studio-v7-12-116-test.html?page=test-page`
4. One Machine — `stream-bandit-one-machine-v7-12-73-test.html`
5. Platform Control Centre — `settings-platform-control-hub-v7-12-85-test.html`
6. Route Guard Proof — `health-check-global-helpers-v7-10-6-test.html`
7. Final Shell Navigation — `stream-bandit-global-helper-shell-v7-12-126-test.html`
8. Brand / App Icons — `settings-brand-icons-promoted-v7-12-21-test.html`
9. Brand Image Helper — `brand-logo-helper-responsive-v7-12-20-test.html`
10. Favicon / App Icon Builder — `favicon-app-icon-builder-v7-12-15-test.html`
11. Pages Manager — `web-builder-pages-manager-v7-12-111-test.html`
12. Published Preview — `web-builder-shared-style-preview-v7-12-117-test.html?page=test-page`

### User Management

1. User Dashboard — `user-management-dashboard-v7-11-2-test.html`
2. Pricing Matrix / Pricing Feature Shop — `plans-pricing-feature-shop-v7-11-3-test.html`
3. Permissions Matrix — `permissions-matrix-user-management-v7-11-4-test.html`

Legacy promoted aliases remain protected too:

- User Dashboard alias: `user-dashboard-concept-v6-68-test.html`
- Pricing alias: `plans-pricing-matrix-v6-69-test.html`
- Permissions alias: `permissions-matrix-v6-70-test.html`

## Current scanner expectations

Expected current scanner results after this manifest alignment:

- Active overlay entries: 53
- Unique URLs: 50
- Deleted Owner machines in active menu: 0
- Supabase writes from scanners: 0
- Live/index promotion from scanners: 0

## Test slot rule

Before making a new test page, first identify one old inventory file that is not in this manifest, not referenced by a protected shell/page, and not fetched by another protected page.

Current HTML test slot:

- `collections-header-shell-v7-12-180-test.html`

Preferred future renamed slots after cleanup approval:

- HTML test slot: `stream-bandit-test-slot.html`
- JS test slot: `stream-bandit-shell-test-slot.js`

Do not create unlimited new test files. Keep repo file count stable by recycling approved old inventory.

## What not to delete

- Anything listed in this manifest.
- Any page linked from the overlay menu.
- Any current shell file.
- Any current source/dependency page.
- Any asset/icon/logo used by protected pages.
- Any config source file used by current frontend.
