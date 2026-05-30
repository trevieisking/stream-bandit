# Stream Bandit Page Fix Rules — V7.12.150

This checkpoint records the exact page-by-page repair goal after the Test Checklist and Health Check passes.

## Core rule

Use the existing menu-recognised page URL wherever possible. Do not create fresh throwaway page chains. A fixed page should be promoted over the old menu route so the overlay/current-page logic keeps matching the same URL.

## Five page-fix rules

1. **Old URL stays on promotion**
   - Keep the current menu overlay route URL.
   - Promote the corrected page over the old URL.
   - Do not change the route filename unless the old route is genuinely dead and not used by the menu/registry/overlay.

2. **No new pages unless unavoidable**
   - First scan the current route.
   - Reuse the current old menu URL, or use a confirmed old dead test page if a separate test slot is needed.
   - Avoid new final/final-2/final-3 page piles.

3. **Locked actions rule**
   - Unlock safe owner/admin actions and make them useful.
   - Remove controls that should never unlock on that page.
   - Do not leave dead locked buttons just for display.
   - Dangerous work such as payments, destructive deletes, schema changes, live promotion and index replacement must not appear as active controls unless explicitly planned.

4. **Global shell/header/footer rule**
   - Use the same Live Readiness / Test Checklist / Health Check shell-header pattern.
   - Let the global shell/helper stack own the hamburger menu, account chip, avatar, header icons, theme, settings, and search overlay.
   - Do not invent manual duplicate icon rows.
   - Keep the full footer grid and current global helper scripts.

5. **Current route links only**
   - Every button, tab, card, footer link and helper link must point to current routes.
   - No old V5/V6 admin-shell links unless deliberately preserved as a protected fallback.
   - Scan links before calling a page passed.

## Pattern learned

The previous failing pattern was manual page headers/icon strips and stale V6 links. The working pattern is to rebuild the page in-place using the Live Readiness-style shell/header stack, current V7 route links, useful safe actions, and full footer.

## Pages already repaired with this pattern

- `test-checklist-global-helpers-v7-10-5-test.html`
- `health-check-global-helpers-v7-10-6-test.html`

## Standard test checklist for every page

- Old URL remains unchanged.
- Hamburger/menu overlay works.
- Menu overlay recognises the page as current.
- Header looks like the recent passed pages.
- No duplicate/manual icon row.
- Global avatar/account is shell-owned.
- Search overlay works.
- Footer grid appears.
- Tabs work.
- Useful actions work.
- Controls that should never unlock are removed.
- Links point to current pages.
- No accidental save/upload/delete/publish/schema/payment/live/index action exists.

## Protected pages/rules still respected

Do not overwrite protected reference logic until rebuilt properly: Accessibility, player/audio boost, Supabase Test, Supabase Migration, Review Queue, Recovery Bridge, Settings/theme, Upload/Mux/Supabase option pages, Profile/Auth/avatar pages, global shell/helper files, assets, checkpoints and backups.
