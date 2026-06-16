# Stream Bandit Current App Manifest V7.12.300.28

Date: 2026-06-16

Filename remains `CURRENT-APP-MANIFEST-V7-12-180.md` because protected scanner pages and One Machine already reference this file.

## Current strongest pause point

`V7.12.300.28 Feature Shop / Pricing Live Candidate Pass`

The Profile Account Centre, User Management simple delete queue, and Feature Shop / Pricing placeholder have now been owner-tested, promoted into the `index.html` live-candidate tracker, and marked as passed in the working checklist.

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

Profile route pass commit:

- `add8a8b2623a5c7037924d89158383e4d4c1142c`

### User Management Dashboard

Live candidate route:

- `user-management-dashboard-v7-11-2-test.html`

Promotion detail:

- User Management now includes the integrated simple delete request queue.
- The tested standalone helper route remains only as fallback/reference:
  - `user-management-delete-simple-v7-12-300-19-test.html`
- The integrated page keeps User Management on its old URL.
- It keeps users, manage selected, audit, safety and debug.
- It adds Delete Requests.
- Protected/admin/owner/platform-owner targets are decline/cancel only.
- Spare normal account targets can be deleted only through the server-side `sb-account-delete` Edge Function.
- Confirmation is only `DELETE`; no request ID or email field is required in the overlay.
- No service-role key is in browser code.

User Management promotion commit:

- `506f800021ee42678492eed734aa1f3ba4ab9394`

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

Feature Shop pass commits:

- `31498c211a04387aaddf0687eb19a8f31faa34bd` - initial no-payment placeholder shop.
- `f9bb1bc6a1220e07c18d1bf201934ab33e1c7010` - full idea bank preserved.
- `c5ea6332c1f2d8de6adaef38007953593d79504f` - global header/footer aligned.
- `a97a4dfc0a5112030e8ce02822a4d8ac6d03f78b` - theme rail pass.

Index candidate tracker commits:

- `af4f72180fb9ba0e043416dd7a5945d3d37927ec`
- `54dba54b52da0fd9df32ef28d47bcf2bfa759550`
- `c3dd3b832e27003e9cd4f9b8b77a06a3e1790af0`

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
- [x] Account/Profile + User Management + Feature Shop routes added to `index.html` as live candidates.
- [x] Current manifest checkpoint updated.

## Payment / launch safety note

Stream Bandit remains free/preview-only for payment-related features at this checkpoint. Real commercial launch is intentionally delayed until the platform is ready, the database plan is chosen, Mux/streaming costs are planned, payment setup is implemented correctly, and the official launch checklist is passed.

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

Known table list still includes:

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

### Account + User Management - 3 promoted routes

- `profile-settings-live-ready-v7-12-90-test.html`
- `user-management-dashboard-v7-11-2-test.html`
- `plans-pricing-feature-shop-v7-11-3-test.html`

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

Next target is the remaining Owner usefulness rail:

1. Permissions Inspector - convert the rulebook into useful live lock reasoning.
2. Web Builder canonical pages - route map, control map, source map, header/footer code, menu builder, pages manager, preview and form designer.
3. Later official launch/payment plan - database capacity, Mux plan, payment setup, entitlements, support/refund rules, creator gate verification, and launch checklist.

Do not start destructive account-delete retests unless using a spare normal account.

## Promotion status

`index.html` has been updated as a candidate tracker for Profile Account Centre, User Management and Feature Shop.

This is not final live-home promotion.

Root redirect remains:

`home-global-helpers-v7-4-4-test.html`
