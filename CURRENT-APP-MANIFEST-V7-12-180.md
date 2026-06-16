# Stream Bandit Current App Manifest V7.12.300.2

Date: 2026-06-16

Filename remains `CURRENT-APP-MANIFEST-V7-12-180.md` because protected scanner pages and One Machine already reference this file.

## Current strongest pause point

`V7.12.300.2 Policy Group Passed / Admin Group Rail Pass Next`

The main app rail rollout has now completed the Profile and Policy run described in the latest owner test cycle.

Current live-ready candidate tracking now includes:

- Profile Settings — `profile-settings-live-ready-v7-12-90-test.html`
- Policy Documents Centre — `policy-documents-centre-v7-12-119-test.html`
- Published Policy Proof / Reader — `policy-reader-v7-12-119-test.html?policy=terms`
- Policy Admin Centre — `policy-admin-documents-v7-12-120-test.html?policy=terms`

These are candidate records only. This manifest update does not promote `index.html` to a final live homepage and does not change production behaviour.

Current next target group:

`Admin`

First Admin page for the rail pass:

`admin-centre-command-deck-v7-12-121-test.html`

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

No page change should add schema, RLS, storage policy, bucket policy, service-role, index promotion, live-home promotion, or OpenAI/API keys.

## Current `sb_table 1` scan snapshot

Latest scanner:

`V7.12.300 SB Table Route Scanner`

Started:

`2026-06-16T11:10:01.567Z`

Finished:

`2026-06-16T11:10:16.274Z`

Failed routes:

`[]`

Known table list:

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

## File-count / cleanup rule

Do not grow the repository with endless checkpoint or page files. Routine carry-on memory goes into this manifest. Create a checkpoint only when a pass needs a separate record, and clear one clearly obsolete old checkpoint in the same cleanup pass. Do not create new page piles like `test-1`, `test-2`, `final`, `final-2`. Do not overwrite protected reference pages or working fallback pages. Do not remove accessibility, player comfort, Supabase migration/test, upload/Mux/storage, profile/auth/avatar, global shell/helper, registry, route, manifest, backup, or current checkpoint files unless the owner explicitly approves the specific cleanup.

## Access / visibility model

Owner pages are visible in the overlay for the platform owner and hidden for everyone else. Admin pages are operational pages for admin/owner users. Creator/builders receive only plan-allowed creator, group-play, and Web Builder areas. Viewers can use watch, saved, profile, and public/read pages as allowed. Signed-out users do not see Owner or User Management groups. Protected direct URLs should show a clear locked/not-allowed page, not blank crash.

Special Policy Admin rule:

- `policy-admin-documents-v7-12-120-test.html?policy=terms` is visible as a page to everyone who can reach it.
- Kayleigh/non-admin users may view the page shell and route links only.
- Editor tools remain owner/admin only.
- Owner/admin can edit, save draft, publish, archive, and create defaults.
- Policy Admin reads `sb_policy_documents` and `sb_profiles` and writes only `sb_policy_documents`.

## Page polish standard

Every page in the final polish pass should follow:

- Header shell
- page navigation pill rail directly under the header
- hero/main summary
- internal content tabs only when needed
- page output/content underneath those tabs
- Footer shell

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

### Public Watch / Saved / Comfort group — PASS

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

Protected behaviours: Player Comfort, audio boost, fullscreen, accessibility, saves, progress, and history remain protected.

### Public Browse group — FULL GROUP PASS

Passed pages:

- Supabase Library — `supabase-library-home-header-form-fix-v7-12-34-test.html`
- Genres — `genres-clean-machine-v7-12-45-test.html` — `V7.12.282 Genres · Clean Navigation`
- Global Search — `global-search-global-helpers-v7-4-9-test.html` — `V7.12.283 Global Search · Header Query Handoff`
- About — `about-global-helpers-v7-4-7-test.html` — `V7.12.284 About · Clean Navigation`

Browse confirmations: top rail pattern established, duplicate hero route buttons removed, public Browse outputs remain working, no schema/storage/index promotion.

### Creator / Group Play group — FULL GROUP PASS

Passed pages:

