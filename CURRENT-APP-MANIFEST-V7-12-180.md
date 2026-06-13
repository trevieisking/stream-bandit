# Stream Bandit Current App Manifest V7.12.286

Date: 2026-06-13

Filename remains `CURRENT-APP-MANIFEST-V7-12-180.md` because protected scanner pages and One Machine already reference this file.

## Current strongest pause point

`V7.12.286 Creator Rules Passed / Submit Video Start`

Public Browse group is passed as a full group. Creator group has started. Creator Rules has now passed and Submit Video is the next active page.

Current next target:

`submit-video-clean-machine-v7-12-79-test.html`

The user supplied the full current Submit Video page code in chat as the source for the next full-page replacement pass.

## Current checkpoint files

Keep these current checkpoint files:

- `CHECKPOINT-SAVED-COMFORT-CLEAN-NAV-GROUP-PASS-V7-12-277.md`
- `CHECKPOINT-BROWSE-GROUP-GENRES-CLEAN-NAV-V7-12-282-PASSED.md`
- `CHECKPOINT-ACCESS-OWNER-USER-MANAGEMENT-PAGE-POLISH-RAILS-V7-12-276.md`

No new checkpoint was created for Global Search, About, Browse full-group pass, or Creator Rules. These are recorded in this manifest only to avoid checkpoint/file-count clutter.

## File-count / cleanup rule

Do not grow the repository with endless checkpoint or page files.

Normal rule:

- Update this manifest for routine carry-on memory.
- Create a new checkpoint only when the pass needs a separate record.
- If a new checkpoint is created, delete one clearly obsolete old checkpoint in the same cleanup pass.
- If a new page is needed, first look for a safe old inactive page to replace.
- Do not create new page piles like `test-1`, `test-2`, `final`, `final-2`.
- Do not overwrite protected reference pages or working fallback pages.
- Do not delete accessibility, player comfort, Supabase migration/test, upload/Mux/storage, profile/auth/avatar, global shell/helper, registry, route, manifest, backup, or current checkpoint files unless the user explicitly approves the specific deletion.

Cleanup already performed in this run:

- Created `CHECKPOINT-BROWSE-GROUP-GENRES-CLEAN-NAV-V7-12-282-PASSED.md`.
- Deleted obsolete old `CHECKPOINT-V5.24.md` to avoid file-count growth.

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
- `sb_movies` readable, count 24.
- `sb_channels` readable, count 3.
- `sb_policy_documents` readable, count 7.
- `sb_site_pages` readable, count 9.
- `sb_form_submissions` readable, count 26.

## Access / visibility model

### Owner

Owner means the platform owner account only.

Owner can see and open Owner group, User Management group, One Machine, Final Shell Navigation, Brand / App Icons, Brand Image Helper, Favicon / App Icon Builder, User Dashboard, Permissions Matrix, and platform-core owner tools.

Owner pages are visible in the overlay for the owner and hidden for everyone else.

### Admin

Admin pages are operational pages for admin/owner users. Owner pages remain separate.

Admin-locked group includes Admin Centre, Live Readiness, Current Routes Registry, Test Checklist, Tools, Health Check, Mux Manager, Storage Prep, Backup / Safety, and Policy Admin Editor.

### Creator / Builder

Creators and builders receive only plan-allowed creator, group-play, and Web Builder areas. They should not see or open owner pages.

Web Builder does not own or steal Policy Admin. Web Builder published sites should later show public policy links in published footers under Policy Agreement. Policy editing/publishing remains in Policy Admin.

### Viewer / signed out

Viewers can use watch, saved, profile, and public/read pages as allowed.

Signed-out users do not see Owner or User Management groups.

Protected direct URLs should show a clear locked/not-allowed page, not blank crash.

## Confirmed access tests

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

### `stream-bandit-menu-saves-count-v6-72-1.js`

Current role:

- Save counts for Watchlist, Favourites, and Likes.
- Owner and User Management overlay visibility filtering.
- Owner direct URL fallback lock.
- Stable owner authority retry so owner does not false-lock while Supabase Auth/profile wakes up.

Known stable direct-lock timing commit:

`1fdab4cefabb5b5bfd6758b1d48a9f671900fc62`

### Shared access / authority helpers

