# Web Builder Global Projector Rollout V7.12.263

## Purpose

This file controls the safe rollout of the Web Builder global projector.

The projector file exists:

- `web-builder-global-projector-v7-12-263.js`

The control hub exists:

- `web-builder-account-control-hub-v7-12-263-test.html`

The projector reads the local Web Builder hub draft and applies Web Builder-only theme, brand and hub rail state. It does not connect to the Stream Bandit movie app settings.

## Current status

- `V7.12.263.1 Web Builder Account Control Hub Local Preview` — PASS.
- `V7.12.263.2 Web Builder Global Projector JS` — CREATED.
- Direct page wiring is NOT done yet.

## Why direct page wiring is not being rushed

The current Web Builder pages are working and tested. The safe next move is page-by-page wiring, not a bulk rewrite.

Direct wiring means adding this script to each Web Builder-owned page:

```html
<script src="web-builder-global-projector-v7-12-263.js?v=7-12-263"></script>
```

But that should be done one page at a time, with a smoke test after each page, because the existing pages are stable.

## Connect-last rule

The projector remains Web Builder-only.

Do not connect to:

- Stream Bandit app settings.
- Stream Bandit global theme owner.
- Stream Bandit header shell.
- Stream Bandit footer shell.
- Stream Bandit index route.
- Stream Bandit route registry promotion.

## Rollout order

Wire one page, test it, then continue.

1. `web-builder-account-control-hub-v7-12-263-test.html`
2. `web-builder-pages-manager-owned-v7-12-256-test.html`
3. `web-builder-assets-v7-12-252-test.html`
4. `web-builder-preview-owned-v7-12-257-test.html?page=landing`
5. `web-builder-form-designer-owned-v7-12-258-test.html?page=landing`
6. `web-builder-form-inbox-owned-v7-12-258-test.html?page=landing`
7. `web-builder-route-map-v7-12-252-test.html`
8. `web-builder-studio-v7-12-252-test.html`

## Pass condition per page

Each wired page must show:

- Web Builder hub rail available.
- Theme variables applied from the Web Builder hub local draft.
- Brand/logo state projected from the Web Builder hub local draft.
- Page's original functions still working.
- No app setting write.
- No Stream Bandit shell helper loaded by the projector.
- No schema change.
- No registry/index promotion.

## Debug keys expected from projector

The browser console/window should expose:

```js
window.StreamBanditWebBuilderProjector
```

Expected values:

- `connectedToLiveApp: false`
- `storageKey: "sb.webBuilder.controlHub.v7.12.263"`
- `version: "V7.12.263.2 Web Builder Global Projector"`

The page root should expose:

- `data-web-builder-projector="active"`
- `data-web-builder-live-app-connection="false"`

## Safety notes

- No bulk update.
- No protected Stream Bandit helper edits.
- No app theme owner writes.
- No Supabase writes.
- No schema changes.
- No route promotion.
- No index promotion.

## Next action

Start with the control hub page itself, then pages manager, because those are the safest first two pages to wire.
