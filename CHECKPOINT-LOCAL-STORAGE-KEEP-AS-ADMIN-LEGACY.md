# Stream Bandit — Local Storage / Legacy Browser Files Keep As-Is

Checkpoint name:

`Local Storage - Keep As Admin Legacy Tool`

## Decision

Do not tidy or rebuild the Storage / Legacy Browser Files page for now.

## Reason

This is an admin/legacy recovery page, not a normal user-facing page.

It exists because older Stream Bandit versions used browser/local data and browser-only video files before Supabase became the main source of truth.

## What this page is for

The page helps the admin check and manage old browser/local files:

- confirms Supabase Library is default active,
- shows browser/local fallback status,
- shows browser JSON size,
- links to Supabase Test, Settings, Library, Local Storage Tools and Backup/Safety,
- checks legacy browser video file health,
- can scan browser-only video files,
- can delete orphan browser files,
- can open admin movie tools.

## Current page condition

The page is already clear enough for an admin-only legacy tool.

It does not need public-style tabs now.

## Recommendation

Keep as-is.

Only return to this page later if the browser/local legacy tools need a proper cleanup or if local file relinking becomes a real workflow again.

## Protected areas

Do not change lightly:

- local/browser file scanning,
- orphan file deletion,
- browser JSON backup handling,
- Supabase fallback settings,
- admin movie tools link,
- database logic,
- player logic,
- Sound Booster,
- movie rows.

## Current page-tidy skip list

Skipped because admin/private/legacy or heavy rebuild:

- My Channel — heavy self-rebuilding control page, on hold
- Supabase Test — admin diagnostics, keep as-is
- Live Readiness — admin checklist, keep as-is
- Supabase Migration — admin import/recovery tool, keep as-is
- Mux Manager — admin video helper, keep mostly as-is
- Upload Plan — admin reference guide, keep as-is
- Local Storage / Legacy Browser Files — admin legacy recovery tool, keep as-is

## Next recommended page

Continue page tidy checks on safer pages.

Recommended next target:

`Storage Prep` or `Backup / Safety`.
