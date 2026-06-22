# Stream Bandit Master Must-Follow Plan V7.13.101

Date: 2026-06-22

Status: MASTER GOVERNING PLAN / WATCH GROUP AUTH GATE FULL PASS / BROWSE GROUP AUTH GATE FULL PASS / CREATOR GROUP AUTH GATE FULL PASS / GROUP PLAY AUTH GATE FULL PASS / COLLECTIONS SOURCE FORMATTING CORRECTED / MUX MANAGER LIVE CANDIDATE PASS / SUPABASE LIBRARY PUBLISH PASSED / PLAYLIST CHANNEL COLLECTION ATTACH PASSED / INDEX PROMOTED TO GROUP PLAY FINAL ROLLBACK POINT / GROUP PLAY FINAL ROLLBACK CHECKPOINT CREATED / VIDEO OUTPUT CHANNEL PLACEMENT LOCK LOGGED FOR FUTURE DEDICATED PASS / GROUP PLAY PAGE ORGANIZATION POLISH LOGGED FOR FUTURE PASS / NEWS FEED MEDIA DISPLAY ISSUE LOGGED FOR LATER / HEADER SHELL MASS AUTH GATE NOT APPROVED / MUST FOLLOW BEFORE FUTURE PAGE OR SCHEMA WORK

Purpose: this document is the project-level source plan for Stream Bandit. It records what is locked, what passed, what is pending, what stays separate, and what must happen before future page, shell, registry, Web Builder, Owner, Admin, Social, User Management, storage, payment, database, authentication-gate or shell-bridge work.

## 1. Current rollback checkpoints

Strong rollback checkpoints now available:

- `CHECKPOINT-GROUP-PLAY-AUTH-GATE-FULL-PASS-V7-13-101.md`
- `CHECKPOINT-CREATOR-GROUP-AUTH-GATE-FULL-PASS-V7-13-095.md`
- `CHECKPOINT-MUX-MANAGER-LIVE-CANDIDATE-V7-13-090.md`
- `CHECKPOINT-BROWSE-GROUP-AUTH-GATE-FULL-PASS-V7-13-085.md`
- `CHECKPOINT-WATCH-GROUP-AUTH-GATE-FULL-PASS-V7-13-080.md`

Three older checkpoint files were deleted before the Group Play rollback point was created:

- `CHECKPOINT-FOCUSED-SCOPE-ZERO-MISSING-V7-12-56.md`
- `CHECKPOINT-LIVE-APP-ROLE-LOCK-PLAN-V7-12-64.md`
- `CHECKPOINT-WEB-BUILDER-PAGES-MANAGER-START-V7-12-107.md`

The first Group Play checkpoint `CHECKPOINT-GROUP-PLAY-AUTH-GATE-FULL-PASS-V7-13-100.md` was replaced after the Collections source-format correction so the active rollback point matches the current readable source.

## 2. Source of truth hierarchy

Future decisions must start from:

1. `CURRENT-APP-MANIFEST-V7-12-180.md`
2. `STREAM-BANDIT-MASTER-MUST-FOLLOW-PLAN.md`
3. Current page source fetched directly from GitHub or complete user-supplied full file
4. Browser smoke test result
5. `CHECKPOINT-GROUP-PLAY-AUTH-GATE-FULL-PASS-V7-13-101.md`
6. `CHECKPOINT-CREATOR-GROUP-AUTH-GATE-FULL-PASS-V7-13-095.md`
7. `CHECKPOINT-MUX-MANAGER-LIVE-CANDIDATE-V7-13-090.md`
8. `CHECKPOINT-BROWSE-GROUP-AUTH-GATE-FULL-PASS-V7-13-085.md`
9. `CHECKPOINT-WATCH-GROUP-AUTH-GATE-FULL-PASS-V7-13-080.md`

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
- Channels schema changes, `is_public` column dependency, public unrestricted channel writes, Supabase Library editor access, all-users-private fallback, or entitlement bypass without separate approval
- My Channel schema changes, all-users-content fallback, Supabase Library editor access, unrestricted channel placement, or entitlement bypass without separate approval
- Collections schema changes, storage policy changes, Supabase Library editor access, all-users-private fallback, unrestricted collection placement, one-line source regression, or entitlement bypass without separate approval
- Player 2 playback architecture rewrite without preserving queue mode, Mux/HLS/direct HTML video, YouTube/Vimeo iframe mode, audio boost, progress saves, Details route and Player 1 separation
- Video output / channel placement lock implementation without first scanning Supabase Library Editor and Mux Manager
- Group Play organization/page-polish pass mixed with SQL/RLS/storage/payment/player-source rewrites
- Mux token ID, Mux token secret, webhook secret, signing key, service-role key or any private credential in GitHub Pages, HTML, JavaScript, screenshots, docs or chat
- Mux Manager public/unrestricted upload behavior without separate approval

