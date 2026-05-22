# Stream Bandit Checkpoint — Supabase sb_channels Schema V7.12.5

Date: 2026-05-22

## Purpose

Current `sb_channels` table definition reviewed for Stream Bandit channels, creator profiles, official channels and movie ownership links.

## Current fields

```txt
id uuid default gen_random_uuid()
name text not null
description text
owner_id uuid references sb_profiles(id) on delete set null
image_url text
is_official boolean default false
created_at timestamptz default now()
updated_at timestamptz default now()
avatar_url text
```

## What this supports

This table already supports:

- public channel name
- channel description
- link to an owner profile
- official Stream Bandit channels
- channel image/banner style URL through image_url
- channel avatar/logo through avatar_url
- timestamps and automatic updated_at trigger

## How it connects to movies

The `sb_movies` table has:

```txt
channel_id references sb_channels(id) on delete set null
owner_id references sb_profiles(id) on delete set null
```

That means movies can belong to a channel and/or a profile owner.

## Recommended use

```txt
name        -> channel display name
description -> channel/about text
owner_id    -> profile that owns/manages the channel
image_url   -> banner/large image
avatar_url  -> small channel avatar/logo
is_official -> true for official Stream Bandit/Chatterfriends channels
```

## Result

No schema change is needed now. The table is suitable for My Channel, Channels page, official channels and movie grouping.

## Possible future improvements, not needed now

Later, if the channel system becomes more advanced, consider optional fields such as:

```txt
slug text unique
status text
visibility text
subscriber_count numeric
channel_theme jsonb
```

But no change is required for current Stream Bandit work.

## Safety

No SQL was run. No table or row was changed. No RLS policy was changed. No live promotion.
