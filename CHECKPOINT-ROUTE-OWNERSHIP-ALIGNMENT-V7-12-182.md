# Stream Bandit Checkpoint — V7.12.182 Route / Ownership Alignment

Date: 2026-06-02

## Started from

V7.12.181 route / ownership pass.

Previous passed state:

- Current Routes Registry: 48/48 routes, 13/13 protected files, 0 issues, 5/5 live helpers.
- Header shell: Collections points to `collections-clean-machine-v7-12-51-test.html` and Player 2 points to `player-2-clean-machine-v7-12-58-test.html`.
- Header shell deleted Owner cleanup: Clean Machine Menu and Route Pointer Machine removed from active Owner routes.
- Footer shell deleted Owner cleanup: Owner footer now has 7 active links.
- One Machine: active menu count 53, unique URLs 48, `routeBad []`, `writes false`, `livePromotion false`.

## Work completed in V7.12.182

### Current App Manifest

File updated:

- `CURRENT-APP-MANIFEST-V7-12-180.md`

Commit:

- `99b2e2bef4c4e697846a87690e41bf23bce8a50e`

Changes:

- Manifest title/body aligned to V7.12.182.
- Active overlay entries recorded as 53.
- Unique current URLs recorded as 48.
- Deleted Owner machine entries removed from active Owner route list:
  - Clean Machine Menu
  - Route Pointer Machine
- Header shell route truth marked as already corrected for:
  - Collections V7.12.51
  - Player 2 V7.12.58
- Current scanner expectations added:
  - Active overlay entries: 53
  - Unique URLs: 48
  - Protected files: 13
  - Deleted Owner machines in active menu: 0
  - Scanner writes: 0
  - Scanner live/index promotion: 0

### Current Routes Registry

File updated:

- `all-pages-version-registry-v7-12-122-current-routes-test.html`

Commit:

- `765f1fbd01aad3b34a8002add264ddd08a78c3b9`

Changes:

- Registry page label updated to V7.12.182.
- Active route groups rebuilt around 53 active entries.
- Owner group reduced from 14 to 12 active routes.
- Clean Machine Menu removed from active Owner group.
- Route Pointer Machine removed from active Owner group.
- Scan route state now resets before each route scan so `routeOk` cannot accumulate across repeated scans.
- Protected file scan state resets before each protected file scan.
- Page-level root favicon checks removed from active registry logic; Header Shell remains owner of header icon/logo behaviour.

Expected registry result after browser test:

- Routes loaded: 48/48
- Protected files: 13/13
- Issues: 0
- Live helpers: 5/5

### Index map

File updated:

- `index.html`

Commit:

- `8799b3b1badd9574a81f6ea76c6a01ac6ef10773`

Changes:

- Index page label updated to V7.12.182.
- Index text aligned to 53 active overlay entries and 48 unique URLs.
- Deleted Owner machine route cards removed:
  - Clean Machine Menu
  - Route Pointer Machine
- Owner group reduced from 14 routes to 12 routes.
- Old mismatch notice replaced with route-truth-fixed notice.
- Root page-level favicon link tags removed to stop non-route icon checks from polluting the current route truth.

## Important note about icons

The first morning item said `stream_bandit_stag_icon_32.png` was showing 404 in One Machine Tools Linked.

This pass did not upload or replace binary icon assets. It only removed root page-level icon checks from registry/index route truth and documented that Header Shell owns header icon/logo behaviour.

Next icon-specific pass should inspect the actual asset paths used by Header Shell and the Brand / App Icons page before touching binary assets.

## Next safe browser test

Open:

- `all-pages-version-registry-v7-12-122-current-routes-test.html`

Run:

1. Scan Routes
2. Scan Protected Files
3. Scan All

Pass target:

- Routes loaded: 48/48
- Protected files: 13/13
- Issues: 0
- Live helpers: 5/5

Then open:

- `index.html`
- `stream-bandit-one-machine-v7-12-73-test.html`

Check:

- Index shows V7.12.182.
- Registry shows V7.12.182.
- One Machine still shows V7.12.181 until its separate file is safely updated or browser-proven as already correct.
- Menu overlay still scrolls to current page.
- Deleted Owner machine entries are absent from active menu routes.
