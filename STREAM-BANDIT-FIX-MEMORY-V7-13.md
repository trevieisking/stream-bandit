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
| Web Builder support queue | `CHECKPOINT-WEB-BUILDER-SUPPORT-ROUTE-CANONICAL-QUEUE-V7-13-026.md` | Old Web Builder support route cleanup is queued with canonical targets and safety rules. |
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

## Verified Web Builder target mapping

These are the current targets verified by source scan.

| Old/support route | Current target | Verified status |
|---|---|---|
| `web-builder-live-studio-v7-12-116-test.html?page=test-page` | `web-builder-account-control-hub-v7-12-263-test.html` | Web Builder Hub verified as current account control/workspace opener. |
| `web-builder-pages-manager-v7-12-111-test.html` | `web-builder-pages-manager-owned-v7-12-256-test.html` | Owned Pages Manager verified as current guarded workspace manager. |
| `web-builder-shared-style-preview-v7-12-117-test.html?page=test-page` | `web-builder-preview-owned-v7-12-257-test.html?page=test-page` | Owned Preview verified as current full compositor preview. |
| `web-builder-form-save-v7-12-94-test.html?page=test-page` | `web-builder-form-designer-owned-v7-12-258-test.html?page=test-page` | Current target is a safe loader for the working Form Designer build. |
| `web-builder-form-submissions-v7-12-94-test.html?page=test-page` | `web-builder-form-inbox-owned-v7-12-258-test.html?page=test-page` | Current target is Web Builder Messages + Submissions V7.13.049. |

Notes:

```text
The Form Designer target is a safe loader, not a normal full page.
The Form Inbox target is current, but it still contains one old Full submissions manager link back to the older submissions page.
Do not full-rewrite old form/save/inbox pages blindly because they preserve real Supabase form and private-message flows.
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
stream-bandit-global-helper-loader-v7-12-126.js
web-builder-account-control-hub-v7-12-263-test.html
web-builder-pages-manager-owned-v7-12-256-test.html
web-builder-preview-owned-v7-12-257-test.html
web-builder-form-designer-owned-v7-12-258-test.html
web-builder-form-inbox-owned-v7-12-258-test.html
```

---

## Current queued route-only cleanup

These are not emergency runtime breaks because old wrappers/canonical maps exist. They are still source cleanup targets.

| File | Old target | Correct target | Patch type |
|---|---|---|---|
| `web-builder-form-save-v7-12-94-test.html` | old live studio / old inbox / old shared preview | current Hub / owned Form Inbox / owned Preview | Full-file preserve or line-safe update only. |
| `web-builder-form-submissions-v7-12-94-test.html` | old live studio / old form / old shared preview | current Hub / owned Form Designer / owned Preview | Full-file preserve or line-safe update only. |
| `web-builder-theme-studio-controls-v7-8-9-test.html` | old live studio / old Pages Manager / old shared preview | current Hub / owned Pages Manager / owned Preview | Route-only link cleanup. |
| `settings-platform-control-hub-v7-12-85-test.html` | old live studio / old Pages Manager / old shared preview | current Hub / owned Pages Manager / owned Preview | Route-only link cleanup. |
| `web-builder-form-inbox-owned-v7-12-258-test.html` | old Full submissions manager link | current owned Form Inbox or legacy manager decision required | Small route-only cleanup after confirming intended UX. |
| `web-builder-pages-manager-v7-12-111-test.html` | old builder / old preview support routes | current owned Web Builder routes | Preserve support page; route-only cleanup later. |
| `stream-bandit-shell-v6-24.js` | old support route aliases | current owned Web Builder routes | Full helper update attempted but blocked by safety checks because helper contains public Supabase config. |
| `stream-bandit-global-helper-loader-v7-12-126.js` | old support route aliases | current owned Web Builder routes | Full helper update attempted but blocked by safety checks. |

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

### Batch 4

```text
[x] Web Builder Hub target scan
[x] Owned Pages Manager target scan
[x] Owned Preview target scan
[x] Owned Form Designer target scan
[x] Owned Form Inbox target scan
[x] Old support-route reference search
```

---

## Current consistency state

```text
[x] Route access map old aliases updated.
[x] Route registry old aliases updated.
[x] Auth entry gate updated for account_optional and creator_plan.
[x] Web Builder current target mapping verified.
[ ] Web Builder support-page route strings cleaned where safe.
[ ] Registry/protected helper rescan after route-string cleanup.
```

---

## Next working order

```text
1. Prefer exact small route-only edits for pages without unsafe full-page rewrite risk.
2. Start with Settings Hub and Theme Studio top-rail route-only cleanup if full-file fetch/write is safe.
3. Leave old form/save/inbox full pages alone unless a full preserve-safe replacement is prepared.
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
