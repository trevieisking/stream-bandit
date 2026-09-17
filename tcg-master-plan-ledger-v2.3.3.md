# Stream Bandit TCG — Master Plan Ledger V2.3.3

**Date:** 2026-09-17  
**Status:** append-only continuity ledger for the Deck Search integrity amendment  
**Master plan:** `tcg-master-plan-progress-v2.3.3.md`  
**Checklist:** `tcg-master-plan-checklist-v2.3.3.md`  
**Release index:** `tcg-release-control-v2.2.json`  
**Previous ledger:** `tcg-master-plan-ledger-v2.3.2.md`  
**Repository:** `trevieisking/stream-bandit`  
**Control PR:** #564 / `docs/tcg-v2-3-post-test-consistency`

---

## Ledger rules

All V2.3.2 continuity rules remain mandatory.

1. GitHub exact PR/branch/commit evidence is repository truth.
2. Supabase is deployed runtime/database truth.
3. No planning file claims runtime implementation without runtime evidence.
4. Every material TCG work-result message must leave a current checklist/ledger checkpoint before delivery.
5. A dropped message/new chat resumes from GitHub, not memory.
6. Merge/deploy/live promotion are separate decisions.

---

# V2.3.3-001 — User rule accepted: every true Deck Search must shuffle

**Requested rule:** every card that searches a deck must have the rule **"Then shuffle your deck"** because entering/searching an ordered hidden deck can otherwise let a player retain future-order knowledge.

**Decision:** ACCEPT / LOCK as canonical desired behavior.

**Reasoning:**

- a true search exposes a selectable subset from an ordered hidden deck;
- even when the UI avoids showing positions, the game should not preserve search-derived order knowledge;
- the existing generic catalogue already separates `search.deck`, `deck.shuffle`, `reveal.top_deck`, `deck.reorder_top`, and `deck.reorder_bottom`, so the rule can be expressed generically without a new owner/helper;
- intentional top-N look/reorder mechanics must remain distinct so their ordering purpose is not accidentally destroyed.

**Starting PR head refreshed before write:** `9d4b98404cd60e298634f23503b69abe00c1515d`.

**Pre-write PR state:** open, unmerged, base `main`, control branch `docs/tcg-v2-3-post-test-consistency`.

**Pre-write evidence:** existing review threads resolved; workflow runs on starting head: none found; combined statuses on starting head: none found.

**Promotion decision for this slice:**

- documentation/control branch update — **PROMOTE**;
- PR merge — **HOLD**;
- main — **HOLD**;
- runtime/Supabase/live/production — **HOLD**.

---

# V2.3.3-002 — Dedicated machine rule contract created

**Commit:** `c7e4b178515baeda626c3ae3e96c20713bbc7552`

**File:** `tcg-deck-search-integrity-v1.json`

Locked machine contract:

- true `search.deck` has mandatory postcondition `deck.shuffle`;
- shuffle cannot be disabled by omission from individual card data;
- own-deck player text: **Then shuffle your deck.**;
- generic/other-deck text: **Then shuffle that deck.**;
- if a search is accessed but zero cards are selected, the deck still shuffles;
- if an optional search is declined before deck access, no automatic search shuffle occurs;
- search UI must not expose unnecessary original deck-position metadata;
- browser cannot authoritatively shuffle;
- top-N reveal/look/reorder is not automatically `search.deck`;
- existing Search, Hidden Information, Card-Zone and Shuffle/Randomization owners are reused;
- no owner #41 or card-specific helper is justified.

Runtime implementation remains unproven.

---

# V2.3.3-003 — Canonical master-plan amendment created

**Commit:** `69ba7e26a52cbf3455b80789dbcf90c6a709309f`

**File:** `tcg-master-plan-progress-v2.3.3.md`

The canonical plan now locks:

- every true Deck Search ends with authoritative shuffle;
- mandatory `search.deck -> deck.shuffle` composition;
- exact normal resolution order;
- zero-selection-after-access still shuffles;
- declined optional search before access does not shuffle;
- explicit handling for future post-shuffle top/bottom placement;
- hidden-information constraints;
- player-facing wording requirement;
- owner boundaries and no-new-owner rule;
- minimum deterministic acceptance tests;
- integration into V2-G1/V2-G1E/V2-G3/V2-G4/V2-G7 without weakening V2-G0R.

All V2.3.2 requirements remain active.

---

# V2.3.3-004 — Machine release index updated

**Commit:** `c694970987e7b9bce112c1caf7accf70269c3063`

**File:** `tcg-release-control-v2.2.json`

Release Control now points to:

- V2.3.3 master plan;
- V2.3.3 checklist;
- V2.3.3 ledger;
- dedicated Deck Search integrity contract;
- prior V2.3.2 control files as historical predecessor authorities.

Machine state records the Deck Search rule as **LOCKED desired behavior / runtime proof pending**.

No runtime/Supabase/live change occurred.

---

# V2.3.3-005 — Exact rule semantics preserved

The following are explicitly **not** treated as true Deck Search merely because they expose cards:

- draw;
- reveal/look at top card(s);
- reorder top/bottom card(s);
- search hand;
- search discard;
- search Rewards.

Those mechanics keep their own structured ordering rules.

This distinction is required to prevent the new anti-memory/search-integrity rule from breaking deliberate top-deck manipulation designs.

---

# Current gate state after this amendment

- V2.3.3 Deck Search rule — **LOCKED**;
- runtime Search→Shuffle proof — **TODO**;
- card-text/render validation proof — **TODO**;
- V2-G0R — **HOLD, 0/11 accepted repairs**;
- PR #564 merge — **HOLD**;
- main — **HOLD**;
- Supabase/runtime/live/production — **HOLD**.

---

# Exact next operation

1. create/finalize `tcg-master-plan-checklist-v2.3.3.md` as the current continuity checkpoint;
2. refresh exact PR head, workflow runs and combined status;
3. post the exact-head checkpoint on PR #564;
4. on the next implementation slice, resume the locked V2-G0R route while carrying `search.deck -> deck.shuffle` into every relevant Search/Card-Zone/Hidden Information/Shuffle design and test decision.

---

# V2.3.3-006 — V2-G0R implementation started: G0R-10 proven, G0R-11 safety prerequisite patched

**Implementation session date:** 2026-09-17.

**Canonical control head at session start:** PR #564 head `856f76c9f7c6887e20d24ed2a3f592554f3fd7ee`.

**Current main baseline refreshed:** `59ab7857522373a53de7d551c66f12c2e514e934`.

## G0R-10 source proof

Exact-source inspection of `supabase/functions/tcg-tactic-actions/index.ts` proves `play_tactic` validates the outer `Tactic` family and effect schema but does not reject non-one-shot Tactic subtypes before resolution begins. Current structured Set One data proves the canonical Tactic subtype vocabulary includes `Ally`, `Device`, `Relic`, and `Realm`; separate Relic and Realm owner routes already exist.

**Locked implementation boundary:** only `Ally` and `Device` may enter the one-shot `play_tactic` interpreter. `Relic` and `Realm` must remain owned by their dedicated routes. No new owner/helper is justified.

G0R-10 remains **TODO / proven defect** until the runtime guard and deterministic boundary test land and pass exact-head validation.

## G0R-11 prerequisite implementation

The existing `.github/workflows/tcg-card-pass-2-validation.yml` path filter covered only named legacy control files, a handful of shared TCG modules and four explicit TCG migrations. This can skip validation for newer master-plan/control files, other shared TCG owners, future/current TCG Edge Function trees and other TCG migrations.

A dedicated non-main implementation branch was created from exact main:

- branch: `fix/tcg-g0r-11-validation-coverage`;
- starting SHA: `59ab7857522373a53de7d551c66f12c2e514e934`;
- patch commit: `5d8c8e9d882b769041db318a9ad14d55a4f0c63f`;
- exact diff: 1 file, +6 / -0;
- file: `.github/workflows/tcg-card-pass-2-validation.yml`.

Added coverage is intentionally additive and preserves every existing explicit path while adding:

- root `tcg-*.md`;
- root `tcg-*.json`;
- root `tcg-*.mjs`;
- shared `supabase/functions/_shared/tcg-*.ts`;
- all `supabase/functions/tcg-*/**` trees;
- all `supabase/migrations/*tcg*.sql` migrations.

Draft runtime-recovery PR opened:

- PR #565 — `TCG G0R-11: broaden validation path coverage`;
- base: `main`;
- head: `fix/tcg-g0r-11-validation-coverage`;
- reviewed opening head: `5d8c8e9d882b769041db318a9ad14d55a4f0c63f`;
- changed files: 1;
- additions/deletions: +6 / -0;
- state: open, draft, unmerged.

**Promotion state:** branch-only G0R-11 patch = **PROMOTE**. PR merge/main/runtime/Supabase/live/production = **HOLD** pending fresh exact-head CI trigger and green validation evidence.

**Production/live impact:** none.

**Exact next operation:** fetch PR #565 exact-head workflow runs/statuses and prove the repaired trigger fires. If green, mark G0R-11 accepted and update the checklist/ledger before advancing to the already-proven G0R-10 subtype guard.
