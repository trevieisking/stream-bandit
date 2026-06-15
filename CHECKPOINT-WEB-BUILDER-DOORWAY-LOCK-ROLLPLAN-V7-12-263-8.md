# CHECKPOINT - Web Builder Global Rail Rollout / Current Block V7.12.299.14

Date: 2026-06-15

## Status

ACTIVE / USE THIS CHECKPOINT NOW.

This file replaces the older doorway-lock rollplan checkpoint with the current Web Builder global rail rollout checkpoint. The old checkpoint was useful as the historical doorway base, but the project has moved on: Web Builder now needs to be tracked as a global shell/rail rollout, not only a doorway routing pass.

This checkpoint is Web Builder only.

No `index.html` promotion was done.
No Stream Bandit app registry promotion was done.
No Supabase schema, RLS, storage policy or bucket change was done.
No Stream Bandit global footer shell was injected into Web Builder.

## PDF source used for this checkpoint

Plan source supplied by Trevor:

`Web Builder global rail rollout plan.pdf`

The PDF states the governing plan for this pass:

- Hub is now the visual gold standard for Web Builder.
- Every active Web Builder page should inherit the same shared header, centered/contained Web Builder avatar, horizontal scrolling rail and integrated search row.
- Page-specific body tools must remain local body actions, not global rail actions.
- Duplicate local top navigation clusters should be removed once the shared rail is present.
- The real full Form Inbox remains separate because it is the app-owned, full-page submission/message manager.
- Kayleigh / Creator Growth restrictions happen after the shell is unified, not during the visual shell rollout.

## Current golden shell

Golden route:

`web-builder-account-control-hub-v7-12-263-test.html`

Golden shell pattern:

- top-left Web Builder identity block
- Web Builder uploaded logo/avatar in the header mark
- same logo/avatar in the bottom/right owner rail bubble
- horizontal scrolling Web Builder rail under the header
- integrated Web Builder search box on the rail row
- page-specific content underneath
- page-specific actions stay in the body

Required rail note:

`Scrolling Web Builder menu tabs: swipe or scroll the rail left/right to see every Web Builder page.`

## Shared global projector

Shared projector file:

`web-builder-global-projector-v7-12-263.js`

Current passed projector version:

`V7.12.299.13 Web Builder Logo Projection Repair`

Current role:

- owns the shared Web Builder rail
- owns shared route search
- owns top-left `.mark` logo replacement
- owns bottom/right owner rail logo
- owns hover/account panel avatar and logo
- owns Web Builder favicon replacement
- hides old local top navigation button groups where pages still have them
- preserves current page slug in builder route links

The global logo projection repair is a pass. It fixed the issue where the Hub rail/header avatar and page header avatar showed a dark `WB` fallback instead of the uploaded Web Builder logo.

## Web Builder uploaded logo source now locked

Primary logo now used by the global projector:

`https://xzxqfrvqdgkzwujbkdbk.supabase.co/storage/v1/object/public/stream-bandit-images/builder/assets/landing/1781531792576-4bb8cb73-log_master_piece_15-6-2026_145453_xzxqfrvqdgkzwujbkdbk.supabase.co.jpeg`

Fallback logo retained:

`https://xzxqfrvqdgkzwujbkdbk.supabase.co/storage/v1/object/public/stream-bandit-images/builder/assets/landing/1781530205862-1e5978b2-android_chrome_192.png`

Fit rule:

`contain-centered`

No storage write is performed by the projector. It only projects the URL already stored/known for Web Builder.

## Passed pages in this rollout

### 1. Hub / Account Control Hub

Route:

`web-builder-account-control-hub-v7-12-263-test.html`

Status: PASS.

Verified:

- shared rail works
- header/rail logo works after global logo repair
- platform owner workspace works
- no Supabase writes on Hub
- no storage writes on Hub
- no schema changes
- no index promotion
- no Stream Bandit shell change

### 2. Assets

Route:

