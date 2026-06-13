# Stream Bandit Current App Manifest V7.12.288

Date: 2026-06-13

Filename remains `CURRENT-APP-MANIFEST-V7-12-180.md` because protected scanner pages and One Machine already reference this file.

## Current strongest pause point

`V7.12.288 Review Queue Passed / Playlists Start`

Public Browse group is passed as a full group. Creator group has started. Creator Rules passed. Submit Video passed. Review Queue clean rail / page-content pass has now passed.

User confirmed the best test result: a creator submission moved from Submit Video into Review Queue and then through to the Supabase Library / `sb_movies` publish path on the first pass.

Current next target:

`playlists-global-helpers-v7-5-2-test.html`

## Current checkpoint files

Keep these current checkpoint files:

- `CHECKPOINT-SAVED-COMFORT-CLEAN-NAV-GROUP-PASS-V7-12-277.md`
- `CHECKPOINT-BROWSE-GROUP-GENRES-CLEAN-NAV-V7-12-282-PASSED.md`
- `CHECKPOINT-ACCESS-OWNER-USER-MANAGEMENT-PAGE-POLISH-RAILS-V7-12-276.md`

No new checkpoint was created for Global Search, About, Browse full-group pass, Creator Rules, Submit Video, or Review Queue. These are recorded in this manifest only to avoid file-count clutter.

## File-count / cleanup rule

Do not grow the repository with endless checkpoint or page files.

Normal rule:

- Update this manifest for routine carry-on memory.
- Create a new checkpoint only when the pass needs a separate record.
- If a new checkpoint is created, clear one clearly obsolete old checkpoint in the same cleanup pass.
- If a new page is needed, first look for a safe old inactive page to replace.
- Do not create new page piles like `test-1`, `test-2`, `final`, `final-2`.
- Do not overwrite protected reference pages or working fallback pages.
- Do not remove accessibility, player comfort, Supabase migration/test, upload/Mux/storage, profile/auth/avatar, global shell/helper, registry, route, manifest, backup, or current checkpoint files unless the user explicitly approves the specific cleanup.

Cleanup already performed in this run:

- Created `CHECKPOINT-BROWSE-GROUP-GENRES-CLEAN-NAV-V7-12-282-PASSED.md`.
- Cleared obsolete old `CHECKPOINT-V5.24.md` to avoid file-count growth.

## Last known route / health baseline

Last full Registry / Health baseline before this page-polish group:

- Registry: `V7.12.263.8 Current Routes Registry / 51 Active Entries / 50 Unique URLs`
- Overlay entries: `51`
- Unique URLs: `50`
- Routes OK: `50 / 50`
- Route bad list: empty
- Protected files OK: `16 / 16`
- Protected files bad list: empty
- Web Builder doorway: `web-builder-account-control-hub-v7-12-263-test.html`
- Old Web Builder live studio fallback truth: `web-builder-live-studio-v7-12-116-test.html`
- Index promotion: `false`
- Registry promotion: `true`
- Schema changes: `false`
- Storage actions: `false`

Health baseline confirmed:

- Header Shell loaded.
- Footer Shell loaded.
- Theme Projector loaded.
- Settings Global loaded.
- Brand Logo loaded.
- Core Saves loaded.
- Menu Counts loaded.
- Search Fallback loaded.
- Access Gate loaded.
- Supabase SDK loaded.
- Session signed in.
- Profile row visible.
- `sb_movies` readable, count 24 before the latest Review Queue publish test.
- `sb_channels` readable, count 3.
- `sb_policy_documents` readable, count 7.
- `sb_site_pages` readable, count 9.
- `sb_form_submissions` readable, count 26.

## Access / visibility model

Owner pages are visible in the overlay for the platform owner and hidden for everyone else. Admin pages are operational pages for admin/owner users. Creator/builders receive only plan-allowed creator, group-play, and Web Builder areas. Viewers can use watch, saved, profile, and public/read pages as allowed. Signed-out users do not see Owner or User Management groups. Protected direct URLs should show a clear locked/not-allowed page, not blank crash.

Confirmed access tests remain valid:

- Owner can open One Machine consistently.
- Owner false-lock bug is fixed.
- Kayleigh cannot see Owner group.
- Kayleigh cannot see User Management group.
- Signed-out users cannot see Owner group.
- Signed-out users cannot see User Management group.
- Policy Admin is editable by owner/admin and locked for Kayleigh.
- Admin utilities are locked for non-admin/non-owner users.
- One Machine direct fallback lock works for non-owner users.

