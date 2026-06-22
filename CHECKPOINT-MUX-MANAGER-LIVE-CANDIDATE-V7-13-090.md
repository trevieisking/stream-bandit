# Stream Bandit Checkpoint — Mux Manager Live Candidate V7.13.090

Date: 2026-06-21

Status: PASSED / MUX MANAGER LIVE CANDIDATE / SUPABASE LIBRARY PUBLISH WORKS / PLAYLIST CHANNEL COLLECTION ATTACH WORKS / MAESTRO UPLOAD WORKFLOW CAN BE RETIRED FOR NEW UPLOADS

## File

- `mux-manager-global-helpers-v7-10-7-test.html`

## Current Mux Manager version

- `V7.12.308 Mux Manager Stale ID Recovery + Collection Attach`

## Browser pass result

Trevor confirmed the full Mux Manager flow passed:

- Mux upload slot creation works.
- UpChunk upload to Mux works.
- Processing check returns public HLS `.m3u8` output.
- Public player URL works.
- Poster upload creates a 1920x1080 Supabase Storage public URL.
- Mux Asset Library overlay works.
- Video Settings modal works.
- Targets can be saved locally.
- Publish to Supabase Library works through `sb_movies`.
- Playlist attach works through `sb_playlist_movies`.
- Channel attach works through the existing channel attach path / `sb_group_play_set_movie_channel`.
- Collection attach works through `sb_collection_movies` after stale local movie ID recovery.
- A second movie upload was completed and confirmed the workflow is repeatable.

## Important fix locked in

The page now verifies or recovers the real Supabase `sb_movies.id` before attaching playlist, collection or channel targets. This prevents stale local browser IDs from causing `sb_collection_movies_movie_id_fkey` failures.

Recovery lookup order:

1. saved `sb_movie_id`
2. `video_url`
3. `mux_playback_url`
4. Mux playback ID search
5. title fallback only when no URL is available
6. create a new `sb_movies` row only when no matching row exists

## Current live-candidate behavior

Mux Manager is now the Stream Bandit owner/admin media upload studio candidate:

- upload video files to Mux using the private Supabase Edge Function
- keep Mux credentials out of GitHub Pages / browser code
- upload 1920x1080 poster images to Supabase Storage
- save local Mux assets in the browser overlay
- preview, copy HLS URL and copy embed output
- manually publish or attach to Stream Bandit targets
- reuse existing movie rows instead of duplicating rows when a matching Mux URL already exists
- protect playlist and collection attach against duplicate link rows

## Tables / paths used

- `sb_movies`
- `sb_playlist_movies`
- `sb_collection_movies`
- `sb_group_play_set_movie_channel`
- Supabase Storage bucket: `stream-bandit-images`
- Supabase Edge Function: `mux-create-direct-upload`

## Boundaries preserved

- no SQL change
- no RLS change
- no storage policy change
- no payment provider change
- no schema change
- no service-role key in frontend
- no Mux token ID or token secret in GitHub Pages, HTML or JavaScript
- no Header Shell mass auth-gate embedding
- no public unrestricted upload path
- owner/admin-only Mux Manager workflow remains separate from Submit Video / Review Queue
- Home remains `home-global-helpers-v7-4-4-test.html`
- `index.html` remains Platform Entry and route launcher

## Promotion decision

Mux Manager is promoted to the Index as a current Main App media-management live candidate and should move with the Supabase Library / media-management group.

For new owner/admin video uploads, the old Maestro upload workflow can be retired in favor of Mux Manager. Existing Maestro/source compatibility work for Player 1, Player 2 or Review Queue remains a separate later playback compatibility task if needed.
