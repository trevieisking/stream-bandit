# Stream Bandit Checkpoint — Supabase sb_playlist_movies Schema V7.12.5

Date: 2026-05-22

## Purpose

Current `sb_playlist_movies` table definition reviewed for playlist movie membership and ordering.

## Current fields

```txt
playlist_id uuid not null
movie_id uuid not null
sort_order integer default 0
```

## Keys and relationships

```txt
primary key: playlist_id, movie_id
playlist_id references sb_playlists(id) on delete cascade
movie_id references sb_movies(id) on delete cascade
```

## What this supports

This table connects playlists to movies.

It supports:

- many movies inside one playlist
- the same movie in different playlists
- unique movie per playlist through the composite primary key
- playlist ordering through sort_order
- automatic cleanup when a playlist is deleted
- automatic cleanup when a movie is deleted

## How it fits Stream Bandit

The playlist system is structurally complete:

```txt
sb_playlists        -> playlist header, image, owner, description
sb_playlist_movies  -> movie membership and sort order
sb_movies           -> video metadata and playable URLs
```

## Result

No schema change is needed now for normal playlist membership.

## Possible future improvements, not needed now

Later, if advanced playlist features are needed, consider optional fields such as:

```txt
added_at timestamptz
added_by uuid
notes text
```

But current structure is enough for Stream Bandit playlists and Group Play planning.

## Safety

No SQL was run. No table or row was changed. No RLS policy was changed. No live promotion.
