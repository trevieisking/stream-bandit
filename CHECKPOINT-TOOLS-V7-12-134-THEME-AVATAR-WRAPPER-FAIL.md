# CHECKPOINT - TOOLS V7.12.134 THEME + AVATAR WRAPPER FAIL

Date: 2026-05-29
Project: Stream Bandit
Area: Admin group / Globals / Tools page
Status: FAIL - wrapper/injection method unstable

## Summary

Tools V7.12.134 was tested as a theme/avatar helper wrapper on top of the V7.12.132 full Tools page.

Test page:

`tools-page-global-helpers-v7-12-134-test.html`

Helper:

`tools-global-theme-avatar-fix-v7-12-134.js`

Result: fail.

The page is not a final pass because theme is inconsistent and avatar still does not appear in the visible account chip.

## User result

User confirmed:

- Theme: SOMETIMES works
- Avatar: NEVER works
- Other tests: seem fine

## What this means

### Theme problem

If theme only works sometimes, the wrapper/injection pattern is not stable enough.

Likely cause:
- The V7.12.134 wrapper loads V7.12.132 inside an iframe.
- The theme/avatar helper is injected after the inner page loads.
- The original page helpers can win the timing race after the wrapper helper applies.
- Hard-coded page CSS can also win unless the fix is loaded directly inside the real page.

### Avatar problem

The helper status line saying Avatar loaded is not proof that avatar is displayed.

The actual visible problem is:
- `StreamBanditAuthAvatar` can load.
- `StreamBanditAuthProfile` can load.
- `StreamBanditAuthSync` can load.
- But the visible `#sbAuthChip` account area still does not show the profile avatar.

Root cause found:
- The auth/profile helper reads profile fields such as username/display name/channel/role.
- It does not render `avatar_url` into the chip by itself.
- A page-level fix must insert the avatar into the actual chip or the chip helper must be upgraded globally later.

## What passed from previous Tools work

V7.12.132 remains the best near-pass base:

- Full page, not wrapper
- Existing Tools workflow works
- Existing browser-only tools work
- Header/global shell layout works
- Header icons passed
- Search overlay works
- Footer grid appears
- Routes tab appears
- Health/Mux/Storage links visible
- Link Audit works
- Menu overlay behaves normally
- No shell edit
- No index promotion
- No Supabase write
- No payment code

## What failed in V7.12.134

- Global theme not reliably applied
- Avatar never appears in the account chip
- Wrapper/injection approach is no longer acceptable for this page

## Decision

Stop stacking wrapper pages for Tools.

Next fix must be a real full-page Tools build with the theme/avatar fix loaded directly as part of the page, not injected from a parent wrapper.

Recommended next page:

`tools-page-global-helpers-v7-12-135-test.html`

Requirements:

1. Start from V7.12.132 full Tools page, not wrapper.
2. Load `tools-global-theme-avatar-fix-v7-12-134.js` directly in the page.
3. Keep all useful tool logic from V7.12.132.
4. Do not iframe the page.
5. Do not rely on parent injection.
6. Add a visible theme/avatar debug result if needed.
7. Do not edit protected shell.
8. Do not promote index.
9. Do not write to Supabase.
10. Do not touch payment code.

## Final checkpoint status

Tools V7.12.134 theme/avatar wrapper is a FAIL.

Do not mark Tools passed until theme and account-chip avatar are both stable on a direct full-page Tools build.
