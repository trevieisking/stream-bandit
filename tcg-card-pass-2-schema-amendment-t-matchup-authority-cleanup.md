# Stream Bandit TCG — Card Pass 2 — Schema Amendment T — Matchup Authority Cleanup

**Status:** Binding corrective amendment. Branch design only. No production registry, migration, deployed engine or live gameplay is changed by this file.

**Purpose:** Quarantine stale pre-correction Weakness language that remains in older Card Pass 2 source documents so the consolidated validator and current matchup table are the only active authority.

---

## T-01 — Current Weakness owner

Routine Weakness is **global matchup logic**, not copied onto ordinary Set One cards.

Current binding rules:

- World chain: `Tide → Ember → Grove → Gale → Stone → Volt → Tide`.
- Mystical/combat chain: `Astral → Martial → Shade → Fairy → Underworld → Astral`.
- Martial is a Creature Type/trait, not an Essence element.
- Weakness multiplies qualifying **attack damage only** by ×2.
- Multiple matching keys still apply ×2 once maximum, never ×4.
- Recoil, condition damage, effect damage, vitality drain, damage placement, damage movement and defeat effects are not multiplied by Weakness.
- Resistance is nullable/explicit and never inferred as the reverse of Weakness.
- Prismatic is neutral by default unless a later explicit matchup override is approved.

---

## T-02 — Stale base-schema passages are superseded

The following older language in `tcg-card-pass-2-schema.md` is historical and **not current authority**:

- examples showing a routine Creature field such as `"weakness":{"element":"Shade","multiplier":2}`;
- text saying “Set One weakness is stored explicitly” on each Creature;
- references to a fixed set of per-creature Weakness assignments as the current implementation goal;
- any statement that Card Pass 2 should freeze a per-creature Weakness matrix into ordinary card metadata.

Until the large base document is mechanically rewritten during final schema consolidation, readers and tools must treat those passages as superseded by:

1. `tcg-card-pass-2-weakness-resistance.md` current global matchup authority;
2. Amendment E matchup fields/global ownership;
3. Amendment I validator rejection of stale routine per-card Weakness;
4. this Amendment T;
5. `tcg-card-pass-2-validator-v0.2.json` as the single consolidated current owner.

---

## T-03 — Founder stale matchup wording is superseded

The older `tcg-card-pass-2-founder.md` passages that say the Prismatic Founder is waiting for a “per-creature comparative Weakness/Resistance pass” are also historical.

Current Founder matchup rule:

- element: `Prismatic`;
- ordinary Weakness field: absent;
- `resistance: null` unless a future explicit rare Resistance is approved;
- `matchup_override: null` by default;
- Prismatic contributes no automatic global Weakness key by itself;
- an exceptional future Founder matchup interaction must be represented by explicit structured `matchup_override`, not by reviving routine per-card Weakness metadata.

---

## T-04 — Validator treatment

The consolidated validator must fail any active Set One candidate that contains routine per-card Weakness metadata.

Allowed matchup-bearing fields for ordinary current candidates are:

- `creature_types`;
- `resistance` (normally null);
- `matchup_override` (normally null);
- top-level/printed `element`;
- future explicit traits used as attacker/defender matchup keys.

A historical prose document containing stale examples does not itself become gameplay data, but final schema consolidation is not complete until those stale examples are removed or the base document is explicitly marked legacy.

---

## T-05 — Current cleanup state

Already physically corrected:

- `tcg-card-pass-2-astral.md` — stale per-card Weakness objects removed from all 11 Astral Creatures.

Still requiring source-document cleanup during consolidation:

- `tcg-card-pass-2-schema.md` — stale per-card Weakness examples/prose;
- `tcg-card-pass-2-founder.md` — stale historical “per-creature matrix” prose.

These source-document cleanup items do **not** change the current gameplay rule; they are documentation/schema-consolidation debt only.

---

## Amendment T conclusion

The global matchup system is the sole current Weakness owner. No active Set One card candidate may carry routine per-card Weakness. Prismatic Founder is neutral by default and does not reopen the old per-creature matrix model.