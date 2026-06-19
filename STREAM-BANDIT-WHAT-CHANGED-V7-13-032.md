# Stream Bandit What Changed V7.13.058

Status: plain-English project checkpoint for the final beginning-to-end scan pass.

Date: 2026-06-19

This file records what actually changed, what the full scan taught us, what is now locked, and what deliberately remains deferred.

## Big picture

Stream Bandit is not being rebuilt from scratch. The full scan proved that the project is now a route-family platform, not one flat pile of pages.

The main scan lesson:

```text
Most confusion came from old support routes still being visible in menus/maps, not from the current app being broken.
```

The governing repair rule remains:

```text
Scan first.
Map the current truth.
Lock old routes to current routes.
Patch only what is proven wrong.
Preserve real working pages with safe loaders when full rewrite is risky.
Do not touch database/storage/payment/index/Home/player/accessibility unless explicitly approved.
```

## Current working boundary

```text
Final scan pass: complete
Current active surface: documentation and route truth only
Supabase/backend changes: not approved
Old useful pages: not deleted
New checkpoint file: not created
Manifest: updated and verified
```

## What changed successfully

### 1. Current app manifest was updated and verified

```text
CURRENT-APP-MANIFEST-V7-12-180.md
```

Now records:

```text
V7.13.058 Final Scan Pass / Header Owner Web Builder Menu Cleanup / Manifest Updated
```

It also acts as the scan-pass checkpoint so no new checkpoint file was needed.

### 2. Main shell route aliases were cleaned

```text
stream-bandit-shell-v6-24.js
```

App-facing old Web Builder support aliases now point to current owned Web Builder pages where appropriate.

### 3. Header shell Owner menu was cleaned

```text
stream-bandit-header-shell-v7-12-156.js
```

Visible shell version now recorded as:

```text
V7.13.058 Header Shell / Owner Web Builder Menu Cleanup
```

Owner menu was reduced to management/proof items and old normal Web Builder support exposure was removed.

### 4. Master plan was updated

```text
STREAM-BANDIT-MASTER-MUST-FOLLOW-PLAN.md
```

Now records the full scan lessons, route-family architecture, owner/social/user-management/admin boundaries, and the no-backend-change rule.

### 5. Fix Memory was updated

```text
STREAM-BANDIT-FIX-MEMORY-V7-13.md
```

Now records the final scan route families, current Web Builder map, lean Owner rule, User Management rule, Social rule and Admin rule.

### 6. Master Audit Sheet was updated

```text
STREAM-BANDIT-PHASE-1-MASTER-AUDIT-SHEET-V7-13-019.md
```

Now acts as the current scan/audit map instead of an old Phase 1-only sheet.

### 7. Web Builder Manifest was updated

```text
WEB-BUILDER-MANIFEST-V7-12-252.md
```

Now records the current Web Builder owned route map and legacy support-route handling.

## Final group scan results

### Web Builder

Status:

```text
CURRENT WEB BUILDER ROUTES VERIFIED / OLD SUPPORT ROUTES KEPT FOR COMPATIBILITY
```

Current Web Builder user-facing route truth:

```text
Web Builder Hub
-> web-builder-account-control-hub-v7-12-263-test.html

Owned Pages Manager
-> web-builder-pages-manager-owned-v7-12-256-test.html

Owned Preview
-> web-builder-preview-owned-v7-12-257-test.html?page=test-page

Form Designer
-> web-builder-form-designer-owned-v7-12-258-test.html?page=test-page

Form Inbox Bridge
-> web-builder-form-inbox-owned-v7-12-258-test.html?page=test-page
```

Notes:

```text
Old support pages remain useful compatibility/witness pages.
Do not delete them blindly.
Normal user-facing menu/link flow should use the current owned routes.
```

### Admin

Status:

```text
SCAN PASSED / NO BROAD PATCH NEEDED
```

Scanned as proof/support/control surfaces:

```text
Admin Centre
Live Readiness
Current Routes Registry
Test Checklist
Tools
Health Check
Mux Manager
Storage Prep
Backup / Safety
```

### Social

Status:

```text
SCAN PASSED / REAL SOCIAL PAGES PRESERVED
```

Current Social routes:

```text
profile-social-v7-13-001-test.html
friends-social-v7-13-001-test.html
news-feed-social-v7-13-001-test.html
groups-social-v7-13-001-test.html
```

Do not blind-patch these pages because they own real social/profile/feed/group/event behavior.

### User Management

Status:

```text
SCAN PASSED / OWNER-ADMIN CONTROL GROUP PRESERVED
```

Current routes:

```text
user-management-dashboard-v7-11-2-test.html
plans-pricing-feature-shop-v7-11-3-test.html
permissions-matrix-user-management-v7-11-4-test.html
```

Rules:

```text
Dashboard = real protected owner/admin control.
Pricing = preview-only, no billing, no provider, no entitlement writes.
Permissions = read-only, no billing, no role changes, no writes.
```

### Owner

Status:

```text
SCAN PASSED / OWNER ROUTES PRESERVED / WEB BUILDER MENU EXPOSURE REDUCED
```

Owner menu now keeps:

```text
Form Inbox
One Machine
Platform Control Centre
Final Shell Navigation
Brand / App Icons
Brand Image Helper
Favicon / App Icon Builder
```

Notes:

```text
Form Inbox is a temporary Owner exception and is queued for later Social placement.
One Machine and Final Shell Navigation are read-only proof pages.
Brand / App Icons is a real owner/global-logo write page and must be preservation-first.
Brand Image Helper and Favicon Builder are preview-only.
```

## What deliberately did not change

```text
No SQL.
No RLS.
No storage policy.
No payment provider.
No DNS automation.
No production Home replacement.
No player/audio/accessibility changes.
No service-role logic.
No mass page deletion.
No Web Builder/Main App shell merge.
```

## Deferred work

```text
Move/correct Form Inbox into the Social group later.
Clean old Web Builder witness links inside Owner diagnostic pages only if needed.
Run a future controlled registry/access-map update pass if the updated docs prove a stale user-facing route remains.
Do not delete old useful pages just because they are old.
```

## Current decision

```text
SCAN PASS COMPLETE.
DOCS UPDATED.
MANIFEST UPDATED.
WEB BUILDER MAP UPDATED.
NEXT WORK MUST START FROM THESE DOCS, NOT FROM OLD MENU CONFUSION.
```
