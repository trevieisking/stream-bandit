# Stream Bandit Master Must-Follow Plan V7.13.096

Date: 2026-06-22

Status: MASTER GOVERNING PLAN / WATCH GROUP AUTH GATE FULL PASS / BROWSE GROUP AUTH GATE FULL PASS / CREATOR GROUP AUTH GATE FULL PASS / GROUP PLAY PLAYLISTS AUTH GATE PASS / SUBMIT VIDEO AUTH GATE PASS / RULES AUTH GATE PASS / REVIEW QUEUE AUTH GATE PASS / MUX MANAGER LIVE CANDIDATE PASS / SUPABASE LIBRARY PUBLISH PASSED / PLAYLIST CHANNEL COLLECTION ATTACH PASSED / INDEX PROMOTED TO CREATOR GROUP FULL PASS / MAESTRO UPLOAD WORKFLOW RETIRED FOR NEW OWNER ADMIN UPLOADS / NEWS FEED MEDIA DISPLAY ISSUE LOGGED FOR LATER / HEADER SHELL MASS AUTH GATE NOT APPROVED / MUST FOLLOW BEFORE FUTURE PAGE OR SCHEMA WORK

Purpose: this document is the project-level source plan for Stream Bandit. It records what is locked, what passed, what is pending, what stays separate, and what must happen before future page, shell, registry, Web Builder, Owner, Admin, Social, User Management, storage, payment, database, authentication-gate or shell-bridge work.

## 1. Current rollback checkpoints

Strong rollback checkpoints now available:

- `CHECKPOINT-CREATOR-GROUP-AUTH-GATE-FULL-PASS-V7-13-095.md`
- `CHECKPOINT-MUX-MANAGER-LIVE-CANDIDATE-V7-13-090.md`
- `CHECKPOINT-BROWSE-GROUP-AUTH-GATE-FULL-PASS-V7-13-085.md`
- `CHECKPOINT-WATCH-GROUP-AUTH-GATE-FULL-PASS-V7-13-080.md`

No new rollback checkpoint is created for the Playlists page pass because the cleanup/checkpoint rule applies after a full group pass.

## 2. Source of truth hierarchy

Future decisions must start from:

1. `CURRENT-APP-MANIFEST-V7-12-180.md`
2. `STREAM-BANDIT-MASTER-MUST-FOLLOW-PLAN.md`
3. Current page source fetched directly from GitHub or complete user-supplied full file
4. Browser smoke test result
5. `CHECKPOINT-CREATOR-GROUP-AUTH-GATE-FULL-PASS-V7-13-095.md`
6. `CHECKPOINT-MUX-MANAGER-LIVE-CANDIDATE-V7-13-090.md`
7. `CHECKPOINT-BROWSE-GROUP-AUTH-GATE-FULL-PASS-V7-13-085.md`
8. `CHECKPOINT-WATCH-GROUP-AUTH-GATE-FULL-PASS-V7-13-080.md`

Direct GitHub fetch beats old checkpoint text when they disagree. If GitHub output truncates an HTML or JavaScript file and Trevor has the full page, use the full supplied page as the base.

## 3. Permanent architecture lock

Main App owns streaming, watching, browse, creator submission, review queue, channels, collections, playlists, social, messages, profile, settings, admin/proof pages, Mux Manager, library media management and accessibility/audio comfort.

Main App Home remains:

`home-global-helpers-v7-4-4-test.html`

`index.html` remains the Platform Entry and route launcher, not a replacement for Home.

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
- Submit Video direct `sb_movies` writes or publish behavior without separate approval
- Review Queue approval/publish logic rewrites without full-file review and separate approval
- Rules Supabase writes, uploads, approvals, deletes, migrations, storage policy changes or publishing actions without separate approval
- Playlists schema changes, public unrestricted playlist writes, Supabase Library editor access, all-users-private fallback, or entitlement bypass without separate approval
- Player 1 or Player 2 playback compatibility rewrites without preserving audio boost, fullscreen, source bridge, resume, watch history and accessibility comfort
- Mux token ID, Mux token secret, webhook secret, signing key, service-role key or any private credential in GitHub Pages, HTML, JavaScript, screenshots, docs or chat
- Mux Manager public/unrestricted upload behavior without separate approval

Publishable Supabase config must remain config-only and must not be copied into docs as a secret.

