# Stream Bandit Master Must-Follow Plan V7.13.087

Date: 2026-06-21

Status: MASTER GOVERNING PLAN / WATCH GROUP AUTH GATE FULL PASS / BROWSE GROUP AUTH GATE FULL PASS / CREATOR GROUP IN PROGRESS / SUBMIT VIDEO AUTH GATE PASS / REVIEW QUEUE AUTH GATE PASS / PLAYER 1 AND PLAYER 2 MAESTRO PLAYBACK COMPATIBILITY LOGGED / NEWS FEED MEDIA DISPLAY ISSUE LOGGED FOR LATER / HEADER SHELL MASS AUTH GATE NOT APPROVED / MUST FOLLOW BEFORE FUTURE PAGE OR SCHEMA WORK

Purpose: this document is the project-level source plan for Stream Bandit. It records what is locked, what passed, what is pending, what stays separate, and what must happen before future page, shell, registry, Web Builder, Owner, Admin, Social, User Management, storage, payment, database, authentication-gate or shell-bridge work.

## 1. Current rollback checkpoints

Strong rollback checkpoints now available:

- `CHECKPOINT-WATCH-GROUP-AUTH-GATE-FULL-PASS-V7-13-080.md`
- `CHECKPOINT-BROWSE-GROUP-AUTH-GATE-FULL-PASS-V7-13-085.md`

## 2. Source of truth hierarchy

Future decisions must start from:

1. `CURRENT-APP-MANIFEST-V7-12-180.md`
2. `STREAM-BANDIT-MASTER-MUST-FOLLOW-PLAN.md`
3. `CHECKPOINT-BROWSE-GROUP-AUTH-GATE-FULL-PASS-V7-13-085.md`
4. `CHECKPOINT-WATCH-GROUP-AUTH-GATE-FULL-PASS-V7-13-080.md`
5. Current page source fetched directly from GitHub or complete user-supplied full file
6. Browser smoke test result

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
- About Supabase writes, live publishing, tickets, uploads, billing, or policy editing without separate approval
- Submit Video direct `sb_movies` writes or publish behavior without separate approval
- Review Queue approval/publish logic rewrites without full-file review and separate approval
- Player 1 or Player 2 playback compatibility rewrites without preserving audio boost, fullscreen, source bridge, resume, watch history and accessibility comfort

Publishable Supabase config must remain config-only and must not be copied into docs as a secret.

## 5. Index promotion

File promoted:

`index.html`

Index version:

`V7.13.022 Platform Entry Browse Group Promoted`

Index lists the passed Watch Group and Browse Group as current app page links while keeping existing old/current URLs. Home remains:

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
- `about-global-helpers-v7-4-7-test.html`
- `submit-video-clean-machine-v7-12-79-test.html`
- `review-queue-clean-machine-v7-12-80-publish-test.html`

Auth gate autofill guard remains passed. The old Library browser-autofill problem is fixed by the central helper.

## 7. Browse Group full pass rule

Browse Group is permission-mixed and must not be handled as one flat page type.

- Supabase Library Editor: `supabase-library-home-header-form-fix-v7-12-34-test.html` — admin/owner only, passed first time with Auth Gate plus admin lock
- Genres: `genres-clean-machine-v7-12-45-test.html` — signed-in browse plus admin/owner genre tools, passed
- Global Search: `global-search-global-helpers-v7-4-9-test.html` — signed-in read-only search, passed
- About: `about-global-helpers-v7-4-7-test.html` — signed-in info/contact page, passed

Do not move this gate into Header Shell. Do not remove page-owned admin/owner locks. Do not flatten Browse pages into one permission type.

## 8. Creator Group rule

Creator Group is permission-mixed and must not be handled as one flat page type.

Current Creator routes:

- Submit Video: `submit-video-clean-machine-v7-12-79-test.html` — signed-in creator submission, passed
- Rules: `rules-clean-machine-v7-12-82-test.html` — read-only workflow guidance, pending controlled pass
- Review Queue: `review-queue-clean-machine-v7-12-80-publish-test.html` — admin/owner review and publish gate, auth gate passed, preview/playback compatibility fix still needed

