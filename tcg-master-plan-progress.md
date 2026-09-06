# Stream Bandit TCG — Master Plan Progress Checklist

**Checkpoint date:** 2026-09-06  
**Active implementation:** PR #549 — `feature/tcg-private-alpha-v0-5-source-recovery`  
**Current implementation head before this checklist update:** `dd7c1cd79f66cee503d7a68f38682248d9ccffb7`

## Current authority

This checklist is the operational companion to the living repo TCG master plan, current-rules audit ledgers and Card Pass 2 structure files.

The 4 September 2026 Google Docs master plan is **historical scope/restart evidence only**. It must not overwrite Trev's later explicit corrections or the current repo rules.

Authority order:

1. Trev's latest explicit TCG corrections/decisions.
2. Current repo master plan/current-rules audits and accepted Card Pass 2 amendments/candidates.
3. Earlier locked rules that have not been superseded.
4. The 4 September Google plan and old prototype registry only as historical/design evidence.

Hard correction now enforced: ordinary Weakness is owned by the two global matchup chains, **not copied onto individual cards**. A routine per-card `weakness` object on an ordinary Set One Creature is a Card Pass validation defect.

### Status legend

- **DONE (branch)** — implemented in PR #549 source.
- **LIVE** — present in connected Supabase production.
- **IN PROGRESS** — implementation exists but full capability is incomplete.
- **TODO** — not yet implemented to the master-plan definition.
- **REPAIR** — known drift must be corrected before promotion.

---

# 1. Rules, product and Set One

- [x] **DONE** — 8 Set One elements: Astral, Ember, Gale, Grove, Shade, Stone, Tide, Volt.
- [x] **DONE** — 8 exact 60-card starter targets.
- [x] **DONE** — Set One target = **193 gameplay identities**.
- [x] **DONE** — Baby → Teen → Adult; Standalone valid; Mythic separate from stage; one evolution per stack per turn.
- [x] **DONE** — printed Creature HP 40–390.
- [x] **DONE** — Vanguard / 4 Reserve / 6 Reward Cards / real Essence / Tactics / Shield / conditions.
- [x] **DONE** — Starbound separate from Mythic; one player-owned Starbound marker per match.
- [x] **DONE** — world chain: `Tide → Ember → Grove → Gale → Stone → Volt → Tide`.
- [x] **DONE** — mystical/combat chain: `Astral → Martial → Shade → Fairy → Underworld → Astral`.
- [x] **DONE** — Martial is a Creature Type; Fairy/Underworld are future full elements.
- [x] **DONE** — Set One design audits completed across all 8 elements.
- [ ] **IN PROGRESS** — deterministic STRUCTURE pass for all 193 identities.
- [ ] **TODO** — AI Test Match balance across all eight starters.
- [ ] **TODO** — human balance and final numeric tuning.

## Card Pass 2 structure

- [x] **DONE (branch)** — `sb-tcg-card-v0.2` / `sb-tcg-effects-v0.2` base schema.
- [x] **DONE (branch)** — Amendments A–F.
- [x] **DONE (branch)** — Amendment G: generic alternate attack target + target-zone damage modifier.
- [x] **DONE (branch)** — Amendment H: switch counterpart bindings, real voluntary-withdrawal invocation/cost and post-attack completion timing.
- [x] **DONE (branch)** — Amendment I: public discard selection, healing packets/modifiers, aura selectors, damage-source bindings and validator rejection of stale per-card Weakness.
- [x] **DONE (branch)** — Astral structured candidate exists.
- [ ] **REPAIR** — original Astral candidate physically still contains stale per-card Weakness objects from before Trev's global-chain correction. `tcg-card-pass-2-astral-matchup-repair.md` correctly overrides them, but the candidate itself must be consolidated so there is one unambiguous source.
- [x] **DONE (branch)** — Ember 24 structured candidate; global matchup model used.
- [x] **DONE (branch)** — Gale 24 structured candidate; global matchup model used.
- [x] **DONE (branch)** — Grove 24 structured candidate; **zero ordinary per-card Weakness fields**.
- [ ] **NEXT** — Shade 24 structured candidate.
- [ ] **TODO** — Stone structured candidate.
- [ ] **TODO** — Tide structured candidate.
- [ ] **TODO** — Volt structured candidate.
- [ ] **TODO** — consolidate base schema + amendments into one machine-readable validator/specification.
- [ ] **TODO** — final 193-card registry migration/version freeze after deterministic simulation and human balance testing.

