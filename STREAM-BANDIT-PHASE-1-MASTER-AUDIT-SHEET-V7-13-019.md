# Stream Bandit Master Audit Sheet V7.13.058

Date: 2026-06-19

Status: FULL SCAN PASS COMPLETE / ROUTE FAMILY MAP / NO BACKEND CHANGES

Governing plan: `STREAM-BANDIT-MASTER-MUST-FOLLOW-PLAN.md`

This file started as the Phase 1 audit sheet. It now carries the current full-scan audit map after every major route family was scanned from beginning to end.

No SQL was run.
No RLS was changed.
No storage policy was changed.
No payment provider was activated.
No production Home replacement was approved.
No player/audio/accessibility regression work was done.

## 1. Inputs scanned

Primary source files and page families used for this audit:

```text
CURRENT-APP-MANIFEST-V7-12-180.md
STREAM-BANDIT-MASTER-MUST-FOLLOW-PLAN.md
STREAM-BANDIT-FIX-MEMORY-V7-13.md
STREAM-BANDIT-WHAT-CHANGED-V7-13-032.md
WEB-BUILDER-MANIFEST-V7-12-252.md
stream-bandit-route-registry-v7-13-001.js
stream-bandit-route-access-map-v7-12-271.js
stream-bandit-shell-v6-24.js
stream-bandit-header-shell-v7-12-156.js
all-pages-version-registry-v7-12-122-current-routes-test.html
Admin group pages
Social group pages
User Management pages
Owner group pages
Web Builder current owned pages
```

Master scan rule:

```text
SCAN
MAP
LOCK
PATCH ONLY WHAT FAILS
FULL-PAGE REPLACE ONLY WHEN PATCHING IS UNSAFE
```

## 2. Full scan outcome

```text
Main App / Web Builder separation: preserved
Index replacement: not approved
Home replacement: not approved
Schema change: not approved
RLS change: not approved
Storage policy change: not approved
DNS automation: not approved
Payment activation: not approved
Player/audio/accessibility change: not approved
Old useful page deletion: not approved
```

The scan proved that the current app is route-family based. Old support pages were the main source of confusion.

## 3. Current route family audit map

| Family | Current purpose | Scan result | Future rule |
|---|---|---|---|
| Platform / Core Watch | Entry, Home, Library, Details, Player, history, saved lists, accessibility | Keep | Do not replace Home or player/accessibility without explicit approval. |
| Creator / Library Management | Submit Video, Rules, Review Queue, Supabase Library Editor, Genres | Keep | Preserve writer pages and review/publish flows. |
| Group Play | Playlists, Channels, My Channel, Collections, Player 2 | Keep | Do not rewrite plan/ownership flows blindly. |
| Social Media Group | Social Profile, Friends, News Feed, Groups/Events | Keep | Real working social pages; no blind patching. |
| Account / Settings | Account Settings, Settings Hub, Theme Studio | Keep | Settings/Theme are global-sensitive; patch only exact route issues. |
| Web Builder | Hub, Pages, Studio, Preview, Menus, Forms, Assets, Maps | Current owned routes verified | Keep separate from Main App shell. |
| Admin / Proof | Admin Centre, Live Readiness, Registry, Checklist, Tools, Health, Mux, Storage Prep, Backup | Scan passed | Proof/support pages; no broad rewrite. |
| Owner / Management | Form Inbox exception, One Machine, Platform Control, Final Shell, Brand tools | Kept lean | Owner is diagnostic/management, not normal public menu. |
| User Management | Dashboard, Pricing, Permissions | Scan passed | Dashboard protected; Pricing preview-only; Permissions read-only. |
| Policy | Policy centre, reader, admin editor | Keep | Public centre/reader, admin editor protected. |

## 4. Current Web Builder canonical map

| Old/support idea | Current owned target | Scan decision |
|---|---|---|
| Old Web Builder live studio | `web-builder-account-control-hub-v7-12-263-test.html` | Use current Hub for normal links. |
| Old Pages Manager | `web-builder-pages-manager-owned-v7-12-256-test.html` | Use owned manager for normal links. |
| Old Shared Preview | `web-builder-preview-owned-v7-12-257-test.html?page=test-page` | Use owned preview for normal links. |
| Old Form Save | `web-builder-form-designer-owned-v7-12-258-test.html?page=test-page` | Use Form Designer for normal builder form-edit links. |
| Old Form Submissions | `web-builder-form-inbox-owned-v7-12-258-test.html?page=test-page` | Use owned Form Inbox bridge for Web Builder normal route. |

