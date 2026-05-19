# Stream Bandit Shared Style Pattern V7

Purpose: record the recovered style/settings pattern that is working on the tested style-borrow pages. Use this as the checklist when upgrading current pages. This file is documentation only. It does not change app routes.

## Known working source pages

Trevor confirmed or identified these as working with the right shared settings/theme behaviour:

- `final-shell-navigation-style-borrow-v6-59-3-test.html`
- `live-readiness-style-borrow-v6-60-5-test.html`
- `test-checklist-admin-shell-v6-62-test.html`
- `tools-page-admin-shell-v6-63-test.html`
- `health-check-admin-shell-v6-64-test.html`
- `mux-manager-admin-shell-v6-65-test.html`
- `storage-prep-admin-shell-v6-66-test.html`
- `backup-safety-admin-shell-v6-67-test.html`

## Required script pattern

For pages that use shared shell/account/search/settings, include these in this safe order:

1. Supabase SDK if the page needs auth/profile or reads app settings:

```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```

2. Shared shell/menu/search:

```html
<script src="stream-bandit-shell-v6-24.js"></script>
```

3. Shared menu saves/counts where relevant:

```html
<script src="stream-bandit-menu-saves-count-v6-72-1.js"></script>
```

4. Shared auth/profile shell where relevant:

```html
<script src="stream-bandit-auth-profile-v6-31.js"></script>
```

5. Shared auth sync helper where relevant:

```html
<script src="stream-bandit-auth-sync-v6-31-7.js"></script>
```

## Required style data source

The shared style should be read from Supabase:

- table: `sb_app_settings`
- row id: `stream_bandit`
- main style key: `web_builder_shared_style_v7_8_8`
- fallback style key: `web_builder_style`

## Required style application

Pages should map saved style settings to local CSS variables:

- `accent` -> main green/accent variable
- `accent2` -> secondary purple/accent variable
- `bg` -> background variable
- `card` -> card/panel variables
- `textColor` -> muted/text variable
- `buttonText` -> button text variable
- `font` -> body font family
- `largeText` -> font scale
- `highContrast` -> stronger line/border variable

## Required page behaviour

Each upgraded current page should:

- show shared shell/header shape
- show menu overlay
- show search bar/overlay
- show account/profile shell where relevant
- load saved Theme Studio style
- have a reload borrowed style control where useful
- keep normal safe buttons working
- avoid fake locked buttons except for genuinely dangerous actions
- stay functional after refresh

## Dangerous actions rule

Dangerous actions can remain protected. They should not silently do nothing.

Dangerous actions include:

- replacing `index.html`
- promoting live
- rolling back live
- deleting rows/files
- running migrations
- destructive storage changes
- destructive bulk updates

If a page has a dangerous action, it should either:

- explain why it is locked,
- link to the proper safety/checklist workflow,
- or remain unavailable until a proper safe tool exists.

## Current immediate issue

Some pages load `stream-bandit-auth-profile-v6-31.js` without the Supabase SDK loaded first. This can produce:

`Supabase client not available`

For pages using the current V6.31.6 auth helper, the SDK line must appear before the auth helper, unless the helper is later upgraded to load the SDK itself.

## How to use this pattern

For each active page in `STREAM-BANDIT-ACTIVE-ROUTE-MAP-V7.md`:

1. Open the page and compare it to this pattern.
2. If it already works, mark it passed.
3. If it lacks the shared style borrow, upgrade it using the known working pattern from `final-shell-navigation-style-borrow-v6-59-3-test.html` and `live-readiness-style-borrow-v6-60-5-test.html`.
4. Do not rebuild the whole page if a small shared setting pattern can be added safely.
5. Do not modify already passed pages unless a shared/global fix breaks them.
