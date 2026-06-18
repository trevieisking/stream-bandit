# Web Builder Manifest V7.13.016

## Purpose

This manifest tracks Web Builder as its own builder product area inside Stream Bandit.

The Stream Bandit movie/app manifest remains separate.

## Current checkpoint status

Status: WEB BUILDER STUDIO CLEANUP PASS RECORDED / FORM DESIGNER PASS / PLANNING MOVED OUT OF STUDIO / READ-ONLY MAP GROUP PASS / GLOBAL FOOTER MESSENGER BORROW RULE RECORDED / FULL PREVIEW COMPOSITOR GAP NEXT / FINAL INDEX PROMOTION NOT DONE.

Latest recorded Web Builder manifest pass:

`V7.13.016 Web Builder Manifest Studio Pass + Full Preview Gap Record`

Latest working page passes recorded:

- `V7.13.015 Web Builder Studio Duplicate Controls Cleanup`
- `V7.13.014 Web Builder Studio Global Footer Messenger Overlay Fix`
- `V7.13.010 Web Builder Planning Map / Studio Planning Split`
- `V7.12.300.53 Form Designer Safe Loader Kind Fix`
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
- If a page already passes and nothing visible is broken, do not rewrite it just to increase a version number. Record the pass, preserve the working code, and move to the next planned page.
- Form Designer is now a do-not-touch page unless a real break appears.
- Planning belongs on the Planning Map, not inside the live Studio canvas.
- Private Messages are owned by the main app global footer messenger. Builder pages may borrow that overlay; do not rebuild full inbox overlays inside individual builder pages.
- Slug, title, status, load, save, preview, form and form inbox controls on Studio are owned by the live builder panel. Do not duplicate those controls in the outer Studio shell.

## Page status board

| Area | Route | Current status | Tables needed | Writes |
| --- | --- | --- | --- | --- |
| Hub | `web-builder-account-control-hub-v7-12-263-test.html` | Working doorway / visual standard | `sb_profiles`, `sb_site_pages` | none expected |
| Pages Manager | `web-builder-pages-manager-owned-v7-12-256-test.html` | Passed full page manager/control centre | `sb_profiles`, `sb_site_pages` | `sb_site_pages` |
| Studio | `overlay-route-truth-machine-v7-12-66-test.html?page=<slug>` | Passed V7.13.015 / duplicate controls removed | `sb_profiles`, `sb_site_pages` | `sb_site_pages` through existing builder engine |
| Published Preview | `web-builder-preview-owned-v7-12-257-test.html?page=<slug>` | Passed earlier, now next compositor gap target | `sb_profiles`, `sb_site_pages` | form submissions only when preview form is submitted |
| Menu Builder | `web-builder-menu-builder-owned-v7-12-264-test.html?page=<slug>` | Passed | `sb_profiles`, `sb_site_pages` | `sb_site_pages.settings_json` |
| Header/Footer Builder | `web-builder-header-footer-code-v7-12-254-test.html?page=<slug>` | Passed builder, writes real shell data | `sb_profiles`, `sb_site_pages` | `sb_site_pages.settings_json.web_builder_shell` |
| Form Designer | `web-builder-form-designer-owned-v7-12-258-test.html?page=<slug>` | Passed / do not touch | `sb_profiles`, `sb_site_pages`, form tables | form submissions + private messages from existing flow |
| Form Inbox | `web-builder-form-inbox-owned-v7-12-258-test.html?page=<slug>` | Passed protected inbox/private-message bridge | `sb_profiles`, `sb_site_pages`, `sb_form_submissions`, `sb_private_messages` | private-message replies/actions from existing flow |
| Assets | `web-builder-assets-v7-12-252-test.html` | Passed asset route | existing asset/profile tables/storage as already wired | existing asset flow only |
| Planning Map | `web-builder-route-map-v7-12-252-test.html` | Passed read-only planning destination | `sb_profiles`, `sb_site_pages` | none |
| Control Map | `web-builder-control-map-v7-12-253-test.html` | Passed read-only control map | `sb_profiles`, `sb_site_pages` | none |
| Source Map | `web-builder-pages-source-map-v7-12-255-test.html` | Passed read-only source/debug map | `sb_profiles`, `sb_site_pages` | none |

## Studio pass recorded

Route:

`overlay-route-truth-machine-v7-12-66-test.html?page=<slug>`

Passed version:

`V7.13.015 Web Builder Studio Duplicate Controls Cleanup`

Owner confirmed status:

PASSED.

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
- Private Messages now use the exact main app global footer messenger overlay
- duplicate outer shell controls were removed
- slug/title/status/load/save/preview/form/form-inbox remain controlled by the builder panel
- device preview controls remain visible as shell-only frame-size controls

Important fix recorded:

- Footer owns the Private Messages overlay.
- Studio borrows `stream-bandit-footer-shell-v7-12-156.js` and calls `StreamBanditFooterShell.openMessages()`.
- The full footer shell is hidden on Studio; only the global Private Messages overlay is borrowed.
- Do not build one-off message overlays on each builder page.

