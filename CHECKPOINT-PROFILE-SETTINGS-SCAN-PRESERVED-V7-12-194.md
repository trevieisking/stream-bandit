# Stream Bandit Checkpoint — Profile Settings Scan Preserved V7.12.194

Date: 2026-06-02

## Status

SCAN STABLE / NO EDIT MADE.

## Page scanned

- `profile-settings-live-ready-v7-12-90-test.html`

## Why this was treated carefully

Profile Settings is high-risk because it owns signed-in profile state, avatar/banner editing and Supabase Storage writes.

A casual rewrite could break:

- profile row loading from `sb_profiles`,
- avatar URL saving,
- banner URL saving,
- Supabase Storage bucket use,
- header/profile sync,
- account identity display.

## Current observed behaviour / responsibility

Profile Settings currently includes:

- Supabase SDK loading,
- profile text editor,
- avatar editor,
- banner editor,
- image upload flow using bucket `stream-bandit-images`,
- profile row reads/writes from `sb_profiles`,
- header/profile sync button,
- menu save count helper,
- global helper/search fallback stack.

## Existing shape note

The page still has old local header/footer markup and older helper scripts. This is not ideal for the final clean-shell shape, but it is not currently a proven breaking issue.

## Decision

No code change was made.

Reason: preserving the working profile/image/account flow is more important than visual refit right now.

## Future safe refit rule

If Profile Settings is refit later, it should be done as a full preservation pass:

- keep Supabase SDK,
- keep profile reads/writes,
- keep Storage bucket uploads,
- keep avatar/banner save semantics,
- keep header/profile sync,
- add current Header Shell + Footer Shell + Theme Projector only after confirming behaviour is preserved.

Do not patch this page casually.

## Safety notes

- No Supabase profile write logic was changed.
- No Storage upload logic was changed.
- No profile fields were changed.
- No header identity logic was changed.
- No theme/global settings logic was changed.
