# Stream Bandit Property Ownership Note — Web Builder Owns Global Theme

Date: 2026-05-21

## Rule confirmed by Trevor

Do not duplicate global display/theme controls inside Settings.

The global display/theme property belongs to Web Builder.

## Owner page

Theme/global display owner:

- `web-builder-theme-studio-controls-v7-8-9-test.html`

Theme/global display applier:

- `stream-bandit-shared-style-v7-0-2.js`

## Reason

Duplicating the same global theme controls in another Settings page could create conflicts between pages and saved settings.

The current rule is:

- If a property belongs to another page, leave it there.
- Do not duplicate ownership.
- Settings may link to or explain the owner page later, but must not create a competing theme editor.
- Web Builder owns the global display/theme controls.
- Keep properties on their proper owner pages.

## Settings group direction after this note

Settings group should continue, but without creating a duplicate Theme / Global Studio page.

Recommended Settings group order now:

1. Profile Settings — already passed/promoted to `profile-settings-global-helpers-v7-5-8-test.html`
2. Final Shell Navigation — next safe page
3. Platform Builder
4. Settings
5. Settings Studio
6. Web Builder — deep scan/pass last, because it owns global display/theme and builder controls

## Important caution

When upgrading Settings, Settings Studio, Platform Builder, Final Shell Navigation, or Web Builder:

- Do not move global theme ownership out of Web Builder.
- Do not create duplicate theme save keys.
- Do not add a separate competing global theme editor.
- Preserve the existing Web Builder theme keys:
  - `web_builder_shared_style_v7_8_8`
  - `web_builder_style`

This note exists to prevent property conflicts during the global-helper pass.
