# Stream Bandit Current App Manifest V7.13.098

Date: 2026-06-22

Filename remains `CURRENT-APP-MANIFEST-V7-12-180.md` because protected scanner pages and One Machine reference this file.

## Current strongest status

`V7.13.098 Watch Group Full Pass / Browse Group Full Pass / Creator Group Auth Gate Full Pass / Group Play Playlists Auth Gate Passed / Group Play Channels Auth Gate Passed / Group Play My Channel Auth Gate Passed / Mux Manager Live Candidate / Index Promoted`

Checkpoint files still in force:

- `CHECKPOINT-CREATOR-GROUP-AUTH-GATE-FULL-PASS-V7-13-095.md`
- `CHECKPOINT-MUX-MANAGER-LIVE-CANDIDATE-V7-13-090.md`
- `CHECKPOINT-BROWSE-GROUP-AUTH-GATE-FULL-PASS-V7-13-085.md`
- `CHECKPOINT-WATCH-GROUP-AUTH-GATE-FULL-PASS-V7-13-080.md`

No new rollback checkpoint was created for the Playlists, Channels or My Channel page pass because cleanup/checkpoint happens after the full Group Play group pass.

## Current pass status

`WATCH GROUP AUTH GATE FULL PASS / BROWSE GROUP AUTH GATE FULL PASS / CREATOR GROUP AUTH GATE FULL PASS / GROUP PLAY PLAYLISTS AUTH GATE PASSED / GROUP PLAY CHANNELS AUTH GATE PASSED / GROUP PLAY MY CHANNEL AUTH GATE PASSED / SUBMIT VIDEO AUTH GATE PASSED / RULES AUTH GATE PASSED / REVIEW QUEUE AUTH GATE PASSED / MUX MANAGER LIVE CANDIDATE PASSED / INDEX PROMOTED TO CREATOR GROUP FULL PASS AND MEDIA MANAGEMENT LIVE CANDIDATE`

Confirmed boundaries for this page pass:

- no SQL change
- no RLS change
- no storage policy change
- no payment change
- no production Home replacement
- no Header Shell mass auth-gate injection
- no admin or owner permission-system rewrite
- no Playlists schema change
- no Playlists Supabase Library editor access added
- no Playlists public unrestricted playlist write path added
- no Playlists all-users-private fallback added
- no Channels schema change
- no Channels `is_public` column dependency added
- no Channels Supabase Library editor access added
- no Channels public unrestricted channel write path added
- no Channels all-users-private fallback added
- no My Channel schema change
- no My Channel all-users-content fallback added
- no My Channel Supabase Library editor access added
- no My Channel channel-specific write lock change in this auth-gate pass
- no Player 1 or Player 2 playback-code change during this documentation pass

## Index promotion

File promoted:

`index.html`

Index version remains:

`V7.13.024 Platform Entry Creator Group Full Pass + Mux Manager Live Candidate`

Index currently lists Watch Group, Browse Group, Creator Group and the Mux Manager media-management live candidate using existing current page URLs. Home remains:

`home-global-helpers-v7-4-4-test.html`

Group Play is not promoted as a full group yet. Playlists, Channels and My Channel have passed in this group so far.

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
- Rules: `rules-clean-machine-v7-12-82-test.html`
- Review Queue: `review-queue-clean-machine-v7-12-80-publish-test.html`
- Playlists: `playlists-global-helpers-v7-5-2-test.html`
- Channels: `channels-global-helpers-v7-5-3-test.html`
- My Channel: `my-channel-clean-machine-v7-12-47-test.html`

## Mux Manager media-management live candidate

File: `mux-manager-global-helpers-v7-10-7-test.html`

Version: `V7.12.308 Mux Manager Stale ID Recovery + Collection Attach`

Status: `PASSED / LIVE CANDIDATE / OWNER ADMIN MEDIA STUDIO / MUX UPLOAD / POSTER UPLOAD / SUPABASE LIBRARY PUBLISH / PLAYLIST CHANNEL COLLECTION ATTACH`

Mux Manager remains the owner/admin media-management upload studio live candidate. It is separate from Submit Video and does not create a public unrestricted upload path.

## Browse group full pass

- Supabase Library Editor: `supabase-library-home-header-form-fix-v7-12-34-test.html` - V7.12.279 auth gate plus admin lock passed
- Genres: `genres-clean-machine-v7-12-45-test.html` - V7.12.283 auth gate passed
- Global Search: `global-search-global-helpers-v7-4-9-test.html` - V7.12.284 auth gate passed
- About: `about-global-helpers-v7-4-7-test.html` - V7.12.285 auth gate passed

