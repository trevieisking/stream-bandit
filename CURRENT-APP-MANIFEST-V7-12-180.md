# Stream Bandit Current App Manifest V7.12.267

Date: 2026-06-11

Purpose: current protected route and recovery truth for Stream Bandit after the Web Builder core pass, Owner Admin hard-lock pass, and the Player 1 / Player 2 multi-provider stream playback pass. The filename remains `CURRENT-APP-MANIFEST-V7-12-180.md` because protected scanner pages already reference it.

## Current strongest pause point

Current state:

- V7.12.267 current app truth.
- Web Builder core blockers are user-tested complete for the current controlled candidate.
- Owner/Admin backend protection is now the current safety pattern: only `trevieisking@gmail.com` should be able to perform owner/admin profile-management actions.
- The reusable owner/admin lock pattern is: owner email check + owner/admin profile check + protected-field trigger + owner-only RPC check + audit log.
- The emergency SQL reset passed for the non-owner account after temporarily disabling and re-enabling the profile protection trigger for manual SQL Editor repair.
- Player 1 old route `player-one-global-helpers-v7-3-3-test.html` now supports multi-provider playback and passed user testing.
- Player 2 old route `player-2-clean-machine-v7-12-58-test.html` now supports mixed-provider queues and passed user testing.
- Mux/HLS/direct video keeps HTML video playback and audio boost.
- YouTube/Vimeo use safe iframe playback and provider controls; audio boost is disabled only for iframe provider items.
- Play from Supabase Library to Player 1 works.
- Play All from Supabase Library to Player 2 works with mixed Mux and YouTube streams.
- Supabase Library Editor itself does not need a playback rewrite tonight because the players now consume the URLs correctly.
- `index.html` was not touched.
- Footer shell was not touched.
- No Supabase schema change was done for provider playback.
- Next important repair target: restore create/edit/delete for channels, playlists and collections, and align user roles/permissions so signed-in users see and manage their own channel correctly.

## Fresh Current Routes Registry proof target

Source page: `all-pages-version-registry-v7-12-122-current-routes-test.html`

Registry page has been aligned to the Web Builder doorway pass:

- Last known registry version: `V7.12.263.8 Current Routes Registry / 51 Active Entries / 50 Unique URLs`.
- Active overlay entries: `51`.
- Unique URLs: `50`.
- Web Builder doorway route: `web-builder-account-control-hub-v7-12-263-test.html`.
- Old Web Builder live studio route remains as a redirect/fallback route, not the active menu doorway.
- Next required proof: owner/admin should run `Scan All` from the registry and confirm route/file bad lists are empty after the Owner Admin, provider-player, and Group Play permission fixes.

## Current promoted internal states

