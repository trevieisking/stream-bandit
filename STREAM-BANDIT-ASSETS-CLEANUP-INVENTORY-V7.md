# Stream Bandit Assets Cleanup Inventory V7

Purpose: record the asset-folder cleanup plan from Trevor's asset list. This is an inventory only. Do not delete, move, rename or promote anything from this document until the active route map and live app references have been checked.

## Golden rule

Do not delete anything from `assets/` until `index.html` and the current active route pages are searched for references.

Many files in `assets/` are old V5 controller/checkpoint scripts. They may no longer be used, but some may still be linked by `index.html`, old backup pages, or protected recovery routes.

## Keep protected until reference scan

These look like base/shared assets and should not be touched until every current page has been checked:

- `assets/stream-bandit-app.js`
- `assets/stream-bandit.css`
- `assets/stream-bandit-logo.png`

Reason: these may be linked by the live app or older live backups.

## Likely archive later

Most `assets/stream-bandit-v5-*.js` files look like old V5 incremental controllers/checkpoints. They should be moved to an archive later, not deleted immediately.

Recommended later archive target:

- `archive/assets/v5-controllers/`

Examples from the asset list:

- `stream-bandit-v5-10-supabase-manager-polish.js`
- `stream-bandit-v5-11-*`
- `stream-bandit-v5-12-*`
- `stream-bandit-v5-14-*`
- `stream-bandit-v5-21-*`
- `stream-bandit-v5-22-*`
- `stream-bandit-v5-23-*`
- `stream-bandit-v5-24-*`
- `stream-bandit-v5-25-*`
- `stream-bandit-v5-26-*`
- `stream-bandit-v5-27-*`
- `stream-bandit-v5-28-*`
- `stream-bandit-v5-29-*`
- `stream-bandit-v5-30-*`
- `stream-bandit-v5-31-*`
- `stream-bandit-v5-32-*`
- `stream-bandit-v5-33-*`
- `stream-bandit-v5-34-*`
- `stream-bandit-v5-35-*`
- `stream-bandit-v5-36-*`
- `stream-bandit-v5-37-*`
- `stream-bandit-v5-38-*`
- `stream-bandit-v5-39-*`
- `stream-bandit-v5-41-*`
- `stream-bandit-v5-42-*`
- `stream-bandit-v5-5-*`
- `stream-bandit-v5-6-*`
- `stream-bandit-v5-7-rating-calculator.js`
- `stream-bandit-v5-8-*`
- `stream-bandit-v5-9-supabase-manager-tabs.js`

## Special asset files to inspect carefully

Some old files may contain useful features that were later split into current routes. Do not delete until recovered or confirmed unused:

- player comfort / sound booster files:
  - `stream-bandit-v5-11-9-player-sound-booster.js`
  - `stream-bandit-v5-21-*player*`
  - `stream-bandit-v5-21-*volume*`
  - `stream-bandit-v5-21-*fullscreen*`
- Supabase manager and metadata files:
  - `stream-bandit-v5-10-supabase-manager-polish.js`
  - `stream-bandit-v5-5-1-supabase-cast-manager.js`
  - `stream-bandit-v5-5-1-supabase-metadata.js`
  - `stream-bandit-v5-9-supabase-manager-tabs.js`
- settings/logo/theme files:
  - `stream-bandit-v5-6-2-settings-logo.js`
  - `stream-bandit-v5-6-3-settings-label-cleanup.js`
  - `stream-bandit-v5-8-settings-tabs.js`
  - `stream-bandit-v5-8-3-settings-tabs-safe-scroll.js`
- backup/report/dead-source files:
  - `stream-bandit-v5-37-*`
  - `stream-bandit-v5-38-*`

## Reference scan needed before cleanup

Before any asset cleanup, search the repo for each asset reference pattern:

- `assets/stream-bandit-app.js`
- `assets/stream-bandit.css`
- `assets/stream-bandit-logo.png`
- `assets/stream-bandit-v5-`
- `stream-bandit-v5-21-`
- `stream-bandit-v5-22-`
- `stream-bandit-v5-37-`

Any asset referenced by `index.html` or a current active route must stay in place.

## Safe cleanup phase plan

### Phase A: Reference map

Create a reference map showing which current pages load assets from `assets/`.

### Phase B: Archive branch

Create a backup branch before moving assets:

- `archive-before-assets-cleanup-v7`

### Phase C: Move unused V5 asset scripts to archive

Only after reference scan proves they are not used by current active pages.

### Phase D: Keep base assets in root/assets

Keep logo, base CSS and base app file until live `index.html` has been modernized and verified.

## Related planning files

Use this with:

- `STREAM-BANDIT-ACTIVE-ROUTE-MAP-V7.md`
- `STREAM-BANDIT-REPO-CLEANUP-INVENTORY-V7.md`
- `STREAM-BANDIT-V7-CONTINUATION-CHECKPOINT.md`
