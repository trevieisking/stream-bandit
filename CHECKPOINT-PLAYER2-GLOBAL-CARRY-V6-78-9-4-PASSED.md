# Stream Bandit Checkpoint — Player 2 Global Carry V6.78.9.4 Passed

Date: 2026-05-20

## Passed

Player 2 global carry test passed.

New tested file:

- `player-2-progress-helper-v6-78-9-4-test.html`

Global route promoted:

- `player-two-global-helpers-v7-3-4-test.html` now forwards to `player-2-progress-helper-v6-78-9-4-test.html`.

Rollback file untouched:

- `player-2-progress-helper-v6-78-9-3-test.html`

Backup branch:

- `checkpoint-before-player2-global-carry-direct-v6-78-9-4`

## What passed

From My Channel V7.5.0:

- Click Play All.
- Player 2 queue opens.
- Manual test of V6.78.9.4 queue loaded.
- Global helper status shows loaded/ready.
- Theme carries.
- Avatar carries.
- Previous works.
- Next works.
- Play This works.
- Progress saves and reads.
- Details opens V7.3.1.

## Protected logic

V6.78.9.4 kept the working V6.78.9.3 queue/progress pattern.

No Player 1 helper import.
No queue rewrite.
No progress rewrite.
No live/index promotion.

## Current Player route rules

- Player 1 route: `player-one-global-helpers-v7-3-3-test.html`
- Player 2 route alias: `player-two-global-helpers-v7-3-4-test.html`
- Player 2 tested target: `player-2-progress-helper-v6-78-9-4-test.html`
- Original Player 2 rollback: `player-2-progress-helper-v6-78-9-3-test.html`

## Group Play rules

Player 2 belongs only to real group/queue owners:

- Genres
- Playlists
- Channels
- My Channel
- Collections

Player 2 should not be used for fake queue names such as `queue=library`.

Supabase Library remains browse/editor only unless a deliberate real queue-payload feature is designed later.
