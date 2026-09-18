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


## Source gate evidence
- Visual/product source commit: `2fa4c64b29b60dac7ebba522420077d3a5cc6710`.
- Test-alignment head: `18d41a62be6d226f9e31404b50ab04250432ce37`.
- TCG Card Pass 2 Validation #746: SUCCESS.
- Code Labs V50 Functional Smoke #942: SUCCESS, including PostgreSQL replay.
- Standalone Migration Replay #915: SUCCESS on the immediately preceding test-only head; the exact-head #916 run was cancelled before jobs due workflow concurrency.
- This control-sync commit exists specifically to obtain a fresh exact-head three-lane gate after the queue cleared.

Human visual acceptance remains open; no merge/main/Pages/full-live promotion is implied.
