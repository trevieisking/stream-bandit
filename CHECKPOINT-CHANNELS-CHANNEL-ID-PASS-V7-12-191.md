# Stream Bandit Checkpoint — Channels Channel ID Pass V7.12.191

Date: 2026-06-02

## Status

PASS.

## Page

- `channels-global-helpers-v7-5-3-test.html`

## What was fixed

The Channels page now reads the real channel/movie relationship:

- `sb_channels.id` -> `sb_movies.channel_id`

The page now reads published movies only and does not show hidden movies.

## Confirmed test results

- Open Channels: PASS
- Channels appear: PASS
- Click Chatterfriends test / Test Channel / Stream Bandit Channel: PASS
- Only published movies linked by `channel_id` show: PASS
- Hidden movies do not show: PASS
- Play Selected In Player 2: PASS
- Player 2 opens: `player-2-clean-machine-v7-12-58-test.html?queue=channel`

## Intentional viewer-page behaviour

The clean Channels page is now a viewer / Group Play page. It does not include old overlay edit/create/hide controls.

Edit/create/hide/publish controls should live in an editor/admin route such as Supabase Library Editor, Submit Video, Review Queue, or a future dedicated channel/movie management page. They should not be mixed back into the public Channels viewer page.

## Route truth preserved

- Player 2 -> `player-2-clean-machine-v7-12-58-test.html`
- Playlists -> `playlists-global-helpers-v7-5-2-test.html`
- Collections -> `collections-clean-machine-v7-12-51-test.html`

## Shell shape

Channels remains on the clean shell target:

- Header Shell
- Channels Content
- Footer Shell
- Theme Projector

## Safety notes

No Supabase writes were added.
No Player 2 engine code was changed.
No old local page header/footer was restored.
Hidden movies are intentionally excluded from the viewer page.
