# Stream Bandit Current App Manifest V7.12.276

Date: 2026-06-12

Filename remains `CURRENT-APP-MANIFEST-V7-12-180.md` because protected scanner pages and One Machine already reference this file.

## Current strongest pause point

`V7.12.276 Access / Owner Invisible / Admin Utility Lockdown / Page Polish Rails Stable Pass`

This is the exact carry-on point after the access/security pass and the first page-polish pass.

Do not promote `index.html` from this checkpoint. This manifest records access rules, page-layout rules, and the next work order before any live promotion discussion.

## New checkpoint file

The detailed checkpoint for this pass is:

`CHECKPOINT-ACCESS-OWNER-USER-MANAGEMENT-PAGE-POLISH-RAILS-V7-12-276.md`

That checkpoint was created from the old checkpoint pattern and records the tests, role rules, layout rules, and next page order.

## Current confirmed state

### Route and file health

User ran Registry and Health after the access pass.

Confirmed:

- Registry: `V7.12.263.8 Current Routes Registry / 51 Active Entries / 50 Unique URLs`
- Overlay entries: `51`
- Unique URLs: `50`
- Routes OK: `50 / 50`
- Route bad list: empty
- Protected files OK: `16 / 16`
- Protected files bad list: empty
- Web Builder doorway: `web-builder-account-control-hub-v7-12-263-test.html`
- Old Web Builder live studio route remains fallback/redirect truth: `web-builder-live-studio-v7-12-116-test.html`
- Index promotion: `false`
- Registry promotion: `true`
- Schema changes: `false`
- Storage actions: `false`

Health confirmed:

- Main pages and admin/owner/user-management route checks loaded 200.
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

## Current access / visibility model

### Owner

Owner means the platform owner account only.

Owner can see and open:

- Owner group
- User Management group
- One Machine
- Final Shell Navigation
- Brand / App Icons
- Brand Image Helper
- Favicon / App Icon Builder
- User Dashboard
- Permissions Matrix
- platform-core owner tools

Owner pages are visible in the overlay for the owner and hidden for everyone else.

### Admin

Admin pages are operational pages for admin/owner users. Admin users may later receive controlled access to selected admin tools, but owner pages remain separate.

Current admin-locked group:

- Admin Centre
- Live Readiness
- Current Routes Registry
- Test Checklist
- Tools
- Health Check
- Mux Manager
- Storage Prep
- Backup / Safety
- Policy Admin Editor

### Creator / Builder

Creators and builders receive only plan-allowed creator, group-play, and Web Builder areas.

They should not see or open owner pages.

Web Builder does not own or steal Policy Admin. Web Builder sites should later show public policy links in published site footers under Policy Agreement. Policy editing/publishing remains in Policy Admin.

### Viewer / normal user

Viewers can use watch, saved, profile, and public/read pages as allowed.

Viewers do not see Owner or User Management groups.

### Signed out

Signed-out users do not see Owner or User Management groups.

Protected direct URLs should show a clear locked/not-allowed page. The rule is: the page exists, but this account does not have permission.

## Current passed access tests

Confirmed in live user testing:

- Owner can open One Machine consistently.
- Owner false-lock bug is fixed.
- Kayleigh cannot see Owner group.
- Kayleigh cannot see User Management group.
- Signed-out users cannot see Owner group.
- Signed-out users cannot see User Management group.
- Policy Admin is editable by owner/admin and locked for Kayleigh.
- Admin utilities are locked for non-admin/non-owner users.
- One Machine direct fallback lock works for non-owner users.

## Important current helpers

### `stream-bandit-menu-saves-count-v6-72-1.js`

Current role:

- Save counts for Watchlist, Favourites, and Likes.
- Owner and User Management overlay visibility filtering.
- Owner direct URL fallback lock.
- Stable owner authority retry so the owner does not false-lock while Supabase Auth/profile wakes up.

Known stable direct-lock timing commit:

`1fdab4cefabb5b5bfd6758b1d48a9f671900fc62`

