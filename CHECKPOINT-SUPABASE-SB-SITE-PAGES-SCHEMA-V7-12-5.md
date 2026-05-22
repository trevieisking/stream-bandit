# Stream Bandit Checkpoint — Supabase sb_site_pages Schema V7.12.5

Date: 2026-05-22

## Purpose

Trevor supplied the current `sb_site_pages` table definition so Web Builder, policy pages, footer previews and custom page storage can be planned safely against the real Supabase schema.

## Current sb_site_pages fields

```txt
id uuid default gen_random_uuid()
slug text not null unique
title text not null
page_type text default 'custom'
status text default 'draft'
layout_json jsonb default []
settings_json jsonb default {}
owner_id uuid
created_at timestamptz default now()
updated_at timestamptz default now()
```

## What this table supports now

The table already supports a good Web Builder / custom page foundation:

- unique public page slug
- page title
- page type/category
- draft/published-style status
- JSON layout/block storage
- JSON settings storage
- optional owner/user link
- created/updated timestamps

## How it should be used

Recommended use:

```txt
slug          -> stable page URL/key such as terms, privacy, about, creator-rules
title         -> display title
page_type     -> custom, policy, landing, about, contact, etc.
status        -> draft / published / hidden if app logic supports it
layout_json   -> Web Builder blocks/content
settings_json -> page-level settings such as footer visibility, SEO, cookie/banner notes
owner_id      -> optional creator/admin owner
```

## Policy/footer interpretation

This table can store editable policy/document/page content later, but the current static preview pages are still useful as read-only public previews.

Current rule remains:

- Policy Centre owns wording.
- Preview pages show read-only versions.
- Global footer should link to previews or final public pages.
- Control Tower should track routes only.

## Possible future improvements, not needed now

Later, if policy/document editing needs more structure, consider optional fields such as:

```txt
published_at timestamptz
version_label text
last_reviewed_at timestamptz
review_notes text
legal_status text
```

But no schema change is needed just to keep Web Builder/custom page storage working.

## Safety

No SQL was run.
No table was changed.
No rows were edited.
No RLS policies were changed.
No live/index promotion from this checkpoint.
