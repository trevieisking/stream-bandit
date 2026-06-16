# Stream Bandit Current App Manifest V7.12.300.29

Date: 2026-06-16

Filename remains `CURRENT-APP-MANIFEST-V7-12-180.md` because protected scanner pages and One Machine already reference this file.

## Current strongest pause point

`V7.12.300.29 Permissions Inspector Live Candidate Pass`

The Account/Profile + User Management usefulness rail is now passed through four promoted routes:

- `profile-settings-live-ready-v7-12-90-test.html`
- `user-management-dashboard-v7-11-2-test.html`
- `plans-pricing-feature-shop-v7-11-3-test.html`
- `permissions-matrix-user-management-v7-11-4-test.html`

This is still candidate tracking only. It does not promote the root homepage/final live release. Root still redirects to Home after a short pause.

## Passed / promoted in this checkpoint

### Profile / Account Centre

Live candidate route:

- `profile-settings-live-ready-v7-12-90-test.html`

Passed source/fallback route:

- `profile-settings-complete-v7-0-4-test.html`

Promotion detail:

- The old Profile Settings URL now loads the passed Profile Account Centre on the live route without forwarding away.
- The passed Account Centre can sign in existing users, load/save profile text, handle avatar/banner URLs, export account data, and save real account deletion requests into `sb_account_deletion_requests`.
- The Account Centre delete-request overlay was confirmed visible/working on the live profile route.
- It does not delete Auth users from the browser.
- Real Auth deletion remains server-side through the Edge Function and User Management.

### User Management Dashboard

Live candidate route:

- `user-management-dashboard-v7-11-2-test.html`

Promotion detail:

- User Management includes the integrated simple delete request queue.
- It keeps users, manage selected, audit, safety and debug.
- Protected/admin/owner/platform-owner targets are decline/cancel only.
- Spare normal account targets can be deleted only through the server-side `sb-account-delete` Edge Function.
- Confirmation is only `DELETE`; no request ID or email field is required in the overlay.
- No service-role key is in browser code.

### Feature Shop / Pricing Placeholder

Live candidate route:

- `plans-pricing-feature-shop-v7-11-3-test.html`

Promotion detail:

- Passed as a realistic preview-only Feature Shop / Pricing page.
- Preserves 8 plan ideas and 24 add-on ideas.
- Package builder totals and bundle saving preview work.
- Coming Soon preview overlay works.
- Creator gate / verified access concept is preserved as a placeholder.
- Global header/footer helpers are active.
- Page search/search overlay is hidden on this page.
- Rail follows theme variables and passed the theme injector check.
- No payment provider is connected.
- No card collection, account upgrade, entitlement write, or billing write exists.
- Real launch/commercial setup is postponed until database scale, Mux plan, payment setup, support rules, entitlement locks, moderation, and owner launch approval are ready.

### Permissions Inspector

Live candidate route:

- `permissions-matrix-user-management-v7-11-4-test.html`

Promotion detail:

- Passed as the read-only bridge between Feature Shop, User Management, and future Supabase/RLS enforcement.
- Global header appears.
- Global footer appears.
- Search icon/search overlay is hidden.
- Rail appears and matches the Feature Shop style.
- Rail changes with the theme injector.
- User Management link opens correctly.
- Pricing link opens correctly.
- Refresh Inspector works.
- Live Profiles tab does not crash.
- Signed-out state stays safe.
- Owner/admin signed-in state reads visible `sb_profiles` rows.
- Feature dropdown changes the allow/lock reasoning.
- Current Controls explains `role`, `can_submit`, `plan_key`, `permissions_json`, audit and RPC clearly.
- Safety tab has no live action buttons except locked placeholders.
- Debug reports global header/footer, hidden search overlay and no Supabase writes.
- Reads `sb_profiles` and `sb_admin_audit_log` as support context only.
- Does not write, does not call RPC, does not change billing, and does not write entitlements.

## Relevant pass commits

