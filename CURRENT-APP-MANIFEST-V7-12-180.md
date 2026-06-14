# Stream Bandit Current App Manifest V7.12.293

Date: 2026-06-13

Filename remains `CURRENT-APP-MANIFEST-V7-12-180.md` because protected scanner pages and One Machine already reference this file.

## Current strongest pause point

`V7.12.293 Creator Group Full Pass / Settings Hub Start`

Public Browse group is passed as a full group. Creator group is now passed as a full group.

Current next target:

`settings-platform-control-hub-v7-12-85-test.html`

The user supplied the current full Settings Hub page file as the source for the next full-page replacement pass.

## Current checkpoint files

Keep these current checkpoint files:

- `CHECKPOINT-SAVED-COMFORT-CLEAN-NAV-GROUP-PASS-V7-12-277.md`
- `CHECKPOINT-BROWSE-GROUP-GENRES-CLEAN-NAV-V7-12-282-PASSED.md`
- `CHECKPOINT-ACCESS-OWNER-USER-MANAGEMENT-PAGE-POLISH-RAILS-V7-12-276.md`

No new checkpoint was created for Global Search, About, Browse full-group pass, Creator Rules, Submit Video, Review Queue, Playlists, Channels, My Channel, Collections, Player 2, or the Creator full-group pass. These are recorded in this manifest only to avoid checkpoint/file-count clutter.

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

### Creator group — FULL GROUP PASS

Creator group is passed as a full group.

Passed pages:

- Rules — `rules-clean-machine-v7-12-82-test.html` — `V7.12.286 Creator Rules · Platform Truth Map`
- Submit Video — `submit-video-clean-machine-v7-12-79-test.html` — `V7.12.287 Submit Video · Clean Rail`
- Review Queue — `review-queue-clean-machine-v7-12-80-publish-test.html` — `V7.12.288 Review Queue · Clean Rail`
- Playlists — `playlists-global-helpers-v7-5-2-test.html` — `V7.12.289 Playlists · Clean Rail`
- Channels — `channels-global-helpers-v7-5-3-test.html` — `V7.12.290 Channels · Clean Rail`
- My Channel — `my-channel-clean-machine-v7-12-47-test.html` — `V7.12.291.1 My Channel · Plan Stat Wrap Fix`
- Collections — `collections-clean-machine-v7-12-51-test.html` — `V7.12.292 Collections · Clean Rail`
- Player 2 — `player-2-clean-machine-v7-12-58-test.html` — `V7.12.293 Player 2 · Clean Rail`

Creator group confirmations:

- Creator group top rail pattern is established.
- Route links moved out of heroes into top rails.
- No duplicate route tabs/buttons were added.
- Internal tabs remain current-page content only.
- Creator Rules is safe explanation only and has no dangerous action controls.
- Submit Video writes pending rows to `sb_submissions` only.
- Review Queue remains the gate that approves/declines and publishes to `sb_movies`.
- Playlists preserve `sb_playlists`, `sb_playlist_movies`, `sb_movies`, `sb_profiles`, entitlements, own-playlist rules, no Supabase Library editor access, no private fallback, and Player 2 handoff.
- Channels preserve `sb_profiles`, `sb_channels`, `sb_movies`, owned extra-channel CRUD, `sb_group_play_set_movie_channel` RPC, main/library attach fix, entitlements, no private fallback, and Player 2 handoff.
- My Channel preserves profile channel editing, clear guard when movies exist, owner-only/signed-in reads, entitlement rules, Player 2 handoff, and plan stat wrap fix.
- Collections preserve selected-card sync, Remove Collection fix, artwork upload to `stream-bandit-images`, collection create/edit/delete, `sb_collection_movies` join writes, main/library attach logic, entitlements, and Player 2 handoff.
- Player 2 preserves queue storage keys, mixed-provider playback, HLS/Mux/direct video support, YouTube/Vimeo iframe support, audio boost rules for HTML video only, iframe provider control rules, HTML video progress saving to `stream-bandit-progress-v6-73`, Next/Previous queue switching, fallback reads from `sb_movies`, and queue handoffs from Playlists, Channels, My Channel, Collections, and Supabase Library Play All.
- Player 2 custom local header/search/footer duplication was replaced with the standard helper shell pattern.
- Accessibility/audio boost/player comfort protection remains active.
- No schema changes.
- No storage policy changes.
- No RLS changes.
- No bucket name changes.
- No table-name changes.
- No Player 1 route changes.
- No Details route changes.
- No index promotion.
- No global helper rewrites.

## Settings group — next work order

Next page:

`settings-platform-control-hub-v7-12-85-test.html`

The user uploaded the current full Settings Hub page as source for the next pass.

Current supplied Settings Hub state:

`V7.12.194 Settings Hub · Header Count Fix`

Known behaviours from supplied Settings source:

- Settings Hub is a doorway page using current route truth only.
- It states it does not write to Supabase.
- It states it does not save settings directly.
- It must not hide bugs inside Theme Studio, Profile Settings or Web Builder.
- Current route buttons include Theme Studio, Profile Settings, Web Builder, and Brand / App Icons.
- It uses global theme variables and existing shell/helper patterns but needs the next clean group pass.

Needed next polish direction:

- Start Settings group from `settings-platform-control-hub-v7-12-85-test.html`.
- Add or verify the group top rail directly under header.
- Keep Settings Hub as a doorway only unless the user specifically asks to change a settings writer page.
- Do not add direct Supabase writes to Settings Hub.
- Do not hide bugs in Theme Studio, Profile Settings, Web Builder, Brand / App Icons, Brand Image Helper, or Favicon / App Icon Builder.
- Keep real page actions in hero only.
- Avoid duplicate route tabs/buttons.
- Preserve global theme, branding, accessibility, saved counts, header search, footer, account/avatar, and helper status behaviour.
- Treat Settings group as high-risk because global settings should affect other pages, not only Settings pages.
- Do not change schema, storage, RLS, bucket names, player logic, index, route registry, or global helper logic without explicit approval.

Settings group expected start:

- Settings Hub — `settings-platform-control-hub-v7-12-85-test.html` — NEXT
- Theme Studio — `web-builder-theme-studio-controls-v7-8-9-test.html`
- Profile Settings — `profile-settings-live-ready-v7-12-90-test.html`
- Web Builder — `web-builder-live-studio-v7-12-116-test.html?page=test-page`
- Brand / App Icons — `settings-brand-icons-promoted-v7-12-21-test.html`
- Brand Image Helper — route to verify in scanner/current page
- Favicon / App Icon Builder — route to verify in scanner/current page

## Later groups

After Settings group, continue into group-play and builder/admin/owner areas only after the active group is clean and user confirms pass.

No index promotion from this manifest.
