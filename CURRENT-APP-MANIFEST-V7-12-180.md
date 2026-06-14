# Stream Bandit Current App Manifest V7.12.291.1

Date: 2026-06-13

Filename remains `CURRENT-APP-MANIFEST-V7-12-180.md` because protected scanner pages and One Machine already reference this file.

## Current strongest pause point

`V7.12.291.1 My Channel Passed / Collections Start`

Public Browse group is passed as a full group. Creator group has started. Creator Rules, Submit Video, Review Queue, Playlists, Channels, and My Channel have now passed.

Current next target:

`collections-clean-machine-v7-12-51-test.html`

The user supplied the current full Collections page file as the source for the next full-page replacement pass.

## Current checkpoint files

Keep these current checkpoint files:

- `CHECKPOINT-SAVED-COMFORT-CLEAN-NAV-GROUP-PASS-V7-12-277.md`
- `CHECKPOINT-BROWSE-GROUP-GENRES-CLEAN-NAV-V7-12-282-PASSED.md`
- `CHECKPOINT-ACCESS-OWNER-USER-MANAGEMENT-PAGE-POLISH-RAILS-V7-12-276.md`

No new checkpoint was created for Global Search, About, Browse full-group pass, Creator Rules, Submit Video, Review Queue, Playlists, Channels, or My Channel. These are recorded in this manifest only to avoid checkpoint/file-count clutter.

## File-count / cleanup rule

Do not grow the repository with endless checkpoint or page files. Routine carry-on memory goes into this manifest. Create a checkpoint only when a pass needs a separate record, and clear one clearly obsolete old checkpoint in the same cleanup pass. Do not create new page piles like `test-1`, `test-2`, `final`, `final-2`. Do not overwrite protected reference pages or working fallback pages. Do not remove accessibility, player comfort, Supabase migration/test, upload/Mux/storage, profile/auth/avatar, global shell/helper, registry, route, manifest, backup, or current checkpoint files unless the user explicitly approves the specific cleanup.

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

Health baseline confirmed before this page-polish group:

- Header Shell, Footer Shell, Theme Projector, Settings Global, Brand Logo, Core Saves, Menu Counts, Search Fallback, Access Gate, Supabase SDK, session/profile all loaded.
- `sb_movies` readable, count 24 before latest creator publish tests.
- `sb_channels` readable, count 3.
- `sb_policy_documents` readable, count 7.
- `sb_site_pages` readable, count 9.
- `sb_form_submissions` readable, count 26.

## Access / visibility model

Owner pages are visible in the overlay for the platform owner and hidden for everyone else. Admin pages are operational pages for admin/owner users. Creator/builders receive only plan-allowed creator, group-play, and Web Builder areas. Viewers can use watch, saved, profile, and public/read pages as allowed. Signed-out users do not see Owner or User Management groups. Protected direct URLs should show a clear locked/not-allowed page, not blank crash.

Confirmed access tests remain valid: owner can open One Machine; owner false-lock fixed; Kayleigh and signed-out users cannot see Owner/User Management; Policy Admin is owner/admin editable and locked for Kayleigh; admin utilities are locked for non-admin/non-owner users; One Machine direct fallback lock works for non-owner users.

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
- Header search helper state: `V7.12.283 Header Search Opens Global Search`, commit `99b7c055ceeb5f90a47852efedd1921f8217ac0e`.
- Stable direct-lock timing commit: `1fdab4cefabb5b5bfd6758b1d48a9f671900fc62`.

## Page polish standard

Every page in the final polish pass should follow: Header shell, page navigation pill rail directly under the header, hero/main summary, internal content tabs only when needed, page output/content underneath those tabs, Footer shell.

Clean-navigation rules:

- Top rail owns page-to-page navigation.
- Top rail sits directly under the header shell and above the hero.
- Hero keeps only real page actions.
- Do not duplicate route buttons inside hero when those routes already exist in the top rail.
- Do not add duplicate route-card tabs when those routes already exist in the top rail.
- Internal tabs are for current-page content only.
- Outputs stay under the tabs or sections they belong to.
- Rails and tabs must use global Theme Projector variables: `--accent`, `--accent2`, `--p`, `--p2`, `--line`, `--muted`, `--btnText`, `--fontScale`.
- Preferred active pill style: `linear-gradient(135deg,var(--accent),var(--accent2))`.

## Passed groups

### Public Watch / Saved / Comfort group

Passed: Home, Library, Details, Player 1, Continue Watching, Watch History, Watchlist, Favourites, Likes, Accessibility. Header/footer/account chip preserved. Details/Play routes work where relevant. Player Comfort, audio boost, fullscreen, accessibility, saves, progress, and history remain protected.

### Public Browse group — FULL GROUP PASS

Passed:

- Supabase Library — `supabase-library-home-header-form-fix-v7-12-34-test.html`
- Genres — `genres-clean-machine-v7-12-45-test.html` — `V7.12.282 Genres · Clean Navigation`
- Global Search — `global-search-global-helpers-v7-4-9-test.html` — `V7.12.283 Global Search · Header Query Handoff`
- About — `about-global-helpers-v7-4-7-test.html` — `V7.12.284 About · Clean Navigation`

Browse confirmations: top rail pattern established, duplicate hero route buttons removed, public Browse outputs remain working, no schema/storage/index promotion.

## Creator group status

### Rules — PASSED

File: `rules-clean-machine-v7-12-82-test.html`

State: `V7.12.286 Creator Rules · Platform Truth Map`

Confirmed: full Creator / Platform Truth Map; explains Creator/Admin/Owner/Pricing Matrix/User Dashboard/Supabase table family/global helpers/Theme Bridge/page-owned properties/workflow/roles/do-not rules; keeps Rules as safe explanation with no dangerous action controls.

### Submit Video — PASSED

File: `submit-video-clean-machine-v7-12-79-test.html`

State: `V7.12.287 Submit Video · Clean Rail`

Confirmed: top rail added; route links moved out of hero; hero keeps Open Submit Form and Refresh Data; inserts pending rows to `sb_submissions` only; verifies insert from `sb_submissions`; Review Queue remains `sb_movies` publish gate; a submission reached Review Queue; no schema/storage/RLS/table/player/index/global-helper changes.

### Review Queue — PASSED

File: `review-queue-clean-machine-v7-12-80-publish-test.html`

State: `V7.12.288 Review Queue · Clean Rail`

Confirmed: top rail added; no duplicate tabs; hero keeps Reload Queue only; queue list filters and selected-submission action panel remain page content; admin/owner gate preserved; reads `sb_submissions`; Approve + Publish creates/updates `sb_movies`; archive uses status `declined` plus `[ARCHIVED_FROM_QUEUE]`; published movies not removed; submit-to-review-to-Supabase-Library path passed first time; no schema/storage/RLS/table/player/index/global-helper changes.

### Playlists — PASSED

File: `playlists-global-helpers-v7-5-2-test.html`

State: `V7.12.289 Playlists · Clean Rail`

Confirmed: top rail added; route links moved out of hero; hero keeps Reload Playlists and Play Selected In Player 2; internal tabs remain current-page content only; reads `sb_playlists`, `sb_playlist_movies`, `sb_movies`, `sb_profiles`; entitlement helper preserved; own-playlist write rules preserved; no Supabase Library editor access granted; no fallback to all users' private content; Player 2 queue handoff preserved; no schema/storage/RLS/table/player/index/global-helper changes.

### Channels — PASSED

File: `channels-global-helpers-v7-5-3-test.html`

State: `V7.12.290 Channels · Clean Rail`

Confirmed: top rail added; route links moved out of hero; hero keeps Reload Channels and Play Selected In Player 2; current-page tabs only; reads `sb_profiles`, `sb_channels`, `sb_movies`; profile channel edits update `sb_profiles`; owned extra-channel CRUD preserved; attach/remove uses `sb_group_play_set_movie_channel` RPC; main/library attach fix preserved; no schema/storage/RLS/RPC/table/player/index/global-helper changes.

