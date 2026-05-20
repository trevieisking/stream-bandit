# Stream Bandit Checkpoint — Playlists Group Play Scan

Date: 2026-05-20

## Important correction from Trevor

The Play All / Player 2 property first came from Genres, not Playlists.

Correct history:

- Genres is where Play All -> Player 2 first properly worked.
- Playlists later uses/borrows that group-play pattern because playlists are also a real group owner.
- Therefore Genres remains the main origin/clue page for Player 2 queue behaviour.
- Playlists is a valid Group Play owner, but not the original source of the feature.

## Current route

- `playlists-browse-shell-v6-47-test.html` forwards to `playlists-feed-canonical-v6-96-0-test.html`.

## Scan result

Playlists is a real Group Play owner.

It is not a simple Browse page and not in the same fear class as Supabase Library/Web Builder, but it is still complex and should not be casually rewritten.

## What the Playlists page does

The current canonical page:

- reads `sb_playlists`
- scans/uses playlist link tables such as `sb_playlist_movies`, `sb_playlist_items`, `sb_playlist_videos`, etc.
- reads `sb_movies`
- shows a social feed style playlist wall
- supports create/edit playlist
- supports playlist cover artwork upload to Supabase Storage
- supports adding/removing videos from playlists
- supports removing playlists
- supports queue row Single Play
- supports Playlist Play All in Player 2

## Player rules found

- Single Play / queue row Play -> Player 1 route.
- Playlist Play All -> Player 2 route.
- Details -> Details route.

This confirms the locked route rule while preserving the feature history:

- Genres originated the working Play All / Player 2 property.
- Playlists / Channels / My Channel / Collections can also be Group Play owners.
- Watchlist / Favourites / Likes / Continue Watching / Watch History = no Play All.
- Supabase Library = no Play All unless a deliberate real queue payload feature is designed.

## Why Playlists can use Player 2

Playlists has a real group context:

- playlist id
- playlist name
- attached movie rows
- stored link rows

Therefore Player 2 can be opened with a meaningful playlist queue.

This is different from the failed Supabase Library case, where `queue=library` was not a real group id/context and caused Player 2 to treat `library` like a UUID.

## Future V7 Playlists candidate should

- keep the current full direct page structure
- keep playlist create/edit/upload/add/remove logic unless deliberately testing writes
- update displayed routes and constants to current V7 routes:
  - Details -> `details-global-helpers-v7-3-1-test.html`
  - Player 1 -> `player-one-global-helpers-v7-3-3-test.html`
  - Player 2 -> `player-two-global-helpers-v7-3-4-test.html`
- add global helper status
- keep Play All because Playlists is a Group Play owner
- do not promote until Trevor tests route and queue behaviour

## Testing caution

For first V7 pass, prefer route/read/queue safety:

- page loads
- account/avatar/theme/menu/search work
- playlists load
- side rail works
- single Play opens Player 1
- Details opens V7 Details
- Play All opens Player 2 with queue

Avoid write tests at first unless deliberately testing:

- create playlist
- edit playlist
- upload cover
- add/remove videos
- remove playlist
