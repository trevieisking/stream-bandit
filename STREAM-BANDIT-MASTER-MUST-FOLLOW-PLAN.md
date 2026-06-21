# Stream Bandit Master Must-Follow Plan V7.13.085

Date: 2026-06-21

Status: MASTER GOVERNING PLAN / WATCH GROUP AUTH GATE FULL PASS / BROWSE GROUP AUTH GATE FULL PASS / ABOUT PASSED / CHECKPOINT CREATED / INDEX PROMOTED / CURRENT APP LINKS UPDATED / NEWS FEED MEDIA DISPLAY ISSUE LOGGED FOR LATER / HEADER SHELL MASS AUTH GATE NOT APPROVED / MUST FOLLOW BEFORE FUTURE PAGE OR SCHEMA WORK

Purpose: this document is the project-level source plan for Stream Bandit. It records what is locked, what passed, what is pending, what stays separate, and what must happen before future page, shell, registry, Web Builder, Owner, Admin, Social, User Management, storage, payment, database, authentication-gate or shell-bridge work.

## 1. Current rollback checkpoints

Strong rollback checkpoints now available:

- `CHECKPOINT-WATCH-GROUP-AUTH-GATE-FULL-PASS-V7-13-080.md`
- `CHECKPOINT-BROWSE-GROUP-AUTH-GATE-FULL-PASS-V7-13-085.md`

Three old V6/V5 checkpoint files were deleted before the Browse Group checkpoint was created:

- `CHECKPOINT-GROUP-PLAY-PLAYER-2-V6-78-9-4-PASSED.md`
- `CHECKPOINT-PLAYER2-GLOBAL-CARRY-V6-78-9-4-PASSED.md`
- `CHECKPOINT-V5.24.1.md`

## 2. Source of truth hierarchy

Future decisions must start from:

1. `CURRENT-APP-MANIFEST-V7-12-180.md`
2. `STREAM-BANDIT-MASTER-MUST-FOLLOW-PLAN.md`
3. `CHECKPOINT-BROWSE-GROUP-AUTH-GATE-FULL-PASS-V7-13-085.md`
4. `CHECKPOINT-WATCH-GROUP-AUTH-GATE-FULL-PASS-V7-13-080.md`
5. Current page source fetched directly from GitHub or complete user-supplied full file
6. Browser smoke test result

Direct GitHub fetch beats old checkpoint text when they disagree. If GitHub output truncates an HTML or JavaScript file and Trevor has the full page, use the full supplied page as the base.

## 3. Permanent architecture lock

Main App owns streaming, watching, browse, creator submission, review queue, channels, collections, playlists, social, messages, profile, settings, admin/proof pages and accessibility/audio comfort.

Main App Home remains:

`home-global-helpers-v7-4-4-test.html`

`index.html` remains the Platform Entry, not a replacement for Home.

Web Builder stays Web Builder. It owns Builder Hub, Owned Pages Manager, Studio/page canvas, Published Preview, Menu Builder, Header/Footer Builder, Form Designer, Form Inbox bridge, Assets, Planning Map, Control Map and Source Map.

## 4. Protected boundaries

No future pass may touch these without explicit separate approval:

- SQL
- RLS
- storage policies
- payment provider
- production Home replacement
- player/audio/accessibility comfort regressions
- Main App/Web Builder shell merge
- Header Shell auth-gate embedding
- owner/admin permission-system rewrites during controlled page rollout
- Supabase Library Editor schema expansion without separate approval
- Supabase Library Editor storage delete without separate approval
- Genres `sb_movies` writes or movie deletion without separate approval
- Global Search Supabase writes or admin-only conversion without separate approval
- About Supabase writes, live publishing, tickets, uploads, billing, or policy editing without separate approval

Publishable Supabase config must remain config-only and must not be copied into docs as a secret.

## 5. Index promotion

File promoted:

`index.html`

Index version:

`V7.13.022 Platform Entry Browse Group Promoted`

Index now lists the passed Watch Group and Browse Group as current app page links while keeping the existing old/current URLs.

Watch Group links:

- Continue Watching: `continue-watching-global-helpers-v7-3-9-test.html`
- Watch History: `watch-history-global-helpers-v7-4-0-test.html`
- Watchlist: `watchlist-clean-machine-v7-12-43-test.html`
- Favourites: `favourites-clean-machine-v7-12-41-test.html`
- Likes: `likes-clean-machine-v7-12-42-test.html`
- Accessibility: `accessibility-clean-machine-v7-12-44-test.html`

Browse Group links:

- Supabase Library Editor: `supabase-library-home-header-form-fix-v7-12-34-test.html`
- Genres: `genres-clean-machine-v7-12-45-test.html`
- Global Search: `global-search-global-helpers-v7-4-9-test.html`
- About: `about-global-helpers-v7-4-7-test.html`

