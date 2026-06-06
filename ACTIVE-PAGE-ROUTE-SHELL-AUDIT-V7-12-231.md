# Stream Bandit Active Route / Shell Audit V7.12.231

Date: 2026-06-06

Audit purpose: document remaining active-route and shell cleanup after the current V7.12.231 pass.

## Fresh registry proof

Current Routes Registry result supplied by owner/admin:

- 53 active overlay entries.
- 50 unique active URLs.
- 50 active routes loaded 200.
- 0 active route failures.
- 16 protected files loaded 200.
- 0 protected file failures.
- Scan time: 2026-06-06T14:47:44.629Z.

## Main conclusion

No active registry route is currently broken.

The remaining problem is not a route 404 problem. The remaining problem is old/manual shell layout still present on the Published Preview chain.

## Confirmed remaining active cleanup target

### Published Preview

Current active route:

- web-builder-shared-style-preview-v7-12-117-test.html?page=test-page

Findings:

- Route loads 200.
- Page still has its own local/manual header.
- Page still has its own local/manual footer panel.
- Current Header Shell is not loaded directly.
- Current Footer Shell is not loaded directly.
- Current Theme Projector is not loaded directly.
- Current search fallback is not loaded directly.
- One visible footer link still points to an old Settings Studio route instead of the current Theme Studio route.
- This page should be fixed with a test-slot pass before any live/current promotion.

## Secondary renderer-linked cleanup target

### Shared Style Block page

Linked by Published Preview:

- web-builder-shared-style-block-v7-9-2-test.html

Findings:

- File exists.
- It is not one of the 50 active overlay routes.
- It is still old/standalone.
- It should be reviewed as part of the Published Preview renderer pass, not separately promoted into the main overlay.

## Route-sanitizer notes

Old route names still appear in these helper files only as intentional repair maps:

- stream-bandit-shell-v6-24.js
- live-readiness-search-supabase-fallback-v7-12-130.js

These are not active-route failures. They are safety bridges that redirect old route names to current active route truth.

## Index note

index.html is currently the protected app map, not a normal active content page.

Findings:

- It lists the 50 current active URLs.
- It is not a broken route.
- It can be polished later, but should not be promoted/replaced without explicit approval.

## Resolved in recent pass

- Watch History title cleanup.
- Continue Watching duplicate rows fixed.
- Accessibility Player 2 route fixed.
- Tools Details route cleanup.
- Tools Cast Writer details-format cleanup.
- Mux Manager manual header/footer cleanup.
- Favicon Builder manual header/search cleanup.
- Theme Studio helper-shell polish.
- Brand / App Icons global logo upload/save owner pass.

## Recommended next work

1. Build a Published Preview test-slot version first.
2. Preserve page rendering and rating blocks.
3. Preserve builder, form and inbox slug links.
4. Add Header Shell, Footer Shell, Theme Projector and search fallback.
5. Fix the stale Theme Studio footer route.
6. Review the linked Shared Style Block page at the same time.
7. Promote only after owner/admin test pass.
