# Stream Bandit TCG — Master Plan Progress Checklist

**Checkpoint date:** 2026-09-06  
**Active implementation:** PR #549 — `feature/tcg-private-alpha-v0-5-source-recovery`  
**Evidence head before this checklist update:** `d7d8b1c50485e7ccebff385baf7827cb826de1e2`

## Current authority

This checklist is the operational companion to `tcg-master-plan.html` and the 4 September 2026 locked TCG master plan.

When older Code Labs workflow notes conflict with the current TCG master plan or Trev's later explicit direction, the current TCG master plan wins. Code Labs, GitHub and Supabase are tools to complete the game; they are not allowed to turn an obsolete workflow checkpoint into a permanent blocker.

The engineering rule remains: preserve working systems, understand the change before writing it, keep gameplay server-authoritative, and do not claim a feature complete until its real integration test passes.

### Status legend

- **DONE (branch)** — implemented in PR #549 source and currently part of the integration branch.
- **LIVE** — present in the connected Supabase production project.
- **IN PROGRESS** — design/implementation exists but the full master-plan capability is not complete yet.
- **TODO** — not yet implemented to the master-plan definition.
- **REPAIR** — implementation exists but current rules show a known drift that must be corrected before promotion.

---

# 1. Rules, product and Set One

- [x] **DONE** — 8 current Set One elements locked: Astral, Ember, Gale, Grove, Shade, Stone, Tide, Volt.
- [x] **DONE** — 8 starter identities / exact 60-card starter recipes retained as the target starter system.
- [x] **DONE** — Set One target locked to **193 gameplay identities**.
- [x] **DONE** — Baby → Teen → Adult evolution model, Standalone role, Mythic class separation and one-evolution-per-stack-per-turn rules recorded.
- [x] **DONE** — 40–390 printed HP rule recorded.
- [x] **DONE** — Vanguard / four Reserve slots / six Reward Cards / real Essence cards / Tactic families / Shield / conditions recorded.
- [x] **DONE** — Starbound is separate from Mythic and uses one player-owned marker per match.
- [x] **DONE** — global matchup-table architecture replaces per-card Weakness duplication.
- [x] **DONE** — current Set One design audits completed across Astral, Ember, Gale, Grove, Shade, Stone, Tide and Volt.
- [ ] **IN PROGRESS** — final deterministic STRUCTURE pass for all 193 identities.
- [ ] **TODO** — AI Test Match balance pass across all eight starters after the deterministic registry is complete.
- [ ] **TODO** — human balance pass and final numeric tuning.

## Card Pass 2 structure

- [x] **DONE (branch)** — `sb-tcg-card-v0.2` / `sb-tcg-effects-v0.2` schema work and Amendments A–F.
- [x] **DONE (branch)** — Astral structured candidate.
- [x] **DONE (branch)** — Ember 24 structured candidate.
- [ ] **NEXT** — Schema Amendment G: generic alternate attack target + target-zone conditional damage; remove the current Skyrend card-name exception.
- [ ] **NEXT AFTER G** — Gale 24 structured candidate.
- [ ] **TODO** — Grove structured candidate.
- [ ] **TODO** — Shade structured candidate.
- [ ] **TODO** — Stone structured candidate.
- [ ] **TODO** — Tide structured candidate.
- [ ] **TODO** — Volt structured candidate.
- [ ] **TODO** — final 193-card registry migration/version freeze after deterministic simulation and human balance testing.

---

# 2. Database, security and private-alpha foundation

## Already live in Supabase

- [x] **LIVE** — private-alpha foundation migration.
- [x] **LIVE** — private-alpha security hardening.
- [x] **LIVE** — atomic starter grant.
- [x] **LIVE** — server deck validation foundation.
- [x] **LIVE** — private room lobby.
- [x] **LIVE** — join-code compatibility.
- [x] **LIVE** — match shell and hidden canonical state foundation.
- [x] **LIVE** — atomic match command commit / nonce + revision path.
- [x] **LIVE** — card printings and TCG art bucket migration.
- [x] **LIVE** — `tcg-private-alpha-api` is deployed and JWT-protected.
- [x] **LIVE** — `tcg-match-actions` v0.1 is deployed and JWT-protected.

## Implemented on the branch but not yet applied/deployed live

