# Stream Bandit TCG — Master Plan Progress Checklist

**Checkpoint date:** 2026-09-06  
**Active implementation:** PR #549 — `feature/tcg-private-alpha-v0-5-source-recovery`

## Authority

1. Trev's latest explicit TCG corrections/decisions.
2. Current repo master plan/current-rules audits and accepted Card Pass 2 amendments/candidates.
3. Earlier locked rules not superseded.
4. 4 Sep Google plan / old prototype only as historical evidence.

**Hard rule:** ordinary Weakness comes from the two global matchup chains. Routine per-card `weakness` on an ordinary Set One Creature is a validation defect.

**Design-capture rule:** small gameplay ideas Trev raises during development are to be assessed and, when mechanically sound, recorded in this living plan/schema rather than left only in chat history.

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
- [x] Fairy + Underworld are future full elements completing the second matchup chain.
- [x] All 8 Set One element design audits complete.
- [x] All 8 Set One elemental Card Pass 2 structured candidate batches exist.
- [x] Astral pre-correction per-card Weakness data physically removed from the candidate source.
- [ ] Final deterministic STRUCTURE reconciliation across all 193 identities — **IN PROGRESS**; hard invariants are now consolidated into one machine-readable validator owner, while full opcode/parameter consolidation and candidate-by-candidate validation remain open.
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
- [x] O — selective attacker-class protection / low-HP utility walls.
- [x] P — layered protection, damage-placement protection, Realm replacement and passive placement counterplay.
- [x] Q — precision execution through exact damage thresholds such as exactly 60 damage.
- [x] R — condition execution kept distinct from precision execution.
- [x] `tcg-design-control-toolbox-archetype.md` — control/toolbox/conversion-control philosophy captured from Trev's gameplay ideas.
- [x] Astral candidate — corrected to zero routine per-card Weakness fields.
- [x] Ember 24 candidate.
- [x] Gale 24 candidate — zero per-card Weakness.
- [x] Grove 24 candidate — zero per-card Weakness.
- [x] Shade 24 candidate — zero per-card Weakness.
- [x] Stone 24 candidate — zero per-card Weakness.
- [x] Tide 24 candidate — zero per-card Weakness.
- [x] Volt 24 candidate — zero per-card Weakness.
- [x] **Machine-readable validator owner created:** `tcg-card-pass-2-validator-v0.2.json`.
- [x] Hard invariants, global matchup chains, damage classes, protection layers, execution families and A–R authority map consolidated into that validator owner.
- [ ] Full opcode / predicate / parameter schema consolidation into the validator owner.
- [ ] Machine-validate all eight Set One element candidates + Founder against the consolidated owner.
- [ ] Reconcile the 193-card total with exact starter references and freeze only after simulation + human balance.

---

# 2. Future Fairy + Underworld expansion

- [x] `tcg-future-elements-fairy-underworld-plan.md` created.
- [x] Fairy and Underworld each use the same package shape as the first eight: **24 identities / 11 Creatures / 4 Essence / 9 Tactics / 3 pack-only / exact 60-card starter using 21 identities**.
- [x] Two complete Baby → Teen → Adult families designed per element.
- [x] Four ordinary Standalone roles plus one Mythic + Starbound apex designed per element.
- [x] Fairy identity: protective redistribution, damage movement, cleansing, enchantment, selective reversal and lower/mid vitality drain.
- [x] Underworld identity: vitality drain, hostile wound transfer, pain-as-cost, defeat-linked value and high-cost/high-reward commitments.
- [x] Four recurring drain/ranged design bands: **10 / 20 / 40 / 60**.
- [x] Rare hostile damage transfer supported through explicit `MOVE_DAMAGE` opt-in.
- [x] Tide future ranged/sniper mechanic planned with explicit Reserve/field targeting.
- [x] Rare apex future Tide effect planned: **place 120 damage on each of up to 2 different opposing creatures**, only behind a severe high-tier gate such as Starbound/once-per-match/high resource cost.
- [x] Low-HP utility-wall design pattern planned: generally 40–120 HP, modest offence, strategically valuable selective protection with practical counter routes.
- [x] Fairy current-rules design audit COMPLETE — 24/24 identities.
- [x] Fairy exact 60-card starter `Gracebound` designed — 21 identities / 60 cards.
- [x] Underworld current-rules design audit COMPLETE — 24/24 identities.
- [x] Underworld exact 60-card starter `Debtbound` designed — 21 identities / 60 cards.
- [ ] During Fairy STRUCTURE/balance review, decide whether one existing low-HP Fairy identity should carry the first selective-protection utility-wall Ability; do not add a 25th identity merely to force the mechanic.
- [ ] Structure Fairy 24 through the consolidated shared schema.
- [ ] Structure Underworld 24 through the consolidated shared schema.
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
- [x] Generic schema paths exist for mechanics exposed by all eight Set One audits.
- [x] Generic schema paths planned for vitality drain, damage placement/movement, selective attack walls, layered counterplay, precision execution and condition execution.
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
- [x] PASS — eight-element Card Pass checkpoint `030757555f684a577c0447ca336b6815067b2524`: Migration Replay #203.
- [x] PASS — eight-element Card Pass checkpoint `030757555f684a577c0447ca336b6815067b2524`: Functional Smoke #221.
- [ ] New exact-head CI must pass after the schema/validator/checklist additions before any promotion decision; these remain branch-only design/validation changes.
- [ ] Two-account desktop/phone full battle.
- [ ] Reconnect/private-state test.
- [ ] Economy receipt/retry/duplicate tests.
- [ ] AI simulation matrix.
- [ ] Human balance.
- [ ] Private alpha → economy alpha → closed beta → public beta → live.

---

# 10. Exact next execution order

1. **Complete full opcode / predicate / parameter consolidation inside `tcg-card-pass-2-validator-v0.2.json`.**
2. Machine-validate Astral, Ember, Gale, Grove, Shade, Stone, Tide, Volt and Prismatic Founder against that one owner.
3. Reconcile all 193 Set One identities with the eight exact 60-card starters.
4. Finish unified effect + pending-choice runtime and remove card-name/card-id hacks.
5. Repair deck validation/copy-limit drift.
6. Freeze deterministic SB1 registry only after structural validation and simulation/human-balance gates.
7. Structure the completed Fairy 24 and Underworld 24 future audits through the consolidated schema without blocking Set One private-alpha completion.
8. Deploy matching TCG migrations/functions after Set One runtime gates pass.
9. Collection + Deck Builder + renderer + battle UI.
10. Trade Token duplicate conversion + Shop/pack opening.
11. Battle Pass + dailies.
12. AI Test Match + simulation + human balance.
13. Real two-account battle + reconnect/security/economy tests.
14. Release ladder only after all Set One gates pass.

---

## Checkpoint conclusion

**All eight current Set One elements have deterministic Card Pass 2 candidate ledgers, and Astral's old per-card Weakness contradiction is physically repaired. Fairy and Underworld are fully designed as future 24-card element packages with exact 60-card starters.** The second chain is structurally complete at design level: `Astral → Martial → Shade → Fairy → Underworld → Astral`.

The shared future-mechanics plan now covers vitality drain, damage movement/hostile transfer, rare Tide ranged placement, selective utility walls, layered protection/counterplay, precision exact-damage execution and separate condition-based execution. Trev's control/toolbox/conversion-control gameplay ideas are recorded as design inputs, not copied card identities.

The main build has now returned to Set One consolidation: **one machine-readable v0.2 validator owner exists; next is complete opcode/parameter consolidation and candidate-by-candidate validation.**