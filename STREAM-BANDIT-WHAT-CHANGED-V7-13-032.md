# Stream Bandit What Changed V7.13.055

Status: plain-English project checkpoint for the current Web Builder cleanup pass.

This file exists because the project is now too large to keep safely in chat memory. It lists what has actually changed, what is still queued, and what has deliberately not been touched.

---

## Big picture

Stream Bandit is not being rebuilt from scratch. The current pass is a controlled route/foundation cleanup:

```text
Scan first.
Map the current truth.
Lock old routes to current routes.
Patch only what is proven wrong.
Preserve real working pages with safe loaders when full rewrite is risky.
Do not touch database/storage/payment/index/Home unless explicitly approved.
```

---

## Current working boundary

```text
Active group: Web Builder only
Not active yet: Admin group
Not active yet: Social group
Not active unless needed: Owner group
Supabase connector: treated as unavailable
GitHub/source cleanup: active repair surface
```

---

## What changed successfully

### 1. Current project memory was created

```text
STREAM-BANDIT-FIX-MEMORY-V7-13.md
```

This is the active ledger for this repair pass.

### 2. Master route/foundation plan was saved

```text
STREAM-BANDIT-MASTER-MUST-FOLLOW-PLAN.md
STREAM-BANDIT-PHASE-1-MASTER-AUDIT-SHEET-V7-13-019.md
```

These are the governing scan/repair documents.

### 3. Route registry was improved

```text
stream-bandit-route-registry-v7-13-001.js
```

Added/confirmed route alias handling so old pages can resolve to the current safer route targets.

Important old route families covered:

```text
Old Collections routes -> current Collections page
Old Player 2 routes -> current Player 2 page
Old Web Builder live-studio routes -> current Web Builder Hub
Old dashboard/pricing/permissions routes -> current account/plan route family
```

### 4. Route access map was improved

```text
stream-bandit-route-access-map-v7-12-271.js
```

Old Web Builder live-studio URLs are treated as aliases for the current Web Builder Hub.

### 5. Auth entry gate was improved

```text
stream-bandit-auth-entry-gate-v7-13-001.js
```

The gate now understands:

```text
account_optional
creator_plan
plan rank checks
permissions_json feature checks
```

This helps stop false blocking while still keeping creator/owner areas protected.

### 6. Current Web Builder target map was verified

Verified current Web Builder route truth:

```text
Old Web Builder live studio
-> web-builder-account-control-hub-v7-12-263-test.html

Old Pages Manager
-> web-builder-pages-manager-owned-v7-12-256-test.html

Old Shared Preview
-> web-builder-preview-owned-v7-12-257-test.html?page=test-page

Old Form Save
-> web-builder-form-designer-owned-v7-12-258-test.html?page=test-page

Old Form Submissions
-> web-builder-form-inbox-owned-v7-12-258-test.html?page=test-page
```

### 7. Web Builder support-route queue was created

```text
CHECKPOINT-WEB-BUILDER-SUPPORT-ROUTE-CANONICAL-QUEUE-V7-13-026.md
```

This records old Web Builder support links and their current owned targets.

### 8. Settings Hub was updated

```text
settings-platform-control-hub-v7-12-85-test.html
```

Committed as:

```text
V7.13.031 Settings Hub Web Builder Route Canonical
```

Changed route links:

```text
Old web-builder-live-studio-v7-12-116-test.html?page=test-page
-> web-builder-account-control-hub-v7-12-263-test.html

Old web-builder-pages-manager-v7-12-111-test.html
-> web-builder-pages-manager-owned-v7-12-256-test.html

Old web-builder-shared-style-preview-v7-12-117-test.html?page=test-page
-> web-builder-preview-owned-v7-12-257-test.html?page=test-page
```

No Supabase rows were changed by this page.
No schema, RLS, storage, payment, index, or Home change was made.

### 9. Theme Studio was fixed safely

```text
web-builder-theme-studio-controls-v7-8-9-test.html
```

Committed as:

```text
V7.13.034 Theme Studio Route Canonical Safe Loader
```

Why safe loader was used:

```text
Theme Studio owns real global theme saving.
It reads/writes app settings and local bridge keys.
A blind full rewrite would be unsafe.
The loader preserves the working V7.12.295 build, patches only old Web Builder route links, then replays the original scripts.
```

### 10. Owned Form Inbox was fixed safely

```text
web-builder-form-inbox-owned-v7-12-258-test.html
```

Committed as:

```text
V7.13.050 Form Inbox Route Canonical Safe Loader
```

Purpose:

```text
Preserve the working V7.13.049 Web Builder Messages + Submissions page.
Patch only the old submissions-manager route.
Keep message/submission logic intact.
```

### 11. Advanced Form support page was fixed safely

```text
web-builder-form-save-v7-12-94-test.html
```

Committed as:

```text
V7.13.051 Advanced Form Route Canonical Safe Loader
```

Purpose:

```text
Preserve the working V7.12.213 Advanced Form submission page.
Patch old Builder / Inbox / Preview route links only.
Keep real form-submission logic intact.
```

### 12. Old Pages Manager support page was scanned and checkpointed

```text
web-builder-pages-manager-v7-12-111-test.html
CHECKPOINT-PAGES-MANAGER-ROUTE-CLEANUP-BLOCKED-V7-13-052.md
```

Result:

```text
The page is a real sb_site_pages manager.
It has save, hide, restore and guarded permanent-delete logic.
A safe-loader update was attempted but blocked by the platform safety check.
The write was not forced or retried.
The exact route map was checkpointed instead.
```

### 13. Published Preview support page was fixed safely

```text
web-builder-shared-style-preview-v7-12-117-test.html
```

Committed as:

```text
V7.13.053 Legacy Published Preview Route Canonical Safe Loader
```

Purpose:

```text
Preserve the working V7.12.235 Published Preview renderer.
Patch old Builder / Form / Inbox / Pages Manager links only.
Keep preview-render logic intact.
```

### 14. Old live-studio route was verified as already safe

```text
web-builder-live-studio-v7-12-116-test.html
```

Result:

```text
Already a fallback wrapper.
Hands off to web-builder-account-control-hub-v7-12-263-test.html.
Preserves query string and hash.
Does not load the old Studio engine.
Does not touch storage.
No change needed.
```

### 15. Legacy Form Inbox support page was fixed safely

```text
web-builder-form-submissions-v7-12-94-test.html
```

Committed as:

```text
V7.13.054 Legacy Form Inbox Route Canonical Safe Loader
```

Purpose:

```text
Preserve the working V7.12.212 Form Inbox + Private Messages page.
Patch old Builder / Form / Preview links only.
Keep inbox, reply, private-message and soft-status logic intact.
```

---

## Current Web Builder status

```text
Settings Hub: fixed
Theme Studio: fixed safely
Owned Form Inbox target: fixed safely
Advanced Form support: fixed safely
Published Preview support: fixed safely
Legacy Form Inbox support: fixed safely
Old Live Studio support: already safe wrapper
Old Pages Manager support: scanned, blocked, checkpointed
```

---

## What did not change

These areas have deliberately not been touched:

```text
SQL
RLS
Supabase storage policies
Payment activation
Index/Home promotion
Movie/player engine
Database row contents
Buckets
Domain/DNS
Admin group
Social group
Owner group
```

---

## Supabase status

Supabase briefly appeared visible as:

```text
Stream Bandit
Project ref: xzxqfrvqdgkzwujbkdbk
ACTIVE_HEALTHY
```

But table inspection was blocked and the Supabase connector then disappeared again.

Current working assumption:

```text
Treat Supabase as unavailable.
Use GitHub/source cleanup only.
Do not retry blocked Supabase calls repeatedly.
```

---

## Still queued / careful only

### Blocked but mapped

```text
web-builder-pages-manager-v7-12-111-test.html
```

Reason:

```text
Real sb_site_pages manager.
Safe-loader write was blocked.
Checkpoint exists.
Do not force.
```

### Protected helper/source cleanup only after separate decision

```text
stream-bandit-shell-v6-24.js
stream-bandit-global-helper-loader-v7-12-126.js
stream-bandit-route-registry-v7-13-001.js
stream-bandit-route-access-map-v7-12-271.js
```

Reason:

```text
These are global/protected helpers.
Some contain Supabase public config or route-critical code.
Previous helper rewrites were blocked.
Do not force.
```

---

## Current confidence

```text
The project is not dead.
The hard part is route drift and too many historical page versions.
The current plan is working when changes stay small and verified.
The user does not need to know code to continue if every step is logged and tested.
```

---

## Next safe step

```text
Finish the Web Builder group pass by rescanning direct current files only.
Ignore stale search-index/checkpoint/history hits.
Do not jump to Admin, Social or Owner until Web Builder group is closed.
Do not touch Supabase/database.
```
