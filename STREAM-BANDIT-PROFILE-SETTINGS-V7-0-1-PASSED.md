# Stream Bandit Profile Settings V7.0.1 Passed

## Passed page

- `profile-settings-functional-v7-0-1-test.html`

Test link:

- `https://trevieisking.github.io/stream-bandit/profile-settings-functional-v7-0-1-test.html`

## Trevor test result

Profile Settings V7.0.1 passed the functional profile text tests.

Confirmed passed:

- Page opens with shared shell/account/search.
- Borrowed style loads.
- Profile loads current `sb_profiles` row.
- Display name/channel bio can be edited.
- `Save profile text` works.
- Refresh works.
- `Load profile` after refresh works.
- Saved text comes back from Supabase.

## Important fix from V7.0.0

V7.0.0 failed because it used `upsert()`, which triggered a possible new row insert and was blocked by row-level security:

- `new row violates row-level security policy for table "sb_profiles"`

V7.0.1 fixed this correctly by using update-only against the existing authenticated profile row:

- `update(...).eq('id', currentUser.id)`

No insert. No upsert. Existing `sb_profiles` row only.

## Image status

Avatar/banner upload test:

- Image upload works.
- Uploaded image previews correctly.
- Image does not stay after refresh yet.

Reason:

- Exact `sb_profiles` avatar/banner column names have not been confirmed yet.
- Do not guess profile image columns.

Next image step:

- Open Supabase `sb_profiles` table.
- Click `Definition`.
- Confirm whether columns exist for avatar/banner, for example `avatar_url`, `banner_url`, `profile_image_url`, or similar.
- Only after exact column names are confirmed should V7.0.2 save uploaded image URLs permanently.

## Decision

Profile Settings text save/load is passed.

Do not rebuild this page.

Next upgrade candidate:

- V7.0.2 only if image column names are confirmed.
- Otherwise continue to Settings global save/load page next.