- Rules — `rules-clean-machine-v7-12-82-test.html` — `V7.12.286 Creator Rules · Platform Truth Map`
- Submit Video — `submit-video-clean-machine-v7-12-79-test.html` — `V7.12.287 Submit Video · Clean Rail`
- Review Queue — `review-queue-clean-machine-v7-12-80-publish-test.html` — `V7.12.288 Review Queue · Clean Rail`
- Playlists — `playlists-global-helpers-v7-5-2-test.html` — `V7.12.289 Playlists · Clean Rail`
- Channels — `channels-global-helpers-v7-5-3-test.html` — `V7.12.290 Channels · Clean Rail`
- My Channel — `my-channel-clean-machine-v7-12-47-test.html` — `V7.12.291.1 My Channel · Plan Stat Wrap Fix`
- Collections — `collections-clean-machine-v7-12-51-test.html` — `V7.12.292 Collections · Clean Rail`
- Player 2 — `player-2-clean-machine-v7-12-58-test.html` — `V7.12.293 Player 2 · Clean Rail`

Creator / Group Play confirmations:

- Top rail pattern established.
- Route links moved out of heroes into top rails.
- No duplicate route tabs/buttons were added.
- Internal tabs remain current-page content only.
- Supabase writes stay on intended pages only.
- No schema, storage policy, RLS, bucket, Player 1, Details, index, or global-helper changes.

### Settings/Profile group — PASS

Passed pages/helpers:

- Settings Hub — `settings-platform-control-hub-v7-12-85-test.html` — `V7.12.294 Settings Hub · Web Builder Doorway`
- Theme Studio — `web-builder-theme-studio-controls-v7-8-9-test.html` — `V7.12.295 Theme Studio · Clean Rail Global Bridge`
- Profile Settings — `profile-settings-live-ready-v7-12-90-test.html` — PASS / candidate
- Footer Messenger — `stream-bandit-footer-shell-v7-12-156.js` — `V7.12.298.2 Footer Shell / Inbox Reply Payload Fix`

Profile Settings confirmation:

- Profile Settings changes the signed-in user's avatar/profile identity correctly.
- Header Shell and Profile Settings no longer fight over the left identity image.
- Signed-in profile avatar wins when present.
- Signed-out users see the global Stream Bandit brand logo.
- Profile Settings owns profile/account visible settings, avatar upload, banner upload, Supabase Auth/profile reads, and `sb_profiles` writes.
- Profile Settings is a current live-ready candidate.

Footer Messenger confirmation:

- Global lightweight private-message overlay opens from the footer on pages using the global footer shell.
- `sb_private_messages` remains the real message table.
- `sb_profiles` remains the avatar/display-name source.
- `sb_user_friends` and `sb_user_blocks` support friend/block UI.
- Form Inbox remains the full management page for form submissions and private messages.

### Web Builder group — GLOBAL RAIL PASS / CANDIDATE TRACKING ONLY

Canonical doorway:

`web-builder-account-control-hub-v7-12-263-test.html`

Web Builder group is tracked in:

`WEB-BUILDER-MANIFEST-V7-12-252.md`

Index tracking only:

- Web Builder group is listed in `index.html` as near-ready candidate tracking.
- This does not promote Web Builder live.
- This does not approve final homepage replacement.
- Web Builder still needs polish/tidy and temp/support classification before any live promotion.

### Policy group — FULL GROUP PASS / LIVE CANDIDATES

Passed pages:

- Policy Documents Centre — `policy-documents-centre-v7-12-119-test.html` — `V7.12.296.4 Policy Documents Centre Main App Rail Pass`
- Published Policy Proof / Reader — `policy-reader-v7-12-119-test.html?policy=terms` — `V7.12.296.5 Policy Reader Main App Rail Pass`
- Policy Admin Centre — `policy-admin-documents-v7-12-120-test.html?policy=terms` — `V7.12.296.7 Policy Admin Editor Centre Main App Rail Pass`

Policy group scanner truth:

- Policy Centre: public hub, no intended writes.
- Policy Reader: reads `sb_policy_documents`, no writes, public published-only proof page.
- Policy Admin: reads `sb_policy_documents` and `sb_profiles`, writes only `sb_policy_documents`, owner/admin editor, view-only for non-admin users.

