# Web Builder Manifest V7.12.263

## Purpose

This manifest tracks the Web Builder as a separate mini app/product area inside Stream Bandit.

The Stream Bandit manifest remains for the movie app. This file is for Web Builder only.

## Current doorway rule

One thing at a time:

- Web Builder is indexed and tracked here first, under the Web Builder manifest.
- Web Builder is not promoted as the main app manifest.
- Stream Bandit app branding remains Stream Bandit branding.
- Web Builder branding/avatar/projector takes over only after entering Web Builder pages.
- Main app promotion is limited to one clean doorway when approved.

Approved doorway model:

- One way in: Stream Bandit menu -> Web Builder -> `web-builder-account-control-hub-v7-12-263-test.html`.
- One way out: Web Builder -> Back to Stream Bandit/home.
- Inboxes remain available from both Stream Bandit and Web Builder.
- Form Inbox and Advanced Form are not removed from the main app owner/tools routes.

Not promoted yet:

- `index.html`
- current app registry
- main app branding
- footer shell
- full app manifest

## Core polish rule

- Inputs live in clean overlays.
- Outputs display on clean page views.
- Builder/editor controls should not be scattered through visitor previews or output dashboards.
- Page views should show results, previews, cards, route maps, reports, inbox output, and asset libraries.

## Core add/remove rule

- Anything that can be added/created must have a simple remove/delete path.
- Delete/remove must be guarded and clearly scoped.
- Landing/home guard remains protected until a real replacement-home flow exists.
- No delete action may silently remove files, routes, rows, or current app pages.
- Soft remove/archive is acceptable where hard delete is not yet approved.

## Current passed checkpoints

- `V7.12.250 Web Builder Studio Theme Brand Font Planner` - PASS
- `V7.12.251 Web Builder Asset Media Planner` - PASS
- `V7.12.252 Canonical Web Builder URLs` - PASS
- `V7.12.253 Web Builder Control Map` - PASS
- `V7.12.254.1 Web Builder Header/Footer Code Tool + Slug Launcher` - PASS
- `V7.12.255 Web Builder Pages Source Map` - PASS
- `V7.12.256 Web Builder-owned Pages Manager Planner` - PASS
- `V7.12.257.3 Web Builder-owned Full Page Preview` - PASS
- `V7.12.258.3 Advanced Form Builder Focus Fix` - PASS
- `V7.12.259.1 Owned Form Inbox Routing View + Card Overflow Fix` - PASS
- `V7.12.260 Web Builder Media / Asset Manager Upload + Delete Pair` - PASS
- `V7.12.261.2 Form Destination Chooser + Mail Draft Prefill Fix` - PASS
- `V7.12.262.1 Asset Manager Input Overlay / Output Page Polish` - PASS
- `V7.12.262.3 Pages Manager Add/Remove Pair` - PASS
- `V7.12.262.4 Owned Pages Manager Preview Route + Landing Guard` - PASS
- `V7.12.262.6 Owned Form Inbox Soft Remove Action` - PASS
- `V7.12.263 Web Builder Projector Connection Rollout` - PASS
- `V7.12.263 Real Studio Shell Projector Connection` - PASS

## Latest verified pass - V7.12.263 Web Builder Projector Connection Rollout

### User-tested result

- Form Designer projector connection - PASS.
- Owned Form Inbox projector connection - PASS.
- Assets Manager projector connection - PASS.
- Owned Pages Manager projector connection - PASS.
- Owned Preview projector connection - PASS.
- Route Map projector connection - PASS.
- Control Map projector connection - PASS.
- Pages Source Map projector connection - PASS.
- Header/Footer Code Tool projector connection - PASS.
- Studio Canonical Route wrapper landed - LANDED.
- Real visible Studio Shell projector connection - PASS.

### Verified behavior

- Hub rail appears on connected Web Builder pages.
- Avatar projection works on pages with `.mark` avatar holder.
- Favicon projection works from the Web Builder projector state.
- Web Builder pages keep their own local account/avatar/theme/brand/shell/favourites state.
- Projector remains Web Builder-only and does not connect to Stream Bandit app settings.
- Stream Bandit app branding/logo/favicon remains untouched.
- No `index.html` promotion.
- No current app registry promotion.
- No schema changes.
- No storage schema changes.
- No Stream Bandit header/footer/theme helper rewrite in this pass.

