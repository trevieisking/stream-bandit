# Stream Bandit Current App Manifest V7.13.086

Date: 2026-06-21

Filename remains `CURRENT-APP-MANIFEST-V7-12-180.md` because protected scanner pages and One Machine reference this file.

## Current strongest checkpoint

`V7.13.086 Watch Group Full Pass / Browse Group Full Pass / Creator Group Started / Submit Video Auth Gate Passed / Manifest Updated`

Checkpoint files:

- `CHECKPOINT-WATCH-GROUP-AUTH-GATE-FULL-PASS-V7-13-080.md`
- `CHECKPOINT-BROWSE-GROUP-AUTH-GATE-FULL-PASS-V7-13-085.md`

## Current pass status

`WATCH GROUP AUTH GATE FULL PASS / BROWSE GROUP AUTH GATE FULL PASS / USER SAVE PAGES PASSED / ACCESSIBILITY PASSED / SUBMIT VIDEO AUTH GATE PASSED / CREATOR GROUP IN PROGRESS / REVIEW QUEUE PREVIEW FIX REQUESTED / NEWS FEED MEDIA ISSUE LOGGED FOR LATER`

Confirmed boundaries:

- no SQL change
- no RLS change
- no storage policy change
- no payment change
- no production Home replacement
- no player/audio/accessibility regression work
- no Header Shell mass auth-gate injection
- no admin or owner permission-system rewrite
- no schema fields invented for Supabase Library Editor
- no storage delete added to Supabase Library Editor
- no `sb_movies` writes added to Genres
- no movie deletion added to Genres
- no Supabase writes added to Global Search
- no admin/owner role gate added to Global Search
- no Supabase writes added to About
- no live/publish/billing/policy edit action added to About
- no direct `sb_movies` publish added to Submit Video
- no Review Queue approval/publish logic changed during Submit Video pass

## Index promotion

File promoted:

`index.html`

Index version:

`V7.13.022 Platform Entry Browse Group Promoted`

Index lists the passed Watch Group and Browse Group using existing old/current URLs. Home remains:

`home-global-helpers-v7-4-4-test.html`

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
- Genres: `genres-clean-machine-v7-12-45-test.html`
- Global Search: `global-search-global-helpers-v7-4-9-test.html`
- About: `about-global-helpers-v7-4-7-test.html`
- Submit Video: `submit-video-clean-machine-v7-12-79-test.html`

## Browse group full pass

### Supabase Library Editor

File: `supabase-library-home-header-form-fix-v7-12-34-test.html`

Version: `V7.12.279 Supabase Library Editor Auth Gate Test`

Status: `FIRST-TIME PASS / AUTH GATE PLUS EXISTING ADMIN OWNER LOCK / EXACT ADMIN LOCK PATTERN TO REMEMBER`

Preserved:

- signed-out users hit Auth Gate first
- signed-in non-admin/non-owner users stay blocked by page admin lock
- admin/owner user can load editor controls
- `sb_movies` load, create, full edit, poster upload, Play All, Details, Play and copy ID stayed preserved
- permanent delete remains behind typed `DELETE FROM SUPABASE`
- create/edit/delete verify-after-write behavior stayed preserved

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
- movie rows and movie genre arrays are not deleted or edited

### Global Search

File: `global-search-global-helpers-v7-4-9-test.html`

Version: `V7.12.284 Global Search Auth Gate Test`

Status: `PASSED / SIGNED-IN READ-ONLY SEARCH / HEADER QUERY HANDOFF PRESERVED`

Preserved:

- read-only search stayed preserved
- `sb_movies`, optional `sb_channels`, optional `sb_playlists`, pages and policy results stayed preserved
- header query handoff stayed preserved
- search input, type filter, source filter, sort, chips, Details, Play and shared save buttons stayed preserved
- no admin/owner role check was added
- no Supabase writes were added

### About

File: `about-global-helpers-v7-4-7-test.html`

Version: `V7.12.285 About Auth Gate Test`

Status: `PASSED / SIGNED-IN INFORMATION PAGE / EMAIL-DRAFT-ONLY FORMS PRESERVED`

Preserved:

- signed-out users are blocked by Auth Gate before using About
- page remains informational and read-only
- contact/request/playback/accessibility/creator/policy/removal/business/bug forms remain mailto/email-draft-only
- no Supabase writes, tickets, uploads, billing, live promotion or policy editing were added
- policy links, modal scroll behavior, header counters, clean top rail and helper bridges stayed preserved

## Creator group in progress

Creator group routes:

- Submit Video: `submit-video-clean-machine-v7-12-79-test.html` — V7.12.289 auth gate passed
- Rules: `rules-clean-machine-v7-12-82-test.html` — pending Creator group auth gate pass
- Review Queue: `review-queue-clean-machine-v7-12-80-publish-test.html` — pending Creator group auth gate pass and video preview fix requested

### Submit Video pass

File: `submit-video-clean-machine-v7-12-79-test.html`

