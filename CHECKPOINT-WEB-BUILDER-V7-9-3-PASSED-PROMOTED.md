# Stream Bandit Checkpoint — Web Builder V7.9.3 Passed + Promoted

Date: 2026-05-21

## Page passed

Passed Web Builder test flow:

- `web-builder-global-helpers-v7-9-1-test.html?page=test-page`
- duplicate block route fix confirmed through:
  - `web-builder-shared-style-preview-v7-9-2-test.html?page=test-page`
  - `web-builder-shared-style-block-v7-9-2-test.html`

Final route checkpoint page created:

- `web-builder-global-helpers-v7-9-3-test.html?page=test-page`

## Route promoted

Route file:

- `web-builder-admin-shell-v6-57-test.html`

Now opens:

- `web-builder-global-helpers-v7-9-3-test.html?page=test-page`

Promotion commit:

- `95c3cff4058c8973b6b1b729b40580e0647d25f6`

## Trevor test result

Trevor confirmed the Web Builder pass with notes:

- Page loads: PASS
- Theme matches global theme: PASS
- Account/avatar appears correctly: PASS
- Helper status shows account/avatar/shared style/settings bridge loaded: PASS
- Load `test-page`: PASS
- Tabs switch properly: PASS
- Owner Tools links open correct current owner pages: PASS
- Forms tab links open Form Submit and standalone Form IDE: PASS
- Add safe block/form block: PASS
- Edit safe form question: PASS
- Save + Publish: PASS
- Open Preview renders page: PASS
- No live/index/delete dangerous controls: PASS

## Bug found and fixed

During testing, Trevor found a real duplicate block route bug:

- Preview rendered the edited second Pricing Cards block with `£90`.
- Open Page route showed the first Pricing Cards block with `£9`.

Cause:

- Repeated blocks shared the same slug such as `pricing-cards`.
- The block page found the first matching title slug.

Fix:

- V7.9.2 preview links include `blockId` and `blockIndex`.
- V7.9.2 block page loads in this order:
  1. exact `blockId`
  2. `blockIndex`
  3. old title/slug fallback
- V7.9.3 Web Builder saves block actions using the exact V7.9.2 route.

## Why Web Builder stays

Trevor noted Web Builder is confusing because of blocks, preview pages, block pages, form routes and theme ownership, but does not want it removed because a lot of work went into it.

Decision:

- Keep Web Builder.
- Do not remove it.
- Do not replace it with the standalone Form IDE.
- Later simplify it with a possible simple mode/help mode.

## Current role

Web Builder owns:

- page layout
- page blocks
- `sb_site_pages.layout_json`
- form block structure
- preview/block routing

Web Builder does not own:

- profile/avatar/banner
- Platform Control Tower diagnostics
- live/index promotion
- standalone Form IDE internals

## Safety status

- No schema change
- No live index promotion
- No destructive action
- Existing V7.8.6 remains in repo as fallback
- Standalone Form IDE remains separate and not promoted

## Settings group status after this checkpoint

Settings group now passed/promoted:

- Settings
- Settings Sources / old Settings Studio route
- Profile Settings
- Web Builder
- Platform Control Tower
- Final Shell Navigation

Settings group complete enough for the current global-helper pass.

Next likely major group:

- Admin group
