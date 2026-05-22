# Stream Bandit Checkpoint — Storage Split: Maestro / Mux / Supabase V7.12.5

Date: 2026-05-22

## Purpose

Trevor clarified the practical media-storage plan for Stream Bandit so future pages/tools do not assume every video must be uploaded directly through Mux.

## Final intended split

```txt
Images/posters/profile art  -> Supabase Storage
Video files / streaming URLs -> Maestro / Mux / HLS / public playable URLs
Metadata / movie rows        -> Supabase database
Static frontend              -> GitHub Pages / custom domain
Public contact email         -> info@chatterfriendsstreambandit.co.uk
```

## Maestro / Chatterfriends video library role

Trevor has access to a Maestro/Chatterfriends Stream Bandit video library/channel:

```txt
https://maestro.tv/chatterfriends/stream-bandit
```

Use this as the first practical video-library option when it provides a playable public URL.

Important notes from Trevor:

- It acts like a useful video library/storage source.
- It can provide stream-style URLs that work in Stream Bandit.
- It is useful because it is cheaper/free for life for one channel.
- Trevor does not need more channels there.
- It is not being used as the Stream Bandit user account/login system.
- Users should not be asked to sign up/log in there.
- It is mainly a storage/library/free-streaming source.
- Trevor believes it is best suited for MP4 up to 1080p; exact codec/number mentioned by Trevor needs verifying later, possibly H.264.

## Mux role

Trevor also has a Mux dashboard/project:

- Chatterfriends / Stream Bandit Production

Mux remains valuable for:

- higher-quality/resolution video handling
- playback IDs
- HLS URLs
- player URLs
- thumbnails
- animated previews
- iframe/player embeds

Mux should be supported, but not treated as the only source because usage/minutes/costs may matter later.

## How Stream Bandit should use both

Stream Bandit should not care where the final playable video came from as long as the URL is public and playable.

Movie rows should store the final usable playback value in fields such as:

```txt
video_url
stream_url
mux_playback_id where available
poster_url / thumbnail_url where useful
```

The player should accept:

- HLS `.m3u8` URLs
- Mux stream URLs
- Mux player URLs where supported
- public video URLs where supported
- iframe/embed values only where a page intentionally supports embeds

## Safety rules

- No Mux secret/API keys in frontend code.
- No private Maestro admin keys in frontend code.
- No backend upload/delete/billing actions inside read-only helper pages.
- Mux Manager should remain a formatter/checker unless a proper backend/API system is built later.
- Supabase Storage is for images/artwork, not long video hosting.

## Tool/page impact later

When login/domain testing is stable again, update the Mux Manager or future Video Source Strategy helper so it clearly supports:

1. Paste a Mux playback ID.
2. Paste a Mux/HLS `.m3u8` stream URL.
3. Paste a Maestro-provided public video URL.
4. Convert/check/copy Supabase-ready values.
5. Explain that Maestro and Mux are both valid video-source routes.

## Current status

This is an architecture checkpoint only.

No code changed.
No video provider settings changed.
No Supabase rows changed.
No GitHub live promotion.
