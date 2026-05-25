# Stream Bandit Protected Menu Overlay Manifest V7.12.46

Date: 2026-05-25

Purpose: Trevor supplied the current menu overlay screenshots. This manifest protects every visible menu page group from cleanup/archive/delete work.

Hard cleanup rule:

- Every page/group below is KEEP unless a later human-reviewed checkpoint explicitly replaces it.
- These are not archive candidates.
- These groups passed or are current menu/runtime pages.
- Extra pages reached from these pages must also be kept until the Runtime Keep Board and Route Graph prove otherwise.
- Do not delete hidden child pages just because they are not shown directly in the menu overlay.

## Watch group — 9

Visible menu items:

1. Home
2. Details
3. Player 1
4. Continue Watching
5. Watch History
6. Watchlist
7. Favourites
8. Liked
9. Accessibility

Keep intention:

- Core viewing flow.
- Details/Player/Continue/History/save-state pages.
- Accessibility and louder/player-comfort work must stay protected.

## Creator group — 3

Visible menu items:

1. Submit Video
2. Rules
3. Review Queue

Keep intention:

- Creator submission flow.
- Creator rules and moderation queue.
- Child pages connected from Submit Video or Review Queue are protected until separately reviewed.

## Settings group — 8

Visible menu items:

1. Settings
2. Settings Studio
3. Profile Settings
4. Web Builder
5. Clean Machine Menu
6. Route Guard Proof
7. Route Pointer Machine
8. Final Shell Navigation

Keep intention:

- Global settings, profile settings, web builder and route safety pages.
- Route guard/pointer/final shell are cleanup-critical pages and must not be removed.
- Settings Studio alias currently points safely to the Settings Hub while full Settings Studio is reviewed.

## Admin group — 9

Visible menu items:

1. Admin Centre
2. Live Readiness
3. All Pages Version Registry
4. Test Checklist
5. Tools Page
6. Health Check
7. Mux Manager
8. Storage Prep
9. Backup / Safety

Keep intention:

- Admin testing and readiness pages.
- Mux and storage setup pages.
- Backup/Safety pages must stay available before any cleanup.

## User Management group — 3

Visible menu items:

1. User Dashboard Concept
2. Fair Pricing Matrix
3. Permissions Matrix

Keep intention:

- User/account/pricing/permission planning pages.
- Keep for platform control and future user-management work.

## Policy group — 3

Visible menu items:

1. Policy & FAQ Centre
2. Policy Admin Editor
3. Published Policy Proof

Keep intention:

- Policy admin/edit/proof/public reader flow.
- Policy child pages and published readers are protected.

## Owner group — 5

Visible menu items:

1. One Machine
2. Platform Control Centre
3. Brand / App Icons
4. Brand Image Helper
5. Favicon / App Icon Builder

Keep intention:

- Owner-only control and branding pages.
- Brand/icon/helper pages are part of current global identity work.
- Do not remove brand/icon pages while logo/favicon references are still being fixed.

## Total visible menu items from supplied overlay screenshots

- Watch: 9
- Creator: 3
- Settings: 8
- Admin: 9
- User Management: 3
- Policy: 3
- Owner: 5

Visible total: 40 menu items.

Important note:

This is not the full app count. The full keep count is higher because many visible pages open or depend on child pages, helper scripts, global route bridges, policy readers, admin tools, player/detail routes, and support pages. The Runtime Keep Board V7.12.41 counted hundreds of runtime keep files/pages. This menu manifest is only the visible overlay protection list.

Current working numbers after safe alias pass:

- Runtime Keep Board after fixes showed:
  - Repo files: 948
  - HTML pages: 597
  - Runtime keep: 383
  - Keep pages: 359
  - Docs/history: 209
  - Review: 353
  - Missing strong refs: 22

Cleanup action rule from this manifest:

1. Keep all menu overlay groups.
2. Keep pages reached from these menu pages unless the runtime graph says otherwise and Trevor approves.
3. Fix missing strong refs first.
4. Rerun verification after small fix batches.
5. Do not delete Review candidates yet.
