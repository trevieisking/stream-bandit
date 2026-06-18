# Web Builder Manifest V7.13.022

## Purpose

This manifest tracks Web Builder as its own builder product area inside Stream Bandit.

The Stream Bandit movie/app manifest remains separate.

## Current checkpoint status

Status: WEB BUILDER STUDIO V7.13.021 PASSED / DRAFT PREVIEW DEVICE SIZING PASSED / FULL PREVIEW SEPARATE PASSED / FORM DESIGNER PASSED / PLANNING MOVED OUT OF STUDIO / READ-ONLY MAP GROUP PASSED / GLOBAL FOOTER MESSENGER BORROW RULE RECORDED / FINAL INDEX PROMOTION NOT DONE.

Latest recorded Web Builder manifest pass:

`V7.13.022 Web Builder Manifest Studio Draft Preview Boundary Pass`

Latest working page passes recorded:

- `V7.13.021 Web Builder Studio Draft Preview Device Sizing`
- `V7.13.016 Web Builder Full Preview Compositor Pass`
- `V7.13.010 Web Builder Planning Map / Studio Planning Split`
- `V7.12.300.53 Form Designer Safe Loader Kind Fix`
- `V7.12.299.19 Web Builder Control Map Global Rail Pass`
- `V7.12.300.44 Web Builder Source Map Global Projector Rail Search Pass`
- `V7.12.300.47 Web Builder Pages Manager Builder Polish SEO Domain Preview Controls Pass`
- `V7.12.300.42 Web Builder Header Footer Rail Search Workspace Apply Pass`
- `V7.12.300.41 Web Builder Owned Preview Menu Rail Icons Search Pass`
- `V7.12.300.40 Page Menu Builder Icon Restore + Published Menu Set Pass`

## Current governing rules

- Web Builder is its own builder product area, not the main Stream Bandit movie app shell.
- Main Stream Bandit app routes, player routes, movie routes, accessibility/audio boost and main app form-builder systems are separate from Web Builder.
- The main app has its own Form Builder/Form Builder 2 area. Do not mix it with Web Builder Form Designer.
- Web Builder Form Designer route is `web-builder-form-designer-owned-v7-12-258-test.html` and remains do-not-touch unless a real break appears.
- Hub remains the visual gold standard.
- User-facing Web Builder pages use the shared global rail/projector where already passed.
- Inputs belong in overlays where users create, edit, remove, reorder or confirm something.
- Outputs stay visible on-page.
- Read-only pages are allowed only when they are useful inspectors, truth checkers or route/action maps.
- No schema, RLS, storage policy, bucket policy, service-role, payment provider, DNS automation or final live-home replacement is approved by this checkpoint.
- Web Builder passed pages are recorded here instead of replacing the main `index.html` until the full Web Builder group pass is approved.
- If a page already passes and nothing visible is broken, do not rewrite it just to increase a version number. Record the pass, preserve the working code, and move to the next planned page.
- Planning belongs on the Planning Map, not inside the live Studio canvas.
- Private Messages are owned by the main app global footer messenger. Builder pages may borrow that overlay; do not rebuild full inbox overlays inside individual builder pages.
- Slug, title, status, load, save, preview, form and form inbox controls on Studio are owned by the live builder panel. Do not duplicate those controls in the outer Studio shell.
- Studio Draft Preview is body/cards only.
- Published Full Preview is the separate complete published page and shows header, footer, menus and full composed result.
- Do not iframe the whole Published Preview page inside Studio.
- Do not rebuild the full Published Preview compositor inside Studio unless a separate safe component strategy is approved.

## Page status board