## 5. Index promotion

File promoted:

`index.html`

Index version:

`V7.13.024 Platform Entry Creator Group Full Pass + Mux Manager Live Candidate`

Index currently lists the passed Watch Group, Browse Group, Creator Group and Mux Manager media-management live candidate while keeping existing current page URLs. Home remains:

`home-global-helpers-v7-4-4-test.html`

Group Play is not promoted as a full group yet. Only Playlists has passed in this group so far.

Mux Manager link remains promoted:

- Mux Manager: `mux-manager-global-helpers-v7-10-7-test.html` — `V7.12.308 Mux Manager Stale ID Recovery + Collection Attach`

Creator Group links remain promoted as current passed candidates:

- Submit Video: `submit-video-clean-machine-v7-12-79-test.html` — `V7.12.289 Submit Video Auth Gate Test`
- Rules: `rules-clean-machine-v7-12-82-test.html` — `V7.12.291 Creator Rules Auth Gate Test`
- Review Queue: `review-queue-clean-machine-v7-12-80-publish-test.html` — `V7.12.290 Review Queue Auth Gate Test`

This promotion does not replace Home and does not promote payments, schema/RLS/storage-policy changes, owner/admin rewrites or Header Shell mass auth-gate embedding.

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
- `submit-video-clean-machine-v7-12-79-test.html`
- `rules-clean-machine-v7-12-82-test.html`
- `review-queue-clean-machine-v7-12-80-publish-test.html`
- `playlists-global-helpers-v7-5-2-test.html`

## 7. Mux Manager live candidate rule

File: `mux-manager-global-helpers-v7-10-7-test.html`

Current version:

`V7.12.308 Mux Manager Stale ID Recovery + Collection Attach`

Status: `PASSED / LIVE CANDIDATE / OWNER ADMIN MEDIA STUDIO / MUX UPLOAD / POSTER UPLOAD / SUPABASE LIBRARY PUBLISH / PLAYLIST CHANNEL COLLECTION ATTACH`

Mux Manager is now the owner/admin media studio live candidate for new Stream Bandit uploads. It belongs with the Supabase Library / media-management group.

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
- collection attach worked through `sb_collection_movies` after stale local movie ID recovery
- a second movie upload passed, proving the workflow is repeatable

Required Mux Manager safety model:

1. Owner/admin only.
2. Private Mux token ID and token secret remain only in Supabase Edge Function secrets.
3. Browser code uses the Supabase Edge Function `mux-create-direct-upload`; it never contains private Mux credentials.
4. Upload goes to Mux through a temporary direct-upload URL and Mux UpChunk.
5. Poster upload produces a 1920x1080 public Supabase Storage URL in `stream-bandit-images`.
6. Publish is manual from Video Settings -> Stream Bandit.
7. Existing matching movie rows are reused when possible.
8. Stale local browser `sb_movie_id` values must be verified or repaired before playlist, channel or collection attach.
9. Playlist and collection attach must avoid duplicate join rows.
10. No SQL, RLS, storage policy, payment or schema change is allowed unless separately approved.

V7.12.308 recovery lookup order:

1. saved `sb_movie_id`
2. `video_url`
3. `mux_playback_url`
4. Mux playback ID search
5. title fallback only when no URL is available
6. create a new `sb_movies` row only when no matching row exists

Tables and paths used:

- `sb_movies`
- `sb_playlist_movies`
- `sb_collection_movies`
- `sb_group_play_set_movie_channel`
- Supabase Storage bucket: `stream-bandit-images`
- Supabase Edge Function: `mux-create-direct-upload`

For new owner/admin video uploads, the old Maestro upload workflow can be retired in favor of Mux Manager. Existing Maestro/source compatibility work for Player 1, Player 2 or Review Queue remains a separate playback compatibility task only if needed.

## 8. Browse Group full pass rule

Browse Group is permission-mixed and must not be handled as one flat page type.

