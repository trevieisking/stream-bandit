# Web Builder Manifest V7.12.252

## Purpose

This manifest tracks the Web Builder as a separate mini app/product area inside Stream Bandit.

The Stream Bandit manifest remains for the movie app. This file is for Web Builder only.

## Current passed checkpoints

- `V7.12.250 Web Builder Studio Theme Brand Font Planner` — PASS
- `V7.12.251 Web Builder Asset Media Planner` — PASS
- `V7.12.252 Canonical Web Builder URLs` — PASS / live test in progress

## Current canonical Web Builder test routes

- Studio Shell canonical URL: `web-builder-studio-v7-12-252-test.html`
- Asset / Media Planner canonical URL: `web-builder-assets-v7-12-252-test.html`
- Route Map canonical URL: `web-builder-route-map-v7-12-252-test.html`
- Web Builder Manifest: `WEB-BUILDER-MANIFEST-V7-12-252.md`

## Current old support / fallback routes

- Passed Studio Shell support route: `overlay-route-truth-machine-v7-12-66-test.html?page=test-page`
- Old Asset / Media Planner fallback route: `stream-bandit-route-pointer-machine-v7-12-36-test.html`

Canonical Web Builder URLs should be used first. Old routes are support/fallback only.

## Current builder engine

- `web-builder-live-studio-v7-12-116.js`
- Engine status: unchanged.
- Engine rule: do not rewrite the engine during shell/planner passes unless deliberately scoped and tested.

## Current support routes preserved during shell work

These routes currently work and must not be rewritten blindly:

- Pages Manager: `web-builder-pages-manager-v7-12-111-test.html`
- Published Preview: `web-builder-shared-style-preview-v7-12-117-test.html?page=test-page`
- Advanced Form: `web-builder-form-save-v7-12-94-test.html?page=test-page`
- Form Inbox: `web-builder-form-submissions-v7-12-94-test.html?page=test-page`

Current truth: these are working support routes. Future truth: Web Builder should own its own versions of these systems.

## Passed independent studio shell systems

- Full canvas Web Builder Studio shell
- No Stream Bandit global header
- No Stream Bandit global footer
- Studio menu drawer with icons and chips
- Read-only Builder Account boundary drawer
- Feature Ownership Plan
- Owned Systems Map
- Header/Footer Navigation Planner
- Drawer Polish
- Theme / Brand / Font Planner with 16 planned fonts
- Draft Preview under canvas
- Debug under page and debug drawer
- Clean slug / pasted URL guard

## Passed asset/media planner systems

- Old inactive route reused safely
- Canonical Asset / Media Planner page created
- Old asset test route converted to fallback
- Drag/drop local image preview
- Choose file fallback
- Image metadata report
- Copy report action
- Planned image bucket: `stream-bandit-images`
- Planned builder paths:
  - `builder/assets/{siteId}/{assetId}-{filename}`
  - `builder/logos/{siteId}/{timestamp}-{filename}`
  - `builder/social/{siteId}/{timestamp}-{filename}`
  - `builder/favicons/{siteId}/{size}-{filename}`
- No storage writes
- No schema changes
- No delete actions
- Stream Bandit logo/favicon/theme untouched

## Passed route map fix

- Canonical route map page created: `web-builder-route-map-v7-12-252-test.html`
- Fix target: previous Route Map button 404
- Route map is read-only
- No storage writes
- No schema changes
- No active menu promotion
- No index promotion
- No registry promotion

## Web Builder-owned systems planned

The Web Builder should own these systems later:

- Builder account / profile / teams
- Builder Pages Manager
- Builder Preview / Publish workflow
- Builder Form Designer
- Builder Form Inbox
- Builder Header Code tool
- Builder Footer Code tool
- Builder Navigation Builder
- Builder Theme / Style Packs
- Builder Logo / Favicon / App Icons
- Builder Font Library
- Builder Asset / Media Library
- Builder SEO / Meta tools
- Builder Revisions / Audit Log
- Builder Domains / Subdomains / SSL
- Builder Deploy / Publish rules
- Builder Backups / Export

## Stream Bandit systems that must remain separate

- Movie app global header/footer shell
- Stream Bandit route overlay
- Watch, Browse, Creator and Group Play pages
- Stream Bandit app logo
- Stream Bandit favicon/app icons
- Stream Bandit global theme
- Stream Bandit account/profile/avatar
- Movie library, details and players
- Watchlist, favourites, likes and history
- Player comfort and accessibility controls for the movie app

## Planned Web Builder Supabase tables

Table plan only. Do not create these until approved.

- `sb_builder_accounts`
- `sb_builder_sites`
- `sb_builder_pages`
- `sb_builder_assets`
- `sb_builder_themes`
- `sb_builder_domains`
- `sb_builder_deploys`
- `sb_builder_revisions`
- `sb_builder_audit_log`

## Current safe build order

1. Studio shell
2. Page/source truth
3. Account boundary
4. Owned systems map
5. Feature ownership plan
6. Header/footer/navigation planner
7. Drawer polish
8. Theme/brand/font planner
9. Web Builder manifest
10. Asset/media planner
11. Canonical route map fix
12. Web Builder control map
13. Controlled asset/media upload test on old inactive route
14. Table proposal
15. Test migrations only after approval
16. Promotion only after route registry pass

## Current promotion state

- Active menu promotion: false
- Index promotion: false
- Registry promotion: false
- Schema changes: false
- Storage writes: false for planner passes
- Builder engine changed: false

## Notes

Web Builder can use more than one old inactive test page. It should not be forced into one giant page forever.

The Studio shell can become the Web Builder editing home. Separate old inactive pages can become safe test slots for:

- Builder Control Map
- Builder Asset Manager
- Builder Pages Manager replacement
- Builder Preview replacement
- Builder Form Designer replacement
- Builder Form Inbox replacement
- Builder Header/Footer Code tools
- Builder Theme/Brand tools
- Builder Domains/Deploy tools