- `stream-bandit-header-shell-v7-12-156.js` - V7.12.237 Header Shell / Brand Profile Ownership Split, with Web Builder doorway route aligned to the Web Builder Hub.
- `stream-bandit-global-helper-loader-v7-12-126.js` - V7.12.186 Global Helper Loader / Owner Brand Route Truth, with global Web Builder alias aligned to the Web Builder Hub.
- `web-builder-live-studio-v7-12-116-test.html?page=test-page` - old Web Builder live studio URL now redirects to `web-builder-account-control-hub-v7-12-263-test.html`.
- `web-builder-account-control-hub-v7-12-263-test.html` - Web Builder Hub / doorway page.
- `WEB-BUILDER-MANIFEST-V7-12-252.md` - Web Builder-only manifest records the V7.12.264.16 Web Builder core blocker pass.
- `all-pages-version-registry-v7-12-122-current-routes-test.html` - V7.12.263.8 registry aligned to the Web Builder doorway route.
- `user-management-dashboard-v7-11-2-test.html` - Owner Admin Hub route; backend owner/admin RPC and trigger protection are the current safety source of truth.
- `permissions-matrix-user-management-v7-11-4-test.html` - permissions rulebook/reference page.
- `profile-settings-live-ready-v7-12-90-test.html` - Profile Settings sign-out / existing-user flow.
- `policy-admin-documents-v7-12-120-test.html?policy=terms` - Policy Admin Editor Centre restored.
- `storage-prep-global-helpers-v7-10-8-test.html` - Storage Prep Image URL Workshop.
- `web-builder-form-submissions-v7-12-94-test.html?page=test-page` - Form Inbox + Private Messages, preserved in the main app.
- `web-builder-form-save-v7-12-94-test.html?page=test-page` - Advanced Form end-to-end submission page, preserved in the main app.
- `backup-safety-global-helpers-v7-10-9-test.html` - Backup / Safety Owner Utility.
- `health-check-global-helpers-v7-10-6-test.html` - Health Check Owner Diagnostic.
- `test-checklist-global-helpers-v7-10-5-test.html` - Test Checklist Owner QA Utility.
- `supabase-library-home-header-form-fix-v7-12-34-test.html` - Supabase Library Editor / Shell Route Preservation. It can pass URLs to Player 1 and Play All queues to Player 2. No rewrite tonight.
- `player-one-global-helpers-v7-3-3-test.html` - V7.12.266 multi-provider promoted. Existing Player 1 URL preserved. Mux/HLS/direct boost preserved. YouTube/Vimeo iframe support passed.
- `player-2-clean-machine-v7-12-58-test.html` - V7.12.267 multi-provider queue promoted. Existing Player 2 URL preserved. Mixed Mux and YouTube queue support passed.
- `player-one-provider-test-v7-12-265-test.html` - temporary Player 1 provider test page; keep as backup until next cleanup pass.
- `admin-centre-command-deck-v7-12-121-test.html` - Admin Centre Route Command Deck.
- `web-builder-pages-manager-v7-12-111-test.html` - current app Pages Manager reference route.
- `watch-history-global-helpers-v7-4-0-test.html` - Watch History title cleanup full-page replacement.
- `mux-manager-global-helpers-v7-10-7-test.html` - Mux Manager shell cleanup full-page replacement.
- `favicon-app-icon-builder-v7-12-15-test.html` - Favicon / App Icon Builder shell cleanup and preview generator pass.
- `stream-bandit-brand-logo-v7-12-12.js` - Global Brand Logo Helper / Settings Read.
- `settings-brand-icons-promoted-v7-12-21-test.html` - Brand / App Icons drag/drop polish with global logo upload/save owner preserved.
- `brand-logo-helper-responsive-v7-12-20-test.html` - Brand Image Helper passed as global-logo preview/stage page.
- `accessibility-clean-machine-v7-12-44-test.html` - Accessibility global readability page with Player Comfort route preserved.
- `continue-watching-global-helpers-v7-3-9-test.html` - Continue Watching duplicate-row fix; local progress remains read-only.
- `web-builder-theme-studio-controls-v7-8-9-test.html` - Theme Studio shell/helper polish; global theme ownership preserved.
- `tools-page-original-global-pass-v7-12-136-test.html` - Tools useful toy page; Cast Writer outputs exact Details format.
- `web-builder-shared-style-preview-v7-12-117-test.html?page=test-page` - current app Published Preview full-page shell renderer.

## Current route truth by overlay group

### Watch

1. Home - `home-global-helpers-v7-4-4-test.html`
2. Library - `library-global-helpers-v7-4-8-test.html`
3. Details - `details-clean-machine-v7-12-38-test.html`
4. Player 1 - `player-one-global-helpers-v7-3-3-test.html`
5. Continue Watching - `continue-watching-global-helpers-v7-3-9-test.html`
6. Watch History - `watch-history-global-helpers-v7-4-0-test.html`
7. Watchlist - `watchlist-clean-machine-v7-12-43-test.html`
8. Favourites - `favourites-clean-machine-v7-12-41-test.html`
9. Likes / Liked - `likes-clean-machine-v7-12-42-test.html`
10. Accessibility - `accessibility-clean-machine-v7-12-44-test.html`

### Browse

1. Movie Row Editor / Supabase Library Editor - `supabase-library-home-header-form-fix-v7-12-34-test.html`
2. Genres - `genres-clean-machine-v7-12-45-test.html`
3. Global Search - `global-search-global-helpers-v7-4-9-test.html`
4. About - `about-global-helpers-v7-4-7-test.html`

### Creator

1. Submit Video - `submit-video-clean-machine-v7-12-79-test.html`
2. Rules - `rules-clean-machine-v7-12-82-test.html`
3. Review Queue - `review-queue-clean-machine-v7-12-80-publish-test.html`

### Group Play