## Important helper states

- `stream-bandit-menu-saves-count-v6-72-1.js` owns save counts, Owner/User Management overlay filtering, owner direct URL fallback lock, and owner authority retry.
- `stream-bandit-protected-page-v7-12-273.js` presents admin/owner/protected page locks.
- `stream-bandit-authority-gate-v7-12-273.js` is the shared route/access decision engine.
- `stream-bandit-account-authority-v7-12-273.js` reads Supabase user and `sb_profiles` authority from the live profile row.
- `stream-bandit-theme-projector-v7-12-156.js` applies global theme variables and supports accessibility/readability projection.
- `stream-bandit-header-shell-v7-12-156.js` owns the header shell.
- `stream-bandit-footer-shell-v7-12-156.js` owns the footer shell.
- `stream-bandit-core-saves-v6-75.js` owns Watchlist/Favourites/Likes save logic.
- `live-readiness-search-supabase-fallback-v7-12-130.js` owns header search preview, menu route sanitizer, and Global Search handoff.

Known stable direct-lock timing commit:

`1fdab4cefabb5b5bfd6758b1d48a9f671900fc62`

Current header search helper state:

`V7.12.283 Header Search Opens Global Search`

Helper commit:

`99b7c055ceeb5f90a47852efedd1921f8217ac0e`

## Page polish standard

Every page in the final polish pass should follow this pattern where possible:

1. Header shell
2. Page navigation pill rail directly under the header
3. Hero / main page summary
4. Internal section tabs only when needed
5. Page output/content underneath the internal tabs
6. Footer shell

Clean-navigation rules:

- Top rail owns page-to-page navigation.
- Top rail sits directly under the header shell and above the hero.
- Hero keeps only real page actions.
- Do not duplicate route buttons inside hero when those routes already exist in the top rail.
- Do not add duplicate route-card tabs when those routes already exist in the top rail.
- Internal tabs are for current-page content only.
- Outputs stay under the tabs or sections they belong to.
- Rails and tabs must use global Theme Projector variables.

Required variables:

- `--accent`
- `--accent2`
- `--p`
- `--p2`
- `--line`
- `--muted`
- `--btnText`
- `--fontScale`

Preferred active pill style:

`linear-gradient(135deg,var(--accent),var(--accent2))`

## Passed groups

### Public Watch / Saved / Comfort group

Passed pages:

- Home — `home-global-helpers-v7-4-4-test.html`
- Library — `library-global-helpers-v7-4-8-test.html`
- Details — `details-clean-machine-v7-12-38-test.html`
- Player 1 — `player-one-global-helpers-v7-3-3-test.html`
- Continue Watching — `continue-watching-global-helpers-v7-3-9-test.html`
- Watch History — `watch-history-global-helpers-v7-4-0-test.html`
- Watchlist — `watchlist-clean-machine-v7-12-43-test.html`
- Favourites — `favourites-clean-machine-v7-12-41-test.html`
- Likes — `likes-clean-machine-v7-12-42-test.html`
- Accessibility — `accessibility-clean-machine-v7-12-44-test.html`

Protected confirmations:

- Header/footer/account chip preserved.
- Top rail clean navigation pattern is established.
- Save buttons and counts work where relevant.
- Details and Play routes work where relevant.
- Player Comfort, audio boost, fullscreen, accessibility, saves, progress, and history remain protected.

### Public Browse group — FULL GROUP PASS

Browse group is passed.

- Supabase Library — `supabase-library-home-header-form-fix-v7-12-34-test.html` — PASS
- Genres — `genres-clean-machine-v7-12-45-test.html` — `V7.12.282 Genres · Clean Navigation` — PASS
- Global Search — `global-search-global-helpers-v7-4-9-test.html` — `V7.12.283 Global Search · Header Query Handoff` — PASS
- About — `about-global-helpers-v7-4-7-test.html` — `V7.12.284 About · Clean Navigation` — PASS

Browse confirmations:

- Top rail pattern is established.
- Duplicate hero route buttons removed.
- Public Browse page outputs remain working.
- No schema changes.
- No storage actions.
- No index promotion.

## Creator group status

Creator group has started.

### Rules — PASSED

File:

`rules-clean-machine-v7-12-82-test.html`

Current confirmed state:

`V7.12.286 Creator Rules · Platform Truth Map`

Confirmed:

