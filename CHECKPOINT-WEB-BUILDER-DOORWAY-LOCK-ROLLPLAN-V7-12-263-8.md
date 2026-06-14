# CHECKPOINT-WEB-BUILDER-DOORWAY-LOCK-ROLLPLAN-V7-12-263-8

## Source of truth

This checkpoint freezes the user-supplied Stream Bandit route registry and Web Builder route-map state for the Web Builder lock rollout pass.

- Baseline: V7.12.263.8 Current Routes Registry / 51 Active Entries / 50 Unique URLs
- Overlay entries: 51
- Unique URLs: 50
- Route checks: 50 / 50 OK
- Protected files: 16 / 16 OK
- Web Builder doorway: `web-builder-account-control-hub-v7-12-263-test.html`
- Old Web Builder live-studio redirect preserved: `web-builder-live-studio-v7-12-116-test.html`
- Inboxes preserved: true
- Registry promotion: true
- Index promotion: false
- App manifest reflects pointer change: true
- Schema changes: false
- Storage actions: false

## Pass rule

This pass is a lock and routing pass only. It must not become a helper rewrite, global shell rewrite, index promotion, storage change, or schema migration.

## Web Builder lock model

- Platform owner can open every Web Builder workspace page.
- Creator Growth users can enter Web Builder, but only their own `owner_id` workspace rows.
- Admin role alone must not expose another user's Web Builder workspace.
- Reserved owner slugs are `landing`, `home`, and `home-page`.
- Creator users who hit a reserved owner slug should be redirected to their own first saved page, or sent to the owned Pages Manager if they have no saved page yet.

## Safe rollout order

1. Log this checkpoint.
2. Overwrite the oldest fallback wrappers first.
3. Lock current active Web Builder pages.
4. Guard preserved support pages without rebuilding their working logic.
5. Apply equivalent app-page lock classes to remaining separate owner/admin app pages.
6. Keep `indexPromotion=false` until every smoke test passes.

## Fallback wrapper overwrite targets

These are old fallback or redirect-only pages and are the first safe overwrite targets:

- `web-builder-live-studio-v7-12-116-test.html`
- `stream-bandit-route-pointer-machine-v7-12-36-test.html`
- `repository-deep-route-graph-v7-12-38-test.html`
- `repository-global-dependency-graph-v7-12-39-test.html`
- `web-builder-pages-manager-v7-12-108-test.html`
- `web-builder-pages-manager-v7-12-109-test.html`
- `web-builder-shared-style-preview-v7-9-2-test.html`

## Active Web Builder routes to lock after fallback wrappers

- `web-builder-account-control-hub-v7-12-263-test.html`
- `overlay-route-truth-machine-v7-12-66-test.html`
- `web-builder-studio-v7-12-252-test.html`
- `web-builder-assets-v7-12-252-test.html`
- `web-builder-header-footer-code-v7-12-254-test.html`
- `web-builder-pages-source-map-v7-12-255-test.html`
- `web-builder-pages-manager-owned-v7-12-256-test.html`
- `web-builder-preview-owned-v7-12-257-test.html`
- `web-builder-form-designer-owned-v7-12-258-test.html`
- `web-builder-menu-builder-owned-v7-12-264-test.html`
- `web-builder-route-map-v7-12-252-test.html`
- `web-builder-control-map-v7-12-253-test.html`

## Preserved support routes

These must be guarded without rebuilding their existing working logic:

- `web-builder-pages-manager-v7-12-111-test.html`
- `web-builder-shared-style-preview-v7-12-117-test.html`
- `web-builder-form-save-v7-12-94-test.html`
- `web-builder-form-submissions-v7-12-94-test.html`

## Protected non-goals for this pass

- Do not edit `web-builder-live-studio-v7-12-116.js`.
- Do not edit global Stream Bandit header/footer shell files.
- Do not alter Supabase Storage.
- Do not drop or replace RLS policies without explicit inspection and approval.
- Do not promote `index.html`.
- Do not rebuild preserved support pages.

## Smoke tests expected

Platform owner:

```json
{
  "workspace": "platform-owner",
  "allowed": true,
  "redirectApplied": false,
  "requestedSlug": "landing",
  "effectiveSlug": "landing"
}
```

Creator Growth user hitting `page=landing`:

```json
{
  "workspace": "personal-owner-id-only",
  "allowed": false,
  "redirectApplied": true,
  "requestedSlug": "landing",
  "targetSlug": "my-first-page",
  "reason": "reserved-owner-slug-redirect"
}
```

Creator Growth user on own page:

```json
{
  "workspace": "own-row",
  "allowed": true,
  "pageLevelOwnerScope": true
}
```

## Rollback rule

Fallback wrappers can be reverted one file at a time. High-risk pages such as Studio, Owned Pages Manager, Form Designer, Assets, and support Inbox/Form pages must be reverted by restoring the last passed HTML page, not by editing helper files.