1. Playlists - `playlists-global-helpers-v7-5-2-test.html`
2. Channels - `channels-global-helpers-v7-5-3-test.html`
3. My Channel - `my-channel-clean-machine-v7-12-47-test.html`
4. Collections - `collections-clean-machine-v7-12-51-test.html`
5. Player 2 - `player-2-clean-machine-v7-12-58-test.html`

### Settings

1. Settings / Settings Hub - `settings-platform-control-hub-v7-12-85-test.html`
2. Settings Studio / Theme Studio - `web-builder-theme-studio-controls-v7-8-9-test.html`
3. Profile Settings - `profile-settings-live-ready-v7-12-90-test.html`
4. Web Builder - `web-builder-account-control-hub-v7-12-263-test.html`

### Policy

1. Policy & FAQ Centre - `policy-documents-centre-v7-12-119-test.html`
2. Published Policy Proof - `policy-reader-v7-12-119-test.html?policy=terms`
3. Policy Admin Editor - `policy-admin-documents-v7-12-120-test.html?policy=terms`

### Admin

1. Admin Centre - `admin-centre-command-deck-v7-12-121-test.html`
2. Live Readiness - `live-readiness-global-helpers-v7-10-2-test.html`
3. Current Routes Registry - `all-pages-version-registry-v7-12-122-current-routes-test.html`
4. Test Checklist - `test-checklist-global-helpers-v7-10-5-test.html`
5. Tools - `tools-page-original-global-pass-v7-12-136-test.html`
6. Health Check - `health-check-global-helpers-v7-10-6-test.html`
7. Mux Manager - `mux-manager-global-helpers-v7-10-7-test.html`
8. Storage Prep - `storage-prep-global-helpers-v7-10-8-test.html`
9. Backup / Safety - `backup-safety-global-helpers-v7-10-9-test.html`

### Owner

1. Form Inbox - `web-builder-form-submissions-v7-12-94-test.html?page=test-page`
2. Advanced Form - `web-builder-form-save-v7-12-94-test.html?page=test-page`
3. One Machine - `stream-bandit-one-machine-v7-12-73-test.html`
4. Platform Control Centre - `settings-platform-control-hub-v7-12-85-test.html`
5. Final Shell Navigation - `stream-bandit-global-helper-shell-v7-12-126-test.html`
6. Brand / App Icons - `settings-brand-icons-promoted-v7-12-21-test.html`
7. Brand Image Helper - `brand-logo-helper-responsive-v7-12-20-test.html`
8. Favicon / App Icon Builder - `favicon-app-icon-builder-v7-12-15-test.html`
9. Pages Manager - `web-builder-pages-manager-v7-12-111-test.html`
10. Published Preview - `web-builder-shared-style-preview-v7-12-117-test.html?page=test-page`

### User Management

1. Owner Admin Hub - `user-management-dashboard-v7-11-2-test.html`
2. Pricing Matrix / Pricing Feature Shop - `plans-pricing-feature-shop-v7-11-3-test.html`
3. Permissions Matrix - `permissions-matrix-user-management-v7-11-4-test.html`

## Web Builder doorway chain

- Main app Settings -> Web Builder opens `web-builder-account-control-hub-v7-12-263-test.html`.
- Header Web Builder icon opens `web-builder-account-control-hub-v7-12-263-test.html`.
- Old live studio route `web-builder-live-studio-v7-12-116-test.html?page=test-page` redirects to the hub.
- Web Builder Hub owns the internal Web Builder navigation/favourites/projector state.
- Web Builder pages keep Web Builder branding/avatar/favicon/projector.
- Stream Bandit app pages keep Stream Bandit branding/logo/favicon.

## Passed chains

### Header/profile chain

- Global account panel opens.
- Current profile/account details show.
- Profile Settings opens.
- Sign Out is available.
- Menu, search and saved counters still work.
- Header Shell separates app brand logo ownership from profile/account avatar ownership.
- App/brand logo uses `data-sb-brand-logo` and is controlled by Brand / App Icons / Brand Logo helper.
- Account/profile avatar uses profile/account data only and does not overwrite the app logo slot.

### Form chain

- Advanced Form loads form block from `sb_site_pages`.
- Submission saves to `sb_form_submissions`.
- Form Inbox loads the new submission.
- Answers display correctly.
- Private reply/message tools work.
- Form Inbox and Advanced Form remain preserved as current app routes and Web Builder support/reference routes.

