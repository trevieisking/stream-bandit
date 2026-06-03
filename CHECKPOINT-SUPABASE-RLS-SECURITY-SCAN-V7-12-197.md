# Stream Bandit Checkpoint — Supabase RLS Security Scan V7.12.197

Date: 2026-06-03

## Status

SCAN COMPLETE / NO DATABASE CHANGES MADE.

The public policy documents stay published for testing only. Legal wording is not final.

## Why this scan matters

The V7.12.196 route/shell preservation pass fixed the frontend route map, index and manifest. The next hidden layer is Supabase security and saved content flow.

This scan checked whether the important public tables have RLS enabled and what policies are currently active.

## Tables checked

- `sb_channels`
- `sb_form_submissions`
- `sb_movies`
- `sb_playlist_movies`
- `sb_playlists`
- `sb_policy_documents`
- `sb_private_messages`
- `sb_profiles`
- `sb_site_pages`
- `sb_submissions`

## RLS enabled result

RLS is enabled on all checked tables.

This is good. It means Supabase is capable of enforcing access rules at the database level.

## Policy summary

### `sb_policy_documents`

Current shape is correct for testing:

- Public/anon/authenticated can read rows where `status = 'published'`.
- Admin can read all rows.
- Admin can insert.
- Admin can update.
- Admin can delete.

Policy documents currently remain published for testing only.

Future public-launch rule:

- Replace draft/test policy wording with final wording before launch, or unpublish any not-ready policies.
- Consider whether delete should remain admin allowed or be removed in favour of archive-only.

### `sb_movies`

Current shape is good:

- Public can read only `status = 'published'`.
- Admin can manage all movies.

This matches the current app rule:

- Published movies show.
- Hidden movies do not show.

### `sb_channels`

Current shape:

- Public can read channels.
- Admin can manage channels.

This is acceptable for current public browsing.

Future rule if user channels become editable:

- Add owner-based write policies only when channel ownership tools are ready.

### `sb_playlists`

Current shape:

- Public can read public playlists.
- Owners can read/manage own playlists.
- Admin can read/manage all playlists.

This fits the current user-playlist direction.

### `sb_playlist_movies`

Current shape:

- Public can read playlist movies for public playlists.
- Owners can manage movies for their own playlists.
- Admin can manage all playlist movies.

This fits the current playlist/player-2 flow.

### `sb_submissions`

Current shape:

- Users can create submissions where `submitter_id = auth.uid()`.
- Users can read their own submissions.
- Admin can manage submissions.

This fits Submit Video + Review Queue.

### `sb_form_submissions`

Current shape:

- Authenticated users can insert own/null submissions.
- Authenticated users can read own submissions.
- Admin can read/update/delete all.

This is mostly safe, but anonymous form submissions may not be possible through RLS if the visitor is signed out. Current frontend behaviour should be tested later.

### `sb_private_messages`

Current shape:

- Sender can insert.
- Participants or matching email can select/update.
- Admin can select/update.

This supports Form Inbox/private-message flows.

Future caution:

- Confirm update permissions do not allow normal participants to alter fields they should not alter, such as admin status/labels, if those fields exist.

### `sb_profiles`

Current shape:

- User can read own profile; admin can read profiles.
- User can update own profile.

Important risk:

- The policy allows a user to update their own row. If the table exposes privileged columns like `role` and `can_submit`, a normal user might be able to self-change those columns unless frontend blocks it and/or database column restrictions/triggers prevent it.

This is a key pre-launch hardening item.

Recommended future fix:

- Normal users should be allowed to update safe profile fields only, such as display name, avatar, banner, about text.
- Normal users should not be able to update `role`, `can_submit`, or any future billing/permission fields.
- Admin/owner should manage role/permission fields.

### `sb_site_pages`

Current shape:

- Authenticated users can read all site pages.
- Authenticated users can insert/update/delete if `auth.uid() = owner_id` OR `owner_id IS NULL`.

Important risk:

- `owner_id IS NULL` makes null-owner rows manageable by any authenticated user. If public/platform pages ever have null owner IDs, any signed-in user may be able to modify/delete them.

Current dumped rows show important pages have owner_id set to the admin ID, which is good.

Recommended future fix:

- Avoid null-owner rows for protected/platform pages.
- Remove or narrow the `owner_id IS NULL` write allowance before real users arrive.
- Admin/owner should manage platform pages.
- Normal users should only manage their own pages if that feature is intentionally unlocked.

## Highest-priority hardening findings

### 1. `sb_profiles` self-update risk

Risk: normal users may be able to update their own `role` or `can_submit` fields if not restricted elsewhere.

Action later:

- Add protected update method or column-protection strategy.
- Keep normal profile editing safe.
- Keep role/permission editing admin-only.

### 2. `sb_site_pages` null-owner write risk

Risk: any authenticated user can manage pages where `owner_id IS NULL`.

Action later:

- Make sure protected rows always have owner_id set.
- Remove generic null-owner write access or reserve it for admin only.

### 3. Policy docs are published but draft wording

Risk: public users can read published policy text, but current content is testing/draft wording.

Decision now:

- Keep published for testing only.
- Mark as not launch-ready until final legal wording is added.

## Saved-content route flow finding

The user-supplied `sb_site_pages` dump shows stale old routes stored inside `layout_json` and `settings_json`, including examples like:

- `home-watch-shell-v6-32-test.html`
- `channels-image-column-fix-v6-94-2-test.html`
- `library-browse-shell-v6-41-test.html`
- `web-builder-shared-style-preview-v7-9-2-test.html`
- `web-builder-pages-manager-v7-12-108-test.html`
- `settings-studio-custom-templates-v7-4-3-test.html`
- `web-builder-form-save-v7-6-5-test.html`
- `web-builder-shared-style-block-v7-9-0-test.html`

This confirms that route flow is not only a GitHub/static-page issue. Some old route links live inside Supabase saved builder content.

Future safe pass:

- Create a saved-content route normalisation plan.
- Start with `slug = 'test-page'` only.
- Update obvious route strings in that row only.
- Test Web Builder, Published Preview, Advanced Form and Form Inbox after the change.

## What not to do now

- Do not rewrite Web Builder.
- Do not rewrite Pages Manager.
- Do not rewrite Form Inbox.
- Do not broadly update all Supabase JSON rows at once.
- Do not unpublish policies yet; they remain published for testing only.
- Do not change RLS live without a dedicated SQL review and rollback plan.

## Recommended next pass

Next build pass should be one of these two controlled choices:

### Option A — Safe frontend flow refit

Refit a read-only page to the current flow pattern:

- `stream-bandit-one-machine-v7-12-73-test.html`

Target:

- Header Shell
- Page Content
- Footer Shell
- Theme Projector
- Current manifest/index route truth
- No writes
- No Supabase changes

### Option B — Saved-content route normalisation plan

Create a plan and SQL preview for `sb_site_pages` route cleanup.

Start with `test-page` only and no live update until reviewed.

## Decision

No database changes were made in this scan.

This is now the key direction after V7.12.196: keep the shell flow work going on safe pages, while preparing proper Supabase/RLS hardening before real users arrive.