Policy group owner-confirmed debug truth:

- `policyGroupRail:true`
- `mainAppRailPass:true`
- `pageVisibleToAll:true`
- `viewOnlyForNonAdmin:true`
- `writesPolicyRowsOnly:true`
- `readTables:[sb_policy_documents,sb_profiles]`
- `writeTables:[sb_policy_documents]`
- `storagePolicyEdits:false`
- `storageWrites:false`
- `storageActions:false`
- `authAdmin:false`
- `schemaChanges:false`
- `rlsChange:false`
- `serviceRole:false`
- `indexPromotion:false`
- `livePromotion:false`
- `webBuilderRailInjection:false`
- helper presence all true: shell, header, footer, theme, saves, counts, search, settings, brand.

Policy group live-candidate note:

The Policy group has now been added to `index.html` candidate tracking. Candidate tracking is not live-home promotion.

## Current Admin group — NEXT

Screenshot group to complete next:

- Admin Centre
- Live Readiness
- Current Routes Registry
- Test Checklist
- Tools
- Health Check
- Mux Manager
- Storage Prep
- Backup / Safety

First target file:

`admin-centre-command-deck-v7-12-121-test.html`

Current uploaded/source state:

- `V7.12.218 Admin Centre Route Command Deck`
- Link/check/report command deck only.
- Uses global helpers and protected page helper.
- Contains tabs for Admin, Safety Chain, Media / Library, Owner / Builder, Policy / Users, Actions and Debug.

Admin group scanner truth for first page:

- Admin Centre route: `admin-centre-command-deck-v7-12-121-test.html`
- route status: `200`
- tables: none
- read tables: none
- write tables: none
- auth: `false`
- storage: `false`
- write: `false`
- rpc: `false`
- overlay: `false`

Admin group pass must preserve:

- Admin Centre is a launcher/report/checker.
- Working engines stay in their own pages.
- No Supabase table writes are introduced to Admin Centre.
- No schema, RLS, storage policy, bucket policy, service-role, OpenAI/API key, live promotion or index-home replacement.
- Rail pass should remove stale routes and duplicate route buttons while keeping the Admin group complete.

## Protected helper states

- `stream-bandit-header-shell-v7-12-156.js` owns the header shell. Latest passed replacement: `V7.12.297.1 Header Shell / Profile Identity Image Owner`.
- `stream-bandit-footer-shell-v7-12-156.js` owns the footer shell. Latest passed replacement: `V7.12.298.2 Footer Shell / Inbox Reply Payload Fix`.
- `stream-bandit-theme-projector-v7-12-156.js` applies global theme variables and supports accessibility/readability projection.
- `stream-bandit-settings-global-v7-1-8.js` is the protected global settings helper.
- `stream-bandit-brand-logo-v7-12-12.js` is the protected brand/logo helper.
- `stream-bandit-core-saves-v6-75.js` owns Watchlist/Favourites/Likes save logic.
- `stream-bandit-menu-saves-count-v6-72-1.js` owns save counts and menu visibility.
- `live-readiness-search-supabase-fallback-v7-12-130.js` owns header search preview, menu route sanitizer, and Global Search handoff.
- `stream-bandit-protected-page-v7-12-273.js` presents admin/owner/protected page locks.
- `stream-bandit-authority-gate-v7-12-273.js` is the shared route/access decision engine.
- `stream-bandit-account-authority-v7-12-273.js` reads Supabase user and `sb_profiles` authority from the live profile row.

## Current live candidate tracking

Tracked as near-ready candidates in `index.html`:

1. Profile Settings
2. Policy Documents Centre
3. Published Policy Proof / Reader
4. Policy Admin Centre
5. Web Builder group candidate tracker

Candidate tracking does not equal live-home promotion.

## No-touch rules still active

- No schema changes.
- No RLS rewrites.
- No storage policy changes.
- No bucket policy changes.
- No service-role key in browser code.
- No OpenAI/API keys in browser code.
- No live promotion.
- No `index.html` live-home replacement.
- No protected helper rewrites unless explicitly requested.
- Use the `sb_table 1` scanner for every Supabase-touching page before editing.
