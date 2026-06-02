# Stream Bandit Checkpoint — Policy Admin Owner Hardening TODO V7.12.195

Date: 2026-06-02

## Status

RECORDED TODO / NO CODE CHANGE MADE.

## Context

The public policy split is now correct:

- Public Policy Centre: read/preview only.
- Public Policy Reader: reads only published rows and exposes no edit/save/publish controls.
- Policy Admin Editor: remains the edit/save/publish/archive route.

Current admin route:

- `policy-admin-documents-v7-12-120-test.html?policy=terms`

## User rule

Before real users arrive, Policy Admin must be owner/admin-only.

Normal users should not be able to edit, save, publish or archive policy documents.

## Current known behaviour

The Policy Admin page has a client-side admin check using the signed-in user and `sb_profiles.role`.

However, hiding links or using a client-side page lock is not enough for final public safety.

## Required future hardening

### 1. Navigation placement

Move Policy Admin into Admin / Owner routes only.

Do not expose Policy Admin from:

- public Policy Centre,
- public Policy Reader,
- public footer links,
- public search results,
- normal user settings pages.

### 2. Role model

Only site owner/admin roles should edit policy documents.

Recommended accepted roles:

- `owner`
- `admin`
- possibly `super_admin` if used later

Avoid letting normal `user`, creator, subscriber or viewer roles write policy rows.

### 3. Supabase/RLS hardening

Final security should be enforced at Supabase Row Level Security / database policy level.

Required write protection for `sb_policy_documents`:

- SELECT published rows: public/anon may read only `status = 'published'`.
- SELECT drafts/archived/admin rows: owner/admin only.
- INSERT policy rows: owner/admin only.
- UPDATE policy rows: owner/admin only.
- DELETE policy rows: owner/admin only, or disabled completely.

### 4. Frontend guard remains useful

Keep the frontend admin check for user experience, but do not rely on it as the only protection.

### 5. Testing before launch

Test with:

- signed-out visitor,
- normal signed-in user,
- creator user,
- admin/owner user.

Expected result:

- public users can read published policies only,
- normal users cannot open usable edit controls,
- normal users cannot write to `sb_policy_documents` even through browser devtools/API calls,
- owner/admin can edit and publish.

## Decision now

No code change was made in this checkpoint.

Reason: the app is still in owner-only testing, and the current Policy Admin publish logic took time to stabilize. Do not disturb it until doing a dedicated admin/security hardening pass.

## Future safe change order

1. Confirm current `sb_profiles.role` values.
2. Confirm Supabase RLS status for `sb_policy_documents`.
3. Add/verify write policies for owner/admin only.
4. Move Policy Admin link into Admin group only.
5. Remove Policy Admin from public search/footer surfaces.
6. Test normal user cannot write.
7. Then record a full Policy Admin owner-only pass.
