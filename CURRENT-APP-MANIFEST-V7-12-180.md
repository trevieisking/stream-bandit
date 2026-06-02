# Stream Bandit Current App Manifest V7.12.196

Date: 2026-06-02

Purpose: this is the protected current-app map after the full route / shell preservation pass. The filename stays `CURRENT-APP-MANIFEST-V7-12-180.md` because current protected pages and registry checks already reference it. The contents now record the V7.12.196 state.

## Current pass status

Full group scan / preservation pass complete.

Current route baseline remains:

- `V7.12.189 Current Routes Registry / 53 Active Entries / 50 Unique URLs`
- Active overlay entries: 53
- Unique current URLs: 50
- Latest known registry run: 50/50 routes loaded 200
- Latest known protected-file run: 16/16 protected files loaded 200
- Current registry route: `all-pages-version-registry-v7-12-122-current-routes-test.html`

Important: many page URLs stay the same while the page internals move forward. That is intentional. Route truth is the stable URL the shell/menu expects.

Examples:

- `settings-platform-control-hub-v7-12-85-test.html` now contains Settings Hub fixes through V7.12.194.
- `live-readiness-global-helpers-v7-10-2-test.html` now contains V7.12.196 shell/search proof.
- `policy-documents-centre-v7-12-119-test.html` now contains V7.12.195 public preview/read-only logic.
- `policy-reader-v7-12-119-test.html?policy=terms` now contains V7.12.195 public read-only logic.
- `admin-centre-command-deck-v7-12-121-test.html` now contains V7.12.195 current-registry route truth.
- `index.html` now represents the V7.12.196 route/shell preservation map.

## Hard rule

The overlay menu is the master protected list. If a page appears in the overlay menu, it is protected. Do not use it as a blank test page. Do not delete it. Do not replace it with an experiment.

## Build method from this point

- No broad blind patching.
- No helper patch files for page cleanup.
- No stale route sanitizers sending current pages backward.
- Test pages must use a reusable test slot or a page proven to be unused.
- A page is not unused just because its version number is old.
- Real promoted pages must be clean full page code or deliberate preserved-wrapper code.
- Header problems belong in the header shell.
- Footer problems belong in the footer shell.
- Page layout/content belongs in the page code.
- Theme/global visual settings belong in the Theme Studio / Theme Projector path.
- Dangerous database/player/builder pages are preservation-first and must not be rewritten just for visual polish.

## Clean target pattern

Where safe, the target is:

- Header Shell
- Page-owned content/body
- Footer Shell
- Theme Projector / theme bridge
- Current search fallback where needed
- Current core saves/menu-count helpers where header counters must match
- No old visual shell fighting the current shell

Current proof page:

- `live-readiness-global-helpers-v7-10-2-test.html`

Live Readiness V7.12.196 confirmed:

- Header Shell: pass
- Footer Shell: pass
- Full Search: pass
- Theme Projector: pass
- Save Counts: pass
- Route check: 15/15 loaded
- Brand Image Helper opens standalone route
- Favicon / App Icon Builder opens standalone route

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

- `stream-bandit-global-helper-loader-v7-12-126.js` — Owner Brand route truth.
- `stream-bandit-shell-v6-24.js` — Owner Brand route truth / Supabase config source.
- `live-readiness-search-supabase-fallback-v7-12-130.js` — Owner Brand route truth and search/menu sanitizer.
- `index.html` — current app map.

Final Owner Brand route truth:

- Brand / App Icons -> `settings-brand-icons-promoted-v7-12-21-test.html`
- Brand Image Helper -> `brand-logo-helper-responsive-v7-12-20-test.html`
- Favicon / App Icon Builder -> `favicon-app-icon-builder-v7-12-15-test.html`

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

1. Movie Row Editor / Supabase Library Editor — `supabase-library-home-header-form-fix-v7-12-34-test.html`
2. Genres — `genres-clean-machine-v7-12-45-test.html`
3. Global Search — `global-search-global-helpers-v7-4-9-test.html`
4. About — `about-global-helpers-v7-4-7-test.html`

Important: public Library belongs to Watch only. Browse's Supabase route is the Movie Row Editor, not the normal user Library.

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

