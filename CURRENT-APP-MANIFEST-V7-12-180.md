# Stream Bandit Current App Manifest V7.13.100

Date: 2026-06-22

Filename remains `CURRENT-APP-MANIFEST-V7-12-180.md` because protected scanner pages and One Machine reference this file.

## Current strongest status

`V7.13.100 Watch Group Full Pass / Browse Group Full Pass / Creator Group Auth Gate Full Pass / Group Play Auth Gate Full Pass / Mux Manager Live Candidate / Index Promoted`

Current checkpoint files in force:

- `CHECKPOINT-GROUP-PLAY-AUTH-GATE-FULL-PASS-V7-13-100.md`
- `CHECKPOINT-CREATOR-GROUP-AUTH-GATE-FULL-PASS-V7-13-095.md`
- `CHECKPOINT-MUX-MANAGER-LIVE-CANDIDATE-V7-13-090.md`
- `CHECKPOINT-BROWSE-GROUP-AUTH-GATE-FULL-PASS-V7-13-085.md`
- `CHECKPOINT-WATCH-GROUP-AUTH-GATE-FULL-PASS-V7-13-080.md`

## Cleanup before Group Play rollback point

Three older checkpoint files were deleted before the new Group Play rollback checkpoint was created:

- `CHECKPOINT-FOCUSED-SCOPE-ZERO-MISSING-V7-12-56.md`
- `CHECKPOINT-LIVE-APP-ROLE-LOCK-PLAN-V7-12-64.md`
- `CHECKPOINT-WEB-BUILDER-PAGES-MANAGER-START-V7-12-107.md`

These were old superseded planning/checkpoint files and are not part of the current source-of-truth checkpoint chain.

## Current pass status

`WATCH GROUP AUTH GATE FULL PASS / BROWSE GROUP AUTH GATE FULL PASS / CREATOR GROUP AUTH GATE FULL PASS / GROUP PLAY AUTH GATE FULL PASS / SUBMIT VIDEO AUTH GATE PASSED / RULES AUTH GATE PASSED / REVIEW QUEUE AUTH GATE PASSED / MUX MANAGER LIVE CANDIDATE PASSED / INDEX PROMOTED TO GROUP PLAY FULL PASS AND MEDIA MANAGEMENT LIVE CANDIDATE`

Confirmed boundaries for this promotion/documentation pass:

- no SQL change
- no RLS change
- no storage policy change
- no payment change
- no production Home replacement
- no Header Shell mass auth-gate injection
- no admin or owner permission-system rewrite
- no Playlists schema change
- no Channels schema change
- no My Channel schema change
- no Collections schema change
- no Player 2 playback architecture rewrite
- no Supabase Library Editor or Mux Manager placement-lock code change in this pass

## Index promotion

File promoted:

`index.html`

Index version now:

`V7.13.100 Platform Entry Group Play Full Pass + Mux Manager Live Candidate`

Index now promotes Group Play as a full passed live-candidate group while keeping Home as the main app Home:

`home-global-helpers-v7-4-4-test.html`

Index includes Group Play live-candidate links:

- Playlists: `playlists-global-helpers-v7-5-2-test.html`
- Channels: `channels-global-helpers-v7-5-3-test.html`
- My Channel: `my-channel-clean-machine-v7-12-47-test.html`
- Collections: `collections-clean-machine-v7-12-51-test.html`
- Player 2: `player-2-clean-machine-v7-12-58-test.html`

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
- Player 2: `player-2-clean-machine-v7-12-58-test.html`

## Group Play full pass

Status: `PASSED / FULL GROUP PASS / LIVE CANDIDATE GROUP / INDEX PROMOTED`

### Playlists

File: `playlists-global-helpers-v7-5-2-test.html`

Version: `V7.12.292 Playlists Auth Gate Test`

Status: `PASSED / OWN PLAYLIST WRITES ONLY / ENTITLEMENTS PRESERVED`

