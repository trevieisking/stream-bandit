# Stream Bandit / Web Builder Massive Checkpoint - V7.12.264.13

Date: 2026-06-10

## Status

RECORDED / MASSIVE WEB BUILDER CORE CHECKPOINT PASSED.

This file overwrites the older safe page promotion checkpoint with the current truth after the Web Builder Supabase flow, owned preview, inline published forms, shared Web Builder tabs, Web Builder global search, Pages Manager jump search and Menu Builder jump search passes.

This is not a live `index.html` promotion. This is a checkpoint so we do not backtrack.

## Current stable rule

- Web Builder is now treated as its own builder area inside Stream Bandit.
- Stream Bandit app shell, branding, favicon and movie pages remain separate.
- Web Builder pages use Web Builder projector tabs/search.
- Back is the only Stream Bandit route in the Web Builder shared tab group.
- Inputs belong in overlays.
- Outputs belong on clean page views.
- Search should either globally find routes/pages or locally pinpoint/scroll to an item without hiding the list when the user asks for a jump search.

## Current Web Builder route flow

1. Hub: `web-builder-account-control-hub-v7-12-263-test.html`
2. Pages: `web-builder-pages-manager-owned-v7-12-256-test.html`
3. Web Builder / Publish: `overlay-route-truth-machine-v7-12-66-test.html?page=<slug>`
4. Preview: `web-builder-preview-owned-v7-12-257-test.html?page=<slug>`
5. Menu: `web-builder-menu-builder-owned-v7-12-264-test.html`
6. Form: `web-builder-form-designer-owned-v7-12-258-test.html?page=<slug>`
7. Inbox: `web-builder-form-inbox-owned-v7-12-258-test.html?page=<slug>`
8. Back: `settings-platform-control-hub-v7-12-85-test.html`

## Passed Web Builder features in this checkpoint

- Pages Manager reads `sb_site_pages`.
- Pages Manager can save/create selected slug to `sb_site_pages`.
- Pages Manager verifies saved row by readback.
- Pages Manager has jump search that scrolls to a page card.
- Web Builder / Publish route is the current builder path.
- Published Preview reads the Supabase page slug.
- Published Preview renders saved layout blocks.
- Published Preview renders menu rows from `sb_site_pages.settings_json`.
- Published Preview promotes hero block into the big top hero area.
- Published Preview submits published forms inline.
- Published Preview no longer needs a user-facing admin form route.
- Published Preview hides empty left/right menu columns and expands content.
- Shared Web Builder tabs are global for Web Builder pages that load the projector.
- Global Web Builder search finds Web Builder tools/routes and Supabase pages.
- Menu Builder uses single slim tabs.
- Menu Builder inputs open in Edit overlay.
- Menu Builder jump search scrolls to the target menu tab.
- Menu Builder saves menu settings into `settings_json`.
- Owned Inbox route is reachable from Web Builder shared tabs.

## User-tested passes recorded today

- Global Web Builder search - PASS.
- Pages Manager jump search - PASS.
- Menu Builder single slim tabs - PASS.
- Menu Builder Edit overlay input rule - PASS.
- Menu Builder jump search - PASS.
- Published Preview hero promotion - PASS.
- Published Preview inline forms - PASS.
- Web Builder Inbox tab opens the owned inbox route - PASS.

## Current Supabase tables in active use

- `sb_site_pages`
- `sb_form_submissions`
- `sb_profiles`

## Current Web Builder storage model

- Pages: `sb_site_pages`
- Page blocks/layout: `sb_site_pages.layout_json`
- Page/menu settings: `sb_site_pages.settings_json`
- Form submissions: `sb_form_submissions`
- Main account/admin profile: `sb_profiles`

## Seven-step live-promotion plan now locked

1. Finish Web Builder core blockers.
   - Pages Manager real guarded delete.
   - Verify empty preview blocks are hidden.
   - Verify form submit -> owned inbox.

2. Build real Owner Admin Hub.
   - Upgrade `user-management-dashboard-v7-11-2-test.html`.
   - Owner can view users, restrict, limit, ban, unban, grant/remove admin.
   - No toy wording in the live admin hub.

3. Add safe admin/account schema.
   - `account_status`: active / limited / restricted / banned / review.
   - admin level or role guard.
   - `permissions_json`.
   - `plan_key`.
   - admin notes / managed by / managed at.
   - audit log table or audit JSON trail.

4. Harden Supabase policies.
   - Normal users cannot self-upgrade role.
   - Normal users cannot unban/unlimit themselves.
   - Owner/admin can manage users only through approved owner-safe rules.
   - Public visitors can only do approved public actions.

5. Connect Permissions Matrix to real controls.
   - `permissions-matrix-user-management-v7-11-4-test.html` becomes the rulebook.
   - Admin Hub applies the rulebook.
   - Pricing page remains research/draft until billing exists.

6. Whole app polish scan.
   - Stream Bandit pages, not just Web Builder.
   - Headers, footers, search, routes, duplicate buttons, old stale wording.
   - Mobile layout and deaf/accessibility/player-comfort checks.

7. Final smoke test before promotion.
   - Owner login.
   - Normal user login.
   - Banned/limited user test.
   - Web Builder route flow.
   - Public preview/form test.
   - Main Stream Bandit watch/search/browse test.
   - Backups/manifest/control map updated.

## Current next target

Next target remains:

- `web-builder-pages-manager-owned-v7-12-256-test.html`

Reason:

- Pages Manager still needs a real guarded delete function.
- The delete must be admin-only, confirmation-overlay based, and scoped to a selected `sb_site_pages` row only.
- Landing/home protection remains locked.
- No file delete.
- No route delete.
- No schema/storage change.

After Pages Manager delete passes, move to:

- `user-management-dashboard-v7-11-2-test.html`

Reason:

- The Admin Hub must become the real owner control room before live promotion.
- It must not remain a toy/planner page.
- It must control user access safely with owner-only rules and Supabase policy hardening.

## Safety locks

- `index.html` promotion: false.
- active app route registry promotion: false.
- Stream Bandit app shell changes: false.
- Stream Bandit app branding changes: false.
- frontend service-role secrets: false.
- unsafe user creation: false.
- unsafe user delete: false.
- schema change without approval: false.
- storage change without approval: false.

## Do not backtrack

Do not return Web Builder menu/page controls to large input-card rows.
Do not put menu inputs back directly on the output list.
Do not replace jump search with list filtering where the user asked for pinpoint scroll.
Do not send published users to admin form routes.
Do not mix Stream Bandit app theme projector with Web Builder projector.
