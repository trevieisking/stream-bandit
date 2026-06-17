# Web Builder Manifest V7.12.300.34

## Purpose

This manifest tracks Web Builder as its own mini app/product area inside Stream Bandit.

The Stream Bandit movie/app manifest remains separate. This file is Web Builder only.

## Current checkpoint status

Status: ACTIVE / WEB BUILDER GLOBAL RAIL GROUP PASS COMPLETE / HEADER-FOOTER INTEGRATION HOLD / INDEX.HTML PROMOTION NOT APPROVED.

Checkpoint issue:

`https://github.com/trevieisking/stream-bandit/issues/47`

Current governing rule:

- Web Builder pages have passed the global rail group pass.
- This does not mean `index.html` is promoted.
- This does not mean live route promotion is approved.
- These pages still need a polish/tidy pass before any homepage or index promotion.
- Some old/support/temp pages are reference or fallback only and should not become part of the Web Builder user-facing product.

## Current governing plan

Source plan:

`Stream Bandit Non-Destructive Rollout and Live Promotion Plan.pdf`

Rail rollout principle:

- Hub is the visual gold standard.
- Active user-facing Web Builder pages inherit the same global rail/projector.
- Correct Web Builder-owned buttons must be used everywhere on user-facing builder pages.
- Body/page actions remain local to each page.
- Duplicate local top navigation is removed once the shared rail exists.
- Inputs belong in overlays where the page edits/configures/deletes/confirms something.
- Outputs stay visible on-page.
- Full Form Inbox remains separate/protected.
- No schema, RLS, storage policy, bucket policy, or live `index.html` promotion happens during this pass.

## Product ownership correction V7.12.300.34

This is the current Web Builder navigation/shell correction before the next Header/Footer rebuild.

### Menu Builder classification

Route:

`web-builder-menu-builder-owned-v7-12-264-test.html`

Correct product role:

- This is an on-page custom menu builder.
- It belongs in the same family as the advanced Form Designer: a builder-owned page feature tool.
- It should let a Web Builder user build per-page or site page menus with top/left/right placement, visibility, ordering and sub-tab indentation.
- It is not the canonical global header/footer shell builder.
- It must keep add/edit/remove/reorder/sub-tab overlays and save real menu settings to `sb_site_pages.settings_json`.

### Header/Footer Builder classification

Route:

`web-builder-header-footer-code-v7-12-254-test.html`

Correct product role:

- This is the builder-site shell tool.
- It owns header text, header links, header buttons, rail-style subtabs, footer text, footer groups, footer links, footer buttons and optional trusted header/footer code.
- Users must be able to use it as their own header/footer menu/rail if they want.
- Every configurable item needs add, edit, delete and reorder controls where relevant.
- Inputs must open in overlays and outputs must stay visible on-page.
- Code must be an advanced option, not the default user experience.

### Domain, subdomain and hosting requirement

Web Builder also needs future domain/subdomain/hosting support as part of the builder-owned product area:

- custom domain mapping
- subdomain mapping
- hosting/deploy readiness
- SSL/DNS guidance
- publish status and rollback status
- owner-safe approval gates

No domain table, DNS write, hosting automation, schema change, RLS change or `index.html` promotion is approved by this manifest note.

### Header/Footer blocker found

Current Header/Footer saves to a private page key that Preview does not consume:

`settings_json.web_builder_header_footer_builder`

Current Preview consumes simple shell fields and menu rows instead:

- `settings_json.site_name`
- `settings_json.footer_title`
- `settings_json.footer_text`
- `settings_json.menu_label`
- `settings_json.menu_icon`
- `settings_json.menu_position`
- `settings_json.menu_order`
- `settings_json.menu_indent`
- `settings_json.show_in_menu`

Therefore Header/Footer must not be promoted until the connected pass is complete.

Required connected pass:

1. Header/Footer Builder saves a shared builder shell model to `sb_site_pages.settings_json`.
2. Header/Footer Builder mirrors basic compatible fields for current Preview where needed.
3. Owned Preview renders the shared builder shell model when present.
4. Source Map reports builder shell presence, counts and publish readiness.
5. Studio/Form/Menu tools preserve unrelated `settings_json` keys when saving.
6. No schema, storage policy, DNS, domain, hosting or index promotion is done in this pass.

## Golden Web Builder shell

Golden route:

`web-builder-account-control-hub-v7-12-263-test.html`

Required visual shell:

- top-left Web Builder identity block
- uploaded Web Builder logo in header mark
- uploaded Web Builder logo in owner rail/account bubble
- horizontal scrolling Web Builder rail under the header
- integrated Web Builder search field on the rail row
- page-specific body content below the rail
- page-specific actions kept in page body, not moved into the rail
- correct route-family body buttons on every user-facing page

