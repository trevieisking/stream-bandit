# Stream Bandit TCG — Master Plan Progress Checklist

**Checkpoint date:** 2026-09-06  
**Active implementation:** PR #549 — `feature/tcg-private-alpha-v0-5-source-recovery`  
**Current implementation head before this checklist update:** `b8bb9fdff9435f7e33b8332c79d021cdb5646914`

## Authority

1. Trev's latest explicit TCG corrections/decisions.
2. Current repo master plan/current-rules audits and accepted Card Pass 2 amendments/candidates.
3. Earlier locked rules not superseded.
4. 4 Sep Google plan / old prototype only as historical evidence.

**Hard rule:** ordinary Weakness comes from the two global matchup chains. Routine per-card `weakness` on an ordinary Set One Creature is a validation defect.

---

# 1. Rules / Set One

- [x] 8 elements: Astral, Ember, Gale, Grove, Shade, Stone, Tide, Volt.
- [x] 8 exact 60-card starter targets.
- [x] 193 Set One gameplay identities.
- [x] Baby → Teen → Adult; Standalone valid; Mythic separate from stage.
- [x] Printed HP 40–390.
- [x] Vanguard / 4 Reserve / 6 Rewards / Essence / Tactics / Shield / conditions.
- [x] Starbound separate from Mythic; one player-owned marker per match.
- [x] World chain: `Tide → Ember → Grove → Gale → Stone → Volt → Tide`.
- [x] Mystical/combat chain: `Astral → Martial → Shade → Fairy → Underworld → Astral`.
- [x] All 8 element design audits complete.
- [ ] Final deterministic STRUCTURE pass for all 193 identities — **IN PROGRESS**.
- [ ] AI Test Match balance.
- [ ] Human balance / final numeric tuning.

## Card Pass 2

- [x] Base `sb-tcg-card-v0.2` / `sb-tcg-effects-v0.2`.
- [x] Amendments A–F.
- [x] G — generic alternate attack targets + target-zone damage modifier.
- [x] H — switch counterpart bindings + real voluntary withdrawal + post-attack completion.
- [x] I — public discard selection + healing packets/modifiers + aura selectors + damage-source binding + Weakness validator guard.
- [x] J — server-random hidden sampling + opponent-deck inspection/reorder + delayed lifecycle action + control-condition replacement.
- [x] K — prevention attribution/counters + threshold defence + Shield-source events + source-aware withdrawal-tax immunity.
- [x] L — multi-Essence movement + movement participation + Shield transfer + actual-heal listeners + grouped searches + source-capped withdrawal tax.
- [x] Astral candidate exists.
- [ ] **REPAIR** — Astral physical candidate still contains stale per-card Weakness objects from before Trev's global-chain correction. Repair projection is correct, but source must be consolidated.
- [x] Ember 24 candidate.
- [x] Gale 24 candidate.
- [x] Grove 24 candidate — zero per-card Weakness.
- [x] Shade 24 candidate — zero per-card Weakness.
- [x] Stone 24 candidate — zero per-card Weakness.
- [x] Tide 24 candidate — zero per-card Weakness.
- [ ] **NEXT — Volt 24**.
- [ ] Consolidated machine-readable v0.2 validator/spec.
- [ ] Freeze final 193-card registry only after simulation + human balance.

---

# 2. Database / private alpha

## LIVE

- [x] Private-alpha foundation/security.
- [x] Atomic starter grant.
- [x] Deck-validation foundation.
- [x] Private rooms + join codes.
- [x] Match shell/hidden state + atomic command commit.
- [x] Card printings + art bucket.
- [x] `tcg-private-alpha-api` JWT-protected.
- [x] `tcg-match-actions` v0.1 JWT-protected.

## Branch-only

- [x] Three-currency economy source.
- [x] Automatic matchmaking source.
- [x] Arcade progression/reward receipts source.
- [x] `tcg-match-actions` v0.3 candidate.
- [x] `tcg-tactic-actions` candidate.
- [ ] Economy/matchmaking/Arcade migrations not live.
- [ ] v0.3 / tactic-actions not live.

## Repair

- [ ] Economy/copy migration still contains obsolete global one-Mythic-total + Legendary restrictions. Current rule: ordinary identity max 4, Mythic identity max 1, Essence separate allowance.

---

# 3. Server-authoritative battle engine