Submit Video must use this exact permission model:

1. Auth Gate blocks signed-out access first.
2. Signed-in users can create pending submissions.
3. Submit Video writes only to `sb_submissions`.
4. Submit Video must not publish to `sb_movies`.
5. Review Queue remains the only publish path into Library.

Rules must remain read-only workflow guidance:

1. Auth Gate blocks signed-out access first during this app rollout.
2. No admin/owner-only role check is required unless later separately approved.
3. No submit, upload, approve, decline, publish, delete or migrate powers are allowed on Rules.

Review Queue must use this exact permission model:

1. Auth Gate blocks signed-out access first.
2. Existing admin/owner lock blocks normal signed-in users.
3. Admin/owner users can review, approve, decline, request changes, save status and publish to Library.
4. Review Queue can write to `sb_movies` and `sb_submissions` only as its existing review/publish workflow allows.
5. Approval should not happen blind. A preview/test tool for the submitted video URL is required before final approval confidence.

Do not publish directly from Submit Video. Do not give Review Queue powers to public viewer pages. Do not add unrestricted upload permissions. Do not move Creator permissions into Header Shell.

## 9. Submit Video pass

File: `submit-video-clean-machine-v7-12-79-test.html`

Version: `V7.12.289 Submit Video Auth Gate Test`

Status: `PASSED / SIGNED-IN CREATOR SUBMISSION / PENDING SB_SUBMISSIONS ONLY / REVIEW QUEUE BRIDGE PRESERVED`

Trevor browser-test result:

- sign out then sign in passed
- one Header and one Footer passed
- submitting video goes to Review Queue passed
- all other checked page functions passed

Preserved Submit Video controls and safety locks:

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
- no SQL changed
- no RLS changed
- no storage policy changed
- no payment changed
- no schema change
- no Header Shell mass auth-gate injection

## 10. Review Queue gate pass

File: `review-queue-clean-machine-v7-12-80-publish-test.html`

Version: `V7.12.290 Review Queue Auth Gate Test`

Status: `PASSED / AUTH GATE ATTACHED / EXISTING ADMIN OWNER REVIEW GATE PRESERVED / PREVIEW FIX STILL NEEDED`

Trevor browser-test result:

- Review Queue passed the Auth Gate
- Existing Review Queue admin/owner gate remains the publish safety gate
- Submitted Maestro-style links still do not play in the current page/player preview path and need a dedicated playback compatibility fix

Preserved Review Queue controls and safety locks:

- shared Auth Gate blocks signed-out users before page use
- existing `requireAdmin()` admin/owner lock stayed preserved
- queue still reads `sb_submissions`
- approve/publish, approve-only, decline and archive actions stayed preserved
- publish path remains Review Queue to `sb_movies`
- no approval or publish logic was rewritten during the gate pass
- no SQL changed
- no RLS changed
- no storage policy changed
- no payment changed
- no schema change
- no Header Shell mass auth-gate injection

## 11. Review Queue preview request

File: `review-queue-clean-machine-v7-12-80-publish-test.html`

Requested next fix:

- add a real video preview before approval
- reviewer must be able to test the submitted URL before approving
- preview should use the same playback compatibility layer planned for Player 1 and Player 2
- if the submitted URL is a Maestro page URL, the preview must not treat it like a raw video file
- preview can appear below the selected card or in an overlay
- do not weaken Review Queue admin/owner approval gate
- do not approve/publish unless reviewer has a working preview/test tool
- preserve approve, decline, request changes, save status and publish-to-library behavior

Implementation boundary for the Review Queue preview fix:

- use the full current Review Queue page as the base
- inspect current submitted URL fields before coding
- add preview as a review aid only
- do not change table names, publish field mapping, status values or delete/decline safeguards unless separately approved
- keep existing approval and publish checks intact
- share the same source resolver/adapter planned for Player 1 and Player 2 where practical

