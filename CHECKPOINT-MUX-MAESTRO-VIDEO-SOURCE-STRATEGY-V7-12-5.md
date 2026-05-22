# Stream Bandit Checkpoint — Mux / Maestro Video Source Strategy V7.12.5

Date: 2026-05-22

## Purpose

Trevor explained the intended video-source strategy so Stream Bandit can avoid relying on one paid video host for everything.

## Main idea

Stream Bandit should support multiple public video URL sources, not only direct Mux dashboard assets.

## Source option 1 — Maestro / Chatterfriends Stream Bandit

Trevor uses:

- `https://maestro.tv/chatterfriends/stream-bandit`

This is treated as the first/preferred practical option for some large videos because it can provide usable video library links and reduces reliance on Mux paid minutes/storage.

The Maestro-style Video Library can provide URLs such as Mux/HLS style stream URLs, for example:

- `https://stream.mux.com/...m3u8`

These links can be stored in Stream Bandit movie rows and played by the Stream Bandit player when the URL is public/playable.

## Source option 2 — Trevor's Mux account

Trevor also has a real Mux dashboard/project:

- Chatterfriends / Stream Bandit Production

Mux dashboard assets are useful for public playback IDs, HLS URLs, thumbnails and standard player URLs.

Mux should remain supported, but not be the only source for every big video because costs/limits may matter later.

## How Stream Bandit should treat video URLs

Stream Bandit should store the final playable URL in Supabase movie rows, usually in fields such as:

- `video_url`
- `stream_url`
- related Mux/public playback fields where available

The app should not require private Mux API keys in the frontend.

The app should prefer safe public playback links:

- HLS `.m3u8` URL
- Mux player URL
- public iframe/player embed where needed
- thumbnail/animated preview URLs where useful

## Existing tool direction

The Mux Manager helper should be treated as a formatting/checking helper, not a billing/API/upload system.

It should help Trevor convert/copy:

- playback ID
- HLS URL
- player URL
- thumbnail URL
- animated preview URL
- iframe embed
- Supabase-ready helper text

## Current safety rule

No Mux secret keys in frontend code.
No private Mux API calls from static GitHub Pages pages.
No upload/delete/Mux billing actions from read-only helper pages.

## Storage split rule

- Images/posters/profile art: Supabase Storage
- Videos: Mux / Maestro / HLS / public playable URLs
- Metadata: Supabase database rows
- Static app: GitHub Pages/custom domain

## Next useful work later

When login/domain testing is stable again:

1. Review the existing Mux Manager page wording.
2. Make sure it clearly supports both Mux dashboard assets and Maestro-provided stream URLs.
3. Add a safe note that Maestro links can be pasted as final public video URLs if they play correctly.
4. Keep Mux Manager read-only unless Trevor explicitly asks for backend/API upload work later.
5. Consider a future Video Source Strategy page/tool that checks whether a pasted URL looks like HLS, Mux player, Mux image thumbnail, iframe, or normal public video URL.

## Current status

This is an architecture checkpoint only. No code changed and no video provider settings changed.
