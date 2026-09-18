# Stream Bandit TCG Master Plan Progress V2.4.28 — Fixed Client Visual Authority

**Scope:** visual/client shell only. Gameplay, card rules, schema, migrations, economy and live Edge Function owners are unchanged.

## User-approved target
- Seven 1672×941 visual references are locked as immutable art direction.
- The TCG is a standalone full-screen client.
- Generic Stream Bandit website header/search/account/footer chrome is forbidden inside the TCG.
- Shared Stream Bandit config/auth/functionality may still be reused without rendering the website shell.
- Primary game navigation: Battle · Decks · Collection · Battle Pass · Shop · Settings.
- The viewport never scrolls. Long content scrolls only inside bounded feeds.
- Battle Pass is now required as a real route but has no fabricated XP/currency/reward authority.

## Implementation target
1. Replace the generic page shell with one reusable TCG Client Shell.
2. Apply fixed-view height/overflow contract to all TCG routes.
3. Restyle Play / Decks / Collection / Battle Pass / Shop / Settings under the approved visual system.
4. Give Battle its own TCG in-game navigation while preserving existing battle controller/runtime owners.
5. Remove rendered website header/footer scripts from every TCG route.
6. Keep the existing Play → canonical matchmaking → match_id → Battle handoff.
7. Human-review against the seven approved references before advancing the visual gate.

## Release boundary
PR #576 remains draft/unmerged. main, Pages/public and full-live release remain HOLD until exact-head CI and human visual acceptance.
