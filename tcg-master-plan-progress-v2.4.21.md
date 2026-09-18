# Stream Bandit TCG — Master Plan Progress V2.4.21

**Repository:** `trevieisking/stream-bandit`  
**Pull request:** #576  
**Continuity parent:** `133952d7205a6aa98c0429bb02b41acdd05bc83d`  
**Master-plan target:** INTERACT-08 server authority remains final legality authority  
**Release:** 🔒 HOLD merge / `main` / public / full live release.

## 1. Target

Close canonical V2.4.1 **INTERACT-08** by proving that every accepted direct tabletop interaction remains advisory in the browser and authoritative at the server commit boundary.

## 2. Command fence

Every battle command uses the shared client envelope:
- `match_id`;
- unique `client_nonce`;
- `expected_revision`.

The Setup, Match and Tactic Edge owners independently reject stale revisions and commit through the canonical server-state commit RPC with `p_expected_revision`.

The battle controller contains no direct database RPC mutation path.

## 3. Final legality proof

- **Setup Creature placement:** server checks setup turn, hand membership, starter legality and destination occupancy before Card-Zone placement.
- **Ordinary Creature:** server validates Reserve index/occupancy and Baby/Standalone/Mythic legality before placement.
- **Evolution:** read-only target projection is separate; final `evolve` runs `runtimeV02ValidateEvolutionDeclaration` before mutation.
- **Essence:** projection is separate; final attachment runs `runtimeV02ValidateManualEssenceAttachmentDeclaration` before the canonical attachment route.
- **Relic:** projection is separate; final attachment runs `runtimeV02ValidateManualRelicAttachmentDeclaration` before canonical Relic movement.
- **Realm:** final play checks Realm identity then delegates timing/replacement legality to `runtimeV02BeginRealmPlayRoute`.
- **Tactic:** read-only playability and real `play_tactic` both call the same `tacticPlayability` evaluator; real mutation starts only after it passes.
- **Attack:** final server declaration validates turn/source/slot/cost/requirements/target through the Attack owner before damage.
- **Ability / Withdraw:** their server routes already delegate to the canonical Active Ability and Withdrawal transaction owners, ready for INTERACT-09 browser work.

## 4. Scope

No product code is required. V2.4.21 adds regression/evidence controls only.

## 5. Next target

After exact-head acceptance, canonical V2.4.1 advances to **INTERACT-09 — Vanguard Ability/Attack/Withdraw remain card-context actions**.

Attack is already card-context. Ability and Withdraw browser transport must be audited against their server owners before any UI change.

## 6. Acceptance

Fresh exact-head TCG Validation, Migration Replay, Functional Smoke, review/status and bounded-diff evidence are required.


## 7. Accepted checkpoint

V2.4.21 is accepted at `751890b9b20dd20e51ef474d7035d58ae8d07194`.

INTERACT-08 server-final legality is complete with zero product/runtime changes.

**Next locked target:** INTERACT-09 — Vanguard Ability/Attack/Withdraw remain card-context actions. Attack is already card-owned. Ability and Withdraw require a server-owned read-only action projection before browser controls are added; do not copy Arcade Lab metadata inference or manual Withdrawal-cost prompts.
