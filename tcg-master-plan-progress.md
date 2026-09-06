# Stream Bandit TCG — Master Plan Progress Checklist

**Checkpoint date:** 2026-09-06  
**Active implementation:** PR #549 — `feature/tcg-private-alpha-v0-5-source-recovery`  
**Current implementation head before this checklist update:** `1613af77f4d5abab6502c4f062650e629e8956a4`

## Authority

1. Trev's latest explicit TCG corrections/decisions.
2. Current repo master plan/current-rules audits and accepted Card Pass 2 amendments/candidates.
3. Earlier locked rules not superseded.
4. 4 Sep Google plan / old prototype only as historical evidence.

**Hard rule:** ordinary Weakness comes from the two global matchup chains. Routine per-card `weakness` on an ordinary Set One Creature is a validation defect.

---

# 1. Rules / Set One

- [x] 8 current Set One elements: Astral, Ember, Gale, Grove, Shade, Stone, Tide, Volt.
- [x] 8 exact 60-card starter targets.
- [x] 193 Set One gameplay identities.
- [x] Baby → Teen → Adult; Standalone valid; Mythic separate from stage.
- [x] Printed HP 40–390.
- [x] Vanguard / 4 Reserve / 6 Rewards / Essence / Tactics / Shield / conditions.
- [x] Starbound separate from Mythic; one player-owned marker per match.
- [x] World chain: `Tide → Ember → Grove → Gale → Stone → Volt → Tide`.
- [x] Mystical/combat chain: `Astral → Martial → Shade → Fairy → Underworld → Astral`.
- [x] Martial remains a Creature Type, not a full Essence element.
- [x] Fairy + Underworld are planned as the two future full elements completing the second matchup chain.
- [x] All 8 Set One element design audits complete.
- [x] **All 8 Set One elemental Card Pass 2 structured candidate batches now exist.**
- [ ] Final deterministic STRUCTURE reconciliation across all 193 identities — **IN PROGRESS** because Astral pre-correction Weakness data still needs physical consolidation and the shared schema needs one machine-readable owner.
- [ ] AI Test Match balance.
- [ ] Human balance / final numeric tuning.

## Card Pass 2

- [x] Base `sb-tcg-card-v0.2` / `sb-tcg-effects-v0.2`.
- [x] Amendments A–F.
- [x] G — alternate attack targets + target-zone damage modifier.
- [x] H — switch counterpart bindings + real voluntary withdrawal + post-attack completion.
- [x] I — public discard selection + healing packets/modifiers + aura selectors + damage-source binding + Weakness validator guard.
- [x] J — server-random hidden sampling + opponent-deck inspection/reorder + delayed lifecycle action + control-condition replacement.
- [x] K — prevention attribution/counters + threshold defence + Shield-source events + source-aware withdrawal-tax immunity.
- [x] L — multi-Essence movement + movement participation + Shield transfer + actual-heal listeners + grouped searches + source-capped withdrawal tax.
- [x] M — temporary/borrowed Essence normalization + typed attack-cost floors + Device locks + post-resolution destination overrides.
- [x] N — vitality drain / health stealing + effect damage + damage placement + damage movement + rare hostile transfer + ranged multi-target placement.
- [x] Astral candidate exists.
- [ ] **REPAIR — Astral source consolidation:** old Astral candidate physically contains stale routine per-card Weakness fields written before Trev corrected the system. The global-chain repair projection is correct; the candidate must be rewritten/consolidated so only the global matchup model remains.
- [x] Ember 24 candidate.
- [x] Gale 24 candidate — zero per-card Weakness.
- [x] Grove 24 candidate — zero per-card Weakness.
- [x] Shade 24 candidate — zero per-card Weakness.
- [x] Stone 24 candidate — zero per-card Weakness.
- [x] Tide 24 candidate — zero per-card Weakness.
- [x] Volt 24 candidate — zero per-card Weakness.
- [ ] Consolidated machine-readable v0.2 validator/specification.
- [ ] Reconcile the 193-card total with exact starter references and freeze only after simulation + human balance.

---

# 2. Future Fairy + Underworld expansion

- [x] **PLAN (branch)** — `tcg-future-elements-fairy-underworld-plan.md` created.
- [x] Fairy and Underworld will each use the same disciplined package shape as the first eight: **24 identities / 11 Creatures / 4 Essence / 9 Tactics / 3 pack-only / exact 60-card starter using 21 identities**.
- [x] Two complete Baby → Teen → Adult families planned per element.
- [x] Four Standalone starting creatures planned per element, including one Mythic + Starbound identity after stage normalization.
- [x] Fairy identity planned around protective redistribution, damage movement, cleansing, enchantment, selective reversal and lower/mid vitality drain.
- [x] Underworld identity planned around vitality drain, hostile wound transfer, pain-as-cost, defeat-linked value and high-cost/high-reward commitments.
- [x] Four recurring drain/ranged design bands planned: **10 / 20 / 40 / 60**.
- [x] Rare hostile damage transfer supported through explicit `MOVE_DAMAGE` opt-in.
- [x] Tide future ranged/sniper mechanic planned with explicit Reserve/field targeting.
- [x] Rare apex future Tide effect planned: **place 120 damage on each of up to 2 different opposing creatures**, only behind a severe high-tier gate such as Starbound/once-per-match/high resource cost.
- [ ] Design Fairy 24-name inventory + two evolution families + Standalones + Mythic/Starbound.
- [ ] Design Fairy Essence/Tactics + exact 60-card starter + full current-rules audit.
- [ ] Structure Fairy 24 through the shared schema.
- [ ] Design Underworld 24-name inventory + two evolution families + Standalones + Mythic/Starbound.
- [ ] Design Underworld Essence/Tactics + exact 60-card starter + full current-rules audit.
- [ ] Structure Underworld 24 through the shared schema.
- [ ] Run second-chain matchup simulations including Astral/Martial/Shade/Fairy/Underworld interactions before expansion registry freeze.

