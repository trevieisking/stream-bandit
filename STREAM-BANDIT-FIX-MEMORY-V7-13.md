# Stream Bandit Fix Memory V7.13

Status: ACTIVE FIX LEDGER

Purpose: one small memory file for the current cleanup-and-replace pass. This keeps the working state visible in GitHub so progress is not only remembered in chat.

Governing documents:

```text
STREAM-BANDIT-MASTER-MUST-FOLLOW-PLAN.md
STREAM-BANDIT-PHASE-1-MASTER-AUDIT-SHEET-V7-13-019.md
stream-bandit-route-registry-v7-13-001.js
stream-bandit-route-access-map-v7-12-271.js
```

Working rule:

```text
SCAN
MAP
LOCK
PATCH ONLY WHAT FAILS
FULL-PAGE REPLACE ONLY WHEN PATCHING IS UNSAFE
```

---

## Rules being followed

```text
No new throwaway page piles.
Reuse safe old pages where possible.
Never overwrite protected reference pages without full scan.
No random SQL.
No RLS/storage/payment/index/Home change unless explicitly approved.
Keep Main App and Web Builder separate.
Keep old safe support routes until replaced safely.
```

---

## Confirmed fixes already committed

| Area | File | Result |
|---|---|---|
| Master plan | `STREAM-BANDIT-MASTER-MUST-FOLLOW-PLAN.md` | Governing plan saved. |
| Phase 1 audit | `STREAM-BANDIT-PHASE-1-MASTER-AUDIT-SHEET-V7-13-019.md` | Foundation audit and conflict queue saved. |
| Genres route lock | `stream-bandit-route-registry-v7-13-001.js` | Genres aligned as public browse with admin-managed writes. |
| Save/history route locks | `stream-bandit-route-registry-v7-13-001.js` | Continue, History, Watchlist, Favourites and Likes aligned as `account_optional`. |
| Rules route lock | `stream-bandit-route-registry-v7-13-001.js` | Creator Rules aligned as public read-only. |
| Group Play locks | `stream-bandit-route-registry-v7-13-001.js` | Playlists, Channels and Collections aligned to `creator_plan` with minPlan metadata. |
| Auth gate | `stream-bandit-auth-entry-gate-v7-13-001.js` | Gate now understands `account_optional`, `creator_plan`, plan rank and `permissions_json` feature checks. |
| Access map | `stream-bandit-route-access-map-v7-12-271.js` | Old Web Builder live-studio URLs canonicalize to Web Builder Hub. |
| Route registry aliases | `stream-bandit-route-registry-v7-13-001.js` | Registry now exposes `oldAliases`, `fileOf()`, `canonical()` and resolves old Collections, Player 2, Web Builder live-studio, dashboard, pricing and permissions URLs to current routes. |
| Old studio scan | `CHECKPOINT-WEB-BUILDER-OLD-STUDIO-ROUTE-SCAN-V7-13-023.md` | Safe wrapper confirmed; source cleanup queued. |
| Old studio reference scan | `CHECKPOINT-WEB-BUILDER-OLD-STUDIO-REFERENCE-SCAN-V7-13-024.md` | Old route references classified. |

---

## Connector status notes

```text
Supabase project visibility came back briefly: Stream Bandit / xzxqfrvqdgkzwujbkdbk / ACTIVE_HEALTHY.
Supabase table inspection was blocked by safety checks.
Supabase connector then disappeared again from the active api_tool namespace list.
No SQL was run.
No database rows were changed.
No RLS, storage policy or payment changes were made.
GitHub remains the active repair surface while Supabase is unavailable.
```

---

## Pages scanned and not rewritten

These were scanned and did not need a full replacement:

```text
watch-history-global-helpers-v7-4-0-test.html
tools-page-original-global-pass-v7-12-136-test.html
mux-manager-global-helpers-v7-10-7-test.html
settings-brand-icons-promoted-v7-12-21-test.html
brand-logo-helper-responsive-v7-12-20-test.html
favicon-app-icon-builder-v7-12-15-test.html
accessibility-clean-machine-v7-12-44-test.html
web-builder-theme-studio-controls-v7-8-9-test.html
settings-platform-control-hub-v7-12-85-test.html
web-builder-preview-owned-v7-12-257-test.html
web-builder-pages-manager-v7-12-111-test.html
stream-bandit-shell-v6-24.js
```

---

## Current queued route-only cleanup

These are not emergency runtime breaks because old wrappers/canonical maps exist. They are still source cleanup targets.

| File | Old target | Correct target | Patch type |
|---|---|---|---|
| `web-builder-form-save-v7-12-94-test.html` | `web-builder-live-studio-v7-12-116-test.html?page=...` | `web-builder-account-control-hub-v7-12-263-test.html` | Full-file preserve or line-safe update only. |
| `web-builder-form-submissions-v7-12-94-test.html` | `web-builder-live-studio-v7-12-116-test.html?page=...` | `web-builder-account-control-hub-v7-12-263-test.html` | Full-file preserve or line-safe update only. |
| `web-builder-theme-studio-controls-v7-8-9-test.html` | `web-builder-live-studio-v7-12-116-test.html?page=test-page` | `web-builder-account-control-hub-v7-12-263-test.html` | Route-only link cleanup. |
| `settings-platform-control-hub-v7-12-85-test.html` | `web-builder-live-studio-v7-12-116-test.html?page=test-page` | `web-builder-account-control-hub-v7-12-263-test.html` | Route-only link cleanup. |
| `web-builder-pages-manager-v7-12-111-test.html` | old builder / old preview support routes | current owned Web Builder routes | Preserve support page; route-only cleanup later. |
| `stream-bandit-shell-v6-24.js` | old support route aliases | current owned Web Builder routes | Full helper update attempted but blocked by safety checks because helper contains public Supabase config. |

---

## Batch scan state

### Batch 1

```text
[x] Watch History
[x] Tools
[x] Mux Manager
```

### Batch 2

```text
[x] Brand / App Icons
[x] Brand Image Helper
[x] Favicon / App Icon Builder
```

### Batch 3

```text
[x] Accessibility global-effect scan
[x] Theme Studio / Settings group scan
[x] Published Preview scan
```

---

## Current consistency state

```text
[x] Route access map old aliases updated.
[x] Route registry old aliases updated.
[x] Auth entry gate updated for account_optional and creator_plan.
[ ] Web Builder support-page route strings cleaned where safe.
[ ] Registry/protected helper rescan after route-string cleanup.
```

---

## Next working order

```text
1. Scan Web Builder support pages that still point to old support routes.
2. Patch only route strings where full-file preservation is safe.
3. Re-scan registry/protected helpers.
4. Keep checking for Supabase connector availability, but do not retry blocked calls repeatedly.
5. Do not touch SQL/RLS/storage/payment unless a scanned page proves it is required and user approves it.
```

---

## Current safety state

```text
Main App separate: yes
Web Builder separate: yes
Index unchanged: yes
Home unchanged: yes
SQL added: no
RLS changed: no
Storage policy changed: no
Payment activated: no
Full page replacement triggered: no
```