### Web Builder / Published Preview chain

- Web Builder Hub opens as the one active app doorway.
- Old Web Builder live studio wrapper redirects to the hub.
- Web Builder manifest records the Web Builder projector rollout pass.
- Real visible Studio Shell projector connection passed.
- Hub rail/avatar/favicon appear on connected Web Builder pages.
- Published Preview remains preserved at the current app reference URL.
- Builder / Advanced Form / Form Inbox links keep the selected slug where those app reference routes use `page=test-page`.

### Owner Admin hard-lock chain

- `sb_profiles` protected account fields exist for account status, admin level, permissions JSON, plan key, admin notes, managed by and managed at.
- `sb_admin_audit_log` exists for owner/admin action proof.
- `sb_is_owner()` is now the reusable owner/admin gate pattern and should be reused on every future owner/admin route.
- `sb_profiles_protect_admin_fields_trigger` prevents normal app users from self-changing protected account/admin fields.
- `sb_owner_manage_profile()` is the intended owner-only profile-management RPC.
- Manual SQL Editor repair passed by temporarily disabling the protection trigger, resetting the non-owner test account, and re-enabling the trigger.
- This lock pattern is reusable for Owner Admin Hub, Admin Centre, policy admin, storage/admin tools and future billing/account pages.

### Player provider chain

- Player 1 existing route `player-one-global-helpers-v7-3-3-test.html` passed as V7.12.266 multi-provider promoted.
- Player 2 existing route `player-2-clean-machine-v7-12-58-test.html` passed as V7.12.267 multi-provider queue promoted.
- Mux/HLS/direct video use HTML video and retain audio boost.
- YouTube/Vimeo use iframe providers and provider controls.
- YouTube/Vimeo iframe playback deliberately disables Stream Bandit audio boost only for iframe provider items.
- Mixed Player 2 queues can switch between Mux and YouTube and rebuild the correct player mode on Next / Previous.
- Existing Player 1 and Player 2 URLs were preserved.
- No Supabase schema change was required.
- No Library Editor rewrite was required tonight.

### Supabase Library chain

- Supabase Library Editor loads rows from `sb_movies`.
- Search, status filter, source filter, genre filter, sort and clear filters work.
- Create/edit overlays remain present.
- Poster preview still shows.
- Copy ID, Details, Player 1 and Play All to current Player 2 work.
- Play from Supabase Library to Player 1 works for Mux and YouTube after the player promotion.
- Play All from Supabase Library to Player 2 works with mixed Mux and YouTube streams after the player promotion.
- Current decision: do not touch the Supabase Library Editor tonight because player-side provider handling solved the playback blocker.

### Admin Centre chain

- Admin Centre opens.
- Header/footer/saved counters/account panel work.

## Current blocker and next target

Current blocker for next session:

- Group Play create/edit/delete needs restoration and permission alignment.
- Channels, Playlists and Collections must regain create/edit/delete paths.
- Signed-in users need their own channel/profile channel to show correctly after sign-up/sign-in.
- Normal users must not self-upgrade role or protected permissions.
- Creator permissions must be read consistently across Group Play pages from `sb_profiles.can_submit`, `sb_profiles.account_status`, `sb_profiles.admin_level`, `sb_profiles.role`, and `sb_profiles.permissions_json`.
- Expect more role/permission fixes across pages.

Next target:

- `channels-global-helpers-v7-5-3-test.html`
- `playlists-global-helpers-v7-5-2-test.html`
- `collections-clean-machine-v7-12-51-test.html`
- `my-channel-clean-machine-v7-12-47-test.html`

Cleanest planned fix for next session:

1. Inspect current channel, playlist, collection and My Channel pages before coding.
2. Inspect current Supabase tables and policies if page code references columns that are unclear.
3. Restore create/edit/delete as guarded full-page replacements or test pages first.
4. Use owner/admin hard-lock pattern only for owner/admin pages, not normal creator pages.
5. Use creator/user permission pattern for Group Play: signed-in, active account, allowed by `can_submit` or explicit `permissions_json` keys.
6. Ensure users can see/manage their own channel after sign-up/sign-in.
7. Ensure delete/remove actions are scoped and confirmed.
8. Test normal user, creator user and owner/admin separately before manifesting pass.