### Channels

File: `channels-global-helpers-v7-5-3-test.html`

Version: `V7.12.293 Channels Auth Gate Test`

Status: `PASSED / PROFILE CHANNEL AND OWN EXTRA CHANNEL WRITES PRESERVED / ENTITLEMENTS PRESERVED`

### My Channel

File: `my-channel-clean-machine-v7-12-47-test.html`

Version: `V7.12.294 My Channel Auth Gate Test`

Status: `PASSED / PROFILE CHANNEL WRITES PRESERVED / OWNED DATA ONLY / ENTITLEMENTS PRESERVED`

### Collections

File: `collections-clean-machine-v7-12-51-test.html`

Version: `V7.12.295 Collections Auth Gate Test`

Status: `PASSED / COLLECTION STUDIO PRESERVED / ADD REMOVE VIDEOS PRESERVED / PERMISSIONS DEBUG PLAY QUEUE PRESERVED`

### Player 2

File: `player-2-clean-machine-v7-12-58-test.html`

Version: `V7.12.296 Player 2 Auth Gate Test`

Status: `PASSED / QUEUE PLAYER / AUDIO BOOST PRESERVED / PROGRESS PRESERVED / NEXT PREVIOUS PRESERVED`

Trevor browser-test result:

- hard refresh passed
- signed-out users hit Auth Gate first
- sign-in returned correctly
- Player 2 loaded
- queue/fallback loaded
- Play/Pause worked on HTML video
- audio boost worked on Mux/HLS/direct video
- Next/Previous queue buttons worked
- Comfort Controls tab opened
- Progress State tab opened
- Source Info tab opened
- Rules tab opened
- Checklist tab opened
- Debug tab opened

## Future polish note

Status: `LOGGED / DEDICATED FUTURE FUNCTIONAL PAGE ORGANIZATION AND PAGE POLISH PASS`

Trevor noted Group Play is functionally passed but visually/organizationally untidy. A later dedicated pass should improve page organization, page polish, rail clarity, layout consistency and user flow. This is not part of the Auth Gate pass and must not mix with SQL/RLS/storage/payment or player-source rewrites.

## Clarified future fix plan: video output / channel placement locks

Status: `LOGGED / DEDICATED FUTURE PASS ONLY / NOT PART OF GROUP PLAY AUTH GATE FULL PASS`

Trevor clarified the intended architecture:

- Supabase Library Editor and Mux Manager are the two pages that currently control video outputs, video creation/publishing, and placement forms.
- Those two pages need the future form-specific locks.
- Normal creator-style users should only be able to add/place videos into their own created channels, collections and playlists, not everyone else's.
- Owner/admin media-management rights must remain global.
- Channels creates channels and renders channel state.
- My Channel renders signed-in profile/channel state and owned data.
- Collections creates collections and renders collections.
- Playlists creates playlists and renders playlists.
- Group Play render/manage pages are not the first target of this lock fix unless a later source scan proves otherwise.

Primary candidate pages for that future pass:

- `supabase-library-home-header-form-fix-v7-12-34-test.html`
- `mux-manager-global-helpers-v7-10-7-test.html`

Render/create pages to preserve unless proven otherwise:

- `channels-global-helpers-v7-5-3-test.html`
- `my-channel-clean-machine-v7-12-47-test.html`
- `collections-clean-machine-v7-12-51-test.html`
- `playlists-global-helpers-v7-5-2-test.html`

## Known issues logged for later

- News Feed media display issue remains logged for a dedicated Social News Feed media layout pass.
- Player 1 Details link can open the wrong movie and needs a dedicated Player 1 current-row/details-link pass.
- Review Queue preview/playback compatibility remains logged for a later focused pass.
- Video output / channel placement lock remains logged for a dedicated future pass focused first on Supabase Library Editor and Mux Manager.
- Group Play page organization/page polish remains logged for a dedicated later functional polish pass.
