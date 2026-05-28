# CHECKPOINT — Web Builder Studio publish blocked after V7.12.115

Status: BLOCKED / OWNER-BETA ONLY

Current facts from Trevor test:
- Pages Manager V7.12.111 passed.
- Web Builder V7.12.115 page selector works perfectly.
- Old proper overlay Builder layout is preserved.
- Overlay block editor still opens and works.
- Preview/Form/Inbox same-window behaviour is fixed.
- Publish button / Save + Publish still does not work reliably.
- Title/slug/page loading flow improved with page selector.

Decision:
- Do not delete the Web Builder yet.
- Do not promote Web Builder Studio as finished.
- Freeze Web Builder Studio as owner-only beta until publish is diagnosed.
- Keep current working test pages while building.
- Delete failed/dead-end test pages only after a newer replacement passes and takes over.

Dead-end / failed direction:
- V7.12.112 compact/mount repair direction failed.
- V7.12.113 compact/mount repair direction failed.
- V7.12.114 fixed same-window preview but publish still failed.
- V7.12.115 fixed page selector and kept overlay, but publish still failed.

Next recommended diagnostic later:
- Build a tiny publish-doctor page only after moving on from this stress point.
- Target name: web-builder-publish-doctor-v7-12-116-test.html
- Purpose: select slug, write one known test block to sb_site_pages.layout_json, verify saved row, show exact Supabase/RLS/write error if it fails.

Future feature note:
- Published Preview rating blocks should become viewer-interactive later, similar to forms.
- Do not build interactive ratings until publish persistence is fixed.

Project rule reminder:
- No protected shell edits.
- No Settings edits.
- No index promotion for failed Builder versions.
- Keep Pages Manager V7.12.111 as passed.