Safety:

- no schema change
- no RLS change
- no storage action
- no new Supabase table
- no DNS automation
- no index promotion
- no Form Designer touch
- no app index promotion

## Full Preview compositor gap recorded

Current issue:

The Studio builder's local Draft Preview currently renders only the builder engine's local block preview. It does not yet compose the full published page shell.

Expected next behavior:

- Studio preview should show the same full-page result as Published Preview.
- The preview should include Page Menu Builder output.
- The preview should include Header/Footer Builder output from `settings_json.web_builder_shell`.
- Desktop/tablet/mobile controls should affect the full preview frame, not only the builder canvas frame.
- The builder panel should still own slug/title/status/load/save/preview/form/form-inbox controls.

Likely next target:

`web-builder-preview-owned-v7-12-257-test.html`

Secondary target if needed:

`overlay-route-truth-machine-v7-12-66-test.html`

Tables required:

- `sb_profiles`
- `sb_site_pages`

No new table is approved for this preview compositor pass.

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

Key pass points:

- platform_owner profile confirmed
- builder planning lock passed
- global rail projector true
- read-only planning/control map true
- active registry protected true
- personal workspace rule confirmed
- platform owner override only confirmed
- all route checks returned OK 200
- no Supabase writes
- no storage writes
- no schema changes
- no index promotion

## Source Map no-fix pass recorded

Route:

`web-builder-pages-source-map-v7-12-255-test.html?page=<slug>`

Code version confirmed passed:

`V7.12.300.44 Web Builder Source Map Global Projector Rail Search Pass`

Manifest status:

PASSED FULLY / NO PAGE CODE CHANGE NEEDED.

Why the huge debug is acceptable:

- Source Map is a read-only inspector/debug page.
- It is expected to expose large route/page/settings/source truth.
- It is not a normal creator-facing builder canvas.

## Pages Manager builder polish pass recorded

Route:

`web-builder-pages-manager-owned-v7-12-256-test.html?page=<slug>`

Passed version:

`V7.12.300.47 Owned Pages Manager Builder Polish SEO Domain Preview Controls`

Owner confirmed status:

PASSED FULLY.

Key saved data model:

- `settings_json.page_label`
- `settings_json.page_icon`
- `settings_json.nav_visible`
- `settings_json.page_indent`
- `settings_json.sort_order`
- `settings_json.page_type`
- `settings_json.web_builder_seo.*`
- `settings_json.web_builder_hosting.*`

Safety:

- reads `sb_profiles` and `sb_site_pages`
- writes only `sb_site_pages`
- no new Supabase table
- no schema change
- no RLS change
- no storage write
- no DNS automation
- no index promotion

## Header/Footer Builder status

Route:

`web-builder-header-footer-code-v7-12-254-test.html?page=<slug>`

Current status:

PASSED PREVIOUSLY BUT MUST NOW BE CONSUMED BY FULL PREVIEW.

Known save target:

- `sb_site_pages.settings_json.web_builder_shell`

Known behavior:

- Builds Web Builder header/footer shell data.
- Saves header/footer/footer-button/link/column data into existing `settings_json`.
- Does not require new Supabase tables for the next review pass.

Safety gate before touching:

- Do not alter Stream Bandit app header/footer shell.
- Do not introduce custom code execution or unsafe script injection.
- Keep custom code disabled unless a later protected owner-only gate is approved.

## Current safe build order

1. Form Designer: passed / do not touch.
2. Planning Map: passed / read-only.
3. Control Map: passed / read-only.
4. Source Map: passed / read-only.
5. Studio cleanup: passed V7.13.015.
6. Manifest: updated to V7.13.016.
7. Full Preview compositor: next.
8. Header/Footer Builder consumer check: part of Full Preview compositor.
9. Group pass: only after Full Preview shows page body + page menu + header/footer shell.
10. Final index promotion: not approved.

## Supabase table requirements by current page group

Read-only map group:

- `sb_profiles`
- `sb_site_pages`

Studio / Pages / Menu / Header/Footer / Preview group:

- `sb_profiles`
- `sb_site_pages`

Form group:

- `sb_profiles`
- `sb_site_pages`
- `sb_form_submissions`
- `sb_private_messages`

Messages overlay group:

- `sb_private_messages`
- `sb_profiles`
- `sb_user_friends`
- `sb_user_blocks`

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

Control Map and Source Map are passed no-fix pages. Their very large debug outputs are acceptable because they are inspector/map pages.

Planning Map is the permanent home for planning panels removed from Studio.

Form Designer is protected after a difficult pass and should not be touched unless a real break appears.

Studio has passed functional cleanup at V7.13.015.

The next gap is not the builder canvas itself. The next gap is the full preview compositor: Studio/Preview must show one composed page result using saved page body, Page Menu Builder output and Header/Footer Builder output.
