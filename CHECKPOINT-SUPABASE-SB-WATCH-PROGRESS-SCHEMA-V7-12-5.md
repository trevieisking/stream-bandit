# Stream Bandit Checkpoint — Supabase sb_watch_progress Schema V7.12.5

Date: 2026-05-22

## Purpose

Current `sb_watch_progress` table definition reviewed for Continue Watching, playback resume and finished state tracking.

## Current fields

```txt
user_id uuid not null
movie_id uuid not null
progress_seconds numeric default 0
finished boolean default false
last_watched_at timestamptz default now()
```

## Keys and relationships

```txt
primary key: user_id, movie_id
user_id references sb_profiles(id) on delete cascade
movie_id references sb_movies(id) on delete cascade
index: user_id
```

## What this supports

This table supports:

- one progress record per user/movie
- resume playback from progress_seconds
- Continue Watching rows using last_watched_at
- finished flag for completed videos
- cleanup when a user/profile is deleted
- cleanup when a movie is deleted

## How it fits Stream Bandit

Recommended use:

```txt
user_id          -> profile/account watching the movie
movie_id         -> movie being watched
progress_seconds -> saved playback position
finished         -> true when user finishes or nearly finishes
last_watched_at  -> used for Continue Watching ordering
```

## Result

No schema change is needed now for Continue Watching and playback progress.

## Possible future improvements, not needed now

Later, if richer watch history is needed, consider a separate history/events table rather than overloading this table.

## Safety

No SQL was run. No table or row was changed. No RLS policy was changed. No live promotion.