- `stream-bandit-protected-page-v7-12-273.js` presents admin/owner/protected page locks.
- `stream-bandit-authority-gate-v7-12-273.js` is the shared route/access decision engine.
- `stream-bandit-account-authority-v7-12-273.js` reads Supabase user and `sb_profiles` authority from the live profile row.

### Theme / search / shell helpers

- `stream-bandit-theme-projector-v7-12-156.js` applies global theme variables and supports accessibility/readability projection.
- `stream-bandit-header-shell-v7-12-156.js` owns the header shell.
- `stream-bandit-footer-shell-v7-12-156.js` owns the footer shell.
- `stream-bandit-core-saves-v6-75.js` owns Watchlist/Favourites/Likes save logic.
- `live-readiness-search-supabase-fallback-v7-12-130.js` owns header search preview, menu route sanitizer, and Global Search handoff.

### `live-readiness-search-supabase-fallback-v7-12-130.js`

Current pushed state:

`V7.12.283 Header Search Opens Global Search`

Commit:

`99b7c055ceeb5f90a47852efedd1921f8217ac0e`

Confirmed:

- Typing in the header search can still show the quick overlay preview.
- Clicking the header Search button opens `global-search-global-helpers-v7-4-9-test.html?q=SEARCH_TEXT`.
- Pressing Enter in the header search opens the same Global Search route with the `q` parameter.
- Global Search receives the query and fills its main search input.
- No Supabase writes, payments, player changes, new page file, or checkpoint file.

## Page polish standard

Every page in the final polish pass should follow this pattern where possible:

1. Header shell
2. Page navigation pill rail directly under the header
3. Hero / main page summary
4. Internal section tabs only when needed
5. Page output/content underneath the internal tabs
6. Footer shell

Page navigation rail rules:

- Top rail is for movement between related pages.
- Top rail sits directly under the header shell and above the hero.
- Top rail uses Web Builder-style pill buttons using global Theme Projector variables.
- Common shape: Back, Hub, related group pages, current page active.

Clean-navigation rule:

- Top rail owns page-to-page navigation.
- Hero keeps only real page actions.
- Do not duplicate route buttons inside hero when those routes already exist in the top rail.
- Do not add duplicate route-card tabs when those routes already exist in the top rail.
- Internal tabs are for current-page content only.
- Outputs stay under the tabs or sections they belong to.

Theme variables required for rails/tabs:

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

Inputs / outputs rule:

- Inputs and controls belong in controlled overlays, forms, or page sections depending on risk.
- Outputs/results belong on the page under the correct tab/section.
- Dangerous inputs/actions must stay behind admin/owner/protected pages.
- Public pages must not show admin/readiness/test buttons.
- Remove stale buttons, stale links, and old visual shell leftovers during each page pass.

## Current passed public Watch / Saved / Comfort group

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

## Current passed public Browse group — FULL GROUP PASS

Browse group is passed.

### Supabase Library

File:

`supabase-library-home-header-form-fix-v7-12-34-test.html`

Confirmed state:

`V7.12.34 Supabase Library Home Header Form Fix TEST — PASS`

### Genres

File:

`genres-clean-machine-v7-12-45-test.html`

Current pushed state:

`V7.12.282 Genres · Clean Navigation`

Page commit:

`b602fdb348d1b8346e988739e37a701a0896cd27`

Checkpoint commit:

`ede3343927b7a5339323a8783a1f53f22e04ebca`

Confirmed:

- Visual layout is neat and passed.
- Duplicate hero route buttons removed.
- `Reload Genres` remains as real public page action.
- `Supabase Editor` remains as admin/owner page action.
- Genre cards, movie output, Details, Player 1, saves, and counts remain working.
- Managed genre delete removes only the `sb_genres` label and does not delete/edit `sb_movies` rows.

### Global Search

File:

`global-search-global-helpers-v7-4-9-test.html`

Current confirmed state:

`V7.12.283 Global Search · Header Query Handoff`

Helper commit:

`99b7c055ceeb5f90a47852efedd1921f8217ac0e`

Confirmed:

- Header search button and Enter open Global Search with `?q=`.
- Query appears in the Global Search input automatically.
- Global Search reads `q`, `search`, `query`, `term`, and `s` query parameters.
- Top rail added under header.
- Duplicate hero route buttons removed.
- `Run Search` remains as real page action.
- Search controls, result cards, type chips, source filter, sorting, Details, Play, saves, and counts remain preserved.