Current Settings notes:

- Settings Hub route truth and header counters passed through V7.12.194.
- Theme Studio owns global theme writes.
- Theme Projector reads and applies the same theme keys.
- Profile Settings owns profile/avatar/banner logic and must not be casually rewritten.
- Web Builder is protected and must not be casually rewritten.

### Policy

1. Policy & FAQ Centre / Policy Documents — `policy-documents-centre-v7-12-119-test.html`
2. Published Policy Proof / Policy Reader — `policy-reader-v7-12-119-test.html?policy=terms`
3. Policy Admin Editor — `policy-admin-documents-v7-12-120-test.html?policy=terms`

Current Policy notes:

- Policy Centre is public preview/read-only.
- Policy Reader is public read-only and reads only `status = 'published'` rows.
- Missing/unpublished policies show safe fallback text.
- Policy Admin publish logic is preserved.
- Before real users arrive, Policy Admin must become owner/admin-only with Supabase/RLS-backed write protection.

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

Current Admin notes:

- Admin Centre route truth corrected to the current registry route.
- Live Readiness is the current shell/search proof page.
- Admin support tools scanned stable: Test Checklist, Tools, Health Check, Mux Manager, Storage Prep, Backup / Safety.

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

Current Owner notes:

- Owner group scanned and preserved.
- Form Inbox private-message/reply logic preserved.
- Advanced Form submission/upload logic preserved.
- Pages Manager create/hide/restore/permanent-delete logic preserved.
- Published Preview rendering/rating/form flow preserved.
- Brand/App Icons route separation passed.
- Route-label polish remains deferred for risky owner tools.

### User Management

1. User Dashboard — `user-management-dashboard-v7-11-2-test.html`
2. Pricing Matrix / Pricing Feature Shop — `plans-pricing-feature-shop-v7-11-3-test.html`
3. Permissions Matrix — `permissions-matrix-user-management-v7-11-4-test.html`

Legacy promoted aliases remain protected too:

- User Dashboard alias: `user-dashboard-concept-v6-68-test.html`
- Pricing alias: `plans-pricing-matrix-v6-69-test.html`
- Permissions alias: `permissions-matrix-v6-70-test.html`

Current User Management notes:

- User Dashboard is current-schema safe and uses `sb_profiles.role` + `sb_profiles.can_submit` only.
- Pricing Feature Shop is draft/planning only: no billing, checkout or entitlement writes.
- Permissions Matrix is a rule map only: no permission writes.
- Visible route-label polish remains deferred.

## Protected source / dependency notes

- `collections-clean-machine-v7-12-50-test.html` is protected. It is a source/dependency for `collections-clean-machine-v7-12-51-test.html`. Do not use it as a test page.
- Any page loaded with `fetch()` by a protected page is protected until the dependency is removed in clean full page code.
- `web-builder-live-studio-v7-12-106.js` is the protected base Web Builder engine.
- `web-builder-live-studio-v7-12-116.js` is the protected Web Builder repair wrapper.

## Do not casually rewrite

Do not casually rewrite these without a dedicated preservation plan:

- Player 2 engine.
- Supabase Library / Movie Row Editor.
- Theme Studio.
- Profile Settings.
- Web Builder Studio / V7.12.116 wrapper / V7.12.106 base engine.
- Policy Admin publish logic.
- Form Inbox private-message logic.
- Advanced Form submission/upload logic.
- Pages Manager delete/restore logic.
- Published Preview renderer.
- User Management live `role + can_submit` controls.

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

## Next recommended moves

1. Owner/admin security plan before real users.
2. Supabase/RLS hardening for Policy Admin, owner tools and management routes.
3. Route-label polish one risky owner/user-management tool at a time.
4. Optional Global Helper Shell polish to match Live Readiness V7.12.196 more closely.
5. Final live/index promotion only after explicit approval and a fresh route registry run.

## What not to delete

- Anything listed in this manifest.
- Any page linked from the overlay menu.
- Any current shell file.
- Any current source/dependency page.
- Any asset/icon/logo used by protected pages.
- Any config source file used by current frontend.
- Any checkpoint file recording a pass from V7.12.188 through V7.12.196.