Publishable Supabase config must remain config-only and must not be copied into docs as a secret.

## 5. Index promotion

File promoted:

`index.html`

Index version:

`V7.13.101 Platform Entry Group Play Full Pass + Collections Source Correction + Mux Manager Live Candidate`

Index now promotes Group Play as a full passed live-candidate group with corrected readable Collections source while keeping existing current page URLs. Home remains:

`home-global-helpers-v7-4-4-test.html`

Group Play live-candidate links now promoted on Index:

- Playlists: `playlists-global-helpers-v7-5-2-test.html`
- Channels: `channels-global-helpers-v7-5-3-test.html`
- My Channel: `my-channel-clean-machine-v7-12-47-test.html`
- Collections: `collections-clean-machine-v7-12-51-test.html`
- Player 2: `player-2-clean-machine-v7-12-58-test.html`

Mux Manager link remains promoted:

- Mux Manager: `mux-manager-global-helpers-v7-10-7-test.html` - `V7.12.308 Mux Manager Stale ID Recovery + Collection Attach`

Creator Group links remain promoted:

- Submit Video: `submit-video-clean-machine-v7-12-79-test.html` - `V7.12.289 Submit Video Auth Gate Test`
- Rules: `rules-clean-machine-v7-12-82-test.html` - `V7.12.291 Creator Rules Auth Gate Test`
- Review Queue: `review-queue-clean-machine-v7-12-80-publish-test.html` - `V7.12.290 Review Queue Auth Gate Test`

This promotion does not replace Home and does not promote payments, schema/RLS/storage-policy changes, owner/admin rewrites or Header Shell mass auth-gate embedding.

## 6. Auth Gate phase status

Current helper:

`stream-bandit-auth-gate-v7-13-001.js`

Current helper status:

`V7.13.005 Auth Gate / Email Password / No Guest Users / Owner Recovery / Session Watch / Autofill Guard`

The gate is controlled page-by-page. It is not approved as a broad shell rewrite or Header Shell mass gate.

Passed auth-gate attachment pages now include the full Group Play group:

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
- `channels-global-helpers-v7-5-3-test.html`
- `my-channel-clean-machine-v7-12-47-test.html`
- `collections-clean-machine-v7-12-51-test.html`
- `player-2-clean-machine-v7-12-58-test.html`

## 7. Mux Manager live candidate rule

File: `mux-manager-global-helpers-v7-10-7-test.html`

Current version:

`V7.12.308 Mux Manager Stale ID Recovery + Collection Attach`

Status: `PASSED / LIVE CANDIDATE / OWNER ADMIN MEDIA STUDIO / MUX UPLOAD / POSTER UPLOAD / SUPABASE LIBRARY PUBLISH / PLAYLIST CHANNEL COLLECTION ATTACH`

Mux Manager remains the owner/admin media studio live candidate for new Stream Bandit uploads. It belongs with the Supabase Library / media-management group.

Required Mux Manager safety model remains unchanged: owner/admin only, private Mux credentials only in Supabase Edge Function secrets, browser uses `mux-create-direct-upload`, upload goes to Mux through temporary direct-upload URL, poster upload uses `stream-bandit-images`, publish is manual, stale local movie IDs are repaired before playlist/channel/collection attach, and no SQL/RLS/storage/payment/schema change is allowed unless separately approved.

## 8. Group Play full pass status

Status: `PASSED / FULL GROUP PASS / LIVE CANDIDATE GROUP / INDEX PROMOTED / FINAL ROLLBACK POINT CREATED`

Current Group Play routes:

- Playlists: `playlists-global-helpers-v7-5-2-test.html` - V7.12.292 Playlists Auth Gate Test - passed
- Channels: `channels-global-helpers-v7-5-3-test.html` - V7.12.293 Channels Auth Gate Test - passed
- My Channel: `my-channel-clean-machine-v7-12-47-test.html` - V7.12.294 My Channel Auth Gate Test - passed
- Collections: `collections-clean-machine-v7-12-51-test.html` - V7.12.295 Collections Auth Gate Test - passed and source-format corrected
- Player 2: `player-2-clean-machine-v7-12-58-test.html` - V7.12.296 Player 2 Auth Gate Test - passed

Playlists preserved rules:

- signed-out users hit Auth Gate first
- signed-in users load the Playlists page
- existing playlist browse stayed preserved
- own playlist create/edit/delete behavior stayed page-owned and entitlement-limited
- add/remove videos to own playlists stayed page-owned and entitlement-limited
- `sb_playlists`, `sb_playlist_movies`, `sb_movies` and `sb_profiles` behavior stayed preserved
- no schema change
- no Supabase Library editor access added
- no index/registry promotion at page-pass time
- no all-users-private fallback
- no Header Shell mass auth-gate embedding

Channels preserved rules:

