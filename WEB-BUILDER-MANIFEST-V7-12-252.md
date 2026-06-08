# Web Builder Manifest V7.12.260

## Purpose

This manifest tracks the Web Builder as a separate mini app/product area inside Stream Bandit.

The Stream Bandit manifest remains for the movie app. This file is for Web Builder only.

## Current passed checkpoints

- `V7.12.250 Web Builder Studio Theme Brand Font Planner` — PASS
- `V7.12.251 Web Builder Asset Media Planner` — PASS
- `V7.12.252 Canonical Web Builder URLs` — PASS
- `V7.12.253 Web Builder Control Map` — PASS
- `V7.12.254.1 Web Builder Header/Footer Code Tool + Slug Launcher` — PASS
- `V7.12.255 Web Builder Pages Source Map` — PASS
- `V7.12.256 Web Builder-owned Pages Manager Planner` — PASS
- `V7.12.257.3 Web Builder-owned Full Page Preview` — PASS
- `V7.12.258.3 Advanced Form Builder Focus Fix` — PASS
- `V7.12.259.1 Owned Form Inbox Routing View + Card Overflow Fix` — PASS
- `V7.12.260 Web Builder Media / Asset Manager Upload + Delete Pair` — PASS

## Latest verified pass — V7.12.260

Route:

- `web-builder-assets-v7-12-252-test.html`

User-tested result:

- Site slug `landing` tested.
- Asset type `Page image / general asset` tested.
- Drop / choose image tested.
- Alt text tested.
- Caption tested.
- Upload Selected Asset tested.
- Stored asset card appeared after upload.
- Open Public URL tested.
- Asset card selection tested.
- Delete Selected Asset + Metadata tested.
- Refresh Asset List tested.

Pass notes:

- Upload is allowed because delete/remove is built beside it.
- Uploaded files use the existing `stream-bandit-images` bucket.
- Builder asset path uses `builder/{assetType}/{siteSlug}/...`.
- Metadata sidecar uses `<asset path>.metadata.json`.
- Delete removes both the uploaded asset and metadata sidecar.
- No schema changes.
- No Stream Bandit logo, favicon, app theme, or branding changes.

## Latest verified form builder pass — V7.12.258.3

Route:

- `web-builder-form-designer-owned-v7-12-258-test.html?page=landing`

User-tested result:

- Add short text field — PASS
- Add phone field — PASS
- Add URL field — PASS
- Add checkbox field — PASS
- Edit labels/options — PASS
- Local Test with no write — PASS
- Save Local Draft with no write — PASS
- Real Submit to owned inbox — PASS
- Input focus while typing labels/options/title/email — PASS

Pass notes:

- Advanced custom fields are working.
- Field typing no longer rebuilds the editor or kicks focus out after each letter.
- Real submit writes to existing `sb_form_submissions` only when intentionally pressed.
- Destination intent is recorded in `answers_json.__routing`.
- External email is not sent by the app.
- Private/owner message delivery is not marked delivered yet.

## Latest verified inbox pass — V7.12.259.1

Route:

- `web-builder-form-inbox-owned-v7-12-258-test.html?page=landing`

User-tested result:

- Routing metadata displayed — PASS
- Owner email displayed — PASS
- Owner name displayed — PASS
- Save to inbox displayed — PASS
- Notify owner intent displayed — PASS
- Owner message-copy intent displayed — PASS
- Email destination requested displayed — PASS
- External email sent remains `no` — PASS
- Message delivered remains `no` — PASS
- Field answers display with field types — PASS
- Card overflow / text invasion fixed — PASS

Pass notes:

- Inbox separates normal field answers from `__routing` and `__form` metadata.
- Long URLs/emails wrap inside cards.
- No hard delete.
- No schema changes.
- No external email sending.
- No private message delivery yet.

## Current canonical Web Builder test routes

- Studio Shell canonical URL: `web-builder-studio-v7-12-252-test.html`
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
- Form email destination uses recorded intent or later `mailto:` helper; no hidden external email send.
- Private message delivery must not claim delivered until the real route exists.
- No schema changes unless specifically approved.
- No cleanup delete batches without a keep list and explicit batch approval.

## Next planned work

### V7.12.261 — Form Destination Chooser Polish

Goal:

- Make Inbox / Email / Private Message destination choices clear at form creation time.
- Add a prefilled `mailto:` helper when Email destination is selected.
- Keep external email sending user-controlled through the user's own email app.
- Keep private message as intent until the real owner/private message delivery route is approved.

Expected safe behavior:

- Inbox selected: save to `sb_form_submissions`.
- Email selected: build/open prefilled `mailto:` with form answers; do not send silently.
- Private Message selected: record intent only until the message route exists.

### V7.12.262 — Media Picker Integration

Goal:

- Let pages/forms/preview choose an uploaded Web Builder asset from `builder/{assetType}/{siteSlug}/...`.
- Apply selected image to page blocks as hero image, poster, logo source, or social preview source.
- Keep replace/remove controls beside every selected asset.

### V7.12.263 — Responsive Preview / Device Modes

Goal:

- Desktop / tablet / mobile preview widths.
- No publish changes.
- No app shell changes.

### V7.12.264 — Save / Publish / Unsaved State Rail

Goal:

- Clear saved / unsaved / local draft / published notices.
- No silent saves.
- Clear rollback state.

### V7.12.265 — Security / Ownership Guard

Goal:

- Owner/role checks.
- Read-only mode when not authorized.
- Clear blocked-write messages.
