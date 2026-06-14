# Stream Bandit Current App Manifest V7.12.298.2

Date: 2026-06-14

Filename remains `CURRENT-APP-MANIFEST-V7-12-180.md` because protected scanner pages and One Machine already reference this file.

## Current strongest pause point

`V7.12.298.2 Footer Messenger Passed / Web Builder Rail Check Start`

Public Browse group is passed as a full group. Creator group is passed as a full group. Settings group has started. Settings Hub, Theme Studio, Profile Settings, and the global Footer Messenger are now passed.

Current next target:

`web-builder-live-studio-v7-12-116-test.html?page=test-page`

Next step is to scan or use the current full Web Builder page source before doing the rail/live-ready check. Web Builder is expected to keep its own builder-specific shell behaviour where appropriate; this is a check pass, not a forced normal-app-shell merge.

## Current checkpoint files

Keep these current checkpoint files:

- `CHECKPOINT-SAVED-COMFORT-CLEAN-NAV-GROUP-PASS-V7-12-277.md`
- `CHECKPOINT-BROWSE-GROUP-GENRES-CLEAN-NAV-V7-12-282-PASSED.md`
- `CHECKPOINT-ACCESS-OWNER-USER-MANAGEMENT-PAGE-POLISH-RAILS-V7-12-276.md`

No new checkpoint was created for Global Search, About, Browse full-group pass, Creator Rules, Submit Video, Review Queue, Playlists, Channels, My Channel, Collections, Player 2, the Creator full-group pass, Settings Hub, Theme Studio, Profile Settings, or Footer Messenger. These are recorded in this manifest only to avoid checkpoint/file-count clutter.

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
- `stream-bandit-header-shell-v7-12-156.js` owns the header shell. Latest passed replacement: `V7.12.297.1 Header Shell / Profile Identity Image Owner`.
- `stream-bandit-footer-shell-v7-12-156.js` owns the footer shell. Latest passed replacement: `V7.12.298.2 Footer Shell / Inbox Reply Payload Fix`.
- `stream-bandit-core-saves-v6-75.js` owns Watchlist/Favourites/Likes save logic.
- `live-readiness-search-supabase-fallback-v7-12-130.js` owns header search preview, menu route sanitizer, and Global Search handoff.
- `stream-bandit-settings-global-v7-1-8.js` is the protected global settings helper.
- `stream-bandit-brand-logo-v7-12-12.js` is the protected brand/logo helper and remains the global brand owner when signed out or when no signed-in profile avatar exists.
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
- No schema, storage policy, RLS, bucket, table, Player 1, Details, index, or global-helper changes.

## Settings group status

Settings group has started.

### Settings Hub — PASSED

File: `settings-platform-control-hub-v7-12-85-test.html`

State: `V7.12.294 Settings Hub · Web Builder Doorway`

Confirmed:

- Settings Hub is a safe Web Builder doorway and Settings route map.
- Web Builder remains the primary doorway target, but it is not the only route there.
- Group top rail added directly under header.
- Route links moved out of hero into the top rail and route cards.
- Hero keeps only the real action: Refresh Foundation.
- No duplicate route tabs/buttons were added.
- Settings Hub does not write to Supabase.
- Settings Hub does not save settings directly.
- Settings Hub does not upload, delete, publish, migrate, change schema, change storage policy, change RLS, promote index, rewrite route registry, or rewrite global helpers.
- Theme Studio, Profile Settings, Web Builder, Brand/App Icons, Brand Helper, Favicon Builder, Accessibility, Policy Centre, Policy Admin, Pricing Matrix, Pages Manager, Published Preview, and User Dashboard stay visible as route owners.
- Helper status includes Shell/Header/Footer/Theme/Saves/Counts/Search/Settings/Brand.
- It does not hide bugs inside downstream pages; each Settings page must still be tested individually.

### Theme Studio — PASSED

File: `web-builder-theme-studio-controls-v7-8-9-test.html`

State: `V7.12.295 Theme Studio · Clean Rail Global Bridge`

Confirmed:

- Theme Studio remains the single owner of the Stream Bandit global colour theme.
- Settings group top rail added directly under header.
- Route links moved out of hero into the top rail or current-page route cards.
- Hero keeps only real theme actions: Apply Preview, Save Global Theme, Load Saved Theme, Reset Bandit Default.
- No duplicate route tabs/buttons were added.
- Presets, shared controls, swatches, preview, route proof, safety/ownership and debug remain current-page content.
- Shell config, Core Saves, Menu Saves Count, Settings Global, Brand Logo, Search Fallback, Header Shell and Footer Shell are loaded.
- Helper status shows Shell/Header/Footer/Theme/Saves/Counts/Search/Settings/Brand.
- Preview writes/broadcasts to local browser theme keys.
- Save Global Theme writes to Supabase `sb_app_settings.settings.streamBanditTheme` plus related builder style keys.
- Local browser keys remain: `streamBanditTheme`, `stream-bandit-theme`, `sbTheme`, `sb_theme`, `web_builder_shared_style_v7_8_8`, `web_builder_style`.
- Projected variables remain: `--accent`, `--accent2`, `--bg`, `--p`, `--p2`, `--card`, `--card2`, `--title`, `--muted`, `--btnText`, `--fontScale`, and `--line`.
- Theme Projector apply/refresh and theme-updated broadcast paths are preserved.
- Accessibility comfort/readability relationship is preserved while Theme Studio owns colour theme, font, font scale and contrast line strength.
- Brand logo and app icons remain separate and are not owned by Theme Studio.
- No schema, storage, RLS, bucket, player, index, route registry, or global helper rewrites.

