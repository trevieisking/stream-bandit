# Stream Bandit TCG — Master Plan Execution Checklist V2.3.3

**Date:** 2026-09-17  
**Master plan:** `tcg-master-plan-progress-v2.3.3.md`  
**Ledger:** `tcg-master-plan-ledger-v2.3.3.md`  
**Release index:** `tcg-release-control-v2.2.json`  
**Deck Search contract:** `tcg-deck-search-integrity-v1.json`  
**Previous checklist:** `tcg-master-plan-checklist-v2.3.2.md`  
**Repository:** `trevieisking/stream-bandit`  
**Control PR:** #564 / `docs/tcg-v2-3-post-test-consistency`

---

## 0. Mandatory continuity rule

Every V2.3.2 checklist item remains active with its recorded state. V2.3.3 adds the Deck Search integrity gate below and does not remove, downgrade or silently complete any prior requirement.

Before every material TCG work-result message:

- [ ] exact current PR/branch/head refreshed;
- [ ] checklist IDs touched recorded;
- [ ] exact files/systems changed or inspected recorded;
- [ ] test/review/runtime evidence recorded;
- [ ] live/production impact stated;
- [ ] PROMOTE/HOLD/BLOCK/DEMOTE decision recorded where relevant;
- [ ] ledger updated for accepted slice;
- [ ] exact next operation recorded.

A source change without the checklist checkpoint is **not an accepted master-plan step**.

---

# A. V2.3.3 control files

| ID | Requirement | State | Evidence |
|---|---|---|---|
| CTRL-010 | Dedicated Deck Search integrity machine contract exists | COMPLETE | `tcg-deck-search-integrity-v1.json`, commit `c7e4b178515baeda626c3ae3e96c20713bbc7552` |
| CTRL-011 | Canonical master plan explicitly locks mandatory shuffle after true Deck Search | COMPLETE | `tcg-master-plan-progress-v2.3.3.md`, commit `69ba7e26a52cbf3455b80789dbcf90c6a709309f` |
| CTRL-012 | Machine release index points to V2.3.3 + Deck Search integrity authority | COMPLETE | `tcg-release-control-v2.2.json`, commit `c694970987e7b9bce112c1caf7accf70269c3063` |
| CTRL-013 | Append-only V2.3.3 ledger records rationale, evidence and next operation | COMPLETE | `tcg-master-plan-ledger-v2.3.3.md`, commit `4a684ef718fdf3b6e4e16b7312c50cedfb6762ad` |
| CTRL-014 | V2.3.3 checklist carries the rule as separately testable requirements | COMPLETE | this file |
| CTRL-015 | All V2.3.2 checklist requirements remain active | LOCKED | no V2.3.2 requirement is removed or marked complete by this amendment |

---

# B. Deck Search integrity — VERY IMPORTANT

**Desired-behavior gate state: LOCKED.**  
**Runtime implementation state: TODO.**

| ID | Requirement | Locked | Implementation / proof |
|---|---|---:|---|
| SEARCH-01 | Every true Deck Search ends with a shuffle of the searched deck | ✅ | TODO runtime proof |
| SEARCH-02 | `search.deck` has mandatory postcondition `deck.shuffle` | ✅ | TODO V2-G1E owner/opcode proof |
| SEARCH-03 | Individual card data cannot disable the shuffle by merely omitting `deck.shuffle` | ✅ | TODO schema/validation proof |
| SEARCH-04 | Own-deck player-facing rule says **Then shuffle your deck.** | ✅ | TODO card-text/renderer validation |
| SEARCH-05 | Other-deck generic wording says **Then shuffle that deck.** | ✅ | TODO card-text/renderer validation |
| SEARCH-06 | Search that accesses the deck but ultimately selects zero cards still shuffles | ✅ | TODO deterministic test |
| SEARCH-07 | Optional search declined before deck access does not cause unnecessary shuffle | ✅ | TODO deterministic test |
| SEARCH-08 | Search UI does not expose unnecessary original deck index/position metadata | ✅ | TODO hidden-information/client proof |
| SEARCH-09 | Opponent does not receive illegal searched-deck identities/order | ✅ | TODO two-seat private/public view proof |
| SEARCH-10 | Authoritative shuffle occurs server-side, never as browser authority | ✅ | TODO runtime proof |
| SEARCH-11 | Search uses existing Search + Hidden Information + Card-Zone + Shuffle/Randomization owners | ✅ | TODO V2-G1E mapping proof |
| SEARCH-12 | No owner #41/card-specific search helper is added for this invariant | ✅ | ACTIVE architecture rule |

---

# C. Search resolution ordering

| ID | Required order | Locked | Proof |
|---|---|---:|---|
| SEARCH-ORD-01 | Server validates legal search + eligible set | ✅ | TODO |
| SEARCH-ORD-02 | Player chooses only legally visible eligible card(s) | ✅ | TODO |
| SEARCH-ORD-03 | Selected card(s) move to structured destination when leaving deck | ✅ | TODO |
| SEARCH-ORD-04 | Searched deck shuffles after the search selection/movement operation | ✅ | TODO |
| SEARCH-ORD-05 | Later unrelated effects/listeners/ordinary play resume only after shuffle | ✅ | TODO |
| SEARCH-ORD-06 | Search-derived pre-shuffle order cannot be observed/reused by later effects | ✅ | TODO |

---

# D. Intentional ordering mechanics must not be broken

The anti-memory rule applies to **true Deck Search**, not every mechanic that views cards.

