# Stream Bandit Master Must-Follow Plan V7.13.058

Date: 2026-06-19

Status: MASTER GOVERNING PLAN / FINAL SCAN PASS INCORPORATED / MUST FOLLOW BEFORE FUTURE PAGE OR SCHEMA WORK

Purpose: this document is the project-level source plan for Stream Bandit after the full beginning-to-end scan pass. It records what the scan taught us, what is now locked, what stays separate, and what must happen before any future page, shell, registry, Web Builder, Owner, Admin, Social, User Management, storage, payment or database work.

This is a source-of-truth planning document only. It does not approve code rewrites, SQL, RLS changes, storage policy changes, payment activation, DNS automation, production Home replacement or shell merging.

## 1. What the full scan taught us

Stream Bandit is no longer one flat pile of test pages. It is now a platform with clear route families:

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

The main lesson is this:

```text
Most confusion came from old support routes still being visible, not from the current app being broken.
```

Therefore the correct repair pattern is:

```text
SCAN
MAP
LOCK
PATCH ONLY WHAT FAILS
HIDE OR CANONICALIZE OLD SUPPORT ROUTES
DO NOT DELETE USEFUL OLD PAGES BLINDLY
FULL-PAGE REPLACE ONLY WHEN PATCHING IS UNSAFE
```

## 2. Source of truth hierarchy

Every future decision must follow this order:

1. `CURRENT-APP-MANIFEST-V7-12-180.md`
2. `STREAM-BANDIT-MASTER-MUST-FOLLOW-PLAN.md`
3. `STREAM-BANDIT-PHASE-1-MASTER-AUDIT-SHEET-V7-13-019.md`
4. `WEB-BUILDER-MANIFEST-V7-12-252.md`
5. `STREAM-BANDIT-FIX-MEMORY-V7-13.md`
6. `STREAM-BANDIT-WHAT-CHANGED-V7-13-032.md`
7. `stream-bandit-route-registry-v7-13-001.js`
8. `stream-bandit-route-access-map-v7-12-271.js`
9. Current page source fetched directly from GitHub
10. Browser smoke test result

Search results and old checkpoint text are secondary. Direct fetch beats search when they disagree.

## 3. Permanent architecture lock

### Main App stays Main App

Main App owns:

```text
Streaming
Watching
Browse
Creator submission
Review queue
Channels
Collections
Playlists
Social
Messages
Profile
Settings
Admin/proof pages
Accessibility/audio comfort
```

Main App Home remains:

```text
home-global-helpers-v7-4-4-test.html
```

`index.html` remains the Platform Entry, not a replacement for Home.

### Web Builder stays Web Builder

Web Builder owns:

```text
Builder Hub
Owned Pages Manager
Studio / page canvas
Published Preview
Menu Builder
Header/Footer Builder
Form Designer
Form Inbox bridge
Assets
Planning Map
Control Map
Source Map
```

Current Web Builder user-facing route map:

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

Old Web Builder pages can remain as hidden support/compatibility witnesses. They should not be exposed as the normal user route if a current owned page exists.

## 4. Owner group lesson

Owner is not a normal public-navigation group. It is a management/proof/diagnostic group.

The scan taught us that Owner visibility was causing confusion because old Web Builder support pages were still visible there. The fix is not deletion. The fix is to keep Owner lean.

Owner menu should currently expose only:

```text
Form Inbox
One Machine
Platform Control Centre
Final Shell Navigation
Brand / App Icons
Brand Image Helper
Favicon / App Icon Builder
```

Owner rules:

- Form Inbox is the temporary Owner exception and is queued for later Social placement.
- One Machine is read-only route/security/ownership proof.
- Final Shell Navigation is read-only shell/navigation proof.
- Brand / App Icons is a real owner/admin global-logo upload/save page and must be preservation-first.
- Brand Image Helper is preview-only and writes off.
- Favicon / App Icon Builder is preview-only and writes off.
- Old Web Builder support pages should not be normal Owner menu exposure.

## 5. User Management lesson

User Management is not a cosmetic group. It is a real owner/admin control area.

Current routes:

```text
User Management Dashboard
-> user-management-dashboard-v7-11-2-test.html

Feature Shop / Pricing
-> plans-pricing-feature-shop-v7-11-3-test.html

Permissions Inspector
-> permissions-matrix-user-management-v7-11-4-test.html
```

Rules:

- User Management Dashboard is protected owner/admin control work.
- Feature Shop / Pricing is preview-only. It has no payment provider, no billing, no upgrades and no entitlement writes.
- Permissions Inspector is read-only. It has no writes, no billing and no role changes.

## 6. Social lesson

Social pages are real working pages and must not be blind-patched.

Current Social group:

```text
Social Profile
-> profile-social-v7-13-001-test.html

Friends
-> friends-social-v7-13-001-test.html

News Feed
-> news-feed-social-v7-13-001-test.html

Groups and Events
-> groups-social-v7-13-001-test.html
```

Rules:

- Social Profile owns account/social/profile wall behavior.
- Friends owns friends/messages/likes behavior.
- News Feed owns post/comment/reaction/feed behavior.
- Groups owns groups/events/posts behavior.
- Form Inbox should be moved/renamed into Social later only after a separate controlled pass.

## 7. Admin lesson

Admin pages mostly exist as command, readiness, registry, health, Mux, storage-prep and backup proof/support surfaces. They are not all emergency writers.

Admin group scan passed with no broad patch needed.

Current Admin routes:

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

Rules:

- Do not rewrite Admin proof pages just to update version labels.
- Storage Prep remains controlled and scoped.
- Registry/Live Readiness/Health/Checklist are proof surfaces.

## 8. Route cleanup rule

Never delete an old page only because it is old.

Use this rule:

```text
Old link found
-> decide whether it is normal user navigation or diagnostic/support evidence
-> normal user navigation uses current canonical route
-> diagnostic/support can keep old witness route if useful
-> patch only if user confusion or broken flow is proven
-> verify by direct GitHub fetch and browser smoke test
```

## 9. Protected boundaries

No future pass may touch these without explicit separate approval:

```text
SQL
RLS
Storage policy
Payment provider
DNS automation
Production Home replacement
Player/audio/accessibility comfort
Service-role logic
Global Supabase secrets
Main App/Web Builder shell merge
```

Publishable Supabase config must remain config-only and must not be copied into docs or exposed as a secret.

## 10. Current final-scan decision

```text
FINAL SCAN PASS COMPLETE.
MANIFEST UPDATED.
WEB BUILDER MAP UPDATED.
MASTER PLAN UPDATED.
FIX MEMORY UPDATED.
WHAT CHANGED UPDATED.
NEXT WORK MUST START FROM THESE DOCS, NOT FROM OLD MENU CONFUSION.
```
