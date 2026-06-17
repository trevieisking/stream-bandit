# Stream Bandit Current App Manifest V7.12.300.37

Date: 2026-06-17

Filename remains `CURRENT-APP-MANIFEST-V7-12-180.md` because protected scanner pages and One Machine already reference this file.

## Current strongest pause point

`V7.12.300.37 Web Builder Header/Footer + Owned Preview Functional Pass`

The newest owner-confirmed pass is the Web Builder Header/Footer Builder to Owned Preview connection.

Latest checkpoint file:

`CHECKPOINT-WEB-BUILDER-HEADER-FOOTER-PREVIEW-PASS-V7-12-300-37.md`

## Current index note

`index.html` is now a simple checkpoint doorway with links to Home, the manifests, the checkpoint, Header/Footer Builder and Owned Preview.

This is not final live-home replacement.

Current Home route remains:

`home-global-helpers-v7-4-4-test.html`

## Web Builder pass detail

Routes involved:

- `web-builder-header-footer-code-v7-12-254-test.html`
- `web-builder-preview-owned-v7-12-257-test.html?page=<slug>`
- `web-builder-global-projector-v7-12-263.js`
- `WEB-BUILDER-MANIFEST-V7-12-252.md`

Passed behavior:

- Header/Footer Builder saves a real builder-site shell to `sb_site_pages.settings_json.web_builder_shell`.
- Compatibility fields are mirrored to `site_name`, `footer_title`, `footer_text`, `header_footer_status`, and `header_footer_updated_at`.
- Owned Preview renders the saved header/footer shell.
- Header page tick-list links render as pill navigation.
- Header custom buttons render.
- Sub tabs / rail tabs render.
- Footer text renders.
- Footer page tick-list links render in the footer Pages group.
- Footer buttons render.
- Main page content remains intact.
- Page Menu Builder remains separate as the on-page custom menu builder.
- Preview still needs later visual tidy, but the functional loop is passed.

Safety:

- No schema change.
- No RLS change.
- No storage policy change.
- No bucket policy change.
- No service-role key.
- No payment provider.
- No DNS/domain automation.
- No destructive write.
- No final live-home replacement.

## Previous live candidate groups

### Account + User Management

- `profile-settings-live-ready-v7-12-90-test.html`
- `user-management-dashboard-v7-11-2-test.html`
- `plans-pricing-feature-shop-v7-11-3-test.html`
- `permissions-matrix-user-management-v7-11-4-test.html`

### Watch group

- `home-global-helpers-v7-4-4-test.html`
- `library-global-helpers-v7-4-8-test.html`
- `details-clean-machine-v7-12-38-test.html`
- `player-one-global-helpers-v7-3-3-test.html`
- `continue-watching-global-helpers-v7-3-9-test.html`
- `watch-history-global-helpers-v7-4-0-test.html`
- `watchlist-clean-machine-v7-12-43-test.html`
- `favourites-clean-machine-v7-12-41-test.html`
- `likes-clean-machine-v7-12-42-test.html`
- `accessibility-clean-machine-v7-12-44-test.html`

### Web Builder functional pass candidates

- `web-builder-account-control-hub-v7-12-263-test.html`
- `web-builder-pages-manager-owned-v7-12-256-test.html`
- `overlay-route-truth-machine-v7-12-66-test.html?page=<slug>`
- `web-builder-preview-owned-v7-12-257-test.html?page=<slug>`
- `web-builder-menu-builder-owned-v7-12-264-test.html?page=<slug>`
- `web-builder-form-designer-owned-v7-12-258-test.html?page=<slug>`
- `web-builder-form-inbox-owned-v7-12-258-test.html?page=<slug>`
- `web-builder-assets-v7-12-252-test.html?page=<slug>`
- `web-builder-route-map-v7-12-252-test.html?page=<slug>`
- `web-builder-control-map-v7-12-253-test.html?page=<slug>`
- `web-builder-pages-source-map-v7-12-255-test.html?page=<slug>`
- `web-builder-header-footer-code-v7-12-254-test.html?page=<slug>`

## Scanner rule

For every Supabase-touching page, use the owner-provided `sb_table 1` scanner before editing.

Scanner checks to preserve:

- route load status
- tables touched
- read tables
- write tables
- auth flag
- storage flag
- write flag
- RPC flag
- overlay flag
- unknown table tokens

No page change should add schema, RLS, storage policy, bucket policy, service-role, final live-home replacement, or API keys.

## Next plan target

Continue doing every Web Builder page properly:

1. Source Map should report `web_builder_shell` presence, counts and readiness.
2. Preview needs visual tidy/polish later, not functional rescue.
3. Page Menu Builder must stay classified as the on-page custom menu builder.
4. Domain, subdomain and hosting support remains future builder-owned product work.
5. Final live-home promotion remains owner-gated.
