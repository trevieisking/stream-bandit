# Stream Bandit Master Must-Follow Plan V7.13.084

Date: 2026-06-21

Status: MASTER GOVERNING PLAN / WATCH GROUP AUTH GATE FULL PASS / ACCESSIBILITY PASSED / CHECKPOINT CREATED / INDEX PROMOTED / CURRENT APP LINKS UPDATED / BROWSE GROUP IN PROGRESS / SUPABASE LIBRARY EDITOR AUTH GATE PLUS ADMIN LOCK FIRST-TIME PASS / GENRES AUTH GATE PASS / GLOBAL SEARCH AUTH GATE PASS / NEWS FEED MEDIA DISPLAY ISSUE LOGGED FOR LATER / HEADER SHELL MASS AUTH GATE NOT APPROVED / MUST FOLLOW BEFORE FUTURE PAGE OR SCHEMA WORK

Purpose: this document is the project-level source plan for Stream Bandit. It records what is locked, what passed, what is pending, what stays separate, and what must happen before future page, shell, registry, Web Builder, Owner, Admin, Social, User Management, storage, payment, database, authentication-gate or shell-bridge work.

## 1. Current rollback checkpoint

Rollback checkpoint created at the exact full Watch Group pass moment:

`CHECKPOINT-WATCH-GROUP-AUTH-GATE-FULL-PASS-V7-13-080.md`

Three old V5 checkpoint files were deleted first to keep the repository count under control:

- `CHECKPOINT-V5.20.2.md`
- `CHECKPOINT-V5.22.1.md`
- `CHECKPOINT-V5.23.2.md`

## 2. Source of truth hierarchy

Future decisions must start from:

1. `CURRENT-APP-MANIFEST-V7-12-180.md`
2. `STREAM-BANDIT-MASTER-MUST-FOLLOW-PLAN.md`
3. `CHECKPOINT-WATCH-GROUP-AUTH-GATE-FULL-PASS-V7-13-080.md`
4. Current page source fetched directly from GitHub or complete user-supplied full file
5. Browser smoke test result

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

Publishable Supabase config must remain config-only and must not be copied into docs as a secret.

## 5. Index promotion

File promoted:

`index.html`

Index version:

`V7.13.021 Platform Entry Watch Group Promoted`

Index now lists the passed Watch Group as current app page links while keeping the existing old/current URLs:

- Continue Watching: `continue-watching-global-helpers-v7-3-9-test.html`
- Watch History: `watch-history-global-helpers-v7-4-0-test.html`
- Watchlist: `watchlist-clean-machine-v7-12-43-test.html`
- Favourites: `favourites-clean-machine-v7-12-41-test.html`
- Likes: `likes-clean-machine-v7-12-42-test.html`
- Accessibility: `accessibility-clean-machine-v7-12-44-test.html`

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

Auth gate autofill guard remains passed. The old Library browser-autofill problem is fixed by the central helper.

## 7. Browse group rule

Browse group is permission-mixed and must not be handled as one flat page type.

Current Browse routes:

- Supabase Library Editor: `supabase-library-home-header-form-fix-v7-12-34-test.html` — admin/owner only, passed first time with Auth Gate plus admin lock
- Genres: `genres-clean-machine-v7-12-45-test.html` — signed-in browse plus admin/owner genre tools, passed
- Global Search: `global-search-global-helpers-v7-4-9-test.html` — signed-in read-only search, passed
- About: `about-global-helpers-v7-4-7-test.html` — info/contact page, pending controlled pass

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

Do not move this gate into Header Shell. Do not remove page-owned admin/owner locks. Do not flatten Browse pages into one permission type.

## 8. Supabase Library Editor full first-time pass

File:

`supabase-library-home-header-form-fix-v7-12-34-test.html`

Version:

`V7.12.279 Supabase Library Editor / Auth Gate Admin Lock Test`

Status:

`FIRST-TIME PASS / REMEMBER THIS EXACT ADMIN LOCK PATTERN`

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

Preserved Supabase Editor controls and safety locks:

- `sb_movies` load preserved
- create video preserved
- edit full video form preserved
- poster/image upload to `stream-bandit-images` preserved
- permanent delete preserved behind typed `DELETE FROM SUPABASE`
- create/edit/delete verify-after-write behavior preserved
- storage poster files are not deleted by movie-row deletion
- Play All visible in Player 2 preserved
- Details route preserved
- Player 1 route preserved
- route lock helper preserved
- protected page helper preserved
- no SQL changed
- no RLS changed
- no storage policy changed
- no schema fields invented
- no storage delete added
- no Header Shell mass auth-gate injection

## 9. Genres pass

File:

`genres-clean-machine-v7-12-45-test.html`

Version:

`V7.12.283 Genres Auth Gate Test`

Status:

`PASSED / SIGNED-IN BROWSE / ADMIN OWNER MANAGED GENRE TOOLS PRESERVED`

Trevor browser-test result:

- Genres page passed
- page works after the auth gate attachment
- Browse group permission model remained correct

Preserved Genres controls and safety locks:

- shared Auth Gate blocks signed-out users before page use
- signed-in users can browse active Supabase movies by genre
- `sb_movies` remains read-only from this page
- `sb_genres` managed label reads stayed preserved
- account authority check stayed preserved through `StreamBanditAccountAuthority`
- admin/owner-only Create Genre stayed preserved
- admin/owner-only Delete Managed Genre stayed preserved
- deleting a managed genre deletes only the `sb_genres` label
- deleting a managed genre does not delete movies
- deleting a managed genre does not edit movie genre arrays
- genre search stayed preserved
- movie search stayed preserved
- genre sort stayed preserved
- movie sort stayed preserved
- Details links stayed preserved
- Player 1 Play links stayed preserved
- shared save buttons stayed preserved
- clean top rail stayed preserved
- Header/Footer/Theme/Search helper bridge stayed preserved
- no SQL changed
- no RLS changed
- no storage policy changed
- no payment changed
- no schema change
- no Header Shell mass auth-gate injection

## 10. Global Search pass

File:

`global-search-global-helpers-v7-4-9-test.html`

Version:

`V7.12.284 Global Search Auth Gate Test`

Status:

`PASSED / SIGNED-IN READ-ONLY SEARCH / HEADER QUERY HANDOFF PRESERVED`

Trevor browser-test result:

- Global Search passed
- page works after the auth gate attachment
- Browse group read-only search model remained correct

Preserved Global Search controls and safety locks:

- shared Auth Gate blocks signed-out users before page use
- no admin/owner role check added
- read-only search stayed preserved
- `sb_movies` read stayed preserved
- `sb_channels` optional read stayed preserved
- `sb_playlists` optional read stayed preserved
- pages and policy results stayed preserved
- header query handoff stayed preserved
- search input stayed preserved
- type filter stayed preserved
- source filter stayed preserved
- sort stayed preserved
- chips stayed preserved
- Details links stayed preserved
- Player 1 Play links stayed preserved
- shared save buttons stayed preserved
- clean top rail stayed preserved
- Header/Footer/Theme/Search helper bridge stayed preserved
- no SQL changed
- no RLS changed
- no storage policy changed
- no payment changed
- no schema change
- no Supabase writes added
- no Header Shell mass auth-gate injection

## 11. Watch Group full pass results

### Continue Watching

- V7.12.231 Continue Watching Auth Gate Test
- Trevor confirmed pass
- read-only progress, dedupe, resume links, save buttons, Details links and clean navigation preserved

### Watch History

- V7.12.227 Watch History Auth Gate Test
- Trevor confirmed pass
- read-only history/progress, dedupe, resume links, save buttons, Details links and theme tabs preserved

### Watchlist

- V7.12.160 Watchlist Auth Gate Test
- Trevor confirmed pass
- `sb_watchlist` read, search/filter, sort, shared save buttons, Details links, Player 1 links and clean top rail preserved

### Favourites

- V7.12.160 Favourites Auth Gate Test
- Trevor confirmed pass
- `sb_favourites` read, search/filter, sort, shared save buttons, Details links, Player 1 links and clean top rail preserved

### Likes

- V7.12.159 Likes Auth Gate Test
- Trevor confirmed pass
- `sb_likes` read, search/filter, sort, shared save buttons, Details links, Player 1 links and clean top rail preserved

### Accessibility

- V7.12.229 Accessibility Auth Gate Test
- Trevor confirmed pass
- localStorage-only readability controls preserved
- Theme Projector bridge preserved
- text scale, contrast, reduced motion and preferred player boost reminder preserved
- no Supabase writes added

## 12. User save-page and Accessibility boundaries

Watchlist, Favourites and Likes are user-account save pages. They must keep signed-in user scope, existing table reads and shared save helpers. They must not become admin/owner permission pages and must not change User Management, Owner controls, SQL, RLS, storage policies, payments or Header Shell gate behavior.

Accessibility is a local comfort/readability page. It must not become a Supabase writer and must not take over Theme Studio colour ownership or Player 1's real audio boost controls.

## 13. News Feed media display issue for later focused fix

File:

`news-feed-social-v7-13-001-test.html`

Status:

`LOGGED / NOT PART OF WATCH GROUP AUTH-GATE PASS / FIX LATER IN DEDICATED NEWS FEED MEDIA LAYOUT PASS`

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

## 14. Player 1 Details-link issue for later

Status: logged, not an auth blocker, Player 1 auth gate passed.

Observed behavior: Player 1 Details can open a different/random title instead of the currently playing title. Fix later in a dedicated Player 1 Details-link/current-row routing pass. Preserve playback, audio boost, source bridge, resume helper, watch history and save buttons.

## 15. Social group rule

Social pages are real working pages and must not be blind-patched.

Current Social group:

- Social Profile: `profile-social-v7-13-001-test.html`
- Friends: `friends-social-v7-13-001-test.html`
- News Feed: `news-feed-social-v7-13-001-test.html`
- Groups and Events: `groups-social-v7-13-001-test.html`

News Feed is a real post/comment/reaction/feed page. Its media display issue must be handled as a focused fix, not as part of a broad social rewrite.

## 16. Next controlled step

The Watch Group is passed, checkpointed and promoted to Index as current app links. Browse Group has started. Supabase Library Editor, Genres and Global Search have passed.

Next Browse group target should be chosen one page at a time:

- About, info/contact gate if approved.

No mass page rollout and no Header Shell auth-gate embedding are approved.
