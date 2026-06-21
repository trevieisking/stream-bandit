# Stream Bandit Master Must-Follow Plan V7.13.081

Date: 2026-06-21

Status: MASTER GOVERNING PLAN / WATCH GROUP AUTH GATE FULL PASS / ACCESSIBILITY PASSED / CHECKPOINT CREATED / INDEX PROMOTED / CURRENT APP LINKS UPDATED / NEWS FEED MEDIA DISPLAY ISSUE LOGGED FOR LATER / HEADER SHELL MASS AUTH GATE NOT APPROVED / MUST FOLLOW BEFORE FUTURE PAGE OR SCHEMA WORK

Purpose: this document is the project-level source plan for Stream Bandit. It records what is locked, what passed, what is pending, what stays separate, and what must happen before future page, shell, registry, Web Builder, Owner, Admin, Social, User Management, storage, payment, database, authentication-gate or shell-bridge work.

## 1. Current rollback checkpoint

Rollback checkpoint created at the exact full Watch Group pass moment:

`CHECKPOINT-WATCH-GROUP-AUTH-GATE-FULL-PASS-V7-13-080.md`

Three old V5 checkpoint files were deleted first to keep the repository count under control:

- `CHECKPOINT-V5.20.2.md`
- `CHECKPOINT-V5.22.1.md`
- `CHECKPOINT-V5.23.2.md`

## 2. Source of truth hierarchy

Future decisions must start from:

1. `CURRENT-APP-MANIFEST-V7-12-180.md`
2. `STREAM-BANDIT-MASTER-MUST-FOLLOW-PLAN.md`
3. `CHECKPOINT-WATCH-GROUP-AUTH-GATE-FULL-PASS-V7-13-080.md`
4. Current page source fetched directly from GitHub or complete user-supplied full file
5. Browser smoke test result

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
- owner/admin permission-system changes during user-account save-page rollout

Publishable Supabase config must remain config-only and must not be copied into docs as a secret.

## 5. Index promotion

File promoted:

`index.html`

Index version:

`V7.13.021 Platform Entry Watch Group Promoted`

Index now lists the passed Watch Group as current app page links while keeping the existing old/current URLs:

- Continue Watching: `continue-watching-global-helpers-v7-3-9-test.html`
- Watch History: `watch-history-global-helpers-v7-4-0-test.html`
- Watchlist: `watchlist-clean-machine-v7-12-43-test.html`
- Favourites: `favourites-clean-machine-v7-12-41-test.html`
- Likes: `likes-clean-machine-v7-12-42-test.html`
- Accessibility: `accessibility-clean-machine-v7-12-44-test.html`

Index remains a platform entry and route launcher. Home remains:

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

Auth gate autofill guard remains passed. The old Library browser-autofill problem is fixed by the central helper.

## 7. Watch Group full pass results

### Continue Watching

- V7.12.231 Continue Watching Auth Gate Test
- Trevor confirmed pass
- read-only progress, dedupe, resume links, save buttons, Details links and clean navigation preserved

### Watch History

- V7.12.227 Watch History Auth Gate Test
- Trevor confirmed pass
- read-only history/progress, dedupe, resume links, save buttons, Details links and theme tabs preserved

### Watchlist

- V7.12.160 Watchlist Auth Gate Test
- Trevor confirmed pass
- `sb_watchlist` read, search/filter, sort, shared save buttons, Details links, Player 1 links and clean top rail preserved

### Favourites

- V7.12.160 Favourites Auth Gate Test
- Trevor confirmed pass
- `sb_favourites` read, search/filter, sort, shared save buttons, Details links, Player 1 links and clean top rail preserved

### Likes

- V7.12.159 Likes Auth Gate Test
- Trevor confirmed pass
- `sb_likes` read, search/filter, sort, shared save buttons, Details links, Player 1 links and clean top rail preserved

### Accessibility

- V7.12.229 Accessibility Auth Gate Test
- Trevor confirmed pass
- localStorage-only readability controls preserved
- Theme Projector bridge preserved
- text scale, contrast, reduced motion and preferred player boost reminder preserved
- no Supabase writes added

## 8. User save-page and Accessibility boundaries

Watchlist, Favourites and Likes are user-account save pages. They must keep signed-in user scope, existing table reads and shared save helpers. They must not become admin/owner permission pages and must not change User Management, Owner controls, SQL, RLS, storage policies, payments or Header Shell gate behavior.

Accessibility is a local comfort/readability page. It must not become a Supabase writer and must not take over Theme Studio colour ownership or Player 1's real audio boost controls.

## 9. News Feed media display issue for later focused fix

File:

`news-feed-social-v7-13-001-test.html`

Status:

`LOGGED / NOT PART OF WATCH GROUP AUTH-GATE PASS / FIX LATER IN DEDICATED NEWS FEED MEDIA LAYOUT PASS`

Observed from Trevor's browser screenshot:

- Latest Activity post renders the account header, post text and post media.
- The image card is not showing the full image used with the post; it appears partially visible/cropped.
- The video/player card below appears as a large black media block.
- Trevor reports the video still plays, but the player/media is not visibly correct.

Future fix direction:

- inspect media-card CSS, image sizing, video/player sizing, poster/preview handling and overflow/height rules
- make the post image display correctly
- make the video/player card visibly show the intended media area
- preserve News Feed posts, comments, reactions, likes, visibility rules and account ownership behavior
- do not change SQL, RLS, storage policies, payments, owner/admin permissions or Header Shell auth-gate behavior in that pass unless separately approved

## 10. Player 1 Details-link issue for later

Status: logged, not an auth blocker, Player 1 auth gate passed.

Observed behavior: Player 1 Details can open a different/random title instead of the currently playing title. Fix later in a dedicated Player 1 Details-link/current-row routing pass. Preserve playback, audio boost, source bridge, resume helper, watch history and save buttons.

## 11. Social group rule

Social pages are real working pages and must not be blind-patched.

Current Social group:

- Social Profile: `profile-social-v7-13-001-test.html`
- Friends: `friends-social-v7-13-001-test.html`
- News Feed: `news-feed-social-v7-13-001-test.html`
- Groups and Events: `groups-social-v7-13-001-test.html`

News Feed is a real post/comment/reaction/feed page. Its media display issue must be handled as a focused fix, not as part of a broad social rewrite.

## 12. Next controlled step

The Watch Group is now passed, checkpointed and promoted to Index as current app links. Next work should either:

- smoke test the promoted Index page, or
- choose the next protected page one at a time, or
- run the focused News Feed media-card/layout pass when Trevor chooses that issue.

No mass page rollout and no Header Shell auth-gate embedding are approved.
