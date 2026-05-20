# Stream Bandit Checkpoint — Channels V7.5.2 Route Promoted

Date: 2026-05-20

## Result

Channels route has been promoted safely for the final run-through.

## Route chain

- `channels-browse-shell-v6-45-test.html`
- now forwards to `channels-global-helpers-v7-5-2-test.html`
- which forwards to protected manager page `channels-image-column-fix-v6-94-2-test.html`

## Why this was the safest move

Channels is not a simple read-only page. It is a real Group Play owner and also includes manager tools:

- reads `sb_channels`
- reads `sb_movies`
- create channel
- edit channel
- remove/hide channel
- upload banner image
- upload avatar/logo image
- add/remove videos by patching `sb_movies.channel_id`
- card Play opens Player 1
- Channel Play All opens Player 2 queue

Because those write/upload tools are already hard-won in V6.94.2, this pass did not rewrite the manager.

## Protected page

Do not casually edit:

- `channels-image-column-fix-v6-94-2-test.html`

That page contains the image column detection fix for `sb_channels`, including support for banner/avatar columns and metadata fallbacks.

## Created

- `channels-global-helpers-v7-5-2-test.html`

This is a read-only route wrapper/checkpoint page only. It explains that the protected V6.94.2 manager remains the active Channels manager.

## Updated

- `channels-browse-shell-v6-45-test.html`

It now forwards to the V7.5.2 wrapper instead of directly to the V6.94.2 manager.

## Test checklist for Trevor

1. Open `channels-browse-shell-v6-45-test.html`.
2. Confirm it forwards to `channels-global-helpers-v7-5-2-test.html`.
3. Confirm that page opens/forwards to `channels-image-column-fix-v6-94-2-test.html`.
4. Confirm Channels page loads.
5. Confirm channel cards/list show.
6. Open a channel.
7. Confirm channel videos show.
8. Click Details on a video.
9. Click single Play on a video.
10. Click Play All Channel in Player 2.

## Do not test first unless deliberate

These are write/upload tools and should only be tested when Trevor is ready:

- create channel
- edit channel
- upload banner
- upload avatar/logo
- add/remove video
- remove channel

## Live status

No live/index promotion was performed.

## Next safest target

After Channels passes, the next safest scan target is likely:

1. Playlists route, if following the Group Play owner set after Collections and Channels.
2. Genres route, if Trevor wants Browse discovery cleanup next.

Supabase Library remains protected and should not be touched casually.
