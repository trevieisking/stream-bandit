# Web Builder Manifest V7.13.050

## Purpose

This manifest tracks Web Builder as its own builder product area inside Stream Bandit.

The Stream Bandit movie/app manifest remains separate.

This file is the working project-memory checkpoint for Web Builder rules, shared shells, rails, projectors, Supabase table use, passed pages and protected boundaries.

## Current checkpoint status

Status: WEB BUILDER FORM INBOX TARGET BOX V7.13.049 LOCKED / GLOBAL FOOTER COMMUNICATIONS OVERLAY V7.13.048 LOCKED / WEB BUILDER ENGINE RAIL CONNECTED / FORM INBOX HAS INBOX + SUBMISSIONS + PRIVATE MESSAGES + NEW MESSAGE + FRIENDS + BLOCKED + NOTIFICATIONS / GLOBAL FOOTER OVERLAY HAS PRIVATE MESSAGES + SUBMISSIONS + NOTIFICATIONS / MAIN APP AND WEB BUILDER SEPARATION RULE RECORDED / NO NEW FILES / NO SCHEMA, RLS, STORAGE, INDEX OR DNS CHANGES.

Latest recorded Web Builder manifest lock:

`V7.13.050 Web Builder Form Inbox Target Box + Footer Overlay Exact Point Lock`

## Exact point locked now

Repository checkpoint locked before this manifest write:

- Web Builder Form Inbox commit: `cda746a1aac3155407d711631c1424a9dd6c033f`
- Global footer shell overlay commit: `865263acbc01a7c3461d03ae106fe748f797419d`

Locked target routes/files:

- Web Builder target box: `web-builder-form-inbox-owned-v7-12-258-test.html?page=form-flow-lab-test`
- Global footer shell: `stream-bandit-footer-shell-v7-12-156.js`

Locked Web Builder Form Inbox version:

`V7.13.049 Web Builder Messages Submissions Notifications Engine Connected`

Required behavior locked for Web Builder Form Inbox:

- It is the actual Web Builder target box for `form-flow-lab-test`.
- It is connected to the shared Web Builder rail/search/avatar engine used by the other Web Builder pages.
- It loads Web Builder rail/auth foundations:
  - `stream-bandit-route-registry-v7-13-001.js`
  - `stream-bandit-auth-entry-gate-v7-13-001.js`
  - `web-builder-global-projector-v7-12-263.js`
- It carries `data-wb-no-stream-bandit-global-shell="true"` so the main app global footer shell must not be injected into this Web Builder page.
- It keeps Web Builder page identity and Web Builder engine behavior.
- It has tabs:
  - Inbox
  - Submissions
  - Private Messages
  - New Message
  - Friends
  - Blocked
  - Notifications
- It reads messages/submissions from existing tables only:
  - `sb_private_messages`
  - `sb_form_submissions`
  - `sb_profiles`
  - `sb_user_friends`
  - `sb_user_blocks`
- It writes only existing private-message actions and submission status actions already covered by current flow.
- It must not create new Supabase tables.
- It must not change schema, RLS, storage policies, buckets, indexes, DNS or service-role logic.
- It must not use the main app footer shell as its page shell.

Locked global footer shell version:

`V7.13.048 Footer Shell Messages + Submissions`

Required behavior locked for global footer shell overlay:

- The main/global app footer shell remains the main app global footer shell.
- Its communications overlay now has:
  - Inbox
  - Submissions
  - Private Messages
  - New Message
  - Friends
  - Blocked
  - Notifications
- It uses existing tables:
  - `sb_private_messages`
  - `sb_form_submissions`
  - `sb_profiles`
  - `sb_user_friends`
  - `sb_user_blocks`
- It links its Form Inbox route to `web-builder-form-inbox-owned-v7-12-258-test.html?page=<slug>`.
- It must not become the Web Builder page shell.
- Web Builder pages that carry `data-wb-no-stream-bandit-global-shell="true"` must not receive the main app footer shell injection.

## Thomas the Tank Engine rule

Main app and Web Builder stay on separate tracks:

- Main app global header/footer/theme/settings are for the main Stream Bandit app.
- Web Builder global rail/search/avatar/theme/settings are owned by Web Builder pages and the Web Builder engine/projector.
- Do not mix the main app page shell into Web Builder pages.
- Do not replace Web Builder rail/projector behavior with the main app footer/header shell.
- The global footer communications overlay can read the same communication tables, but it must not become the Web Builder page shell.
- Web Builder Form Inbox can show the same communication/submission data, but it must remain a Web Builder page with Web Builder engine rails.

## Latest working page passes recorded

- `V7.13.049 Web Builder Form Inbox Messages Submissions Notifications Engine Connected`
- `V7.13.048 Footer Shell Messages + Submissions`
- `V7.13.028 Web Builder Full Preview Choice Fields Uploads`
- `V7.13.025 Web Builder Full Preview One Footer Lock`
- `V7.13.021 Web Builder Studio Draft Preview Device Sizing`
- `V7.13.010 Web Builder Planning Map / Studio Planning Split`
- `V7.12.300.53 Form Designer Safe Loader Kind Fix`
- `V7.12.299.19 Web Builder Control Map Global Rail Pass`
- `V7.12.300.44 Web Builder Source Map Global Projector Rail Search Pass`
- `V7.12.300.47 Web Builder Pages Manager Builder Polish SEO Domain Preview Controls Pass`
- `V7.12.300.42 Web Builder Header Footer Rail Search Workspace Apply Pass`
- `V7.12.300.40 Page Menu Builder Icon Restore + Published Menu Set Pass`

## Project memory checkpoint

Owner/profile proof:

- Current signed-in builder owner: `trevieisking@gmail.com`.
- Current owner user id: `af380be8-d1e2-4154-a5ed-a113c8271afd`.
- Current profile: `admin` / role `admin` / admin level `owner` / plan `platform_owner` / status `active`.
- Platform owner can manage all workspaces.
- Creator users only see their own `owner_id` rows.
- Admin role alone does not expose other users' Web Builder workspaces.

Main working Web Builder flow:

`Hub -> Pages -> Studio / Publish -> Published Full Preview`

Core Web Builder route group:

- Hub: `web-builder-account-control-hub-v7-12-263-test.html`
- Pages Manager: `web-builder-pages-manager-owned-v7-12-256-test.html`
- Studio: `overlay-route-truth-machine-v7-12-66-test.html?page=<slug>`
- Published Full Preview: `web-builder-preview-owned-v7-12-257-test.html?page=<slug>`
- Page Menu Builder: `web-builder-menu-builder-owned-v7-12-264-test.html?page=<slug>`
- Header/Footer Builder: `web-builder-header-footer-code-v7-12-254-test.html?page=<slug>`
- Web Builder Form Designer: `web-builder-form-designer-owned-v7-12-258-test.html?page=<slug>`
- Web Builder Form Inbox: `web-builder-form-inbox-owned-v7-12-258-test.html?page=<slug>`
- Assets: `web-builder-assets-v7-12-252-test.html`
- Planning Map: `web-builder-route-map-v7-12-252-test.html`
- Control Map: `web-builder-control-map-v7-12-253-test.html`
- Source Map: `web-builder-pages-source-map-v7-12-255-test.html`

## Main app and Web Builder separation

- Web Builder is its own builder product area, not the main Stream Bandit movie app shell.
- Main app Watch/Browse/Creator/Group Play routes stay separate from Web Builder.
- Main app Form Builder/Form Builder 2 is separate from Web Builder Form Designer.
- Main Stream Bandit app routes, player routes, movie routes, accessibility/audio boost and main app form-builder systems are protected during Web Builder work.
- Do not touch `index.html` for Web Builder until the full Web Builder group pass is approved.
- Web Builder pages use Web Builder rail/projector/global settings behavior.
- Main app global header/footer/settings must not appear on Web Builder pages unless the user explicitly asks for a main-app page.

## Shared shells, rails and projectors

