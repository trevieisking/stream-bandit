# Mux Manager media identity guard checkpoint

Date: 2026-07-10
Target: `mux-manager-global-helpers-v7-10-7-test.html`
Source SHA on main: `96e452263df2fffbb56f46fa3418c0261ea2febd`
Code Labs request: `72fbee12-a2c1-4cf3-8166-e8470dbe69d0`
Code Labs fixed candidate: 58,445 characters / 58,459 bytes
Expected fixed Git blob SHA: `6e78cea89a99b465d9df4da19df96e991bfa5c6b`

## Scope

One protected-page repair. Preserve the complete V7.12.308 Mux Manager interface and all working upload, UpChunk, poster, local asset, formatter, metadata, preview, playlist, collection, channel, shell, route, mobile and Group Play behaviour.

No schema, RLS, auth, storage-policy, Edge Function, payment or production-data change.

## Required repair

1. Validate media before every `sb_movies` publish or repair lookup.
2. Reject missing, concatenated/multiple-scheme and signed Mux token URLs.
3. Canonicalise public Mux player/stream URLs to `https://stream.mux.com/<playback-id>.m3u8`.
4. Use canonical values in `movieRow`.
5. Make Supabase lookup errors fail closed rather than becoming `not found`.
6. Verify a saved `sb_movie_id` matches the same media identity, current owner and selected channel.
7. Scope canonical URL and playback-ID searches by current owner and selected channel.
8. Verify playback-ID candidates by canonical media identity instead of accepting the first `ilike` result.
9. Remove title-only fallback matching.
10. Apply the same validation and scope to Repair Local Movie ID and Playback Formatter.

## Group Play boundary

Do not add blanket uniqueness. Intentional copies in different owner/channel placements must remain supported. Existing playlist/collection duplicate protection and `sb_group_play_set_movie_channel` behaviour must remain untouched.

## Acceptance

- Only the target HTML and this checkpoint may change.
- Malformed doubled URL rejects before any database write.
- Signed Mux token URL rejects before canonicalisation or write.
- Wrong/stale saved UUID cannot attach an unrelated movie.
- Valid canonical asset reuses only the matching owner/channel row.
- Existing upload and target workflows remain intact.