### Projector-connected routes

- `web-builder-account-control-hub-v7-12-263-test.html`
- `overlay-route-truth-machine-v7-12-66-test.html?page=test-page`
- `web-builder-studio-v7-12-252-test.html`
- `web-builder-assets-v7-12-252-test.html`
- `web-builder-pages-manager-owned-v7-12-256-test.html`
- `web-builder-preview-owned-v7-12-257-test.html?page=landing`
- `web-builder-form-designer-owned-v7-12-258-test.html?page=landing`
- `web-builder-form-inbox-owned-v7-12-258-test.html?page=landing`
- `web-builder-route-map-v7-12-252-test.html`
- `web-builder-control-map-v7-12-253-test.html`
- `web-builder-pages-source-map-v7-12-255-test.html`
- `web-builder-header-footer-code-v7-12-254-test.html`

## Latest verified pass - V7.12.262.6 Owned Form Inbox Soft Remove Action

Route:

- `web-builder-form-inbox-owned-v7-12-258-test.html?page=landing`

User-tested result:

- Select a submission - PASS.
- Open Status / Remove - PASS.
- Click Remove From Inbox - PASS.
- Confirm it disappears from Active output - PASS.
- Open Filter Inbox - PASS.
- Change Status to archived / removed - PASS.
- Apply + Load - PASS.
- Confirm the removed submission can still be seen there - PASS.

Pass notes:

- Inbox now has a remove path for every submission.
- Remove From Inbox is a soft remove, not a hard delete.
- Soft remove sets the submission status to `archived`.
- Default filter is `active`, hiding archived submissions from the normal inbox output.
- Archived filter lets the user recover/view removed submissions.
- Filter controls remain in an overlay.
- Status/remove controls remain in an overlay.
- Submission cards, selected details, routing metadata and answer output stay on the page.
- No hard delete.
- No schema changes.
- No email sending.
- No private message delivery.

## Previous verified pass - V7.12.262.4 Owned Pages Manager Preview Route + Landing Guard

Route:

- `web-builder-pages-manager-owned-v7-12-256-test.html`

User-tested result:

- Select `test-page` - PASS.
- Click Published Preview - PASS.
- Published Preview opens `web-builder-preview-owned-v7-12-257-test.html?page=test-page` - PASS.
- Select `landing` - PASS.
- Remove Page is blocked for `landing` - PASS.
- Select any non-landing page - PASS.
- Remove Page is allowed for non-landing pages - PASS.

Pass notes:

- Published Preview points to the Web Builder-owned preview route, not the old in-app preview.
- Open Form points to the Web Builder-owned advanced form builder.
- Owned Inbox points to the Web Builder-owned inbox.
- Old app preview/form/inbox routes remain preserved as references only.
- Landing is the only protected planner page in this pass.
- Every other local planner page is removable from the planner.
- No Supabase writes.
- No files deleted.
- No routes deleted.
- No current app Pages Manager touched.

Known limitation / future fix:

- Pages removed in this local planner reappear after refresh because this pass is still local-memory only.
- This is acceptable for the current safe planner pass.
- Later, real persistence needs an approved save/delete model using either local draft storage or the real builder page table.
- Persistent delete must keep the same rule: landing protected, non-landing pages removable, no silent deletes.

## Latest verified asset overlay polish pass - V7.12.262.1

Route:

- `web-builder-assets-v7-12-252-test.html`

User-tested result:

- Main page shows asset library/output only - PASS.
- Open Upload Overlay shows slug/type/alt/caption/dropzone inputs - PASS.
- Upload still works - PASS.
- Delete Selected opens a delete overlay - PASS.
- Delete still removes the uploaded asset - PASS.
- Debug shows `assetManagerOverlayPolish: true` - PASS.
- Debug shows `uploadInputOverlay: true` - PASS.
- Debug shows `deleteInputOverlay: true` - PASS.
- Debug shows `outputAssetLibraryPage: true` - PASS.

Pass notes:

- Asset Manager follows the core polish rule: inputs in overlays, outputs on the page.
- Upload controls are in the Upload Overlay.
- Delete confirmation is in the Delete Overlay.
- Main page is the stored asset library and selected asset output view.
- Upload remains paired with delete/remove.
- Current image upload path is working.
- JSON metadata sidecar upload is skipped while bucket MIME policy rejects `application/json`.
- No schema changes.
- No Stream Bandit logo, favicon, app theme, or branding changes.