- User-facing Web Builder pages use the shared Web Builder global rail/projector where already passed.
- The global rail/search/hub/avatar projector remains active on passed Web Builder pages.
- Full Preview owns its own header/footer render; it must block duplicate preview header/footer injection.
- Header/Footer Builder writes Web Builder shell data into `sb_site_pages.settings_json.web_builder_shell`; it does not alter the main Stream Bandit app shell.
- Web Builder Form Inbox is now a Web Builder target box using the shared Web Builder engine/projector.
- The global footer shell is allowed to have a communications overlay with submissions/private messages/notifications, but it is not the Web Builder page shell.

## Supabase table map, current approved tables

- App/admin/settings: `sb_admin_audit_log`, `sb_app_settings`, `sb_policy_documents`
- Watch/browse: `sb_movies`, `sb_genres`, `sb_watch_progress`, `sb_watchlist`, `sb_favourites`, `sb_likes`
- Creator/group play: `sb_channels`, `sb_collections`, `sb_collection_movies`, `sb_playlists`, `sb_playlist_movies`, `sb_submissions`, `sb_import_batches`
- User/profile: `sb_profiles`
- Web Builder pages: `sb_site_pages`
- Web Builder forms/messages: `sb_form_submissions`, `sb_private_messages`, `sb_user_friends`, `sb_user_blocks`

Future/planning-only tables, not approved for migration yet:

- `sb_builder_accounts`
- `sb_builder_sites`
- `sb_builder_pages`
- `sb_builder_assets`
- `sb_builder_themes`
- `sb_builder_domains`
- `sb_builder_deploys`
- `sb_builder_revisions`
- `sb_builder_audit_log`
- `sb_account_deletion_requests`

Browser-local/config tokens are not schema unless a matching Supabase call exists:

- `sb_theme`
- `sb_header_*`
- `sb_profile`
- `sb_preview_rating*`
- `sb_wb_*`
- `sb_form_designer_local_*`
- `sb_publishable_*` is a publishable config token and must stay redacted.

## Current governing rules

- Hub remains the visual gold standard.
- Inputs belong in overlays where users create, edit, remove, reorder or confirm something.
- Outputs stay visible on-page.
- Read-only pages are allowed only when they are useful inspectors, truth checkers or route/action maps.
- No schema, RLS, storage policy, bucket policy, service-role, payment provider, DNS automation or final live-home replacement is approved by this checkpoint.
- Web Builder passed pages are recorded here instead of replacing the main `index.html` until the full Web Builder group pass is approved.
- If a page already passes and nothing visible is broken, do not rewrite it just to increase a version number. Record the pass, preserve the working code, and move to the next planned page.
- Planning belongs on the Planning Map, not inside the live Studio canvas.
- Studio Draft Preview is body/cards only.
- Published Full Preview is the separate complete published page and shows header, footer, menus and full composed result.
- Do not iframe the whole Published Preview page inside Studio.
- Do not rebuild the full Published Preview compositor inside Studio.
- Full Preview must show one footer only, from Header/Footer Builder.
- Web Builder Full Preview V7.13.028 is passed and should not be touched again unless a real break appears.
- Web Builder Form Inbox V7.13.049 is locked at this exact point unless a real break appears.
- Global Footer Shell V7.13.048 communications overlay is locked at this exact point unless a real break appears.

## Page status board

