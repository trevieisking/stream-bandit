# Stream Bandit Checkpoint — Supabase sb_watchlist Schema V7.12.5

Date: 2026-05-22

## Purpose

Current `sb_watchlist` table definition reviewed for Watchlist page and user watch-later/saved movies.

## Current fields

```txt
user_id uuid not null
movie_id uuid not null
created_at timestamptz default now()
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

- one watchlist record per user/movie
- watchlist button toggle logic
- Watchlist page
- menu watchlist count
- cleanup when a user/profile is deleted
- cleanup when a movie is deleted

## How it fits Stream Bandit

Recommended use:

```txt
user_id    -> profile/account that saved the movie
movie_id   -> movie saved to watch later
created_at -> when it was added
```

## Result

No schema change is needed now for normal watchlist behaviour.

## Safety

No SQL was run. No table or row was changed. No RLS policy was changed. No live promotion.
