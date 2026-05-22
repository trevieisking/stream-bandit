# Stream Bandit Checkpoint — Supabase sb_favourites Schema V7.12.5

Date: 2026-05-22

## Purpose

Current `sb_favourites` table definition reviewed for the Favourites page and user saved favourite movies.

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

- one favourite record per user/movie
- user favourites page
- favourite button toggle logic
- cleanup when a user/profile is deleted
- cleanup when a movie is deleted

## How it fits Stream Bandit

Recommended use:

```txt
user_id    -> profile/account that favourited the movie
movie_id   -> movie that was favourited
created_at -> when the favourite was added
```

## Result

No schema change is needed now for normal favourites behaviour.

## Safety

No SQL was run. No table or row was changed. No RLS policy was changed. No live promotion.
