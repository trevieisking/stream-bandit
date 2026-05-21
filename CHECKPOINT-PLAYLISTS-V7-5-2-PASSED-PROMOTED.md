# Stream Bandit Checkpoint — Playlists V7.5.2 Passed + Promoted

Date: 2026-05-21

## Page passed

Passed direct global test page:

- `playlists-global-helpers-v7-5-2-test.html`

## Route promoted

Route file:

- `playlists-browse-shell-v6-47-test.html`

Now opens:

- `playlists-global-helpers-v7-5-2-test.html`

Route promotion commit:

- `c1529c13c3095c1bf5a4c617d4195933a055b9a8`

## Trevor test result

Trevor confirmed:

- Page loads: PASS
- Theme matches global theme: PASS
- Account/avatar appears correctly: PASS
- Helper status shows account/avatar/shared style/settings bridge loaded: PASS
- Playlists load: PASS
- Click playlist in side rail: PASS
- Playlist feed post/artwork/thumb rail/queue rows show: PASS
- Details opens `details-global-helpers-v7-3-1-test.html`: PASS
- Play opens `player-one-global-helpers-v7-3-3-test.html`: PASS
- Play All opens Player 2 V6.78.9.4 and queue works: PASS
- Create a playlist: PASS
- Add video to that playlist: PASS
- Remove the playlist: PASS
- Forms open and close: PASS
- All fields are clickable: PASS

Not deliberately tested in this pass:

- edit one existing playlist text field
- upload playlist cover and confirm it persists

These remain available as protected tools, but the page passes because create/add/remove/forms/routes/queue/global behaviour all passed.

## Preserved features

V7.5.2 preserved the important V6.96.0 Playlist Feed functions:

- `sb_playlists` loading
- playlist link table detection
- `sb_movies` loading
- social feed style playlist wall
- playlist side rail
- playlist artwork display
- create playlist
- edit playlist overlay available
- cover upload available
- add/remove videos through detected link table
- remove/hide playlist
- queue row Details / Play
- Playlist Play All queue

## Current routes inside Playlists

- Details: `details-global-helpers-v7-3-1-test.html`
- Player 1: `player-one-global-helpers-v7-3-3-test.html`
- Player 2: `player-2-progress-helper-v6-78-9-4-test.html`

## Queue keys preserved

- `streamBanditQueueV1`
- `streamBanditUpNextV1`
- `streamBanditPlayer2Queue`

## Safe status

- Live `index.html` not promoted
- Supabase schema unchanged
- Old stable playlist page remains available as fallback:
  - `playlists-feed-canonical-v6-96-0-test.html`

## Group Play status after this checkpoint

Group Play is now passed/promoted or route-checked:

- Playlists: done and promoted to V7.5.2
- Channels: done and promoted to V7.5.3
- My Channel: done
- Collections: done
- Player 2: done

Group Play menu group can now be considered complete for this global-helper pass, pending final registry/version/live RC later.
