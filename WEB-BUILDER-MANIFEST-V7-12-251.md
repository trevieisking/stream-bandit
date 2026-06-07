# Web Builder Manifest V7.12.251

## Purpose

This manifest tracks the Web Builder as its own product area inside Stream Bandit.

Stream Bandit keeps its own app manifest, shell, movie pages, route overlay, account/profile/avatar system, app branding, app favicon, app theme, player comfort, watch pages and admin route registry.

Web Builder must become its own independent mini app before promotion.

## Current safe studio test route

- `overlay-route-truth-machine-v7-12-66-test.html?page=test-page`

## Latest passed shell checkpoint

- `V7.12.250 Web Builder Studio Theme Brand Font Planner`

## Current builder engine

- `web-builder-live-studio-v7-12-116.js`
- Engine status: unchanged during shell work.
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
- Theme / Brand / Font Planner
- Draft Preview under canvas
- Debug under page and debug drawer
- Clean slug / pasted URL guard

## Web Builder owned systems planned

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

## Asset / Media plan

Image storage is allowed for Web Builder, but it must be scoped correctly.

Allowed later:

- Drag and drop image upload
- Choose file fallback
- Image preview before upload
- Upload to Supabase Storage image bucket
- Asset library view
- Copy public URL
- Use image in page blocks
- Use image as builder site logo
- Use image as favicon/source art later
- Use image as social preview image later

Current known image bucket:

- `stream-bandit-images`

Future recommended Web Builder storage paths inside the bucket:

- `builder/assets/{siteId}/{assetId}-{filename}`
- `builder/logos/{siteId}/{timestamp}-{filename}`
- `builder/social/{siteId}/{timestamp}-{filename}`
- `builder/favicons/{siteId}/{size}-{filename}`

Safety rules:

- No delete actions until a tested asset manager exists.
- No automatic replacement of Stream Bandit app logo.
- No automatic replacement of Stream Bandit favicons.
- No storage writes in planner-only passes.
- Upload actions must require an authenticated allowed role later.
- Drag/drop should preview locally before upload.
- Upload should show bucket, path, file size, MIME type and public URL.
- Asset records should later be saved to a builder-owned table after schema approval.

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
11. Asset/media upload test page on an old unused route
12. Table proposal
13. Test migrations only after approval
14. Promotion only after route registry pass

## Current promotion state

- Active menu promotion: false
- Index promotion: false
- Registry promotion: false
- Schema changes: false
- Storage writes: false for planner passes
- Builder engine changed: false

## Notes

Web Builder can use more than one old unused test page. It should not be forced into one giant page forever.

The Studio shell can become the Web Builder home/control centre. Separate old unused pages can become safe test slots for:

- Builder Asset Manager
- Builder Pages Manager replacement
- Builder Preview replacement
- Builder Form Designer replacement
- Builder Form Inbox replacement
- Builder Header/Footer Code tools
- Builder Theme/Brand tools
- Builder Domains/Deploy tools