| Area | Route | Current status | Tables needed | Writes |
| --- | --- | --- | --- | --- |
| Hub | `web-builder-account-control-hub-v7-12-263-test.html` | Working doorway / visual standard | `sb_profiles`, `sb_site_pages` | none expected |
| Pages Manager | `web-builder-pages-manager-owned-v7-12-256-test.html` | Passed full page manager/control centre | `sb_profiles`, `sb_site_pages` | `sb_site_pages` |
| Studio | `overlay-route-truth-machine-v7-12-66-test.html?page=<slug>` | Passed V7.13.021 / stable builder + draft preview device sizing | `sb_profiles`, `sb_site_pages` | `sb_site_pages` through existing builder engine |
| Published Full Preview | `web-builder-preview-owned-v7-12-257-test.html?page=<slug>` | Passed V7.13.028 / complete preview + tidy hero + one footer + form controls/uploads | `sb_profiles`, `sb_site_pages`, `sb_form_submissions` | `sb_form_submissions`; uploads to existing `stream-bandit-images` bucket when form file/image fields are used |
| Page Menu Builder | `web-builder-menu-builder-owned-v7-12-264-test.html?page=<slug>` | Passed | `sb_profiles`, `sb_site_pages` | `sb_site_pages.settings_json` |
| Header/Footer Builder | `web-builder-header-footer-code-v7-12-254-test.html?page=<slug>` | Passed builder, writes real shell data | `sb_profiles`, `sb_site_pages` | `sb_site_pages.settings_json.web_builder_shell` |
| Web Builder Form Designer | `web-builder-form-designer-owned-v7-12-258-test.html?page=<slug>` | Passed / do not touch | `sb_profiles`, `sb_site_pages`, form tables | form submissions + private messages from existing flow |
| Web Builder Form Inbox | `web-builder-form-inbox-owned-v7-12-258-test.html?page=<slug>` | LOCKED V7.13.049 / Web Builder engine connected / inbox + submissions + private messages + notifications | `sb_profiles`, `sb_site_pages`, `sb_form_submissions`, `sb_private_messages`, `sb_user_friends`, `sb_user_blocks` | private-message replies/actions + submission review status from existing flow |
| Global Footer Shell | `stream-bandit-footer-shell-v7-12-156.js` | LOCKED V7.13.048 / global communications overlay has messages + submissions + notifications | `sb_profiles`, `sb_form_submissions`, `sb_private_messages`, `sb_user_friends`, `sb_user_blocks` | private-message replies/actions only; no schema changes |
| Assets | `web-builder-assets-v7-12-252-test.html` | Passed asset route | existing asset/profile tables/storage as already wired | existing asset flow only |
| Planning Map | `web-builder-route-map-v7-12-252-test.html` | Passed read-only planning destination | `sb_profiles`, `sb_site_pages` | none |
| Control Map | `web-builder-control-map-v7-12-253-test.html` | Passed read-only control map | `sb_profiles`, `sb_site_pages` | none |
| Source Map | `web-builder-pages-source-map-v7-12-255-test.html` | Passed read-only source/debug map | `sb_profiles`, `sb_site_pages` | none |

## Full Preview final pass recorded

Route:

`web-builder-preview-owned-v7-12-257-test.html?page=<slug>`

Passed version:

`V7.13.028 Web Builder Full Preview Choice Fields Uploads`

Owner confirmed status:

FULLY PASSED / NEVER TO BE TOUCHED AGAIN UNLESS A REAL BREAK APPEARS.

Passed behavior:

- reads `sb_profiles`
- reads `sb_site_pages`
- consumes page body / layout data
- consumes Page Menu Builder output from `settings_json.page_menu_set` / related key
- consumes Header/Footer Builder output from `settings_json.web_builder_shell`
- renders header shell
- renders page menu output
- renders page body blocks/cards/forms/media
- renders tidy hero card above hero image
- keeps hero title visible and not hidden under the image
- keeps hero text readable
- renders footer once only from Header/Footer Builder
- disables duplicate preview header/footer injection
- keeps the global rail/search/avatar projector active
- Desktop / Tablet / Mobile preview controls work
- form text, textarea, phone, date, URL/email/number fields render properly
- multiple choice renders clickable radio choices
- choose-one/dropdown renders a real dropdown
- checkboxes render clickable checkbox choices
- yes/no renders clickable radio choices
- Upload File renders a real file picker
- Upload Image renders a real image picker with image accept
- uploaded file/image links save into `sb_form_submissions.answers_json`
- uses the existing `stream-bandit-images` bucket for upload fields
- Web Builder Form Designer remains separate from main app Form Builder/Form Builder 2
- no schema change
- no RLS change
- no storage policy change
- no index promotion

Important Full Preview fixes recorded:

- `V7.13.023` improved hero text pulling and started footer filtering.
- `V7.13.024` moved hero text/title into a clean card above the image.
- `V7.13.025` fixed the real duplicate footer source by blocking duplicate header/footer.
- `V7.13.027` changed file/image upload fields from fake URL/text inputs into real upload controls.
- `V7.13.028` changed multiple choice, choose-one/dropdown, checkboxes and yes/no from dead text inputs into real controls.
- One correct footer remains: the footer rendered by Full Preview from Header/Footer Builder shell data.
