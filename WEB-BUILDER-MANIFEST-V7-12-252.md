# Web Builder Manifest V7.12.252

## Purpose

This manifest tracks the Web Builder as a separate mini app/product area inside Stream Bandit.

The Stream Bandit manifest remains for the movie app. This file is for Web Builder only.

## Current passed checkpoints

- `V7.12.250 Web Builder Studio Theme Brand Font Planner` — PASS
- `V7.12.251 Web Builder Asset Media Planner` — PASS
- `V7.12.252 Canonical Web Builder URLs` — PASS
- `V7.12.253 Web Builder Control Map` — PASS
- `V7.12.254.1 Web Builder Header/Footer Code Tool + Slug Launcher` — PASS
- `V7.12.255 Web Builder Pages Source Map` — PASS
- `V7.12.256 Web Builder-owned Pages Manager Planner` — PASS
- `V7.12.257.3 Web Builder-owned Full Page Preview` — PASS

## Current canonical Web Builder test routes

- Studio Shell canonical URL: `web-builder-studio-v7-12-252-test.html`
- Asset / Media Planner canonical URL: `web-builder-assets-v7-12-252-test.html`
- Route Map canonical URL: `web-builder-route-map-v7-12-252-test.html`
- Control Map canonical URL: `web-builder-control-map-v7-12-253-test.html`
- Header/Footer Code canonical URL: `web-builder-header-footer-code-v7-12-254-test.html`
- Pages Source Map canonical URL: `web-builder-pages-source-map-v7-12-255-test.html`
- Owned Pages Manager Planner canonical URL: `web-builder-pages-manager-owned-v7-12-256-test.html`
- Owned Full Page Preview canonical URL: `web-builder-preview-owned-v7-12-257-test.html?page=landing`
- Web Builder Manifest: `WEB-BUILDER-MANIFEST-V7-12-252.md`

## Current old support / fallback routes

- Passed Studio Shell support route: `overlay-route-truth-machine-v7-12-66-test.html?page=test-page`
- Old Asset / Media Planner fallback route: `stream-bandit-route-pointer-machine-v7-12-36-test.html`
- Old Deep Route Graph fallback route: `repository-deep-route-graph-v7-12-38-test.html`
- Old Global Dependency Graph fallback route: `repository-global-dependency-graph-v7-12-39-test.html`
- Old Pages Manager 108 fallback route: `web-builder-pages-manager-v7-12-108-test.html`
- Old Pages Manager 109 fallback route: `web-builder-pages-manager-v7-12-109-test.html`
- Old Preview 9.2 fallback route: `web-builder-shared-style-preview-v7-9-2-test.html`

Canonical Web Builder URLs should be used first. Old routes are support/fallback only.

## Current builder engine

- `web-builder-live-studio-v7-12-116.js`
- Engine status: unchanged.
- Engine rule: do not rewrite the engine during shell/planner passes unless deliberately scoped and tested.

## Current support routes preserved during shell work

These routes currently work and must not be rewritten blindly:

- Pages Manager: `web-builder-pages-manager-v7-12-111-test.html`
- Published Preview: `web-builder-shared-style-preview-v7-12-117-test.html?page=landing`
- Advanced Form: `web-builder-form-save-v7-12-94-test.html?page=landing`
- Form Inbox: `web-builder-form-submissions-v7-12-94-test.html?page=landing`

Current truth: these are working support/reference routes. Future truth: Web Builder should own its own versions of these systems before any detachment.

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
- Header/Footer route is now listed in the route map
- Pages Source Map is listed in the route map
- Owned Pages Manager Planner is listed in the route map
- Owned Full Page Preview is listed in the route map
- No storage writes
- No schema changes
- No active menu promotion
- No index promotion
- No registry promotion

## Passed control map

- Canonical control map page created: `web-builder-control-map-v7-12-253-test.html`
- Active Stream Bandit registry boundary recorded
- 53 active entries / 50 unique active URLs kept protected
- 16 protected files kept protected
- Future Web Builder systems mapped to old inactive page reuse
- No storage writes
- No schema changes
- No active menu promotion
- No index promotion
- No registry promotion

## Passed Header/Footer Code Tool

- Canonical Header/Footer Code page created: `web-builder-header-footer-code-v7-12-254-test.html`
- Old global dependency graph route converted to fallback
- Builder-owned header HTML planner works
- Builder-owned footer HTML planner works
- Builder-owned CSS planner works
- Sandboxed local preview works
- Reset Defaults works
- Copy Report works
- Slug launcher added for non-coder use
- Open Preview by slug works
- Open Studio by slug works
- Copy Slug Links works
- Scripts and inline event handlers are stripped for preview
- No storage writes
- No schema changes
- No builder table changes
- No Stream Bandit header/footer shell changes
- No Theme Projector changes
- No active menu promotion
- No index promotion
- No registry promotion

## Passed Pages Source Map

- Canonical Pages Source Map page created: `web-builder-pages-source-map-v7-12-255-test.html`
- Old Pages Manager 108 route converted to fallback
- Current in-app Web Builder Studio remains preserved as working reference
- Current Pages Manager remains preserved as working reference
- Current Preview / Form / Inbox routes remain preserved as support/reference
- Working functions mapped before copying/detaching
- Detachment remains false
- Read-only only
- No storage writes
- No schema changes
- No active menu promotion
- No index promotion
- No registry promotion

## Passed Web Builder-owned Pages Manager Planner

- Canonical owned planner page created: `web-builder-pages-manager-owned-v7-12-256-test.html`
- Old Pages Manager 109 route converted to fallback
- Local page list works
- Selecting pages fills the form
- Apply Locally works locally only
- New Local Draft works locally only
- Reset Local List works
- Open Builder / Preview / Form / Inbox preserve selected slug
- Current Pages Manager v7-12-111 remains untouched
- No Supabase reads
- No Supabase writes
- No storage writes
- No schema changes
- No detachment
- No active menu promotion
- No index promotion
- No registry promotion

## Passed Web Builder-owned Full Page Preview

- Canonical owned preview page created: `web-builder-preview-owned-v7-12-257-test.html?page=landing`
- Old Preview 9.2 route converted to fallback
- Useful current preview renderer behaviour copied into Web Builder-owned route
- Preview renders full-width across the page
- Reads existing `sb_site_pages` rows by slug
- Renders layout/content blocks
- Supports image fields, video links and local-only rating controls
- Uses Web Builder-owned preview shell only
- Does not load Stream Bandit app header shell
- Does not load Stream Bandit app footer shell
- Does not load Stream Bandit route overlay/global app shell
- Current app Published Preview v7-12-117 remains preserved as reference
- No Supabase writes
- No storage writes
- No schema changes
- No detachment
- No active menu promotion
- No index promotion
- No registry promotion

## Web Builder-owned systems planned

The Web Builder should own these systems later:

- Builder account / profile / teams
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
13. Header/Footer Code Tool + Slug Launcher
14. Pages Source Map
15. Web Builder-owned Pages Manager Planner
16. Web Builder-owned Full Page Preview
17. Web Builder-owned Form Designer / Form Inbox path
18. Controlled asset/media upload test on old inactive route
19. Table proposal
20. Test migrations only after approval
21. Promotion only after route registry pass

## Current promotion state

- Active menu promotion: false
- Index promotion: false
- Registry promotion: false
- Schema changes: false
- Storage writes: false for planner/owned preview passes
- Builder engine changed: false
- Detachment from current app routes: false

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