### My Channel — PASSED

File: `my-channel-clean-machine-v7-12-47-test.html`

State: `V7.12.291.1 My Channel · Plan Stat Wrap Fix`

Page update method:

- Full ready copy/paste page code was supplied to the user.
- User confirmed the page passed on both user account and admin/owner account.

Confirmed:

- Creator group top rail added directly under header.
- Route links moved out of hero into the top rail.
- Duplicate route action buttons/cards were removed from hero and dashboard content.
- Hero keeps real page actions only: Reload My Channel and Play My Videos In Player 2.
- Dashboard, Edit Profile Channel, My Videos, Submissions, Permissions, Rules, and Debug remain current-page content tabs.
- Shell config, Core Saves, Menu Saves Count, Settings Global, Brand Logo, Search Fallback, and Entitlements helpers are loaded.
- Helper status shows Counts as well as Header/Footer/Theme/Saves/Search/Entitlements.
- Profile channel editing preserved.
- Clear guard remains when movies exist.
- Owner-only/signed-in user data reads preserved.
- Entitlement rules preserved.
- Player 2 handoff preserved.
- Plan stat wrap fix prevents long plan names such as `platform_owner` from overflowing the dashboard card.
- Confirmed visually clean for user account and admin/owner account.
- No schema changes.
- No storage changes.
- No RLS changes.
- No table-name changes.
- No player engine changes.
- No index promotion.
- No global helper rewrites.

## Creator group — next work order

Next page:

`collections-clean-machine-v7-12-51-test.html`

The user uploaded the current full Collections page as source for the next pass.

Current supplied Collections state:

`V7.12.270.1 Collections · Remove Fix`

Known behaviours from supplied Collections source:

- Reads collections from `sb_collections`.
- Reads joins from `sb_collection_movies`.
- Reads published videos from `sb_movies`.
- Uses profile identity and entitlements.
- Supports collection browse and Player 2 queue handoff.
- Collection Studio can create/update collections according to owner/admin/entitlement rules.
- Upload artwork uses Supabase Storage bucket `stream-bandit-images` under `collections/<owner>/...`.
- Add/remove videos writes `sb_collection_movies` join rows only.
- Remove Collection deletes join rows first, then removes the collection when role/plan/RLS allows it.
- Main/library video attach logic allows own movies and Stream Bandit main/library videos for normal creators.
- Selected-card sync and Remove Collection fix are already present in the supplied source.

Needed next polish direction:

- Add Creator group top rail directly under header.
- Move route links out of hero into top rail.
- Remove Open overlay menu from hero.
- Keep real page actions in hero: Reload Collections and Play Selected In Player 2.
- Do not add duplicate route tabs/buttons.
- Preserve Browse, Collection Studio, Add / Remove Videos, Permissions, and Debug as current-page content tabs.
- Load Core Saves, Menu Saves Count, Settings Global, Brand Logo, Search Fallback, and Entitlements helpers to match latest pattern.
- Make helper status show Counts as well as Header/Footer/Theme/Saves/Search/Entitlements.
- Preserve selected-card sync, remove fix, artwork upload, create/edit/delete, add/remove joins, main library attach logic, entitlement rules, and Player 2 handoff.
- Do not change schema, storage policy, RLS, bucket name, table names, player engine, index, or global helper logic.

Creator group expected pages:

- Rules — `rules-clean-machine-v7-12-82-test.html` — PASSED
- Submit Video — `submit-video-clean-machine-v7-12-79-test.html` — PASSED
- Review Queue — `review-queue-clean-machine-v7-12-80-publish-test.html` — PASSED
- Playlists — `playlists-global-helpers-v7-5-2-test.html` — PASSED
- Channels — `channels-global-helpers-v7-5-3-test.html` — PASSED
- My Channel — `my-channel-clean-machine-v7-12-47-test.html` — PASSED
- Collections — `collections-clean-machine-v7-12-51-test.html` — NEXT
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