Required note:

`Scrolling Web Builder menu tabs: swipe or scroll the rail left/right to see every Web Builder page.`

## Shared global projector

File:

`web-builder-global-projector-v7-12-263.js`

Current passed version:

`V7.12.299.13 Web Builder Logo Projection Repair`

Current job:

- Web Builder rail
- Web Builder route search
- header `.mark` logo replacement
- bottom/right owner rail logo
- account/hover panel logo
- Web Builder favicon
- duplicated local top-button suppression
- current slug preservation in route links

Fit rule:

`contain-centered`

Safety rule:

- No storage writes.
- No schema changes.
- No index promotion.

## Web Builder group pass summary

### Hub / Account Control Hub

Route:

`web-builder-account-control-hub-v7-12-263-test.html`

Status: PASS / GOLDEN SHELL.

### Assets

Route:

`web-builder-assets-v7-12-252-test.html`

Current tested version:

`V7.12.299.9 Web Builder Assets Global Rail Lock`

Status: PASS.

### Web Builder Inbox Bridge / Messenger Overlay

Route:

`web-builder-form-inbox-owned-v7-12-258-test.html`

Current tested version:

`V7.12.299.10 Web Builder Footer Messenger Global Rail Bridge`

Status: PASS / PROTECTED.

Note:

This is the Web Builder-side inbox bridge. It does not replace the full app-owned form submissions/message manager.

### Pages Manager

Route:

`web-builder-pages-manager-owned-v7-12-256-test.html`

Current tested version:

`V7.12.299.12 Owned Pages Manager Menu-Style Global Rail`

Status: PASS.

### Owned Preview

Route:

`web-builder-preview-owned-v7-12-257-test.html?page=landing`

Current tested version:

`V7.12.299.14 Web Builder Owned Preview Global Rail Lock`

Status: FUNCTIONAL PASS / VISUAL POLISH PENDING / HEADER-FOOTER SHELL READER NEEDED.

Known polish debt:

- rendered website cards need tidying
- hero/card hierarchy needs polish
- card spacing and layout need cleanup
- preserve preview logic and owner lock
- read and render shared Header/Footer shell model when present
- do not mix visual polish with live/index promotion

### Menu Builder

Route:

`web-builder-menu-builder-owned-v7-12-264-test.html`

Current tested version:

`V7.12.299.16 Web Builder Menu Builder Global Rail Overlay Pass`

Status: PASS / RECLASSIFIED AS ON-PAGE CUSTOM MENU BUILDER.

Owner test confirmed:

- global rail present
- old local top buttons gone
- edit selected overlay works
- visibility overlay works
- reorder/sub-tab overlay works
- remove-from-menu overlay works
- menu output preserved
- no schema/storage/index promotion

Correction note:

This page is not the global header/footer builder. It is the on-page custom menu builder, comparable to the advanced Form Designer category.

### Form Designer

Route:

`web-builder-form-designer-owned-v7-12-258-test.html?page=landing`

Current tested version:

`V7.12.299.17 Web Builder Form Designer Global Rail Overlay Pass`

Status: PASS.

Owner test confirmed:

- global rail present
- old local top buttons gone
- builder/destination/field edit/delete overlays work
- add/edit/move/remove field works
- local test works
- local draft works
- save form design works
- owned inbox link opens
- real submit can write intended inbox submission and existing-bucket image upload
- no schema/storage-policy/index promotion

### Route Map

Route:

`web-builder-route-map-v7-12-252-test.html`

Current tested version:

`V7.12.299.18 Web Builder Route Map Global Rail Pass`

Status: PASS.

Purpose:

Read-only route truth, browser route check, filter, detail overlay and copy report.

### Control Map

Route:

`web-builder-control-map-v7-12-253-test.html`

Current tested version:

`V7.12.299.19 Web Builder Control Map Global Rail Pass`

Status: PASS.

Purpose:

Read-only safe route/protected boundary/future systems map.

### Pages Source Map

Route:

`web-builder-pages-source-map-v7-12-255-test.html`

Current tested version:

`V7.12.299.20 Web Builder Pages Source Map Global Rail Pass`

Status: PASS / NEEDS BUILDER SHELL REPORTING.

Owner rule from test:

- Correct Web Builder-owned routes are on the global rail.
- Because Web Builder users will use this page, any body buttons on this page must also point to correct Web Builder-owned routes when they are operational buttons.
- Support/reference links may remain only when clearly used as mapping/history/reference.

