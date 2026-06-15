# Web Builder Manifest V7.12.299.14

## Purpose

This manifest tracks Web Builder as a separate mini app/product area inside Stream Bandit.

The Stream Bandit movie/app manifest remains separate. This file is Web Builder only.

## Current checkpoint status

Status: ACTIVE / WEB BUILDER GLOBAL RAIL ROLLOUT / PREVIEW FUNCTIONAL PASS / PREVIEW HERO-CARD VISUAL POLISH DEFERRED.

Current checkpoint file:

`CHECKPOINT-WEB-BUILDER-DOORWAY-LOCK-ROLLPLAN-V7-12-263-8.md`

Important note:

The older doorway-lock checkpoint file has now been deliberately replaced with the current Web Builder global rail rollout checkpoint. That keeps old references alive while making the old checkpoint path point to the current state.

Latest checkpoint update commit:

`42cbbbd829955acd776d5807dc393fdd490d0aa8`

## Current governing plan

Source plan:

`Web Builder global rail rollout plan.pdf`

The PDF defines the Web Builder global shell pass:

- Hub is the visual gold standard.
- Every active Web Builder page should inherit the same header, avatar/logo, horizontal scrolling rail and integrated search.
- Body/page actions must remain local to each page.
- Duplicate local top navigation should be removed once the shared rail exists.
- The real full Form Inbox remains separate as the app-owned full submission/message manager.
- Kayleigh / Creator Growth restrictions come after the visual shell rollout, not during it.

## Golden Web Builder shell

Golden route:

`web-builder-account-control-hub-v7-12-263-test.html`

Required visual shell:

- top-left Web Builder identity block
- uploaded Web Builder logo in header mark
- same uploaded Web Builder logo in owner rail bubble
- horizontal scrolling Web Builder rail under the header
- integrated Web Builder search field on the rail row
- page-specific body content below the rail
- page-specific actions kept in page body, not moved into the rail

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

Primary logo URL:

`https://xzxqfrvqdgkzwujbkdbk.supabase.co/storage/v1/object/public/stream-bandit-images/builder/assets/landing/1781531792576-4bb8cb73-log_master_piece_15-6-2026_145453_xzxqfrvqdgkzwujbkdbk.supabase.co.jpeg`

Fallback logo URL:

`https://xzxqfrvqdgkzwujbkdbk.supabase.co/storage/v1/object/public/stream-bandit-images/builder/assets/landing/1781530205862-1e5978b2-android_chrome_192.png`

Fit rule:

`contain-centered`

No storage writes. No schema changes. No index promotion.

## Passed rollout pages

### Hub / Account Control Hub

Route:

`web-builder-account-control-hub-v7-12-263-test.html`

Status: PASS.

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

Status: PASS.

### Pages Manager

Route:

`web-builder-pages-manager-owned-v7-12-256-test.html`

Current tested version:

`V7.12.299.12 Owned Pages Manager Menu-Style Global Rail`

Status: PASS.

### Preview

Route:

`web-builder-preview-owned-v7-12-257-test.html?page=landing`

Current tested version:

`V7.12.299.14 Web Builder Owned Preview Global Rail Lock`

Status: FUNCTIONAL PASS / VISUAL POLISH PENDING.

Confirmed from Trevor debug:

- sharedRail true
- bodyActionsPreserved true
- localTopButtonsHidden true
- globalRailProjector true
- webBuilderShell true
- appGlobalFooterInjected false
- previewOwnerLock true
- platformOwnerCanPreviewAnyWorkspace true
- mode `supabase`
- fullPreviewPreserved true
- formSubmissionsPreserved true
- supabaseWrites false
- storageWrites false
- storageActions false
- schemaChanges false
- builderTableChanges false
- streamBanditShellChanges false
- activeMenuPromotion false
- indexPromotion false
- registryPromotion false
- lastError empty

Known visual debt:

- actual rendered website cards need a later visual tidy
- hero card especially needs major visual cleanup
- this is not a functional blocker

### Studio safety handoff

Route:

`overlay-route-truth-machine-v7-12-66-test.html`

Status: SAFETY PASS from debug.

## Remaining rollout order

1. Menu Builder - confirm global projector/rail and no duplicate local navigation.
2. Form Designer - connect to rail while preserving solid-state auth and overlay inputs.
3. Route Map - confirm rail and remove duplicate local navigation.
4. Control Map - confirm rail and remove duplicate local navigation.
5. Source Map - confirm rail and remove duplicate local navigation.
6. Header/Footer Code - confirm rail and remove duplicate local navigation.
7. Studio overlay route - only light shell/rail treatment if safe; do not touch `web-builder-live-studio-v7-12-116.js`.
8. Manifest/docs - documentation only, not a live app shell.

## Deferred Preview visual polish

Create a later visual polish pass for:

`web-builder-preview-owned-v7-12-257-test.html`

Scope:

- tidy actual rendered website cards
- tidy hero card layout
- improve preview card spacing and hierarchy
- preserve Preview logic and owner lock
- do not mix this with the global rail rollout unless needed

## Explicit exclusion

Do not visually merge this route into Web Builder shell:

`web-builder-form-submissions-v7-12-94-test.html?page=<slug>`

Reason:

- it is the real full form-submission manager
- it owns full `sb_form_submissions` management
- it owns full private-message manager/outbox/spam/trash flows
- Web Builder Inbox Bridge is the lightweight Web Builder-side overlay

## Kayleigh / Creator Growth restrictions

Restriction work is deliberately deferred until the shell rollout is complete.

Later restriction pass must:

- centralise route visibility
- centralise rail/tab visibility
- show Creator Growth only allowed Web Builder tools
- keep Creator Growth users scoped to own `owner_id` pages
- keep platform owner as all-workspace override
- prevent admin role alone from exposing other users' Web Builder rows
- avoid storage path/schema/RLS changes
- preserve full Form Inbox architecture

## Acceptance test for every converted page

A Web Builder page passes only when:

- header/rail matches Hub
- uploaded Web Builder logo appears in header and rail
- duplicate local top navigation is gone/hidden
- body/page actions remain available below the rail
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

## Resume instruction

Resume from Menu Builder or Form Designer.

Preview shell treatment is passed functionally. Preview hero/cards are a deferred visual polish pass.
