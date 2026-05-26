# CHECKPOINT — RECOVERED WORKING GROUPS AFTER CHAT FAILURE V7.12.49

Date: 2026-05-26

Purpose:

The chat failed after several pages had already passed. This checkpoint records the recovered true working state so we do not go backwards, repeat old broken machine flow, or accidentally break passed pages.

## Restored working rule

Machines are banned for now.

Current working flow:

1. Deep scan one page at a time.
2. Check live readiness, security, permissions, role access, and protected controls first.
3. Every page must keep the global system: account, overlay menu, overlay search, footer, theme, avatar, favicon, and global settings.
4. If the page is good, pass the current page.
5. Only rebuild a page if it is truly needed.
6. No back-to-old-version buttons.
7. Unlock Trevor controls except payments; keep normal users protected.
8. Test page first, then code-check.
9. After Trevor confirms pass, scan/code-check again and promote to the correct menu group.
10. After a group page passes, check its child pages/buttons/tabs/helpers.
11. Check property owners and Supabase writes before changing anything.
12. Image uploaders must connect to the Supabase bucket when that work is active.
13. Trevor uses full-page code replacements only; no tiny manual patching.
14. Once a full menu group passes, then decide whether to promote to index.html.

## Already passed and protected before today recovery

### Watch group — PASSED / protected

- Home: `home-global-helpers-v7-4-4-test.html`
- Details: `details-clean-machine-v7-12-38-test.html`
- Player 1: `player-one-global-helpers-v7-3-3-test.html`
- Continue Watching: `continue-watching-global-helpers-v7-3-9-test.html`
- Watch History: `watch-history-global-helpers-v7-4-0-test.html`
- Watchlist: `watchlist-clean-machine-v7-12-43-test.html`
- Favourites: `favourites-clean-machine-v7-12-41-test.html`
- Liked: `likes-clean-machine-v7-12-42-test.html`
- Accessibility: `accessibility-clean-machine-v7-12-44-test.html`

Status:

- Watch group already passed.
- Do not redo it unless a real blocker is found during one-page scan.
- Do not undo the global helper/header/search routes.

### Browse group — PASSED / protected

- Library: `library-global-helpers-v7-4-8-test.html`
- Supabase Library: `supabase-library-home-header-form-fix-v7-12-34-test.html`
- Genres: `genres-clean-machine-v7-12-45-test.html`
- Global Search: `global-search-global-helpers-v7-4-9-test.html`
- About: `about-clean-machine-v7-12-46-test.html`

Status:

- Browse group already passed.
- Watch + Browse were previously promoted to `index.html` after backup.
- Do not redo Browse unless a real blocker is found during one-page scan.

## Group Play recovered true state

Group Play order:

1. Playlists
2. Channels
3. My Channel
4. Collections
5. Player 2

### Playlists — PASSED

Passed page:

`playlists-global-helpers-v7-5-2-test.html`

Checkpoint/commit evidence:

- `CHECKPOINT-GROUP-PLAY-PLAYLISTS-V7-5-2-PASSED.md`
- Commit message: `Record Group Play Playlists route scan passed`

Notes:

- Route scan passed with bad candidates: 0.
- No rebuild needed for this pass.
- Shell already points Group Play > Playlists to the passed route.
- Do not redo Playlists unless a real blocker appears.

### Channels — PASSED

Passed page:

`channels-global-helpers-v7-5-3-test.html`

Checkpoint/commit evidence:

- `CHECKPOINT-GROUP-PLAY-CHANNELS-V7-5-3-PASSED.md`
- Commit message: `Record Group Play Channels route scan passed`

Notes:

- Route scan passed with bad candidates: 0.
- No rebuild needed for this pass.
- Shell already points Group Play > Channels to the passed route.
- Do not redo Channels unless a real blocker appears.

### My Channel — PASSED

Passed page:

`my-channel-clean-machine-v7-12-47-test.html`

Checkpoint/commit evidence:

- `CHECKPOINT-GROUP-PLAY-MY-CHANNEL-CLEAN-MACHINE-V7-12-47-PASSED.md`
- Commit message: `Record Group Play My Channel V7.12.47 passed`

Important correction:

- My Channel has passed.
- My Channel is the creator/channel home.
- Adding/removing videos is handled from the Channels route, not by forcing My Channel to own all video-management work.
- My Channel must not borrow Review Queue ownership except linking to the current Review Queue route.

Trevor-confirmed behaviours from recovered checkpoint:

- Home-style header passed.
- Global helpers loaded.
- Overlay menu opens.
- Search opens current Global Search.
- Dashboard loads.
- My Videos tab loads.
- Submissions tab loads.
- Channels tab loads.
- Review Queue opens `review-queue-global-helpers-v7-5-7-test.html`.
- Submit Video opens `submit-video-global-helpers-v7-5-6-test.html`.
- Channels opens `channels-global-helpers-v7-5-3-test.html`.
- Details opens `details-clean-machine-v7-12-38-test.html`.
- Play opens `player-one-global-helpers-v7-3-3-test.html`.
- Play All opens `player-2-progress-helper-v6-78-9-4-test.html`.
- No old bad Review Queue / Submit Video / Channel image fix / Player 2 routes.
- No live/index promotion yet.

### Collections — PASSED

Passed page:

`collections-clean-machine-v7-12-48-test.html`

Checkpoint/commit evidence:

- `CHECKPOINT-GROUP-PLAY-COLLECTIONS-CLEAN-MACHINE-V7-12-48-PASSED.md`
- Commit message: `Record Group Play Collections V7.12.48 passed`

Trevor-confirmed behaviours from recovered checkpoint:

- Home-style header passed.
- Global helpers loaded.
- Overlay menu opens.
- Search opens current Global Search.
- Collections load.
- Collection cards select correctly.
- Videos load under selected collection.
- Details opens `details-clean-machine-v7-12-38-test.html`.
- Play opens `player-one-global-helpers-v7-3-3-test.html`.
- Play All opens `player-2-progress-helper-v6-78-9-4-test.html`.
- Channels button opens `channels-global-helpers-v7-5-3-test.html`.
- Playlists button opens `playlists-global-helpers-v7-5-2-test.html`.
- No old `collections-remove-fix-v6-95-2-test.html`.
- No old `player-two-global-helpers-v7-3-4-test.html`.
- No live/index promotion yet.

Important route note:

- Old `collections-global-helpers-v7-5-1-test.html` safely forwards to `collections-clean-machine-v7-12-48-test.html`.
- On the next safe full shell replacement, direct Group Play > Collections to `collections-clean-machine-v7-12-48-test.html`.

### Player 2 — NEXT / NOT PASSED YET

Current status:

- No recovered checkpoint found for Player 2 pass.
- Do not mark Group Play complete yet.
- Player 2 is the final Group Play page.

Next exact task:

Deep scan Player 2 one page at a time using the corrected working flow, not the old machine flow.

Check Player 2 for:

- live readiness and security first,
- global account system,
- overlay menu,
- overlay search,
- footer,
- theme/avatar/favicon/global settings,
- no old group-player route buttons,
- progress/helper behaviour preserved,
- no overwrite of Player 1 ownership,
- queue/group playback only,
- no blind Supabase writes.

If Player 2 passes, record it as Group Play Player 2 passed.

If Player 2 fails, build a complete clean test page, likely:

`player-2-clean-machine-v7-12-49-test.html`

Only after Player 2 passes:

1. Save Group Play passed checkpoint.
2. Back up `index.html`.
3. Promote Group Play to `index.html` only if the group pass is safe.

## Do-not-break protection

Do not go backwards to the old broken flow.

Do not re-open already passed pages unless there is a real, specific blocker.

Do not mark Group Play complete until Player 2 passes.

Do not promote live/index mid-page.

Do not add old-version/back-to-old buttons.

Do not duplicate property ownership.

Do not turn My Channel into the full video-management owner.

Do not change Supabase writes unless the page owns that action and the write is deliberate.

Do not handle payments in this pass.

## Current next action

Continue from:

`Player 2`

not My Channel, not Collections, not Watch/Browse.

Recovered status:

- Watch group: PASSED
- Browse group: PASSED
- Group Play: 4 / 5 passed
  - Playlists: PASSED
  - Channels: PASSED
  - My Channel: PASSED
  - Collections: PASSED
  - Player 2: NEXT