| Area | Route | Current status | Tables needed | Writes |
| --- | --- | --- | --- | --- |
| Hub | `web-builder-account-control-hub-v7-12-263-test.html` | Working doorway / visual standard | `sb_profiles`, `sb_site_pages` | none expected |
| Pages Manager | `web-builder-pages-manager-owned-v7-12-256-test.html` | Passed full page manager/control centre | `sb_profiles`, `sb_site_pages` | `sb_site_pages` |
| Studio | `overlay-route-truth-machine-v7-12-66-test.html?page=<slug>` | Passed V7.13.021 / stable builder + draft preview device sizing | `sb_profiles`, `sb_site_pages` | `sb_site_pages` through existing builder engine |
| Published Full Preview | `web-builder-preview-owned-v7-12-257-test.html?page=<slug>` | Passed V7.13.016 / complete published preview | `sb_profiles`, `sb_site_pages` | form submissions only when preview form is submitted |
| Page Menu Builder | `web-builder-menu-builder-owned-v7-12-264-test.html?page=<slug>` | Passed | `sb_profiles`, `sb_site_pages` | `sb_site_pages.settings_json` |
| Header/Footer Builder | `web-builder-header-footer-code-v7-12-254-test.html?page=<slug>` | Passed builder, writes real shell data | `sb_profiles`, `sb_site_pages` | `sb_site_pages.settings_json.web_builder_shell` |
| Web Builder Form Designer | `web-builder-form-designer-owned-v7-12-258-test.html?page=<slug>` | Passed / do not touch | `sb_profiles`, `sb_site_pages`, form tables | form submissions + private messages from existing flow |
| Web Builder Form Inbox | `web-builder-form-inbox-owned-v7-12-258-test.html?page=<slug>` | Passed protected inbox/private-message bridge | `sb_profiles`, `sb_site_pages`, `sb_form_submissions`, `sb_private_messages` | private-message replies/actions from existing flow |
| Assets | `web-builder-assets-v7-12-252-test.html` | Passed asset route | existing asset/profile tables/storage as already wired | existing asset flow only |
| Planning Map | `web-builder-route-map-v7-12-252-test.html` | Passed read-only planning destination | `sb_profiles`, `sb_site_pages` | none |
| Control Map | `web-builder-control-map-v7-12-253-test.html` | Passed read-only control map | `sb_profiles`, `sb_site_pages` | none |
| Source Map | `web-builder-pages-source-map-v7-12-255-test.html` | Passed read-only source/debug map | `sb_profiles`, `sb_site_pages` | none |

## Studio pass recorded

Route:

`overlay-route-truth-machine-v7-12-66-test.html?page=<slug>`

Passed version:

`V7.13.021 Web Builder Studio Draft Preview Device Sizing`

Owner confirmed status:

PASSED FULL PAGE / PERFECT / DO NOT REWRITE PREVIEW INSIDE STUDIO.

Passed behavior:

- page loads and shows current Studio version
- global rail/search/hub/avatar remains present
- planning panels removed from Studio body
- builder canvas loads
- Load works
- Save + Publish works
- Open Preview works from the builder panel
- Open Form works from the builder panel
- Form Inbox remains available as the full page from the builder panel
- Private Messages uses the exact main app global footer messenger overlay
- duplicate outer shell controls removed
- slug/title/status/load/save/preview/form/form-inbox remain controlled by the builder panel
- Desktop / Tablet / Mobile affects builder canvas frame
- Desktop / Tablet / Mobile affects Draft Preview frame
- Draft Preview is restored and improved
- Draft Preview is clearly body/cards only
- Full Preview remains separate and complete
- no iframe
- no full-preview embed inside Studio
- no preview compositor rewrite inside Studio

Important fixes recorded:

- Footer owns the Private Messages overlay.
- Studio borrows `stream-bandit-footer-shell-v7-12-156.js` and calls `StreamBanditFooterShell.openMessages()`.
- The full footer shell is hidden on Studio; only the global Private Messages overlay is borrowed.
- Do not build one-off message overlays on each builder page.
- Studio Draft Preview is body/card preview only.
- Full Preview is the separate published result.

Rejected attempts recorded:

- `V7.13.017 Web Builder Studio Full Preview Bridge` rejected because it embedded the whole Published Preview page in Studio.
- `V7.13.019 Web Builder Studio Preview-Only Compositor` rejected because it broke the builder engine load.
- `V7.13.020 Web Builder Studio Stable Restore` accepted as emergency restore, then superseded by `V7.13.021` after draft preview device sizing passed.

Safety:

- no schema change
- no RLS change
- no storage action
- no new Supabase table
- no DNS automation
- no index promotion
- no Form Designer touch
- no main app Form Builder/Form Builder 2 touch
- no app index promotion

## Published Full Preview pass recorded

Route:

`web-builder-preview-owned-v7-12-257-test.html?page=<slug>`

Passed version:

`V7.13.016 Web Builder Full Preview Compositor Pass`

Owner confirmed status:

PASSED AGAIN / THIS IS THE FULL PREVIEW WEB BUILDER SHOULD OPEN WHEN USERS NEED COMPLETE PUBLISHED RESULT.

Passed behavior:

- reads `sb_profiles`
- reads `sb_site_pages`
- consumes page body / layout data
- consumes Page Menu Builder output from `settings_json.page_menu_set` / related key
- consumes Header/Footer Builder output from `settings_json.web_builder_shell`
- renders header shell
- renders page menu output
- renders page body blocks/cards/forms/media
- renders footer shell
- has Desktop / Tablet / Mobile preview controls
- remains separate from Studio Draft Preview
- no schema change
- no index promotion

Next polish target:

`web-builder-preview-owned-v7-12-257-test.html`

Polish goals:

- keep it full preview only
- improve visible route labels and helper copy
- keep header/footer/menu/body composition clear
- keep Web Builder Form Designer separate from main app Form Builder/Form Builder 2
- preserve owner/workspace locks
- preserve `sb_site_pages` read/write boundaries
- no live promotion yet