- `add8a8b2623a5c7037924d89158383e4d4c1142c` - Profile Account Centre live route copy.
- `506f800021ee42678492eed734aa1f3ba4ab9394` - User Management integrated delete queue.
- `a97a4dfc0a5112030e8ce02822a4d8ac6d03f78b` - Feature Shop theme rail pass.
- `7b89a12fc793773eb0ee0d595923e399309c1a91` - Permissions Inspector aligned with User Management and Feature Shop.
- `e914860cb3f03134399c69eab083cf7a55cbbaeb` - Index updated with Permissions Inspector candidate.

## Chat checklist status

- [x] Profile Account Centre request flow passed.
- [x] Live Profile Settings URL now opens the Account Centre flow.
- [x] Delete request overlay available on live profile route.
- [x] User Management integrated delete queue passed.
- [x] Spare normal account deletion passed through Edge Function.
- [x] Supabase Auth user disappearance confirmed after Supabase refresh.
- [x] Kayleigh/girlfriend account preserved and explicitly protected from testing.
- [x] Feature Shop/Pricing keeps all plan and add-on ideas visible.
- [x] Feature Shop/Pricing checkout remains preview-only.
- [x] Feature Shop/Pricing global header/footer alignment passed.
- [x] Feature Shop/Pricing search overlay hidden on page passed.
- [x] Feature Shop/Pricing theme-injected rail passed.
- [x] Permissions Inspector global header/footer passed.
- [x] Permissions Inspector search overlay hidden passed.
- [x] Permissions Inspector rail and theme injector passed.
- [x] Permissions Inspector User Management and Pricing links passed.
- [x] Permissions Inspector Refresh Inspector and Live Profiles passed.
- [x] Permissions Inspector signed-out safe state passed.
- [x] Permissions Inspector owner/admin visible `sb_profiles` read passed.
- [x] Permissions Inspector feature dropdown allow/lock reasoning passed.
- [x] Permissions Inspector Current Controls and Safety tabs passed.
- [x] Permissions Inspector debug passed with no Supabase writes.
- [x] Account/Profile + User Management + Feature Shop + Permissions Inspector routes added to `index.html` as live candidates.
- [x] Current manifest checkpoint updated.

## Payment / launch safety note

Stream Bandit remains free/preview-only for payment-related features at this checkpoint. Real commercial launch is intentionally delayed until the platform is ready, the database plan is chosen, Mux/streaming costs are planned, payment setup is implemented correctly, entitlement locks are enforced, support/refund rules exist, and the official launch checklist is passed.

No page should connect a payment provider, collect card details, create subscriptions, upgrade accounts, write paid entitlements, or promise paid creator gates before the formal launch/payment plan is approved.

## Account deletion safety note

Do not use a real liked/active account as a delete test target. Keep Kayleigh/girlfriend account intact. Use only spare normal accounts for destructive delete tests.

## Current scanner rule

For every Supabase-touching page, use the owner-provided `sb_table 1` scanner before editing.

Scanner checks to preserve before any page change:

- route load status
- tables touched
- read tables
- write tables
- auth flag
- storage flag
- write flag
- RPC flag
- overlay flag
- unknown table tokens

No page change should add schema, RLS, storage policy, bucket policy, service-role, live-home promotion, or API keys.

Latest scanner supplied by owner:

`V7.12.300 SB Table Route Scanner`

Known tables include:

- `sb_admin_audit_log`
- `sb_app_settings`
- `sb_channels`
- `sb_collection_movies`
- `sb_collections`
- `sb_favourites`
- `sb_form_submissions`
- `sb_genres`
- `sb_import_batches`
- `sb_likes`
- `sb_movies`
- `sb_playlist_movies`
- `sb_playlists`
- `sb_policy_documents`
- `sb_private_messages`
- `sb_profiles`
- `sb_site_pages`
- `sb_submissions`
- `sb_user_friends`
- `sb_watch_progress`
- `sb_watchlist`

