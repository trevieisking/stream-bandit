# Web Builder Global Control Hub Direction V7.12.263

## Locked direction

Web Builder needs its own global control hub, separate from the Stream Bandit movie app settings.

The Web Builder control hub should behave like a builder-owned settings and identity centre that projects the Web Builder shell, theme, branding and account state across Web Builder pages only.

## Separation rule

- Stream Bandit app settings control the movie app.
- Web Builder settings control the Web Builder product area.
- Do not let Web Builder theme/account/avatar/brand edits accidentally write into the live Stream Bandit movie app shell.
- Do not let Stream Bandit app shell helpers own the Web Builder studio shell.

## Core UI rule

- Inputs live in overlays.
- Outputs display on clean page views.
- Anything added/created must have a simple remove/delete path.
- Remove/delete must be guarded and clearly scoped.

## Recommended route

First safe test route:

- `web-builder-account-control-hub-v7-12-263-test.html`

This should become the Web Builder-owned equivalent of the app's Settings / Theme / Profile tools.

## Main page output should show

- Current Web Builder account card.
- Current Web Builder avatar/profile preview.
- Current Web Builder brand/logo preview.
- Current Web Builder theme preview.
- Current Web Builder shell preview.
- Current builder favourites/saved pages.
- Current global builder settings report.
- Current safety/debug report.

## Editing should happen in overlays

- Edit account overlay.
- Edit avatar overlay.
- Edit theme overlay.
- Edit brand/logo overlay.
- Edit favicon/app icons overlay.
- Edit shell/header/footer overlay.
- Edit saved/favourite builder pages overlay.
- Reset/remove overlay.

## Builder-owned global features

Web Builder should get its own versions of the live app systems where needed:

- Web Builder account.
- Web Builder avatar/profile.
- Web Builder favourites / saved builder pages.
- Web Builder theme editor.
- Web Builder brand editor.
- Web Builder logo/icon/favicon/app icon helper.
- Web Builder asset library.
- Web Builder shell projector.
- Web Builder page manager.
- Web Builder preview settings.
- Web Builder form/inbox settings.

## Data/write safety for first pass

First pass should be local-preview first:

- No schema changes.
- No Stream Bandit app settings damage.
- No live app theme writes.
- No index promotion.
- No registry promotion.
- No current app shell helper edits.

Later write options should be decided after testing:

- Use `sb_app_settings.settings.builderShell` or a similar builder-owned settings namespace if existing table permissions are safe.
- Store page-level theme overrides in `sb_site_pages.settings_json.theme` only after ownership checks are safe.
- Add new tables only after schema/security review.

## Why this direction is correct

The Web Builder should feel like its own product/studio, not like a page inside the Stream Bandit movie app. The builder needs its own shell, account controls, theme controls, branding controls, asset controls and projection layer while preserving the working app and existing builder support routes until replacements pass.
