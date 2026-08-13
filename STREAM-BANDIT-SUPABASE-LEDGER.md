# Stream Bandit Supabase Ledger

**Status:** CURRENT BACKEND TRUTH LEDGER  
**Ledger version:** V1  
**Verified:** 2026-08-13  
**Supabase project:** Stream Bandit  
**Project ref:** `xzxqfrvqdgkzwujbkdbk`  
**Region:** `eu-west-2`

## Purpose

This ledger is the human-readable source of truth for Stream Bandit's deployed Supabase objects. It exists so route repairs, access work, Social Media, Web Builder and scanner work do not rely on memory or mistake code tokens for live database objects.

This file records names and architecture only. It must never contain secret values, service-role values, private keys, access tokens or `.env` contents.

## Governing rules

1. Treat this ledger as the backend inventory referenced by the Stream Bandit Master Plan.
2. Any change that creates, removes, renames or materially repurposes a Stream Bandit table, RPC/function, storage bucket or authority field must update this ledger in the same reviewed change.
3. The SB Table Route Scanner must be reconciled with this ledger whenever its Supabase truth snapshot changes.
4. A source token beginning with `sb_` is **not automatically a table**. Classify it as a deployed table, deployed RPC/function, storage/config reference, code/local marker, planned object or unresolved reference.
5. Do not create speculative `sb_builder_*` tables merely because old planning or route-map source mentions them.
6. Code Labs objects (`code_labs_*` tables/functions and Code Labs storage) are outside this Stream Bandit ledger.
7. Do not delete a ledger entry just because a route stops using it. Move retired objects through an explicit lifecycle such as ACTIVE -> UNUSED/CANDIDATE -> RETIRED -> REMOVED.

## Deployed Stream Bandit tables

At the 2026-08-13 verification point there are **35 deployed public `sb_` base tables**. Supabase reported Row Level Security enabled on all 35.

### Account, configuration and audit

- `sb_profiles`
- `sb_app_settings`
- `sb_admin_audit_log`
- `sb_account_deletion_requests`

### Watch, library and media

- `sb_channels`
- `sb_movies`
- `sb_genres`
- `sb_collections`
- `sb_collection_movies`
- `sb_playlists`
- `sb_playlist_movies`
- `sb_watchlist`
- `sb_watch_progress`
- `sb_favourites`
- `sb_likes`

### Creator and import

- `sb_submissions`
- `sb_import_batches`

### Web Builder current persistence

- `sb_site_pages`
- `sb_form_submissions`

### Policy

- `sb_policy_documents`

### Messaging, friends and profile relationships

- `sb_private_messages`
- `sb_user_friends`
- `sb_user_blocks`
- `sb_user_family_relationships`
- `sb_profile_social_settings`

### Social Media

- `sb_social_groups`
- `sb_social_group_members`
- `sb_social_posts`
- `sb_social_post_media`
- `sb_social_post_comments`
- `sb_social_post_reactions`
- `sb_social_events`
- `sb_social_event_rsvps`
- `sb_social_notifications`
- `sb_profile_gallery_items`

## Deployed Stream Bandit RPCs / database functions

At the 2026-08-13 verification point there are **37 public functions whose names begin with `sb_`**.

### Owner, admin and account authority

- `sb_admin_hide_movie`
- `sb_admin_update_movie`
- `sb_is_admin`
- `sb_is_admin_or_owner`
- `sb_is_admin_owner`
- `sb_is_owner`
- `sb_owner_manage_profile`
- `sb_owner_set_account_deletion_status`
- `sb_profiles_protect_admin_fields`
- `sb_request_account_deletion`
- `sb_touch_account_deletion_request`

Authority-sensitive signatures verified at this checkpoint:

- `sb_owner_manage_profile(target_user_id uuid, p_role text, p_can_submit boolean, p_account_status text, p_admin_level text, p_plan_key text, p_permissions_json jsonb, p_admin_notes text, p_reason text)`
- `sb_owner_set_account_deletion_status(p_request_id uuid, p_status text, p_owner_note text)`
- `sb_request_account_deletion(p_reason text, p_email text, p_payload jsonb)`

### Group Play

