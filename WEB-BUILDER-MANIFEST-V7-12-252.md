# Web Builder Manifest V7.12.299.1

## Purpose

This manifest tracks the Web Builder as a separate mini app/product area inside Stream Bandit.

The Stream Bandit manifest remains for the movie app. This file is for Web Builder only.

## Current checkpoint status

Status: RECORDED / WEB BUILDER OWNER WORKSPACE LOCK PASS MOSTLY COMPLETE / FORM DESIGNER SOLID STATE PASS / REAL APP INBOX BRIDGE PROBLEM RECORDED.

This checkpoint records the late-night pass where the Web Builder owner workspace lock was rolled across the main builder pages and the Form Designer was repaired to a solid-state overlay page. It also records the exact blocker still open: the real app-synced inbox route must remain the single inbox, but Web Builder Studio needs a clean overlay bridge to it, and the creator/Kayleigh access rule must not treat the inbox as platform-owner-only.

No live `index.html` promotion was done. No main Stream Bandit shell rewrite was done. No schema/storage table change was done in this pass.

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
- Web Builder Studio uses its own clean builder shell.
- The Stream Bandit app global footer/rail must not be injected into Web Builder Studio.
- The only intentional bridge between Web Builder and the Stream Bandit app is the form inbox/submission system.

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

## Verified owner-lock pass from current rollout

### Web Builder Hub

Route: `web-builder-account-control-hub-v7-12-263-test.html`

Result: PASS.

- Platform owner can enter and see the builder workspace.
- Creator Growth user can enter builder workspace.
- Creator users are directed to their own page rather than owner-only slugs.
- No schema changes.
- No storage changes.
- No index promotion.

### Canonical Studio handoff

Route: `web-builder-studio-v7-12-252-test.html`

Result: PASS.

- Preserves `?page=<slug>` and hands off to `overlay-route-truth-machine-v7-12-66-test.html?page=<slug>`.
- No engine rewrite.
- No index promotion.

### Route Map / Control Map / Pages Source Map / Header-Footer Code / Assets

Routes:

- `web-builder-route-map-v7-12-252-test.html`
- `web-builder-control-map-v7-12-253-test.html`
- `web-builder-pages-source-map-v7-12-255-test.html`
- `web-builder-header-footer-code-v7-12-254-test.html`
- `web-builder-assets-v7-12-252-test.html`

Result: PASS for owner-lock doorway behavior.

- Builder access gate added or preserved.
- No global app shell injection.
- No schema changes.
- No index promotion.
- Existing asset behavior remains existing-bucket-only.

### Owned Pages Manager

Route: `web-builder-pages-manager-owned-v7-12-256-test.html`

Result: PASS after no-sort-column repair.

Verified user debug:

- Trevor / platform owner: `workspace = platform-owner-all-rows`; page count 11; can see all rows.
- Kayleigh / Creator Growth: `workspace = personal-owner-id-only`; page count 2; can see and save only own rows.
- `sort_order` column is not required; sort order is stored in `settings_json`.
- `page_type` column is not required; page type is stored in `settings_json`.
- Admin role alone does not expose other user workspaces.
- Reserved slugs protected: `landing`, `home`, `home-page`.

### Owned Preview

Route: `web-builder-preview-owned-v7-12-257-test.html`

Result: PASS.

Verified user debug:

- Kayleigh / Creator Growth: `workspace = personal-owner-id-only`, requested `my-first-page`, owner matches current user, real preview opens.
- Trevor / platform owner: `workspace = platform-owner-any-workspace`, requested `landing`, can preview owner workspace.
- Creator users can only preview own rows.
- Platform owner can preview any workspace.
- No schema changes.
- No storage changes.

### Menu Builder

Route: `web-builder-menu-builder-owned-v7-12-264-test.html`

Result: PASS.

Verified user debug:

- Kayleigh / Creator Growth: can edit only own menu rows stored in `settings_json`.
- Trevor / platform owner: can edit all menu rows.
- `sort_order` column is not required.
- Menu data is stored in `settings_json`.
- Admin role alone does not expose workspaces.
- No schema changes.
- No storage changes.

### Form Designer

Route: `web-builder-form-designer-owned-v7-12-258-test.html`

Current version: `V7.12.263.17 Web Builder Form Designer Solid State Owner Lock`.

Result: PASS after solid-state repair.

Important repair history:

- A flattened Form Designer build accidentally removed the overlay inputs and put the page behind a hidden loading gate.
- That was corrected by restoring the overlay system and then changing the page to solid state.
- Solid state means the Form Designer shell renders immediately, then auth/owner checks run in the background.
- This prevents the permanent loading screen and mobile refresh-loop issue.

Verified Kayleigh result:

- `checked = true`
- `allowed = true`
- `signedIn = true`
- `email = mummykay1986@gmail.com`
- `workspace = personal-owner-id-only`
- `softRedirectApplied = true`
- `requestedSlug = my-first-page`
- `pageOwnerId = f6f6b76a-2021-4a5a-91dd-7b5db1f62a5f`
- `ownerMatchesCurrentUser = true`
- `creatorCanOnlyEditOwnPageForms = true`
- `overlaySystemRestored = true`
- `builderOverlayPreserved = true`
- `destinationOverlayPreserved = true`
- `fieldEditOverlayPreserved = true`
- `compactFieldRowsPreserved = true`
- `imageUploadFieldPreserved = true`
- `imageUploadExistingBucketOnly = true`
- Real Submit passed and wrote a row to `sb_form_submissions` for `my-first-page`.

Verified Trevor result:

- `checked = true`
- `allowed = true`
- `signedIn = true`
- `email = trevieisking@gmail.com`
- `workspace = platform-owner-any-workspace`
- `requestedSlug = landing`
- `pageOwnerId = af380be8-d1e2-4154-a5ed-a113c8271afd`
- `ownerMatchesCurrentUser = true`
- `platformOwnerCanEditAnyWorkspace = true`
- Real Submit passed and wrote a row to `sb_form_submissions` for `landing`.

Hard rules preserved:

- No schema changes.
- No bucket policy changes.
- Existing `stream-bandit-images` bucket only.
- No index promotion.
- No Stream Bandit shell rewrite.

## Exact current blocker to resume after sleep

### Blocker title

Web Builder Studio needs an app-synced inbox overlay bridge, but the real app inbox must remain the only inbox.

### User observation

The route `web-builder-form-submissions-v7-12-94-test.html?page=test-page` is the working inbox and already has the options the user wants:

- inbox/submissions
- private replies/messages
- sent/outbox
- spam
- trash
- CSV/export
- soft status actions
- real Supabase flows for `sb_form_submissions` and `sb_private_messages`

This route must not be replaced by a smaller owned inbox clone.

### Correct rule

- The real app inbox route is the single source of truth for inbox/submissions.
- Web Builder forms can submit to the shared app inbox tables.
- Web Builder Studio should open the real app inbox in an overlay or full page using the current slug.
- Web Builder must not rebuild a second smaller inbox as the primary flow.
- Web Builder must not inject the full Stream Bandit app footer/global rail into Studio.
- The only app sync bridge is inbox/form submissions.

### Exact stuck problem

The last attempted Studio overlay bridge code was not verified as successful. User reported:

- For Kayleigh, the decision/access on the inbox is not allowed because the inbox was treated as owner-only / placed in the owner group before the routes were organized.
- No inbox overlay appeared on the Studio page.
- The user wants this recorded before bed, not another risky code pass.

### Resume target

Scan and repair only these pieces next:

1. `overlay-route-truth-machine-v7-12-66-test.html`
   - Add/verify a safe builder-scoped Inbox button/overlay.
   - Overlay target must be `web-builder-form-submissions-v7-12-94-test.html?page=<current builder slug>`.
   - Do not touch `web-builder-live-studio-v7-12-116.js`.
   - Do not inject Stream Bandit app global footer.

2. `web-builder-form-submissions-v7-12-94-test.html`
   - Keep as the real app-synced inbox.
   - Do not replace it.
   - Verify Creator Growth / Kayleigh can view submissions for her own page slug and cannot view owner-only/private rows.
   - If it is owner-only, repair the gate/scope so Creator Growth with own `owner_id` page can access her own page inbox.
   - Preserve all app inbox options: inbox, replies/private messages, sent/outbox, spam, trash, CSV/export, soft status actions.

3. If `web-builder-form-inbox-owned-v7-12-258-test.html` exists or was added, treat it as non-primary or doorway only.
   - It must not replace the real app inbox route.

### Do not touch next time unless explicitly approved

- `index.html`
- app registry/menu promotion
- Supabase schema/RLS/storage policies
- `web-builder-live-studio-v7-12-116.js`
- `web-builder-protected-page-v7-12-265.js` unless specifically scanning the access decision
- Stream Bandit global footer shell as a direct Studio injection

## Current route set

Canonical/current Web Builder routes:

- `web-builder-account-control-hub-v7-12-263-test.html`
- `web-builder-pages-manager-owned-v7-12-256-test.html`
- `overlay-route-truth-machine-v7-12-66-test.html?page=<slug>`
- `web-builder-preview-owned-v7-12-257-test.html?page=<slug>`
- `web-builder-menu-builder-owned-v7-12-264-test.html`
- `web-builder-form-designer-owned-v7-12-258-test.html?page=<slug>`
- `web-builder-assets-v7-12-252-test.html`
- `web-builder-route-map-v7-12-252-test.html`
- `web-builder-control-map-v7-12-253-test.html`
- `web-builder-pages-source-map-v7-12-255-test.html`
- `web-builder-header-footer-code-v7-12-254-test.html`
- `WEB-BUILDER-MANIFEST-V7-12-252.md`

Real app-synced inbox route to preserve:

- `web-builder-form-submissions-v7-12-94-test.html?page=<slug>`

Old support/reference routes preserved, not current primary flow:

- `web-builder-pages-manager-v7-12-111-test.html`
- `web-builder-shared-style-preview-v7-12-117-test.html?page=test-page`
- `web-builder-form-save-v7-12-94-test.html?page=test-page`

## Supabase state used by Web Builder

Existing tables in active use:

- `sb_site_pages`
- `sb_form_submissions`
- `sb_private_messages`
- `sb_profiles`

Current page/menu/form storage:

- Page rows live in `sb_site_pages`.
- Page ownership is scoped by `owner_id`.
- Platform owner can view/manage all rows in owner-approved flows.
- Creator Growth / builder users can view/save only their own `owner_id` rows.
- Page layout lives in `layout_json`.
- Menu and form builder metadata live in `settings_json`.
- Form submissions live in `sb_form_submissions`.
- Private replies/messages live in `sb_private_messages`.

## Current passed checkpoints retained from earlier manifest

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

## Lessons locked

- Do not patch global Supabase client behavior from the Studio helper.
- Do not force personal workspace scoping inside the Studio engine helper until the route is redesigned cleanly.
- Keep the Studio helper as an engine loader/repair helper only.
- Apply Web Builder access locks at the page level first, using the proven Pages Manager pattern.
- Do not rebuild a working app page just because it is being opened from Web Builder.
- The real app inbox is working; preserve it and bridge to it.