---

# 2. Database, security and private-alpha foundation

## Already live in Supabase

- [x] **LIVE** — private-alpha foundation + security hardening.
- [x] **LIVE** — atomic starter grant.
- [x] **LIVE** — server deck-validation foundation.
- [x] **LIVE** — private room lobby + join-code compatibility.
- [x] **LIVE** — match shell/hidden state + atomic command commit.
- [x] **LIVE** — card printings + TCG art bucket.
- [x] **LIVE** — `tcg-private-alpha-api` deployed/JWT protected.
- [x] **LIVE** — `tcg-match-actions` v0.1 deployed/JWT protected.

## Branch-only, not live

- [x] **DONE (branch)** — three-currency economy source.
- [x] **DONE (branch)** — automatic matchmaking source.
- [x] **DONE (branch)** — Arcade progression/reward receipts source.
- [x] **DONE (branch)** — `tcg-match-actions` v0.3 candidate.
- [x] **DONE (branch)** — `tcg-tactic-actions` candidate.
- [ ] **NOT LIVE** — economy/copy migration.
- [ ] **NOT LIVE** — matchmaking migration.
- [ ] **NOT LIVE** — Arcade progression/reward migration.
- [ ] **NOT LIVE** — `tcg-match-actions` v0.3.
- [ ] **NOT LIVE** — `tcg-tactic-actions`.

## Known database repair

- [ ] **REPAIR** — `20260905105500_tcg_economy_and_copy_limit_alignment.sql` still contains superseded global one-Mythic-total and Legendary restrictions. Current rule: ordinary identity max 4, Mythic identity max 1, Essence separate allowance.

---

# 3. Server-authoritative battle engine

- [x] **DONE (branch foundation)** — hidden canonical state + seat-private views.
- [x] **DONE (branch foundation)** — nonce/revision idempotent command path.
- [x] **DONE (branch)** — core play/evolve/Essence/Relic/Realm/turn paths.
- [x] **DONE (branch)** — attack-cost parsing, damage, Shield, recoil/effect damage, major conditions.
- [x] **DONE (branch)** — Starbound attack consumption foundation.
- [x] **DONE (branch)** — defeat/winner/reward handoff foundation.
- [x] **DONE (branch)** — deterministic Ally/Device interpreter for current structured Tactics.
- [x] **DONE (schema)** — Skyrend Reserve targeting + -20 penalty represented generically.
- [x] **DONE (schema)** — Gale movement/withdrawal handoffs represented generically.
- [x] **DONE (schema)** — Grove healing, discard recycling, aura protection and reflected attack damage represented generically.
- [ ] **IN PROGRESS** — generic pending-choice engine for remaining attacks/Abilities.
- [ ] **REPAIR (runtime)** — remove remaining card-id/name shortcuts as v0.2 becomes authoritative, including old Gale/Grove prototype branches.
- [ ] **TODO** — complete hidden hand/deck/Reward choices with private views.
- [ ] **TODO** — reconnect/resume test.
- [ ] **TODO** — stale/replay/simultaneous-command adversarial tests.
- [ ] **TODO** — full two-player setup → battle → victory → persisted-result match with no manual DB intervention.

---

# 4. Modes, matchmaking and progression

- [x] **DONE (branch)** — Arcade first normal non-ranked progression mode.
- [x] **DONE (branch)** — automatic matchmaking SQL.
- [x] **DONE (branch)** — private friend/test rooms do not farm normal Arcade rewards.
- [x] **DONE (branch)** — XP/matches/wins/losses/streak fields.
- [x] **DONE (branch)** — idempotent match reward receipts.
- [ ] **TODO** — player-facing Arcade matchmaking UI.
- [ ] **TODO** — Ranked.
- [ ] **TODO** — player level/rank presentation.
- [ ] **TODO** — deterministic AI Test Match bot using the same legal server action path.

---

# 5. Economy, Collection and Deck Builder