- [x] Hidden canonical state + seat-private views.
- [x] Nonce/revision idempotent command path.
- [x] Core play/evolve/Essence/Relic/Realm/turn paths.
- [x] Damage / Shield / recoil / effect damage / major conditions.
- [x] Starbound attack-consumption foundation.
- [x] Defeat/winner/reward handoff foundation.
- [x] Deterministic current Ally/Device interpreter.
- [x] Skyrend target/penalty generic schema path.
- [x] Gale movement/withdrawal generic schema path.
- [x] Grove heal/recycle/aura/reflect generic schema path.
- [x] Shade hidden-information/control generic schema path.
- [x] Stone threshold-defence/Shield/prevention/Relic generic schema path.
- [x] Tide Essence-flow/Shield-transfer/actual-heal generic schema path.
- [ ] Generic pending-choice engine — IN PROGRESS.
- [ ] Remove remaining card-id/name runtime shortcuts as v0.2 becomes authority.
- [ ] Hidden hand/deck/Reward choices.
- [ ] Reconnect/resume.
- [ ] Stale/replay/simultaneous command adversarial tests.
- [ ] Full two-player setup → victory → persisted result without manual DB intervention.

---

# 4. Modes / progression

- [x] Arcade first normal non-ranked mode.
- [x] Automatic matchmaking source.
- [x] Private rooms cannot farm normal Arcade rewards.
- [x] XP / W-L / streak fields.
- [x] Idempotent match reward receipts.
- [ ] Arcade player UI.
- [ ] Ranked.
- [ ] Player level/rank UI.
- [ ] Deterministic AI Test Match bot.

---

# 5. Economy / collection

- [x] Battle Pass Tokens / Trade Tokens / Shop Coins only.
- [x] Normal keep 4; Mythic keep 1.
- [x] 200 Shop Coins per pack.
- [x] 200 Battle Pass Tokens per tier.
- [ ] Duplicate conversion → Trade Tokens.
- [ ] Collection.
- [ ] Deck Builder.
- [ ] Shop / pack opening.
- [ ] Trading / Trade Token spend.
- [ ] Pack/box/sleeve/coin/special-edition presentation.

---

# 6. Battle Pass / dailies

- [x] 100 tiers.
- [x] Reward every tier.
- [x] 3 daily achievements.
- [ ] Season/config + claim receipts.
- [ ] 100-tier reward table.
- [ ] Daily assignment/progress/reset.
- [ ] UI.

---

# 7. Standalone product UI

- [x] Standalone TCG shell using shared auth.
- [x] `tcg-master-plan.html`.
- [x] `t.html` development lab.
- [ ] Public landing/sign-in.
- [ ] Authenticated game home.
- [ ] Premium data-driven card renderer.
- [ ] One-screen drag/drop battlefield; persistent End Turn only.
- [ ] Fullscreen + Esc.
- [ ] Collection / Deck Builder / Shop / Pass / Profile / Sets.
- [ ] Audio after determinism.
- [ ] Public How to Play / Rules / Sets SEO.

---

# 8. Tests / release gates

- [x] `09bc7a3...` Migration Replay #184 PASS.
- [x] `09bc7a3...` Functional Smoke #202 PASS.
- [x] `4370385472c3...` Migration Replay #185 + Functional Smoke #203 PASS.
- [x] `b5cd76a0988c...` Migration Replay #186 PASS; paired smoke superseded/cancelled, not counted as pass.
- [ ] Latest exact-head CI must complete successfully; superseded cancellations are neither pass nor gameplay failure.
- [ ] Two-account desktop/phone full battle.
- [ ] Reconnect/private-state test.
- [ ] Economy receipt/retry/duplicate tests.
- [ ] AI simulation matrix.
- [ ] Human balance.
- [ ] Private alpha → economy alpha → closed beta → public beta → live.

---

# 9. Exact next execution order

1. Volt 24 STRUCTURE.
2. Physically consolidate Astral to remove stale per-card Weakness.
3. Consolidate base schema + A–L and any later element-proven amendments into one machine-readable validator/spec.
4. Finish unified effect + pending-choice runtime and remove card-name/card-id hacks.
5. Repair deck validation/copy-limit drift.
6. Reconcile all 193 definitions with the 8 exact starters and freeze deterministic SB1 registry.
7. Deploy matching TCG migrations/functions.
8. Collection + Deck Builder + renderer + battle UI.
9. Trade Token duplicate conversion + Shop/pack opening.
10. Battle Pass + dailies.
11. AI Test Match + simulation + human balance.
12. Real two-account battle + reconnect/security/economy tests.
13. Release ladder only after all gates pass.

---

## Checkpoint conclusion

Visible planning truth now includes Card Pass 2 through **Tide 24** and Amendments G–L. Every newly structured element since Trev corrected Weakness contains zero routine per-card Weakness fields. Only the stale pre-correction Astral physical candidate remains to be consolidated after the final Volt batch.
