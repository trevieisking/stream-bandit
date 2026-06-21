# Stream Bandit Current App Manifest V7.13.082

Date: 2026-06-21

Filename remains `CURRENT-APP-MANIFEST-V7-12-180.md` because protected scanner pages and One Machine reference this file.

## Current strongest checkpoint

`V7.13.082 Watch Group Auth Gate Full Pass / Accessibility Passed / Checkpoint Created / Index Promoted / Supabase Library Editor Admin Gate First-Time Pass / Manifest Updated`

Checkpoint file:

`CHECKPOINT-WATCH-GROUP-AUTH-GATE-FULL-PASS-V7-13-080.md`

## Repository count rule completed

Three old V5 checkpoints were removed before creating the Watch Group checkpoint:

- `CHECKPOINT-V5.20.2.md`
- `CHECKPOINT-V5.22.1.md`
- `CHECKPOINT-V5.23.2.md`

## Current pass status

`WATCH GROUP AUTH GATE FULL PASS / USER SAVE PAGES PASSED / ACCESSIBILITY PASSED / INDEX LISTS CURRENT WATCH GROUP LINKS / BROWSE GROUP STARTED / SUPABASE LIBRARY EDITOR AUTH GATE PLUS ADMIN LOCK PASSED FIRST TIME / NEWS FEED MEDIA ISSUE LOGGED FOR LATER`

Confirmed boundaries:

- no SQL change
- no RLS change
- no storage policy change
- no payment change
- no production Home replacement
- no player/audio/accessibility regression work
- no Header Shell mass auth-gate injection
- no admin or owner permission-system rewrite
- no News Feed code change during this documentation pass
- no schema fields invented for Supabase Library Editor
- no storage delete added to Supabase Library Editor

## Index promotion

File promoted:

`index.html`

Index version:

`V7.13.021 Platform Entry Watch Group Promoted`

Index now lists the passed Watch Group using the existing old/current URLs:

- Continue Watching: `continue-watching-global-helpers-v7-3-9-test.html`
- Watch History: `watch-history-global-helpers-v7-4-0-test.html`
- Watchlist: `watchlist-clean-machine-v7-12-43-test.html`
- Favourites: `favourites-clean-machine-v7-12-41-test.html`
- Likes: `likes-clean-machine-v7-12-42-test.html`
- Accessibility: `accessibility-clean-machine-v7-12-44-test.html`

Index remains the platform entry and route launcher. Home remains:

`home-global-helpers-v7-4-4-test.html`

## Auth gate controlled rollout status

The auth gate rollout remains page-by-page. It is not approved as a Header Shell mass gate.

Passed pages:

- Index: `index.html`
- Home: `home-global-helpers-v7-4-4-test.html`
- Library: `library-global-helpers-v7-4-8-test.html`
- Details: `details-clean-machine-v7-12-38-test.html`
- Player 1: `player-one-global-helpers-v7-3-3-test.html`
- Continue Watching: `continue-watching-global-helpers-v7-3-9-test.html`
- Watch History: `watch-history-global-helpers-v7-4-0-test.html`
- Watchlist: `watchlist-clean-machine-v7-12-43-test.html`
- Favourites: `favourites-clean-machine-v7-12-41-test.html`
- Likes: `likes-clean-machine-v7-12-42-test.html`
- Accessibility: `accessibility-clean-machine-v7-12-44-test.html`
- Supabase Library Editor: `supabase-library-home-header-form-fix-v7-12-34-test.html`

## Browse group status

Browse group routes visible in the menu:

- Supabase Library Editor: `supabase-library-home-header-form-fix-v7-12-34-test.html` — V7.12.279 auth gate plus admin lock passed
- Genres: `genres-clean-machine-v7-12-45-test.html` — pending Browse group gate pass
- Global Search: `global-search-global-helpers-v7-4-9-test.html` — pending Browse group gate pass
- About: `about-global-helpers-v7-4-7-test.html` — pending Browse group gate pass

## Supabase Library Editor pass

File:

`supabase-library-home-header-form-fix-v7-12-34-test.html`

Version:

`V7.12.279 Supabase Library Editor Auth Gate Test`

Status:

`FIRST-TIME PASS / AUTH GATE PLUS EXISTING ADMIN OWNER LOCK / EXACT ADMIN LOCK PATTERN TO REMEMBER`

Gate order that passed:

1. Signed-out users hit the shared Auth Gate first.
2. Signed-in non-admin/non-owner users remain blocked by the page admin lock and can go back Home/Public Library.
3. Admin/owner user can load editor controls and use the workbench.

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
- single Header and single Footer passed
- menu overlay passed
- menu overlay filter passed

Preserved editor functions and locks:

- `sb_movies` load preserved
- create video preserved
- edit full video form preserved
- poster/image upload preserved
- permanent delete preserved behind typed `DELETE FROM SUPABASE`
- create/edit/delete verify-after-write behavior preserved
- Play All visible in Player 2 preserved
- Details route preserved
- Player 1 route preserved
- route lock helper preserved
- protected page helper preserved
- no schema invented
- no RLS changed
- no storage policy changed
- no storage delete added
- no Header Shell mass auth-gate injection

