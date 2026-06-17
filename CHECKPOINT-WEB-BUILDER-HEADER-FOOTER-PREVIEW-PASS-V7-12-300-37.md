# Web Builder Header/Footer + Preview Pass V7.12.300.37

Date: 2026-06-17

## Status

PASS / CHECKPOINTED.

This checkpoint records the owner-confirmed Header/Footer Builder and Owned Preview connection pass.

## Passed owner test

Owner screenshot/test confirmed:

- Header/Footer Builder saved the builder-site shell.
- Owned Preview rendered the saved shell.
- Site name rendered: `Chatterfriends Stream Bandit`.
- Header page tick-list links rendered as pill navigation.
- Header custom buttons rendered.
- Sub tabs rendered.
- Page Menu Builder output remained separate inside the page preview body.
- Footer text rendered.
- Footer page tick-list links rendered in the footer Pages group.
- Footer buttons rendered.
- Main Web Builder preview/content body remained intact.

## Routes in this pass

- `web-builder-header-footer-code-v7-12-254-test.html`
- `web-builder-preview-owned-v7-12-257-test.html?page=<slug>`
- `web-builder-global-projector-v7-12-263.js`
- `WEB-BUILDER-MANIFEST-V7-12-252.md`
- `CURRENT-APP-MANIFEST-V7-12-180.md`
- `index.html`

## Current versions

- Header/Footer Builder: `V7.12.300.35 Web Builder Header Footer Real Supabase Shell Builder`
- Global projector/preview bridge: `V7.12.300.36 Web Builder Global Rail Preview Shell Bridge`
- Web Builder manifest checkpoint: `V7.12.300.37`
- Current app manifest checkpoint: `V7.12.300.37`
- Index checkpoint doorway: `V7.12.300.37`

## Saved data model

Header/Footer saves a shared builder shell into:

- `sb_site_pages.settings_json.web_builder_shell`

It also mirrors compatibility fields:

- `settings_json.site_name`
- `settings_json.footer_title`
- `settings_json.footer_text`
- `settings_json.header_footer_status`
- `settings_json.header_footer_updated_at`

## Product separation

- Header/Footer Builder owns builder-site shell: header links, buttons, subtabs/rail, footer groups, footer buttons and optional advanced code.
- Page Menu Builder remains the on-page custom menu builder, comparable to the advanced Form Designer category.
- Owned Preview renders both the saved builder-site shell and the separate on-page menu/body content.

## Index note

`index.html` is now a simple checkpoint doorway that links to Home, the manifests, the checkpoint and Owned Preview.

It is not final live-home replacement.

## Safety

No schema change.
No RLS change.
No storage policy change.
No bucket policy change.
No service-role key.
No payment provider.
No DNS/domain automation.
No destructive write.
No final live-home replacement.

## Remaining work

- Source Map should report the saved builder shell presence/counts/readiness.
- Preview needs visual polish/tidy later, but the functional Header/Footer + Preview loop is passed.
- Page Menu Builder should be kept classified as the on-page custom menu builder.
- Domain, subdomain and hosting support remains a future builder-owned product area.
