# Stream Bandit Remaining Runtime Fix Queue V7.12.44

Date: 2026-05-25

Purpose: keep the repair queue clear while Trevor is not reviewing every technical detail.

Current rule:

- No deletion pass.
- Protect all passed groups and new pages.
- Fix missing references and route holes first.
- Rerun Runtime Keep Board after each small fix batch.

Already protected by checkpoints:

- `backup-before-cleanup-v7-12-38` branch exists.
- Runtime cleanup fix pass checkpoint exists.
- Passed groups / do-not-lose checkpoint exists.

Known safe fixes already applied:

- Old Route Pointer alias added.
- Old Route Guard alias added.
- Old Platform Builder alias added.
- Old Release Candidate alias added.
- Old Plan 3 app shell alias added.
- Old Plan 3 RC alias added.
- Old Web Builder alias added.
- Settings Studio route pointed safely to current Settings Hub.
- Legacy CSS alias `eLstyle.css` added.

Remaining fix queue from V7.12.41 missing refs:

## Real repeated reference to tidy

- `stream_bandit_original_logo_square_256.png`
  - Seen on platform control, settings hub, submit video, rules, review queue pages.
  - Runtime brand helper already injects the Supabase logo, but the hardcoded fallback source should be cleaned or treated as brand-helper-owned.

## Old route aliases / low risk

- `stream-bandit-route-pointer-machine-v7-12-64-test.html` — now added as alias.
- `platform-control-tower-route-guard-proof-v7-12-63-test.html` — now added as alias.
- `platform-builder-standalone-v5-80-test.html` — now added as alias.
- `release-candidate-standalone-v5-82-test.html` — now added as alias.
- `app-shell-plan3-test.html` — now added as alias.
- `index-plan3-rc-test.html` — now added as alias.
- `web-builder-standalone-v5-79-test.html` — now added as alias.

## Scanner/report noise to filter later

- `stream-bandit-runtime-keep-graph-v7-12-41.js`
- `stream-bandit-runtime-keep-graph-v7-12-40.js`
- `stream-bandit-global-dependency-graph-v7-12-39.js`
- `stream-bandit-full-route-graph-v7-12-38.js`

These names come from JSON download/report file names and should not become real app dependencies.

## Old sample/media references to review later

- `HLS.js`
- `test.html`
- `x.m3u8`
- `t.html`
- `row.js`

These look like old/example script references and should not be fixed by deleting current pages. Review only after runtime pass is stable.

Next safe action:

1. Rerun `repository-runtime-keep-board-v7-12-41-test.html`.
2. Confirm the alias fixes reduced strong missing refs.
3. If repeated logo reference remains, either update those pages to use only `data-sb-brand-logo` without the old local `src`, or update the scanner to treat brand-helper-owned logo fallbacks as safe.
4. Do not archive/delete review candidates until a separate archive batch is prepared.