## Global Web Builder asset direction

User direction:

- The asset upload/delete system should become a global Web Builder function that users can use across Web Builder pages.
- Users should be able to upload assets, preview them, add alt text/captions, reuse them, and delete/remove them safely.

Working rule:

- Upload is allowed only because delete/remove exists beside it.
- No upload-only orphan asset system.
- Every asset must have preview, metadata, replace/remove/delete, and a clear owner/page/global scope.

Future asset scopes:

- `user` - assets uploaded by a specific user.
- `site` - assets available across one Web Builder site/project.
- `page` - assets attached to one page/block.
- `global` - shared Web Builder library assets available across the builder system.
- `system` - protected Web Builder/Stream Bandit defaults that users can copy from but not delete.

Current storage path remains:

- `builder/{assetType}/{siteSlug}/...`

Future recommended path model:

- `builder/users/{userId}/{assetType}/...`
- `builder/sites/{siteSlug}/{assetType}/...`
- `builder/pages/{pageSlug}/{assetType}/...`
- `builder/global/{assetType}/...`
- `builder/system/{assetType}/...`

Future data model note:

- Current asset pass uses Supabase Storage only.
- A future `sb_builder_assets` table may be useful for searchable global/user/site asset library views, ownership checks, reuse, and safer cleanup.
- Do not add that table until the no-schema version is fully stable and the ownership/security pass is agreed.

## Latest verified form destination pass - V7.12.261.2

Route:

- `web-builder-form-designer-owned-v7-12-258-test.html?page=landing`

User-tested result:

- Builder overlay / full-screen form preview layout works.
- Full form preview is the main page view.
- Builder tools open in overlay.
- Destination chooser opens in overlay.
- Form fields are clickable.
- Custom field builder remains working.
- Local Test works.
- Real Submit works and saves to `sb_form_submissions` when Inbox is selected.
- Email destination opens the user's own mailbox.
- Mail draft helper passes with the form content available for the email draft.
- Mail body fallback is copied to clipboard if the mail app strips the prefilled body.
- File/image locked field no longer blocks submit as required.

Pass notes:

- This is a functional pass for the current Web Builder form flow.
- The app still does not silently send email.
- Email opens through user-controlled mail app / mailbox behavior.
- Private message remains recorded intent only until the real delivery route is built.
- No schema changes.
- No storage changes.
- No Stream Bandit app shell loaded.

## Latest verified form builder foundation pass - V7.12.258.3

Route:

- `web-builder-form-designer-owned-v7-12-258-test.html?page=landing`

User-tested result:

- Add short text field - PASS.
- Add phone field - PASS.
- Add URL field - PASS.
- Add checkbox field - PASS.
- Edit labels/options - PASS.
- Local Test with no write - PASS.
- Save Local Draft with no write - PASS.
- Real Submit to owned inbox - PASS.
- Input focus while typing labels/options/title/email - PASS.

Pass notes:

- Advanced custom fields are working.
- Field typing no longer rebuilds the editor or kicks focus out after each letter.
- Real submit writes to existing `sb_form_submissions` only when intentionally pressed.
- Destination intent is recorded in `answers_json.__routing`.
- External email is not sent by the app.
- Private/owner message delivery is not marked delivered yet.

## Latest verified inbox foundation pass - V7.12.259.1

Route:

- `web-builder-form-inbox-owned-v7-12-258-test.html?page=landing`

User-tested result:

- Routing metadata displayed - PASS.
- Owner email displayed - PASS.
- Owner name displayed - PASS.
- Save to inbox displayed - PASS.
- Notify owner intent displayed - PASS.
- Owner message-copy intent displayed - PASS.
- Email destination requested displayed - PASS.
- External email sent remains `no` - PASS.
- Message delivered remains `no` - PASS.
- Field answers display with field types - PASS.
- Card overflow / text invasion fixed - PASS.

Pass notes:

- Inbox separates normal field answers from `__routing` and `__form` metadata.
- Long URLs/emails wrap inside cards.
- No hard delete.
- No schema changes.
- No external email sending.
- No private message delivery yet.

## Current canonical Web Builder routes

