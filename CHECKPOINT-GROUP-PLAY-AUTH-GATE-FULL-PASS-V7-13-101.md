# Stream Bandit Group Play Auth Gate Full Pass Checkpoint V7.13.101

Date: 2026-06-22

Status: `GROUP PLAY AUTH GATE FULL PASS / LIVE CANDIDATE GROUP / FINAL ROLLBACK POINT / COLLECTIONS SOURCE FORMATTING CORRECTED / INDEX PROMOTED / PLAYLISTS CHANNELS MY CHANNEL COLLECTIONS PLAYER 2 PASSED`

## Why this checkpoint replaces V7.13.100

After the full Group Play browser pass, the Collections page was found to be stored as one long minified line. The page functioned, but the source was not acceptable for Trevor's file workflow.

Corrective action performed before this checkpoint:

- `collections-clean-machine-v7-12-51-test.html` was reformatted back into normal readable multi-line source.
- The existing URL stayed the same.
- The existing version stayed `V7.12.295 Collections Auth Gate Test`.
- The Auth Gate marker stayed attached.
- No Manifest or Master Plan behavior change was made during that formatting-only pass.
- No SQL, RLS, storage policy, payment, schema, index route, or Header Shell mass auth-gate change was made during that formatting-only pass.

Formatting correction commit:

`e5fad79e5c2ff3b3eb9bee65d044ec3f10f47c01`

Current Collections content SHA after formatting correction:

`33e15e34d9f4cb9b84f7446affffa48564a598ac`

The previous `CHECKPOINT-GROUP-PLAY-AUTH-GATE-FULL-PASS-V7-13-100.md` checkpoint was removed and replaced with this final checkpoint so the rollback point matches the current readable source.

## Cleanup history preserved

Three older checkpoint files were removed before the Group Play rollback point was created, following Trevor's cleanup rule:

- `CHECKPOINT-FOCUSED-SCOPE-ZERO-MISSING-V7-12-56.md`
- `CHECKPOINT-LIVE-APP-ROLE-LOCK-PLAN-V7-12-64.md`
- `CHECKPOINT-WEB-BUILDER-PAGES-MANAGER-START-V7-12-107.md`

These were old superseded planning/checkpoint documents and are not part of the current source-of-truth checkpoint chain.

## Current Group Play full pass pages

### Playlists

File: `playlists-global-helpers-v7-5-2-test.html`

Version: `V7.12.292 Playlists Auth Gate Test`

Status: `PASSED`

Preserved:

- signed-out users hit Auth Gate first
- signed-in users load Playlists
- existing playlist browsing stayed preserved
- own playlist create/edit/delete stayed page-owned and entitlement-limited
- add/remove videos to own playlists stayed page-owned and entitlement-limited
- `sb_playlists`, `sb_playlist_movies`, `sb_movies` and `sb_profiles` behavior stayed preserved
- no schema change
- no Supabase Library editor access
- no all-users-private fallback
- no Header Shell mass auth-gate embedding

### Channels

File: `channels-global-helpers-v7-5-3-test.html`

Version: `V7.12.293 Channels Auth Gate Test`

Status: `PASSED`

Preserved:

- signed-out users hit Auth Gate first
- signed-in users load Channels
- channel browsing stayed preserved
- profile channel edit stayed on `sb_profiles`
- extra channel create/edit/delete stayed on owned `sb_channels` rows only
- movie attach/remove stayed through `sb_group_play_set_movie_channel`
- working `sb_channels` column list stayed limited to real columns
- no `is_public` dependency
- no schema change
- no Supabase Library editor access
- no all-users-private fallback
- no Header Shell mass auth-gate embedding

### My Channel

File: `my-channel-clean-machine-v7-12-47-test.html`

Version: `V7.12.294 My Channel Auth Gate Test`

Status: `PASSED`

Preserved:

- signed-out users hit Auth Gate first
- signed-in users load My Channel
- Dashboard, Edit Profile Channel, My Videos, Submissions, Permissions and Rules tabs passed
- profile channel identity writes stayed on `sb_profiles`
- owned videos stayed scoped to `sb_movies.owner_id`
- owned submissions stayed scoped to `sb_submissions.submitter_id`
- Play My Videos In Player 2 stayed preserved
- no schema change
- no Supabase Library editor access
- no all-users-content fallback
- no Header Shell mass auth-gate embedding

