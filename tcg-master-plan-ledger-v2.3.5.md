# Stream Bandit TCG — Master Plan Ledger V2.3.5

**Date:** 2026-09-17  
**Master plan:** `tcg-master-plan-progress-v2.3.5.md`  
**Checklist:** `tcg-master-plan-checklist-v2.3.5.md`  
**Release index:** `tcg-release-control-v2.4.json`  
**Inherits:** append-only history from `tcg-master-plan-ledger-v2.3.4.md`.

## Continuity rule

This ledger is append-only continuity evidence. Material work is not accepted until the checklist and ledger identify the exact source state, evidence, live impact and next operation.

## V2.3.5-001 — Release-shell interpretation corrected and preserved

**Decision:** ACCEPTED / LOCKED ✅

The original playable prototype remains the in-match UX north star, but the production TCG is not an all-in-one page. The release flow is separated into Landing/Account, Game Home, Play/Ranked, Matchmaking, Opponent Found/Paired, board-only Match and Result, with Collection/Deck/Packs/Learn/Progress/Profile/Settings outside the match.

“One-screen battlefield” now has one unambiguous meaning: the active battle board remains coherent and visible during gameplay choices. It does not mean authentication, menus, matchmaking and collection share the battle page.

Backend decision remains unchanged: reuse/adapt existing `tcg-private-alpha-api`, `tcg-match-actions`, `tcg-tactic-actions` and existing Supabase TCG data/RPCs. No parallel backend.

## V2.3.5-002 — PR #571 first validation exposed stale test contract

**PR:** #571  
**Initial head:** `dbc79d48f48a7929452d59a5663790e12e9b61c1`  
**Validation:** #618 / run `35247100892`

The Set One Node validation lane failed exactly one assertion: `card-pass-2-v2-battle-card-control-attack.test.mjs` still required the old page identity marker `data-sb-tcg-v2-battle="card-control-v0-1"`, while the intentionally changed match page declared `board-only-v0-2`.

The new board-only tests themselves passed. Runtime-core work was not implicated. The failure was therefore classified as stale test-contract drift caused by the intentional release-shell identity change, not evidence of a gameplay regression.

**Decision:** PROMOTE bounded test synchronization only; HOLD merge until fresh exact-head validation.

## V2.3.5-003 — Stale marker assertion repaired

**Branch:** `feat/tcg-v2-board-only-match-shell`  
**Repair commit:** `b7f870bf9cb0a1679f71c762a05e67901b3df0c0`

Exactly one existing assertion changed:

- expected page marker: `card-control-v0-1`
- corrected page marker: `board-only-v0-2`

No gameplay assertion, Attack transport assertion, server authority assertion, card-data assertion or browser-rules prohibition was weakened or removed.

## V2.3.5-004 — PR #571 exact-head validation accepted

**Reviewed head:** `b7f870bf9cb0a1679f71c762a05e67901b3df0c0`  
**Validation:** TCG Card Pass 2 Validation #619 / run `35247988250` — SUCCESS  
**Review threads:** 0  
**Review submissions:** 0  
**PR comments:** 0  
**Combined legacy statuses:** none found

Exact diff from pre-slice main `d331e93f75e8c5ce6345ac030651f44c37f78866`:

- ahead 3 / behind 0
- `tcg-battle-v2.html` +6/-7
- `tcg/tests/card-pass-2-v2-battle-card-control-attack.test.mjs` +1/-1
- `tcg/tests/card-pass-2-v2-board-only-match-shell.test.mjs` +35/-0
- total 3 files / +42 / -8

No controller, Edge Function, SQL, migration, card registry, starter data or production configuration changed.

**Decision:** PROMOTE PR #571 source merge; Supabase/live/production remain HOLD.

## V2.3.5-005 — PR #571 merged

**Expected head used for merge:** `b7f870bf9cb0a1679f71c762a05e67901b3df0c0`  
**Pre-merge main:** `d331e93f75e8c5ce6345ac030651f44c37f78866`  
**Merge commit / new main:** `24fe6d0feff7c7298ffb474887ae8eef2dc8b44f`

Result: V2-SHELL-01A board-only match route is complete in source.

No deployment was performed. The source merge does not mark the release client, matchmaking, Attack gameplay, audio or production complete.

## V2.3.5-006 — Checklist interpretation after #571

Accepted checklist changes:

- `SHELL-07` active match board-only route → **COMPLETE IN SOURCE ✅**
- `SHELL-08` match-safe HUD/settings → **PARTIAL 🟡**; turn/phase/revision HUD exists, remaining release-safe controls are pending
- `SHELL-11` auth/session continuity → **PARTIAL 🟡**; explicit Auth Gate dependency exists, full route journey is unproven
- all Landing/Game Home/Ranked/Matchmaking/Paired/Result implementation items remain pending
- V2-MM-01 remains pending
- V2-ATTACK-01 remains pending
- V2-AUDIO-01 remains pending
- Supabase/live/production remain HOLD

## V2.3.5-007 — Ranked pairing UX remains automatic and code-free

**Locked decision:** Ranked uses the existing automatic matchmaking backend. Player-visible pairing/join codes are prohibited in Ranked.

An internal `join_code` may remain where the current data model requires it, but it is opaque compatibility data and is never displayed/copied/requested by the Ranked release UI. Direct-code behavior remains isolated for future Friends/Private mode.

## V2.3.5-008 — Auth reuse boundary

The existing shared Stream Bandit Auth Gate is accepted as reusable session/sign-in infrastructure. It handles email/password sign-in, sign-out, session watching and approved-profile checks. It explicitly does not provide public signup.

Therefore V2-SHELL-01B must inventory existing account-creation capability before introducing any new signup surface. No duplicate authentication owner is permitted.

## V2.3.5-009 — Exact next implementation gate

**Current main:** `24fe6d0feff7c7298ffb474887ae8eef2dc8b44f`

Next bounded operation:

1. inventory existing Create Account/signup capability;
2. inventory TCG/menu/navigation assets;
3. inventory exact client contract for automatic matchmaking and current deck selection;
4. define minimum separate routes: Landing/Account → Game Home → Play/Ranked → Matchmaking → Paired → existing board-only Match → Result;
5. implement on a non-main branch using existing auth/session/config and existing TCG backend;
6. add focused navigation/auth/matchmaking contract tests;
7. refresh exact-head validation/reviews/comments/statuses;
8. update plan/checklist/ledger before acceptance message;
9. merge only after a fresh PROMOTE decision;
10. keep Supabase/live/production HOLD unless separate evidence justifies a deployment.

## Current progress meter

- G0R accepted source repairs: inherited 4 / 11
- V2-UI-01 card-face Attack intent: COMPLETE IN SOURCE ✅
- V2-ATTACK-00A rejection visibility: COMPLETE IN SOURCE ✅
- V2-SHELL-01A board-only match: COMPLETE IN SOURCE ✅
- V2-SHELL-01B release navigation: ACTIVE NEXT 🔧
- V2-MM-01 Ranked matchmaking client journey: PENDING 🔒
- V2-ATTACK-01 real two-user Attack proof: PENDING 🔒
- V2-AUDIO-01: PENDING 🔒
- live/production: HOLD 🔒
