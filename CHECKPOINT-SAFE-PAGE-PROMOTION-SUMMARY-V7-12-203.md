# Stream Bandit Checkpoint — Safe Page Promotion Summary V7.12.203

Date: 2026-06-03

## Status

RECORDED / SAFE PAGES PROMOTED BY CONTENT STATE.

No route URLs were changed. The active menu/footer already point to these stable filenames. Promotion here means the current contents of these stable route files are now the accepted clean passed versions.

## Current route baseline

- Registry baseline: `V7.12.189 Current Routes Registry / 53 Active Entries / 50 Unique URLs`
- Active overlay entries: 53
- Unique URLs: 50
- Latest known route result: 50/50 routes loaded
- Latest known protected-file result: 16/16 protected files loaded

## Passed safe pages in this run

### Live Readiness

- Route: `live-readiness-global-helpers-v7-10-2-test.html`
- Current internal state: V7.12.196
- Status: PASS
- Purpose: shell/search/count foundation proof

### Supabase saved-content routes

- Backup table created: `sb_site_pages_route_backup_v7_12_197`
- Status: PASS
- Purpose: corrected stale route strings inside `sb_site_pages.layout_json` and `settings_json`
- Tested: Web Builder test-page, Published Preview, saved block buttons, Open Form, Form Inbox, home-page preview

### One Machine

- Route: `stream-bandit-one-machine-v7-12-73-test.html`
- Current internal state: V7.12.198
- Status: PASS
- Purpose: read-only route/ownership truth page
- Confirmed: 50/50 route scan, 16/16 protected-file witness list

### Final Shell Navigation

- Route: `stream-bandit-global-helper-shell-v7-12-126-test.html`
- Current internal state: V7.12.200
- Status: PASS
- Purpose: final shell/navigation proof page
- Confirmed: helper stack 7/7, saved counters restored, route proof 12/12, footer once

### Permissions Matrix

- Route: `permissions-matrix-user-management-v7-11-4-test.html`
- Current internal state: V7.12.202
- Status: PASS
- Purpose: researched role/plan/feature rule map
- Important correction: V7.12.201 was too simplified; V7.12.202 restored the research/deep comparison content while preserving current shell/route/helper flow
- Confirmed: no writes, no billing, no schema changes, no policy changes, no live promotion

### Pricing Feature Shop

- Route: `plans-pricing-feature-shop-v7-11-3-test.html`
- Current internal state: V7.12.203
- Status: PASS
- Purpose: researched pricing/add-on/bundle strategy page
- Preserved: 8-plan ladder, 24 add-ons, Bundle Builder, Feature Matrix, User Entitlements, safety/locked buttons
- Confirmed: no checkout, no billing writes, no Supabase writes, no schema changes, no policy changes, no live promotion

## Stable route rule

Many routes keep older filenames while the internal page version moves forward. This is intentional. The overlay/footer route URL is the stable route truth. The page badge/version inside the file records the current content state.

## What was not promoted

The following remain preservation-first and were not refit in this safe-page run:

- Web Builder
- Pages Manager
- Form Inbox
- Advanced Form
- Movie Row Editor / Supabase Library Editor
- Player 2
- Profile Settings
- Policy Admin publish logic

## Current next direction

Next target: `user-management-dashboard-v7-11-2-test.html`

Reason:

- It is the remaining User Management companion page.
- It already has current live controls around `sb_profiles.role` and `sb_profiles.can_submit`.
- It should become a functional testing dashboard, more like Pricing Feature Shop, while staying safe.

## User Dashboard next requirements

Desired direction:

- Keep Header Shell + Page Content + Footer Shell + Theme Projector.
- Preserve current working profile/can_submit logic.
- Make it more useful for testing.
- Add a safe manual test-user/profile planning flow if possible.
- Do not pretend the frontend can safely create real Supabase Auth users.
- No service-role secrets in frontend.
- No unsafe delete user action.
- Remove/delete should remain disabled or become a local/archive-style test action only until backend/admin support exists.

## Important Auth clarification

A frontend page using the public Supabase anon key should not create real Supabase Auth users on behalf of admin. Real user creation by email requires one of these safe paths:

1. the user signs up/logs in normally through Supabase Auth, then a profile row is created/managed;
2. an owner/admin backend or Supabase Edge Function using service-role permissions creates/invites the user safely;
3. a manual testing row is created as a planned/invite/profile placeholder, clearly not a real login account.

## Safety pledge for next page

Before editing User Dashboard:

- scan the current file,
- identify actual Supabase writes,
- preserve working role/can_submit logic,
- do one page only,
- no broad patching,
- no real delete user unless backend/RLS is proven safe,
- no billing/plan writes yet.
