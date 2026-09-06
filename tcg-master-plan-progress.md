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

**Execution fence:** PR #549 is TCG-only. Code Labs may be used for read/inspection work, but Code Labs Writer is not part of the current TCG execution path. No unrelated Stream Bandit page, DJ, Web Builder or social-media work belongs in this lane.

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
- [x] Prismatic Founder has a final v0.2 structured candidate — identity 193/193.
- [x] Astral pre-correction per-card Weakness data physically removed from the candidate source.
- [x] All 193 structured identities machine-validated at the Card Pass 2 structural level.
- [x] All 8 exact starters reconciled against canonical structured candidate IDs and copy limits.
- [x] Final deterministic STRUCTURE reconciliation across all 193 identities: card envelopes, evolution links, HP, copy limits, Starbound/Mythic state, starter references and the full opcode/predicate/required-parameter grammar are consolidated and CI-enforced. Runtime parity and balance remain separate later gates.
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
- [x] S — remaining-HP execution/sweep + opponent-Reward comeback damage scaling.
- [x] T — global matchup authority cleanup / stale per-card Weakness quarantine.
- [x] U — generic distinct attached-Essence element queries/search for Prismatic and future multi-element designs.
- [x] `tcg-design-control-toolbox-archetype.md` — control/toolbox/conversion-control philosophy captured from Trev's gameplay ideas.
- [x] Astral candidate — corrected to zero routine per-card Weakness fields.
- [x] Ember 24 candidate.
- [x] Gale 24 candidate — zero per-card Weakness.
- [x] Grove 24 candidate — zero per-card Weakness.
- [x] Shade 24 candidate — zero per-card Weakness.
- [x] Stone 24 candidate — zero per-card Weakness.
- [x] Tide 24 candidate — zero per-card Weakness.
- [x] Volt 24 candidate — zero per-card Weakness.
- [x] Prismatic Founder structured candidate.
- [x] **Machine-readable validator owner:** `tcg-card-pass-2-validator-v0.2.json`.
- [x] Hard invariants, global matchup chains, damage classes, protection layers, execution families and A–U authority map consolidated into that validator owner.
- [x] Dedicated exact-card CI gate created: `.github/workflows/tcg-card-pass-2-validation.yml` + `tcg/tests/card-pass-2-validator.test.mjs`.
- [x] TCG Card Pass 2 Validation #2 PASS on exact head `b4a1ea5c5ed78a8cae130bf5484242f2204e34ab`.
- [x] 193 unique structured identities proved by CI.
- [x] 8 × 24 elemental shape proved by CI: 11 Creature / 4 Essence / 9 Tactic per element.
- [x] Evolution references, HP range, Mythic/Starbound rules, copy limits and zero routine Weakness proved by CI.
- [x] Exact starter manifest `tcg-set-one-starters-v0.2.json` created and reconciled.
- [x] Eight starter recipes proved by CI: 60 cards / 21 identities / 22 Creature / 18 Essence / 20 Tactic, no pack-only cards, one Mythic copy.
- [x] Stone prototype ID drift normalized: live recipe `stone-mason-s-kit` → current candidate `stone-masons-kit`; quantity unchanged.
- [x] Full opcode / predicate / required-parameter schema consolidated into the single machine-readable owner `tcg-card-pass-2-effect-grammar-v0.2.json`.
- [x] CI proves every opcode/predicate used by the 193 candidates is declared by that grammar and required opcode parameters are present.
- [ ] Freeze deterministic registry only after runtime parity plus simulation/human-balance gates.

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
- [ ] Set One live/runtime registry still uses legacy English-effect definitions for current Special Essence rows; v0.2 structured registry source must be migrated/frozen before `tcg-match-actions` can safely consume `definition.essence.continuous` as authority.

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
- [x] Generic schema paths planned for vitality drain, damage placement/movement, selective attack walls, layered counterplay, precision execution, condition execution, remaining-HP sweep, comeback scaling and distinct-element resource queries.
- [x] Runtime 1A — `tcg-tactic-actions` condition read/clear semantics now reuse the tested shared `runtime-v0-2-core.ts` owner without changing v0.1 schema/auth/private-choice/atomic-commit behaviour.
- [x] Runtime Pass A — every v0.2 grammar opcode and predicate is classified exactly once as implemented/partial/missing in `tcg-runtime-capabilities-v0.2.json`.
- [x] Runtime Pass A CI — capability drift is blocked; partial predicates require explicit legacy-equivalent evidence; runtime parity cannot be claimed while partial/missing primitives remain.
- [x] Runtime Pass B foundation — generic card-ID-free attached-Essence continuous numeric/source-blocking math exists in `runtime-v0-2-core.ts`, including fail-closed conditional predicate handling.
- [x] Runtime Pass B foundation tests — Deno proves structured withdrawal modifiers, incoming attack damage modifiers, conditional attack modifiers and source-blocking immunity behaviour.
- [ ] Runtime Pass B registry/wiring — migrate/freeze Set One v0.2 runtime registry source, then replace `tcg-match-actions` hard-coded Breeze/Root/Anchor/Granite/Whisper/Surge battle-math/lifecycle branches with generic structured owners.
- [ ] Runtime Pass C — replace `parseAttack`, `attack_1`/`attack_2` and printed-English gameplay parsing with structured `creature.attacks[]` metadata and generic v0.2 steps.
- [ ] Runtime Pass D — route attack/Ability player selections through the generic private pending-choice owner and remove hard-coded unsupported-card lists.
- [ ] Runtime Pass E — generic Ability/Essence/Relic/Realm listeners, continuous modifiers, source-card-instance state and lifecycle expiry.
- [ ] Runtime Pass F — remove remaining prototype field aliases and ordinary Set One card-id/name gameplay shortcuts only after structured parity is proven.
- [ ] Generic pending-choice/effect runtime — IN PROGRESS through Runtime Passes C–E.
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
- [x] PASS — TCG Card Pass 2 Validation #2 at `b4a1ea5c5ed78a8cae130bf5484242f2204e34ab`.
- [x] PASS — Runtime 1A exact head `546db5aeb2242c310dcba1412c7803be3e6cadb9`: TCG Validation #19, Migration Replay #246 and Functional Smoke #264.
- [x] PASS — Runtime Pass A capability inventory/CI exact head `1564920974471f7be25940fb1c84342a776deee1`: TCG Validation #21, including Node structural/capability tests and Deno runtime-core tests.
- [x] PASS — Runtime Pass B generic battle-math foundation exact head `8d3d562ea4d80a7d7e42454fd7e7bcd99988bf7f`: TCG Validation #23, including Set One structure/grammar validation and Deno runtime-core tests.
- [x] Code Labs smoke/migration replay are supporting repository checks only, never substitutes for the TCG-specific validation gate; cancelled runs are not counted as PASS.
- [ ] Full exact-head migration/smoke + TCG validation gate required again before merge/deployment after runtime integration changes.
- [ ] Two-account desktop/phone full battle.
- [ ] Reconnect/private-state test.
- [ ] Economy receipt/retry/duplicate tests.
- [ ] AI simulation matrix.
- [ ] Human balance.
- [ ] Private alpha → economy alpha → closed beta → public beta → live.

