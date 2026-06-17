# Stream Bandit Current App Manifest V7.12.300.37

Date: 2026-06-17

Filename remains `CURRENT-APP-MANIFEST-V7-12-180.md` because protected scanner pages and One Machine already reference this file.

## Current strongest pause point

`V7.12.300.37 Web Builder Header/Footer + Owned Preview Functional Pass`

The newest owner-confirmed pass is the Web Builder Header/Footer Builder to Owned Preview connection:

- `web-builder-header-footer-code-v7-12-254-test.html`
- `web-builder-preview-owned-v7-12-257-test.html?page=<slug>`
- `web-builder-global-projector-v7-12-263.js`
- `WEB-BUILDER-MANIFEST-V7-12-252.md`
- `CHECKPOINT-WEB-BUILDER-HEADER-FOOTER-PREVIEW-PASS-V7-12-300-37.md`

This is still candidate tracking only. It does not replace final live-home/root behavior. Root still redirects to Home after a short pause.

## Passed / promoted in this checkpoint

### Web Builder Header/Footer + Preview

Checkpoint file:

- `CHECKPOINT-WEB-BUILDER-HEADER-FOOTER-PREVIEW-PASS-V7-12-300-37.md`

Promotion detail:

- Header/Footer Builder saves a real builder-site shell to `sb_site_pages.settings_json.web_builder_shell`.
- Compatibility fields are mirrored to `site_name`, `footer_title`, `footer_text`, `header_footer_status`, and `header_footer_updated_at`.
- Owned Preview renders the saved header/footer shell.
- Header page tick-list links render as pill navigation.
- Header custom buttons render.
- Sub tabs / rail tabs render.
- Footer text renders.
- Footer page tick-list links render in the footer Pages group.
- Footer buttons render.
- Main page content remains intact.
- Page Menu Builder remains separate as the on-page custom menu builder.
- Preview still needs later visual tidy, but the functional loop is passed.

Safety:

- No schema change.
- No RLS change.
- No storage policy change.
- No bucket policy change.
- No service-role key.
- No payment provider.
- No DNS/domain automation.
- No destructive write.
- No final live-home replacement.

## Previous passed / promoted checkpoints

### Profile / Account Centre

Live candidate route:

- `profile-settings-live-ready-v7-12-90-test.html`

Passed source/fallback route:

- `profile-settings-complete-v7-0-4-test.html`

Promotion detail:

- The old Profile Settings URL now loads the passed Profile Account Centre on the live route without forwarding away.
- The passed Account Centre can sign in existing users, load/save profile text, handle avatar/banner URLs, export account data, and save real account deletion requests into `sb_account_deletion_requests`.
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
- No service-role key is in browser code.

### Feature Shop / Pricing Placeholder

Live candidate route:

- `plans-pricing-feature-shop-v7-11-3-test.html`

Promotion detail:

- Passed as a realistic preview-only Feature Shop / Pricing page.
- Preserves plan ideas and add-on ideas.
- Package builder totals and bundle saving preview work.
- Coming Soon preview overlay works.
- No payment provider is connected.
- No card collection, account upgrade, entitlement write, or billing write exists.

### Permissions Inspector

Live candidate route:

- `permissions-matrix-user-management-v7-11-4-test.html`

Promotion detail:

- Passed as the read-only bridge between Feature Shop, User Management, and future Supabase/RLS enforcement.
- Reads `sb_profiles` and `sb_admin_audit_log` as support context only.
- Does not write, does not call RPC, does not change billing, and does not write entitlements.

## Relevant pass commits

