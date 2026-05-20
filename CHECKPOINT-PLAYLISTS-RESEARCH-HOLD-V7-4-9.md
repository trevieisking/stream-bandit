# Stream Bandit Checkpoint — Playlists Research Hold

Date: 2026-05-20

## Status

Playlists has been researched enough to decide not to rewrite it casually.

Current route:

- `playlists-browse-shell-v6-47-test.html` -> `playlists-feed-canonical-v6-96-0-test.html`

## Why it is on hold

Playlists is a real Group Play owner, but the current canonical file is complex and compressed. It includes several hard-won behaviours:

- `sb_playlists` read/write
- playlist link table detection
- support for multiple possible link table names
- `sb_movies` read
- playlist feed/social wall layout
- playlist create/edit overlay
- playlist cover upload to Supabase Storage
- add/remove videos from playlists
- remove playlist
- queue row Single Play
- Playlist Play All in Player 2

## Corrected history

The Play All / Player 2 property first came from Genres.

Playlists later uses/borrows that group-play pattern because playlists are also a real group owner.

## Safe decision

Do not hand-rebuild Playlists from scratch.
Do not wrapper-patch it casually.
Do not alter link-table detection casually.
Do not alter queue-building logic casually.

The current route can remain stable for this pass because old route filenames now forward correctly for Details and Player 1. Player 2 behaviour should be tested before any promotion.

## Future proper V7 Playlists pass

Only attempt after either:

1. full current source is copied cleanly into a direct V7 file, or
2. Trevor confirms the existing Playlists page is safe to test and only exact route constants/helpers are edited.

Future candidate should preserve:

- existing schema-aware playlist management
- existing link table detection
- existing cover upload
- existing add/remove videos
- existing playlist queue construction

Future candidate should update:

- Details -> `details-global-helpers-v7-3-1-test.html`
- Player 1 -> `player-one-global-helpers-v7-3-3-test.html`
- Player 2 -> `player-two-global-helpers-v7-3-4-test.html`, but only after compatibility is checked
- global helper status

## Testing caution

First test pass should be read/route/queue only:

- page opens
- playlists load
- side rail works
- single Play opens Player 1
- Details opens V7 Details
- Play All opens Player 2 queue

Do not test writes first unless deliberate:

- create playlist
- edit playlist
- upload cover
- add/remove video
- remove playlist
