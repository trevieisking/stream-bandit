# Stream Bandit Checkpoint — Supabase Storage and Auth Safety V7.12.206

Date: 2026-06-03

## Status

SAFETY CHECKPOINT / NO CODE CHANGES.

This checkpoint records the current Supabase Storage purpose and the safety rule before any sign-up/sign-in/sign-out testing.

## Supabase Storage note

Current Storage bucket shown by user screenshot:

- Bucket: `stream-bandit-images`
- Visibility: public
- Policies: 4
- File size limit: 50 MB
- Allowed MIME types:
  - `image/png`
  - `image/jpeg`
  - `image/webp`

Primary current purpose:

- image uploads,
- creating public image URLs,
- logo/poster/avatar/banner/artwork storage,
- supporting Stream Bandit image fields across profiles, channels, movies, branding and builder pages.

Important interpretation:

- This bucket is for images and public URL generation.
- It is not a video storage strategy.
- Videos remain URL/Mux/HLS planned separately.

## Current Supabase-backed app areas

Confirmed currently real/active Supabase-backed areas include:

- `sb_profiles`
- `sb_app_settings`
- `sb_private_messages`
- `sb_form_submissions`
- `sb_movies`
- `sb_channels`
- `sb_playlists`
- `sb_playlist_movies`
- `sb_collections`
- `sb_collection_movies`
- `sb_policy_documents`
- `sb_site_pages`
- `sb_watchlist`
- `sb_favourites`
- `sb_likes`
- `sb_watch_progress`
- `sb_submissions`

## Auth safety rule before spare-user testing

Do not sign out of the main admin browser session during testing unless deliberately planned.

Safer spare-user test method:

1. Keep the main/admin browser signed in.
2. Open a private/incognito window or a different browser.
3. Use the spare email there only.
4. Sign up/sign in/sign out with the spare account in that separate context.
5. Return to the main/admin browser.
6. Open User Management Dashboard.
7. Click Load Users.
8. Check whether the spare profile appears.

## Why this matters

The current admin profile is the known working owner/admin account:

- `id`: `af380be8-d1e2-4154-a5ed-a113c8271afd`
- `username`: `admin`
- `role`: `admin`
- `can_submit`: `true`

Accidentally signing out of the only active admin session can slow testing or create confusion, especially while User Management/RLS/Auth flows are being checked.

## User Management current safe state

Current User Management page:

- Route: `user-management-dashboard-v7-11-2-test.html`
- Internal page state: V7.12.204
- Status: PASS

Safe real controls:

- load visible `sb_profiles` rows,
- select visible profile,
- read `role`,
- read/update `can_submit` if RLS allows,
- preserve safe current controls.

Toy/planning controls:

- local test-user drafts,
- invite text copy,
- simulated local remove,
- future `permissions_json` preview,
- plan/feature direction.

Dangerous backend actions are still locked:

- no real Auth Admin user creation,
- no real Auth user delete,
- no service-role secrets in frontend,
- no billing,
- no schema changes,
- no RLS/policy changes.

## Do not connect yet without a plan

Do not connect these toy fields to Supabase writes until schema/RLS is deliberately planned:

- `plan_key`
- `permissions_json`
- `account_status`
- `managed_notes`
- `invite_state`
- `billing_status`

## Next safe action

Before any real spare-user test:

- confirm admin browser is still signed in,
- use a private window or separate browser for spare email,
- do not change Supabase Auth settings mid-test,
- do not change Storage policies mid-test,
- do not change RLS policies mid-test unless a specific rollback plan exists.

## Decision

Pause point is safe.

Next recommended action is spare-user testing in a separate browser/private window, not from the current admin session.
