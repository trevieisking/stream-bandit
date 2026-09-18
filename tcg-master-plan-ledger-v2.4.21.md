# Stream Bandit TCG — Master Plan V2.4.21 Execution Ledger

**Plan:** `tcg-master-plan-progress-v2.4.21.md`  
**Checklist:** `tcg-master-plan-checklist-v2.4.21.md`  
**Continuity parent:** `133952d7205a6aa98c0429bb02b41acdd05bc83d`.

## V2.4.21-001 — target selected

**State:** ✅

Canonical V2.4.1 advances from accepted INTERACT-07 to INTERACT-08.

## V2.4.21-002 — client authority boundary

**State:** ✅

The V2 battle client builds commands with match ID, unique nonce and expected revision. It invokes Edge owners rather than calling database RPC mutation functions.

## V2.4.21-003 — stale-state fence

**State:** ✅

Setup, Match and Tactic owners each compare the supplied revision with authoritative stored state before gameplay mutation and commit through `tcg_server_commit_state` with the reviewed revision.

## V2.4.21-004 — projection/revalidation audit

**State:** ✅

Evolution, Essence, Relic and Tactic projections are read-only convenience surfaces. Their corresponding final actions independently re-run server legality before mutation.

Creature, Realm, Setup and Attack also validate their full declaration on the server. Future Ability/Withdraw card controls already have canonical server owners and do not need browser legality engines.

## V2.4.21-005 — scope

**State:** ✅

No product/browser/renderer/Edge/schema/migration/card-data changes are proposed. This checkpoint adds only a regression contract and synchronized controls.

## V2.4.21-006 — validation

**State:** 🔄

Hold INTERACT-08 acceptance until fresh exact-head TCG Validation, Migration Replay, Functional Smoke, review/status and bounded-diff gates pass.
