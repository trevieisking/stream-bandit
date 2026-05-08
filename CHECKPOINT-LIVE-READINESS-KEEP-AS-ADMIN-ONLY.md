# Stream Bandit — Live Readiness Keep As-Is

Checkpoint name:

`Live Readiness - Keep As Admin Only`

## Decision

Do not tidy or rebuild the Live Readiness page for now.

## Reason

Live Readiness is an admin/private checklist page, not a normal user-facing page.

It already functions well and clearly shows:

- stable checkpoint,
- library mode,
- Supabase/admin session,
- profile role,
- Supabase movie/channel/collection counts,
- Watchlist/Favourites/Likes counts,
- readiness checklist status,
- refresh/readiness and backup-before-hosting actions.

## Notes

This page can stay more technical than public browse pages because it is mainly for owner/admin checks before hosting.

No live changes required.

## Protected areas

No changes should be made now to:

- readiness checks,
- refresh Supabase readiness,
- library switch link/action,
- backup before hosting,
- Supabase counts,
- Watchlist/Favourites/Likes checks,
- player,
- Sound Booster,
- movie rows,
- Supabase writes.

## Current decision path

Skipped for tidy:

- My Channel: heavy self-rebuilding control page; tidy on hold.
- Supabase Test: admin/private diagnostics page; keep as-is.
- Live Readiness: admin/private diagnostics/checklist page; keep as-is.

## Next recommended page

Continue page tidy only on safer user-facing pages.

Recommended next target:

`Supabase Migration` or `Mux Manager`, depending on which one is mainly visual/status and less likely to rebuild itself after button actions.
