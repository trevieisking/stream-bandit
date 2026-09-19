# Stream Bandit TCG — Master Plan Checklist V2.4.21

**Plan:** `tcg-master-plan-progress-v2.4.21.md`  
**Ledger:** `tcg-master-plan-ledger-v2.4.21.md`  
**Continuity parent:** `133952d7205a6aa98c0429bb02b41acdd05bc83d`

## A. Command / revision authority

- [x] **AUTH-01** battle commands carry `match_id`, nonce and expected revision.
- [x] **AUTH-02** Match owner rejects stale revision and commits with expected revision.
- [x] **AUTH-03** Tactic owner rejects stale revision and commits with expected revision.
- [x] **AUTH-04** Setup owner rejects stale revision and commits with expected revision.
- [x] **AUTH-05** battle browser has no direct database RPC mutation authority.

## B. Final interaction legality

- [x] **AUTH-SETUP** Setup placement revalidates turn/card/starter/destination server-side.
- [x] **AUTH-CREATURE** ordinary Creature placement validates slot and Creature legality server-side.
- [x] **AUTH-EVOLUTION** final evolve revalidates after target projection.
- [x] **AUTH-ESSENCE** final Essence attach revalidates after target projection.
- [x] **AUTH-RELIC** final Relic attach revalidates after target projection.
- [x] **AUTH-REALM** final Realm play delegates timing/replacement legality to Realm owner.
- [x] **AUTH-TACTIC** preview and final Tactic play share the same server evaluator.
- [x] **AUTH-ATTACK** Attack cost/requirements/target are resolved server-side before damage.
- [x] **AUTH-ABILITY** Active Ability server route delegates to canonical Ability owner.
- [x] **AUTH-WITHDRAW** Withdraw server route delegates payment/switch to canonical Withdrawal transaction owner.

## C. Exact-head acceptance

- [x] **V2421-CI-01** TCG Card Pass 2 Validation succeeds — #700 at accepted head `751890b9b20dd20e51ef474d7035d58ae8d07194`.
- [x] **V2421-CI-02** Migration Replay succeeds from zero — #870.
- [x] **V2421-CI-03** Functional Smoke succeeds — #896.
- [x] **V2421-REVIEW-01** review threads remain zero / material findings resolved.
- [x] **V2421-DIFF-01** diff is regression/evidence controls only; zero product/runtime bytes changed.

## D. Master-plan interaction state

- [x] **INTERACT-01** Creature.
- [x] **INTERACT-02** Evolution.
- [x] **INTERACT-03** Essence.
- [x] **INTERACT-04** Relic.
- [x] **INTERACT-05** Realm.
- [x] **INTERACT-06** Tactic.
- [x] **INTERACT-07** Selection cancellation.
- [x] **INTERACT-08** Server authority final — accepted across Setup/Creature/Evolution/Essence/Relic/Realm/Tactic/Attack and future Ability/Withdraw server owners.
- [ ] **INTERACT-09** Vanguard Ability/Attack/Withdraw card-context actions.

**Decision:** V2.4.21 ACCEPTED ✅ at `751890b9b20dd20e51ef474d7035d58ae8d07194`. INTERACT-08 is complete with zero product-byte change. Main/public/full-live remain HOLD 🔒.