### Collections

File: `collections-clean-machine-v7-12-51-test.html`

Version: `V7.12.295 Collections Auth Gate Test`

Status: `PASSED / SOURCE FORMATTING CORRECTED AFTER PASS`

Preserved:

- signed-out users hit Auth Gate first
- signed-in users load Collections
- Browse, Collection Studio, Add / Remove Videos, Permissions and Debug tabs passed
- Play Selected In Player 2 stayed preserved
- `sb_collections`, `sb_collection_movies`, `sb_movies` and storage artwork behavior stayed preserved
- selected-card sync and Remove Collection stayed preserved
- source was corrected from one long line back into normal multi-line HTML/CSS/JS
- old URL stayed preserved
- version stayed `V7.12.295 Collections Auth Gate Test`
- no schema change
- no storage policy change
- no Supabase Library editor access
- no all-users-private fallback
- no Header Shell mass auth-gate embedding

### Player 2

File: `player-2-clean-machine-v7-12-58-test.html`

Version: `V7.12.296 Player 2 Auth Gate Test`

Status: `PASSED`

Trevor browser-test result:

- hard refresh passed
- signed-out users hit Auth Gate first
- sign-in returned correctly
- Player 2 loaded
- queue/fallback loaded
- Play/Pause worked on HTML video
- audio boost worked on Mux/HLS/direct video
- Next/Previous queue buttons worked
- Comfort Controls tab opened
- Progress State tab opened
- Source Info tab opened
- Rules tab opened
- Checklist tab opened
- Debug tab opened

Preserved:

- Player 2 remains the queue / Play All player
- queue keys remain `streamBanditQueueV1`, `streamBanditUpNextV1`, `streamBanditPlayer2Queue`
- Mux/HLS/direct video sources stay on HTML video
- YouTube/Vimeo stay iframe/provider controlled
- audio boost remains available for HTML video sources
- iframe providers keep provider controls
- progress saving remains on `stream-bandit-progress-v6-73`
- Details route stays `details-clean-machine-v7-12-38-test.html`
- Player 1 route separation remains protected
- no schema change
- no storage policy change
- no RLS change
- no payment change
- no Header Shell mass auth-gate embedding

## Group Play full pass conclusion

Group Play is a full passed group under the controlled page-by-page Auth Gate rollout and is promoted on `index.html` as a live-candidate group.

Group Play live-candidate routes:

- `playlists-global-helpers-v7-5-2-test.html`
- `channels-global-helpers-v7-5-3-test.html`
- `my-channel-clean-machine-v7-12-47-test.html`
- `collections-clean-machine-v7-12-51-test.html`
- `player-2-clean-machine-v7-12-58-test.html`

## Future polish note

Functional pass needed later: major page organization/page polish for Group Play. The pages work, but Trevor noted the group is visually and organizationally untidy. This is not part of the Auth Gate pass and must be handled later as a dedicated page-organization/polish pass after source scan.

## Future video output / placement lock note

Do not confuse this with the Group Play Auth Gate pass.

Trevor clarified the intended architecture:

- Supabase Library Editor and Mux Manager are the two pages that currently control video outputs, video creation/publishing, and placement forms.
- Those two pages need the future form-specific locks.
- Normal creator-style users should only be able to add/place videos into their own created channels, collections and playlists, not everyone else's.
- Owner/admin media-management rights must remain global.
- Channels creates channels and renders channel state.
- My Channel renders signed-in profile/channel state and owned data.
- Collections creates collections and renders collections.
- Playlists creates playlists and renders playlists.
- The Group Play render/manage pages are not the first target of the video-output/channel-placement lock fix unless a later source scan proves otherwise.

## Promotion rule

This checkpoint is safe to use with `index.html` as the current Group Play live-candidate promotion.

Do not promote schema, RLS, storage policy, payment, Header Shell mass auth-gate embedding, or unrelated page rewrites as part of this checkpoint.
