# Stream Bandit Checkpoint — Supabase sb_submissions Schema V7.12.5

Date: 2026-05-22

## Purpose

Current `sb_submissions` table definition reviewed for Submit Video, Review Queue, creator submissions and admin moderation flow.

## Current fields

```txt
id uuid default gen_random_uuid()
submitter_id uuid references sb_profiles(id) on delete set null
channel_name text
title text not null
description text
video_url text
thumbnail_url text
trailer_url text
age_rating text
kids_suitable boolean default false
genres text[] default {}
reason text
status text default pending
decline_reason text
reviewed_by uuid references sb_profiles(id) on delete set null
reviewed_at timestamptz
created_at timestamptz default now()
updated_at timestamptz default now()
```

## Current allowed status values

```txt
pending
approved
declined
```

## What this supports

This table already supports:

- creator/video submissions
- submitted video URL storage
- thumbnail/poster URL storage
- trailer URL storage
- age rating and kids suitable flag
- genre list
- submitter profile link
- reviewer/admin profile link
- decline reason
- pending/approved/declined workflow
- Review Queue sorting/filtering by status
- automatic updated_at trigger

## How it fits Stream Bandit

Recommended use:

```txt
submitter_id   -> profile/user who submitted
channel_name   -> submitted channel name or display channel request
title          -> submitted movie/video title
video_url      -> Maestro/Mux/HLS/public playable URL
thumbnail_url  -> Supabase Storage image or Mux thumbnail
trailer_url    -> optional trailer link
kids_suitable  -> family/watch safety flag
genres         -> submitted genre list
reason         -> creator/user reason or notes
status         -> pending, approved, declined
decline_reason -> admin reason when declined
reviewed_by    -> admin/profile that reviewed
reviewed_at    -> review timestamp
```

## Result

No schema change is needed now. The table is suitable for the Submit Video and Review Queue workflow.

## Possible future improvements, not needed now

Later, if submissions become more advanced, consider optional fields such as:

```txt
source_type text
channel_id uuid
approved_movie_id uuid
admin_notes text
submission_type text
policy_confirmed boolean
rights_confirmed boolean
```

For now, do not change schema unless the Review Queue or Submit Video pages clearly need it.

## Safety

No SQL was run. No table or row was changed. No RLS policy was changed. No live promotion.
