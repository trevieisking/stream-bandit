# Web Builder Manifest V7.12.300.47

## Purpose

This manifest tracks Web Builder as its own mini app/product area inside Stream Bandit.

The Stream Bandit movie/app manifest remains separate.

## Current checkpoint status

Status: PAGES MANAGER BUILDER POLISH SEO DOMAIN PREVIEW CONTROLS PASS / CONTROL MAP NO-FIX PASS / ROUTE MAP NO-FIX PASS / SOURCE MAP GLOBAL PROJECTOR RAIL SEARCH PASS / HEADER-FOOTER RAIL SEARCH WORKSPACE APPLY PASS / OWNED PREVIEW MENU RAIL ICONS SEARCH PASS / PAGE MENU BUILDER ICON RESTORE PASS / GLOBAL RAIL PASS / FINAL INDEX PROMOTION NOT DONE.

Latest recorded Web Builder pass:

`V7.12.300.47 Web Builder Pages Manager Builder Polish SEO Domain Preview Controls Pass`

Previous recorded Web Builder pass:

`V7.12.300.46 Web Builder Control Map No-Fix Stability Pass`

Current Control Map code version confirmed passed:

`V7.12.299.19 Web Builder Control Map Global Rail Pass`

Previous Route Map pass:

`V7.12.300.45 Web Builder Route Map No-Fix Stability Pass`

Current Route Map code version confirmed passed:

`V7.12.299.18 Web Builder Route Map Global Rail Pass`

Previous Source Map pass:

`V7.12.300.44 Web Builder Source Map Global Projector Rail Search Pass`

Previous Header/Footer pass:

`V7.12.300.42 Web Builder Header Footer Rail Search Workspace Apply Pass`

Previous Owned Preview pass:

`V7.12.300.41 Web Builder Owned Preview Menu Rail Icons Search Pass`

Previous Page Menu Builder pass:

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
- The older Web Builder engine/global helper relationship may still be helping some global pages. Do not remove or bypass those helpers until Source Map, Route Map and global page scans confirm the dependency is safe to retire.
- If a page already passes and nothing visible is broken, do not rewrite it just to increase a version number. Record the pass, preserve the working code, and move to the next planned page.
- Pages Manager is allowed to grow into the page creation and readiness control centre, but it must keep its existing safe create/edit/save/delete behavior and keep all global Web Builder features.

## Pages Manager builder polish pass recorded

Route:

`web-builder-pages-manager-owned-v7-12-256-test.html?page=<slug>`

Passed version:

`V7.12.300.47 Owned Pages Manager Builder Polish SEO Domain Preview Controls`

Manifest record pass:

`V7.12.300.47 Web Builder Pages Manager Builder Polish SEO Domain Preview Controls Pass`

Owner confirmed status:

PASSED FULLY.

Owner supplied live page debug result:

- checked true
- allowed true
- signed in true
- platform_owner profile confirmed
- workspace `platform-owner-all-rows`
- create/edit/save/delete flow preserved
- Supabase reads true
- Supabase writes true
- storage writes false
- storage actions false
- schema changes false
- builder table changes false
- file deletes false
- HTML route deletes false
- Stream Bandit shell changes false
- active menu promotion false
- index promotion false
- shared rail true
- body actions preserved true
- inputs in overlays true
- outputs on page true
- local top buttons hidden true
- global rail projector true
- sort order stored in `settings_json`
- page type stored in `settings_json`
- page indent stored in `settings_json`
- SEO stored in `settings_json`
- domain/hosting planning stored in `settings_json`
- guarded delete overlay true
- global helper preserved true
- personal workspace scoped true
- platform owner can see all rows
- creator users can only see own rows
- admin role alone does not expose workspaces
- reserved slugs protected: `landing`, `home`, `home-page`
- compact page tabs true
- page cards menu style true
- expanded icon picker true
- SEO inputs true
- domain/hosting planning inputs true
- controlled preview true
- collapsible page menu true
- expand preview true
- responsive preview modes: desktop, tablet, mobile
- drag reorder true
- sub-tab indent true
- tiny edit/delete buttons true
- guarded Supabase row delete true
- DNS automation false
- domain automation false
- source `supabase`
- page count 11
- visible page count 11
- save all pages passed
- last error empty

Passed behavior:

- Pages Manager now acts as the Web Builder page creation and readiness control centre.
- It keeps the existing working page row create/edit/save/delete flow.
- It keeps guarded delete and protects reserved slugs.
- It never deletes HTML files, routes, storage, domains, DNS records, assets or app pages.
- It keeps the shared Web Builder global projector, rail/search, uploaded logo/avatar and Hub/account overlay.
- It keeps inputs in overlays and outputs on page.
- It adds the richer icon picker pattern needed to match Menu Builder and Preview.
- It adds SEO write-up fields for each page.
- It adds domain, subdomain and hosting readiness planning fields for each page.
- It adds controlled on-page preview output.
- It adds page menu collapse control.
- It adds preview expand/full-width control.
- It adds desktop, tablet and mobile preview modes.
- It keeps route buttons for Web Builder / Publish, Published Preview, Page Menu, Header/Footer, Source Map, Form Builder and Owned Inbox.
- It saves future-prep settings into `sb_site_pages.settings_json` without a schema change.

Safety:

- reads `sb_profiles` and `sb_site_pages`
- writes only `sb_site_pages`
- SEO/domain/hosting readiness data is stored inside existing `settings_json`
- no new Supabase table
- no schema change
- no RLS change
- no storage write
- no storage policy change
- no bucket policy change
- no DNS automation
- no live domain automation
- no service-role use
- no Stream Bandit shell change
- no index promotion
- old Web Builder engine/helper behavior preserved

Pages Manager saved data model:

- `settings_json.page_label`
- `settings_json.page_icon`
- `settings_json.nav_visible`
- `settings_json.page_indent`
- `settings_json.sort_order`
- `settings_json.page_type`
- `settings_json.web_builder_seo.title`
- `settings_json.web_builder_seo.description`
- `settings_json.web_builder_seo.keywords`
- `settings_json.web_builder_seo.socialTitle`
- `settings_json.web_builder_seo.socialDescription`
- `settings_json.web_builder_seo.socialImage`
- `settings_json.web_builder_seo.canonicalUrl`
- `settings_json.web_builder_seo.indexing`
- `settings_json.web_builder_hosting.customDomain`
- `settings_json.web_builder_hosting.subdomain`
- `settings_json.web_builder_hosting.hostingStatus`
- `settings_json.web_builder_hosting.sslStatus`
- `settings_json.web_builder_hosting.deployTarget`
- `settings_json.web_builder_hosting.notes`

Future Pages Manager ideas recorded:

- Pages Manager should be ready for everything the Web Builder page workflow is likely to need.
- Pages Manager remains the place where Web Builder pages are created, selected, arranged and prepared before editing.
- Future page readiness can build on SEO, domain, subdomain, hosting and responsive preview planning already saved in `settings_json`.
- Future domain/deploy features must stay owner-safe and require a separate approval gate before any DNS or hosting automation.
- Future builder tables may be considered later, but this pass intentionally stays on `sb_site_pages` and `settings_json`.

## Control Map no-fix pass recorded

Route:

`web-builder-control-map-v7-12-253-test.html?page=<slug>`

Code version confirmed passed:

`V7.12.299.19 Web Builder Control Map Global Rail Pass`

Manifest record pass:

`V7.12.300.46 Web Builder Control Map No-Fix Stability Pass`

Owner confirmed status:

PASSED FULLY / NO PAGE CODE CHANGE NEEDED.

Owner supplied live page debug result:

- checked true
- allowed true
- signed in true
- platform_owner profile confirmed
- builder planning lock passed
- global rail projector true
- Web Builder shell true
- local top buttons hidden true
- body actions preserved true
- overlay inputs true
- read-only planning page true
- control map builder lock true
- active registry protected true
- Web Builder functions allowed true
- personal workspace rule confirmed
- platform owner override only confirmed
- admin role alone does not expose workspaces confirmed
- safe routes visible 19
- protected areas visible 8
- future systems visible 6
- route checks run completed
- all 19 route checks returned OK 200

Passed behavior:

- safe routes list works
- protected areas list works
- future systems list works
- route checks work
- detail/overlay behavior works
- Copy Report works
- Open route links work
- global Web Builder rail/search/projector is present
- active registry remains protected
- current Stream Bandit shell files remain untouched
- page already does what it needs to do
- no edit/create/delete is required on Control Map now because this page is a read-only action/button ownership truth page, not the editor itself

Safety:

- reads `sb_profiles`
- browser route checks only read same-origin files
- no Supabase writes
- no schema change
- no storage action
- no helper changes
- no Stream Bandit branding change
- no Stream Bandit shell change
- no active menu promotion
- no index promotion
- no builder table changes
- no global helper rewrite
- old Web Builder engine/helper behavior preserved

Decision:

Control Map should not be rewritten now. It is promoted by confirmation and manifest record only. Future action/button ownership work must be additive and only if a concrete problem appears.

## Route Map no-fix pass recorded

Route:

`web-builder-route-map-v7-12-252-test.html?page=<slug>`

Code version confirmed passed:

`V7.12.299.18 Web Builder Route Map Global Rail Pass`

Manifest record pass:

`V7.12.300.45 Web Builder Route Map No-Fix Stability Pass`

Owner confirmed status:

PASSED FULLY / NO PAGE CODE CHANGE NEEDED.

Owner supplied live page debug result:

- checked true
- allowed true
- signed in true
- platform_owner profile confirmed
- builder planning lock passed
- global rail projector true
- Web Builder shell true
- local top buttons hidden true
- body actions preserved true
- overlay inputs true
- read-only planning page true
- route map builder lock true
- route count 25
- visible route count 25
- Check Routes run completed
- all 25 route checks returned OK 200

Passed behavior:

- route truth table works
- route filter works
- Check Routes works
- Copy Report works
- Detail overlay works
- Open route links work
- global Web Builder rail/search/projector is present
- page already does what it needs to do
- no edit/create/delete is required on Route Map because this page is a read-only route-health truth page, not an editor

Safety:

- reads `sb_profiles`
- browser route checks only read same-origin files
- no Supabase writes
- no schema change
- no storage action
- no index promotion
- no Stream Bandit shell promotion
- no global helper rewrite
- old Web Builder engine/helper behavior preserved

Decision:

Route Map should not be rewritten now. It is promoted by confirmation and manifest record only. Future route-health work must be additive and only if a concrete problem appears.

## Source Map pass recorded

Route:

`web-builder-pages-source-map-v7-12-255-test.html?page=<slug>`

Passed version:

`V7.12.300.44 Web Builder Source Map Global Projector Rail Search Pass`

Owner confirmed status:

PASSED FULLY.

Purpose:

Source Map is the Web Builder source/render/publish truth checker. It is not another editor.

Confirmed latest behavior:

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
- Web Builder shared global projector restored
- shared uploaded logo/avatar restored
- floating Hub/account overlay restored
- global Web Builder rail/search restored exactly like the other Web Builder pages
- rail/search passed owner click test
- every visible button clicked by owner and worked

Safety:

- reads `sb_profiles` and `sb_site_pages`
- no Supabase writes
- no schema change
- no storage action
- no fake publish
- no index promotion
- old Web Builder engine/helper behavior preserved

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

Owner confirmed live route:

`https://chatterfriendsstreambandit.co.uk/web-builder-preview-owned-v7-12-257-test.html`

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
- applied menu/header/footer output showed correctly across the chosen preview pages
- no schema change
- no storage action
- no Header/Footer builder change
- no index promotion

## Header/Footer Builder pass recorded

Route:

`web-builder-header-footer-code-v7-12-254-test.html?page=<slug>`

Passed version:

`V7.12.300.42 Web Builder Header Footer Rail Search Workspace Apply Pass`

Owner confirmed status:

PASSED FULLY.

Passed behavior:

- Header/Footer Builder page's own Web Builder rail and search were restored in the actual page header
- the builder rail is a tidy horizontal scroll rail
- search filters the rail links and Enter/Go opens the best match
- existing Header/Footer Builder layout remained intact
- overlays remained intact
- selected page save still works
- apply-to-workspace-pages checkbox applies the current header/footer shell to every selected user-created page slug in the same workspace
- applied header/footer shell appeared correctly on every chosen preview page
- save writes the shared shell into each page row's existing `settings_json`
- each page row preserves its other settings_json keys
- platform owner scope remains workspace-safe and does not apply one user's shell to unrelated workspaces
- no schema change
- no storage action
- no Header/Footer custom-code execution change
- no index promotion

Header/Footer apply data model:

- `settings_json.web_builder_shell`
- `settings_json.web_builder_header_footer_builder`
- `settings_json.site_name`
- `settings_json.footer_title`
- `settings_json.footer_text`
- `settings_json.header_footer_updated_at`
- `settings_json.header_footer_status`
- `settings_json.header_footer_apply_source`
- optional `settings_json.header_footer_apply_scope`
- optional `settings_json.header_footer_applied_from_slug`

