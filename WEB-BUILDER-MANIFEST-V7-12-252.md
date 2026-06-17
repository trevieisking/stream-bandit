# Web Builder Manifest V7.12.300.37

## Purpose

This manifest tracks Web Builder as its own mini app/product area inside Stream Bandit.

The Stream Bandit movie/app manifest remains separate. This file is Web Builder only.

## Current checkpoint status

Status: HEADER/FOOTER + OWNED PREVIEW FUNCTIONAL PASS / GLOBAL RAIL PASS / INDEX CANDIDATE TRACKER UPDATED / FINAL LIVE-HOME PROMOTION NOT DONE.

Checkpoint issue:

`https://github.com/trevieisking/stream-bandit/issues/47`

Checkpoint file:

`CHECKPOINT-WEB-BUILDER-HEADER-FOOTER-PREVIEW-PASS-V7-12-300-37.md`

## Current governing rule

- Web Builder is its own builder product area, not the main Stream Bandit movie app shell.
- Hub remains the visual gold standard.
- Active user-facing Web Builder pages use the shared global rail/projector.
- Page-specific actions stay inside each page body.
- Inputs belong in overlays where users create, edit, delete, reorder or confirm something.
- Outputs stay visible on-page.
- No schema, RLS, storage policy, bucket policy, service-role, payment provider, DNS automation or final live-home replacement is approved by this checkpoint.
- `index.html` is a candidate tracker/root handoff and still redirects to the current Home route after a short pause.

## Big pass recorded

Owner screenshot/test confirmed the Header/Footer Builder + Owned Preview loop works.

Passed behavior:

- Header/Footer Builder saves a builder-site shell.
- Owned Preview renders the saved shell.
- Site name renders.
- Header page tick-list links render as pill navigation.
- Header custom buttons render.
- Sub tabs / rail tabs render.
- Footer text renders.
- Footer page tick-list links render in the footer Pages group.
- Footer buttons render.
- The main preview content body remains intact.
- The on-page Page Menu Builder output remains separate from the global header/footer shell.

## Current versions

- Header/Footer Builder: `V7.12.300.35 Web Builder Header Footer Real Supabase Shell Builder`
- Global projector/preview bridge: `V7.12.300.36 Web Builder Global Rail Preview Shell Bridge`
- Web Builder manifest: `V7.12.300.37`
- Current app manifest: `V7.12.300.37`
- Index checkpoint: `V7.12.300.37`

## Product ownership correction

### Page Menu Builder

Route:

`web-builder-menu-builder-owned-v7-12-264-test.html`

Correct product role:

- This is an on-page custom menu builder.
- It belongs in the same family as the advanced Form Designer: a builder-owned page feature tool.
- It should let a Web Builder user build per-page or site page menus with top/left/right placement, visibility, ordering and sub-tab indentation.
- It is not the canonical global header/footer shell builder.
- It must keep add/edit/remove/reorder/sub-tab overlays and save real menu settings to `sb_site_pages.settings_json`.

### Header/Footer Builder

Route:

`web-builder-header-footer-code-v7-12-254-test.html`

Correct product role:

- This is the builder-site shell tool.
- It owns header text, header links, header buttons, rail-style subtabs, footer text, footer groups, footer links, footer buttons and optional trusted header/footer code.
- Users can use it as their own header/footer menu/rail if they want.
- Every configurable item needs add, edit, delete and reorder controls where relevant.
- Inputs open in overlays and outputs stay visible on-page.
- Code is an advanced option, not the default user experience.

## Saved data model

Header/Footer saves a shared builder shell into:

`sb_site_pages.settings_json.web_builder_shell`

Compatibility mirrors:

- `settings_json.site_name`
- `settings_json.footer_title`
- `settings_json.footer_text`
- `settings_json.header_footer_status`
- `settings_json.header_footer_updated_at`

Owned Preview reads/render support:

- `settings_json.web_builder_shell`
- fallback `settings_json.web_builder_header_footer_builder`
- fallback `settings_json.web_builder_header_footer`
- old basic fields `site_name`, `footer_title`, `footer_text`

## Domain, subdomain and hosting requirement

Web Builder still needs future domain/subdomain/hosting support as part of the builder-owned product area:

- custom domain mapping
- subdomain mapping
- hosting/deploy readiness
- SSL/DNS guidance
- publish status and rollback status
- owner-safe approval gates

No domain table, DNS write, hosting automation, schema change, RLS change or final `index.html` live-home replacement is approved by this checkpoint.

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

`V7.12.300.36 Web Builder Global Rail Preview Shell Bridge`

Current job:

- Web Builder rail
- Web Builder route search
- header `.mark` logo replacement
- bottom/right owner rail logo
- account/hover panel logo
- Web Builder favicon
- duplicated local top-button suppression
- current slug preservation in route links
- Preview bridge for the saved Header/Footer shell

Safety rule:

- No storage writes.
- No schema changes.
- No index live-home replacement.

## User-facing Web Builder group

1. `web-builder-account-control-hub-v7-12-263-test.html` - PASS / golden shell
2. `web-builder-pages-manager-owned-v7-12-256-test.html` - PASS
3. `overlay-route-truth-machine-v7-12-66-test.html?page=<slug>` - Studio route handoff / preserved
4. `web-builder-preview-owned-v7-12-257-test.html?page=<slug>` - FUNCTIONAL PASS / visual polish later
5. `web-builder-menu-builder-owned-v7-12-264-test.html?page=<slug>` - PASS / reclassified as Page Menu Builder
6. `web-builder-form-designer-owned-v7-12-258-test.html?page=<slug>` - PASS
7. `web-builder-form-inbox-owned-v7-12-258-test.html?page=<slug>` - PASS / protected inbox bridge
8. `web-builder-assets-v7-12-252-test.html?page=<slug>` - PASS
9. `web-builder-route-map-v7-12-252-test.html?page=<slug>` - PASS
10. `web-builder-control-map-v7-12-253-test.html?page=<slug>` - PASS
11. `web-builder-pages-source-map-v7-12-255-test.html?page=<slug>` - PASS / needs builder-shell reporting next
12. `web-builder-header-footer-code-v7-12-254-test.html?page=<slug>` - FUNCTIONAL PASS / saved shell confirmed
13. `WEB-BUILDER-MANIFEST-V7-12-252.md` - updated checkpoint

## Passed route notes

### Header/Footer Builder

Status: FUNCTIONAL PASS.

Owner-confirmed:

- saved shell renders on Header/Footer page
- page tick-list for header works
- page tick-list for footer works
- custom header/footer text works
- Save Draft / Save Ready writes to Supabase
- compatibility fields are mirrored

### Owned Preview

Status: FUNCTIONAL PASS / POLISH LATER.

Owner-confirmed:

- saved header/footer shell renders in Owned Preview
- header page links render
- header buttons render
- sub tabs render
- footer Pages group renders
- footer button/text render
- page content remains intact

Visual polish debt remains:

- rendered website cards need tidying
- hero/card hierarchy needs polish
- card spacing and layout need cleanup
- do not mix visual polish with live-home promotion

### Page Menu Builder

Status: PASS / ON-PAGE CUSTOM MENU BUILDER.

This page is not the global header/footer builder. It is the on-page custom menu builder, comparable to the advanced Form Designer category.

## Studio safety handoff

Routes:

- `web-builder-studio-v7-12-252-test.html`
- `overlay-route-truth-machine-v7-12-66-test.html?page=<slug>`

Status: SAFETY PASS / HANDOFF PRESERVED.

No-touch rule:

Do not touch `web-builder-live-studio-v7-12-116.js` unless explicitly doing a Studio preservation fix. Studio must preserve unrelated `settings_json` keys when saving page content.

## Current index.html promotion gate

Status: CANDIDATE TRACKER UPDATED / ROOT STILL REDIRECTS TO HOME.

`index.html` is updated to record the Web Builder pass, but this is not final live-home replacement.

Root redirect remains:

`home-global-helpers-v7-4-4-test.html`

## Remaining Web Builder work

1. Source Map should report the saved builder shell presence/counts/readiness.
2. Preview needs visual tidy only, not functional rescue.
3. Page Menu Builder wording should stay corrected as on-page custom menu builder.
4. Domain, subdomain and hosting support remains future builder-owned product work.
5. Final live-home promotion remains owner-gated.
