# Web Builder Manifest V7.12.265.3

## Purpose

This manifest tracks the Web Builder as a separate mini app/product area inside Stream Bandit.

The Stream Bandit manifest remains for the movie app. This file is for Web Builder only.

## Massive checkpoint status

Status: RECORDED / WEB BUILDER CORE BLOCKERS COMPLETE FOR CURRENT CONTROLLED PROMOTION CANDIDATE / WEB BUILDER ACCESS GATE AND PERSONAL WORKSPACE SCOPE PASSED / STUDIO ENGINE ROLLBACK CHECKPOINT RECORDED.

This checkpoint records the work completed across the Web Builder Supabase page flow, owned preview, inline published forms, shared Web Builder tabs, global Web Builder search, Pages Manager jump search, Menu Builder slim tabs, Menu Builder edit overlay, Menu Builder jump search, guarded Supabase page delete, image upload form fields, empty published preview block guards, Web Builder-only protected access gate, no-admin-bypass correction, Pages Manager personal owner scope, and the Studio helper rollback/engine loader repair.

No live `index.html` promotion was done. No main Stream Bandit shell rewrite was done. No schema/storage table change was done in these page passes.

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
- Public/published preview hides empty placeholder blocks and only shows real configured content.

## Core add/remove rule

- Anything that can be added/created must have a simple remove/delete path.
- Delete/remove must be guarded and clearly scoped.
- Landing/home guard remains protected until a real replacement-home flow exists.
- No delete action may silently remove files, routes, rows, or current app pages.
- Pages Manager can delete a selected non-protected `sb_site_pages` row only from the platform-owner flow, after exact slug confirmation and readback verification.
- Creator Growth / Web Builder users can create and save their own `owner_id` rows only; they must not see or manage another user's personal Web Builder rows.

## Current verified Web Builder flow

Normal route flow:

1. Web Builder Hub opens through the Web Builder-only protected gate.
2. Pages Manager creates, saves and finds page rows inside the correct owner scope.
3. Platform owner can see all `sb_site_pages` rows; creator/build users see only rows where `owner_id` matches their signed-in user id.
4. Web Builder / Publish opens `overlay-route-truth-machine-v7-12-66-test.html?page=<slug>`.
5. Published Preview opens `web-builder-preview-owned-v7-12-257-test.html?page=<slug>`.
6. Menu Builder controls the published menu via `sb_site_pages.settings_json`.
7. Published forms submit inline on the published page and are read from the Web Builder-owned inbox.
8. Web Builder shared tabs keep the owned page group connected.
9. Web Builder global search searches owned tools/routes and Supabase `sb_site_pages` by title, slug and status.

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
- `V7.12.264.10 Published Preview empty side menus auto-expand` - PASS.
- `V7.12.264.11 Global Web Builder search in shared header` - PASS.
- `V7.12.264.12 Pages Manager jump search` - PASS.
- `V7.12.264.13 Menu Builder jump search` - PASS.
- `V7.12.264.14 Pages Manager guarded Supabase delete` - PASS.
- `V7.12.264.15 Form Designer image uploads + compact overlay` - PASS.
- `V7.12.264.16 Published Preview empty block guard + form submit to owned inbox verification` - PASS.
- `V7.12.265 Web Builder Protected Page Gate` - PASS.
- `V7.12.265.1 Web Builder Protected Gate / No Admin Bypass` - PASS.
- `V7.12.264.15 Pages Manager Personal Workspace Scope` - PASS.
- `V7.12.116.4 Studio helper engine loader repair rollback checkpoint` - PASS.

## Latest verified pass - V7.12.265.3 Studio helper rollback checkpoint

User-tested result:

- The bad helper experiment was correctly identified as the cause of the broken Studio route - PASS.
- `web-builder-live-studio-v7-12-116.js` was rebuilt as `V7.12.116.4 Web Builder Studio engine loader repair` - PASS.
- The helper again loads the real `web-builder-live-studio-v7-12-106.js` engine - PASS.
- The Studio page rebuilt and the Web Builder engine mounted again - PASS.
- The helper no longer uses the unsafe Supabase `createClient` proxy/global query patch experiment - PASS.
- The helper keeps only safe runtime repairs: same-window links, publish notice, save verification, and page selector - PASS.
- No `index.html` promotion - PASS.
- No current app registry promotion - PASS.
- No Stream Bandit shell rewrite - PASS.
- No schema change - PASS.
- No storage change - PASS.
- No RLS change - PASS.

Files touched in this rollback checkpoint:

- `web-builder-live-studio-v7-12-116.js`
- `WEB-BUILDER-MANIFEST-V7-12-252.md`

Important lesson locked:

- Do not patch global Supabase client behavior from the Studio helper.
- Do not force personal workspace scoping inside the Studio engine helper until the route is redesigned cleanly.
- Keep the Studio helper as an engine loader/repair helper only.
- Apply Web Builder access locks at the page level first, using the proven Pages Manager pattern.

## Previous verified pass - V7.12.265.2 Web Builder access gate + Pages Manager owner scope

User-tested result:

- Web Builder Hub now loads the Web Builder-only protected gate and still keeps Web Builder chrome/projector isolated from the Stream Bandit app shell - PASS.
- Pages Manager now loads the Web Builder-only protected gate before the Web Builder projector - PASS.
- `web-builder-protected-page-v7-12-265.js` has been tightened so `role = admin` alone does not automatically unlock another user's personal Web Builder - PASS.
- Creator Growth users remain allowed into Web Builder starter access when active and permitted by plan/permissions - PASS.
- Pages Manager now scopes `sb_site_pages` reads by owner id for non-platform-owner users - PASS.
- Platform owner can see all Web Builder page rows - PASS.
- Creator Growth / non-platform-owner users see only rows where `owner_id` matches their own signed-in user id - PASS.
- Save writes `owner_id` to the signed-in user's id for personal workspace users - PASS.
- Delete remains locked to the platform-owner path and keeps landing/home protected - PASS.
- No Stream Bandit app shell appears inside Web Builder - PASS.
- No `index.html` promotion - PASS.
- No current app registry promotion - PASS.
- No schema change - PASS.
- No storage change - PASS.
- No RLS change - PASS.

Files touched in this access/scope pass:

- `web-builder-protected-page-v7-12-265.js`
- `web-builder-account-control-hub-v7-12-263-test.html`
- `web-builder-pages-manager-owned-v7-12-256-test.html`
- `WEB-BUILDER-MANIFEST-V7-12-252.md`

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
- Page ownership is scoped by `owner_id` in the passed Pages Manager flow.
- Platform owner can view/manage all rows in the Pages Manager.
- Creator Growth / builder users can view/save only their own `owner_id` rows in the Pages Manager.
- Page layout lives in `layout_json`.
- Menu settings live in `settings_json`.
- Form submissions live in `sb_form_submissions`.
- Form upload images use Storage bucket `stream-bandit-images`.

Do not claim public anonymous production readiness until the RLS/policy pass is verified after deploy.

## Seven-step live-promotion plan now locked

1. Finish Web Builder core blockers - COMPLETE FOR CURRENT CONTROLLED CANDIDATE.
   - Pages Manager real guarded delete - PASS.
   - Empty preview blocks hidden - PASS.
   - Form submit -> owned inbox - PASS.
   - Web Builder protected gate - PASS.
   - Pages Manager personal owner scope - PASS.
   - Studio helper rollback / engine loader repair - PASS.
2. Build real Owner Admin Hub - COMPLETE FOR CURRENT ACCESS CONTROL BASE.
   - `user-management-dashboard-v7-11-2-test.html` upgraded to real owner control room.
   - Owner can manage account status, role, admin level, plan, permissions JSON and notes through the approved RPC.
   - User Management controls Web Builder access through `account_status`, `plan_key`, `permissions_json`, `admin_level` and `role`.
   - No toy wording in the live admin hub.
3. Add safe admin/account schema - COMPLETE FOR CURRENT ACCESS CONTROL BASE.
   - `account_status`: active / limited / restricted / banned / review.
   - admin level or role guard.
   - `permissions_json`.
   - `plan_key`.
   - admin notes / managed by / managed at.
   - audit log table / audit trail through the owner-safe RPC flow.
4. Harden Supabase policies.
   - Normal users cannot self-upgrade role.
   - Normal users cannot unban/unlimit themselves.
   - Owner/admin can manage users only through approved owner-safe rules.
   - Public visitors can only do approved public actions.
   - Web Builder `sb_site_pages` owner scope should be backed by RLS/policies before production claim.
5. Connect Permissions Matrix to real controls.
   - `permissions-matrix-user-management-v7-11-4-test.html` remains the rulebook.
   - Admin Hub applies the rulebook.
   - Pricing page remains research/draft until billing exists.
6. Whole app polish scan.
   - Stream Bandit pages, not just Web Builder.
   - Headers, footers, search, routes, duplicate buttons, old stale wording.
   - Mobile layout and deaf/accessibility/player-comfort checks.
7. Final smoke test before promotion.
   - Owner login.
   - Normal user login.
   - Creator Growth / Web Builder starter user test.
   - Banned/limited user test.
   - Web Builder route flow.
   - Personal workspace owner-scope test.
   - Public preview/form test.
   - Main Stream Bandit watch/search/browse test.
   - Backups/manifest/control map updated.

## Current next target

- `overlay-route-truth-machine-v7-12-66-test.html?page=landing`

Reason:

- The Studio engine now mounts again after the helper rollback/repair.
- Next, fix the actual Web Builder page lock on the Studio route using the proven old checkpoint pattern from Pages Manager.
- Do not put ownership/proxy logic into `web-builder-live-studio-v7-12-116.js` again.
- Continue one Web Builder page at a time.

## Safety locks

- `index.html` promotion: false.
- current app registry promotion: false.
- Stream Bandit app branding changes: false.
- Stream Bandit app shell changes: false.
- separate Web Builder account system: false for now.
- main Stream Bandit Auth/admin session remains the Web Builder admin owner for now.
- frontend service-role secrets: false.
- unsafe user creation: false.
- unsafe user delete: false.
- schema change without approval: false.
- storage change without approval: false.
- admin role alone unlocks personal Web Builder: false.
- personal Web Builder rows visible to other non-owner users through Pages Manager: false.
- creator_growth personal Web Builder access: true.
- Pages Manager personal `owner_id` scope: true.
- Studio helper Supabase proxy patching: false.
- Studio helper is engine loader only: true.
