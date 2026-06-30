# Stream Bandit Checkpoint — Group Play Full Completion V7.13.121

Date: 2026-06-30

## Status

Group Play is now a full pass.

This checkpoint supersedes the very old V4/V5/V6-era Group Play checkpoint notes that pointed at older partial passes or older route assumptions.

## Completed Group Play routes

- `playlists-global-helpers-v7-5-2-test.html` — passed and proof wording cleaned.
- `channels-global-helpers-v7-5-3-test.html` — passed and proof wording cleaned.
- `my-channel-clean-machine-v7-12-47-test.html` — passed and proof wording cleaned.
- `collections-clean-machine-v7-12-51-test.html` — passed and proof wording cleaned.
- `player-2-clean-machine-v7-12-58-test.html` — passed and proof wording cleaned.

## Promotion decision

The Group Play set is promoted as a completed Stream Bandit group pass with old URLs preserved.

Important rule:

- Do not rename the old route files just because the visible/pass version is newer.
- Old URLs stay preserved while the page proof text records the promoted Group Play route state.
- The route filename remains the stable route contract.

## Proof markers now expected

Each Group Play route should no longer claim `noIndexPromotion:true` or `No index promotion` for this completed pass.

Expected proof wording:

- `Promoted Group Play route with old URL preserved`
- `promotedGroupPlayRoute:true`
- `oldUrlPreserved:true`

## Safety boundaries preserved

No Supabase schema change was made for this completion checkpoint.

No Mux change was made for this completion checkpoint.

No Player 1 route change was made.

No Details route change was made.

No Web Builder merge or cross-section rewrite was made.

No Supabase Library editor access was granted to Group Play creator pages.

## Player ownership

- Player 1 remains the single video player.
- Player 2 remains the queue / Play All player.
- Playlists, Channels, My Channel, Collections, and Supabase Library can hand off queues to Player 2.

## Superseded old checkpoint docs removed

The following older Group Play checkpoint docs were removed because this file now records the current completed pass:

- `CHECKPOINT-CHANNELS-GROUP-PLAY-IMAGE-COLUMNS-V7-4-9.md`
- `CHECKPOINT-GROUP-PLAY-PLAYLISTS-V7-5-2-PASSED.md`
- `CHECKPOINT-GROUP-PLAY-CHANNELS-V7-5-3-PASSED.md`

## Current checkpoint rule

Use this checkpoint as the current Group Play completion note.

If a future Group Play page is changed, preserve working behavior first, then update this checkpoint only after the user passes the page or the GitHub proof confirms the exact intended wording/route change.
