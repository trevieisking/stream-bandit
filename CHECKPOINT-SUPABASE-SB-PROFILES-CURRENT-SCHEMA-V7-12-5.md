# Stream Bandit Checkpoint — Supabase sb_profiles Current Schema V7.12.5

Date: 2026-05-22

## Purpose

Trevor supplied the current visible `sb_profiles` row so the project can safely plan future User Management, permissions, profile/avatar and global account testing without guessing the table shape.

## Current visible sb_profiles columns from row export

```txt
id
username
display_name
channel_name
channel_about
avatar_url
banner_url
role
can_submit
created_at
updated_at
```

## Current working account profile state

The visible profile row is the Stream Bandit admin profile.

Observed working values include:

```txt
username: admin
display_name: Stream Bandit Admin
channel_name: Stream Bandit Channel Main
role: admin
can_submit: true
avatar_url: Supabase Storage public URL present
banner_url: Supabase Storage public URL present
```

## Important schema limitation

The current `sb_profiles` row does not show newer user-management fields yet, such as:

```txt
plan
status
feature_flags / entitlements JSON
billing_state
account_notes
managed_by
last_reviewed_at
```

This matches the earlier User Management dashboard finding: current live controls are mainly `role` and `can_submit`.

## Safe interpretation

Current safe User Management actions can only rely on:

- role
- can_submit
- profile display/channel fields
- avatar/banner URLs

Future plan/pricing/feature entitlement work requires a schema upgrade later.

## No changes made

No SQL was run.
No rows were edited.
No RLS policies were changed.
No user permissions were changed.
No live/index promotion from this checkpoint.
