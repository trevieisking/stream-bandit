# Stream Bandit Current App Manifest V7.12.264.20

Date: 2026-06-11

Purpose: current protected route and recovery truth for Stream Bandit after the Web Builder core pass, Owner Admin hard-lock pass and the next Supabase Library multi-stream URL target. The filename remains `CURRENT-APP-MANIFEST-V7-12-180.md` because protected scanner pages already reference it.

## Current strongest pause point

Current state:

- V7.12.264.20 current app truth.
- Web Builder core blockers are user-tested complete for the current controlled candidate.
- Owner/Admin backend protection is now the current safety pattern: only `trevieisking@gmail.com` should be able to perform owner/admin profile-management actions.
- The reusable owner/admin lock pattern is: owner email check + owner/admin profile check + protected-field trigger + owner-only RPC check + audit log.
- The emergency SQL reset passed for the non-owner account after temporarily disabling and re-enabling the profile protection trigger for manual SQL Editor repair.
- The `sb_profiles` account-management fields now exist: `account_status`, `admin_level`, `permissions_json`, `plan_key`, `admin_notes`, `managed_by`, `managed_at`.
- The `sb_admin_audit_log` table exists and is the owner/admin action audit target.
- Main app `Web Builder` route points to `web-builder-account-control-hub-v7-12-263-test.html`.
- Stream Bandit app branding remains app-owned and unchanged.
- Web Builder branding/projector starts inside Web Builder pages only.
- `index.html` was not touched.
- Footer shell was not touched.
- Next important repair target: Supabase Library playback/rendering must support YouTube, Vimeo and other safe stream URLs, not only Mux/HLS URLs.

## Fresh Current Routes Registry proof target

Source page: `all-pages-version-registry-v7-12-122-current-routes-test.html`

Registry page has been aligned to the Web Builder doorway pass:

- Last known registry version: `V7.12.263.8 Current Routes Registry / 51 Active Entries / 50 Unique URLs`.
- Active overlay entries: `51`.
- Unique URLs: `50`.
- Web Builder doorway route: `web-builder-account-control-hub-v7-12-263-test.html`.
- Old Web Builder live studio route remains as a redirect/fallback route, not the active menu doorway.
- Next required proof: owner/admin should run `Scan All` from the registry and confirm route/file bad lists are empty after the Owner Admin and Supabase Library fixes.

## Current promoted internal states

- `stream-bandit-header-shell-v7-12-156.js` - V7.12.237 Header Shell / Brand Profile Ownership Split, with Web Builder doorway route aligned to the Web Builder Hub.
- `stream-bandit-global-helper-loader-v7-12-126.js` - V7.12.186 Global Helper Loader / Owner Brand Route Truth, with global Web Builder alias aligned to the Web Builder Hub.
- `web-builder-live-studio-v7-12-116-test.html?page=test-page` - old Web Builder live studio URL now redirects to `web-builder-account-control-hub-v7-12-263-test.html`.
- `web-builder-account-control-hub-v7-12-263-test.html` - Web Builder Hub / doorway page.
- `WEB-BUILDER-MANIFEST-V7-12-252.md` - Web Builder-only manifest records the V7.12.264.16 Web Builder core blocker pass.
- `all-pages-version-registry-v7-12-122-current-routes-test.html` - V7.12.263.8 registry aligned to the Web Builder doorway route.
- `user-management-dashboard-v7-11-2-test.html` - Owner Admin Hub route; UI still needs the full owner-email gate page replacement, while backend owner/admin RPC and trigger protection are the current safety source of truth.
- `permissions-matrix-user-management-v7-11-4-test.html` - permissions rulebook/reference page.
- `profile-settings-live-ready-v7-12-90-test.html` - Profile Settings sign-out / existing-user flow.
- `policy-admin-documents-v7-12-120-test.html?policy=terms` - Policy Admin Editor Centre restored.
- `storage-prep-global-helpers-v7-10-8-test.html` - Storage Prep Image URL Workshop.
- `web-builder-form-submissions-v7-12-94-test.html?page=test-page` - Form Inbox + Private Messages, preserved in the main app.
- `web-builder-form-save-v7-12-94-test.html?page=test-page` - Advanced Form end-to-end submission page, preserved in the main app.
- `backup-safety-global-helpers-v7-10-9-test.html` - Backup / Safety Owner Utility.
- `health-check-global-helpers-v7-10-6-test.html` - Health Check Owner Diagnostic.
- `test-checklist-global-helpers-v7-10-5-test.html` - Test Checklist Owner QA Utility.
- `supabase-library-home-header-form-fix-v7-12-34-test.html` - Supabase Library Editor / Shell Route Preservation; next target for multi-provider stream URL rendering.
- `admin-centre-command-deck-v7-12-121-test.html` - Admin Centre Route Command Deck.
- `web-builder-pages-manager-v7-12-111-test.html` - current app Pages Manager reference route.
- `watch-history-global-helpers-v7-4-0-test.html` - Watch History title cleanup full-page replacement.
- `mux-manager-global-helpers-v7-10-7-test.html` - Mux Manager shell cleanup full-page replacement.
- `favicon-app-icon-builder-v7-12-15-test.html` - Favicon / App Icon Builder shell cleanup and preview generator pass.
- `stream-bandit-brand-logo-v7-12-12.js` - Global Brand Logo Helper / Settings Read.
- `settings-brand-icons-promoted-v7-12-21-test.html` - Brand / App Icons drag/drop polish with global logo upload/save owner preserved.
- `brand-logo-helper-responsive-v7-12-20-test.html` - Brand Image Helper passed as global-logo preview/stage page.
- `accessibility-clean-machine-v7-12-44-test.html` - Accessibility global readability page with current Player 2 route fixed.
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

### Supabase Library chain

- Supabase Library Editor loads rows from `sb_movies`.
- Search, status filter, source filter, genre filter, sort and clear filters work.
- Create/edit overlays remain present.
- Poster preview still shows.
- Copy ID, Details, Player 1 and Play All to current Player 2 work.
- Current problem to fix next: Supabase Library rendering/playback currently favors Mux/HLS stream URLs and must be upgraded to render YouTube, Vimeo and other safe stream URLs.
- Clean target: keep one canonical source resolver that detects URL provider/type, stores provider metadata safely, and sends playable URLs to Details/Player without breaking existing Mux/HLS rows.

### Admin Centre chain

- Admin Centre opens.
- Header/footer/saved counters/account panel work.

## Current blocker and next target

Current blocker:

- Supabase Library must support non-Mux stream URLs.
- YouTube, Vimeo and other safe stream URLs must render/play correctly from Supabase Library rows.
- Existing Mux/HLS behavior must not be broken.

Next target:

- `supabase-library-home-header-form-fix-v7-12-34-test.html`

Cleanest planned fix:

1. Scan the Library editor row schema and current play/render helpers.
2. Add a single provider/source resolver.
3. Detect `mux`, `hls`, `youtube`, `vimeo`, direct video file, iframe/embed URL and generic external link.
4. Keep direct `<video>` playback for Mux/HLS/MP4/WebM/MOV style URLs.
5. Use safe embed conversion for YouTube/Vimeo preview/player routes.
6. Preserve all existing Supabase fields and avoid a schema change unless the page already has provider/source fields.
7. If schema is missing provider fields, use derived provider detection first and only propose optional columns after the page works.
8. Test old Mux rows and new YouTube/Vimeo rows before manifesting pass.