Index remains a platform entry and route launcher. Home remains:

`home-global-helpers-v7-4-4-test.html`

## 6. Auth Gate phase status

Current helper:

`stream-bandit-auth-gate-v7-13-001.js`

Current helper status:

`V7.13.005 Auth Gate / Email Password / No Guest Users / Owner Recovery / Session Watch / Autofill Guard`

The gate is controlled page-by-page. It is not approved as a broad shell rewrite or Header Shell mass gate.

Passed auth-gate attachment pages:

- `index.html`
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
- `supabase-library-home-header-form-fix-v7-12-34-test.html`
- `genres-clean-machine-v7-12-45-test.html`
- `global-search-global-helpers-v7-4-9-test.html`
- `about-global-helpers-v7-4-7-test.html`

Auth gate autofill guard remains passed. The old Library browser-autofill problem is fixed by the central helper.

## 7. Browse group rule

Browse Group is permission-mixed and must not be handled as one flat page type.

Current Browse routes:

- Supabase Library Editor: `supabase-library-home-header-form-fix-v7-12-34-test.html` — admin/owner only, passed first time with Auth Gate plus admin lock
- Genres: `genres-clean-machine-v7-12-45-test.html` — signed-in browse plus admin/owner genre tools, passed
- Global Search: `global-search-global-helpers-v7-4-9-test.html` — signed-in read-only search, passed
- About: `about-global-helpers-v7-4-7-test.html` — signed-in info/contact page, passed

Supabase Library Editor must use this exact passed order:

1. Auth Gate blocks signed-out access first.
2. Existing page admin/owner lock blocks signed-in non-admin users.
3. Admin/owner users can load editor controls.
4. Every write action still calls `requireSignedAdmin()`.

Genres must use this exact permission model:

1. Auth Gate blocks signed-out access first.
2. Signed-in users can browse active Supabase movies by genre.
3. Existing account authority lock controls admin/owner tools.
4. Admin/owner users can create/delete managed `sb_genres` labels.
5. Genres must not write to `sb_movies` and must not delete or edit movie rows.

Global Search must use this exact permission model:

1. Auth Gate blocks signed-out access first.
2. Signed-in users can run read-only search across movies, genres, channels, playlists, pages and policies.
3. No admin/owner-only role check is required.
4. Global Search must not add Supabase writes.
5. Header query handoff must keep working.

About must use this exact permission model:

1. Auth Gate blocks signed-out access first.
2. Signed-in users can use the informational page and email-draft forms.
3. No admin/owner-only role check is required.
4. About must not add Supabase writes, tickets, uploads, payments, live promotion or policy editing.
5. Mailto/email-draft-only forms must remain the form model.

Do not move this gate into Header Shell. Do not remove page-owned admin/owner locks. Do not flatten Browse pages into one permission type.

## 8. Browse Group full pass results

### Supabase Library Editor

File: `supabase-library-home-header-form-fix-v7-12-34-test.html`

Version: `V7.12.279 Supabase Library Editor / Auth Gate Admin Lock Test`

Status: `FIRST-TIME PASS / REMEMBER THIS EXACT ADMIN LOCK PATTERN`

Trevor browser-test result:

- admin account sign-out/login passed
- girlfriend signed-in non-admin account hit the page and was not allowed through
- non-admin route offered return to Home
- edit image on form passed
- Play All passed
- all movies display passed
- filter passed
- search passed
- Details links passed
- Play links passed
- copy movie ID link passed
- one Header and one Footer passed
- Menu overlay passed
- Menu overlay filter passed

Preserved:

- `sb_movies` load, create video, edit full form, poster/image upload and permanent delete stayed protected
- typed `DELETE FROM SUPABASE` stayed required
- create/edit/delete verify-after-write behavior stayed preserved
- storage poster files are not deleted by movie-row deletion
- no SQL, RLS, storage policy, schema, storage delete or Header Shell mass gate change

### Genres

File: `genres-clean-machine-v7-12-45-test.html`

Version: `V7.12.283 Genres Auth Gate Test`

Status: `PASSED / SIGNED-IN BROWSE / ADMIN OWNER MANAGED GENRE TOOLS PRESERVED`

Preserved:

- signed-in users can browse active Supabase movies by genre
- `sb_movies` remains read-only from this page
- `sb_genres` managed label reads stayed preserved
- admin/owner-only Create Genre and Delete Managed Genre stayed preserved
- deleting a managed genre deletes only the `sb_genres` label
- deleting a managed genre does not delete movies or edit movie genre arrays
- no SQL, RLS, storage policy, schema or Header Shell mass gate change

### Global Search