---

# 3. Database / private alpha

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

# 4. Server-authoritative battle engine

- [x] Hidden canonical state + seat-private views.
- [x] Nonce/revision idempotent command path.
- [x] Core play/evolve/Essence/Relic/Realm/turn paths.
- [x] Damage / Shield / recoil / effect damage / major conditions.
- [x] Starbound attack-consumption foundation.
- [x] Defeat/winner/reward handoff foundation.
- [x] Deterministic current Ally/Device interpreter.
- [x] Generic schema paths exist for mechanics exposed by all eight Set One audits: Gale alternate targeting/movement, Grove healing/recycling, Shade hidden information/control, Stone prevention/Shield, Tide current/Shield transfer and Volt temporary charge/Device sequencing.
- [x] Future generic schema path now planned for vitality drain, moving/placing damage and rare ranged multi-target placement.
- [ ] Generic pending-choice/effect runtime — IN PROGRESS.
- [ ] Remove remaining card-id/name runtime shortcuts as v0.2 becomes authority.
- [ ] Hidden hand/deck/Reward choices.
- [ ] Reconnect/resume.
- [ ] Stale/replay/simultaneous command adversarial tests.
- [ ] Full two-player setup → victory → persisted result without manual DB intervention.

---

# 5. Modes / progression

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

# 6. Economy / collection

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

# 7. Battle Pass / dailies

- [x] 100 tiers.
- [x] Reward every tier.
- [x] 3 daily achievements.
- [ ] Season/config + claim receipts.
- [ ] 100-tier reward table.
- [ ] Daily assignment/progress/reset.
- [ ] UI.

---

# 8. Standalone product UI

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

# 9. Tests / release gates

- [x] `09bc7a3...` Migration Replay #184 PASS.
- [x] `09bc7a3...` Functional Smoke #202 PASS.
- [x] `4370385472c3...` Migration Replay #185 + Functional Smoke #203 PASS.
- [x] `b5cd76a0988c...` Migration Replay #186 PASS; paired smoke superseded/cancelled, not counted as pass.
- [x] **PASS — eight-element Card Pass checkpoint `030757555f684a577c0447ca336b6815067b2524`: Migration Replay #203.**
- [x] **PASS — eight-element Card Pass checkpoint `030757555f684a577c0447ca336b6815067b2524`: Functional Smoke #221.**
- [ ] New exact-head CI must pass after future-plan/checklist commits before any promotion decision; these are branch design additions only.
- [ ] Two-account desktop/phone full battle.
- [ ] Reconnect/private-state test.
- [ ] Economy receipt/retry/duplicate tests.
- [ ] AI simulation matrix.
- [ ] Human balance.
- [ ] Private alpha → economy alpha → closed beta → public beta → live.

---

# 10. Exact next execution order

1. **Physically consolidate Astral and remove the stale per-card Weakness fields.**
2. Consolidate base schema + Amendments A–N into one machine-readable validator/specification.
3. Validate all eight 24-card Set One element candidates plus Prismatic Founder / total 193 identity references against the consolidated schema and global matchup table.
4. Finish unified effect + pending-choice runtime and remove card-name/card-id hacks.
5. Repair deck validation/copy-limit drift.
6. Reconcile all 193 definitions with the 8 exact starters and freeze deterministic SB1 registry.
7. Continue future expansion design in parallel only at design/schema level: Fairy 24 then Underworld 24, without blocking Set One private-alpha completion.
8. Deploy matching TCG migrations/functions after Set One runtime gates pass.
9. Collection + Deck Builder + renderer + battle UI.
10. Trade Token duplicate conversion + Shop/pack opening.
11. Battle Pass + dailies.
12. AI Test Match + simulation + human balance.
13. Real two-account battle + reconnect/security/economy tests.
14. Release ladder only after all Set One gates pass.

---

## Checkpoint conclusion

**All eight current Set One elements now have deterministic Card Pass 2 candidate ledgers.** The global two-chain Weakness rule is enforced in every new batch and in schema validation. Fairy + Underworld are now explicitly planned as future full element packages completing the second chain, with shared deterministic support planned for vitality drain, wound movement/transfer and rare Tide ranged placement. The one known historical Set One contradiction remains the original Astral candidate written before Trev corrected Weakness; that is still the immediate repair target.