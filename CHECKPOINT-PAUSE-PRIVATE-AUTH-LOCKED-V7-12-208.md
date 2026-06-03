# Stream Bandit Checkpoint — Pause / Private Auth Locked V7.12.208

Date: 2026-06-03

## Status

SAFE PAUSE POINT.

This checkpoint records the current stopping point before the user steps away.

## Current high-level state

Stream Bandit is still a private prototype/toy platform. The intended current access model is:

- existing known users can sign in,
- existing users can sign out,
- unknown public users should not be able to create accounts from the Profile page,
- dangerous admin/backend actions stay locked or warning-only until the platform is ready.

## Latest important work completed

### User Management trio completed

- User Dashboard: `user-management-dashboard-v7-11-2-test.html`
  - Internal version: V7.12.204
  - Status: PASS
  - Real safe controls: visible `sb_profiles`, `role`, `can_submit`
  - Toy controls: local test-user drafts, invite text, permissions JSON preview

- Pricing Feature Shop: `plans-pricing-feature-shop-v7-11-3-test.html`
  - Internal version: V7.12.203
  - Status: PASS
  - Preserved: 8 plans, 24 add-ons, bundle builder, feature matrix, entitlement planning
  - No billing/checkout connected

- Permissions Matrix: `permissions-matrix-user-management-v7-11-4-test.html`
  - Internal version: V7.12.202
  - Status: PASS
  - Preserved: researched role/plan/feature comparison content
  - No schema/policy writes

### Supabase connection map recorded

- File: `CHECKPOINT-SUPABASE-CONNECTION-MAP-V7-12-205.md`
- Status: recorded

Confirmed real Supabase-backed areas:

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

Confirmed not-yet-real for user entitlements/pricing:

- `plan_key`
- `permissions_json`
- `account_status`
- `managed_notes`
- `invite_state`
- `billing_status`

These remain toy/planning only until schema/RLS is deliberately added.

### Supabase Storage noted

- Bucket: `stream-bandit-images`
- Public: yes
- Policies: 4
- File size limit: 50 MB
- Allowed MIME types:
  - image/png
  - image/jpeg
  - image/webp

Purpose:

- image uploads,
- public image URLs,
- logos/posters/avatars/banners/artwork.

Not a video storage strategy.

### Profile Settings sign-out and auth lock completed

Profile page:

- Route: `profile-settings-live-ready-v7-12-90-test.html`
- Internal version: V7.12.208
- Status: updated

Current Profile behaviour:

- Sign Out button exists,
- magic-link sign-in remains,
- magic links are existing-user-only with `shouldCreateUser: false`,
- public self-signup from Profile page is blocked,
- Load Profile works,
- Save Text works,
- Avatar/Banner editors work,
- own-profile Storage upload remains,
- no Auth Admin creation,
- no real user delete,
- no service-role key,
- no role promotion from Profile.

User tested V7.12.207 before the final signup lock:

- Header appears: PASS
- Footer appears once: PASS
- Saved counters show: PASS
- Signed-in email displays: PASS
- Sign Out visible: PASS
- Load Profile works: PASS
- Save Text works: PASS
- Magic-link sign-in/sign-out worked in private window: PASS
- Avatar editor opens: PASS
- Banner editor opens: PASS
- Debug shows `authAdmin: false` and `realDelete: false`: PASS

V7.12.208 final correction:

- `shouldCreateUser: false` added to Profile Settings magic-link call.
- UI wording changed to existing users only.
- Create button clarified as Create Missing Profile Row, not Create Account.

### Profile Sign-In Bridge locked

Bridge file:

- `stream-bandit-profile-signin-v7-12-156.js`
- Internal version: V7.12.208
- Commit: `2155b02c2bc983180012fabf1a55220d4a7ae4f4`

Important correction:

- old bridge magic-link code also now uses `shouldCreateUser: false`,
- bridge includes a Sign Out button when it injects a panel,
- bridge avoids duplicating native Profile page controls when V7.12.208 Profile is present.

Checkpoint file already recorded:

- `CHECKPOINT-AUTH-ENTRY-LOCKED-EXISTING-USERS-ONLY-V7-12-208.md`
- Commit: `b5a611f015cbfcb07d068a8b0592315350eec4cc`

## Current auth rule

- Existing users can sign in: YES
- Existing users can sign out: YES
- Unknown public users should not be created from Profile: YES
- Profile uses `shouldCreateUser: false`: YES
- Profile Sign-In Bridge uses `shouldCreateUser: false`: YES
- Auth Admin create/delete in frontend: NO
- service-role key in frontend: NO
- role promotion from Profile: NO
- billing: NO

## Safe next step after pause

Recommended next direction after the user returns:

1. Do a quick Profile V7.12.208 smoke test if magic-link quota allows later.
2. Do not use unknown emails unless public signup is deliberately opened.
3. Continue main flow from the safe tools list.

Best next candidate:

- `storage-prep-global-helpers-v7-10-8-test.html`

Reason:

- Supabase Storage is important for image URLs,
- safer than Form Inbox/private messages,
- directly supports profile/channel/movie/page images.

Alternative candidate:

- Form Inbox / Private Messages

But this is more dangerous because `sb_private_messages` and `sb_form_submissions` are real writer/communication tables, so it should be preservation-first and scanned carefully.

## Do not do next without permission

Do not casually edit:

- Form Inbox private-message reply/trash/delete logic,
- Advanced Form save logic,
- Web Builder publish logic,
- Pages Manager,
- Player 2,
- Supabase Library Editor/movie rows,
- profile auth/signup logic,
- RLS policies,
- Supabase schema.

## Pause decision

This is a good pause point.

The front-door auth side quest is locked enough to continue later without worrying that Profile is silently creating public users. Stream Bandit remains private until deliberately opened.