## Current Watch Group results

### Continue Watching

- V7.12.231 Auth Gate Test passed
- read-only progress, dedupe, resume links, save buttons, Details links and clean navigation stayed preserved

### Watch History

- V7.12.227 Auth Gate Test passed
- read-only history/progress, dedupe, resume links, save buttons, Details links and theme tabs stayed preserved

### Watchlist

- V7.12.160 Auth Gate Test passed
- `sb_watchlist` read, search/filter, sort, shared save buttons, Details links, Player 1 links and clean top rail stayed preserved

### Favourites

- V7.12.160 Auth Gate Test passed
- `sb_favourites` read, search/filter, sort, shared save buttons, Details links, Player 1 links and clean top rail stayed preserved

### Likes

- V7.12.159 Auth Gate Test passed
- `sb_likes` read, search/filter, sort, shared save buttons, Details links, Player 1 links and clean top rail stayed preserved

### Accessibility

- V7.12.229 Auth Gate Test passed
- localStorage-only readability controls stayed preserved
- Theme Projector bridge stayed preserved
- text scale, contrast, reduced motion and preferred player boost reminder stayed preserved
- no Supabase writes were added

## User save-page boundary

Watchlist, Favourites and Likes are user-account save pages. Keep signed-in user scope, existing user-owned table reads and shared save helpers. Do not turn these into admin/owner permission pages.

## Accessibility boundary

Accessibility is a local comfort/readability page. It must not become a Supabase writer and must not take over Theme Studio colour ownership or Player 1's real audio boost controls.

## Browse group boundary

Supabase Library Editor is admin/owner only because it can create, edit, upload poster URLs and permanently delete `sb_movies` rows. Genres, Global Search and About must each be handled page-by-page and must keep their own existing role model. Do not attach the gate from Header Shell.

## News Feed media issue logged for later

File:

`news-feed-social-v7-13-001-test.html`

Status:

`LOGGED / FIX LATER IN A DEDICATED SOCIAL NEWS FEED MEDIA LAYOUT PASS`

Observed from Trevor's browser screenshot:

- Latest Activity post renders account header, post text and post media.
- The post image area does not show the full image used with the post.
- The video card/player area below appears as a large black media box.
- Trevor reports the video still plays, but the visible player/media is not correctly shown.

Future fix direction:

- inspect News Feed media-card CSS, image sizing, video/player sizing, poster/preview handling and overflow/height rules
- make the post image display correctly
- make the video player/card visibly show the intended media area
- preserve News Feed posts, comments, reactions, likes, visibility and account ownership behavior
- do not change SQL, RLS, storage policies, payments, owner/admin permissions or Header Shell gate behavior in that media layout pass unless separately approved

## Current route groups by function

### Platform / core watch

- Platform Entry: `index.html` — V7.13.021 Watch Group promoted
- Home: `home-global-helpers-v7-4-4-test.html`
- Library: `library-global-helpers-v7-4-8-test.html`
- Details: `details-clean-machine-v7-12-38-test.html`
- Player 1: `player-one-global-helpers-v7-3-3-test.html`
- Player 2: `player-2-clean-machine-v7-12-58-test.html`
- Continue Watching: `continue-watching-global-helpers-v7-3-9-test.html` — V7.12.231 auth gate passed
- Watch History: `watch-history-global-helpers-v7-4-0-test.html` — V7.12.227 auth gate passed
- Watchlist: `watchlist-clean-machine-v7-12-43-test.html` — V7.12.160 auth gate passed
- Favourites: `favourites-clean-machine-v7-12-41-test.html` — V7.12.160 auth gate passed
- Likes: `likes-clean-machine-v7-12-42-test.html` — V7.12.159 auth gate passed
- Accessibility: `accessibility-clean-machine-v7-12-44-test.html` — V7.12.229 auth gate passed

### Browse group

- Supabase Library Editor: `supabase-library-home-header-form-fix-v7-12-34-test.html` — V7.12.279 auth gate plus admin lock passed
- Genres: `genres-clean-machine-v7-12-45-test.html`
- Global Search: `global-search-global-helpers-v7-4-9-test.html`
- About: `about-global-helpers-v7-4-7-test.html`

### Social group

- Social Profile: `profile-social-v7-13-001-test.html`
- Friends: `friends-social-v7-13-001-test.html`
- News Feed: `news-feed-social-v7-13-001-test.html` — media display issue logged for later
- Groups and Events: `groups-social-v7-13-001-test.html`

### Creator / library management

- Submit Video: `submit-video-clean-machine-v7-12-79-test.html`
- Rules: `rules-clean-machine-v7-12-82-test.html`
- Review Queue: `review-queue-clean-machine-v7-12-80-publish-test.html`