| ID | Mechanic | Auto-shuffle merely because cards were viewed? | State |
|---|---|---:|---|
| SEARCH-DIST-01 | `draw.cards` | NO | LOCKED |
| SEARCH-DIST-02 | `reveal.top_deck` / look at top card(s) | NO | LOCKED |
| SEARCH-DIST-03 | `deck.reorder_top` | NO | LOCKED |
| SEARCH-DIST-04 | `deck.reorder_bottom` | NO | LOCKED |
| SEARCH-DIST-05 | `search.hand` | NO deck shuffle | LOCKED |
| SEARCH-DIST-06 | `search.discard` | NO deck shuffle | LOCKED |
| SEARCH-DIST-07 | `search.rewards` | NO deck shuffle | LOCKED |
| SEARCH-DIST-08 | `search.deck` | **YES — mandatory** | LOCKED |

---

# E. Explicit post-search top/bottom placement

| ID | Requirement | Locked | Proof |
|---|---|---:|---|
| SEARCH-PLACE-01 | A future effect that wants a searched card to end as known top/bottom must encode that sequence explicitly | ✅ | TODO generic schema proof |
| SEARCH-PLACE-02 | Canonical sequence is search/select → shuffle searched deck → explicit post-shuffle top/bottom placement | ✅ | TODO deterministic test |
| SEARCH-PLACE-03 | No Deck Search may silently preserve the pre-search deck order | ✅ | TODO runtime proof |

---

# F. Minimum deterministic acceptance suite

The rule is not implementation-COMPLETE until all applicable tests pass on an exact reviewed head.

- [ ] **SEARCH-T01** one-card search to hand → move → shuffle;
- [ ] **SEARCH-T02** multi-card search → all moves → exactly one post-search shuffle;
- [ ] **SEARCH-T03** optional search accesses deck, chooses zero → shuffle;
- [ ] **SEARCH-T04** optional search declined before access → no unnecessary shuffle;
- [ ] **SEARCH-T05** later effect cannot observe/rely on pre-search order;
- [ ] **SEARCH-T06** search UI reveals no unnecessary source positions;
- [ ] **SEARCH-T07** opponent view receives no searched-deck leak;
- [ ] **SEARCH-T08** look/reveal top N does not auto-shuffle;
- [ ] **SEARCH-T09** reorder top/bottom does not auto-shuffle unless its rule says so;
- [ ] **SEARCH-T10** search + explicit post-shuffle top placement leaves selected card on top as intended;
- [ ] **SEARCH-T11** search + explicit post-shuffle bottom placement leaves selected card on bottom as intended;
- [ ] **SEARCH-T12** server shuffle deterministic under test seed / browser non-authoritative;
- [ ] **SEARCH-T13** all reachable current/future `search.deck` card definitions render or generate the mandatory shuffle wording;
- [ ] **SEARCH-T14** validation rejects/flags true Deck Search presentation that omits the shuffle rule;

---

# G. Gate integration

| Gate | Deck Search requirement |
|---|---|
| V2-G0R | remains first; no release-recovery item is skipped because this rule was added |
| V2-G1 | Fairy/Underworld/current/future card translation must not author a Deck Search that bypasses mandatory shuffle |
| V2-G1E | prove generic `search.deck -> deck.shuffle` owner/opcode composition and tests |
| V2-G2 | renderer/card text clearly communicates **Then shuffle your deck** for true searches |
| V2-G3 | search interaction uses the board-preserving private grid/carousel rather than debug/browser prompts |
| V2-G4 | battle choreography proves search choice, move, shuffle and return-to-board flow |
| V2-G5 | two-player proof confirms no opponent search/order leakage |
| V2-G7 | release acceptance includes reachable Deck Search behavior in smoke/E2E coverage |

---

# H. Current inherited project state

This amendment does not change the prior project gate states:

- V2-G0R — **HOLD, 0/11 accepted repairs**;
- original prototype-restoration rules — **LOCKED**;
- 40-owner baseline — **LOCKED**;
- 193/8 deployed historical private-alpha baseline remains historical live/runtime reference until separately changed;
- V2 content target remains 10 elements / 241 identities / 10 starter decks;
- PR #564 merge — **HOLD**;
- `main` — **HOLD**;
- runtime/Supabase/live/production — **HOLD**;
- CTRL-006 visual-controller pointer from V2.3.2 remains **HOLD** until safely realigned; this amendment does not hide it.

---

# I. This message-delivery checkpoint

**Starting exact PR head before this rule slice:** `9d4b98404cd60e298634f23503b69abe00c1515d`.

**Control-only commits created during this slice before this checklist commit:**

1. `c7e4b178515baeda626c3ae3e96c20713bbc7552` — Deck Search integrity machine contract;
2. `69ba7e26a52cbf3455b80789dbcf90c6a709309f` — V2.3.3 master-plan amendment;
3. `c694970987e7b9bce112c1caf7accf70269c3063` — Release Control v2.2;
4. `4a684ef718fdf3b6e4e16b7312c50cedfb6762ad` — V2.3.3 ledger.

**Runtime/live change:** none.  
**Supabase change:** none.  
**Main change:** none.  
**Merge:** none.

**Slice decision:** **PROMOTE control-rule lock only.**  
**Merge/runtime/live decision:** **HOLD.**

---

# J. Exact next operation

After this checklist lands:

1. refresh PR #564 exact head;
2. fetch exact-head workflow runs and combined statuses;
3. post the exact-head V2.3.3 checkpoint to PR #564;
4. resume the locked V2-G0R implementation route on the next bounded technical slice;
5. whenever Search behavior is touched, carry `SEARCH-01` through `SEARCH-T14` as mandatory acceptance criteria.
