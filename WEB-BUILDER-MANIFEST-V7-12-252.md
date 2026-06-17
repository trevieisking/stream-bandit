# Web Builder Manifest V7.12.300.41

## Purpose

This manifest tracks Web Builder as its own mini app/product area inside Stream Bandit.

The Stream Bandit movie/app manifest remains separate.

## Current checkpoint status

Status: OWNED PREVIEW MENU RAIL ICONS SEARCH PASS / PAGE MENU BUILDER ICON RESTORE PASS / SOURCE MAP TRUTH CHECKER PASS / HEADER-FOOTER FUNCTIONAL PASS / GLOBAL RAIL PASS / FINAL INDEX PROMOTION NOT DONE.

Latest recorded Web Builder pass:

`V7.12.300.41 Web Builder Owned Preview Menu Rail Icons Search Pass`

Previous recorded Web Builder pass:

`V7.12.300.40 Page Menu Builder Icon Restore + Published Menu Set Pass`

Source Map checkpoint file:

`CHECKPOINT-WEB-BUILDER-SOURCE-MAP-PASS-V7-12-300-38.md`

Previous checkpoint file:

`CHECKPOINT-WEB-BUILDER-HEADER-FOOTER-PREVIEW-PASS-V7-12-300-37.md`

## Current governing rule

- Web Builder is its own builder product area, not the main Stream Bandit movie app shell.
- Hub remains the visual gold standard.
- User-facing Web Builder pages use the shared global rail/projector.
- Inputs belong in overlays where users create, edit, remove, reorder or confirm something.
- Outputs stay visible on-page.
- Read-only pages are allowed only when they are useful inspectors, truth checkers or route/action maps.
- No schema, RLS, storage policy, bucket policy, service-role, payment provider, DNS automation or final live-home replacement is approved by this checkpoint.
- Web Builder passed pages are recorded here instead of replacing the main `index.html` until the full Web Builder group pass is approved.

## Source Map pass recorded

Route:

`web-builder-pages-source-map-v7-12-255-test.html?page=<slug>`

Passed version:

`V7.12.300.38 Web Builder Source Map Truth Checker`

Owner confirmed route:

`web-builder-pages-source-map-v7-12-255-test.html?page=landing`

Purpose:

Source Map is the Web Builder source/render/publish truth checker. It is not another editor.

Passed behavior:

- selected slug
- page row found / missing
- owner_id match
- page status
- layout_json present
- settings_json present
- web_builder_shell present
- header page links count
- header buttons count
- subtabs count
- footer page links count
- footer groups count
- footer buttons count
- Page Menu settings present
- Form Designer settings present
- Preview route
- Studio route
- Header/Footer route
- readiness result
- output on page
- detail overlay

Safety:

- reads `sb_profiles` and `sb_site_pages`
- no Supabase writes
- no schema change
- no storage action
- no fake publish
- no index promotion

## Page Menu Builder pass recorded

Route:

`web-builder-menu-builder-owned-v7-12-264-test.html?page=<slug>`

Passed version:

`V7.12.300.40 Web Builder Page Menu Builder Icon Restore + Published Menu Set Pass`

Owner confirmed status:

PASSED FULLY.

Passed behavior:

- reclassified correctly as Page Menu Builder, not Header/Footer Builder
- top menu is built as an on-page rail, not as the global header/footer menu
- left and right menu placements remain supported
- real selected icons are restored
- expanded icon picker is available
- icons render in menu rows and preview links
- edit, reorder, visibility, remove and bulk actions stay in overlays
- menu settings save into `sb_site_pages.settings_json`
- optional apply-to-published-pages checkbox stores the current menu set into each published page settings_json
- no schema change
- no storage action
- no Header/Footer controls added
- no index promotion

Saved data model:

- `settings_json.menu_label`
- `settings_json.menu_icon`
- `settings_json.menu_position`
- `settings_json.menu_order`
- `settings_json.menu_indent`
- `settings_json.show_in_menu`
- optional `settings_json.page_menu_set`
- optional `settings_json.web_builder_page_menu_set`
- optional `settings_json.page_menu_set_applied_at`

## Owned Preview pass recorded

Route:

`web-builder-preview-owned-v7-12-257-test.html?page=<slug>`

Passed version:

`V7.12.300.41 Web Builder Owned Preview Menu Rail Icons Search Pass`

Owner confirmed status:

PASSED FULLY.

Passed behavior:

