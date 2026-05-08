# Stream Bandit — Storage Prep and Backup / Safety Review

Checkpoint name:

`Storage Prep + Backup Safety - Review Decision`

## Storage Prep / Supabase Readiness

Decision: keep as-is for now.

Reason:

Storage Prep is an admin/readiness page, not a normal user-facing page. It already gives a useful status view for:

- stable version,
- movie count,
- data size,
- local-only count,
- URL/HLS stream count,
- pending review count,
- pre-storage readiness,
- missing source checks,
- thumbnail and metadata cleanup,
- storage direction decision.

It is long, but it is functional and understandable as an admin checklist. It does not need public-style tabs now.

Protected:

- export backup action,
- storage prep/readiness action,
- health check link/action,
- local-only/source checks,
- thumbnail/metadata checks,
- Supabase/storage readiness logic.

## Backup / Safety

Decision: keep as-is and treat as already tidied.

Reason:

Backup / Safety already has the newer tidy layout:

- Backup Centre intro card,
- Export / Restore / Safety summary cards,
- clear tabs,
- export backup area,
- restore preview area,
- safety warning flow.

It looks consistent with the current tidy-page direction and should not be rebuilt now.

Protected:

- emergency JSON export,
- show/copy emergency JSON,
- backup file upload,
- pasted backup JSON,
- preview restore,
- restore-after-preview,
- all backup/restore safety checks.

## Current recommendation

No code changes needed for Storage Prep or Backup / Safety.

Continue page tidy checks, but skip admin-only pages that are already functional.

## Current skip / keep list

- My Channel: heavy self-rebuilding control page, tidy on hold.
- Supabase Test: admin diagnostics, keep as-is.
- Live Readiness: admin checklist, keep as-is.
- Supabase Migration: admin import/recovery tool, keep as-is.
- Mux Manager: admin video helper, keep mostly as-is.
- Upload Plan: admin reference guide, keep as-is.
- Local Storage / Legacy Browser Files: admin legacy recovery tool, keep as-is.
- Storage Prep / Supabase Readiness: admin readiness checklist, keep as-is.
- Backup / Safety: already tidy, keep as-is.

## Next recommended page

Move to remaining Admin Tools pages that are visible to users/admin but low-risk:

- Liked
- Submit Video
- Rules
- Review Queue
- Health Check
- Test Checklist

Recommended next target: Liked.
