# CHECKPOINT — Admin menu group start scan V7.12.121

Status: START SCAN / NO PAGE CHANGES YET

Date: 2026-05-28

User direction:
- Start Admin group next.
- Work page by page.
- This is a challenging group and may not complete today.
- Record detailed checkpoints tonight so work can continue smoothly later.
- Do not trust the old page registry blindly; it is outdated.
- Keep useful tools.
- Add footer to every Admin page.
- No more dead/locked buttons where safe.
- Reroute tabs and links to current passed routes.
- Health Check locked actions should function where safe.
- Storage Prep actions should function where safe.
- Backup / Safety should stay handy and functional.
- Mux Manager is complex; keep safe, no risky video/Mux secret/API actions in frontend.

Current Admin overlay group from screenshot:
1. Admin Centre — Admin command deck
2. Live Readiness — Release smoke test
3. Version Registry — Page registry
4. Test Checklist — Testing
5. Tools — Tools
6. Health Check — Health
7. Mux Manager — Mux
8. Storage Prep — Storage
9. Backup / Safety — Backup

Initial GitHub scan findings:
- Admin Centre current/test file found: `admin-centre-command-deck-v7-10-0-test.html`
- Live Readiness file found: `live-readiness-global-helpers-v7-10-2-test.html`
- Version Registry file found: `all-pages-version-registry-v7-10-3-full-test.html`
- Test Checklist file found: `test-checklist-global-helpers-v7-10-5-test.html`
- Tools file found: `tools-page-global-helpers-v7-10-1-test.html`
- Health Check file found: `health-check-global-helpers-v7-10-6-test.html`
- Mux Manager file confirmed by checkpoint: `mux-manager-global-helpers-v7-10-7-test.html`
- Storage Prep file confirmed by checkpoint: `storage-prep-global-helpers-v7-10-8-test.html`
- Backup / Safety file confirmed by checkpoint: `backup-safety-global-helpers-v7-10-9-test.html`

Important scan detail:
- `admin-centre-command-deck-v7-10-0-test.html` still contains older/stale route entries.
- Example: it points All Pages Version Registry to `all-pages-version-registry-v7-1-4-full-test.html` even though current scan found `all-pages-version-registry-v7-10-3-full-test.html`.
- It also points multiple cards through old admin-shell bridge files.
- This confirms the user's note that the registry/route map is outdated.

Existing checkpoint facts:
- Backup / Safety checkpoint records the Admin group as previously passed/promoted at V7.10.x:
  - Admin Centre
  - Live Readiness
  - All Pages Version Registry
  - Test Checklist
  - Tools Page
  - Health Check
  - Mux Manager
  - Storage Prep
  - Backup Safety
- Mux Manager V7.10.7 is a public playback helper only and must not contain Mux secrets, upload actions, delete actions or API calls.
- Storage Prep V7.10.8 is a read-only planning/readiness page and should not create buckets, edit policies, upload, delete, patch Supabase rows, run Mux uploads or promote live/index.
- Health Check V7.10.6 is currently read-only and owns visible helper/system health checks and route scans, not data repair or live actions.

Group strategy:
- Build new Admin group versions as V7.12.121+.
- Work one page at a time.
- Start with Admin Centre because it controls the group routes and is clearly stale.
- Add local footer to Admin Centre first.
- Update Admin Centre route cards to the current passed group routes.
- Keep Admin Centre navigation/readiness only; do not add writes.
- After Admin Centre passes, proceed to Live Readiness, Version Registry, Test Checklist, Tools, Health Check, Mux Manager, Storage Prep, Backup / Safety.

Safety rules for Admin group:
- No protected global shell edit.
- No Settings logic edit unless that specific page is the target and user approves.
- No index promotion until the whole group passes.
- No Supabase schema changes.
- No private Mux/API secrets in frontend.
- No frontend Mux upload/delete/API actions.
- No dangerous delete/repair/live/index controls unless they are explicitly safe and user-tested.
- Use local page footers, not global shell footer changes.

Next action:
- Create Admin Centre V7.12.121 normal page with:
  - current route cards
  - local footer
  - helper status
  - route scan
  - stale registry warning removed/replaced with accurate current route map
  - no writes
  - no protected shell edit