## Web Builder engine / global pages memory note

The owner remembered that the Web Builder engine was previously helping some global pages. This must be treated as an active dependency risk during later cleanup.

Rules for future passes:

- do not remove the Web Builder global projector, global helpers, global rail bridge, or engine-style helper behavior just because a page now has a cleaner standalone pass
- global watch/browse/settings pages may still depend on helper behavior that came from earlier Web Builder engine work
- verify with Source Map, Route Map, Control Map and page-specific smoke tests before retiring any helper
- record engine/helper dependencies in the manifest instead of guessing
- no schema change, storage action or final index promotion is approved by this memory note

## Product ownership correction

### Pages Manager

Route:

`web-builder-pages-manager-owned-v7-12-256-test.html`

Correct product role:

- This is the Web Builder page creation, ordering, ownership and readiness control centre.
- It creates and edits page rows in `sb_site_pages`.
- It owns page-level metadata, icon, order, indent, visibility, type, SEO planning and domain/hosting readiness planning.
- It should be ready for future builder needs without forcing a schema change too early.
- It is allowed to write page row settings, but it must keep guarded delete and owner/workspace scope.
- It must keep inputs in overlays and outputs visible on-page.
- It must not perform DNS, hosting, storage policy, bucket policy or index promotion actions.

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

Pages Manager saves page metadata and future-readiness planning into:

`sb_site_pages.settings_json`

Pages Manager fields recorded by this checkpoint:

- `settings_json.page_label`
- `settings_json.page_icon`
- `settings_json.nav_visible`
- `settings_json.page_indent`
- `settings_json.sort_order`
- `settings_json.page_type`
- `settings_json.web_builder_seo`
- `settings_json.web_builder_hosting`

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
- Header/Footer apply output fields listed in this manifest
- Pages Manager SEO/domain/hosting readiness fields listed in this manifest

## Domain, subdomain and hosting requirement

Web Builder still needs future domain/subdomain/hosting support as part of the builder-owned product area:

- custom domain mapping
- subdomain mapping
- hosting/deploy readiness
- SSL/DNS guidance
- publish status and rollback status
- owner-safe approval gates

Pages Manager now stores page-level domain/subdomain/hosting readiness planning inside `settings_json`, but this is planning data only.

No domain table, DNS write, hosting automation, schema change, RLS change or final index promotion is approved by this checkpoint.

## User-facing Web Builder group

1. `web-builder-account-control-hub-v7-12-263-test.html` - PASS / golden shell
2. `web-builder-pages-manager-owned-v7-12-256-test.html` - PASS / builder polish + SEO/domain planning + preview controls confirmed
3. `overlay-route-truth-machine-v7-12-66-test.html?page=<slug>` - Studio route handoff / preserved
4. `web-builder-preview-owned-v7-12-257-test.html?page=<slug>` - PASS / menu rail icons + search consumer pass confirmed
5. `web-builder-menu-builder-owned-v7-12-264-test.html?page=<slug>` - PASS / Page Menu Builder / icon restore + published menu set apply confirmed
6. `web-builder-form-designer-owned-v7-12-258-test.html?page=<slug>` - PASS
7. `web-builder-form-inbox-owned-v7-12-258-test.html?page=<slug>` - PASS / protected inbox bridge
8. `web-builder-assets-v7-12-252-test.html?page=<slug>` - PASS
9. `web-builder-route-map-v7-12-252-test.html?page=<slug>` - PASS / no-fix stability pass / route checks all OK 200
10. `web-builder-control-map-v7-12-253-test.html?page=<slug>` - PASS / no-fix stability pass / control map checks all OK 200
11. `web-builder-pages-source-map-v7-12-255-test.html?page=<slug>` - PASS / global projector rail search + truth checker confirmed
12. `web-builder-header-footer-code-v7-12-254-test.html?page=<slug>` - PASS / rail search + apply shell to workspace pages confirmed
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

1. Form Designer, Inbox and Assets smoke checks against Source Map.
2. Web Builder engine/global helper dependency audit across global pages.
3. Domain/subdomain/hosting readiness remains future builder-owned product work beyond the planning fields now stored by Pages Manager.
4. Final `index.html` promotion happens only after full Web Builder group pass and owner approval.