- [x] **DONE (branch)** — three-currency economy migration source: Battle Pass Tokens, Trade Tokens and Shop Coins.
- [x] **DONE (branch)** — automatic matchmaking migration source.
- [x] **DONE (branch)** — Arcade XP/progression and idempotent match-reward migration source.
- [x] **DONE (branch)** — `tcg-match-actions` v0.3 battle-engine candidate.
- [x] **DONE (branch)** — `tcg-tactic-actions` deterministic Tactic interpreter candidate.
- [ ] **NOT LIVE** — economy/copy-limit migration is not in the production migration ledger.
- [ ] **NOT LIVE** — automatic matchmaking migration is not in the production migration ledger.
- [ ] **NOT LIVE** — Arcade progression/reward migration is not in the production migration ledger.
- [ ] **NOT LIVE** — branch `tcg-match-actions` v0.3 has not replaced deployed v0.1.
- [ ] **NOT LIVE** — `tcg-tactic-actions` is not currently deployed.

## Known database repair before promotion

- [ ] **REPAIR** — `20260905105500_tcg_economy_and_copy_limit_alignment.sql` still contains the superseded global one-Mythic-total check and Legendary-specific deck restrictions. Current rules are identity based: ordinary gameplay identity max 4, Mythic identity max 1, with Essence using its own allowance. Repair this migration before it is ever applied live.

---

# 3. Server-authoritative battle engine

- [x] **DONE (branch foundation)** — hidden canonical state + per-player views.
- [x] **DONE (branch foundation)** — idempotent client nonce and expected-revision commit path.
- [x] **DONE (branch)** — play Creature, evolve, attach Essence, attach Relic, play Realm and core turn ownership paths exist.
- [x] **DONE (branch)** — attack cost parsing, Shield, damage, recoil/effect damage and major condition handling exist.
- [x] **DONE (branch)** — Starbound attack consumption foundation exists.
- [x] **DONE (branch)** — defeat scan / winner completion / match reward handoff foundation exists.
- [x] **DONE (branch)** — deterministic Ally/Device interpreter exists for the currently structured 40 Tactics.
- [x] **DONE (branch)** — lifecycle support added for temporary attack bonuses, withdrawal overrides, condition immunity, final-Vanguard attack eligibility and generated Essence cleanup.
- [ ] **IN PROGRESS** — generic pending-choice engine must finish attack effects and creature Abilities; no runtime parsing of printed English.
- [ ] **REPAIR / NEXT** — remove `gale-skyrend` attack-target card-name logic and encode generic Reserve targeting + required Reserve damage modifier.
- [ ] **IN PROGRESS** — replace remaining creature/card-name gameplay branches with structured event/listener metadata as each Card Pass 2 element lands.
- [ ] **TODO** — complete all hidden-information choices: hand, deck and Reward-card inspections with player-private views.
- [ ] **TODO** — complete reconnect/resume test through an interrupted real match.
- [ ] **TODO** — complete simultaneous/replayed command and stale-revision adversarial tests.
- [ ] **TODO** — complete full two-player match from setup → battle → victory → persisted result with no manual database intervention.

---

# 4. Modes, matchmaking and progression

- [x] **DONE (branch)** — Arcade defined as the first normal non-ranked progression mode.
- [x] **DONE (branch)** — automatic two-player matchmaking SQL authored with idempotent queue reuse and room locking.
- [x] **DONE (branch)** — private rooms remain available for friend/test battles and do not farm normal Arcade economy rewards.
- [x] **DONE (branch)** — player XP, Arcade matches/wins/losses/streak fields authored.
- [x] **DONE (branch)** — idempotent per-match reward receipts authored.
- [x] **DONE (branch)** — current Arcade reward baseline authored: participation/win XP and Shop Coin reward configuration.
- [ ] **TODO** — player-facing Arcade matchmaking UI integration against the final deployed API.
- [ ] **TODO** — ranked rating system and ranked reward configuration.
- [ ] **TODO** — final player level/rank presentation and profile UI.
- [ ] **TODO** — deterministic Test Deck Battle / AI Test Match bot using the same legal server action path.

---

# 5. Economy, Collection and Deck Builder

- [x] **DONE (rules)** — exactly three currencies: Battle Pass Tokens, Trade Tokens, Shop Coins.
- [x] **DONE (rules)** — normal collection keep limit 4; Mythic keep limit 1; extras convert through the economy rules.
- [x] **DONE (rules)** — 200 Shop Coins per pack baseline.
- [x] **DONE (rules)** — 200 Battle Pass Tokens = one Battle Pass tier baseline.
- [ ] **TODO** — server-authoritative duplicate conversion into rarity-based Trade Tokens.
- [ ] **TODO** — Collection UI using authoritative owned printings/copies.
- [ ] **TODO** — Deck Builder save/edit/validation UI using authoritative current rules.
- [ ] **TODO** — Shop Coin purchase transaction + receipt flow.
- [ ] **TODO** — server-authoritative pack opening and card-printing grants.
- [ ] **TODO** — Trade Token spending/trading flow.
- [ ] **TODO** — pack, box, sleeve, coin and special-edition collectible inventory presentation.