- `add8a8b2623a5c7037924d89158383e4d4c1142c` - Profile Account Centre live route copy.
- `506f800021ee42678492eed734aa1f3ba4ab9394` - User Management integrated delete queue.
- `a97a4dfc0a5112030e8ce02822a4d8ac6d03f78b` - Feature Shop theme rail pass.
- `7b89a12fc793773eb0ee0d595923e399309c1a91` - Permissions Inspector aligned with User Management and Feature Shop.
- `e914860cb3f03134399c69eab083cf7a55cbbaeb` - Index updated with Permissions Inspector candidate.
- `4d43c4db444f6b568031c301fb76bb96934ca7e7` - Header/Footer Builder real Supabase shell save.
- `5d68d49bdd16f7fd995ffcc956518cd563e158c1` - Web Builder global rail preview shell bridge.
- `2474665773498bb2f0e97b0ae3625b7484ae93b7` - Header/Footer + Preview checkpoint file.
- `f2f1b24faccaf38577eb74100af3047bf1567aae` - Web Builder manifest checkpoint update.

## Chat checklist status

- [x] Profile Account Centre request flow passed.
- [x] User Management integrated delete queue passed.
- [x] Feature Shop/Pricing remains preview-only and safe.
- [x] Permissions Inspector read-only reasoning passed.
- [x] Web Builder global rail group pass logged.
- [x] Menu Builder reclassified as Page Menu Builder.
- [x] Header/Footer Builder saves a real shell to Supabase.
- [x] Header/Footer page tick-list output passed.
- [x] Owned Preview renders the saved Header/Footer shell.
- [x] Web Builder manifest updated.
- [x] Current app manifest updated.
- [x] Checkpoint file created.
- [x] `index.html` candidate tracker updated.

## Payment / launch safety note

Stream Bandit remains free/preview-only for payment-related features at this checkpoint. Real commercial launch is intentionally delayed until the platform is ready, the database plan is chosen, Mux/streaming costs are planned, payment setup is implemented correctly, entitlement locks are enforced, support/refund rules exist, and the official launch checklist is passed.

No page should connect a payment provider, collect card details, create subscriptions, upgrade accounts, write paid entitlements, or promise paid creator gates before the formal launch/payment plan is approved.

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

No page change should add schema, RLS, storage policy, bucket policy, service-role, live-home replacement, or API keys.

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

### Web Builder functional pass candidates

- `web-builder-account-control-hub-v7-12-263-test.html`
- `web-builder-pages-manager-owned-v7-12-256-test.html`
- `overlay-route-truth-machine-v7-12-66-test.html?page=<slug>`
- `web-builder-preview-owned-v7-12-257-test.html?page=<slug>`
- `web-builder-menu-builder-owned-v7-12-264-test.html?page=<slug>`
- `web-builder-form-designer-owned-v7-12-258-test.html?page=<slug>`
- `web-builder-form-inbox-owned-v7-12-258-test.html?page=<slug>`
- `web-builder-assets-v7-12-252-test.html?page=<slug>`
- `web-builder-route-map-v7-12-252-test.html?page=<slug>`
- `web-builder-control-map-v7-12-253-test.html?page=<slug>`
- `web-builder-pages-source-map-v7-12-255-test.html?page=<slug>`
- `web-builder-header-footer-code-v7-12-254-test.html?page=<slug>`

### Account + User Management - 4 promoted routes

- `profile-settings-live-ready-v7-12-90-test.html`
- `user-management-dashboard-v7-11-2-test.html`
- `plans-pricing-feature-shop-v7-11-3-test.html`
- `permissions-matrix-user-management-v7-11-4-test.html`

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

Next target is to continue doing every Web Builder page properly:

1. Source Map should report `web_builder_shell` presence, counts and readiness.
2. Preview needs visual tidy/polish later, not functional rescue.
3. Page Menu Builder must stay classified as the on-page custom menu builder.
4. Domain, subdomain and hosting support remains future builder-owned product work.
5. Final live-home promotion remains owner-gated.

Do not start destructive account-delete retests unless using a spare normal account.

## Promotion status

`index.html` has been updated as a candidate tracker for the Web Builder Header/Footer + Owned Preview pass.

This is not final live-home replacement.

Root redirect remains:

`home-global-helpers-v7-4-4-test.html`