Unknown table tokens remain scanner/reference signals and must not be treated as proof of new schema work without inspecting the page source.

## Live candidate groups so far

### Account + User Management - 4 promoted routes

- `profile-settings-live-ready-v7-12-90-test.html`
- `user-management-dashboard-v7-11-2-test.html`
- `plans-pricing-feature-shop-v7-11-3-test.html`
- `permissions-matrix-user-management-v7-11-4-test.html`

Support/fallback:

- `profile-settings-complete-v7-0-4-test.html`
- `user-management-delete-simple-v7-12-300-19-test.html`

### Watch group - 10 candidates

- `home-global-helpers-v7-4-4-test.html`
- `library-global-helpers-v7-4-8-test.html`
- `details-clean-machine-v7-12-38-test.html`
- `player-one-global-helpers-v7-3-3-test.html`
- `continue-watching-global-helpers-v7-3-9-test.html`
- `watch-history-global-helpers-v7-4-0-test.html`
- `watchlist-clean-machine-v7-12-43-test.html`
- `favourites-clean-machine-v7-12-41-test.html`
- `likes-clean-machine-v7-12-42-test.html`
- `accessibility-clean-machine-v7-12-44-test.html`

### Browse group - 4 candidates

- `supabase-library-home-header-form-fix-v7-12-34-test.html`
- `genres-clean-machine-v7-12-45-test.html`
- `global-search-global-helpers-v7-4-9-test.html`
- `about-global-helpers-v7-4-7-test.html`

### Creator group - 3 candidates

- `submit-video-clean-machine-v7-12-79-test.html`
- `rules-clean-machine-v7-12-82-test.html`
- `review-queue-clean-machine-v7-12-80-publish-test.html`

### Group Play group - 5 candidates

- `playlists-global-helpers-v7-5-2-test.html`
- `channels-global-helpers-v7-5-3-test.html`
- `my-channel-clean-machine-v7-12-47-test.html`
- `collections-clean-machine-v7-12-51-test.html`
- `player-2-clean-machine-v7-12-58-test.html`

### Settings group - 4 candidates

- `settings-platform-control-hub-v7-12-85-test.html`
- `web-builder-theme-studio-controls-v7-8-9-test.html`
- `profile-settings-live-ready-v7-12-90-test.html`
- `web-builder-account-control-hub-v7-12-263-test.html`

### Policy group - 3 candidates

- `policy-documents-centre-v7-12-119-test.html`
- `policy-reader-v7-12-119-test.html?policy=terms`
- `policy-admin-documents-v7-12-120-test.html?policy=terms`

### Admin group - 9 candidates

- `admin-centre-command-deck-v7-12-121-test.html`
- `live-readiness-global-helpers-v7-10-2-test.html`
- `all-pages-version-registry-v7-12-122-current-routes-test.html`
- `test-checklist-global-helpers-v7-10-5-test.html`
- `tools-page-original-global-pass-v7-12-136-test.html`
- `health-check-global-helpers-v7-10-6-test.html`
- `mux-manager-global-helpers-v7-10-7-test.html`
- `storage-prep-global-helpers-v7-10-8-test.html`
- `backup-safety-global-helpers-v7-10-9-test.html`

## Next plan target

Next target is the Web Builder canonical usefulness pass:

1. Route Map - make route health/status useful.
2. Control Map - make ownership/control truth useful.
3. Source Map - compare source/render/publish truth.
4. Header/Footer Code - make revisioned shell code safer.
5. Menu Builder, Pages Manager, Preview and Form Designer - continue after the maps are stable.
6. Later official launch/payment plan - database capacity, Mux plan, payment setup, entitlements, support/refund rules, creator gate verification, and launch checklist.

Do not start destructive account-delete retests unless using a spare normal account.

## Promotion status

`index.html` has been updated as a candidate tracker for Profile Account Centre, User Management, Feature Shop and Permissions Inspector.

This is not final live-home promotion.

Root redirect remains:

`home-global-helpers-v7-4-4-test.html`