### Header/Footer Code

Route:

`web-builder-header-footer-code-v7-12-254-test.html`

Current tested version:

`V7.12.300.32 Web Builder Overlay Header/Footer Builder`

Status: HOLD / REWORK REQUIRED.

Owner test concern:

- saves are not visible in Owned Preview
- typed slugs do not feel connected enough to the publish flow
- page currently behaves too much like a standalone builder settings toy
- add/edit/delete/reorder is not complete for every item
- code must be optional/advanced, not the main user path

Previous owner test confirmed before rework:

- global rail present
- old local top buttons gone
- body buttons use correct Web Builder-owned routes
- Studio opens
- Pages Manager opens
- Owned Preview opens
- Menu Builder opens
- Form Designer opens
- Form Inbox opens
- Assets opens
- Copy Slug Links works
- Render Preview works
- Reset Defaults works
- Copy Report works
- local sandbox preview remains local only
- scripts and inline handlers stripped
- no schema/storage/index promotion

### Studio safety handoff

Routes:

`web-builder-studio-v7-12-252-test.html`

`overlay-route-truth-machine-v7-12-66-test.html?page=<slug>`

Status: SAFETY PASS / HANDOFF PRESERVED.

No-touch rule:

Do not touch `web-builder-live-studio-v7-12-116.js` during this pass unless explicitly doing a Studio preservation fix. Studio must preserve unrelated `settings_json` keys when saving page content.

## Current index.html promotion gate

Status: HOLD / TRACKING ONLY.

`index.html` is not promoted by this manifest update.

Promotion can only be considered after:

1. Full Web Builder group smoke test passes again from the rail.
2. Correct Web Builder-owned body buttons are verified on every user-facing builder page.
3. Visual polish/tidy pass is complete for pages that need cleanup.
4. Temp/reference/fallback pages are classified and excluded from user-facing Web Builder navigation.
5. Owner, creator, admin, standard signed-in user and guest lock tests pass.
6. Rollback route is documented.
7. Explicit owner approval is given for `index.html` promotion.

Promotion candidate target is not chosen yet.

Do not edit or replace `index.html` from this manifest update.

## User-facing Web Builder group to keep tracking

These routes are the current Web Builder group for polish/tidy and later promotion review:

1. `web-builder-account-control-hub-v7-12-263-test.html`
2. `web-builder-pages-manager-owned-v7-12-256-test.html`
3. `web-builder-studio-v7-12-252-test.html`
4. `overlay-route-truth-machine-v7-12-66-test.html?page=<slug>`
5. `web-builder-preview-owned-v7-12-257-test.html?page=<slug>`
6. `web-builder-menu-builder-owned-v7-12-264-test.html`
7. `web-builder-form-designer-owned-v7-12-258-test.html?page=<slug>`
8. `web-builder-form-inbox-owned-v7-12-258-test.html?page=<slug>`
9. `web-builder-assets-v7-12-252-test.html`
10. `web-builder-route-map-v7-12-252-test.html`
11. `web-builder-control-map-v7-12-253-test.html`
12. `web-builder-pages-source-map-v7-12-255-test.html`
13. `web-builder-header-footer-code-v7-12-254-test.html`
14. `WEB-BUILDER-MANIFEST-V7-12-252.md`

## Pages needing polish/tidy before promotion review

### Must polish

- `web-builder-preview-owned-v7-12-257-test.html?page=<slug>`
  - tidy hero/card layout
  - tidy rendered website cards
  - preserve logic/locks
  - render Header/Footer shell when present

- `web-builder-account-control-hub-v7-12-263-test.html`
  - use as gold standard but still final-check visual spacing and route labels

- `web-builder-pages-manager-owned-v7-12-256-test.html`
  - final route label tidy
  - final owner-scope wording tidy

- `web-builder-menu-builder-owned-v7-12-264-test.html`
  - final wording must call it the on-page custom menu builder
  - final body button/route check
  - later domain/subdomain/hosting links must point to the builder-owned hosting/domain area when that exists

- `web-builder-form-designer-owned-v7-12-258-test.html?page=<slug>`
  - final form wording tidy
  - final button route check

- `web-builder-header-footer-code-v7-12-254-test.html`
  - rebuild as Header/Footer Builder, not code-first planner
  - add/edit/delete/reorder everywhere
  - advanced optional custom code overlay
  - save shared builder shell model to `settings_json`
  - connect Owned Preview and Source Map

### Light tidy only

- `web-builder-assets-v7-12-252-test.html`
- `web-builder-route-map-v7-12-252-test.html`
- `web-builder-control-map-v7-12-253-test.html`
