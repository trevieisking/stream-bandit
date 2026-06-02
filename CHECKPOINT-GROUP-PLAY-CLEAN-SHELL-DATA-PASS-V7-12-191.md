# Stream Bandit Checkpoint — Group Play Clean Shell + Data Pass V7.12.191

Date: 2026-06-02

## Status

GROUP PLAY PARTIAL/FUNCTIONAL PASS.

This checkpoint records the current Group Play cleanup after the Owner Brand route truth pass and registry baseline pass.

## Confirmed route/data passes

### My Channel V7.12.190

- `my-channel-clean-machine-v7-12-47-test.html`
- Collections button lands on `collections-clean-machine-v7-12-51-test.html`.
- Player 2 button lands on `player-2-clean-machine-v7-12-58-test.html?queue=my-channel`.
- Player 2 queue handoff passed.

### Playlists V7.12.191

- `playlists-global-helpers-v7-5-2-test.html`
- Clean shell refit completed.
- Old local header/footer removed.
- Reads the real playlist relationship using:
  - `sb_playlists`
  - `sb_playlist_movies`
  - `sb_movies`
- Confirmed user test:
  - Playlists open.
  - Playlist appears.
  - Clicking playlist shows linked movies.
  - Play Selected In Player 2 opens `player-2-clean-machine-v7-12-58-test.html?queue=playlist`.

### Channels V7.12.191

- `channels-global-helpers-v7-5-3-test.html`
- Clean shell refit completed.
- Old local header/footer removed.
- Reads the real channel relationship:
  - `sb_channels.id` -> `sb_movies.channel_id`
- Reads published movies only.
- Hidden movies are intentionally excluded from the viewer page.
- Confirmed user test:
  - Channels open.
  - Channels appear.
  - Clicking channels shows linked published movies.
  - Hidden movies do not show.
  - Play Selected In Player 2 opens `player-2-clean-machine-v7-12-58-test.html?queue=channel`.

## Viewer-page rule

The cleaned Playlists and Channels pages are viewer / Group Play pages.

They do not include old create/edit/hide/upload controls.

## Future user ownership plan

The platform may later allow users limited ownership features:

- one channel per user,
- playlists per user,
- collections per user,
- URL stream / music video style entries when allowed,
- no unrestricted uploads until the upload/storage/moderation plan is ready.

Those controls should be added deliberately through a management/editor route, not mixed back into the public viewer pages.

Potential future routes/pages:

- My Channel management
- Playlist manager
- Collection manager
- URL/music video submission flow

## Remaining Group Play cleanup

### Collections

`collections-clean-machine-v7-12-51-test.html` still acts as a wrapper/polish page over `collections-clean-machine-v7-12-50-test.html`.

This works and is protected, but it is not yet the final clean single-page shape.

### Player 2

`player-2-clean-machine-v7-12-58-test.html` works as the current queue player.

Do not touch the Player 2 engine casually. A future pass should only clean stale local footer/header shape after preserving playback, queue, progress, audio boost and fullscreen behaviour.

## Safety notes

No Supabase writes were added in this pass.
No Player 2 engine code was changed.
No upload permissions were unlocked.
No admin/editor controls were moved onto public viewer pages.
