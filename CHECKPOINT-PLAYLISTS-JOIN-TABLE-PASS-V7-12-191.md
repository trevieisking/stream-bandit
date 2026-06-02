# Stream Bandit Checkpoint — Playlists Join Table Pass V7.12.191

Date: 2026-06-02

## Status

PASS.

## Page

- `playlists-global-helpers-v7-5-2-test.html`

## What was fixed

The Playlists page now reads the real playlist/movie relationship from:

- `sb_playlists`
- `sb_playlist_movies`
- `sb_movies`

The previous clean-shell page read `sb_playlists` and `sb_movies`, then guessed playlist membership using movie fields such as `movie.playlist_id`. That did not match the real Supabase schema.

## Confirmed schema relationship

- `sb_playlist_movies.playlist_id` -> `sb_playlists.id`
- `sb_playlist_movies.movie_id` -> `sb_movies.id`

## Confirmed test results

- Open Playlists: PASS
- Playlist appears: PASS
- Click playlist: PASS
- Linked movies appear: PASS
- Play Selected In Player 2: PASS
- Player 2 opens: `player-2-clean-machine-v7-12-58-test.html?queue=playlist`

## Route truth preserved

- Player 2 -> `player-2-clean-machine-v7-12-58-test.html`
- Collections -> `collections-clean-machine-v7-12-51-test.html`
- Channels -> `channels-global-helpers-v7-5-3-test.html`

## Shell shape

Playlists remains on the clean shell target:

- Header Shell
- Playlists Content
- Footer Shell
- Theme Projector

## Safety notes

No Supabase writes were added.
No Player 2 engine code was changed.
No old local page header/footer was restored.
