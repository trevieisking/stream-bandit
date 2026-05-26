# CHECKPOINT — COLLECTIONS HOLD / NOT PASSED GLOBAL FOOTER SCAN V7.12.49

Date: 2026-05-26

Purpose:

Trevor correctly stopped the Collections pass because the page does not show the full global footer standard from the newer global pass. This checkpoint protects the project from marking Collections as passed too early.

## Current status

Collections is on HOLD / NOT PASSED in the current final global-system pass.

Do not mark Group Play complete.

Do not move to Player 2 until Collections is corrected and Trevor confirms the current test passes.

## Why Collections is on hold

The recovered old checkpoint said Collections V7.12.48 had passed earlier. That was true for the older route-focused pass, but the current pass is stricter and checks the full global system.

Current stricter global-system requirements include:

- account/global auth system,
- overlay menu,
- overlay search,
- footer,
- theme,
- avatar,
- favicon,
- global settings,
- live readiness/security/permissions,
- no old-version/back-to-old buttons,
- no blind Supabase writes.

Trevor noticed the Collections page has no full global footer. This is a valid fail under the current pass.

## Scan findings

Current Collections file:

`collections-clean-machine-v7-12-48-test.html`

It includes:

- local header,
- local search input,
- shell script load,
- account/avatar/style/settings/logo scripts,
- local small version footer line:
  `V7.12.48 Clean Collections TEST — no live/index promotion.`

But this small local line is not the same as the newer full global footer standard.

Current shell file:

`stream-bandit-shell-v6-24.js`

The shell currently advertises/implements:

- global overlay menu,
- route guard,
- favicon,
- search.

The scan did not show a reusable global footer injector in the shell.

Newer footer standard example:

`global-search-global-helpers-v7-4-9-test.html`

Global Search V7.12.89 includes a full bottom footer section:

`sbGlobalSearchFooter`

with footer columns and links for Stream Bandit, Watch, Browse and Account.

Its checkpoint says:

- footer appears once at the bottom,
- no footer appears in the middle.

## Decision

Collections must be corrected before pass.

This should not be a rushed rebuild.

The safer next step is a careful full-page scan/compare against the current global standard before writing any replacement code.

## Collections correction target

When corrected, Collections should keep its current working behaviour:

- collections load,
- collection cards select correctly,
- videos show under selected collection,
- Details opens `details-clean-machine-v7-12-38-test.html`,
- Play opens `player-one-global-helpers-v7-3-3-test.html`,
- Play All opens `player-2-progress-helper-v6-78-9-4-test.html`,
- Channels opens `channels-global-helpers-v7-5-3-test.html`,
- Playlists opens `playlists-global-helpers-v7-5-2-test.html`,
- no old Collections remove/fix route,
- no old Player 2 route,
- no blind Supabase writes,
- no live/index promotion.

But it must also add/restore:

- full bottom footer once,
- no footer in the middle,
- footer links to current clean routes,
- policy/footer link plan where appropriate,
- global-system consistency with the current final pass.

## Current next action

Stay on Collections.

Do not move to Player 2 yet.

Scan until comfortable, then build a full corrected Collections test page only if needed.

Likely corrected page name if a rebuild is needed:

`collections-clean-machine-v7-12-49-test.html`

After Trevor tests and passes the corrected Collections page, then record Collections passed under the current global-system pass and only then move to Player 2.
