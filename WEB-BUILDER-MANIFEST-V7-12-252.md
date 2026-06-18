# Web Builder Manifest V7.13.011

## Purpose

This manifest tracks Web Builder as its own builder product area inside Stream Bandit.

The Stream Bandit movie/app manifest remains separate.

## Current checkpoint status

Status: WEB BUILDER READ-ONLY MAP GROUP PASS / FORM DESIGNER PASS / PLANNING MOVED OUT OF STUDIO / STUDIO CLEANUP NEXT / HEADER-FOOTER BUILDER LATER / FINAL INDEX PROMOTION NOT DONE.

Latest recorded Web Builder manifest pass:

`V7.13.011 Web Builder Manifest Planning + Read-Only Group Pass`

Latest working page passes recorded:

- `V7.12.300.53 Form Designer Safe Loader Kind Fix`
- `V7.13.010 Web Builder Planning Map / Studio Planning Split`
- `V7.12.299.19 Web Builder Control Map Global Rail Pass`
- `V7.12.300.44 Web Builder Source Map Global Projector Rail Search Pass`
- `V7.12.300.47 Web Builder Pages Manager Builder Polish SEO Domain Preview Controls Pass`
- `V7.12.300.42 Web Builder Header Footer Rail Search Workspace Apply Pass`
- `V7.12.300.41 Web Builder Owned Preview Menu Rail Icons Search Pass`
- `V7.12.300.40 Page Menu Builder Icon Restore + Published Menu Set Pass`

## Current governing rule

- Web Builder is its own builder product area, not the main Stream Bandit movie app shell.
- Hub remains the visual gold standard.
- User-facing Web Builder pages use the shared global rail/projector.
- Inputs belong in overlays where users create, edit, remove, reorder or confirm something.
- Outputs stay visible on-page.
- Read-only pages are allowed only when they are useful inspectors, truth checkers or route/action maps.
- No schema, RLS, storage policy, bucket policy, service-role, payment provider, DNS automation or final live-home replacement is approved by this checkpoint.
- Web Builder passed pages are recorded here instead of replacing the main `index.html` until the full Web Builder group pass is approved.
- The older Web Builder engine/global helper relationship may still be helping some global pages. Do not remove or bypass those helpers until Studio, Source Map, Route Map and global page scans confirm the dependency is safe to retire.
- If a page already passes and nothing visible is broken, do not rewrite it just to increase a version number. Record the pass, preserve the working code, and move to the next planned page.
- Form Designer is now a do-not-touch page unless a real break appears.
- Planning belongs on the Planning Map, not inside the live Studio canvas.

## Page status board

| Area | Route | Current status | Tables needed | Writes |
| --- | --- | --- | --- | --- |
| Hub | `web-builder-account-control-hub-v7-12-263-test.html` | Working doorway / visual standard | `sb_profiles`, `sb_site_pages` | none expected |
| Pages Manager | `web-builder-pages-manager-owned-v7-12-256-test.html` | Passed full page manager/control centre | `sb_profiles`, `sb_site_pages` | `sb_site_pages` |
| Studio | `overlay-route-truth-machine-v7-12-66-test.html?page=<slug>` | Next cleanup target | `sb_profiles`, `sb_site_pages` | `sb_site_pages` through existing builder engine |
| Published Preview | `web-builder-preview-owned-v7-12-257-test.html?page=<slug>` | Passed | `sb_profiles`, `sb_site_pages` | none expected |
| Menu Builder | `web-builder-menu-builder-owned-v7-12-264-test.html?page=<slug>` | Passed | `sb_profiles`, `sb_site_pages` | `sb_site_pages.settings_json` |
| Form Designer | `web-builder-form-designer-owned-v7-12-258-test.html?page=<slug>` | Passed / do not touch | `sb_profiles`, `sb_site_pages`, form tables | form submissions + private messages from existing flow |
| Form Inbox | `web-builder-form-inbox-owned-v7-12-258-test.html?page=<slug>` | Passed protected inbox/private-message bridge | `sb_profiles`, `sb_site_pages`, `sb_form_submissions`, `sb_private_messages` | private-message replies/actions from existing flow |
| Assets | `web-builder-assets-v7-12-252-test.html` | Passed asset route | existing asset/profile tables/storage as already wired | existing asset flow only |
| Planning Map | `web-builder-route-map-v7-12-252-test.html` | Passed read-only planning destination | `sb_profiles`, `sb_site_pages` | none |
| Control Map | `web-builder-control-map-v7-12-253-test.html` | Passed read-only control map | `sb_profiles`, `sb_site_pages` | none |
| Source Map | `web-builder-pages-source-map-v7-12-255-test.html` | Passed read-only source/debug map | `sb_profiles`, `sb_site_pages` | none |
| Header/Footer Builder | `web-builder-header-footer-code-v7-12-254-test.html` | Later / harder write page | `sb_profiles`, `sb_site_pages` | `sb_site_pages.settings_json.web_builder_shell` |

