# CHECKPOINT — Policy menu group complete V7.12.120

Status: FULL GROUP COMPLETE

Passed / completed pages:
- policy-documents-centre-v7-12-119-test.html
- policy-reader-v7-12-119-test.html
- policy-admin-documents-v7-12-120-test.html

Trevor visual/test confirmation:
- Policy Centre page: passed.
- Policy Reader page: passed.
- Policy Admin page: passed after replacing the failed iframe wrapper with a normal full page.
- Footer appears on Policy Centre.
- Footer appears on Policy Reader.
- Footer appears on normal Policy Admin page.
- Fav/brand/global helpers returned correctly.
- Traffic/routes are now in their lane.
- Public reader shows published policy rows.
- Admin editor saves/publishes policy documents.

Rejected direction:
- policy-admin-documents-v7-12-119-test.html was an iframe wrapper and was rejected.
- Reason: doubled/wrong header; not a normal page like Centre and Reader.

Final admin page:
- policy-admin-documents-v7-12-120-test.html
- Normal full page.
- No iframe wrapper.
- One header only.
- Admin protection retained.
- Save draft, publish and archive retained.
- Local footer added.

Promoted route bridges:
- policy-agreements-centre-v7-11-6-test.html -> policy-documents-centre-v7-12-119-test.html
  - Commit: 02182c23ce2dca80a92a686b2545c5bdbda04117
- policy-reader-published-row-v7-12-27-test.html -> policy-reader-v7-12-119-test.html?policy=<same policy>
  - Commit: c2b76d7f9df4099afdf89260443ca3ffdcecbc48
- policy-admin-save-editor-v7-12-25-test.html -> policy-admin-documents-v7-12-120-test.html?policy=<same policy>
  - Commit: 052147d53922047c04ac912ab96e03cb6250246d

Index:
- Backup note was created:
  - backups/index-before-policy-group-v7-12-120-2026-05-28.md
  - Commit: 4f8a466fd49b7b47e22e59e90fd51de710373108
- Direct full index.html promotion was attempted but blocked by safety layer.
- Do not force it in this turn.
- Overlay routes are already promoted and functional.
- Promote index later with a safer write method.

Rules kept:
- No protected global shell edit.
- No Settings logic edit.
- No Supabase schema change.
- No copyright wording added yet.
- Copyright / Chatterfriends Stream Bandit footer wording is saved for a later dedicated step.

Next group plan: Admin menu group
- User says page registry is outdated; do not trust it blindly.
- Admin group has 9 routes: Admin Centre, Live Readiness, Version Registry, Test Checklist, Tools, Health Check, Mux Manager, Storage Prep, Backup / Safety.
- Need scan first.
- Keep useful tools.
- Add local footer to every admin page.
- No more locked/dead buttons where possible.
- Links/tabs should be rerouted to current passed routes.
- Health Check locked actions should function where safe.
- Storage Prep actions should be unlocked where safe.
- Backup / Safety should remain handy and functional.
- Mux Manager may be complex; unlock useful routes/actions where safe, but no risky video changes without testing.