- Owned Preview consumes Page Menu Builder output from `settings_json`
- top page menu renders as a horizontal scroll/slider rail
- left and right page menus render as controlled scroll rails when there are many tabs
- selected Page Menu Builder icons appear in the preview menu links
- search sits beside the preview top rail/header area
- search filters/focuses page menu links and Enter opens the best match
- owner preview lock remains preserved
- form submissions remain preserved
- rating blocks remain preserved
- content block rendering remains preserved
- no schema change
- no storage action
- no Header/Footer builder change
- no index promotion

## Header/Footer Builder next correction

Route:

`web-builder-header-footer-code-v7-12-254-test.html?page=<slug>`

Required next pass:

`V7.12.300.42 Header/Footer Builder Rail Search + Apply Shell To Workspace Pages Pass`

Required behavior:

- restore the Header/Footer Builder page's own Web Builder rail and search in the actual page header
- keep the existing Header/Footer Builder layout and overlays
- add an option like Page Menu Builder to apply the current header/footer shell to every page slug in that same user workspace
- save the shared shell into each page row's existing `settings_json`
- preserve other settings_json keys on every page row
- platform owner scope must stay owner-safe and avoid applying one user's shell to unrelated workspaces
- no schema change
- no storage action
- no Header/Footer custom-code execution change
- no index promotion

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
- Inputs open in overlays and outputs stay visible on-page.
- Code is an advanced option, not the default user experience.

## Saved data model

Header/Footer saves a shared builder shell into:

`sb_site_pages.settings_json.web_builder_shell`

Compatibility mirrors:

- `settings_json.web_builder_header_footer_builder`
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
- Page Menu Builder output fields listed in this manifest

## Domain, subdomain and hosting requirement

Web Builder still needs future domain/subdomain/hosting support as part of the builder-owned product area:

- custom domain mapping
- subdomain mapping
- hosting/deploy readiness
- SSL/DNS guidance
- publish status and rollback status
- owner-safe approval gates

No domain table, DNS write, hosting automation, schema change, RLS change or final index promotion is approved by this checkpoint.

## User-facing Web Builder group

1. `web-builder-account-control-hub-v7-12-263-test.html` - PASS / golden shell
2. `web-builder-pages-manager-owned-v7-12-256-test.html` - PASS
3. `overlay-route-truth-machine-v7-12-66-test.html?page=<slug>` - Studio route handoff / preserved
4. `web-builder-preview-owned-v7-12-257-test.html?page=<slug>` - PASS / menu rail icons + search consumer pass confirmed
5. `web-builder-menu-builder-owned-v7-12-264-test.html?page=<slug>` - PASS / Page Menu Builder / icon restore + published menu set apply confirmed
6. `web-builder-form-designer-owned-v7-12-258-test.html?page=<slug>` - PASS
7. `web-builder-form-inbox-owned-v7-12-258-test.html?page=<slug>` - PASS / protected inbox bridge
8. `web-builder-assets-v7-12-252-test.html?page=<slug>` - PASS
9. `web-builder-route-map-v7-12-252-test.html?page=<slug>` - PASS / route-health manager still planned
10. `web-builder-control-map-v7-12-253-test.html?page=<slug>` - PASS / control truth page still planned
11. `web-builder-pages-source-map-v7-12-255-test.html?page=<slug>` - FUNCTIONAL PASS / truth checker confirmed
12. `web-builder-header-footer-code-v7-12-254-test.html?page=<slug>` - FUNCTIONAL PASS / NEXT: rail search + apply shell to workspace pages
13. `WEB-BUILDER-MANIFEST-V7-12-252.md` - updated Web Builder record

## Future login/account gate

After the Web Builder plan is complete, the owner wants the finished builder flow promoted through `index.html` and later protected behind a Supabase email/password login system.

Future login requirements:

- email/password sign-up and sign-in
- one account per email
- Supabase Auth-backed account creation
- profile row creation in `sb_profiles`
- no duplicate account for the same email
- owner/admin gates remain protected

This login gate is future work and is not part of this checkpoint.

## Remaining Web Builder work

1. Header/Footer Builder adds its own rail search and apply-shell-to-workspace-pages save option.
2. Route Map becomes a route-health manager.
3. Control Map becomes an action/button ownership truth page.
4. Pages Manager, Form Designer, Inbox and Assets smoke checks against Source Map.
5. Domain/subdomain/hosting readiness remains future builder-owned product work.
6. Final `index.html` promotion happens only after full Web Builder group pass and owner approval.