`web-builder-assets-v7-12-252-test.html`

Current tested version:

`V7.12.299.9 Web Builder Assets Global Rail Lock`

Status: PASS.

Verified:

- Hub-style header and rail works
- body actions preserved
- Upload remains a body/overlay action
- Refresh remains a body action
- Copy Report remains a body action
- selected asset output remains on the page
- asset list reads from the existing `stream-bandit-images` bucket
- platform owner uses legacy shared prefix
- creator users use user-owned prefix when signed in as creator
- no schema change
- no bucket policy change
- no index promotion

### 3. Web Builder Inbox Bridge / Messenger Overlay

Route:

`web-builder-form-inbox-owned-v7-12-258-test.html`

Current tested version:

`V7.12.299.10 Web Builder Footer Messenger Global Rail Bridge`

Status: PASS.

Verified:

- shared rail works
- no iframe
- no duplicate form-submission clone
- no Stream Bandit app footer shell injected
- Web Builder shell remains separate
- body actions preserved
- overlay tabs remain: Inbox, Sent, New Message, Friends, Blocked
- tables remain: `sb_private_messages`, `sb_profiles`, `sb_user_friends`, `sb_user_blocks`
- full Form Inbox still owns real submissions
- no schema change
- no storage action
- no index promotion

### 4. Pages Manager

Route:

`web-builder-pages-manager-owned-v7-12-256-test.html`

Current tested version:

`V7.12.299.12 Owned Pages Manager Menu-Style Global Rail`

Status: FUNCTIONAL PASS + VISUAL PASS after global logo projector repair.

Important correction history:

- V7.12.299.11 passed the rail but regressed the Pages Manager UX into large page cards and visible inline input fields.
- Trevor correctly rejected that as too far from the Menu Builder pattern.
- V7.12.299.12 restored Pages Manager to a Menu Builder-like pattern:
  - compact page tab rows
  - tiny Edit button per row
  - tiny Delete button per row
  - Edit opens overlay
  - Delete opens guarded overlay
  - drag row to reorder
  - Move Up / Move Down
  - Sub-tab Left / Sub-tab Right
  - page order stored in `settings_json.sort_order`
  - sub-tab indent stored in `settings_json.page_indent`
  - page type stored in `settings_json.page_type`
  - no `sort_order` database column needed
  - no `page_type` database column needed

Verified:

- platform owner sees all rows
- creator users should remain owner_id scoped
- guarded delete deletes only selected `sb_site_pages` row
- no HTML file delete
- no route delete
- no storage delete
- no schema change
- no index promotion

### 5. Studio safety handoff

Route:

`overlay-route-truth-machine-v7-12-66-test.html`

Status: SAFETY HANDOFF PASS from debug.

Verified from Trevor debug:

- engine remains `web-builder-live-studio-v7-12-116.js`
- engineChanged false
- builderSpecificShell true
- fullCanvas true
- appGlobalFooterLoaded false
- streamBanditShellUntouched true
- only inbox syncs with app
- no inbox rebuild
- no global footer injected
- schemaChanges false
- storageActions false
- indexPromotion false

## Current blocker now

The immediate blocker is Preview page delivery/update.

Target file:

`web-builder-preview-owned-v7-12-257-test.html`

Target version:

`V7.12.299.14 Web Builder Owned Preview Global Rail Lock`

Commit message planned:

`Connect Web Builder preview to global rail`

What happened:

- The current Preview file was uploaded and is the right working base.
- The Preview page needs polish/treatment, not a rebuild.
- A sandbox/download handoff was produced, but Trevor cannot download files from ChatGPT reliably.
- Therefore the previous download-only handoff is not usable for Trevor.
- GitHub write/tool flow was blocked/errored during this Preview pass.
- The next assistant move must either:
  1. Push the Preview full replacement directly to GitHub with a fresh SHA if the tool allows it, or
  2. Paste the full replacement `web-builder-preview-owned-v7-12-257-test.html` code directly in chat, not as a download link.

