# Stream Bandit Checkpoint — Supabase sb_collection_movies Schema V7.12.5

Date: 2026-05-22

## Purpose

Current `sb_collection_movies` table definition reviewed for collection movie membership and ordering.

## Current fields

```txt
collection_id uuid not null
movie_id uuid not null
sort_order integer default 0
```

## Keys and relationships

```txt
primary key: collection_id, movie_id
collection_id references sb_collections(id) on delete cascade
movie_id references sb_movies(id) on delete cascade
```

## What this supports

This table connects collections to movies.

It supports:

- many movies inside one collection
- the same movie in different collections
- unique movie per collection through the composite primary key
- collection ordering through sort_order
- cleanup when a collection is deleted
- cleanup when a movie is deleted

## How it fits Stream Bandit

The collection system is structurally complete:

```txt
sb_collections        -> collection header, image, creator, description
sb_collection_movies  -> movie membership and sort order
sb_movies             -> video metadata and playable URLs
```

## Result

No schema change is needed now for normal collection membership.

## Safety

No SQL was run. No table or row was changed. No RLS policy was changed. No live promotion.
