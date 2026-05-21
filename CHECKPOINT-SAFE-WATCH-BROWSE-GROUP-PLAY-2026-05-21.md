# Stream Bandit Safe Checkpoint — Watch + Browse + Group Play

Date: 2026-05-21

## Safe checkpoint decision

This checkpoint marks the current global-helper pass safe point for these menu groups:

1. Watch group
2. Browse group
3. Group Play group

These groups should be treated as the current stable working base before moving into the next menu area.

## Standing project rules

- No patching working pages directly.
- Build new direct test pages first.
- No iframe wrapper for final passed pages.
- No loader trick for final passed pages.
- Use the menu overlay as the project map.
- After Trevor passes a page, check/promote the matching route.
- Re-read promoted routes for final code check.
- Save checkpoint notes after each pass.
- Do not promote live `index.html` until final RC, backup, full smoke test, and explicit approval.

## Current global-helper standard

A page is not considered passed unless it has the current global carry behaviour:

- theme matches saved/global Stream Bandit style
- menu overlay appears correctly
- account/profile state appears correctly
- avatar appears correctly
- search overlay still works
- helper status confirms account/avatar/shared style/settings bridge where applicable
- page-specific functions still work
- routes point to the current passed pages

Current route targets:

- Details: `details-global-helpers-v7-3-1-test.html`
- Player 1: `player-one-global-helpers-v7-3-3-test.html`
- Player 2: `player-2-progress-helper-v6-78-9-4-test.html`
- Global Search: `global-search-global-helpers-v7-4-9-test.html`

Player 2 queue keys to preserve:

- `streamBanditQueueV1`
- `streamBanditUpNextV1`
- `streamBanditPlayer2Queue`

## Watch group safe/current pages

Passed/current watch pages from this global run:

- Details: `details-global-helpers-v7-3-1-test.html`
- Player 1: `player-one-global-helpers-v7-3-3-test.html`
- Continue Watching: `continue-watching-global-helpers-v7-3-9-test.html`
- Watch History: `watch-history-global-helpers-v7-4-0-test.html`
- Watchlist: `watchlist-global-helpers-v7-3-5-test.html`
- Favourites: `favourites-global-helpers-v7-3-6-test.html`
- Likes: `likes-global-helpers-v7-3-7-test.html`
- Accessibility: `accessibility-global-helpers-v7-4-2-test.html`

## Browse group safe/current pages

Passed/current browse pages:

- Home: `stream-bandit/home-global-helpers-v7-4-4-test.html`
- Main Library: `library-global-helpers-v7-4-8-test.html`
- Supabase Library: `supabase-library-clean-editor-v6-93-3-test.html`
- Supabase Library route: `supabase-library-browse-shell-v6-43-test.html`
- Genres: `genres-global-helpers-v7-5-4-test.html`
- Genres route: `genres-browse-shell-v6-44-test.html`
- Global Search: `global-search-global-helpers-v7-4-9-test.html`
- About Us: `about-global-helpers-v7-4-7-test.html`

Supabase Library was one of the hard protected pages and passed as a direct full page, not iframe/loader.

## Group Play safe/current pages

Group Play is now considered complete for this global-helper pass:

### Playlists

Passed page:

- `playlists-global-helpers-v7-5-2-test.html`

Promoted route:

- `playlists-browse-shell-v6-47-test.html`

Promotion commit:

- `c1529c13c3095c1bf5a4c617d4195933a055b9a8`

Checkpoint:

- `CHECKPOINT-PLAYLISTS-V7-5-2-PASSED-PROMOTED.md`

Trevor confirmed:

- page loads
- global theme/account/avatar/helper status
- playlists load
- side rail click
- feed post/artwork/thumb rail/queue rows
- Details route
- Player 1 route
- Player 2 queue
- create playlist
- add video to playlist
- remove playlist
- forms open/close and all fields clickable

### Channels

Passed page:

- `channels-global-helpers-v7-5-3-test.html`

Promoted route:

- `channels-browse-shell-v6-45-test.html`

Promotion commit:

- `54a21f7276e84cd17ee36090a2f4fcb9d8f0cf5c`

Checkpoint:

- `CHECKPOINT-CHANNELS-V7-5-3-PASSED-PROMOTED.md`

Trevor confirmed:

- page loads
- global theme/account/avatar/helper status
- channels load
- channel click
- channel hero/banner/avatar shows
- channel videos load
- Details route
- Player 1 route
- Player 2 queue
- edit channel fields
- upload banner/avatar and persist
- add/remove video and verify
- account/search/menu overlay checked after

Polish note:

- channel avatar crop/shape can be improved later
- do not touch upload/save/image-column logic when polishing avatar visuals

### My Channel

Passed/current page:

- `my-channel-global-helpers-v7-5-0-test.html`

Route:

- `my-channel-creator-shell-v6-48-test.html`

Status:

- view-only creator dashboard
- global helpers loaded
- Play All uses Player 2

### Collections

Passed/current page:

- `collections-global-helpers-v7-5-1-test.html`

Route:

- `collections-browse-shell-v6-46-1-test.html`

Status:

- global helper shell
- collection browse
- collection Play All to Player 2
- manager tools protected on older manager page

### Player 2

Passed/current page:

- `player-2-progress-helper-v6-78-9-4-test.html`

Route:

- `player-two-global-helpers-v7-3-4-test.html`

Status:

- queue mode
- global helper carry
- progress logic preserved
- Player 1 import avoided/protected

## Protected older fallback pages

Keep these available as references/fallbacks:

- `channels-image-column-fix-v6-94-2-test.html`
- `playlists-feed-canonical-v6-96-0-test.html`
- `supabase-library-clean-editor-v6-93-0-test.html`

Do not delete old useful pages until a later registry/cleanup pass.

## Next recommended direction

The next group should be chosen from the menu overlay, not guessed.

Recommended next scan:

1. Scan menu shell current groups.
2. Identify the next unpassed group after Watch/Browse/Group Play.
3. Prefer a lighter group before another heavy admin/editor system.
4. Likely candidates:
   - Creator pages if not fully complete
   - Settings/global settings pages
   - Admin pages
   - User Management pages
   - Legacy/Favourite Tools reference pages

The next group should be scanned before any new page is built.

## Safe stopping point

If anything goes wrong later, return to this safe base:

- Watch group current
- Browse group current
- Group Play current

Live `index.html` remains untouched at this checkpoint.
