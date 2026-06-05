# Stream Bandit Current App Manifest V7.12.218

Date: 2026-06-05

Purpose: protected current-app map after the owner/admin utility, form pipeline, Supabase Library preservation and Admin Centre route command deck passes. The filename stays `CURRENT-APP-MANIFEST-V7-12-180.md` because current protected pages and registry checks already reference it. The contents now record the V7.12.218 state.

## Current pass status

Strong current pause point.

Current route baseline remains:

- `V7.12.189 Current Routes Registry / 53 Active Entries / 50 Unique URLs`
- Active overlay entries: 53
- Unique current URLs: 50
- Current registry route: `all-pages-version-registry-v7-12-122-current-routes-test.html`
- Latest known full registry baseline: 50/50 routes loaded 200
- Latest known protected-file baseline: 16/16 protected files loaded 200

Important: many page URLs stay the same while the page internals move forward. That is intentional. Route truth is the stable URL the shell/menu expects.

## Current page internals promoted since V7.12.196

These pages keep their old/current route URLs but now contain newer passed internal versions:

- `stream-bandit-header-shell-v7-12-156.js` — V7.12.211 Global Account Panel.
- `profile-settings-live-ready-v7-12-90-test.html` — V7.12.208 Profile Settings sign-out / existing-user flow.
- `policy-admin-documents-v7-12-120-test.html?policy=terms` — V7.12.210 Policy Admin Editor Centre restored.
- `storage-prep-global-helpers-v7-10-8-test.html` — V7.12.209 Storage Prep Image URL Workshop.
- `web-builder-form-submissions-v7-12-94-test.html?page=test-page` — V7.12.212 Form Inbox + Private Messages.
- `web-builder-form-save-v7-12-94-test.html?page=test-page` — V7.12.213 Advanced Form end-to-end submission page.
- `backup-safety-global-helpers-v7-10-9-test.html` — V7.12.214 Backup / Safety Owner Utility.
- `health-check-global-helpers-v7-10-6-test.html` — V7.12.215 Health Check Owner Diagnostic.
- `test-checklist-global-helpers-v7-10-5-test.html` — V7.12.216 Test Checklist Owner QA Utility.
- `supabase-library-home-header-form-fix-v7-12-34-test.html` — V7.12.217 Supabase Library Editor / Shell Route Preservation.
- `admin-centre-command-deck-v7-12-121-test.html` — V7.12.218 Admin Centre Route Command Deck.

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
- Database/player/builder pages are preservation-first and must not be rewritten just for visual polish.

## Clean target pattern

Where safe, the target is:

- Header Shell
- Page-owned content/body
- Footer Shell
- Theme Projector / theme bridge
- Current search fallback where needed
- Current core saves/menu-count helpers where header counters must match
- No old visual shell fighting the current shell

Current shell proof routes:

- `live-readiness-global-helpers-v7-10-2-test.html`
- `stream-bandit-global-helper-shell-v7-12-126-test.html`

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

Current Browse notes:

- Supabase Library Editor contains V7.12.217 shell/route preservation.
- Player 2 stale route was corrected inside the editor to `player-2-clean-machine-v7-12-58-test.html`.
- `sb_movies` field keys, create/edit/delete overlays, poster preview and poster upload path were preserved.

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
- Profile Settings owns profile/avatar/banner logic and now has clearer sign-out behaviour.
- Public account opening remains deferred until deliberately planned.
- Web Builder is protected and must not be casually rewritten.

### Policy

1. Policy & FAQ Centre / Policy Documents — `policy-documents-centre-v7-12-119-test.html`
2. Published Policy Proof / Policy Reader — `policy-reader-v7-12-119-test.html?policy=terms`
3. Policy Admin Editor — `policy-admin-documents-v7-12-120-test.html?policy=terms`

Current Policy notes:

- Policy Centre is public preview/read-only.
- Policy Reader is public read-only and reads only published rows.
- Missing/unpublished policies show safe fallback text.
- Policy Admin Editor Centre V7.12.210 restored owner/admin editing, draft, publish, archive and reader links.
- Policy document editing is separate from Storage Prep rule planning.

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

