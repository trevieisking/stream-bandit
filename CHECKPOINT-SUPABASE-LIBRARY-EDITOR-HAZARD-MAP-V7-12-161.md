# Stream Bandit Checkpoint — Supabase Library Editor Hazard Map V7.12.161

Date: 2026-06-04

## Status

SCAN / HAZARD MAP ONLY.

No code changes were made to the Supabase Library Editor in this checkpoint.

## Target scanned

- `supabase-library-home-header-form-fix-v7-12-34-test.html`

## Current internal state

- V7.12.161 Supabase Library Editor / Polish

## Why this page is dangerous

This is a real admin/editor workbench. It touches live Supabase movie rows and image storage.

It is one of the user's favourite tools and must not lose existing logic.

## Main table / storage usage found from code

Table:

- `sb_movies`

Storage bucket:

- `stream-bandit-images`

Storage path pattern:

- `posters/{owner}/{timestamp}-{safe-title}-1920x1080.jpg`

Poster upload behaviour:

- image is resized/cropped to 1920 x 1080 JPEG,
- uploaded to the image bucket,
- public URL is placed into `thumbnail_url`,
- user must click Save/Create to store the URL into the row.

Storage delete behaviour:

- not performed here.
- deleting a movie row does not delete poster files.

## Exact movie fields currently used by the form

The page currently creates/edits/saves these `sb_movies` fields:

- `title`
- `description`
- `mux_playback_url`
- `video_url`
- `thumbnail_url`
- `trailer_url`
- `year`
- `rating`
- `runtime_text`
- `age_rating`
- `director`
- `cast_text`
- `genres`
- `tags`
- `channel_id`
- `owner_id`
- `featured`
- `duration_seconds`
- `source_type`
- `status`
- `updated_at`

Read-only/display fields:

- `id`
- `created_at`
- `updated_at`

Create defaults:

- `title: ''`
- `description: ''`
- `mux_playback_url: ''`
- `video_url: ''`
- `thumbnail_url: ''`
- `trailer_url: ''`
- `year: ''`
- `rating: ''`
- `runtime_text: ''`
- `age_rating: ''`
- `director: null`
- `cast_text: null`
- `genres: []`
- `tags: []`
- `channel_id: null`
- `owner_id: current user id where possible`
- `featured: false`
- `duration_seconds: 0`
- `source_type: mux`
- `status: published`

## Existing functions to preserve

Do not casually rewrite these functions:

- `readConfig()`
- `getClient()`
- `readProfile()`
- `requireSignedAdmin()`
- `load()`
- `render()`
- `filtered()`
- `fillGenres()`
- `card()`
- `blankMovie()`
- `fillForm()`
- `syncSource()`
- `cleanObj()`
- `saveVideo()`
- `imageTo1920()`
- `uploadPoster()`
- `openDelete()`
- `confirmDelete()`
- `playAll()`
- `helper()`
- `wire()`

## Existing real actions

Read:

- `sb_movies.select('*').order('created_at', descending).limit(500)`

Create:

- `sb_movies.insert(row).select('*').single()`
- followed by verification read

Update:

- `sb_movies.update(data).eq('id', id).select('*').maybeSingle()`
- followed by verification read

Delete:

- requires typed phrase `DELETE FROM SUPABASE`
- `sb_movies.delete().eq('id', id).select('id,title')`
- followed by verification read to prove the row is gone

Queue/play all:

- writes visible library queue into sessionStorage/localStorage queue keys
- opens Player 2 with first visible movie id

## Existing overlays to preserve

- Create Video Overlay
- Edit Video Overlay
- Permanent Delete Overlay
- Poster upload button inside edit/create overlay
- Typed delete confirmation phrase: `DELETE FROM SUPABASE`

## Existing filters/controls to preserve

Search searches:

- title
- description
- director
- cast_text
- genres
- tags

Status filter:

- active / not hidden
- all
- published
- draft
- pending
- hidden

Source filter:

- all
- mux
- hls
- url
- missing

Other controls:

- generated genre filter
- sort newest
- sort oldest
- sort title A-Z
- missing data first
- clear filters
- play all visible in Player 2

## Issue found

Stale Player 2 route is still present:

- `player-2-progress-helper-v6-78-9-4-test.html`

Current active Player 2 route should be:

- `player-2-clean-machine-v7-12-58-test.html`

This stale route appears in:

- `PLAYER2` constant,
- Routes tab Player 2 link,
- Play All Visible destination.

## Recommended next code pass

Name:

- V7.12.217 Supabase Library Shell/Route Preservation Pass

Allowed changes only:

1. Keep all create/edit/delete/upload functions intact.
2. Keep all `sb_movies` field keys intact.
3. Keep poster upload path and resize behaviour intact.
4. Keep typed delete phrase intact.
5. Add/confirm current Header Shell + Footer Shell + Theme Projector.
6. Add saved counters/core/settings helpers if missing.
7. Fix stale Player 2 route to current route.
8. Add field inventory/debug note if useful.

Not allowed in that pass:

- no form redesign,
- no schema assumptions,
- no RLS/storage policy changes,
- no storage delete changes,
- no soft-delete conversion unless user explicitly approves,
- no public Library rewrite,
- no Web Builder changes,
- no Player 2 logic changes.

## Current best rule

Preserve the toy first. Upgrade shell/route wrapper second. Do not touch the engine unless a specific bug is found and tested.
