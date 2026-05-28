# CHECKPOINT — Before protected shell route URL cleanup V7.12.123

Status: PRE-SHELL-EDIT CHECKPOINT

Date: 2026-05-28

Reason:
- Current Routes Registry V7.12.122 proved the scanner is honest and useful.
- The scanner shows current shell/menu routes exactly as stored in the protected shell.
- Some shell/menu routes still point to old bridge/stable files even though the real passed target is a newer direct page.
- User correctly said the scanner should not be forced to pretend. The shell route URLs should be repaired.

User permission:
- Permission granted to edit the menu overlay shell only for route URL repair.
- Keep layout exactly the same.
- Change only route URLs.
- No other shell edits.
- If tool is blocked, provide full copy/paste code.

Allowed change scope:
- Edit `stream-bandit-shell-v6-24.js` route URL values only.
- Replace old bridge routes with the current passed direct routes.
- Do not change overlay/menu layout.
- Do not change helper logic.
- Do not change styles.
- Do not change account/avatar/search behaviour.
- Do not change Supabase.
- Do not edit index.html in this step.

Known direct route replacements from passed checkpoints:
- admin: `admin-centre-command-deck-v7-10-0-test.html` -> `admin-centre-command-deck-v7-12-121-test.html`
- registry: `all-pages-version-registry-v7-1-4-full-test.html` -> `all-pages-version-registry-v7-12-122-current-routes-test.html`
- builder: `web-builder-live-studio-v7-12-97-test.html?page=test-page` -> `web-builder-live-studio-v7-12-116-test.html?page=test-page`
- builderStudio: `web-builder-live-studio-v7-12-97-test.html?page=test-page` -> `web-builder-live-studio-v7-12-116-test.html?page=test-page`
- policyCentre: `policy-agreements-centre-v7-11-6-test.html` -> `policy-documents-centre-v7-12-119-test.html`
- policyProof: `policy-reader-published-row-v7-12-27-test.html` -> `policy-reader-v7-12-119-test.html?policy=terms`
- policyAdmin: `policy-admin-save-editor-v7-12-25-test.html` -> `policy-admin-documents-v7-12-120-test.html?policy=terms`

Additional route candidates require scan before editing:
- studio/settings studio route may still be correct as a stable route unless it is proven to bridge.
- route guard/pointer/clean menu/one machine routes should not be changed in this narrow step unless they are exact bridge routes already passed.

Rollback:
- Revert this shell route URL edit using GitHub history if any menu route fails.

Next action:
- Fetch `stream-bandit-shell-v6-24.js`.
- Replace only exact route URL string values listed above.
- Commit as V7.12.123 shell route URL cleanup.
- User tests overlay links and Current Routes Registry again.
