# Stream Bandit Checkpoint — Supabase Connection Map V7.12.205

Date: 2026-06-03

## Status

MAPPED FROM USER SUPABASE DUMP / NO DATABASE CHANGES MADE.

This checkpoint records what is already real in Supabase versus what is currently a safe frontend toy/planning flow.

## Supabase tables visible from screenshot

The current public schema includes:

- `sb_app_settings`
- `sb_channels`
- `sb_collection_movies`
- `sb_collections`
- `sb_favourites`
- `sb_form_submissions`
- `sb_import_batches`
- `sb_likes`
- `sb_movies`
- `sb_playlist_movies`
- `sb_playlists`
- `sb_policy_documents`
- `sb_private_messages`
- `sb_profiles`
- `sb_site_pages`
- `sb_submissions`
- `sb_watch_progress`
- `sb_watchlist`

## Confirmed real User Management table: `sb_profiles`

User supplied current row shape:

- `id`
- `username`
- `display_name`
- `channel_name`
- `channel_about`
- `avatar_url`
- `banner_url`
- `role`
- `can_submit`
- `created_at`
- `updated_at`

Confirmed current admin profile:

- `id`: `af380be8-d1e2-4154-a5ed-a113c8271afd`
- `username`: `admin`
- `display_name`: `Stream Bandit Admin main`
- `role`: `admin`
- `can_submit`: `true`

## User Dashboard connection result

Current User Dashboard V7.12.204 is correctly connected/planned around the current real fields:

### Real now

- load visible `sb_profiles` rows through RLS
- select visible profile
- read `role`
- read/write `can_submit` if Supabase RLS allows
- read/update supported profile fields only when deliberately added later

### Toy/planning only for now

The following fields are NOT confirmed in `sb_profiles` yet:

- `plan_key`
- `permissions_json`
- `account_status`
- `managed_notes`
- `invite_state`
- `billing_status`

Therefore User Dashboard must keep these as functional toy/previews until schema is deliberately added.

## Confirmed real app settings table: `sb_app_settings`

User supplied current row shape:

- `id`
- `settings`
- `updated_at`

Confirmed `id`:

- `stream_bandit`

Confirmed settings JSON contains current global app/theme data, including:

- app name / logo / tagline
- Theme Studio data
- `builderStyle`
- `streamBanditTheme`
- `web_builder_style`
- home visibility controls
- player settings
- current theme owner: `web-builder-theme-studio-controls-v7-8-9-test.html`

Connection meaning:

- Theme/global display is already properly Supabase-backed.
- User Dashboard should not write app settings.
- Pricing/Permissions should not write app settings.

## Confirmed real private messages table: `sb_private_messages`

User supplied current row shape includes:

- `id`
- `thread_id`
- `parent_message_id`
- `form_submission_id`
- `page_slug`
- `sender_id`
- `sender_email`
- `sender_name`
- `recipient_id`
- `recipient_email`
- `recipient_name`
- `subject`
- `body`
- `kind`
- `status`
- `sent_at`
- `read_at`
- trash/delete/spam timestamps
- `meta`
- `created_at`
- `updated_at`

Confirmed statuses/kinds from dump:

- `message`
- `form_reply`
- `reply`
- `sent`
- `trashed`

Connection meaning:

- Form Inbox/private messaging is real and Supabase-backed.
- This is a dangerous writer/communication page and remains preservation-first.
- It should not be casually refit without preserving thread/reply/trash/delete logic.

## Confirmed real form submissions table: `sb_form_submissions`

User supplied current row shape includes:

- `id`
- `page_slug`
- `form_title`
- `form_key`
- `block_id`
- `block_title`
- `answers_json`
- `submitter_id`
- `submitter_email`
- `status`
- `created_at`

Confirmed status:

- `read`

Connection meaning:

- Advanced Form and Form Inbox are already real Supabase flows.
- They should remain preservation-first.
- Future polish should keep answers_json, status, replies and private-message links intact.

## Confirmed real media/platform tables

From earlier passes and visible table list:

- `sb_movies`
- `sb_channels`
- `sb_playlists`
- `sb_playlist_movies`
- `sb_collections`
- `sb_collection_movies`
- `sb_submissions`
- `sb_watchlist`
- `sb_favourites`
- `sb_likes`
- `sb_watch_progress`

Connection meaning:

- Media/library/group-play features are already largely Supabase-backed.
- Player 2, Collections, Channels and Playlists should be treated as real data pages, not toys.

## What appears missing for Pricing / Permissions / User Entitlements

No dedicated tables/columns were confirmed for:

- pricing plans
- feature add-ons
- subscriptions
- entitlements
- billing status
- account status
- permissions JSON
- invite drafts
- admin audit log
- user plan assignment

Therefore the User Management trio should currently be interpreted like this:

### Pricing Feature Shop

- Real as a researched pricing simulator.
- Not real billing.
- No checkout.
- No Stripe.
- No Supabase entitlement writes.

### Permissions Matrix

- Real as a researched rule map.
- Not yet a dynamic Supabase permission source.
- Does not enforce access yet.

### User Dashboard

- Real for current `sb_profiles.role` and `sb_profiles.can_submit` visibility/control if RLS permits.
- Toy for plan, permissions_json, invites and local test-user drafts.

## Recommended future schema plan

When ready, add deliberately and with rollback:

### Option A — Expand `sb_profiles`

Add columns:

- `plan_key text`
- `account_status text default 'active'`
- `permissions_json jsonb default '{}'::jsonb`
- `managed_notes text`

Pros:

- simple
- fast to wire into User Dashboard

Risk:

- profile self-update policies must be hardened first, or users may alter their own plan/permissions.

### Option B — Dedicated entitlement tables

Add tables such as:

- `sb_user_entitlements`
- `sb_user_invites`
- `sb_admin_audit_log`
- `sb_feature_catalog`
- `sb_plan_catalog`

Pros:

- cleaner long-term architecture
- better auditability
- safer separation of profile and billing/permission data

Risk:

- more SQL/RLS work before frontend connection.

## Recommended next build direction

Do not connect Pricing/Permissions to real Supabase writes yet.

Next safe app direction:

1. Keep User Dashboard V7.12.204 as current functional toy + real `role/can_submit` controls.
2. Use spare email testing through normal Supabase Auth/signup.
3. After spare profile exists, test whether admin can see and control that profile via User Dashboard.
4. If RLS blocks visibility/control, fix RLS deliberately.
5. Only after this works, plan entitlements schema.

## Important safety rule

Frontend must not contain service-role keys.

Real actions that need backend/Edge Function later:

- create Auth user by email
- invite Auth user as admin
- delete Auth user
- Stripe checkout session
- Stripe webhook entitlement write
- owner-only role/plan elevation
- audit-logged admin changes

## Current User Management trio status

- User Dashboard V7.12.204 — PASS
- Pricing Feature Shop V7.12.203 — PASS
- Permissions Matrix V7.12.202 — PASS

## Decision

The app has enough Supabase foundation to continue. The next correct move is not random schema creation. The next correct move is spare-account testing against current `sb_profiles`, then a small, deliberate RLS/schema plan for entitlements.
