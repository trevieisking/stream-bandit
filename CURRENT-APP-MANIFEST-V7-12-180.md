# Stream Bandit Current App Manifest V7.13.099

Date: 2026-06-22

Filename remains `CURRENT-APP-MANIFEST-V7-12-180.md` because protected scanner pages and One Machine reference this file.

## Current strongest status

`V7.13.099 Watch Group Full Pass / Browse Group Full Pass / Creator Group Auth Gate Full Pass / Group Play Playlists Auth Gate Passed / Group Play Channels Auth Gate Passed / Group Play My Channel Auth Gate Passed / Group Play Collections Auth Gate Passed / Mux Manager Live Candidate / Index Promoted`

Checkpoint files still in force:

- `CHECKPOINT-CREATOR-GROUP-AUTH-GATE-FULL-PASS-V7-13-095.md`
- `CHECKPOINT-MUX-MANAGER-LIVE-CANDIDATE-V7-13-090.md`
- `CHECKPOINT-BROWSE-GROUP-AUTH-GATE-FULL-PASS-V7-13-085.md`
- `CHECKPOINT-WATCH-GROUP-AUTH-GATE-FULL-PASS-V7-13-080.md`

No new rollback checkpoint was created for the Playlists, Channels, My Channel or Collections page pass because cleanup/checkpoint happens after the full Group Play group pass.

## Current pass status

`WATCH GROUP AUTH GATE FULL PASS / BROWSE GROUP AUTH GATE FULL PASS / CREATOR GROUP AUTH GATE FULL PASS / GROUP PLAY PLAYLISTS AUTH GATE PASSED / GROUP PLAY CHANNELS AUTH GATE PASSED / GROUP PLAY MY CHANNEL AUTH GATE PASSED / GROUP PLAY COLLECTIONS AUTH GATE PASSED / SUBMIT VIDEO AUTH GATE PASSED / RULES AUTH GATE PASSED / REVIEW QUEUE AUTH GATE PASSED / MUX MANAGER LIVE CANDIDATE PASSED / INDEX PROMOTED TO CREATOR GROUP FULL PASS AND MEDIA MANAGEMENT LIVE CANDIDATE`

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
- no Collections schema change
- no Collections storage policy change
- no Collections Supabase Library editor access added
- no Collections all-users-private fallback added
- no Collections channel-specific placement-lock change in this auth-gate pass
- no Player 1 or Player 2 playback-code change during this documentation pass

## Index promotion

File promoted:

`index.html`

Index version remains:

`V7.13.024 Platform Entry Creator Group Full Pass + Mux Manager Live Candidate`

Index currently lists Watch Group, Browse Group, Creator Group and the Mux Manager media-management live candidate using existing current page URLs. Home remains:

`home-global-helpers-v7-4-4-test.html`

Group Play is not promoted as a full group yet. Playlists, Channels, My Channel and Collections have passed in this group so far.

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
- Collections: `collections-clean-machine-v7-12-51-test.html`

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

### Channels

File: `channels-global-helpers-v7-5-3-test.html`

Version: `V7.12.293 Channels Auth Gate Test`

Status: `PASSED / GROUP PLAY PAGE PASS / SIGNED-IN CHANNELS / PROFILE CHANNEL AND OWN EXTRA CHANNEL WRITES PRESERVED / ENTITLEMENTS PRESERVED`

### My Channel

File: `my-channel-clean-machine-v7-12-47-test.html`

Version: `V7.12.294 My Channel Auth Gate Test`

Status: `PASSED / GROUP PLAY PAGE PASS / SIGNED-IN MY CHANNEL / PROFILE CHANNEL WRITES PRESERVED / OWNED DATA ONLY / ENTITLEMENTS PRESERVED`

### Collections

File: `collections-clean-machine-v7-12-51-test.html`

Version: `V7.12.295 Collections Auth Gate Test`

Status: `PASSED / GROUP PLAY PAGE PASS / SIGNED-IN COLLECTIONS / COLLECTION STUDIO PRESERVED / ADD REMOVE VIDEOS PRESERVED / PERMISSIONS DEBUG PLAY QUEUE PRESERVED`

Trevor browser-test result:

- hard refresh passed
- signed-out users hit Auth Gate first
- sign-in returned correctly
- Collections loaded
- Browse tab worked
- Collection Studio tab opened
- Add / Remove Videos tab opened
- Permissions tab opened
- Debug tab opened
- Play Selected In Player 2 worked when selected collection has playable videos
- existing `sb_collections`, `sb_collection_movies`, `sb_movies` and storage artwork behavior stayed preserved
- no schema change
- no storage policy change
- no Supabase Library editor access
- no index or registry promotion
- no Header Shell mass auth-gate embedding

Pending Group Play pages:

- Player 2: `player-2-clean-machine-v7-12-58-test.html`

## Clarified future fix plan: video output / channel placement locks

Status: `LOGGED / DEDICATED FUTURE PASS ONLY / NOT PART OF COLLECTIONS AUTH GATE PASS`

Trevor clarified the intended architecture:

- Supabase Library Editor and Mux Manager are the two pages that currently control video outputs, video creation/publishing, and placement forms.
- Those two pages need the future form-specific locks.
- Normal creator-style users should only be able to add/place videos into their own created channels, collections and playlists, not everyone else's.
- Owner/admin media-management rights must remain global.
- Channels creates channels and renders channel state.
- My Channel renders signed-in profile/channel state and owned data.
- Collections creates collections and renders collections.
- Playlists creates playlists and renders playlists.
- The Group Play render/manage pages are not the first target of the channel-placement lock fix. Do not fix those pages for this issue unless a later source scan proves one is actually commanding the video-output placement that belongs in Supabase Library Editor or Mux Manager.

Required future workflow:

1. First scan current Supabase Library Editor source.
2. Then scan current Mux Manager source.
3. Identify the exact forms/selectors that assign videos to channels, collections and playlists.
4. Preserve owner/admin global placement rights.
5. For normal creator-style users, restrict placement selectors to the signed-in user's own created groups.
6. Do not add SQL, RLS, schema or storage policy changes unless Trevor separately approves a backend pass.
7. Do not treat the Group Play render pages as the command source for this fix unless the scan proves otherwise.

Primary candidate pages for that future pass:

- `supabase-library-home-header-form-fix-v7-12-34-test.html`
- `mux-manager-global-helpers-v7-10-7-test.html`

Render/create pages to preserve unless proven otherwise:

- `channels-global-helpers-v7-5-3-test.html`
- `my-channel-clean-machine-v7-12-47-test.html`
- `collections-clean-machine-v7-12-51-test.html`
- `playlists-global-helpers-v7-5-2-test.html`

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
- Video output / channel placement lock remains logged for a dedicated future pass focused first on Supabase Library Editor and Mux Manager.