- Rules is now a full Creator / Platform Truth Map.
- It explains Creator, Admin, Owner, Pricing Matrix, User Dashboard, Supabase table family, global helpers, Theme Bridge, page-owned properties, workflow, roles, and do-not rules.
- It includes Pricing Matrix route: `plans-pricing-feature-shop-v7-11-3-test.html`.
- It includes User Dashboard route: `user-management-dashboard-v7-11-2-test.html`.
- It includes Permissions Matrix route: `permissions-matrix-user-management-v7-11-4-test.html`.
- It includes Supabase table-family truth from visible table list and known app behaviour.
- It clearly states Supabase connector/table columns/RLS need direct verification later when tools reconnect.
- It keeps Rules as safe explanation: no submit, upload, approve, decline, publish, queue cleanup, migrate, schema, storage, policy or live/index controls.

### Submit Video — PASSED

File:

`submit-video-clean-machine-v7-12-79-test.html`

Current confirmed state:

`V7.12.287 Submit Video · Clean Rail`

Confirmed:

- Creator group top rail added directly under header.
- Route links moved out of hero into the top rail.
- No duplicate route tabs/buttons in the hero.
- Hero keeps real page actions only: Open Submit Form and Refresh Data.
- Menu Saves Count, Settings Global, and Brand Logo helpers are included.
- Helper status shows Counts as well as Header/Footer/Theme/Saves/Search.
- Overlay scroll fix remains.
- Poster upload remains to Supabase Storage bucket `stream-bandit-images` under `creator-submissions/<owner>/...`.
- Poster/artwork resize remains 1920x1080 JPEG before upload.
- Pending submission insert remains to `sb_submissions` only.
- Insert verification read remains from `sb_submissions`.
- Review Queue remains the `sb_movies` publish gate.
- User confirmed a submission reached Review Queue.
- No schema, storage policy, RLS, bucket, table-name, player, index, or global-helper changes.

### Review Queue — PASSED

File:

`review-queue-clean-machine-v7-12-80-publish-test.html`

Current confirmed state:

`V7.12.288 Review Queue · Clean Rail`

Confirmed:

- Creator group top rail added directly under header.
- Route links moved out of hero into the top rail.
- No duplicate tabs were added.
- Hero keeps only the real page action: Reload Queue.
- Queue list filters and selected-submission action panel remain page content.
- Menu Saves Count, Settings Global, and Brand Logo helpers are included.
- Helper status shows Counts as well as Header/Footer/Theme/Saves/Search.
- Admin/owner role gate is preserved.
- Review Queue still reads `sb_submissions`.
- Approve + Publish creates or updates `sb_movies`.
- Approve Only updates `sb_submissions` to approved without publishing.
- Decline updates `sb_submissions` to declined with reason.
- Archive From Queue uses allowed status `declined` plus `[ARCHIVED_FROM_QUEUE]` marker in `decline_reason`.
- Active queue hides archived submissions while keeping published movies safe.
- Published movies are not removed.
- Source type inference remains mux/hls/url.
- User confirmed the submit-to-review-to-Supabase-Library path passed first time.
- No schema, storage, RLS, table-name, player, index, or global-helper changes.

## Creator group — next work order

Next page:

`playlists-global-helpers-v7-5-2-test.html`

Creator group expected pages:

- Rules — `rules-clean-machine-v7-12-82-test.html` — PASSED
- Submit Video — `submit-video-clean-machine-v7-12-79-test.html` — PASSED
- Review Queue — `review-queue-clean-machine-v7-12-80-publish-test.html` — PASSED
- Playlists — `playlists-global-helpers-v7-5-2-test.html` — NEXT
- Channels — `channels-global-helpers-v7-5-3-test.html`
- My Channel — `my-channel-clean-machine-v7-12-47-test.html`
- Collections — `collections-clean-machine-v7-12-51-test.html`
- Player 2 — `player-2-clean-machine-v7-12-58-test.html`

Creator group rules:

- Use page rail under header.
- Internal tabs only where useful.
- Respect entitlements and RLS.
- No fallback to all users' content.
- No old one-channel clamp.
- No V5/V6 hard limits.
- Keep creator/admin responsibilities separate.
- Submit Video writes pending rows to `sb_submissions` only.
- Review Queue is the gate that approves/declines and publishes to `sb_movies`.
- Supabase Library Editor is final cleanup for published `sb_movies` rows.
- Creator Rules is the platform truth map: safe explanation only, no dangerous action controls.

## Later groups

After Creator group, continue into group-play and builder/admin/owner areas only after the active group is clean and user confirms pass.

No index promotion from this manifest.