Do not leave Preview blocked behind a sandbox download.

## Preview treatment requirements

The Preview page must keep its existing working logic.

Keep:

- page-owner preview lock
- platform owner can preview any workspace
- creator users can preview only own rows
- reserved `landing`, `home`, `home-page` creator redirect
- Supabase page read
- menu row read
- published preview output
- hero promotion
- empty block guard
- image/video rendering
- inline form submit to `sb_form_submissions`
- rating localStorage behavior
- debug report

Change only:

- add shared global rail projector script
- make header match Hub
- hide/remove old local header buttons: Hub, Pages, Studio, Route Map
- add Hub rail note
- update visible/debug version to V7.12.299.14
- debug flags:
  - sharedRail true
  - bodyActionsPreserved true
  - localTopButtonsHidden true
  - globalRailProjector true
  - webBuilderShell true
  - fullPreviewPreserved true
  - formSubmissionsPreserved true
  - appGlobalFooterInjected false
  - registryPromotion false
  - schemaChanges false
  - storageActions false
  - indexPromotion false

## Remaining active Web Builder pages after Preview

After Preview is repaired and passed, continue page-by-page:

1. Menu Builder - confirm it loads the shared global projector and does not duplicate rail navigation.
2. Form Designer - connect to shared rail while preserving solid-state auth and overlay inputs.
3. Route Map - confirm shared rail and no duplicate local top buttons.
4. Control Map - confirm shared rail and no duplicate local top buttons.
5. Source Map - confirm shared rail and no duplicate local top buttons.
6. Header/Footer Code - confirm shared rail and no duplicate local top buttons.
7. Studio overlay route - only light shell/rail treatment if safe; do not touch `web-builder-live-studio-v7-12-116.js`.
8. Manifest route/docs - keep as documentation, not a live app shell.

## Explicit exclusions

Do not visually merge this full app-owned route into the Web Builder shell:

`web-builder-form-submissions-v7-12-94-test.html?page=<slug>`

Reason:

- It is the real full form-submission manager.
- It owns the app-synced `sb_form_submissions` flow.
- It owns the full private-message manager/outbox/spam/trash flows.
- It can remain app/full-page styled.
- The Web Builder Inbox Bridge remains the lightweight Web Builder-side overlay.

## Kayleigh / Creator Growth restrictions

Do not start the deeper Kayleigh restriction pass until the shell/rail rollout is complete.

When that later pass begins:

- centralise route visibility
- centralise tab visibility
- centralise which rail items Creator Growth can see
- keep Creator Growth users scoped to own `owner_id` pages
- platform owner remains all-workspace override
- admin role alone must not expose other users' Web Builder rows
- do not reopen storage paths
- do not change Supabase schema/RLS
- do not change full Form Inbox architecture

## Acceptance test for every converted Web Builder page

A page passes only when:

- header/rail matches the Hub pattern
- uploaded Web Builder logo appears in header and rail
- old local top navigation buttons are gone/hidden
- body/page actions remain available below the rail
- existing owner/data protections remain intact
- no schema change
- no storage policy change
- no index promotion
- no Stream Bandit app-shell injection
- debug confirms the page-specific pass flags

## Hard no-touch rules

- Do not touch `index.html`.
- Do not promote live routes.
- Do not change Supabase schema/RLS/storage policies.
- Do not change bucket policies.
- Do not touch `web-builder-live-studio-v7-12-116.js`.
- Do not touch `web-builder-protected-page-v7-12-265.js` unless explicitly requested.
- Do not inject Stream Bandit global footer shell into Web Builder.

## Resume instruction

Resume from Preview.

If GitHub write works, push:

`web-builder-preview-owned-v7-12-257-test.html`

with commit message:

`Connect Web Builder preview to global rail`

If GitHub write blocks again, paste the full replacement page code directly in chat with the file name and commit message. Do not provide only a sandbox download link because Trevor cannot download those files.
