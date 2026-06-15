# Web Builder Manifest V7.12.299.7

## Purpose

This manifest tracks the Web Builder as a separate mini app/product area inside Stream Bandit.

The Stream Bandit manifest remains for the movie app. This file is for Web Builder only.

## Current checkpoint status

Status: RECORDED / WEB BUILDER GLOBAL RAIL PASS / WEB BUILDER-UPLOADED LOGO PASS / MESSENGER OVERLAY PASS / OWNER WORKSPACE LOCK PASS / FORM DESIGNER SOLID STATE PASS.

Current checkpoint file:

`CHECKPOINT-WEB-BUILDER-GLOBAL-RAIL-LOGO-INBOX-PASS-V7-12-299-7.md`

This manifest now records the successful pass where the accepted Web Builder rail, Web Builder-only uploaded logo/avatar projection, and footer-style messenger overlay were locked as the global Web Builder pattern.

No live `index.html` promotion was done. No app registry promotion was done. No Stream Bandit global footer was injected into Web Builder. No Supabase schema/RLS/storage policy change was done.

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

## Global Web Builder rail rule now locked

The accepted Web Builder global navigation is the shared scrolling header rail owned by:

`web-builder-global-projector-v7-12-263.js`

Current projector version:

`V7.12.299.7 Web Builder Centered Avatar Logo`

This rail should appear across every active Web Builder page. It is the standard builder navigation and replaces scattered duplicate local top button rows.

The rail includes:

- Back
- Hub
- Pages
- Web Builder
- Preview
- Menu
- Form
- Inbox
- Assets
- Route Map
- Control Map
- Source Map
- Header/Footer
- Manifest

Required helper note on pages where helpful:

`Scrolling Web Builder menu tabs: swipe or scroll the rail left/right to see every Web Builder page.`

## Global Web Builder logo/avatar rule now locked

The Web Builder-only uploaded logo/avatar source of truth for this pass is:

`https://xzxqfrvqdgkzwujbkdbk.supabase.co/storage/v1/object/public/stream-bandit-images/builder/assets/landing/1781530205862-1e5978b2-android_chrome_192.png`

This asset is projected only inside Web Builder surfaces:

- top-left page header avatar `.mark`
- shared Web Builder rail avatar
- hover/account panel avatar
- hover/account panel logo
- Web Builder favicon/apple icon

The final fit rule is `contain-centered`, not cropped `cover`.

Reason for the final fit rule:

- `cover` cropped the square uploaded logo and made the old stag antlers/background look like they were peeking from the bottom of the header avatar.
- `contain` keeps the uploaded logo centered inside the frame.
- The projector forces the header `.mark` to a fixed 44px x 44px frame so it matches the rail and does not stretch or fall low.

Stream Bandit app branding is untouched.

## Two global fixes to roll across every Web Builder page

### Fix 1 - Every Web Builder page uses the shared scrolling rail

Each current Web Builder page should load:

`web-builder-global-projector-v7-12-263.js`

The shared projector owns:

- route rail
- route search
- active rail item
- current slug preservation
- hover/account panel
- duplicate Studio top-button hiding

A page should not rebuild its own permanent top navigation if the shared rail already provides that job.

### Fix 2 - Every Web Builder page uses the same centered uploaded logo

Every Web Builder page should let the shared projector project the Web Builder logo into:

- header `.mark`
- bottom-right rail logo
- hover/account panel
- favicon

Do not hardcode the old Stream Bandit stag icon as Web Builder’s avatar once the shared projector is loaded.

The Web Builder logo/avatar change is Web Builder-only. It must not overwrite the main Stream Bandit movie app logo or global app branding.

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

Current visible version after rail pass: `V7.12.299.3`.

Result: PASS.

- Platform owner can enter and see the builder workspace.
- Creator Growth user can enter builder workspace.
- Creator users are directed to their own page rather than owner-only slugs.
- Hub now loads the shared Web Builder rail.
- Hub now shows the scrolling menu tabs note.
- Hub does not require `sort_order` column.
- Hub does not require `page_type` column.
- No schema changes.
- No storage changes.
- No index promotion.

### Shared Web Builder projector / rail / avatar

Route/script: `web-builder-global-projector-v7-12-263.js`

Current version: `V7.12.299.7 Web Builder Centered Avatar Logo`.

Result: PASS.

- Shared Web Builder rail works on phone first.
- Rail is horizontally scrollable.
- Rail includes the full builder route set.
- Search stays attached to the Web Builder rail.
- Current slug is preserved in builder route links.
- Header avatar uses the uploaded Web Builder logo.
- Rail avatar uses the uploaded Web Builder logo.
- Hover/account panel avatar and logo use the uploaded Web Builder logo.
- Header avatar is centered and contained instead of cropped low.
- Broken/stale local logo state is overridden by the uploaded Web Builder asset.
- No storage writes.
- No schema changes.
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
- Next rail pass must verify each route loads the shared projector/rail.

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

Current passed version: `V7.12.263.17 Web Builder Form Designer Solid State Owner Lock`.

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

### Web Builder lightweight messenger overlay / inbox bridge

Route: `web-builder-form-inbox-owned-v7-12-258-test.html?page=<slug>`

Current passed version: `V7.12.263.21 Web Builder Footer Messenger Overlay Replica`.

