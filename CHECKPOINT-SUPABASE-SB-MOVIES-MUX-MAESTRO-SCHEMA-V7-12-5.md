# Stream Bandit Checkpoint — Supabase sb_movies / Mux / Maestro Schema V7.12.5

Date: 2026-05-22

## Purpose

Trevor supplied the current `sb_movies` table definition so the video-source strategy can be checked against the real Supabase schema.

This checkpoint confirms the table already supports the main Mux / Maestro / HLS / public URL workflow without needing an immediate schema change.

## Current important sb_movies media fields

```txt
mux_playback_url text
video_url text
thumbnail_url text
trailer_url text
source_type text default 'url'
status text default 'published'
duration_seconds numeric default 0
runtime_text text
```

## Current important metadata fields

```txt
title
description
year
rating
age_rating
director
cast_text
genres text[]
tags text[]
channel_id
owner_id
featured
created_at
updated_at
```

## Current source_type values allowed

```txt
mux
hls
url
local
missing
```

## Current status values allowed

```txt
published
draft
pending
hidden
```

## What this means for Maestro / Mux

The current schema can support Trevor's plan now.

Recommended use:

```txt
video_url          -> final playable video URL the player should load first
mux_playback_url   -> optional Mux player/playback/helper URL when available
thumbnail_url      -> poster/thumbnail URL, usually Supabase Storage or Mux image URL
trailer_url        -> optional trailer URL
source_type        -> hls, mux, url, local, or missing
```

## Maestro/HLS recommendation

For Maestro-provided stream links such as:

```txt
https://stream.mux.com/example.m3u8
```

Use:

```txt
video_url: the full .m3u8 URL
source_type: hls
tags: can include maestro if useful
```

No new `maestro` source_type is needed right now because the playable output is an HLS/public URL.

## Direct Mux recommendation

For Mux dashboard assets:

```txt
video_url: https://stream.mux.com/PLAYBACK_ID.m3u8
mux_playback_url: https://player.mux.com/PLAYBACK_ID or helper/player URL
thumbnail_url: https://image.mux.com/PLAYBACK_ID/thumbnail.jpg?time=1
source_type: mux or hls
```

Use `mux` when treating it as a known Mux asset. Use `hls` when treating it simply as a playable HLS stream.

## Public URL recommendation

For normal direct public MP4/WebM URLs:

```txt
video_url: direct public video file URL
source_type: url
```

Do not use normal webpage/library URLs unless the player page intentionally supports iframe/embed playback.

## Good news

The current `sb_movies` table already contains the main fields needed for:

- Maestro HLS links
- Mux stream URLs
- Mux player helper URLs
- thumbnails/posters
- trailers
- genres/tags
- channel/owner ownership
- draft/pending/hidden/published moderation

## Possible future improvement, not needed now

Later, if Trevor wants clearer provider reporting, add optional columns such as:

```txt
source_provider text -- maestro, mux, external, direct
source_notes text
embed_url text
poster_source text
```

But do not change schema now unless a real page/tool needs it.

## Safety

No SQL was run.
No table was changed.
No rows were edited.
No RLS policies were changed.
No video provider settings were changed.
No live/index promotion from this checkpoint.
