# Stream Bandit Current App Manifest V7.13.080

Date: 2026-06-21

Filename remains `CURRENT-APP-MANIFEST-V7-12-180.md` because protected scanner pages and One Machine reference this file.

This manifest records the current app route state, current safe rollout state, and deferred issues. No new checkpoint file was created.

## Current strongest checkpoint

`V7.13.080 Auth Gate Controlled Watch Group Pass / Continue Watching Passed / Watch History Passed / Watchlist Passed / Favourites Passed / Likes Passed / News Feed Media Issue Logged`

## Current pass status

`AUTH GATE CONTROLLED ROLLOUT UPDATED / USER SAVE PAGES PASSED / NEWS FEED MEDIA DISPLAY BUG LOGGED FOR LATER`

Confirmed boundaries:

- no new file created
- no checkpoint file created
- no SQL change
- no RLS change
- no storage policy change
- no payment change
- no production Home replacement
- no player/audio/accessibility regression work
- no Header Shell mass auth-gate injection
- no admin or owner permission-system change
- no News Feed code change during this documentation pass

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

## Current watch-group results

### Continue Watching

- upgraded from V7.12.230 to V7.12.231 Continue Watching Auth Gate Test
- auth gate script added directly after `stream-bandit-shell-v6-24.js`
- helper calls `StreamBanditAuthGate.enforce()`
- Trevor confirmed a full pass
- read-only progress, dedupe, resume links, save buttons, Details links and clean navigation stayed preserved

### Watch History

- upgraded from V7.12.226 to V7.12.227 Watch History Auth Gate Test
- auth gate script added directly after `stream-bandit-shell-v6-24.js`
- helper calls `StreamBanditAuthGate.enforce()`
- Trevor confirmed Watch History passed
- read-only history/progress, dedupe, resume links, save buttons, Details links and theme tabs stayed preserved

### Watchlist

- upgraded from V7.12.159 to V7.12.160 Watchlist Auth Gate Test
- visible badge is `V7.12.160 Watchlist · Auth Gate Test`
- auth gate script added directly after `stream-bandit-shell-v6-24.js`
- helper calls `StreamBanditAuthGate.enforce()`
- Trevor confirmed Watchlist passed
- `sb_watchlist` read, search/filter, sort, shared save buttons, Details links, Player 1 links and clean top rail stayed preserved

### Favourites

- upgraded from V7.12.159 to V7.12.160 Favourites Auth Gate Test
- visible badge is `V7.12.160 Favourites · Auth Gate Test`
- auth gate script added directly after `stream-bandit-shell-v6-24.js`
- helper calls `StreamBanditAuthGate.enforce()`
- Trevor confirmed Favourites passed
- `sb_favourites` read, search/filter, sort, shared save buttons, Details links, Player 1 links and clean top rail stayed preserved

### Likes

- upgraded from V7.12.158 to V7.12.159 Likes Auth Gate Test
- visible badge is `V7.12.159 Likes · Auth Gate Test`
- auth gate script added directly after `stream-bandit-shell-v6-24.js`
- helper calls `StreamBanditAuthGate.enforce()`
- Trevor confirmed Likes passed
- `sb_likes` read, search/filter, sort, shared save buttons, Details links, Player 1 links and clean top rail stayed preserved

## User save-page boundary

Watchlist, Favourites and Likes are user-account save pages. Keep signed-in user scope, existing user-owned table reads and shared save helpers. Do not turn these into admin/owner permission pages.

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

- Platform Entry: `index.html`
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
- Accessibility: `accessibility-clean-machine-v7-12-44-test.html`

### Social group

- Social Profile: `profile-social-v7-13-001-test.html`
- Friends: `friends-social-v7-13-001-test.html`
- News Feed: `news-feed-social-v7-13-001-test.html` — media display issue logged for later
- Groups and Events: `groups-social-v7-13-001-test.html`

### Creator / library management

- Submit Video: `submit-video-clean-machine-v7-12-79-test.html`
- Rules: `rules-clean-machine-v7-12-82-test.html`
- Review Queue: `review-queue-clean-machine-v7-12-80-publish-test.html`

### Owner group current menu exposure

- Form Inbox
- One Machine
- Platform Control Centre
- Final Shell Navigation
- Brand / App Icons
- Brand Image Helper
- Favicon / App Icon Builder