- [x] **DONE (rules)** — exactly 3 currencies: Battle Pass Tokens, Trade Tokens, Shop Coins.
- [x] **DONE (rules)** — normal collection keep 4; Mythic keep 1.
- [x] **DONE (rules)** — 200 Shop Coins per pack.
- [x] **DONE (rules)** — 200 Battle Pass Tokens per tier.
- [ ] **TODO** — duplicate conversion to Trade Tokens.
- [ ] **TODO** — Collection UI.
- [ ] **TODO** — Deck Builder UI/validation.
- [ ] **TODO** — Shop/pack-opening transaction flow.
- [ ] **TODO** — Trade Token spending/trading flow.
- [ ] **TODO** — pack/box/sleeve/coin/special-edition presentation.

---

# 6. Battle Pass and dailies

- [x] **DONE (rules)** — 100 tiers.
- [x] **DONE (rules)** — reward every tier.
- [x] **DONE (rules)** — 3 daily achievements.
- [ ] **TODO** — season/config + authoritative tier receipts.
- [ ] **TODO** — 100-tier reward definition.
- [ ] **TODO** — daily assignment/progress/reset.
- [ ] **TODO** — Battle Pass/dailies UI.

---

# 7. Standalone product UI

- [x] **DONE (plan)** — standalone TCG product using shared Stream Bandit auth, not Stream Bandit shell ownership.
- [x] **DONE (branch)** — `tcg-master-plan.html`.
- [x] **DONE (branch)** — `t.html` development lab.
- [ ] **TODO** — public landing/sign-up/sign-in.
- [ ] **TODO** — authenticated game home.
- [ ] **TODO** — premium data-driven live card renderer.
- [ ] **TODO** — one-screen card-first drag/drop battlefield; persistent End Turn only.
- [ ] **TODO** — fullscreen + Esc.
- [ ] **TODO** — Collection / Deck Builder / Shop / Battle Pass / Profile / Sets UI.
- [ ] **TODO** — audio after deterministic gameplay is stable.
- [ ] **TODO** — public How to Play / Rules / Sets SEO pages.

---

# 8. Tests and release gates

Confirmed clean checkpoints:

- [x] **PASS** — `09bc7a3...`: Migration Replay #184.
- [x] **PASS** — `09bc7a3...`: Functional Smoke #202.
- [x] **PASS** — Amendment G head `4370385472c3...`: Migration Replay #185 + Functional Smoke #203.
- [x] **PASS** — Amendment H head `b5cd76a0988c...`: Migration Replay #186; the paired smoke run was superseded/cancelled by later pushes, not counted as PASS.
- [ ] **CURRENT HEAD CHECK** — run exact-head CI after this checklist commit; cancelled superseded runs are not treated as gameplay failures or passes.
- [ ] **TODO** — two-account desktop/phone complete battle.
- [ ] **TODO** — reconnect/private-state test.
- [ ] **TODO** — economy receipt/retry/duplicate tests.
- [ ] **TODO** — AI simulation matrix.
- [ ] **TODO** — human balance.
- [ ] **TODO** — private alpha → economy alpha → closed beta → public beta → live.

---

# 9. Exact next execution order

1. **Shade 24 Card Pass 2 structured candidate**.
2. Continue **Stone → Tide → Volt** STRUCTURE batches.
3. Consolidate the stale Astral candidate so per-card Weakness fields are physically removed and only the global matchup model remains.
4. Consolidate base schema + Amendments A–I plus any later element-proven additions into one machine-readable validator/specification.
5. Finish unified server-authoritative effect + pending-choice runtime and remove card-name/card-id hacks.
6. Repair deck-validation/copy-limit drift before economy migration promotion.
7. Reconcile all 193 definitions with exact starters and freeze deterministic SB1 registry version.
8. Complete/deploy matching TCG migrations and Edge Functions.
9. Collection + Deck Builder + premium renderer + battle UI.
10. Trade Token duplicate conversion + Shop/pack opening.
11. Battle Pass + dailies.
12. AI Test Match + deterministic simulation + human balance.
13. Real two-account desktop/phone battle + reconnect/security/economy receipt tests.
14. Release ladder only after gates pass.

---

## Master-plan checkpoint conclusion

The visible ledger now includes Card Pass 2 through **Grove 24** plus Amendments G, H and I. Trev's global Weakness-chain correction is explicitly enforced as a schema validation rule. The known Astral physical-file drift is now visible as a repair item rather than being hidden behind an override document.
