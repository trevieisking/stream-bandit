# CHECKPOINT — Corrected Web Builder diagnosis before V7.12.116

Status: CORRECTED DIAGNOSIS

Trevor clarified the real Web Builder issue:
- `web-builder-live-studio-v7-12-97-test.html` does publish correctly right now.
- The previous explanation was missing the phrase "after a while".
- The true publish bug is that after the Builder page has been open for a long time, Save + Publish can stop working.
- Preview/new-tab/login flow is the other bug.

Correct base:
- HTML base: `web-builder-live-studio-v7-12-97-test.html`
- Engine base: `web-builder-live-studio-v7-12-106.js`
- This base already has the correct old overlay Builder, canvas, modal editor, custom HTML/code block, form blocks, rating blocks, video blocks, and working publish flow.

Do not remove Web Builder:
- Web Builder is not hopeless.
- Do not freeze/remove it based on the wrong diagnosis.
- Do not promote failed compact Builder attempts.

Wrong/dead-end directions:
- V7.12.112 compact/mount direction was not the correct route.
- V7.12.113 compact/mount direction was not the correct route.
- V7.12.114/115 helped reveal things but were based on a confused publish diagnosis.

Correct V7.12.116 target:
- Keep the exact working overlay Builder layout and flow.
- Only fix same-window Preview/Form/Inbox links.
- Only fix long-session Save + Publish reliability.
- Before save, refresh/re-check Supabase client and current auth/session/user.
- Re-read the existing `sb_site_pages` row.
- Preserve existing `settings_json` / `settings_json.navigation`.
- Save `layout_json`.
- Verify the saved row and show clear status.

Suggested files:
- `web-builder-live-studio-v7-12-116-test.html`
- `web-builder-live-studio-v7-12-116.js`

Rules:
- No protected shell edits.
- No Settings edits.
- No index promotion until Trevor passes the test.
- Keep worker test pages until a replacement passes.
- Delete failed/dead-end pages only after a newer replacement passes and Trevor clearly agrees.