- `sb_can_group_play_write`
- `sb_group_play_flag`
- `sb_group_play_limit`
- `sb_group_play_set_movie_channel`

### Messaging, family and relationship support

- `sb_can_send_private_message`
- `sb_family_are_friends`
- `sb_family_is_admin`
- `sb_private_messages_touch_updated_at`
- `sb_user_family_relationships_guard`
- `sb_user_friends_touch_updated_at`

### Profile Gallery

- `sb_profile_gallery_can_view`

### Shared utility / timestamp support

- `sb_set_updated_at`
- `sb_slugify`
- `sb_touch_updated_at`

### Social Media

- `sb_social_are_friends`
- `sb_social_can_insert_post`
- `sb_social_can_manage_group`
- `sb_social_can_view_group`
- `sb_social_can_view_post`
- `sb_social_group_owner_member`
- `sb_social_group_role`
- `sb_social_has_block`
- `sb_social_remove_own_event`
- `sb_social_remove_own_group`
- `sb_social_remove_own_post`
- `sb_social_update_own_post`

## Stream Bandit storage buckets

- `stream-bandit-images` — **PUBLIC** — Stream Bandit image storage.
- `stream-bandit-profile-gallery` — **PRIVATE** — profile-owned gallery files; access must continue through the intended authenticated/visibility policy path.

The private `code-labs-owner-gallery` bucket is a Code Labs object and is deliberately excluded from Stream Bandit ownership.

## Web Builder schema boundary

The deployed Stream Bandit schema currently uses `sb_site_pages` and `sb_form_submissions` for the established Builder persistence visible in the verified backend inventory.

Names such as the following have appeared in planning or source maps but **were not deployed public base tables at this verification point**:

- `sb_builder_accounts`
- `sb_builder_assets`
- `sb_builder_audit_log`
- `sb_builder_deploys`
- `sb_builder_domains`
- `sb_builder_pages`
- `sb_builder_revisions`
- `sb_builder_sites`
- `sb_builder_themes`

**Status for the `sb_builder_*` family: PLANNED / NOT DEPLOYED.** Do not create or depend on these tables until the existing Web Builder is fully mapped and an actual schema requirement is reviewed.

## Scanner classification boundary

The V7.12.300 SB Table Route Scanner has a stale embedded table list and can report real RPCs, configuration identifiers, version markers and newer deployed tables as unknown tables.

The next scanner truth upgrade must classify references conservatively as:

- `TABLE`
- `RPC`
- `STORAGE/CONFIG`
- `LOCAL/CODE`
- `PLANNED/NOT DEPLOYED`
- `UNKNOWN/UNRESOLVED`

Examples of values that must not be assumed to be tables merely because they start with `sb_` include publishable/config identifiers, route/version markers and function names such as `sb_group_play_set_movie_channel` and `sb_owner_manage_profile`.

## Current scanner reconciliation

- `SB Table Route Scanner V7.12.300` — **STALE SUPABASE TABLE SNAPSHOT** — embedded known-table list contains 21 tables and predates the newer account, Social Media and Profile Gallery tables.
- Target next scanner version — **V7.12.301** — refresh the deployed table truth and improve object-type classification while preserving the existing read-only route scanning boundary.

## Master Plan integration

This ledger supports, but does not replace, the agreed Stream Bandit finishing programme:

1. Supabase truth + scanner reconciliation.
2. Auth / Locks / User Management contract repair.
3. Main App CSS synchronization, with Player 1 and Player 2 explicitly exempt from common page-layout CSS.
4. Social Media upgrade, preserving completed Profile Gallery work and adding the bounded Social Live plan.
5. Full Web Builder upgrade and every-block/input/save/reopen audit.
6. Remaining terrain tidy and full pre-launch smoke.
7. Public Signup second-last.
8. Payments and real paid entitlement activation last.

## Change log

### V1 — 2026-08-13

- Established the first recorded Stream Bandit Supabase inventory.
- Recorded 35 deployed `sb_` tables.
- Recorded 37 deployed public `sb_` functions/RPCs.
- Recorded the two Stream Bandit storage buckets and their public/private boundary.
- Marked the speculative `sb_builder_*` family as planned/not deployed.
- Recorded V7.12.300 scanner truth drift and the V7.12.301 upgrade target.
