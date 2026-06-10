# Web Builder Manifest V7.12.264.13

## Purpose

This manifest tracks the Web Builder as a separate mini app/product area inside Stream Bandit.

The Stream Bandit manifest remains for the movie app. This file is for Web Builder only.

## Massive checkpoint status

Status: RECORDED / PASSED FOR CURRENT WEB BUILDER CORE FLOW.

This checkpoint records the work completed across the Web Builder Supabase page flow, owned preview, inline published forms, shared Web Builder tabs, global Web Builder search, Pages Manager jump search, Menu Builder slim tabs, Menu Builder edit overlay, and Menu Builder jump search.

No live `index.html` promotion was done. No main Stream Bandit shell rewrite was done. No storage schema was changed in these page passes.

## Current doorway rule

One thing at a time:

- Web Builder is tracked here first, under the Web Builder manifest.
- Web Builder is not promoted as the main app manifest yet.
- Stream Bandit app branding remains Stream Bandit branding.
- Web Builder branding/avatar/projector/tabs/search take over only after entering Web Builder pages.
- Main app promotion is limited to one clean doorway when approved.

Approved doorway model:

- One way in: Stream Bandit menu -> Web Builder -> `web-builder-account-control-hub-v7-12-263-test.html`.
- One way out: Web Builder -> `Back` to Stream Bandit.
- Every Web Builder page that loads the projector should show the same Web Builder tabs.
- Every Web Builder page that loads the projector should get Web Builder-only global search.
- Old per-page duplicate route buttons should be removed or hidden as pages are cleaned.

Not promoted yet:

- `index.html`
- current app registry menu structure
- main app branding
- footer shell
- full Stream Bandit app manifest

## Core polish rule

- Inputs live in clean overlays.
- Outputs display on clean page views.
- Builder/editor controls should not be scattered through visitor previews or output dashboards.
- Page views should show results, previews, cards, route maps, reports, inbox output, menus and asset libraries.
- Page-specific searches should pinpoint and scroll to the target item rather than hiding the rest of the list when the user wants a jump search.

## Core add/remove rule

- Anything that can be added/created must have a simple remove/delete path.
- Delete/remove must be guarded and clearly scoped.
- Landing/home guard remains protected until a real replacement-home flow exists.
- No delete action may silently remove files, routes, rows, or current app pages.
- Soft remove/archive is acceptable where hard delete is not yet approved.

## Current verified Web Builder flow

Normal route flow:

1. Pages Manager creates or saves a slug.
2. Web Builder / Publish opens `overlay-route-truth-machine-v7-12-66-test.html?page=<slug>`.
3. Published Preview opens `web-builder-preview-owned-v7-12-257-test.html?page=<slug>`.
4. Menu Builder controls the published menu via `sb_site_pages.settings_json`.
5. Published forms submit inline on the published page and are read from the Web Builder-owned inbox.
6. Web Builder shared tabs keep the owned page group connected.
7. Web Builder global search searches owned tools/routes and Supabase `sb_site_pages` by title, slug and status.

Current Web Builder shared tabs:

- `Back` -> `settings-platform-control-hub-v7-12-85-test.html`
- `Hub` -> `web-builder-account-control-hub-v7-12-263-test.html`
- `Pages` -> `web-builder-pages-manager-owned-v7-12-256-test.html`
- `Web Builder` -> `overlay-route-truth-machine-v7-12-66-test.html?page=<slug>`
- `Preview` -> `web-builder-preview-owned-v7-12-257-test.html?page=<slug>`
- `Menu` -> `web-builder-menu-builder-owned-v7-12-264-test.html`
- `Form` -> `web-builder-form-designer-owned-v7-12-258-test.html?page=<slug>`
- `Inbox` -> `web-builder-form-inbox-owned-v7-12-258-test.html?page=<slug>`

## Current passed checkpoints

