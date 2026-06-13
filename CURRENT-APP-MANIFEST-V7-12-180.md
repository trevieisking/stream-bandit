# Stream Bandit Current App Manifest V7.12.277

Date: 2026-06-13

Filename remains `CURRENT-APP-MANIFEST-V7-12-180.md` because protected scanner pages and One Machine already reference this file.

## Current strongest pause point

`V7.12.277 Saved / Comfort Clean Navigation Group Pass`

This is the exact carry-on point after the access/security pass and the saved-page / Details / Continue Watching / Accessibility clean-navigation pass.

Do not promote `index.html` from this checkpoint. This manifest records the current safe app state before any live promotion discussion.

## Current checkpoint file

The detailed checkpoint for this pass is:

`CHECKPOINT-SAVED-COMFORT-CLEAN-NAV-GROUP-PASS-V7-12-277.md`

It was created from the older V6/V7 checkpoint pattern and replaces the smaller one-page checkpoint as the carry-on record for this full group pass.

Previous strong access checkpoint remains valid and should not be deleted:

`CHECKPOINT-ACCESS-OWNER-USER-MANAGEMENT-PAGE-POLISH-RAILS-V7-12-276.md`

## Current confirmed state

### Route and file health baseline

Last full Registry / Health baseline before this group pass:

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

Health baseline confirmed:

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

### `stream-bandit-theme-projector-v7-12-156.js`

Current role:

- Applies global theme variables.
- Accessibility now uses its local theme bridge for font scale and contrast comfort.

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

## Clean-navigation rule locked by V7.12.277

This rule is now confirmed across Details, Continue Watching, Watchlist, Favourites, Likes, and Accessibility:

- Top rail owns page-to-page navigation.
- Hero keeps only the page's real actions.
- Do not duplicate `Library`, `Watchlist`, `Favourites`, `Likes`, `Continue`, `History`, `Player 1`, or `Details` buttons inside the hero when those routes already exist in the top rail.
- Do not add a duplicate route-card tab when those routes already exist in the top rail.
- Internal tabs are for current-page content only.
- Outputs stay under the tabs they belong to.

## Exact internal tab rules

Internal tabs are for switching content inside the current page.

Placement:

- Below the hero or intro content.
- Above the content they control.

Content/output appears underneath the tabs.

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

## Current passed public watch / saved / comfort group

### Home

File:

`home-global-helpers-v7-4-4-test.html`

Current pushed state:

`V7.12.158 Home`

Commit:

`0b7b141af1f3a2d9253974ab50239dc857275b71`

Confirmed:

- Header shell.
- Theme-controlled page rail under header.
- Hero underneath page rail.
- Movie output on page.
- Saved/account quick cards.
- Footer shell.
- Stale Live Readiness button removed from public Home.

### Library

File:

`library-global-helpers-v7-4-8-test.html`

Confirmed state:

`V7.12.173 Library — PASS`

Confirmed:

- Top pill rail under header.
- Theme colours match Home / Watch History.
- Library loads movies.
- Search / genre / sort work.
- Details opens the correct movie.
- Play opens Player 1.
- Save buttons update counts.
- Header / footer / account chip work.

### Details

File:

`details-clean-machine-v7-12-38-test.html`

Current pushed state:

`V7.12.173 Details · Clean Navigation`

Commit:

`db84d50d87a75147205ea6030bfc5eb9b83bce01`

Confirmed:

- Header / footer / account chip.
- Top rail clean navigation.
- Duplicate Library action removed from Movie actions.
- Play remains.
- Refresh Details remains as a real page action.
- Save buttons work.
- Full `sb_movies` Details output remains working.

### Player 1

File:

`player-one-global-helpers-v7-3-3-test.html`

Current confirmed state:

`V7.12.268 Player 1 Source Bridge Fix — PASS`

Confirmed:

- `id + src` keeps the real movie row while source override only changes playback URL.
- Details opens the real movie.
- Watchlist / Favourite / Like use the real movie id.
- Direct `src` test still works.
- Mux / HLS / direct / YouTube / Vimeo playback preserved.
- Audio boost, fullscreen, PiP, saves, progress, and history preserved.

### Continue Watching

File:

`continue-watching-global-helpers-v7-3-9-test.html`

Current pushed state:

`V7.12.230 Continue Watching · Clean Navigation`

Commit:

`b74df0f98334cab44b081efa72cf0baa1590ffd0`

Confirmed:

- Header / footer / account chip.
- Top rail clean navigation.
- Duplicate hero route buttons removed.
- Reload Continue Rows works.
- Read-only local progress preserved.
- Dedupe preserved.
- Resume opens Player 1 correctly.
- Details opens correct movie.
- Save buttons and counts work.

### Watch History

File:

`watch-history-global-helpers-v7-4-0-test.html`

Current pushed state:

`V7.12.226 Watch History`

Commit:

`c7dec988747a9ac40ea0481f01e9775a34436ae3`

Confirmed:

- Header shell.
- Theme-controlled page rail under header.
- Hero underneath page rail.
- Internal tabs below hero.
- Overview/history/progress/debug/rules output underneath internal tabs.
- Footer shell.
- Read-only history/progress behavior preserved.

### Watchlist

File:

`watchlist-clean-machine-v7-12-43-test.html`

Current pushed state:

`V7.12.159 Watchlist · Clean Navigation`

Commit:

`0f785addcbb9d5666e8717d862cc45c43d648c64`

Confirmed:

- Header / footer / account chip.
- Top rail only; no duplicate hero route buttons.
- Reload Watchlist works.
- Saved Titles, Summary, and Rules tabs passed.
- Search and sort work.
- Details opens the right movie.
- Play opens Player 1 on the right movie.
- Save buttons and counts work.

### Favourites

File:

`favourites-clean-machine-v7-12-41-test.html`

Current pushed state:

`V7.12.159 Favourites · Clean Navigation`

Commit:

`92bf387ff63caac9803549c13c1688ca4e2255f4`

Confirmed:

- Header / footer / account chip.
- Top rail only; no duplicate hero route buttons.
- Reload Favourites works.
- Favourite Titles, Summary, and Rules tabs passed.
- Search and sort work.
- Details opens the right movie.
- Play opens Player 1 on the right movie.
- Save buttons and counts work.

### Likes

File:

`likes-clean-machine-v7-12-42-test.html`

Current pushed state:

`V7.12.158 Likes · Clean Navigation`

Commit:

`c7549319486a64c51bdd6ff0ff21f50e458b5d12`

Confirmed:

- Header / footer / account chip.
- Top rail only; no duplicate hero route buttons.
- Reload Likes works.
- Liked Titles, Summary, and Rules tabs passed.
- Search and sort work.
- Details opens the right movie.
- Play opens Player 1 on the right movie.
- Save buttons and counts work.

### Accessibility

File:

`accessibility-clean-machine-v7-12-44-test.html`

Current pushed state:

`V7.12.228 Accessibility · Clean Theme Bridge`

Commit:

`127af25e9c9d57d5e87fe67c6001d5b2d05fbcec`

Confirmed:

- Header / footer / account chip.
- Top rail clean navigation.
- No duplicate hero route buttons.
- Apply Preview works.
- Save Global Readability appears working.
- Overview, Theme Bridge, Player Comfort, State, Rules, and Checklist tabs passed.
- No Supabase writes.
- No shell rewrites.
- Theme Studio remains colour owner.

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
- Top rail owns page navigation.
- Hero only has real page actions.
- No admin/readiness/test buttons.
- Outputs stay on page.
- Save buttons use Core Saves and Menu Saves Count where relevant.
- Do not break Player Comfort, audio boost, fullscreen, accessibility, or playback.

### Browse/search pages

Examples:

- Genres
- Global Search
- About

Rules:

- Use page rail under header.
- Results/output stay on page.
- Search/filter inputs can be inline if safe.
- Remove stale route links.
- Do not duplicate route links inside hero/cards when the top rail already has them.

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

## Next work order

Continue the public browse-page polish group:

1. Genres — `genres-clean-machine-v7-12-45-test.html`
2. Global Search — `global-search-global-helpers-v7-4-9-test.html`
3. About — `about-global-helpers-v7-4-7-test.html`

Then move into creator/group-play pages only after this browse group is clean.
