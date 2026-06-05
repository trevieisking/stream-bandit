# Stream Bandit Checkpoint — Pages Manager Duplicate Footer Hotfix Pass V7.12.221

Date: 2026-06-05

## Status

PASS.

## Page

- `web-builder-pages-manager-v7-12-111-test.html`

## Internal state

- V7.12.221 Pages Manager Duplicate Footer Hotfix

## Commit

- `37e257bdde346108e20fdb1545325b3bdacd415b`

## Why this hotfix was needed

After the V7.12.220 shell/route preservation pass, Pages Manager had two footer areas:

1. the old manual page footer still inside the page HTML,
2. the current global Footer Shell loaded by `stream-bandit-footer-shell-v7-12-156.js`.

The duplicate appeared after refresh/scroll.

## Hotfix applied

- Removed the old manual page footer block from Pages Manager.
- Kept the current global Footer Shell as the only footer.
- Kept Header Shell, Theme Projector, saved counters, search helper and brand/settings helpers.
- Kept all Pages Manager `sb_site_pages` row workflow logic unchanged.
- Kept all route fixes from V7.12.220.

## User-tested pass

- Open Pages Manager: PASS
- Refresh: PASS
- Scroll down: PASS
- Scroll up and down again: PASS
- Only one footer appears: PASS
- Header still appears: PASS
- Footer Shell appears once: PASS
- Load pages still works: PASS
- Select `test-page` still works: PASS
- Builder / Preview / Form / Inbox links still correct: PASS
- Debug shows V7.12.221 and `duplicateFooterHotfix: true`: PASS

## Debug proof from user

```json
{
  "version": "V7.12.221 Pages Manager Duplicate Footer Hotfix"
}
```

## Preserved route constants

- Builder: `web-builder-live-studio-v7-12-116-test.html`
- Preview: `web-builder-shared-style-preview-v7-12-117-test.html`
- Advanced Form: `web-builder-form-save-v7-12-94-test.html`
- Form Inbox: `web-builder-form-submissions-v7-12-94-test.html`

## Preserved workflow

The following were not changed by the footer hotfix:

- Load pages
- Filter pages
- Status filter
- Select page
- New page draft
- Clear form
- Save page settings
- Hide / soft-delete
- Restore hidden
- Guarded permanent row removal
- `sb_site_pages` field handling
- `layout_json` handling
- `settings_json.navigation` handling

## Result

Pages Manager V7.12.221 is now the current passed Pages Manager state.

Recommended next step:

- Update current manifest from V7.12.220 to V7.12.221 for Pages Manager.
- Then choose the next scan-first page.
