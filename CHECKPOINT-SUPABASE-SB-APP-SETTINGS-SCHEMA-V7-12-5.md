# Stream Bandit Checkpoint — Supabase sb_app_settings Schema V7.12.5

Date: 2026-05-22

## Purpose

Current `sb_app_settings` table definition reviewed for global app settings, theme storage and shared settings bridge work.

## Current fields

```txt
id text primary key
settings jsonb default {}
updated_at timestamptz default now()
```

## What this supports

This table is simple and suitable for storing global app settings by key.

Recommended pattern:

```txt
id: global
settings: theme, logo, footer, policy links, app flags and other shared settings
updated_at: last changed time
```

## Result

The schema is fine for a global settings bridge. The next important check is the actual row data inside this table, especially any row named `global`, `default`, `settings`, or similar.

## Safety

No SQL was run. No table or row was changed. No live promotion.