- Supabase Library Editor: `supabase-library-home-header-form-fix-v7-12-34-test.html` — admin/owner only, passed first time with Auth Gate plus admin lock
- Mux Manager: `mux-manager-global-helpers-v7-10-7-test.html` — owner/admin media-management live candidate
- Collections: `collections-clean-machine-v7-12-51-test.html` — collection browsing/management page
- Playlists: `playlists-global-helpers-v7-5-2-test.html` — also part of Group Play; V7.12.292 Auth Gate passed after Trevor browser test
- Channels: `channels-global-helpers-v7-5-3-test.html` — channel page
- Genres: `genres-clean-machine-v7-12-45-test.html` — signed-in browse plus admin/owner genre tools, passed
- Global Search: `global-search-global-helpers-v7-4-9-test.html` — signed-in read-only search, passed
- About: `about-global-helpers-v7-4-7-test.html` — signed-in info/contact page, passed

Do not move this gate into Header Shell. Do not remove page-owned admin/owner locks. Do not flatten Browse or media-management pages into one permission type.

## 9. Creator Group full pass rule

Creator Group is permission-mixed and must not be handled as one flat page type.

Current Creator routes:

- Submit Video: `submit-video-clean-machine-v7-12-79-test.html` — V7.12.289 signed-in creator submission, auth gate passed
- Rules: `rules-clean-machine-v7-12-82-test.html` — V7.12.291 read-only workflow guidance, auth gate passed
- Review Queue: `review-queue-clean-machine-v7-12-80-publish-test.html` — V7.12.290 admin/owner review and publish gate, auth gate passed, preview/playback compatibility fix still logged

Creator Group full pass confirmed by Trevor after Rules browser test. Submit Video writes only to `sb_submissions`. Rules remains read-only and never writes, uploads, approves, deletes, migrates, changes storage policy or publishes. Review Queue remains the admin/owner review and publish path into Library. Mux Manager is an owner/admin media-management tool and does not make Submit Video public uploads unrestricted.

## 10. Group Play controlled pass status

Group Play pages are being handled one page at a time under the controlled Auth Gate rollout. This is not a full group pass yet.

Current Group Play routes:

- Playlists: `playlists-global-helpers-v7-5-2-test.html` — V7.12.292 Playlists Auth Gate Test — passed by Trevor browser test
- Channels: `channels-global-helpers-v7-5-3-test.html` — next candidate
- My Channel: `my-channel-clean-machine-v7-12-47-test.html` — pending
- Collections: `collections-clean-machine-v7-12-51-test.html` — pending in this group pass
- Player 2: `player-2-clean-machine-v7-12-58-test.html` — pending

Playlists preserved rules:

- signed-out users hit Auth Gate first
- signed-in users load the Playlists page
- existing playlist browse stayed preserved
- own playlist create/edit/delete behavior stayed page-owned and entitlement-limited
- add/remove videos to own playlists stayed page-owned and entitlement-limited
- `sb_playlists`, `sb_playlist_movies`, `sb_movies` and `sb_profiles` behavior stayed preserved
- no schema change
- no Supabase Library editor access added
- no index/registry promotion
- no all-users-private fallback
- no Header Shell mass auth-gate embedding

## 11. Watch Group full pass results

- Continue Watching: `continue-watching-global-helpers-v7-3-9-test.html` — V7.12.231 auth gate passed
- Watch History: `watch-history-global-helpers-v7-4-0-test.html` — V7.12.227 auth gate passed
- Watchlist: `watchlist-clean-machine-v7-12-43-test.html` — V7.12.160 auth gate passed
- Favourites: `favourites-clean-machine-v7-12-41-test.html` — V7.12.160 auth gate passed
- Likes: `likes-clean-machine-v7-12-42-test.html` — V7.12.159 auth gate passed
- Accessibility: `accessibility-clean-machine-v7-12-44-test.html` — V7.12.229 auth gate passed

## 12. Known issues logged for later

### News Feed media issue

File: `news-feed-social-v7-13-001-test.html`

Status: `LOGGED / FIX LATER IN A DEDICATED SOCIAL NEWS FEED MEDIA LAYOUT PASS`

- Latest Activity post renders account header, post text and post media.
- The post image area does not show the full image used with the post.
- The video card/player area below appears as a large black media box.
- Trevor reports the video still plays, but the visible player/media is not correctly shown.

### Player 1 Details-link issue

Player 1 Details can open the wrong movie and needs a dedicated Player 1 current-row/details-link pass. Preserve playback, audio boost, source bridge, resume helper, watch history and save buttons.

### Review Queue preview/playback compatibility

Review Queue auth-gate pass preserved its admin/owner review and publish behavior. Preview/playback compatibility remains logged for a later focused pass, not for the Creator Group Auth Gate pass.