---

# 6. Battle Pass and daily achievements

- [x] **DONE (rules)** — 100 Battle Pass tiers.
- [x] **DONE (rules)** — reward on every tier and progressively stronger reward path.
- [x] **DONE (rules)** — 3 daily achievements.
- [ ] **TODO** — Battle Pass season/config tables and authoritative tier-claim receipts.
- [ ] **TODO** — 100-tier reward definition for cards, special editions, packs, decks, boxes, sleeves, coins and currencies.
- [ ] **TODO** — daily achievement assignment/progress/reset system.
- [ ] **TODO** — Battle Pass and dailies player UI.

---

# 7. Standalone product UI and presentation

- [x] **DONE (plan)** — TCG is its own product UI, sharing Stream Bandit authentication but not inheriting the Stream Bandit shell as its navigation owner.
- [x] **DONE (branch tool)** — `tcg-master-plan.html` workbench exists.
- [x] **DONE (branch lab)** — `t.html` exists as current TCG/Arcade development lab.
- [ ] **TODO** — final public TCG landing / sign-up / sign-in entry.
- [ ] **TODO** — final authenticated game home.
- [ ] **TODO** — premium live card renderer where authoritative card data supplies HP/attacks/Abilities/cost/evolution text and art remains decorative presentation.
- [ ] **TODO** — final one-screen card-first battlefield with drag/drop and persistent End Turn only.
- [ ] **TODO** — fullscreen + Esc behaviour on the final battle surface.
- [ ] **TODO** — Collection and Deck Builder screens.
- [ ] **TODO** — Shop, Battle Pass, player profile/rank and Sets/Series screens.
- [ ] **TODO** — card music/SFX layer after gameplay determinism is stable.
- [ ] **TODO** — public How to Play / Rules / Sets SEO pages and standalone sitemap/meta strategy.

---

# 8. Current tests and release gates

At evidence head `d7d8b1c50485e7ccebff385baf7827cb826de1e2`:

- [x] **PASS** — Code Labs Migration Replay run #183.
- [x] **PASS** — Code Labs V50 Functional Smoke run #201.
- [x] **PASS** — no submitted PR reviews or inline review threads currently block PR #549.
- [ ] **INFO** — GitHub has no separate combined-status contexts on that head; absence is not counted as another PASS.
- [ ] **TODO** — exact-head tests must rerun after every gameplay/schema batch.
- [ ] **TODO** — deploy later TCG migrations/functions only after their source and integration path match the current master rules.
- [ ] **TODO** — sign in as two real accounts, choose starters/decks, enter matchmaking together and finish a complete battle.
- [ ] **TODO** — reconnect one player during a match and prove hidden/private state remains correct.
- [ ] **TODO** — economy receipt/retry/duplicate tests.
- [ ] **TODO** — AI Test Match simulation matrix.
- [ ] **TODO** — human balance testing.
- [ ] **TODO** — final private alpha → economy alpha → closed beta → public beta → live promotion sequence.

---

# 9. Exact next execution order

1. **Schema Amendment G** — generic alternate attack target + target-zone damage modifier; remove Skyrend name-check dependency.
2. **Gale 24 Card Pass 2 structured candidate.**
3. Continue **Grove → Shade → Stone → Tide → Volt** STRUCTURE batches, adding shared grammar only when an element proves a real reusable gap.
4. Finish the **unified server-authoritative effect + pending-choice engine** for attacks and creature Abilities; remove remaining gameplay card-name hacks.
5. Repair **deck validation/copy-limit drift** before the economy migration is applied.
6. Reconcile final Card Pass 2 registry with the eight exact starters and freeze the first deterministic SB1 registry version.
7. Complete/deploy the matching TCG database migrations and Edge Functions.
8. Finish **Collection + Deck Builder + premium card renderer + battle UI**.
9. Implement **Trade Token duplicate conversion + Shop/pack opening**.
10. Implement **100-tier Battle Pass + 3 dailies**.
11. Add **AI Test Match**, run deterministic simulations, then human balance testing.
12. Run the real **two-account desktop/phone Arcade battle**, reconnect/security tests and economy receipt tests.
13. Only after those gates pass: progress through private alpha, economy alpha, closed beta, public beta and final live release.

---

## Master-plan checkpoint conclusion

Yesterday produced substantial real branch work. The missing piece was not implementation progress; it was that the visible checklist had not been reconciled to that progress. This file closes that bookkeeping gap and is now the current progress ledger to update after every meaningful TCG batch.