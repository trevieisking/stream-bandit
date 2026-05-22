# Stream Bandit Checkpoint — Supabase sb_likes Schema V7.12.5

Date: 2026-05-22

## Purpose

Current `sb_likes` table definition reviewed for Likes page and user liked movies.

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
```

## What this supports

This table supports:

- one like record per user/movie
- like button toggle logic
- Likes page
- cleanup when a user/profile is deleted
- cleanup when a movie is deleted

## How it fits Stream Bandit

Recommended use:

```txt
user_id    -> profile/account that liked the movie
movie_id   -> movie that was liked
created_at -> when the like was added
```

## Result

No schema change is needed now for normal Likes behaviour.

## Safety

No SQL was run. No table or row was changed. No RLS policy was changed. No live promotion.