Result: PASS.

Verified Trevor debug:

- `iframe = false`
- `formSubmissionClone = false`
- `leakingSubmissionCards = false`
- `appGlobalFooterInjected = false`
- `webBuilderShell = true`
- `shellsRemainSeparate = true`
- `ownerOnlyGate = false`
- `creatorGrowthBlockedHere = false`
- `overlayTabs = Inbox, Sent, New Message, Friends, Blocked`
- `tables = sb_private_messages, sb_profiles, sb_user_friends, sb_user_blocks`
- `fullFormInboxStillOwnsSubmissions = true`
- `messagesLoaded = 25`
- `friendsLoaded = 1`
- `blocksLoaded = 0`
- `lastError = ""`

Correct rule:

- This route is the lightweight footer-style messenger overlay rebuilt inside Web Builder.
- It is not a duplicate form submissions inbox.
- It is not an iframe.
- It does not inject the main Stream Bandit footer shell into Web Builder.
- The real full Form Inbox remains the proper form-submission management route.

### Real full app-synced Form Inbox

Route: `web-builder-form-submissions-v7-12-94-test.html?page=<slug>`

Current rule: PRESERVE.

- This is the full form-submission manager.
- Do not replace it with a smaller owned inbox clone.
- It remains the proper place for full submissions/inbox management.
- It keeps full inbox options: submissions, private replies/messages, sent/outbox, spam, trash, CSV/export and soft status actions.

## Kayleigh / Creator Growth restriction state

The deeper Kayleigh restriction model is not finished in this checkpoint.

Current pass only locks that:

- Kayleigh / Creator Growth successfully passed Form Designer solid-state flow earlier.
- Kayleigh real submit passed earlier.
- Kayleigh should not be blocked from the Web Builder-only messenger overlay just because a menu group was previously owner-only.
- The correct later work is to organize Web Builder role/menu restrictions cleanly after the global rail and route pattern is stable.

Next restriction pass must be separate and deliberate:

- Creator Growth should see their own Web Builder workspace/pages/inbox tools.
- Platform owner remains the all-workspace override.
- Admin role alone must not expose other private Web Builder workspaces.
- Route/menu grouping must not hide core Creator Growth Web Builder tools just because they originally lived under an Owner menu group.

## Current route set

Canonical/current Web Builder routes:

- `web-builder-account-control-hub-v7-12-263-test.html`
- `web-builder-pages-manager-owned-v7-12-256-test.html`
- `overlay-route-truth-machine-v7-12-66-test.html?page=<slug>`
- `web-builder-preview-owned-v7-12-257-test.html?page=<slug>`
- `web-builder-menu-builder-owned-v7-12-264-test.html?page=<slug>`
- `web-builder-form-designer-owned-v7-12-258-test.html?page=<slug>`
- `web-builder-form-inbox-owned-v7-12-258-test.html?page=<slug>`
- `web-builder-assets-v7-12-252-test.html?page=<slug>`
- `web-builder-route-map-v7-12-252-test.html?page=<slug>`
- `web-builder-control-map-v7-12-253-test.html?page=<slug>`
- `web-builder-pages-source-map-v7-12-255-test.html?page=<slug>`
- `web-builder-header-footer-code-v7-12-254-test.html?page=<slug>`
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
- `sb_user_friends`
- `sb_user_blocks`

Current page/menu/form storage:

- Page rows live in `sb_site_pages`.
- Page ownership is scoped by `owner_id`.
- Platform owner can view/manage all rows in owner-approved flows.
- Creator Growth / builder users can view/save only their own `owner_id` rows.
- Page layout lives in `layout_json`.
- Menu and form builder metadata live in `settings_json`.
- Form submissions live in `sb_form_submissions`.
- Private replies/messages live in `sb_private_messages`.
- Friend state lives in `sb_user_friends`.
- Block state lives in `sb_user_blocks`.

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
- `V7.12.299.7 Web Builder global rail, uploaded logo and inbox bridge` - PASS.

## Lessons locked

- Do not patch global Supabase client behavior from the Studio helper.
- Do not force personal workspace scoping inside the Studio engine helper until the route is redesigned cleanly.
- Keep the Studio helper as an engine loader/repair helper only.
- Apply Web Builder access locks at the page level first, using the proven Pages Manager pattern.
- Do not rebuild a working app page just because it is being opened from Web Builder.
- The real app inbox is working; preserve it and bridge to it.
- The shared Web Builder rail now owns Web Builder route navigation.
- The shared Web Builder projector now owns the Web Builder-only logo/avatar projection.
- The accepted Web Builder logo fit is centered/contained, not cropped.

## Resume order after this checkpoint

1. Verify the shared rail and centered Web Builder logo on every primary Web Builder page.
2. Add the shared projector script to any Web Builder page that does not yet show the accepted rail.
3. Remove/hide duplicate local top-page button rows where the shared rail makes them redundant.
4. After global rail verification, begin the separate Kayleigh/Creator Growth role/menu restriction pass.

## Do not touch without approval

- `index.html`
- app registry/menu promotion
- Supabase schema/RLS/storage policies
- `web-builder-live-studio-v7-12-116.js`
- `web-builder-protected-page-v7-12-265.js` unless specifically scanning the access decision
- Stream Bandit global footer shell as a direct Studio injection