### `stream-bandit-protected-page-v7-12-273.js`

Current role:

- Shared protected-page presenter for admin/owner/protected pages that opt in.

### `stream-bandit-authority-gate-v7-12-273.js`

Current role:

- Shared route/access decision engine.

### `stream-bandit-account-authority-v7-12-273.js`

Current role:

- Reads Supabase user and `sb_profiles` authority from the live profile row.

## Current page polish standard

Every page in the final polish pass should follow this pattern where possible:

1. Header shell
2. Page navigation pill rail directly under the header
3. Hero / main page summary
4. Internal section tabs only when the page needs them
5. Page output/content underneath the internal tabs
6. Footer shell

## Exact page navigation rail rules

The page navigation rail is for movement between related pages.

Placement:

- Directly under the header shell.
- Above the hero.

It should use Web Builder-style pill buttons, but colours must be controlled by the global Theme Projector variables.

Common shape:

- Back
- Hub
- related group pages
- current page marked active

Examples passed:

- Home V7.12.158
- Watch History V7.12.226

## Exact internal tab rules

Internal tabs are for switching content inside the current page.

Placement:

- Below the hero or intro content.
- Above the content they control.

Content/output appears underneath the tabs.

Examples:

- Overview
- Watched Titles
- Progress Rows
- Debug
- Rules

Do not move internal content tabs above the hero. The top rail is for page navigation only.

## Theme rules for tabs and rails

No hard-coded random tab colours.

All page rails and tabs must use the global theme variables:

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

Preferred inactive pill style:

- background based on `--p`
- border based on `--line` mixed with `--accent`
- text readable against the current theme

## Inputs / outputs rule

- Inputs and controls belong in controlled overlays, forms, or page rails depending on risk.
- Outputs/results belong on the page under the correct tab/section.
- Dangerous inputs/actions must stay behind admin/owner/protected pages.
- Public pages must not show admin/readiness/test buttons.
- Remove stale buttons, stale links, and old visual shell leftovers during each page pass.

## Current page polish references

### Home

File:

`home-global-helpers-v7-4-4-test.html`

Current pushed state:

`V7.12.158 Home`

Commit:

`0b7b141af1f3a2d9253974ab50239dc857275b71`

Rules proven:

- Header shell.
- Theme-controlled page rail under header.
- Hero underneath page rail.
- Movie output on page.
- Saved/account quick cards.
- Footer shell.
- Stale Live Readiness button removed from public Home.

### Watch History

File:

`watch-history-global-helpers-v7-4-0-test.html`

Current pushed state:

`V7.12.226 Watch History`

Commit:

`c7dec988747a9ac40ea0481f01e9775a34436ae3`

Rules proven:

- Header shell.
- Theme-controlled page rail under header.
- Hero underneath page rail.
- Internal tabs below hero.
- Overview/history/progress/debug/rules output underneath internal tabs.
- Footer shell.
- Read-only history/progress behavior preserved.

## Page-type rules for remaining polish

### Public Watch pages

Examples:

- Home
- Library
- Details
- Player 1
- Continue Watching
- Watch History
- Watchlist
- Favourites
- Likes
- Accessibility

Rules:

- Use page rail under header.
- No admin/readiness/test buttons.
- Outputs stay on page.
- Save buttons use Core Saves and Menu Saves Count.
- Do not break Player Comfort, audio boost, fullscreen, accessibility, or playback.

### Browse/search pages

Examples:

- Library
- Genres
- Global Search
- About

Rules:

- Use page rail under header.
- Results/output stay on page.
- Search/filter inputs can be inline if safe.
- Remove stale route links.

### Creator and Group Play pages

Examples:

- Submit Video
- Rules
- Review Queue
- Playlists
- Channels
- My Channel
- Collections
- Player 2

Rules:

- Use page rail under header.
- Internal tabs only where useful.
- Respect entitlements and RLS.
- No fallback to all users' content.
- No old one-channel clamp.
- No V5/V6 hard limits.

### Web Builder pages

Rules:

- Web Builder remains its own product area.
- Use the same pill rail style where appropriate.
- Do not let Web Builder take over global Stream Bandit branding or shell.
- Published Web Builder sites should later show published policy links in footer under Policy Agreement.
- Policy Admin remains separate and admin-only.

### Admin pages

Rules:

- Admin pages can be visible to admin/owner users.
- Normal users and creators are blocked.
- Operational/debug tabs may remain if useful, but use theme-controlled pill style.
- Writes must be intentional and described.

### Owner pages

Rules:

- Owner group visible only to platform owner.
- Owner direct URLs locked for everyone else.
- Owner pages are not normal admin pages.
- Owner tooling protects brand, route, user-management and platform-core assets.

### User Management pages

Rules:

- User Management group visible only to owner for now.
- User Dashboard and Permissions Matrix are owner-only for now.
- Pricing Matrix may remain a public/reference route only if product policy says so, but the overlay group is currently hidden from non-owner users.
- Future support/admin roles may get read-only diagnostics, not unchecked write access.

## Future official role plan

Later official product roles should become more granular:

### Owner

Everything, including owner pages, permissions, route tools, brand systems, and user management.

### Admin

Review queue, policy admin, library editor, live readiness, safe moderation/editing tools.

### Support

Read-only profile/channel/user diagnostics only.

Support must not change roles, plans, protected account fields, owner routes, or destructive data.

### Creator

Own channels, playlists, collections, submissions, and Web Builder where plan allows.

### Viewer

Watch, save, and profile basics.

## Backend authority warning

Frontend locks are not final authority for official user/profile/plan changes.

For official release, serious permission changes should flow through:

- Supabase RLS
- safe RPC functions
- audit logs
- later Edge Functions where needed

## Stale route cleanup rule

During every page polish pass:

1. Remove stale buttons from visible pages.
2. Remove stale active links from page rails and quick cards.
3. Keep old route filenames unless deliberately retired.
4. Do not delete protected reference pages casually.
5. Registry should stay 50/50 and protected files 16/16 unless a deliberate route update is made.

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

1. Supabase Library Editor - `supabase-library-home-header-form-fix-v7-12-34-test.html`
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

1. User Dashboard - `user-management-dashboard-v7-11-2-test.html`
2. Pricing Matrix / Feature Shop - `plans-pricing-feature-shop-v7-11-3-test.html`
3. Permissions Matrix - `permissions-matrix-user-management-v7-11-4-test.html`

## Next exact work order

Continue from here:

1. Library — `library-global-helpers-v7-4-8-test.html`
2. Details — `details-clean-machine-v7-12-38-test.html`
3. Player 1 — `player-one-global-helpers-v7-3-3-test.html`
4. Continue Watching — `continue-watching-global-helpers-v7-3-9-test.html`
5. Watchlist — `watchlist-clean-machine-v7-12-43-test.html`
6. Favourites — `favourites-clean-machine-v7-12-41-test.html`
7. Likes — `likes-clean-machine-v7-12-42-test.html`
8. Accessibility — `accessibility-clean-machine-v7-12-44-test.html`
9. Genres — `genres-clean-machine-v7-12-45-test.html`
10. Global Search — `global-search-global-helpers-v7-4-9-test.html`
11. About — `about-global-helpers-v7-4-7-test.html`

After public/watch polish:

1. Accessibility global effect proof
2. Theme / Settings final scan
3. Brand tools final pass
4. Web Builder footer / Policy Agreement plan
5. Published Preview footer cleanup
6. Final Registry + Health
7. Only then discuss `index.html` / live promotion

## Do not forget

- GitHub Pages live domain may cache pages; use cache-busting query strings during test.
- If GitHub update is blocked, user sends full page code and assistant returns full replacement code.
- Do not use snippets for dangerous pages.
- Do not delete old files unless confirmed dead and non-protected.
- This pass is page polish and access hardening, not database schema work.

## Result

The app now has stable access rails and a clear page-layout standard for the final live-promotion readiness pass.