Version: `V7.12.289 Submit Video Auth Gate Test`

Status: `PASSED / SIGNED-IN CREATOR SUBMISSION / PENDING SB_SUBMISSIONS ONLY / REVIEW QUEUE BRIDGE PRESERVED`

Trevor browser-test result:

- sign out then sign in passed
- one Header and one Footer passed
- submitting video goes to Review Queue passed
- all other checked page functions passed

Preserved Submit Video behavior and locks:

- shared Auth Gate blocks signed-out users before page use
- signed-in creator submission flow stayed preserved
- poster upload stayed preserved
- channel read stayed preserved
- recent submission read stayed preserved
- pending submission insert stayed preserved
- verify-after-insert read stayed preserved
- write target remains `sb_submissions` only
- status remains `pending`
- Review Queue remains the only publish path into `sb_movies`
- no direct `sb_movies` write/publish added to Submit Video
- no admin-only conversion added to Submit Video
- no SQL, RLS, storage policy, payment, schema or Header Shell mass-gate change

### Review Queue preview request

File: `review-queue-clean-machine-v7-12-80-publish-test.html`

Requested next fix:

- add a real video preview before approval
- reviewer must be able to test the submitted URL before approving
- prefer Player 1-style preview behavior
- preview can appear below the card or in an overlay
- do not weaken Review Queue admin/owner approval gate
- do not approve/publish unless reviewer has a working preview/test tool
- preserve approve, decline, request changes, save status and publish-to-library behavior

## Current Watch Group results

- Continue Watching: `continue-watching-global-helpers-v7-3-9-test.html` — V7.12.231 auth gate passed
- Watch History: `watch-history-global-helpers-v7-4-0-test.html` — V7.12.227 auth gate passed
- Watchlist: `watchlist-clean-machine-v7-12-43-test.html` — V7.12.160 auth gate passed
- Favourites: `favourites-clean-machine-v7-12-41-test.html` — V7.12.160 auth gate passed
- Likes: `likes-clean-machine-v7-12-42-test.html` — V7.12.159 auth gate passed
- Accessibility: `accessibility-clean-machine-v7-12-44-test.html` — V7.12.229 auth gate passed

## User save-page boundary

Watchlist, Favourites and Likes are user-account save pages. Keep signed-in user scope, existing user-owned table reads and shared save helpers. Do not turn these into admin/owner permission pages.

## Accessibility boundary

Accessibility is a local comfort/readability page. It must not become a Supabase writer and must not take over Theme Studio colour ownership or Player 1's real audio boost controls.

## Browse group boundary

Browse Group is permission-mixed and must stay page-by-page:

- Supabase Library Editor is admin/owner only.
- Genres is signed-in browse with admin/owner-only managed genre tools.
- Global Search is signed-in read-only search.
- About is signed-in info/contact with email-draft-only forms.

Do not attach the gate from Header Shell. Do not flatten Browse pages into one permission type.

## Creator group boundary

Creator Group is permission-mixed and must stay page-by-page:

- Submit Video is signed-in creator submission into `sb_submissions` only.
- Rules is read-only workflow guidance.
- Review Queue is admin/owner review and publish gate.

Do not publish directly from Submit Video. Do not give Review Queue powers to public viewer pages. Do not add unrestricted upload permissions. Do not move Creator permissions into Header Shell.

## Known issues logged for later

### News Feed media issue

File: `news-feed-social-v7-13-001-test.html`

Status: `LOGGED / FIX LATER IN A DEDICATED SOCIAL NEWS FEED MEDIA LAYOUT PASS`

- Latest Activity post renders account header, post text and post media.
- The post image area does not show the full image used with the post.
- The video card/player area below appears as a large black media box.
- Trevor reports the video still plays, but the visible player/media is not correctly shown.

### Player 1 Details-link issue

Player 1 Details can open the wrong movie and needs a dedicated Player 1 current-row/details-link pass. Preserve playback, audio boost, source bridge, resume helper, watch history and save buttons.

## Current route groups by function

### Platform / core watch

- Platform Entry: `index.html` — V7.13.022 Browse Group promoted
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
- Genres: `genres-clean-machine-v7-12-45-test.html` — V7.12.283 auth gate passed
- Global Search: `global-search-global-helpers-v7-4-9-test.html` — V7.12.284 auth gate passed
- About: `about-global-helpers-v7-4-7-test.html` — V7.12.285 auth gate passed

### Creator / library management

- Submit Video: `submit-video-clean-machine-v7-12-79-test.html` — V7.12.289 auth gate passed
- Rules: `rules-clean-machine-v7-12-82-test.html`
- Review Queue: `review-queue-clean-machine-v7-12-80-publish-test.html`

### Social group

- Social Profile: `profile-social-v7-13-001-test.html`
- Friends: `friends-social-v7-13-001-test.html`
- News Feed: `news-feed-social-v7-13-001-test.html` — media display issue logged for later
- Groups and Events: `groups-social-v7-13-001-test.html`
