# Stream Bandit — Live Test Checklist Admin Smoke Test Keep

Checkpoint name:

`Live Test Checklist - Admin Smoke Test Keep`

## Decision

Keep the Live Test Checklist page as-is for now.

## Reason

This page is mainly for the owner/admin smoke-test workflow before and after GitHub uploads.

It is not a normal user-facing page.

The page is already simple, useful and readable:

- backup reminder is visible,
- core checks are listed in order,
- quick-open buttons are available,
- it is intentionally short enough to run before replacing GitHub index.html,
- it supports the regular smoke tests used during Stream Bandit upgrades.

## Current page condition

No tidy rebuild needed.

The page already works well as a manual checklist.

## Protected areas

Do not change lightly:

- backup reminder flow,
- quick-open buttons,
- checklist wording/order,
- health check link,
- backup link,
- smoke-test process.

## Recommendation

Keep as-is unless the checklist text becomes outdated.

Future edits should be wording/checklist updates only, not a layout rebuild.

## Current tidy review status

Keep / skip because admin-only, private, legacy, or already clean:

- My Channel: heavy self-rebuilding control page, tidy on hold.
- Supabase Test: admin diagnostics, keep as-is.
- Live Readiness: admin checklist, keep as-is.
- Supabase Migration: admin import/recovery tool, keep as-is.
- Mux Manager: admin video helper, keep mostly as-is.
- Upload Plan: admin reference guide, keep as-is.
- Local Storage / Legacy Browser Files: admin legacy recovery tool, keep as-is.
- Storage Prep / Supabase Readiness: admin readiness checklist, keep as-is.
- Backup / Safety: already tidy, keep as-is.
- Submit Video: functional user/creator submission page, keep cautiously.
- Rules: simple text page, keep.
- Review Queue: key admin approval workflow, keep.
- Health Check: admin safety/check page, keep as-is after failed V5.33 tab test.
- Live Test Checklist: admin smoke-test checklist, keep as-is.

## Next recommended target

Continue checking remaining public/user-facing Browse pages rather than admin tools.