- Web Builder Hub canonical URL: `web-builder-account-control-hub-v7-12-263-test.html`
- Studio Shell canonical URL: `web-builder-studio-v7-12-252-test.html`
- Real Studio Shell route: `overlay-route-truth-machine-v7-12-66-test.html?page=test-page`
- Asset / Media Manager canonical URL: `web-builder-assets-v7-12-252-test.html`
- Route Map canonical URL: `web-builder-route-map-v7-12-252-test.html`
- Control Map canonical URL: `web-builder-control-map-v7-12-253-test.html`
- Header/Footer Code canonical URL: `web-builder-header-footer-code-v7-12-254-test.html`
- Pages Source Map canonical URL: `web-builder-pages-source-map-v7-12-255-test.html`
- Owned Pages Manager Planner canonical URL: `web-builder-pages-manager-owned-v7-12-256-test.html`
- Owned Full Page Preview canonical URL: `web-builder-preview-owned-v7-12-257-test.html?page=landing`
- Advanced Form Builder canonical URL: `web-builder-form-designer-owned-v7-12-258-test.html?page=landing`
- Owned Form Inbox canonical URL: `web-builder-form-inbox-owned-v7-12-258-test.html?page=landing`
- Web Builder Manifest: `WEB-BUILDER-MANIFEST-V7-12-252.md`

## Preserved app / support routes

These remain preserved while Web Builder-owned replacements are being proven.

- Current in-app Studio reference: `web-builder-live-studio-v7-12-116-test.html?page=landing`
- Current app Pages Manager reference: `web-builder-pages-manager-v7-12-111-test.html`
- Current app Published Preview reference: `web-builder-shared-style-preview-v7-12-117-test.html?page=landing`
- Current app Advanced Form reference: `web-builder-form-save-v7-12-94-test.html?page=landing`
- Current app Form Inbox reference: `web-builder-form-submissions-v7-12-94-test.html?page=landing`

## Safety rules currently active

- Web Builder pages remain separate from the Stream Bandit movie app shell unless explicitly preserved as reference/support routes.
- No Stream Bandit logo/favicon/theme changes from Web Builder asset work.
- Upload features must include matching delete/remove controls.
- Form email destination uses a user-controlled mail draft helper; no hidden external email send.
- Private message delivery must not claim delivered until the real route exists.
- No schema changes unless specifically approved.
- No cleanup delete batches without a keep list and explicit batch approval.
- User-uploaded Web Builder assets should become reusable builder assets, not one-off orphan uploads.
- System/global assets must be protected from accidental user deletion.
- Pages Manager local remove is temporary until persistence exists; removed local planner pages reappear on refresh by design in the safe planner pass.
- Inbox remove is a soft archive action until hard delete rules are explicitly approved.
- Main app menu promotion must be one doorway only when approved.
- Web Builder route changes belong in this manifest before touching the main app registry or app manifest.

## Next planned work

### V7.12.263.8 - Web Builder doorway route alignment

Goal:

- Update only the app header/menu route alias and global helper route alias when approved.
- Main app `Web Builder` entry should point to `web-builder-account-control-hub-v7-12-263-test.html`.
- Keep Form Inbox and Advanced Form linked from both the app and Web Builder.
- Keep one clear way back to Stream Bandit from the Web Builder hub/rail.
- Do not touch index, footer shell, app branding, current app registry, or Stream Bandit manifest in the first route alignment pass.

### V7.12.264 - Global/User Web Builder Asset Library

Goal:

- Turn the working upload/delete flow into a reusable Web Builder asset library.
- Add clear asset scopes: user, site, page, global, system.
- Let pages/forms/preview choose an uploaded Web Builder asset.
- Apply selected image to page blocks as hero image, poster, logo source, or social preview source.
- Keep replace/remove/delete controls beside every selected asset.
- Preserve metadata prompts for alt text and captions.
- Keep protected system/global assets safe from user deletion.

### V7.12.265 - Responsive Preview / Device Modes

Goal:

- Desktop / tablet / mobile preview widths.
- No publish changes.
- No app shell changes.

### V7.12.266 - Save / Publish / Unsaved State Rail

Goal:

- Clear saved / unsaved / local draft / published notices.
- No silent saves.
- Clear rollback state.

### V7.12.267 - Security / Ownership Guard

Goal:

- Owner/role checks.
- Read-only mode when not authorized.
- Clear blocked-write messages.
