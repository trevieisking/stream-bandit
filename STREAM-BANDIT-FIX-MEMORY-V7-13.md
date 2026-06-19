# Stream Bandit Fix Memory V7.13.058

Status: ACTIVE FIX LEDGER / FINAL FULL-SCAN PASS RECORDED

Date: 2026-06-19

Purpose: compact working memory for the current cleanup-and-replace pass after the full beginning-to-end route/page scan. This keeps the current truth visible in GitHub so the project does not rely on chat memory.

## Governing documents

```text
CURRENT-APP-MANIFEST-V7-12-180.md
STREAM-BANDIT-MASTER-MUST-FOLLOW-PLAN.md
STREAM-BANDIT-PHASE-1-MASTER-AUDIT-SHEET-V7-13-019.md
WEB-BUILDER-MANIFEST-V7-12-252.md
STREAM-BANDIT-WHAT-CHANGED-V7-13-032.md
stream-bandit-route-registry-v7-13-001.js
stream-bandit-route-access-map-v7-12-271.js
```

## Current working rule

```text
SCAN
MAP
LOCK
PATCH ONLY WHAT FAILS
HIDE OR CANONICALIZE OLD SUPPORT ROUTES
DO NOT DELETE USEFUL OLD PAGES BLINDLY
FULL-PAGE REPLACE ONLY WHEN PATCHING IS UNSAFE
```

## What the full scan taught us

```text
Stream Bandit is not one flat pile of test pages anymore.
It is a platform with route families.
Most confusion came from old support routes still being visible, not from the current app being broken.
Current owned Web Builder routes are now known.
Owner should be lean and management/proof only.
Social pages are real working pages and must not be blind-patched.
User Management is a real protected owner/admin control group.
Admin proof pages mostly do not need rewrites.
Old useful pages should be kept as support/witness pages unless a controlled cleanup says otherwise.
```

## Current final-scan route families

```text
Platform / Core Watch
Creator / Library Management
Group Play
Social Media Group
Account / Settings
Web Builder
Admin / Proof
Owner / Management
User Management
Policy
```

## Current Web Builder route map

These are the current user-facing Web Builder targets verified by source scan:

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

Old Web Builder support routes may remain available for compatibility and diagnostics, but they should not be normal user/menu exposure when a current owned page exists.

## Current Owner rule

Owner is not a normal public-navigation group. It is management/proof/diagnostic.

Header Owner menu should currently expose only:

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
Form Inbox is the temporary Owner exception and is queued for later Social placement.
One Machine is read-only route/security/ownership proof.
Final Shell Navigation is read-only shell/navigation proof.
Brand / App Icons is a real owner/admin global-logo upload/save page and must be preservation-first.
Brand Image Helper is preview-only and writes off.
Favicon / App Icon Builder is preview-only and writes off.
```

## Current User Management rule

```text
User Management Dashboard = real protected owner/admin control room.
Feature Shop / Pricing = preview-only, no provider, no billing, no upgrades, no entitlement writes.
Permissions Inspector = read-only, no writes, no billing, no role changes.
```

## Current Social rule

```text
Social Profile = real account/social/profile wall page.
Friends = real friends/messages/likes page.
News Feed = real post/comment/reaction/feed page.
Groups and Events = real groups/events/posts page.
Do not blind-patch these pages.
```

## Current Admin rule

```text
Admin Centre = command deck / route proof.
Live Readiness, Registry, Test Checklist, Tools, Health Check, Mux Manager, Backup/Safety = proof/support surfaces.
Storage Prep = controlled image-upload prep surface.
No broad Admin rewrite needed from this scan.
```

## Confirmed changes made in this pass

```text
CURRENT-APP-MANIFEST-V7-12-180.md updated to V7.13.058 and verified.
stream-bandit-shell-v6-24.js app-facing Web Builder aliases updated to current owned routes.
stream-bandit-header-shell-v7-12-156.js owner menu cleaned and versioned V7.13.058.
STREAM-BANDIT-MASTER-MUST-FOLLOW-PLAN.md updated to V7.13.058.
```

## Remaining docs being updated in this close-out

```text
STREAM-BANDIT-FIX-MEMORY-V7-13.md
STREAM-BANDIT-WHAT-CHANGED-V7-13-032.md
STREAM-BANDIT-PHASE-1-MASTER-AUDIT-SHEET-V7-13-019.md
WEB-BUILDER-MANIFEST-V7-12-252.md
```

## Deferred work, not for this pass

```text
Move/correct Form Inbox into the Social group later.
Clean old Web Builder witness links inside Owner diagnostic pages only if they cause real confusion later.
Update route registry/access map only in a controlled code pass if the updated docs prove a stale user-facing route remains.
Do not delete old useful pages just because they are old.
Do not touch SQL/RLS/storage/payment without a separate approved backend pass.
```

## Current safety state

```text
Main App separate: yes
Web Builder separate: yes
Index remains Platform Entry: yes
Home remains Main App Home: yes
SQL added: no
RLS changed: no
Storage policy changed: no
Payment activated: no
Player/audio/accessibility changed: no
Useful old support pages deleted: no
```