## Planning Map pass recorded

Route:

`web-builder-route-map-v7-12-252-test.html?page=<slug>`

Passed version:

`V7.13.010 Web Builder Planning Map / Studio Planning Split`

Owner confirmed status:

PASSED READ-ONLY PLANNING PAGE.

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
- no index promotion
- no Stream Bandit app shell change

## Web Builder Form Designer pass recorded

Route:

`web-builder-form-designer-owned-v7-12-258-test.html?page=<slug>`

Passed version:

`V7.12.300.53 Form Designer Safe Loader Kind Fix`

Owner confirmed status:

PASSED FULLY / DO NOT TOUCH UNLESS NECESSARY.

Important separation rule:

This is Web Builder Form Designer. It is not the main app Form Builder/Form Builder 2.

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

- The Form Designer patches the private message insert kind from `form_private_message` to `message`.
- Form identity remains in `meta.source`.
- This matches the working `sb_private_messages` rows and avoids the `sb_private_messages_kind_check` failure.

## Control Map no-fix pass recorded

Route:

`web-builder-control-map-v7-12-253-test.html?page=<slug>`

Code version confirmed passed:

`V7.12.299.19 Web Builder Control Map Global Rail Pass`

Manifest status:

PASSED FULLY / NO PAGE CODE CHANGE NEEDED.

## Source Map no-fix pass recorded

Route:

`web-builder-pages-source-map-v7-12-255-test.html?page=<slug>`

Code version confirmed passed:

`V7.12.300.44 Web Builder Source Map Global Projector Rail Search Pass`

Manifest status:

PASSED FULLY / NO PAGE CODE CHANGE NEEDED.

## Pages Manager builder polish pass recorded

Route:

`web-builder-pages-manager-owned-v7-12-256-test.html?page=<slug>`

Passed version:

`V7.12.300.47 Owned Pages Manager Builder Polish SEO Domain Preview Controls`

Owner confirmed status:

PASSED FULLY.

## Header/Footer Builder status

Route:

`web-builder-header-footer-code-v7-12-254-test.html?page=<slug>`

Current status:

PASSED AND CONSUMED BY FULL PREVIEW.

Known save target:

- `sb_site_pages.settings_json.web_builder_shell`

Safety gate before touching:

- Do not alter Stream Bandit app header/footer shell.
- Do not introduce unsafe custom code execution.
- Keep custom code disabled unless a later protected owner-only gate is approved.

## Current safe build order

1. Studio: passed V7.13.021 / do not rewrite preview inside Studio.
2. Full Preview: passed V7.13.016 / next polish target.
3. Web Builder Form Designer: passed / do not touch.
4. Planning Map: passed / read-only.
5. Control Map: passed / read-only.
6. Source Map: passed / read-only.
7. Pages Manager: passed.
8. Page Menu Builder: passed.
9. Header/Footer Builder: passed.
10. Manifest: updated to V7.13.022.
11. Full Preview polish pass: next.
12. Web Builder group pass: after Full Preview polish.
13. Final index promotion: not approved.

## Supabase table requirements by current page group

Read-only map group:

- `sb_profiles`
- `sb_site_pages`

Studio / Pages / Menu / Header/Footer / Preview group:

- `sb_profiles`
- `sb_site_pages`

Web Builder Form group:

- `sb_profiles`
- `sb_site_pages`
- `sb_form_submissions`
- `sb_private_messages`

Messages overlay group:

- `sb_private_messages`
- `sb_profiles`
- `sb_user_friends`
- `sb_user_blocks`

Main app Form Builder/Form Builder 2 is separate and not included in this Web Builder group pass.

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
- Do not touch main app Form Builder/Form Builder 2 while polishing Web Builder Form Designer or Preview.
- Do not touch player comfort/accessibility/audio boost pages.
- Do not touch Supabase migration/test/reference pages unless explicitly working on them.
- Do not change storage buckets or policies.
- Do not add payment/signup/creator billing flows.
- Do not connect DNS/domain automation.
- Do not delete working Web Builder pages just to reduce file count.
- Reuse old safe pages only when needed and after scanning.

## Decision record

Studio is passed at `V7.13.021` and must stay builder-first.

Studio Draft Preview is body/cards only.

Published Full Preview is the complete composed published page.

The full preview should be polished next, but not embedded into Studio.

Control Map and Source Map are passed no-fix pages. Their very large debug outputs are acceptable because they are inspector/map pages.

Planning Map is the permanent home for planning panels removed from Studio.

Web Builder Form Designer is protected after a difficult pass and should not be touched unless a real break appears.

Main app Form Builder/Form Builder 2 is a different system and must not be confused with Web Builder Form Designer.
