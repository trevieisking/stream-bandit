# Code Labs Scanner Manifest Addendum V148

This addendum records scanner coverage that must be preserved after the V145/V147 Setup recovery work.

The live scanner remains `code-labs/helper-route-map.html`. Do not build a second scanner. Use this addendum as the update checklist before editing the scanner manifest.

## Why this exists

V145 restored Setup after Home without rewriting the protected V12 route owner. V147 added the page role register so working pages are not forgotten. The scanner should continue to be the single Code Labs truth tool, so its seed lists and protected-helper notes must include the new protection files.

## Required scanner seed additions

### Asset/helper seed

Add this helper to `ASSET_SEEDS` in `code-labs/helper-route-map.html`:

- `code-labs/assets/code-labs-setup-route-v145.js`

### Document seed

Add this document to `DOC_SEEDS` in `code-labs/helper-route-map.html`:

- `code-labs/CODE_LABS_PAGE_ROLE_REGISTER_V147.md`

## Suggested helper status

`code-labs/assets/code-labs-setup-route-v145.js` should be treated as a protected keep helper while the protected V12 source owner still omits Setup.

Suggested reason:

- It keeps Setup visible after Home.
- It routes Setup directly to File Lab.
- It prevents the visible menu from dropping the project/repo setup page.
- It does not write to GitHub, Supabase, local app pages, or main.

## Suggested scanner note

Add a small scanner or manifest note that says:

> Setup route protection is active. Home must route to Setup, and Setup must route to File Lab. Project Picker remains support/legacy prep unless explicitly re-promoted.

## No-drop relationship

The scanner should be used together with:

- `code-labs/CODE_LABS_MENU_ROUTE_AGREEMENT_V130.md`
- `code-labs/CODE_LABS_PAGE_ROLE_REGISTER_V147.md`

Before route/menu/page work, check all three:

1. Scanner output: what exists and loads now.
2. Menu route agreement: what the visible route must be.
3. Page role register: what role each page has and whether it can be hidden from the main route.

## Current decision

V148 does not edit the live scanner yet. It records the exact scanner update target first so the later scanner edit can be small and verifiable.
