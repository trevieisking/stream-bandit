# Stream Bandit TCG — Master Plan Checklist V2.4.24

**Plan:** `tcg-master-plan-progress-v2.4.24.md`  
**Ledger:** `tcg-master-plan-ledger-v2.4.24.md`  
**Continuity parent:** `90df200bdbc136ff59724498c047c7c36d5c498d`

## A. Authoritative resolution view

- [x] **RES-UI-01** browser reads only `pending_resolution {kind,seat,count}`.
- [x] **RES-UI-02** unknown/non-resolution kinds fail closed.
- [x] **RES-UI-03** local controls render only when pending seat equals local seat.
- [x] **RES-UI-04** opponent-owned resolution renders waiting state only.

## B. Reward resolution

- [x] **RES-REWARD-01** Reward identities remain hidden; cards stay face-down.
- [x] **RES-REWARD-02** only active visible Reward positions can be selected.
- [x] **RES-REWARD-03** Reward selections toggle locally before commit.
- [x] **RES-REWARD-04** confirm uses server-projected count only.
- [x] **RES-REWARD-05** commit reuses `take_reward(reward_positions)`.

## C. Mandatory promotion

- [x] **RES-PROMOTE-01** occupied local Reserve cards are highlighted during local promotion resolution.
- [x] **RES-PROMOTE-02** one Reserve selection toggles locally before commit.
- [x] **RES-PROMOTE-03** defeated-Vanguard / mandatory-promotion state is explicit.
- [x] **RES-PROMOTE-04** commit reuses `promote(reserve_index)`.
- [x] **RES-PROMOTE-05** post-promotion listener choices remain on generic Match/Tactic choice routing.

## D. Architecture regression

- [x] **RES-REG-01** no Reward-value/defeat/promotion rule engine added to browser.
- [x] **RES-REG-02** no hidden Reward identity exposed.
- [x] **RES-REG-03** no server runtime/database/card-data change.
- [x] **RES-REG-04** Attack/Ability/Withdraw/Tactic transports remain unchanged.

## E. Exact-head acceptance

- [x] **V2424-CI-01** TCG Card Pass 2 Validation succeeds — #708 SUCCESS at behavior head `37e06263ade6b7ee15a881ce39a230411dee2161`.
- [x] **V2424-CI-02** Migration Replay succeeds from zero — #878 SUCCESS.
- [x] **V2424-CI-03** Functional Smoke succeeds — #904 SUCCESS.
- [x] **V2424-REVIEW-01** review threads remain zero / material findings resolved — 0 review threads, 0 legacy combined statuses.
- [x] **V2424-DIFF-01** diff stays bounded to battle browser/CSS/cache/tests/V2.4.24 controls — exactly 1 commit / 8 files / 0 server-runtime, schema, migration or card-data changes.

## F. Canonical checklist effect

- [x] **STATE-VIS-07** Reward count/claim state — accepted after E passed.
- [x] **STATE-VIS-11** Defeat/KO + mandatory promotion — accepted resolution surface after E passed.

**Decision:** ✅ ACCEPTED SOURCE. Behavior head `37e06263ade6b7ee15a881ce39a230411dee2161` passed all exact-head gates. Supabase Match v6 / Tactic v4 remain unchanged; merge / `main` / public / full-live remain HOLD.
