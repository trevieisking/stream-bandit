# CHECKPOINT — GROUP PLAY NEXT TARGET: MY CHANNEL NEEDS CLEAN WORK V7.12.47

Date: 2026-05-24

Current Group Play progress:

- Playlists: PASSED
- Channels: PASSED
- My Channel: STOPPED / NEEDS CLEAN WORK
- Collections: not scanned in this group pass yet
- Player 2: not scanned in this group pass yet

My Channel page:

`my-channel-global-helpers-v7-5-0-test.html`

Route Pointer result from Trevor:

Matches: 8
Bad candidates: 6

Bad route targets found:

1. `review-queue-status-delete-v6-99-0-test.html`
   - Replace with `review-queue-global-helpers-v7-5-7-test.html`

2. `review-queue-approved-to-movies-v7-0-0-test.html`
   - Replace with `review-queue-global-helpers-v7-5-7-test.html`

3. `channels-image-column-fix-v6-94-2-test.html`
   - Replace with `channels-global-helpers-v7-5-3-test.html`

4. `submit-video-creator-shell-v6-49-test.html`
   - Replace with `submit-video-global-helpers-v7-5-6-test.html`

5. `review-queue-creator-shell-v6-51-test.html`
   - Replace with `review-queue-global-helpers-v7-5-7-test.html`

6. `player-two-global-helpers-v7-3-4-test.html`
   - Replace with `player-2-progress-helper-v6-78-9-4-test.html`

OK current/support targets found:

- `details-global-helpers-v7-3-1-test.html` is allowed/support and protected by the shared route guard.
- `player-one-global-helpers-v7-3-3-test.html` is allowed/current.

Decision:

My Channel is the next build target. Do not patch blindly. Build a full clean My Channel test page or provide a full-file replacement instruction if GitHub/tool blocks.

Rules for the clean My Channel page:

- Home-style header.
- Global helpers loaded.
- Overlay menu opens.
- Search opens current Global Search.
- My Channel owns creator/channel profile display.
- Creator actions point to current Submit Video and Review Queue pages.
- Channel links point to current Channels page.
- Details opens Clean Details or an allowed route-guarded details target.
- Single play opens Player 1.
- Play All / group queue opens Player 2 current support route.
- No old V6 creator shell buttons.
- No old review queue status/delete route.
- No old approved-to-movies route.
- No old player-two-global route.
- No live/index promotion.

Next action:

Create `my-channel-clean-machine-v7-12-47-test.html`, let Trevor test it, then checkpoint/promote only after pass.
