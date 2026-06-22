# Stream Bandit Current App Manifest V7.13.090

Date: 2026-06-21

Filename remains `CURRENT-APP-MANIFEST-V7-12-180.md` because protected scanner pages and One Machine reference this file.

## Current strongest checkpoint

`V7.13.090 Watch Group Full Pass / Browse Group Full Pass / Creator Group Started / Mux Manager Live Candidate / Supabase Library Publish Passed / Playlist Channel Collection Attach Passed / Index Promoted`

Checkpoint files:

- `CHECKPOINT-WATCH-GROUP-AUTH-GATE-FULL-PASS-V7-13-080.md`
- `CHECKPOINT-BROWSE-GROUP-AUTH-GATE-FULL-PASS-V7-13-085.md`
- `CHECKPOINT-MUX-MANAGER-LIVE-CANDIDATE-V7-13-090.md`

## Current pass status

`WATCH GROUP AUTH GATE FULL PASS / BROWSE GROUP AUTH GATE FULL PASS / USER SAVE PAGES PASSED / ACCESSIBILITY PASSED / SUBMIT VIDEO AUTH GATE PASSED / REVIEW QUEUE AUTH GATE PASSED / MUX MANAGER V7.12.308 LIVE CANDIDATE PASSED / MUX UPLOAD PASSED / POSTER UPLOAD PASSED / SUPABASE LIBRARY PUBLISH PASSED / PLAYLIST ATTACH PASSED / CHANNEL ATTACH PASSED / COLLECTION ATTACH PASSED / INDEX PROMOTED TO MEDIA MANAGEMENT LIVE CANDIDATE`

Confirmed boundaries:

- no SQL change
- no RLS change
- no storage policy change
- no payment change
- no production Home replacement
- no player/audio/accessibility comfort regression work
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
- no Review Queue approval/publish logic changed during Review Queue gate pass
- no Player 1 or Player 2 playback-code change during this documentation pass
- no private Mux token ID, Mux token secret, webhook secret, signing key or service-role key added to GitHub Pages, HTML or JavaScript

## Index promotion

File promoted:

`index.html`

Index version:

`V7.13.023 Platform Entry Mux Manager Live Candidate`

Index now lists Watch Group, Browse Group and the Mux Manager media-management live candidate using existing current page URLs. Home remains:

`home-global-helpers-v7-4-4-test.html`

Watch Group links:

- Continue Watching: `continue-watching-global-helpers-v7-3-9-test.html`
- Watch History: `watch-history-global-helpers-v7-4-0-test.html`
- Watchlist: `watchlist-clean-machine-v7-12-43-test.html`
- Favourites: `favourites-clean-machine-v7-12-41-test.html`
- Likes: `likes-clean-machine-v7-12-42-test.html`
- Accessibility: `accessibility-clean-machine-v7-12-44-test.html`

Browse / media-management links:

- Supabase Library Editor: `supabase-library-home-header-form-fix-v7-12-34-test.html`
- Mux Manager: `mux-manager-global-helpers-v7-10-7-test.html`
- Collections: `collections-clean-machine-v7-12-51-test.html`
- Playlists: `playlists-global-helpers-v7-5-2-test.html`
- Channels: `channels-global-helpers-v7-5-3-test.html`
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
- Review Queue: `review-queue-clean-machine-v7-12-80-publish-test.html`

## Mux Manager media-management live candidate

File: `mux-manager-global-helpers-v7-10-7-test.html`

Version: `V7.12.308 Mux Manager Stale ID Recovery + Collection Attach`

Status: `PASSED / LIVE CANDIDATE / OWNER ADMIN MEDIA STUDIO / MUX UPLOAD / POSTER UPLOAD / SUPABASE LIBRARY PUBLISH / PLAYLIST CHANNEL COLLECTION ATTACH`

Trevor browser-test result:

- Mux upload slot creation passed
- video upload to Mux passed using UpChunk
- processing check returned public HLS `.m3u8`
- public player URL worked
- poster upload created a 1920x1080 Supabase Storage public URL
- Mux Asset Library overlay worked
- Video Settings modal worked
- local target saving worked
- publish to Supabase Library worked through `sb_movies`
- playlist attach worked through `sb_playlist_movies`
- channel attach worked through `sb_group_play_set_movie_channel`
- collection attach worked through `sb_collection_movies` after stale movie ID recovery
- second movie upload passed, proving the workflow is repeatable

Important V7.12.308 fix:

- verifies or recovers the real `sb_movies.id` before playlist, collection or channel attach
- stale local browser movie IDs are repaired by saved ID, `video_url`, `mux_playback_url`, playback ID search or title fallback
- creates a new `sb_movies` row only if no matching row exists
- protects playlist and collection attach against duplicate link rows
- adds a `Repair Local Movie ID` button in Video Settings

Mux Manager table / service paths:

- `sb_movies`
- `sb_playlist_movies`
- `sb_collection_movies`
- `sb_group_play_set_movie_channel`
- Supabase Storage bucket `stream-bandit-images`
- Supabase Edge Function `mux-create-direct-upload`

Mux Manager is now part of the Browse / Supabase Library / media-management group and should be treated as the owner/admin upload studio live candidate. For new owner/admin video uploads, the old Maestro upload workflow can be retired in favor of Mux Manager. Existing Maestro/source compatibility work for Player 1, Player 2 or Review Queue remains a separate playback compatibility task only if needed.

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

### About

File: `about-global-helpers-v7-4-7-test.html`

Version: `V7.12.285 About Auth Gate Test`

Status: `PASSED / SIGNED-IN INFORMATION PAGE / EMAIL-DRAFT-ONLY FORMS PRESERVED`

## Creator group status

Creator group routes:

- Submit Video: `submit-video-clean-machine-v7-12-79-test.html` — V7.12.289 auth gate passed
- Rules: `rules-clean-machine-v7-12-82-test.html` — pending Creator group auth gate pass
- Review Queue: `review-queue-clean-machine-v7-12-80-publish-test.html` — V7.12.290 auth gate passed; preview/playback compatibility still logged

Submit Video remains signed-in creator submission into `sb_submissions` only. Review Queue remains the admin/owner review and publish gate.

## Current Watch Group results

- Continue Watching: `continue-watching-global-helpers-v7-3-9-test.html` — V7.12.231 auth gate passed
- Watch History: `watch-history-global-helpers-v7-4-0-test.html` — V7.12.227 auth gate passed
- Watchlist: `watchlist-clean-machine-v7-12-43-test.html` — V7.12.160 auth gate passed
- Favourites: `favourites-clean-machine-v7-12-41-test.html` — V7.12.160 auth gate passed
- Likes: `likes-clean-machine-v7-12-42-test.html` — V7.12.159 auth gate passed
- Accessibility: `accessibility-clean-machine-v7-12-44-test.html` — V7.12.229 auth gate passed

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

- Platform Entry: `index.html` — V7.13.023 Mux Manager live candidate promoted
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
- Mux Manager: `mux-manager-global-helpers-v7-10-7-test.html` — V7.12.308 live candidate
- Collections: `collections-clean-machine-v7-12-51-test.html`
- Playlists: `playlists-global-helpers-v7-5-2-test.html`
- Channels: `channels-global-helpers-v7-5-3-test.html`
- Genres: `genres-clean-machine-v7-12-45-test.html`
- Global Search: `global-search-global-helpers-v7-4-9-test.html`
- About: `about-global-helpers-v7-4-7-test.html`

### Creator / library management

- Submit Video: `submit-video-clean-machine-v7-12-79-test.html`
- Rules: `rules-clean-machine-v7-12-82-test.html`
- Review Queue: `review-queue-clean-machine-v7-12-80-publish-test.html`

### Social group

- Social Profile: `profile-social-v7-13-001-test.html`
- Friends: `friends-social-v7-13-001-test.html`
- News Feed: `news-feed-social-v7-13-001-test.html`
- Groups and Events: `groups-social-v7-13-001-test.html`