- signed-out users hit Auth Gate first
- signed-in users load the Channels page
- existing channel browse stayed preserved
- profile channel edit stayed on `sb_profiles`
- extra channel create/edit/delete stayed on owned `sb_channels` rows only
- video attach/remove stayed through `sb_group_play_set_movie_channel`
- working `sb_channels` column list stayed limited to real columns and no `is_public` dependency was added
- no schema change
- no Supabase Library editor access added
- no all-users-private fallback
- no Header Shell mass auth-gate embedding

My Channel preserved rules:

- signed-out users hit Auth Gate first
- signed-in users load My Channel
- Dashboard, Edit Profile Channel, My Videos, Submissions, Permissions and Rules tabs passed
- profile channel identity writes stayed on `sb_profiles`
- owned videos stayed scoped to `sb_movies.owner_id`
- owned submissions stayed scoped to `sb_submissions.submitter_id`
- Play My Videos In Player 2 stayed preserved
- owned-data-only rule stayed preserved
- no schema change
- no Supabase Library editor access added
- no all-users-content fallback
- no Header Shell mass auth-gate embedding

Collections preserved rules:

- signed-out users hit Auth Gate first
- signed-in users load Collections
- Browse, Collection Studio, Add / Remove Videos, Permissions and Debug tabs passed
- Play Selected In Player 2 stayed preserved
- `sb_collections`, `sb_collection_movies`, `sb_movies` and storage artwork behavior stayed preserved
- selected-card sync and Remove Collection stayed preserved
- readable multi-line page source is restored and must be preserved
- no schema change
- no storage policy change
- no Supabase Library editor access added
- no all-users-private fallback
- no Header Shell mass auth-gate embedding

Player 2 preserved rules:

- signed-out users hit Auth Gate first
- signed-in users load Player 2
- queue/fallback loaded
- Play/Pause worked on HTML video
- audio boost worked on Mux/HLS/direct video
- Next/Previous queue buttons worked
- Comfort Controls, Progress State, Source Info, Rules, Checklist and Debug tabs opened
- queue keys stayed `streamBanditQueueV1`, `streamBanditUpNextV1`, `streamBanditPlayer2Queue`
- progress stayed on `stream-bandit-progress-v6-73`
- Details route stayed `details-clean-machine-v7-12-38-test.html`
- Player 1 route separation stayed protected
- no schema change
- no storage policy change
- no RLS change
- no Header Shell mass auth-gate embedding

## 9. Future fix plan: video output / channel placement locks

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
- Group Play render/manage pages are not the first target of the video-output/channel-placement lock fix unless a later source scan proves otherwise.

Required future workflow before changing code:

1. Fetch and scan `supabase-library-home-header-form-fix-v7-12-34-test.html`.
2. Fetch and scan `mux-manager-global-helpers-v7-10-7-test.html`.
3. Identify the exact forms/selectors that assign videos to channels, collections and playlists.
4. Preserve owner/admin global placement rights.
5. For normal creator-style users, restrict placement selectors to the signed-in user's own created groups.
6. Keep backend/RLS as the final authority.
7. Do not add SQL, RLS, schema or storage policy changes unless Trevor separately approves a backend pass.
8. Do not treat the Group Play render pages as the command source for this fix unless the scan proves otherwise.

## 10. Future functional page organization / page polish pass

Status: `LOGGED / DEDICATED FUTURE PASS ONLY / NOT PART OF GROUP PLAY AUTH GATE FULL PASS`

Trevor noted the Group Play pages are functionally passed but unorganized and untidy. A later dedicated pass should improve:

- page organization
- visual hierarchy
- tab order and naming
- rail clarity
- group-to-group navigation consistency
- explanation text and page intent
- layout consistency between Playlists, Channels, My Channel, Collections and Player 2

This future polish pass must not change SQL, RLS, storage policies, payment, player source handling, audio boost, progress saving, Header Shell mass auth-gate behavior, or owner/admin permission systems.

## 11. Browse Group full pass rule

Browse Group remains passed and permission-mixed. Do not flatten Browse or media-management pages into one permission type.

## 12. Creator Group full pass rule

Creator Group remains passed and permission-mixed. Submit Video writes only to `sb_submissions`; Rules remains read-only; Review Queue remains admin/owner review and publish.

## 13. Watch Group full pass results

Watch Group remains passed with Continue Watching, Watch History, Watchlist, Favourites, Likes and Accessibility.

## 14. Known issues logged for later

- News Feed media display issue remains logged for a dedicated Social News Feed media layout pass.
- Player 1 Details link can open the wrong movie and needs a dedicated Player 1 current-row/details-link pass.
- Review Queue preview/playback compatibility remains logged for a later focused pass.
- Video output / channel placement lock remains logged for a dedicated future pass focused first on Supabase Library Editor and Mux Manager.
- Group Play page organization/page polish remains logged for a dedicated later functional polish pass.