- `V7.12.250 Web Builder Studio Theme Brand Font Planner` - PASS.
- `V7.12.251 Web Builder Asset Media Planner` - PASS.
- `V7.12.252 Canonical Web Builder URLs` - PASS.
- `V7.12.253 Web Builder Control Map` - PASS.
- `V7.12.254.1 Web Builder Header/Footer Code Tool + Slug Launcher` - PASS.
- `V7.12.255 Web Builder Pages Source Map` - PASS.
- `V7.12.256 Web Builder-owned Pages Manager Planner` - PASS.
- `V7.12.257.4 Web Builder-owned Full Page Preview / Forms + Ratings` - PASS.
- `V7.12.258.3 Advanced Form Builder Focus Fix` - PASS.
- `V7.12.259.1 Owned Form Inbox Routing View + Card Overflow Fix` - PASS.
- `V7.12.260 Web Builder Media / Asset Manager Upload + Delete Pair` - PASS.
- `V7.12.261.2 Form Destination Chooser + Mail Draft Prefill Fix` - PASS.
- `V7.12.262.1 Asset Manager Input Overlay / Output Page Polish` - PASS.
- `V7.12.262.3 Pages Manager Add/Remove Pair` - PASS.
- `V7.12.262.4 Owned Pages Manager Preview Route + Landing Guard` - PASS.
- `V7.12.262.6 Owned Form Inbox Soft Remove Action` - PASS.
- `V7.12.263 Web Builder Projector Connection Rollout` - PASS.
- `V7.12.263 Real Studio Shell Projector Connection` - PASS.
- `V7.12.264.1 Pages Manager slug persistence into sb_site_pages` - PASS.
- `V7.12.264.2 Published Preview menu render + stale route cleanup` - PASS.
- `V7.12.264.3 Published Preview hero block promotion` - PASS.
- `V7.12.264.4 Published Preview inline form submissions` - PASS.
- `V7.12.264.5 Shared Web Builder header tabs` - PASS.
- `V7.12.264.9 Menu Builder single slim tabs + edit overlay inputs` - PASS.
- `V7.12.264.10 Published Preview empty side menus auto-expand` - PASS/PENDING USER FINAL VISUAL CHECK.
- `V7.12.264.11 Global Web Builder search in shared header` - PASS.
- `V7.12.264.12 Pages Manager jump search` - PASS.
- `V7.12.264.13 Menu Builder jump search` - PASS.

## Latest verified pass - V7.12.264.13 Search + Findability

User-tested result:

- Global Web Builder search appears in the shared header - PASS.
- Global Web Builder search can find tools/routes/pages - PASS.
- Pages Manager jump search finds a page by title or slug - PASS.
- Pages Manager jump search scrolls to the page card without hiding the list - PASS.
- Menu Builder shows single slim tabs - PASS.
- Menu Builder edit controls open in overlay - PASS.
- Menu Builder inputs are not displayed directly on the output row - PASS.
- Menu Builder jump search finds a menu page by title or slug - PASS.
- Menu Builder jump search scrolls to the matching slim tab without hiding the list - PASS.

## Current route set

Canonical/current Web Builder routes:

- `web-builder-account-control-hub-v7-12-263-test.html`
- `web-builder-pages-manager-owned-v7-12-256-test.html`
- `overlay-route-truth-machine-v7-12-66-test.html?page=landing`
- `web-builder-preview-owned-v7-12-257-test.html?page=landing`
- `web-builder-menu-builder-owned-v7-12-264-test.html`
- `web-builder-form-designer-owned-v7-12-258-test.html?page=landing`
- `web-builder-form-inbox-owned-v7-12-258-test.html?page=landing`
- `web-builder-assets-v7-12-252-test.html`
- `web-builder-route-map-v7-12-252-test.html`
- `web-builder-control-map-v7-12-253-test.html`
- `web-builder-pages-source-map-v7-12-255-test.html`
- `web-builder-header-footer-code-v7-12-254-test.html`
- `WEB-BUILDER-MANIFEST-V7-12-252.md`

Old support/reference routes preserved, not current primary flow:

- `web-builder-pages-manager-v7-12-111-test.html`
- `web-builder-shared-style-preview-v7-12-117-test.html?page=test-page`
- `web-builder-form-save-v7-12-94-test.html?page=test-page`
- `web-builder-form-submissions-v7-12-94-test.html?page=test-page`

## Supabase state used by Web Builder

Existing tables in active use:

- `sb_site_pages`
- `sb_form_submissions`
- `sb_profiles`

Current page/menu/form storage:

- Page rows live in `sb_site_pages`.
- Page layout lives in `layout_json`.
- Menu settings live in `settings_json`.
- Form submissions live in `sb_form_submissions`.

Do not claim public anonymous production readiness until the RLS/policy pass is verified after deploy.

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

## Pending final visible fixes

- Add a guarded real delete function to `web-builder-pages-manager-owned-v7-12-256-test.html`.
- Verify empty preview blocks are hidden, not just side-menu boxes.
- Verify published form submission appears in owned inbox.
- Build real owner-only admin/account control hub.
- Harden Supabase account/public policies.
- Clean any remaining duplicate local route buttons where the shared Web Builder tabs are now present.

## Safety locks

- `index.html` promotion: false.
- current app registry promotion: false.
- Stream Bandit app branding changes: false.
- Stream Bandit app shell changes: false.
- schema changes in page files: false.
- storage changes in these page-route passes: false.
- separate Web Builder account system: false for now.
- main Stream Bandit Auth/admin session remains the Web Builder admin owner for now.
