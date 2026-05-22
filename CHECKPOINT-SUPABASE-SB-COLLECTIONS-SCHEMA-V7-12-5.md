# Stream Bandit Checkpoint — Supabase sb_collections Schema V7.12.5

Date: 2026-05-22

## Purpose

Current `sb_collections` table definition reviewed for Stream Bandit Collections page and grouped movie collections.

## Current fields

```txt
id uuid default gen_random_uuid()
name text not null
description text
image_url text
created_by uuid references sb_profiles(id) on delete set null
created_at timestamptz default now()
updated_at timestamptz default now()
```

## What this supports

This table supports:

- collection name
- collection description
- collection cover image
- admin/profile creator link
- created/updated timestamps
- automatic updated_at trigger

## Recommended use

```txt
name        -> collection display name
description -> collection/about text
image_url   -> collection cover/banner/poster
created_by  -> profile that created the collection
```

## Important note

This table stores collection headers/details only.

Collection movie membership normally needs a join/link table such as:

```txt
sb_collection_movies
```

or another existing table that connects:

```txt
collection_id
movie_id
```

## Result

The `sb_collections` table itself is suitable for collection metadata. The next needed check is the collection movie-link table.

## Safety

No SQL was run. No table or row was changed. No RLS policy was changed. No live promotion.