## Form Designer pass recorded

Route:

`web-builder-form-designer-owned-v7-12-258-test.html?page=<slug>`

Passed version:

`V7.12.300.53 Form Designer Safe Loader Kind Fix`

Owner confirmed status:

PASSED FULLY / DO NOT TOUCH UNLESS NECESSARY.

Owner confirmed behavior:

- form saves now
- form submits to inbox properly
- form submits to private messages
- email draft/preview works
- page has global rail
- page has search
- page has hub/avatar
- page is functional and visually appealing
- page should not be touched unless necessary

Important fix recorded:

- The Form Designer now patches the private message insert kind from `form_private_message` to `message`.
- Form identity remains in `meta.source`.
- This matches the working `sb_private_messages` rows and avoids the `sb_private_messages_kind_check` failure.

Safety:

- no schema change
- no RLS change
- no storage action
- no new table
- no index promotion
- no Stream Bandit app shell change
- no additional page created

Future note:

- Email draft wording can be polished later to clearly explain: copy the email body, click open, then paste if the mail app does not auto-fill.
- Do not perform that polish now unless the page is already being touched for another necessary reason.

## Planning Map pass recorded

Route:

`web-builder-route-map-v7-12-252-test.html?page=<slug>`

Passed version:

`V7.13.010 Web Builder Planning Map / Studio Planning Split`

Owner confirmed status:

PASSED READ-ONLY PLANNING PAGE.

Purpose:

- Planning content was moved out of the working Studio page and into this existing Route Map page.
- No new file was created.
- The Planning Map is now the destination for Web Builder planning, route truth, systems planning and future table planning.

Planning areas now owned by Planning Map:

- Theme / Brand / Font plan
- Header / Footer / Navigation plan
- Feature ownership plan
- Builder-owned systems map
- Future Supabase table plan
- Route truth / build order

Safety:

- reads `sb_profiles` and `sb_site_pages`
- read-only page
- no Supabase writes
- no schema change
- no RLS change
- no storage write
- no storage policy change
- no bucket policy change
- no DNS automation
- no index promotion
- no Stream Bandit app shell change

## Control Map no-fix pass recorded

Route:

`web-builder-control-map-v7-12-253-test.html?page=<slug>`

Code version confirmed passed:

`V7.12.299.19 Web Builder Control Map Global Rail Pass`

Manifest status:

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

Safety:

- reads `sb_profiles` and `sb_site_pages`
- Supabase writes false
- storage writes false
- schema changes false
- storage actions false
- helper changes false
- Stream Bandit branding changes false
- Stream Bandit shell changes false
- active menu promotion false
- index promotion false

## Source Map no-fix pass recorded

Route:

`web-builder-pages-source-map-v7-12-255-test.html?page=<slug>`

Code version confirmed passed:

`V7.12.300.44 Web Builder Source Map Global Projector Rail Search Pass`

Manifest status:

PASSED FULLY / NO PAGE CODE CHANGE NEEDED.

Owner supplied status:

- debug is very large because it is a real source/debug map
- page fully functions
- checked true
- allowed true
- signed in true
- platform_owner profile confirmed
- canUseBuilder true
- reads and displays `sb_site_pages` source data
- displays `layout_json`
- displays `settings_json`
- displays page menu data
- displays header/footer shell data
- displays revisions, SEO and publish data

Why the huge debug is acceptable:

- Source Map is a read-only inspector/debug page.
- It is expected to expose large route/page/settings/source truth.
- It is not a normal creator-facing builder canvas.

Safety:

- reads `sb_profiles` and `sb_site_pages`
- no Supabase writes recorded for this pass
- no schema change
- no RLS change
- no storage write
- no storage policy change
- no bucket policy change
- no index promotion
- no Stream Bandit app shell change

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

## Header/Footer Builder status

Route:

`web-builder-header-footer-code-v7-12-254-test.html?page=<slug>`

Current status:

PASSED PREVIOUSLY BUT HARDER THAN READ-ONLY MAPS BECAUSE IT WRITES REAL HEADER/FOOTER SHELL DATA.

Known save target:

- `sb_site_pages.settings_json.web_builder_shell`

Known behavior:

- Builds Web Builder header/footer shell data.
- Saves header/footer/footer-button/link/column data into existing `settings_json`.
- Does not require new Supabase tables for the next review pass.

Safety gate before touching:

- Do not touch until Studio cleanup is either complete or explicitly skipped.
- Do not alter Stream Bandit app header/footer shell.
- Do not introduce custom code execution or unsafe script injection.
- Keep custom code disabled unless a later protected owner-only gate is approved.

## Studio cleanup next

Route:

`overlay-route-truth-machine-v7-12-66-test.html?page=<slug>`

Current role:

The actual Web Builder Studio page.

Next planned pass:

Remove planning clutter from the Studio page and leave it focused on building.

Must stay on Studio:

- global Web Builder rail/search/hub/avatar
- current page slug selector
- desktop/tablet/mobile preview controls
- actual builder engine/canvas
- save and publish flow
- draft preview
- form route link
- inbox bridge link/overlay
- owner/workspace lock
- compact debug/status

Must not stay on Studio:

- Theme / Brand / Font planning panels
- Header/Footer Navigation planning panels
- Feature Ownership plan
- Builder-owned Systems Map
- Future Supabase table plan
- most “owns later / planned later / future” content

Where removed planning belongs:

`web-builder-route-map-v7-12-252-test.html`

Tables needed for Studio cleanup:

- `sb_profiles`
- `sb_site_pages`

Safety gate:

- Keep existing builder engine behavior.
- Keep save/publish behavior.
- Keep owner/workspace locks.
- Keep global rail/projector.
- Do not change schema, RLS, storage, DNS, index or main Stream Bandit shell.
- Do not touch Form Designer as part of Studio cleanup.

## Current safe build order

1. Form Designer: passed / do not touch.
2. Planning Map: passed / read-only.
3. Control Map: passed / read-only.
4. Source Map: passed / read-only.
5. Manifest: updated to V7.13.011.
6. Studio cleanup: next.
7. Header/Footer Builder: later, because it writes `settings_json.web_builder_shell`.
8. Group pass: only after Studio and Header/Footer are both reviewed.
9. Final index promotion: not approved.

## Supabase table requirements by current page group

Read-only map group:

- `sb_profiles`
- `sb_site_pages`

Studio / Pages / Menu / Header/Footer group:

- `sb_profiles`
- `sb_site_pages`

Form group:

- `sb_profiles`
- `sb_site_pages`
- `sb_form_submissions`
- `sb_private_messages`

Do not create future builder tables yet. Future table names remain planning only unless a separate migration is approved.

Future planning-only table names:

- `sb_builder_accounts`
- `sb_builder_sites`
- `sb_builder_pages`
- `sb_builder_assets`
- `sb_builder_themes`
- `sb_builder_domains`
- `sb_builder_deploys`
- `sb_builder_revisions`
- `sb_builder_audit_log`

## Protected boundaries

- Do not touch `index.html` for Web Builder until the full group pass is approved.
- Do not touch main Stream Bandit movie app routes.
- Do not touch player comfort/accessibility/audio boost pages.
- Do not touch Supabase migration/test/reference pages unless explicitly working on them.
- Do not change storage buckets or policies.
- Do not add payment/signup/creator billing flows.
- Do not connect DNS/domain automation.
- Do not delete working Web Builder pages just to reduce file count.
- Reuse old safe pages only when needed and after scanning.

## Decision record

Control Map and Source Map are now considered passed no-fix pages. Their very large debug outputs are acceptable because they are inspector/map pages.

Planning Map is the permanent home for planning panels removed from Studio.

Studio is the next real working-page cleanup target.

Form Designer is protected after a difficult pass and should not be touched unless a real break appears.
