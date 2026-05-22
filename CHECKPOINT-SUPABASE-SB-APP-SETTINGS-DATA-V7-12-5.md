# Stream Bandit Checkpoint — Supabase sb_app_settings Data V7.12.5

Date: 2026-05-22

## Purpose

Reviewed the live `sb_app_settings` row used for Stream Bandit global theme/settings.

## Row id

```txt
stream_bandit
```

## Important current settings found

```txt
appName: Chatterfriends Stream Bandit
tagline: Chatterfriends Movies
version: V4.13.1
logoMode: upload
updated_from: global-studio-theme-owner-v7-9-9
sb413LastSource: Typed form saved to Supabase
playerAudioBoost: 1
playerJumpSeconds: 10
```

## Logo fields found

```txt
logo
logoUrl
```

Both point to Supabase Storage public image URLs.

## Theme/style fields found

```txt
builderStyle
web_builder_style
web_builder_shared_style_v7_8_8
```

These contain the same style family:

```txt
bg: #11051f
card: #26114a
accent: #ff2d85
accent2: #7c3cff
textColor: #e2d7ff
titleColor: #ffffff
buttonText: #ffffff
font: Arial,sans-serif
largeText: true
highContrast: true
source: global-studio-theme-owner
version: V7.9.9
```

## Interpretation

The global settings row exists and the shared theme data is present.

Important detail: the row id is `stream_bandit`, not `global`, `default`, or `settings`.

Any page/global helper that only looks for a different settings id may fall back to `defaults-no-settings-json`, which explains why some newer test pages show helpers loaded but do not fully show Trevor's saved global properties.

## Current likely fix later

When it is safe to code/test again, global settings helpers and newer pages should make sure they read the `sb_app_settings` row with:

```txt
id = stream_bandit
```

They should prefer the style values from:

```txt
web_builder_style
builderStyle
web_builder_shared_style_v7_8_8
```

and logo from:

```txt
logoUrl
logo
```

## Safety

No SQL was run.
No row was edited.
No table was changed.
No RLS policy was changed.
No live promotion.
