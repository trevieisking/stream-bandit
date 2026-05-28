# CHECKPOINT — Web Builder V7.12.116 promoted via safe route bridge

Status: PROMOTED VIA ROUTE BRIDGE

Reason:
- Web Builder V7.12.116 passed Trevor testing.
- It preserves the old proper overlay Builder layout.
- It adds page selector, same-window Preview/Form/Inbox, publish notice panel, and verified Save + Publish.

Promotion method:
- Protected global shell was NOT edited.
- Old menu route `web-builder-live-studio-v7-12-97-test.html?page=test-page` was converted into a safe bridge.
- The bridge preserves the incoming `page=` slug.
- The bridge redirects to `web-builder-live-studio-v7-12-116-test.html?page=<slug>`.

Files:
- Updated: `web-builder-live-studio-v7-12-97-test.html`
- Target: `web-builder-live-studio-v7-12-116-test.html`
- Engine: `web-builder-live-studio-v7-12-116.js`

Rules kept:
- No protected shell edit.
- No Settings edit.
- No index edit.
- No Supabase schema change.
- Existing overlay/menu route remains valid.

Next target:
- Published Preview interactive blocks V7.12.117.
- Rating blocks should become viewer-clickable.
- Forms should remain linked/usable.
- Video and custom embeds should stay contained.
