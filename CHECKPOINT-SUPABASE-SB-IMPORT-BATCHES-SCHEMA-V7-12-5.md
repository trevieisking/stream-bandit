# Stream Bandit Checkpoint — Supabase sb_import_batches Schema V7.12.5

Date: 2026-05-22

## Purpose

Current `sb_import_batches` table definition reviewed for backup imports, migration records and restore history.

## Current fields

```txt
id uuid default gen_random_uuid()
source_version text
backup_json jsonb
imported_by uuid references sb_profiles(id) on delete set null
created_at timestamptz default now()
```

## What this supports

This table supports:

- storing imported backup JSON
- recording the source app/version of the backup
- linking the import to an admin/profile when available
- keeping a created date for migration/import history

## How it fits Stream Bandit

Recommended use:

```txt
source_version -> app/build version the backup came from
backup_json    -> full backup/import payload
imported_by    -> profile that ran the import
created_at     -> when the import was recorded
```

## Result

No schema change is needed now for basic backup/import history.

## Possible future improvement, not needed now

Later, if import tools become more advanced, consider optional fields such as:

```txt
status
summary_json
error_message
imported_counts_json
```

For now the table is enough for storing batch backups and migration evidence.

## Safety

No SQL was run. No table or row was changed. No RLS policy was changed. No live promotion.
