# Stream Bandit Checkpoint — Global Helper Status Scan V7.12.5

Date: 2026-05-22

## Purpose

Read-only code scan while waiting for GitHub custom domain DNS/HTTPS to settle.

Goal: understand why some pages show `defaults-no-settings-json` even when the global theme appears to load.

## Files inspected

```txt
stream-bandit-settings-global-v7-1-8.js
stream-bandit-shared-style-v7-0-2.js
control-tower-footer-policy-previews-v7-12-5-test.html
```

Also searched for global-helper status wording across the repo.

## Key finding 1 — Settings bridge is not the theme bridge

`stream-bandit-settings-global-v7-1-8.js` reads:

```txt
sb_app_settings.id = stream_bandit
```

But it only looks for feature-control/settings-control JSON keys:

```txt
settings_platform_control_hub
platform_feature_controls
featureControls
streamBanditSettings
```

If those keys are missing, it reports:

```txt
defaults-no-settings-json
```

This does not necessarily mean the saved global theme failed.

## Key finding 2 — Shared style helper is correctly reading Trevor's saved theme

`stream-bandit-shared-style-v7-0-2.js` also reads:

```txt
sb_app_settings.id = stream_bandit
```

It correctly checks theme/style keys:

```txt
web_builder_shared_style_v7_8_8
web_builder_style
builderStyle
```

It applies CSS variables for theme values such as:

```txt
--accent
--accent2
--bg
--card
--title
--muted
--btnText
--fontScale
--line
```

It sets:

```txt
document.documentElement.dataset.streamBanditSharedStyle = loaded
```

and dispatches:

```txt
streambandit:shared-style-loaded
```

## Key finding 3 — V7.12.5 page status is misleading

`control-tower-footer-policy-previews-v7-12-5-test.html` shows one combined helper status line:

```txt
Global helpers: Account sync · Avatar · Shared style · Settings bridge · source: [bridge.source]
```

But `source` comes from `StreamBanditSettingsGlobal.getState()`, not from `StreamBanditSharedStyle`.

So the page can show:

```txt
Shared style ✅ · Settings bridge ✅ · source: defaults-no-settings-json
```

This can be misread as global theme failure even when the theme helper is loaded and working.

## Key finding 4 — This pattern appears across many global-helper test pages

Search shows the same style of global-helper status wording across many pages, including settings, profile, genres, tools, final shell, channels, playlists, rules, collections, web builder, health check, storage prep, likes/favourites, review queue, submit video, about, platform builder, mux manager and others.

Because of that, do not patch random pages one by one.

## Recommended V7.12.6 fix direction

Create a small clarity upgrade that separates the statuses:

```txt
Account sync: loaded / pending
Avatar helper: loaded / pending
Shared style: loaded from stream_bandit theme keys / pending
Settings bridge: feature-control JSON found / no feature-control JSON yet
```

Suggested wording:

```txt
Shared style: loaded from sb_app_settings.stream_bandit ✅
Theme keys: web_builder_style / builderStyle / web_builder_shared_style_v7_8_8 ✅
Settings bridge: no feature-control JSON yet ⚠️
```

This avoids confusing missing future settings-control JSON with missing theme.

## Safe implementation options later

Option A: update only the V7.12.5 policy preview checker into V7.12.6 so Trevor can test the clearer status first.

Option B: create a reusable helper-status script for future pages so new pages can display the same clean wording without duplicating code.

Recommended next coding step: Option A first, then decide whether to centralize.

## What was not changed

No app code was changed during this scan.
No Supabase SQL was run.
No Supabase rows were edited.
No DNS or GitHub Pages settings were changed.
No magic-link login test was used.
No live/index promotion.