### About

File:

`about-global-helpers-v7-4-7-test.html`

Current confirmed state:

`V7.12.284 About · Clean Navigation`

Confirmed:

- Top rail added under header.
- Duplicate route action removed from hero; Policy Documents moved into top rail.
- Hero keeps real page actions only: Request a Title, Contact Us, Report Playback.
- About tabs stay below the hero and control on-page sections.
- Email draft forms remain mailto-only.
- No Supabase writes, ticket creation, upload action, billing/payment, live/index promotion, or policy editing from About.

## Creator group status

Creator group has started.

### Rules — PASSED

File:

`rules-clean-machine-v7-12-82-test.html`

Current confirmed state:

`V7.12.286 Creator Rules · Platform Truth Map`

Page update method:

- Full ready copy/paste page code was supplied to the user.
- User confirmed the page passed.

Confirmed:

- Page is no longer a boring read-only placeholder.
- It is now a full Creator / Platform Truth Map.
- It explains Creator, Admin, Owner, Pricing Matrix, User Dashboard, Supabase table family, global helpers, Theme Bridge, page-owned properties, workflow, roles, and do-not rules.
- It includes Pricing Matrix route: `plans-pricing-feature-shop-v7-11-3-test.html`.
- It includes User Dashboard route: `user-management-dashboard-v7-11-2-test.html`.
- It includes Permissions Matrix route: `permissions-matrix-user-management-v7-11-4-test.html`.
- It includes Supabase table-family truth from visible table list and known app behaviour.
- It clearly states Supabase connector/table columns/RLS need direct verification later when tools reconnect.
- It keeps Rules as a safe explanation page: no submit, upload, approve, decline, publish, delete, migrate, schema, storage, policy or live/index controls.
- Header, footer, theme, core saves, menu counts, search fallback, settings, and brand helper scripts are included.
- No schema changes.
- No storage actions.
- No index promotion.
- No new checkpoint file.

## Creator group — next work order

Next page:

`submit-video-clean-machine-v7-12-79-test.html`

User supplied the current full Submit Video code in chat for the next pass.

Creator group expected pages:

- Rules — `rules-clean-machine-v7-12-82-test.html` — PASSED
- Submit Video — `submit-video-clean-machine-v7-12-79-test.html` — NEXT
- Review Queue — `review-queue-clean-machine-v7-12-80-publish-test.html`
- Playlists — `playlists-global-helpers-v7-5-2-test.html`
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

## Submit Video current source notes

Current supplied page state:

`V7.12.167 Submit Video · Overlay Form Polish`

Known behaviours from supplied code:

- Uses route `submit-video-clean-machine-v7-12-79-test.html`.
- Loads Header Shell, Footer Shell, Theme Projector, Core Saves, and Search Fallback.
- Uses overlay form for creator submission.
- Reads Supabase config from `StreamBanditSupabaseConfig`, `StreamBanditShell.config()`, or shell file fallback.
- Reads current user and attempts profile lookup from `sb_profiles` using `user_id`, `id`, `auth_user_id`, or email.
- Loads `sb_channels` for channel request list.
- Loads recent `sb_submissions` rows.
- Uploads poster image to Supabase Storage bucket `stream-bandit-images` under `creator-submissions/<owner>/...`.
- Resizes poster/artwork to 1920x1080 JPEG before upload.
- Submits one pending row to `sb_submissions`.
- Verifies inserted row by reading it back from `sb_submissions`.
- Does not write `sb_movies`; Review Queue remains the publish gate.

Needed next polish direction:

- Add Creator group top rail directly under header.
- Move route links out of hero into top rail.
- Keep real page actions in hero: Open Submit Form and Refresh Data.
- Load Menu Saves Count, Settings Global, and Brand Logo helpers to match latest pattern.
- Make helper status show Counts as well as Header/Footer/Theme/Saves/Search.
- Keep overlay scroll fix.
- Keep poster upload, pending submission insert, verification read, and Review Queue handoff intact.
- Do not change schema, storage policy, RLS, bucket name, table names, player engine, index, or global helper logic.

## Later groups

After Creator group, continue into group-play and builder/admin/owner areas only after the active group is clean and user confirms pass.

No index promotion from this manifest.
