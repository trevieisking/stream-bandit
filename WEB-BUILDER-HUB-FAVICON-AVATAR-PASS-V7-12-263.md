# Web Builder Hub Favicon / Avatar Pass V7.12.263

## Verified pass

Route:

- `web-builder-account-control-hub-v7-12-263-test.html`

Projector:

- `web-builder-global-projector-v7-12-263.js`

User-tested result:

- Control hub opens — PASS.
- Selected avatar appears in the little projector rail — PASS.
- Clicking projector rail opens the mini account overlay — PASS.
- Mini account overlay shows favourites — PASS.
- Favourite links work — PASS.
- Hub button opens the control hub — PASS.
- Brand / icon area exposes Favicon URL — PASS.
- Favicon URL accepts the selected avatar/image URL — PASS.
- Apply Brand works — PASS.
- Save Local works — PASS.
- Hard refresh keeps favicon — PASS.
- Top-left Web Builder mark keeps selected avatar — PASS.

## Current direction

The Web Builder does not need a complex Stream Bandit-style route/menu overlay right now.

The current global account/favourites projector should act as the Web Builder quick menu:

- selected avatar in top-left / projector rail;
- mini account overlay;
- favourite builder pages;
- direct Hub button;
- builder-owned brand/favicon identity.

## Menu decision

Avoid building a second complex app-style menu unless Web Builder grows enough pages to need it.

Recommended next step is to keep the menu lightweight:

- Use the existing mini account/favourites overlay as the Web Builder menu.
- Add grouped favourites/tools inside that overlay when needed.
- Do not copy the Stream Bandit app's complex route/menu overlay.
- Keep Web Builder routing simple and builder-owned.

## Next safe work

Wire the Web Builder projector page-by-page after this pass:

1. `web-builder-pages-manager-owned-v7-12-256-test.html`
2. `web-builder-assets-v7-12-252-test.html`
3. `web-builder-preview-owned-v7-12-257-test.html?page=landing`
4. `web-builder-form-designer-owned-v7-12-258-test.html?page=landing`
5. `web-builder-form-inbox-owned-v7-12-258-test.html?page=landing`
6. `web-builder-route-map-v7-12-252-test.html`
7. `web-builder-studio-v7-12-252-test.html`

## Safety still active

- Web Builder-only.
- Connect-last rule still active.
- No Stream Bandit app settings writes.
- No Supabase writes from the hub/projector pass.
- No schema changes.
- No index promotion.
- No registry promotion.
- No Stream Bandit shell helper edits.
