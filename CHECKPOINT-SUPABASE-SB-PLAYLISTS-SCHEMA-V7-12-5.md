# Stream Bandit Checkpoint — Supabase sb_playlists Schema V7.12.5

Date: 2026-05-22

## Purpose

Current `sb_playlists` table definition reviewed for Playlists, Group Play and user/creator playlist ownership.

## Current fields

```txt
id uuid default gen_random_uuid()
name text not null
image_url text
owner_id uuid references sb_profiles(id) on delete cascade
is_public boolean default false
created_at timestamptz default now()
updated_at timestamptz default now()
description text
```

## What this supports

This table supports:

- playlist name
- playlist description
- playlist cover image
- owner profile link
- public/private flag
- created/updated timestamps
- automatic updated_at trigger

## Recommended use

```txt
name        -> playlist display name
description -> playlist/about text
image_url   -> playlist cover/poster image
owner_id    -> owner profile
is_public   -> whether other users/visitors can see it
```

## Important note

This table stores playlist headers/details only.

Playlist movie membership normally needs a join/link table such as:

```txt
sb_playlist_items
sb_playlist_movies
```

or another existing table that connects playlist_id to movie_id.

## Result

The `sb_playlists` table itself is suitable for playlist metadata. The next needed check is the playlist item/link table, if one exists.

## Safety

No SQL was run. No table or row was changed. No RLS policy was changed. No live promotion.
