# Stream Bandit Checkpoint — Custom Domain Settings Route Promoted V7.12.9

Date: 2026-05-23

## Problem found

The old Settings route from the menu opened:

```txt
settings-menu-upgrade-v6-19-test.html
```

It loaded as a page, but failed the custom-domain/global-helper checks:

```txt
Still signed in: fail
Theme/avatar visible: fail
Settings page loads: pass
Tabs/sections visible: pass
No blank/error page: pass
```

## Correct passed Settings route

Trevor tested:

```txt
settings-sources-owner-launcher-v7-6-6-test.html
```

and confirmed it passed:

```txt
Still signed in
Theme/avatar visible
Settings/source owner page loads
Tabs/sections/cards visible
No blank/error page
```

## Change made

The old menu target file:

```txt
settings-menu-upgrade-v6-19-test.html
```

was updated into a safe redirect/launcher to:

```txt
settings-sources-owner-launcher-v7-6-6-test.html
```

## Why this was safe

- The old V6.19 Settings route was not global-helper ready.
- The V7.6.6 Settings Sources / Owner Launcher is the correct passed route.
- No settings save/write actions were added.
- No Supabase SQL was run.
- No RLS policies were changed.
- No live/index promotion was performed.

## Commit for route promotion

```txt
d401f8b584db0c7c8a3d34b1c3b9008e319152dd
```