## Creator group full pass

- Submit Video: `submit-video-clean-machine-v7-12-79-test.html` - V7.12.289 auth gate passed
- Rules: `rules-clean-machine-v7-12-82-test.html` - V7.12.291 auth gate passed, read-only truth map preserved
- Review Queue: `review-queue-clean-machine-v7-12-80-publish-test.html` - V7.12.290 auth gate passed; preview/playback compatibility still logged

Trevor confirmed the Rules browser test passed, completing the Creator Group pass.

## Group Play controlled pass

Group Play is now in progress page-by-page. This is not a full group pass yet.

### Playlists

File: `playlists-global-helpers-v7-5-2-test.html`

Version: `V7.12.292 Playlists Auth Gate Test`

Status: `PASSED / GROUP PLAY PAGE PASS / SIGNED-IN PLAYLISTS / OWN PLAYLIST WRITES ONLY / ENTITLEMENTS PRESERVED`

Trevor browser-test result:

- Playlists passed the Auth Gate test
- signed-out users hit Auth Gate first
- signed-in page loads
- playlist browsing stayed preserved
- tabs stayed preserved
- existing own-playlist create/edit/delete behavior stayed page-owned and entitlement-limited
- add/remove videos to own playlists stayed page-owned and entitlement-limited
- no schema change
- no Supabase Library editor access
- no index or registry promotion
- no all-users-private fallback
- no Header Shell mass auth-gate embedding

### Channels

File: `channels-global-helpers-v7-5-3-test.html`

Version: `V7.12.293 Channels Auth Gate Test`

Status: `PASSED / GROUP PLAY PAGE PASS / SIGNED-IN CHANNELS / PROFILE CHANNEL AND OWN EXTRA CHANNEL WRITES PRESERVED / ENTITLEMENTS PRESERVED`

Trevor browser-test result:

- Channels passed the Auth Gate test
- signed-out users hit Auth Gate first
- signed-in page loads
- channel browsing stayed preserved
- tabs stayed preserved
- profile channel edit stayed on `sb_profiles`
- extra channel create/edit/delete stayed on owned `sb_channels` rows only
- movie attach/remove stayed through `sb_group_play_set_movie_channel`
- working `sb_channels` column list preserved with no `is_public` dependency
- no schema change
- no Supabase Library editor access
- no index or registry promotion
- no all-users-private fallback
- no Header Shell mass auth-gate embedding

### My Channel

File: `my-channel-clean-machine-v7-12-47-test.html`

Version: `V7.12.294 My Channel Auth Gate Test`

Status: `PASSED / GROUP PLAY PAGE PASS / SIGNED-IN MY CHANNEL / PROFILE CHANNEL WRITES PRESERVED / OWNED DATA ONLY / ENTITLEMENTS PRESERVED`

Trevor browser-test result:

- My Channel passed the Auth Gate test
- hard refresh passed
- signed-out users hit Auth Gate first
- sign-in returned correctly
- My Channel loaded
- Dashboard tab worked
- Edit Profile Channel tab opened
- My Videos tab opened
- Submissions tab opened
- Permissions tab opened
- Rules tab opened
- Play My Videos In Player 2 opened the Player 2 queue when playable videos exist
- profile channel identity stayed on `sb_profiles`
- owned movies stayed scoped to `sb_movies.owner_id`
- owned submissions stayed scoped to `sb_submissions.submitter_id`
- no schema change
- no Supabase Library editor access
- no index or registry promotion
- no all-users-content fallback
- no Header Shell mass auth-gate embedding

Pending Group Play pages:

- Collections: `collections-clean-machine-v7-12-51-test.html`
- Player 2: `player-2-clean-machine-v7-12-58-test.html`

## Future fix plan logged: channel-specific video placement lock

Status: `LOGGED / NOT PART OF MY CHANNEL AUTH GATE PASS / DO NOT FIX UNTIL DEDICATED PASS`

Trevor noticed a wider workflow risk: non-owner/non-admin users should only be able to place or assign videos into channels they created or own. They should not be able to place videos into arbitrary channels. This is not a My Channel page defect and was not changed in the My Channel auth-gate pass.

Dedicated future pass requirement:

1. First scan current Supabase Library Editor source.
2. Then scan current Mux Manager source.
3. Then scan Channels and My Channel source if needed.
4. Confirm exact table columns and existing RLS behavior before code changes.
5. Preserve owner/admin media-management rights.
6. For normal creator users, restrict channel selection/assignment UI to channels owned by the signed-in user.
7. Keep direct database/RLS protection as the real authority.
8. No SQL, RLS, schema or storage policy change unless Trevor explicitly approves a separate backend pass.

Candidate pages for that future pass:

- `supabase-library-home-header-form-fix-v7-12-34-test.html`
- `mux-manager-global-helpers-v7-10-7-test.html`
- `channels-global-helpers-v7-5-3-test.html`
- `my-channel-clean-machine-v7-12-47-test.html` only if the scan proves it needs UI wording or read-only status changes

## Current Watch Group results

- Continue Watching: `continue-watching-global-helpers-v7-3-9-test.html` - V7.12.231 auth gate passed
- Watch History: `watch-history-global-helpers-v7-4-0-test.html` - V7.12.227 auth gate passed
- Watchlist: `watchlist-clean-machine-v7-12-43-test.html` - V7.12.160 auth gate passed
- Favourites: `favourites-clean-machine-v7-12-41-test.html` - V7.12.160 auth gate passed
- Likes: `likes-clean-machine-v7-12-42-test.html` - V7.12.159 auth gate passed
- Accessibility: `accessibility-clean-machine-v7-12-44-test.html` - V7.12.229 auth gate passed

## Known issues logged for later

- News Feed media display issue remains logged for a dedicated Social News Feed media layout pass.
- Player 1 Details link can open the wrong movie and needs a dedicated Player 1 current-row/details-link pass.
- Review Queue preview/playback compatibility remains logged for a later focused pass.
- Channel-specific video placement lock remains logged for a dedicated future workflow/security UI pass after Supabase Library Editor and Mux Manager scans.

## Current route groups by function

### Platform / core watch

- Platform Entry: `index.html` - V7.13.024 Creator Group full pass + Mux Manager live candidate promoted
- Home: `home-global-helpers-v7-4-4-test.html`
- Library: `library-global-helpers-v7-4-8-test.html`
- Details: `details-clean-machine-v7-12-38-test.html`
- Player 1: `player-one-global-helpers-v7-3-3-test.html`
- Player 2: `player-2-clean-machine-v7-12-58-test.html`
- Continue Watching: `continue-watching-global-helpers-v7-3-9-test.html`
- Watch History: `watch-history-global-helpers-v7-4-0-test.html`
- Watchlist: `watchlist-clean-machine-v7-12-43-test.html`
- Favourites: `favourites-clean-machine-v7-12-41-test.html`
- Likes: `likes-clean-machine-v7-12-42-test.html`
- Accessibility: `accessibility-clean-machine-v7-12-44-test.html`

### Browse / media-management group

- Supabase Library Editor: `supabase-library-home-header-form-fix-v7-12-34-test.html`
- Mux Manager: `mux-manager-global-helpers-v7-10-7-test.html` - V7.12.308 live candidate
- Collections: `collections-clean-machine-v7-12-51-test.html`
- Playlists: `playlists-global-helpers-v7-5-2-test.html` - V7.12.292 auth gate passed
- Channels: `channels-global-helpers-v7-5-3-test.html` - V7.12.293 auth gate passed
- Genres: `genres-clean-machine-v7-12-45-test.html`
- Global Search: `global-search-global-helpers-v7-4-9-test.html`
- About: `about-global-helpers-v7-4-7-test.html`

### Creator group

- Submit Video: `submit-video-clean-machine-v7-12-79-test.html` - V7.12.289 auth gate passed
- Rules: `rules-clean-machine-v7-12-82-test.html` - V7.12.291 auth gate passed
- Review Queue: `review-queue-clean-machine-v7-12-80-publish-test.html` - V7.12.290 auth gate passed

### Group Play pass in progress

- Playlists: `playlists-global-helpers-v7-5-2-test.html` - V7.12.292 auth gate passed
- Channels: `channels-global-helpers-v7-5-3-test.html` - V7.12.293 auth gate passed
- My Channel: `my-channel-clean-machine-v7-12-47-test.html` - V7.12.294 auth gate passed
- Collections: `collections-clean-machine-v7-12-51-test.html` - pending
- Player 2: `player-2-clean-machine-v7-12-58-test.html` - pending