## 12. Player playback compatibility backlog

### Player 1 and Player 2 playback compatibility pass

Status: `LOGGED / FIX LATER IN A DEDICATED PLAYER PLAYBACK COMPATIBILITY PASS`

Problem reported by Trevor:

- Maestro page links are not playing now, although they used to.
- Example link type: `maestro.tv/chatterfriends/v/...`
- These links are page/embed-style links, not guaranteed direct browser-playable media URLs.

Required future fix:

- Player 1 and Player 2 must support every approved Stream Bandit source type possible without breaking current playback.
- Keep existing direct MP4/WebM/MOV/HLS/Mux behavior.
- Add a source resolver/adapter for page-style providers such as Maestro where possible.
- Do not feed non-media page URLs directly into a `<video>` element as if they were `.mp4` or `.m3u8` files.
- Review Queue preview must use the same resolver/adapter so the reviewer can test the submitted URL before approval.
- Preserve audio boost, louder audio/accessibility comfort, fullscreen, resume, watch history, source bridge, save buttons and Details links.
- Do not change SQL, RLS, storage policies, payments or owner/admin permissions during the playback compatibility pass unless separately approved.

## 13. Watch Group full pass results

- Continue Watching: `continue-watching-global-helpers-v7-3-9-test.html` — V7.12.231 auth gate passed
- Watch History: `watch-history-global-helpers-v7-4-0-test.html` — V7.12.227 auth gate passed
- Watchlist: `watchlist-clean-machine-v7-12-43-test.html` — V7.12.160 auth gate passed
- Favourites: `favourites-clean-machine-v7-12-41-test.html` — V7.12.160 auth gate passed
- Likes: `likes-clean-machine-v7-12-42-test.html` — V7.12.159 auth gate passed
- Accessibility: `accessibility-clean-machine-v7-12-44-test.html` — V7.12.229 auth gate passed

## 14. User save-page and Accessibility boundaries

Watchlist, Favourites and Likes are user-account save pages. They must keep signed-in user scope, existing table reads and shared save helpers. They must not become admin/owner permission pages and must not change User Management, Owner controls, SQL, RLS, storage policies, payments or Header Shell gate behavior.

Accessibility is a local comfort/readability page. It must not become a Supabase writer and must not take over Theme Studio colour ownership or Player 1's real audio boost controls.

## 15. Known issues logged for later

### News Feed media issue

File: `news-feed-social-v7-13-001-test.html`

Status: `LOGGED / NOT PART OF WATCH, BROWSE OR CREATOR AUTH-GATE PASS / FIX LATER IN DEDICATED NEWS FEED MEDIA LAYOUT PASS`

- Latest Activity post renders the account header, post text and post media.
- The post image area does not show the full image used with the post.
- The video card/player area below appears as a large black media block.
- Trevor reports the video still plays, but the visible player/media is not correctly shown.

### Player 1 Details-link issue

Player 1 Details can open the wrong movie and needs a dedicated Player 1 current-row/details-link pass. Preserve playback, audio boost, source bridge, resume helper, watch history and save buttons.

## 16. Social group rule

Social pages are real working pages and must not be blind-patched.

Current Social group:

- Social Profile: `profile-social-v7-13-001-test.html`
- Friends: `friends-social-v7-13-001-test.html`
- News Feed: `news-feed-social-v7-13-001-test.html`
- Groups and Events: `groups-social-v7-13-001-test.html`

News Feed is a real post/comment/reaction/feed page. Its media display issue must be handled as a focused fix, not as part of a broad social rewrite.

## 17. Next controlled step

Watch Group and Browse Group are passed, checkpointed and promoted to Index as current app links. Creator Group has started. Submit Video and Review Queue Auth Gate have passed.

Next work should be chosen one page or one focused fix at a time. The next logged player focus is Player 1 and Player 2 playback compatibility for Maestro/page-style links, plus Review Queue preview using that same resolver.

No mass page rollout and no Header Shell auth-gate embedding are approved.
