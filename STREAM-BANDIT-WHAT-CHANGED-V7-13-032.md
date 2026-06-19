# Stream Bandit What Changed V7.13.032

Status: plain-English project checkpoint for the current cleanup pass.

This file exists because the project is now too large to keep safely in chat memory. It lists what has actually changed, what is still queued, and what has deliberately not been touched.

---

## Big picture

Stream Bandit is not being rebuilt from scratch. The current pass is a controlled route/foundation cleanup:

```text
Scan first.
Map the current truth.
Lock old routes to current routes.
Patch only what is proven wrong.
Do not touch database/storage/payment/index/Home unless explicitly approved.
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

### 8. Settings Hub was actually updated

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

### 9. Theme Studio was scanned next

```text
web-builder-theme-studio-controls-v7-8-9-test.html
```

Findings:

```text
Still has old Web Builder live-studio link.
Still has old Pages Manager link.
Still has old Shared Preview link.
Theme Studio is more complex because it owns real global theme saving.
Do not blindly rewrite it without complete source preservation.
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

## What is still queued

### High priority

```text
Theme Studio route-only cleanup
```

Old links to fix when safe:

```text
web-builder-live-studio-v7-12-116-test.html?page=test-page
web-builder-pages-manager-v7-12-111-test.html
web-builder-shared-style-preview-v7-12-117-test.html?page=test-page
```

Current targets:

```text
web-builder-account-control-hub-v7-12-263-test.html
web-builder-pages-manager-owned-v7-12-256-test.html
web-builder-preview-owned-v7-12-257-test.html?page=test-page
```

### Medium priority

```text
web-builder-form-inbox-owned-v7-12-258-test.html
```

It is current, but has one old "Full submissions manager" link pointing back to the older submissions manager. This needs a UX decision before changing.

### Protected / careful only

```text
web-builder-form-save-v7-12-94-test.html
web-builder-form-submissions-v7-12-94-test.html
stream-bandit-shell-v6-24.js
stream-bandit-global-helper-loader-v7-12-126.js
```

These must not be blindly replaced because they either preserve real form/private-message flows or contain Supabase config/helper logic.

---

## Current confidence

```text
The project is not dead.
The hard part is not the idea; it is route drift and too many historical page versions.
The current plan is working when changes stay small and verified.
The user does not need to know code to continue if every step is logged and tested.
```

---

## Next safe step

```text
Continue Theme Studio route cleanup only if the full page can be preserved safely.
If full preservation is not possible through the tool, record the exact manual route replacements instead of forcing a risky rewrite.
```
