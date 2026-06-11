# Stream Bandit Current App Manifest V7.12.269

Date: 2026-06-11

Purpose: current protected route, rollback, and recovery truth after the Web Builder core pass, Owner/Admin hard-lock pass, Player 1 / Player 2 multi-provider playback pass, and the first Group Play entitlement foundation pass. The filename remains `CURRENT-APP-MANIFEST-V7-12-180.md` because protected scanner pages already reference it.

## Current strongest pause point

Current state:

- V7.12.269 current app truth.
- Web Builder core blockers are user-tested complete for the current controlled candidate.
- Owner/Admin backend protection is the current safety pattern: only `trevieisking@gmail.com` should be able to perform owner/admin profile-management actions.
- Player 1 old route `player-one-global-helpers-v7-3-3-test.html` supports multi-provider playback and passed user testing.
- Player 2 old route `player-2-clean-machine-v7-12-58-test.html` supports mixed-provider queues and passed user testing.
- Mux/HLS/direct video keeps HTML video playback and audio boost.
- YouTube/Vimeo use iframe provider playback and provider controls.
- Supabase Library Play to Player 1 works.
- Supabase Library Play All to Player 2 works with mixed Mux and YouTube streams.
- New shared entitlement helper landed: `stream-bandit-entitlements-v7-12-269.js`.
- Supabase Group Play entitlement-backed RLS migration applied: `group_play_entitlements_rls_v7_12_269`.
- My Channel old route `my-channel-clean-machine-v7-12-47-test.html` is now entitlement-connected and profile-canonical.
- My Channel reads default channel identity from `sb_profiles.channel_name`, `sb_profiles.channel_about`, `sb_profiles.avatar_url`, and `sb_profiles.banner_url`.
- My Channel reads owned videos from `sb_movies.owner_id` only.
- My Channel no longer falls back to all channels or random/latest movies when the signed-in user has no owned content.
- Kayleigh Creator Growth test passed by debug: `plan_key=creator_growth`, `can_submit=true`, creator Group Play permissions true, admin/owner page permissions false.
- The temporary one-channel-per-owner clamp was removed by the entitlement RLS migration because final plans need channel limits, not a hard single-channel rule.
- No `index.html` promotion was done.
- Overlay URLs remain preserved.
- Next page target: `channels-global-helpers-v7-5-3-test.html` with profile-channel + entitlement rules.

## Fresh Current Routes Registry proof target

Source page: `all-pages-version-registry-v7-12-122-current-routes-test.html`

Registry page has been aligned to the Web Builder doorway pass:

- Last known registry version: `V7.12.263.8 Current Routes Registry / 51 Active Entries / 50 Unique URLs`.
- Active overlay entries: `51`.
- Unique URLs: `50`.
- Web Builder doorway route: `web-builder-account-control-hub-v7-12-263-test.html`.
- Old Web Builder live studio route remains as a redirect/fallback route, not the active menu doorway.
- Next required proof: owner/admin should run `Scan All` after the Group Play page promotions and confirm route/file bad lists are empty.

## Current promoted internal states

