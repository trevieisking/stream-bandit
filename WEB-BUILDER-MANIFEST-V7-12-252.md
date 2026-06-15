# Web Builder Manifest V7.12.299.22

## Purpose

This manifest tracks Web Builder as its own mini app/product area inside Stream Bandit.

The Stream Bandit movie/app manifest remains separate. This file is Web Builder only.

## Current checkpoint status

Status: ACTIVE / WEB BUILDER GLOBAL RAIL GROUP PASS COMPLETE / INDEX.HTML PROMOTION NOT APPROVED.

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

Status: FUNCTIONAL PASS / VISUAL POLISH PENDING.

Known polish debt:

- rendered website cards need tidying
- hero/card hierarchy needs polish
- card spacing and layout need cleanup
- preserve preview logic and owner lock
- do not mix visual polish with live/index promotion

### Menu Builder

Route:

`web-builder-menu-builder-owned-v7-12-264-test.html`

Current tested version:

`V7.12.299.16 Web Builder Menu Builder Global Rail Overlay Pass`

Status: PASS.

Owner test confirmed:

- global rail present
- old local top buttons gone
- edit selected overlay works
- visibility overlay works
- reorder/sub-tab overlay works
- remove-from-menu overlay works
- menu output preserved
- no schema/storage/index promotion

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

Status: PASS.

Owner rule from test:

- Correct Web Builder-owned routes are on the global rail.
- Because Web Builder users will use this page, any body buttons on this page must also point to correct Web Builder-owned routes when they are operational buttons.
- Support/reference links may remain only when clearly used as mapping/history/reference.

### Header/Footer Code

Route:

`web-builder-header-footer-code-v7-12-254-test.html`

Current tested version:

`V7.12.299.21 Web Builder Header/Footer Code Global Rail Pass`

Status: PASS.

Owner test confirmed:

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

Do not touch `web-builder-live-studio-v7-12-116.js` during this pass.

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

- `web-builder-account-control-hub-v7-12-263-test.html`
  - use as gold standard but still final-check visual spacing and route labels

- `web-builder-pages-manager-owned-v7-12-256-test.html`
  - final route label tidy
  - final owner-scope wording tidy

- `web-builder-menu-builder-owned-v7-12-264-test.html`
  - final menu wording tidy
  - final body button/route check

- `web-builder-form-designer-owned-v7-12-258-test.html?page=<slug>`
  - final form wording tidy
  - final button route check

- `web-builder-header-footer-code-v7-12-254-test.html`
  - final code planner wording tidy
  - final body button route check

### Light tidy only

- `web-builder-assets-v7-12-252-test.html`
- `web-builder-route-map-v7-12-252-test.html`
- `web-builder-control-map-v7-12-253-test.html`
- `web-builder-pages-source-map-v7-12-255-test.html`
- `web-builder-form-inbox-owned-v7-12-258-test.html?page=<slug>`

### Docs/reference only

- `WEB-BUILDER-MANIFEST-V7-12-252.md`

The manifest is reference only and does not need user-facing button polish.

## Temp / fallback / support routes not automatically part of Web Builder product

These routes may be kept as fallback, history, testing, or support references. They must not be treated as the clean Web Builder user-facing group unless owner explicitly promotes them.

- `web-builder-live-studio-v7-12-116-test.html`
- `web-builder-live-studio-v7-12-116.js`
- `web-builder-pages-manager-v7-12-108-test.html`
- `web-builder-pages-manager-v7-12-109-test.html`
- `web-builder-pages-manager-v7-12-111-test.html`
- `web-builder-shared-style-preview-v7-9-2-test.html`
- `web-builder-shared-style-preview-v7-12-117-test.html?page=<slug>`
- `web-builder-form-save-v7-12-94-test.html?page=<slug>`
- `web-builder-form-submissions-v7-12-94-test.html?page=<slug>`
- `stream-bandit-route-pointer-machine-v7-12-36-test.html`
- `repository-deep-route-graph-v7-12-38-test.html`
- `repository-global-dependency-graph-v7-12-39-test.html`

Rule:

If one of these is still needed, label it as support/reference/fallback. Do not put it in the main Web Builder rail or index promotion group without a separate owner-approved cleanup task.

## Explicit exclusions

Do not visually merge these into the main Web Builder shell as product pages:

- `web-builder-form-submissions-v7-12-94-test.html?page=<slug>`
- `web-builder-shared-style-preview-v7-12-117-test.html?page=<slug>`
- `web-builder-form-save-v7-12-94-test.html?page=<slug>`

Reasons:

- they are current support/reference routes
- Web Builder-owned equivalents already exist or are being created separately
- the full form-submission manager owns deeper submission/private-message flows
- old support routes are useful for rollback and comparison, not clean user-facing builder navigation

## Kayleigh / Creator Growth restrictions

Restriction work is deliberately deferred until the shell rollout and polish/tidy pass are complete.

Later restriction pass must:

- centralise route visibility
- centralise rail/tab visibility
- show Creator Growth only allowed Web Builder tools
- keep Creator Growth users scoped to own `owner_id` pages
- keep platform owner as all-workspace override
- prevent admin role alone from exposing other users' Web Builder rows
- avoid storage path/schema/RLS changes
- preserve full Form Inbox architecture

## Acceptance test for every user-facing Web Builder page

A user-facing Web Builder page passes only when:

- header/rail matches Hub
- uploaded Web Builder logo appears in header and rail
- duplicate local top navigation is gone/hidden
- body/page actions remain available below the rail
- body buttons point to correct Web Builder-owned routes unless clearly labeled support/reference
- page-specific owner/data protection still works
- no schema change
- no storage policy change
- no index promotion
- no Stream Bandit app-shell injection
- debug confirms page-specific pass flags

## Hard no-touch list

- `index.html`
- live route promotion
- app registry promotion
- Supabase schema/RLS/storage policies
- bucket policies
- `web-builder-live-studio-v7-12-116.js`
- `web-builder-protected-page-v7-12-265.js` unless explicitly requested
- Stream Bandit global footer shell injection into Web Builder

## Current resume instruction

The global rail group pass is complete.

Next work should be one of these only:

1. Web Builder polish/tidy pass on the tracked user-facing group.
2. Temp/support/fallback route classification and cleanup plan.
3. Owner/creator/admin/user/guest lock regression.
4. `index.html` promotion plan only, with no promotion until explicit owner approval.

Do not start live promotion from this manifest update.