---

# 10. Exact next execution order

1. **Finish Runtime Pass B safely:** keep generic continuous battle math in the shared v0.2 core; migrate/freeze the Set One v0.2 runtime registry source; only then wire `tcg-match-actions` to structured Essence continuous/lifecycle metadata and remove the corresponding card-ID math shortcuts.
2. Runtime Pass C — replace printed attack parsing and English `effect.includes(...)` gameplay with structured `creature.attacks[]`, damage formulas, target permissions and v0.2 steps.
3. Runtime Pass D — unify attack/Ability choices with the server-owned private pending-choice engine.
4. Runtime Pass E — add generic event/listener/continuous/lifecycle ownership for Abilities, Essence, Relics and Realms, preserving source-card-instance ownership where state belongs to the source card.
5. Runtime Pass F — delete remaining prototype aliases and ordinary Set One card-id/name runtime authority only after parity tests prove replacements.
6. Repair deck validation/copy-limit drift.
7. Prove full two-player setup → victory, persisted result, stale/replay safety and reconnect/private-state recovery without manual DB intervention.
8. Freeze deterministic SB1 registry only after runtime parity, structural validation and simulation/human-balance gates.
9. Deploy matching TCG migrations/functions only after exact-head TCG validation, migration replay, runtime smoke and player-facing gates pass.
10. Collection + Deck Builder + premium data-driven renderer + one-screen battle UI.
11. Trade Token duplicate conversion + Shop/pack opening + Battle Pass/dailies, then AI Test Match/simulation/human balance.
12. Real two-account desktop/phone private-alpha test, then release ladder: private alpha → economy alpha → closed beta → public beta → live.
13. Structure the completed Fairy 24 and Underworld 24 future audits through the same consolidated schema without blocking Set One private-alpha completion.

---

## Checkpoint conclusion

**Set One structure is now consolidated: 193 unique structured candidates, all eight exact 60-card starters, the single v0.2 opcode/predicate/required-parameter grammar owner and dedicated TCG CI are green.** Astral's old per-card Weakness contradiction is physically repaired, Founder is identity 193/193, and the starter manifest resolves against current canonical Card Pass 2 IDs.

**Runtime migration is now the active critical path.** Runtime 1A is complete, Runtime Pass A operation/predicate inventory is CI-enforced, and the Runtime Pass B generic attached-Essence continuous-math foundation is Deno-tested without card IDs. The current live/runtime Set One definitions remain legacy English-effect shapes, so `tcg-match-actions` must not be rewired to `definition.essence.continuous` until the v0.2 registry source is deliberately migrated/frozen and proven.

Fairy and Underworld remain fully designed as future 24-card element packages with exact 60-card starters. The second chain remains structurally complete at design level: `Astral → Martial → Shade → Fairy → Underworld → Astral`.

The shared future-mechanics plan covers vitality drain, damage movement/hostile transfer, rare Tide ranged placement, selective utility walls, layered protection/counterplay, precision exact-damage execution, separate condition execution, low-remaining-HP sweep, Reward-progress comeback scaling and distinct attached-Essence element queries. Trev's control/toolbox/conversion-control gameplay ideas remain design inputs, not copied card identities.

**Immediate next target: complete Runtime Pass B registry/wiring without breaking the current private-alpha prototype, then move directly into Runtime Pass C structured attack metadata.**