File: `global-search-global-helpers-v7-4-9-test.html`

Version: `V7.12.284 Global Search Auth Gate Test`

Status: `PASSED / SIGNED-IN READ-ONLY SEARCH / HEADER QUERY HANDOFF PRESERVED`

Preserved:

- signed-in users can run read-only search
- `sb_movies`, optional `sb_channels`, optional `sb_playlists`, pages and policy results stayed preserved
- header query handoff, search input, type filter, source filter, sort, chips, Details, Play and save buttons stayed preserved
- no admin/owner-only role check added
- no Supabase writes added
- no SQL, RLS, storage policy, schema or Header Shell mass gate change

### About

File: `about-global-helpers-v7-4-7-test.html`

Version: `V7.12.285 About Auth Gate Test`

Status: `PASSED / SIGNED-IN INFORMATION PAGE / EMAIL-DRAFT-ONLY FORMS PRESERVED`

Trevor browser-test result:

- About page passed
- page works after the auth gate attachment
- Browse group info/contact model remained correct

Preserved:

- signed-out users are blocked by Auth Gate before using About
- page remains informational and read-only
- Request a Title, Contact Us, Report Playback, Accessibility Feedback, Creator/Channel, Policy/Privacy, Removal/Rights, Business and Bug forms remain mailto/email-draft-only
- no Supabase writes, tickets, uploads, billing, live promotion or policy editing were added
- policy links, modal scroll behavior, header counters, clean top rail and helper bridges stayed preserved
- no SQL, RLS, storage policy, schema or Header Shell mass gate change

## 9. Watch Group full pass results

- Continue Watching: `continue-watching-global-helpers-v7-3-9-test.html` — V7.12.231 auth gate passed
- Watch History: `watch-history-global-helpers-v7-4-0-test.html` — V7.12.227 auth gate passed
- Watchlist: `watchlist-clean-machine-v7-12-43-test.html` — V7.12.160 auth gate passed
- Favourites: `favourites-clean-machine-v7-12-41-test.html` — V7.12.160 auth gate passed
- Likes: `likes-clean-machine-v7-12-42-test.html` — V7.12.159 auth gate passed
- Accessibility: `accessibility-clean-machine-v7-12-44-test.html` — V7.12.229 auth gate passed

## 10. User save-page and Accessibility boundaries

Watchlist, Favourites and Likes are user-account save pages. They must keep signed-in user scope, existing table reads and shared save helpers. They must not become admin/owner permission pages and must not change User Management, Owner controls, SQL, RLS, storage policies, payments or Header Shell gate behavior.

Accessibility is a local comfort/readability page. It must not become a Supabase writer and must not take over Theme Studio colour ownership or Player 1's real audio boost controls.

## 11. News Feed media display issue for later focused fix

File: `news-feed-social-v7-13-001-test.html`

Status: `LOGGED / NOT PART OF WATCH OR BROWSE AUTH-GATE PASS / FIX LATER IN DEDICATED NEWS FEED MEDIA LAYOUT PASS`

Observed from Trevor's browser screenshot:

- Latest Activity post renders the account header, post text and post media.
- The image card is not showing the full image used with the post; it appears partially visible/cropped.
- The video/player card below appears as a large black media block.
- Trevor reports the video still plays, but the player/media is not visibly correct.

Future fix direction:

- inspect media-card CSS, image sizing, video/player sizing, poster/preview handling and overflow/height rules
- make the post image display correctly
- make the video/player card visibly show the intended media area
- preserve News Feed posts, comments, reactions, likes, visibility rules and account ownership behavior
- do not change SQL, RLS, storage policies, payments, owner/admin permissions or Header Shell auth-gate behavior in that pass unless separately approved

## 12. Player 1 Details-link issue for later

Status: logged, not an auth blocker, Player 1 auth gate passed.

Observed behavior: Player 1 Details can open a different/random title instead of the currently playing title. Fix later in a dedicated Player 1 Details-link/current-row routing pass. Preserve playback, audio boost, source bridge, resume helper, watch history and save buttons.

## 13. Social group rule

Social pages are real working pages and must not be blind-patched.

Current Social group:

- Social Profile: `profile-social-v7-13-001-test.html`
- Friends: `friends-social-v7-13-001-test.html`
- News Feed: `news-feed-social-v7-13-001-test.html`
- Groups and Events: `groups-social-v7-13-001-test.html`

News Feed is a real post/comment/reaction/feed page. Its media display issue must be handled as a focused fix, not as part of a broad social rewrite.

## 14. Next controlled step

Watch Group and Browse Group are passed, checkpointed and promoted to Index as current app links.

Next work should be chosen one page or one group at a time. No mass page rollout and no Header Shell auth-gate embedding are approved.