Old support pages may remain in the repo as compatibility and diagnostic witnesses. They should not be deleted blindly.

## 5. Current Owner audit

Owner menu should be lean.

Current exposed Owner routes:

```text
Form Inbox
One Machine
Platform Control Centre
Final Shell Navigation
Brand / App Icons
Brand Image Helper
Favicon / App Icon Builder
```

Owner risk map:

| Page | Risk | Rule |
|---|---|---|
| Form Inbox | Medium/high | Temporary Owner exception; queue for later Social placement. |
| One Machine | Low | Read-only proof map; may keep old witnesses. |
| Platform Control Centre | Medium | Global settings/control hub; patch carefully. |
| Final Shell Navigation | Low | Read-only shell proof. |
| Brand / App Icons | High | Real owner/admin logo upload/save; preservation-first. |
| Brand Image Helper | Low | Preview-only; writes off. |
| Favicon / App Icon Builder | Low | Preview-only; writes off. |

## 6. Current User Management audit

| Page | Route | Scan result | Rule |
|---|---|---|---|
| User Management Dashboard | `user-management-dashboard-v7-11-2-test.html` | Real protected owner/admin control room | Do not blind-patch. |
| Feature Shop / Pricing | `plans-pricing-feature-shop-v7-11-3-test.html` | Preview-only | No billing/provider/entitlement writes. |
| Permissions Inspector | `permissions-matrix-user-management-v7-11-4-test.html` | Read-only | No writes, billing or role changes. |

## 7. Current Social audit

| Page | Route | Scan result | Rule |
|---|---|---|---|
| Social Profile | `profile-social-v7-13-001-test.html` | Real account/social/profile page | Preserve. |
| Friends | `friends-social-v7-13-001-test.html` | Real friends/messages/likes page | Preserve. |
| News Feed | `news-feed-social-v7-13-001-test.html` | Real feed/post/comment/reaction page | Preserve. |
| Groups and Events | `groups-social-v7-13-001-test.html` | Real group/event/post page | Preserve. |

## 8. Current Admin audit

Admin pages scanned:

```text
admin-centre-command-deck-v7-12-121-test.html
live-readiness-global-helpers-v7-10-2-test.html
all-pages-version-registry-v7-12-122-current-routes-test.html
test-checklist-global-helpers-v7-10-5-test.html
tools-page-original-global-pass-v7-12-136-test.html
health-check-global-helpers-v7-10-6-test.html
mux-manager-global-helpers-v7-10-7-test.html
storage-prep-global-helpers-v7-10-8-test.html
backup-safety-global-helpers-v7-10-9-test.html
```

Admin conclusion:

```text
No broad Admin rewrite needed.
Proof/support pages should remain stable.
Storage Prep is controlled and should not become an unrestricted storage writer.
```

## 9. High-risk page list

Do not blind-patch:

```text
Social Profile
Friends
News Feed
Groups and Events
User Management Dashboard
Brand / App Icons
Review Queue
Submit Video
Supabase Library Editor
Owned Pages Manager
Form Designer
Form Inbox
Theme Studio
Settings Hub
Player pages
Accessibility/audio comfort pages
```

## 10. Low-risk/read-only proof list

Safer to update only when exact route labels are wrong:

```text
Pricing / Feature Shop
Permissions Inspector
One Machine
Final Shell Navigation
Admin Centre route proof areas
Live Readiness
Current Routes Registry
Test Checklist
Tools
Health Check
Backup / Safety
Brand Image Helper
Favicon / App Icon Builder
```

## 11. Deferred queue

```text
Move/correct Form Inbox into Social later.
Clean old Web Builder witness links inside Owner diagnostic pages only if needed.
Update route registry/access map in a controlled pass if user-facing stale routes remain.
Do not delete old useful pages.
Do not touch SQL/RLS/storage/payment without a separate approved backend pass.
```

## 12. Final audit decision

```text
FULL SCAN PASS COMPLETE.
CURRENT ROUTE FAMILIES UNDERSTOOD.
OLD SUPPORT ROUTES ARE NOT AUTOMATIC BUGS.
PATCH ONLY REAL USER-FACING CONFUSION OR BROKEN FLOW.
```