- `stream-bandit-entitlements-v7-12-269.js` - shared frontend Group Play entitlement resolver for plan limits, permissions JSON, account status, role, admin level and admin/owner visibility.
- Supabase migration `group_play_entitlements_rls_v7_12_269` - entitlement-backed RLS helper functions and policies for channels, playlists, playlist links, collections and collection links.
- `my-channel-clean-machine-v7-12-47-test.html` - V7.12.269 My Channel / Profile + Entitlements pass. Old URL preserved.
- `stream-bandit-header-shell-v7-12-156.js` - V7.12.237 Header Shell / Brand Profile Ownership Split.
- `stream-bandit-global-helper-loader-v7-12-126.js` - V7.12.186 Global Helper Loader / Owner Brand Route Truth.
- `web-builder-account-control-hub-v7-12-263-test.html` - Web Builder Hub / active doorway page.
- `WEB-BUILDER-MANIFEST-V7-12-252.md` - Web Builder-only manifest records the V7.12.264.16 Web Builder core blocker pass.
- `all-pages-version-registry-v7-12-122-current-routes-test.html` - V7.12.263.8 registry aligned to the Web Builder doorway route.
- `user-management-dashboard-v7-11-2-test.html` - Owner Admin Hub route; backend owner/admin RPC and trigger protection are the current safety source of truth.
- `permissions-matrix-user-management-v7-11-4-test.html` - permissions rulebook/reference page.
- `plans-pricing-feature-shop-v7-11-3-test.html` - pricing/feature shop reference page; plan/add-on UI still not billing-live.
- `profile-settings-live-ready-v7-12-90-test.html` - Profile Settings sign-out / existing-user flow and profile channel source.
- `supabase-library-home-header-form-fix-v7-12-34-test.html` - Supabase Library Editor / Shell Route Preservation.
- `player-one-global-helpers-v7-3-3-test.html` - V7.12.266 multi-provider promoted.
- `player-2-clean-machine-v7-12-58-test.html` - V7.12.267 multi-provider queue promoted.
- `channels-global-helpers-v7-5-3-test.html` - next target; must be entitlement-connected before promotion.
- `playlists-global-helpers-v7-5-2-test.html` - next Group Play target after Channels.
- `collections-clean-machine-v7-12-51-test.html` - next Group Play target after Playlists.

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

## Passed chains

### Owner/Admin hard-lock chain

- `sb_profiles` protected account fields exist for account status, admin level, permissions JSON, plan key, admin notes, managed by and managed at.
- `sb_admin_audit_log` exists for owner/admin action proof.
- `sb_is_owner()` is the reusable owner/admin gate pattern.
- `sb_profiles_protect_admin_fields_trigger` prevents normal app users from self-changing protected account/admin fields.
- `sb_owner_manage_profile()` is the intended owner-only profile-management RPC.

### Player provider chain

- Player 1 existing route `player-one-global-helpers-v7-3-3-test.html` passed as V7.12.266 multi-provider promoted.
- Player 2 existing route `player-2-clean-machine-v7-12-58-test.html` passed as V7.12.267 multi-provider queue promoted.
- Mux/HLS/direct video use HTML video and retain audio boost.
- YouTube/Vimeo use iframe providers and provider controls.
- Existing Player 1 and Player 2 URLs were preserved.

### Group Play entitlement chain

- Shared frontend resolver `stream-bandit-entitlements-v7-12-269.js` landed.
- Supabase RLS migration `group_play_entitlements_rls_v7_12_269` landed.
- Plan keys and permissions JSON now have a common meaning for frontend and backend.
- `creator_growth + can_submit=true` test for Kayleigh passed on My Channel: creator permissions true, admin/owner visibility false.
- My Channel now reads profile channel identity from `sb_profiles` and owned videos from `sb_movies.owner_id`.
- My Channel no longer falls back to all channels or all movies.
- The default channel is profile-owned; extra channels are controlled by `sb_channels` and plan limits.
- Temporary duplicate-channel hard clamp was removed by the entitlement migration.

## Current blocker and next target

Current blocker:

- Channels, Playlists and Collections still need full page connection to the shared entitlement resolver and backend policies.
- Normal creator users should only see and write their own permitted Group Play objects.
- Admin and Owner pages still need no-flash frontend gates so normal creator users cannot browse admin/owner pages even if backend functions are blocked.

Next target order:

1. `channels-global-helpers-v7-5-3-test.html`
2. `playlists-global-helpers-v7-5-2-test.html`
3. `collections-clean-machine-v7-12-51-test.html`
4. Admin/Owner frontend visibility gates

Clean rules for next pass:

1. Keep old overlay URLs intact.
2. Do not touch `index.html`.
3. Use header/page/footer only.
4. Read profile/default channel from `sb_profiles`.
5. Read owned movies from `sb_movies.owner_id`.
6. Use `stream-bandit-entitlements-v7-12-269.js` on every Group Play page.
7. Use `sb_group_play_limit(feature)` and `sb_group_play_flag(flag)` as backend truth.
8. Do not reintroduce duplicate channel creation bugs.