- Admin Centre V7.12.218 is now the passed route command deck / owner launcher.
- Backup / Safety V7.12.214, Health Check V7.12.215 and Test Checklist V7.12.216 form the passed safety utility chain.
- Storage Prep V7.12.209 is now the image public-URL workshop.
- Admin Centre is link/report/check only. Working page engines stay in their own pages.

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

- Advanced Form V7.12.213 feeds Form Inbox end-to-end.
- Form Inbox V7.12.212 loads submissions, answers, messages, status changes and private replies.
- Form Inbox is functionally passed but still needs later layout/control-flow polish.
- Pages Manager remains risky and must be scanned before any pass.
- Web Builder remains risky and must not be touched casually.

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

## Confirmed working chains at V7.12.218

### Header/profile chain

- Global Account panel opens.
- Current profile/account details show.
- Profile Settings opens.
- Sign Out button is available.
- Menu, search and saved counters still work.

### Policy chain

- Policy Centre opens.
- Policy Admin opens for the owner/admin account.
- Policy rows can be edited, saved, published and archived.
- Public Reader opens selected policy.

### Storage image URL chain

- Storage Prep previews images.
- Storage Prep uploads allowed images when the current account state is active.
- Storage Prep creates public image URLs.
- URL can be copied and tested.

### Form chain

- Advanced Form loads form block from `sb_site_pages`.
- Submission saves to `sb_form_submissions`.
- Form Inbox loads the new submission.
- Answers display correctly.
- Private reply/message tools work.

### Supabase Library chain

- Supabase Library Editor loads rows from `sb_movies`.
- Search, status filter, source filter, genre filter, sort and clear filters work.
- Create overlay opens/closes.
- Edit overlay opens and fields remain present.
- Poster preview still shows.
- Copy ID works.
- Details opens.
- Play opens Player 1.
- Play All Visible opens current Player 2.
- Debug proves config source, admin profile and field keys.

### Admin Centre chain

- Admin Centre opens.
- Header, footer, saved counters and account panel work.
- Tabs open: Admin, Safety Chain, Media / Library, Owner / Builder, Policy / Users, Actions and Debug.
- Supabase Library Editor button opens current route.
- Health Check, Test Checklist, Backup / Safety and Current Registry open.
- Route check, Copy Admin Map, Download Admin Report and Refresh Helpers work.
- Debug shows V7.12.218 and `linkOnly: true`.
- Player 2 route shows `player-2-clean-machine-v7-12-58-test.html`.

## Checkpoints promoted into current truth

- `CHECKPOINT-PAUSE-END-TO-END-FORMS-POLICY-STORAGE-AUTH-V7-12-213.md`
- `CHECKPOINT-FORM-INBOX-PRIVATE-MESSAGES-PASS-V7-12-212.md`
- `CHECKPOINT-ADVANCED-FORM-END-TO-END-PASS-V7-12-213.md`
- `CHECKPOINT-BACKUP-SAFETY-OWNER-UTILITY-PASS-V7-12-214.md`
- `CHECKPOINT-HEALTH-CHECK-OWNER-DIAGNOSTIC-PASS-V7-12-215.md`
- `CHECKPOINT-TEST-CHECKLIST-OWNER-QA-UTILITY-PASS-V7-12-216.md`
- `CHECKPOINT-SUPABASE-LIBRARY-EDITOR-HAZARD-MAP-V7-12-161.md`
- `CHECKPOINT-SUPABASE-LIBRARY-EDITOR-SHELL-ROUTE-PASS-V7-12-217.md`
- `CHECKPOINT-ADMIN-CENTRE-SCAN-ONLY-V7-12-195.md`
- `CHECKPOINT-ADMIN-CENTRE-ROUTE-COMMAND-DECK-PASS-V7-12-218.md`

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

1. Fresh Current Registry / route scan when the user is ready.
2. Pages Manager hazard-map scan before any code change.
3. Web Builder remains protected until a dedicated preservation plan is ready.
4. Google Drive can be topped up from this V7.12.218 manifest if needed.

## What not to delete

- Anything listed in this manifest.
- Any page linked from the overlay menu.
- Any current shell file.
- Any current source/dependency page.
- Any asset/icon/logo used by protected pages.
- Any config source file used by current frontend.
- Any checkpoint file recording a pass from V7.12.188 through V7.12.218.
