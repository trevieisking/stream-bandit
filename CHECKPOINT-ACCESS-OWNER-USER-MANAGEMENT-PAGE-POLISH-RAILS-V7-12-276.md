# Stream Bandit Checkpoint — Access / Owner Visibility / Page Polish Rails V7.12.276

Date: 2026-06-12

## Status

PASS.

This checkpoint records the stable rail after the access/security pass and the first page-polish pass. It is the carry-on point before the remaining live-promotion polish work.

## Strong pause point

Current stable carry-on name:

`V7.12.276 Access / Owner Invisible / Admin Utility Lockdown / Page Polish Rails Stable Pass`

Do not promote `index.html` from this checkpoint. This is a controlled app-shell, access, and page-layout checkpoint only.

## Confirmed access model

### Owner

Owner is the platform owner account only.

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
- other owner-only platform tools

Owner pages are visible in the overlay for the owner and hidden for everyone else.

### Admin

Admin pages are admin/owner operational pages. Admin users may later receive controlled access, but owner pages remain separate and private to the platform owner.

Current admin-locked pages include:

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

Creators and builders should get only their plan-allowed creator, group-play, or Web Builder areas.

They should not see or open owner pages.

Web Builder must not steal Policy Admin. Web Builder sites should later display public policy links in the published site footer under a Policy Agreement area. Policy editing/publishing stays in Policy Admin.

### Normal user / viewer

Normal users can use watch, saved, profile, and public/read pages as allowed.

They do not see Owner or User Management groups.

### Signed out

Signed-out users do not see Owner or User Management groups.

Protected direct URLs should show a clear locked/not-allowed page, not a broken or blank page.

## Confirmed user tests from this pass

### Registry

User ran Current Routes Registry after the access pass.

Result:

- Version: `V7.12.263.8 Current Routes Registry / 51 Active Entries / 50 Unique URLs`
- Overlay entries: `51`
- Unique URLs: `50`
- Routes OK: `50 / 50`
- Route bad list: empty
- Protected files OK: `16 / 16`
- Protected files bad list: empty
- Web Builder doorway: `web-builder-account-control-hub-v7-12-263-test.html`
- Index promotion: `false`
- Registry promotion: `true`
- Schema changes: `false`
- Storage actions: `false`

### Health

User ran Health Check after the access pass.

Confirmed:

- Home loaded 200
- Library loaded 200
- Admin Centre loaded 200
- Live Readiness loaded 200
- Current Registry loaded 200
- Test Checklist loaded 200
- Tools loaded 200
- Backup / Safety loaded 200
- Storage Prep loaded 200
- Policy Admin loaded 200
- Form Inbox loaded 200
- Advanced Form loaded 200
- User Dashboard loaded 200
- Pricing Feature Shop loaded 200
- Permissions Matrix loaded 200
- Header Shell loaded 200
- Footer Shell loaded 200
- Theme Projector loaded 200
- Settings Global loaded 200
- Brand Logo loaded 200
- Menu Saves Count loaded 200
- Core Saves loaded 200
- Search Fallback loaded 200
- Supabase Config Bridge loaded 200
- Global Helper Loader loaded 200
- Manifest loaded 200
- Index Map loaded 200
- Supabase SDK loaded
- Access Gate loaded
- Session signed in
- Profile row visible
- `sb_movies` readable, count 24
- `sb_channels` readable, count 3
- `sb_policy_documents` readable, count 7
- `sb_site_pages` readable, count 9
- `sb_form_submissions` readable, count 26

## Direct access and visibility tests

Confirmed in live testing:

- Owner account can open One Machine consistently.
- Owner false-lock bug is fixed.
- Kayleigh cannot see the Owner group.
- Kayleigh cannot see the User Management group.
- Signed-out users cannot see the Owner group.
- Signed-out users cannot see the User Management group.
- Direct owner fallback lock is working from One Machine.

The direct lock should stay as a permission explanation, not a silent disappearance. The message means: this page exists, but this account does not have permission.

## Important helper updates in this pass

### `stream-bandit-menu-saves-count-v6-72-1.js`

Current important role:

- Still manages save counts.
- Hides owner-only and user-management links for non-owner users.
- Adds stable owner direct URL lock.
- Uses stable authority behavior so owner does not false-lock before Supabase Auth/profile wakes up.

Known good commit for stable owner-direct-lock timing:

`1fdab4cefabb5b5bfd6758b1d48a9f671900fc62`

### Policy Admin

`policy-admin-documents-v7-12-120-test.html`

Confirmed:

- Owner/admin can edit/view/publish policy documents.
- Kayleigh sees an admin-only locked message.
- Public Policy Centre and Public Reader remain open.

## Page polish standard created in this pass

The final page layout standard is now:

1. Header shell
2. Page navigation pill rail directly under the header
3. Hero / main page summary
4. Internal section tabs only when the page needs them
5. Page output/content underneath the section tabs
6. Footer shell

This must be applied page-by-page during the live-promotion polish pass.

## Exact tab and page-rail rules

### Page navigation rail

Use for page-to-page movement.

Placement:

- Directly under the header shell.
- Above the hero.

Example shape:

- Back
- Hub
- related page links for that group
- current page marked active

Examples already passed:

- Home V7.12.158
- Watch History V7.12.226

### Internal tabs

Use only for switching sections inside the current page.

Placement:

- In the middle of the page below the hero or intro content.
- The tab output/content must appear underneath those tabs.

Examples:

- Overview
- Watched Titles
- Progress Rows
- Debug
- Rules

### Theme rules

No hard-coded random tab colours.

All page rails and tabs must follow the global Theme Projector variables:

- `--accent`
- `--accent2`
- `--p`
- `--p2`
- `--line`
- `--muted`
- `--btnText`
- `--fontScale`

If a page has tabs or page rails, the active pill should use `linear-gradient(135deg,var(--accent),var(--accent2))` unless a page has a strong reason not to.

### Interaction rules

- Inputs belong in controlled overlays or clear forms.
- Outputs/results belong on the page.
- Dangerous admin/owner writes stay behind protected routes.
- Public pages should not expose admin/readiness/test controls.
- Remove stale route buttons and old visual shell leftovers during each page pass.
- Keep old route filenames unless a route has been deliberately retired and is proven inactive.

## Current polish references

### Home

File:

`home-global-helpers-v7-4-4-test.html`

Current tested/pushed state:

`V7.12.158 Home`

Commit:

`0b7b141af1f3a2d9253974ab50239dc857275b71`

Confirmed intent:

- Header shell
- Theme-controlled page rail
- Hero
- Movie cards/output
- Saved/account route cards
- Footer shell
- Stale Live Readiness button removed from public Home

### Watch History

File:

`watch-history-global-helpers-v7-4-0-test.html`

Current tested/pushed state:

`V7.12.226 Watch History`

Commit:

`c7dec988747a9ac40ea0481f01e9775a34436ae3`

Confirmed intent:

- Header shell
- Theme-controlled page rail under header
- Hero
- Internal section tabs below hero
- Overview/history/progress/debug/rules output under tabs
- Footer shell
- Read-only history/progress behavior preserved

## Page-type rules for the coming pass

### Public watch pages

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

- Public/watch pages use page rail under header.
- Public pages should not show admin tools or readiness buttons.
- Movie/result outputs stay on page.
- Save buttons use shared Core Saves and Menu Saves Count helpers.
- Player comfort and accessibility must not be broken.

### Browse/search pages

Examples:

- Library
- Genres
- Global Search
- About

Rules:

- Page rail under header.
- Search/filter controls may be inline if safe and simple.
- Results stay on page.
- No stale old route links.

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

- Page rail under header.
- Internal tabs only when needed.
- Inputs/actions should be clear and controlled.
- Respect entitlement helper and RLS rules.
- No fallback to all users' content.
- No old one-channel clamp or V5/V6 hard limits.

### Web Builder pages

Rules:

- Web Builder remains its own product area.
- Web Builder page navigation can use the same pill rail pattern.
- Web Builder should not take over the global app shell or global branding.
- Web Builder should later show published policy links in site footers under Policy Agreement.
- Policy Admin remains admin-only and separate.

### Admin pages

Rules:

- Admin pages can be visible to admin/owner users.
- Normal users and creators should be blocked.
- Admin pages can keep operational/debug tabs if useful, but must use theme-controlled pill style.
- Writes must be intentional and described on the page.

### Owner pages

Rules:

- Owner group visible only to platform owner.
- Owner direct URLs locked for everyone else.
- Owner pages should not be visible to normal admins unless deliberately changed later.
- Owner tooling protects brand, route, user management and platform-core assets.

### User Management pages

Rules:

- User Management group visible only to owner for now.
- Pricing Matrix may remain a public/reference route only if product policy says so, but the current overlay group is hidden from non-owner users.
- User Dashboard and Permissions Matrix are owner-only for now.
- Later official support/admin roles may get read-only diagnostics, not unchecked write access.

## Future official role plan

Later, when the app becomes official, roles should be more granular:

### Owner

Everything, including owner pages, permissions, route tools, brand systems, and user management.

### Admin

Review queue, policy admin, library editor, live readiness, safe moderation/editing tools.

### Support

Read-only profile/channel/user diagnostics.

Support must not change roles, plans, protected account fields, owner routes, or destructive data.

### Creator

Own channels, playlists, collections, submissions, and Web Builder where the plan allows.

### Viewer

Watch, save, profile basics.

## Backend authority warning

Do not let frontend-only pages become the final authority for role/plan changes.

For official release, serious account/profile/channel permission changes should flow through:

- Supabase RLS
- safe RPC functions
- audit logs
- later Edge Functions where needed

Frontend gates protect the build while the platform is being prepared. Backend policies must remain the final authority for official users.

## Stale route cleanup rule

During every page polish pass:

1. Remove stale buttons from the visible page.
2. Remove stale active links from page rails and quick cards.
3. Keep old files unless they are proven dead and not a protected reference/rollback file.
4. Do not delete protected reference pages casually.
5. Registry should stay 50/50 and protected files 16/16 unless a deliberate route update is made.

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

After the public/watch polish pass:

1. Accessibility global effect proof
2. Theme / Settings final scan
3. Brand tools final pass
4. Web Builder footer / Policy Agreement plan
5. Published Preview footer cleanup
6. Final Registry + Health
7. Only then discuss index/live promotion

## Safety notes

- No `index.html` promotion was done in this checkpoint.
- No schema migration was done in this checkpoint.
- No storage policy change was done in this checkpoint.
- No billing/payment live action was done in this checkpoint.
- Supabase reads passed.
- Route registry passed.
- Health check passed.

## Result

This checkpoint is the carry-on rail for the final app-wide page polish pass. The app now has stable access rules and a clear visual layout rule before live promotion work continues.