### Profile Settings — PASSED

File: `profile-settings-live-ready-v7-12-90-test.html`

Passed state:

- Profile Settings page uses the rollback base from `Fix Profile Settings avatar overlay using brand upload flow`.
- Header Shell passed replacement: `stream-bandit-header-shell-v7-12-156.js` — `V7.12.297.1 Header Shell / Profile Identity Image Owner`.

Confirmed by user:

- Profile Settings is a full working pass.
- Profile Settings changes the specific signed-in user's avatar/profile identity correctly.
- Profile page and Header Shell no longer fight over the left identity image.
- The left header identity image now follows the no-war rule:
  - signed in and `sb_profiles.avatar_url` exists: show that signed-in user's profile avatar and do not expose the image as `data-sb-brand-logo`;
  - signed in and no profile avatar exists: show safe account fallback;
  - signed out: show global Stream Bandit brand logo and expose it as `data-sb-brand-logo`.
- Brand Logo helper remains the global brand owner only when signed out or when no signed-in profile avatar exists.
- Profile Settings owns profile/account visible settings, avatar upload, banner upload, Supabase Auth/profile reads, and `sb_profiles` writes.
- Profile Settings should be considered ready for live promotion from this pass unless a later scan finds a new unrelated issue.
- No further Profile Settings fixing is required from this pass.
- No schema changes.
- No storage policy changes.
- No RLS changes.
- No bucket name changes.
- No player logic changes.
- No index promotion.
- No route registry changes.

### Footer Messenger — PASSED

File: `stream-bandit-footer-shell-v7-12-156.js`

Passed state:

- `V7.12.298.2 Footer Shell / Inbox Reply Payload Fix`
- Commit: `35d25eb4a2537c004cbc7fbb88f19c463da1edf5`
- Global lightweight private-message overlay opens from the footer on pages using the global footer shell.
- `sb_private_messages` remains the real message table.
- `sb_profiles` remains the avatar/display-name source.
- `sb_user_friends` and `sb_user_blocks` support friend/block UI.
- Form Inbox remains the full management page for form submissions and private messages.

Confirmed by user:

- Footer messenger is a functional pass.
- Kayleigh can send from phone and messages arrive.
- Desktop hard refresh/cache clear confirmed the passed footer shell loaded.
- Inbox reply now works after `V7.12.298.2` payload fix.
- Friends-to-message path works.
- Form Inbox / Inbox page remains working.
- Profile Settings and Header Shell were not touched during this fix.
- No schema changes after the friend/block tables were created.
- No storage policy changes.
- No RLS changes after the friend/block table setup.
- No bucket name changes.
- No player logic changes.
- No index promotion.
- No route registry changes.

Optional future polish noted:

- User would like the global messenger entry to become a small hover/floating bubble at the bottom right of the screen. Current pass is logged as functional before that visual polish.

## Settings group — next work order

Next page:

`web-builder-live-studio-v7-12-116-test.html?page=test-page`

Needed next polish direction:

- Fetch or use the current full Web Builder source before editing.
- Web Builder is different from the rest of the app and is allowed to keep its own builder-specific shell/layout behaviour where it is intentional.
- Treat the Web Builder pass as a live-ready check and rail check, not a forced merge into the regular app page pattern.
- Verify any rails/navigation are intentional and not duplicated.
- Keep Web Builder page actions real and avoid duplicate route buttons.
- Preserve existing Web Builder page storage/read/write behaviour and preview/published route behaviour.
- Preserve theme bridge, shared style preview, page manager, builder route handoff, and current test-page behaviour.
- Preserve Supabase Auth/profile/account state and header identity image behaviour from `stream-bandit-header-shell-v7-12-156.js` `V7.12.297.1`.
- Preserve Footer Messenger state from `stream-bandit-footer-shell-v7-12-156.js` `V7.12.298.2`.
- Do not change schema, storage policy, RLS, bucket names, player logic, index, route registry, or global helper logic without explicit approval.

Settings group expected pages:

- Settings Hub — `settings-platform-control-hub-v7-12-85-test.html` — PASSED
- Theme Studio — `web-builder-theme-studio-controls-v7-8-9-test.html` — PASSED
- Profile Settings — `profile-settings-live-ready-v7-12-90-test.html` — PASSED
- Footer Messenger — `stream-bandit-footer-shell-v7-12-156.js` — PASSED
- Web Builder — `web-builder-live-studio-v7-12-116-test.html?page=test-page` — NEXT
- Brand / App Icons — `settings-brand-icons-promoted-v7-12-21-test.html`
- Brand Image Helper — `brand-logo-helper-responsive-v7-12-20-test.html`
- Favicon / App Icon Builder — `favicon-app-icon-builder-v7-12-15-test.html`

## Later groups

After Settings group, continue into group-play and builder/admin/owner areas only after the active group is clean and user confirms pass.

No index promotion from this manifest.
