# Stream Bandit TCG — Master Plan V2.4.12 Execution Ledger

**Plan:** `tcg-master-plan-progress-v2.4.12.md`  
**Checklist:** `tcg-master-plan-checklist-v2.4.12.md`  
**Continuity parent:** `2d8b592c5d516ac4ac4bf3f7d1ee349b6c3fcdfc`.

## V2.4.12-001 — target selection

**State:** ✅

Canonical V2.4.1 direct-interaction order identifies Evolution as the next unfinished card interaction after accepted Creature placement and Realm transport.

## V2.4.12-002 — authority seam

**State:** ✅

V2.4.11 deployed `evolve_targets` and existing `evolve` supply the exact server seam required by the browser. No client rules engine is needed.

## V2.4.12-003 — browser transport/presentation

**State:** ✅ SOURCE CANDIDATE

Selected play-turn hand cards call `evolve_targets`. Evolution cards receive only server-returned green Vanguard/Reserve destinations. Choosing one calls `evolve`. Non-Evolution cards retain existing generic Reserve/Realm behavior.

## V2.4.12-004 — regression fence

**State:** ✅ SOURCE CANDIDATE

No renderer, server, database, Edge Function, card data, rule engine or Attack/Ability behavior is modified.

## V2.4.12-005 — validation

**State:** 🔄

Hold acceptance until fresh exact-head validation, migration replay, functional smoke, review/status and bounded-diff evidence pass.

## Checkpoint

Supabase `tcg-match-actions` v3 remains deployed and unchanged by this UI slice. PR merge/main/public/full-live remain HOLD.
