# Stream Bandit TCG — Master Plan V2.3.1 Execution Ledger

**Canonical plan:** `tcg-master-plan-progress-v2.3.1.md`  
**Previous canonical plan:** `tcg-master-plan-progress-v2.3.md`  
**Previous ledger:** `tcg-master-plan-ledger-v2.3.md`  
**Owner-family baseline:** 40  
**Ledger revision:** V2.3.1-6 — 2026-09-17

## Rules

- This ledger is append-only continuity over V2.3.
- GitHub exact commit/PR/comment evidence remains repository truth.
- Supabase remains live/deployed truth.
- No concept-art number becomes a gameplay rule unless structured data declares it.
- External TCG mechanic names are research provenance only; Stream Bandit player-facing names are original.
- JSON authority files referenced by Release Control must be self-contained unless a validated resolver explicitly defines inheritance semantics.
- Mechanic research may expand the generic capability vocabulary; **indexed does not mean runtime-implemented** until V2-G1E proves owner/opcode/schema coverage.

---

## V2.3.1 transactions

### V2.3.1-001 — Full post-test master-plan audit completed

**State:** ✅ COMPLETE

Audit basis:

- current `main` after V2.3;
- V2.3 evergreen/extensibility authority;
- inherited V2.2 prototype/video interaction authority;
- Release Control V2;
- ten approved showcase image families;
- accepted Fairy/Underworld design packages;
- accepted card-controller contract;
- supplied special-card examples and V2.3 rule matrix.

Audit/correction scope ultimately covered:

1. showcase header wording vs actual structured schema;
2. ordinary global matchup weakness vs exceptional card-specific Resistance/override;
3. original Stream Bandit names for researched special families;
4. physical damage-counter placement/movement and turn-transition Condition timing;
5. authority-graph references and self-contained JSON control contracts;
6. living cross-era mechanic research and generic capability vocabulary.

No additional post-test planning requirement is currently known.

### V2.3.1-002 — Showcase header reconciled with real schema

**State:** ✅ LOCKED

The approved showcase composition is retained, but concept-art Cost values are not gameplay authority.

Current `sb-tcg-card-v0.2` ordinary Creatures do not define a generic play/evolution Cost.

Renderer authority is therefore:

- top-left badge slot may show a real structured header property or nonnumeric class/stage/special-rule badge;
- numeric `Cost` appears only when a card family truly defines that structured property;
- current ordinary Creatures receive no invented Cost;
- Element/type top-right;
- name/stage + clearly labelled HP in upper identity area;
- large artwork;
- exactly two ordinary action slots;
- Withdraw Cost bottom-right;
- rarity/printing/set markers in frame/footer.

`tcg-card-visual-printing-v1.1.json` is self-contained and authoritative for this corrected renderer rule.

### V2.3.1-003 — Matchup/affinity ownership reconciled

**State:** ✅ LOCKED

Ordinary Set One-style weakness is owned by the versioned global matchup snapshot (`cp2-matchups-v0.1`), not per-card `weakness` objects.

Working player-facing presentation may call that matchup **Vulnerability**, but engine ownership remains global.

Exceptional future card data may explicitly define Resistance, matchup override or another reviewed card-specific damage-affinity modifier.

No existing Set One matchup value changes from this control update.

### V2.3.1-004 — Original special-family names locked as working canon

**State:** ✅ LOCKED WORKING NAMES

Machine-readable authority: `tcg-special-mechanic-names-v1.json`.

- EX/current ex research pattern → **Ascendant Creature**
- GX → **Sigilborn Creature**
- TAG TEAM GX → **Bonded Sigilborn**
- V → **Exalted Creature**
- VMAX → **Colossus Creature**
- VSTAR → **Starforged Creature**
- V-UNION → **Convergence Creature**
- Radiant → **Gleam Creature**
- ACE SPEC → **Prime Card**
- Prism Star → **Riftmarked Card**
- LV.X → **Overform**
- BREAK → **Ascension Form**
- Tera → **Aspect Creature**
- current Mega-ex → **Apex Ascendant**
- historical Mega EX evolve/end-turn pattern → **Ascension Evolution**

Shared once-per-match presentation is **Signature Power**. Machine action kinds remain `attack` / `ability`; display labels are **Signature Attack** / **Signature Ability**.

These are labels/capability bundles, not one engine per label.

### V2.3.1-005 — Damage-counter interaction/timing locked

**State:** ✅ LOCKED desired behaviour

Machine-readable authority: `tcg-damage-counter-interaction-v1.json`.

Counter model:

- base counter unit = **10 damage**;
- fixed and `up to`/partial amount semantics are distinct;
- fixed amount must be applied in full when legal;
- smaller totals require explicit `up to`/partial permission;
- MOVE_DAMAGE can never exceed available source damage.

Place/move choreography:

1. resolving/source card hovers;
2. board remains visible;
3. legal targets highlight;
4. counter tray appears;
5. player drags/taps exact 10-point allocation;
6. server validates/commits the operation;
7. **destination defeat check occurs immediately after committed PLACE_DAMAGE/MOVE_DAMAGE before later listeners/follow-up targeting can act on that destination.**

Attack-generated counter choices still complete before automatic turn handoff, but each counter operation preserves its immediate defeat boundary. Turn-transition Condition counters use the same immediate defeat rule before next-player normal actions.

Ordinary damage, placed counters, moved counters and Condition ticks remain semantically distinct. Weakness/Vulnerability, Resistance and Shield do not automatically change placed/moved counter amounts.

### V2.3.1-006 — Authority graph repaired after first exact-head review

**State:** ✅ CORRECTED

First review exposed four control-plane issues and all were addressed:

1. card controller points to visual v1.1;
2. evergreen v1.1 is self-contained;
3. current ordinary Creatures receive no invented generic Cost;
4. ordinary Vulnerability remains owned by global matchup snapshot while exceptional Resistance/overrides remain card-specific.

These corrections change no live gameplay, Supabase state, current card values or matchup table.

### V2.3.1-007 — Post-test coverage confirmed

**State:** ✅ COMPLETE

Confirmed retained authority includes prototype restoration, full video choreography, drag/drop/tap targeting, green Evolution targets, direct Essence/Relic/Realm/Tactic play, Realm persistence, card-owned Ability/Attack/Withdraw, active Ability normally once/turn, attack auto-end-turn, damage-counter placement/movement, immediate counter defeat boundaries, fixed/up-to precision, Condition ticks, ten visual families, 10/241/10 target, Fairy + Underworld, artwork/rarity/printing variants, original special-family names, global matchup Vulnerability, Evergreen/no age rotation, backward compatibility, future content/product extensibility and the 40-owner/no-owner-41 rule.

### V2.3.1-008 — Restart point

**State:** 🔎 V2-G1 remains active

Next:

1. Fairy canonical schema;
2. Underworld canonical schema;
3. deterministic 241/10 authority;
4. proven generic dispatcher gaps only;
5. V2-G1E extensibility schema including matchup ownership, damage-counter metadata, original family labels and generic mechanic catalog;
6. premium renderer;
7. restored one-screen Battle Client;
8. real two-user E2E.

### V2.3.1-009 — Cross-era mechanic harvest bound to the master plan

**State:** ✅ RESEARCH/SCHEMA AUTHORITY ADDED

Authorities:

- `tcg-mechanic-harvest-index-v1.md`
- `tcg-generic-mechanic-capabilities-v1.json`

Research coverage recorded:

- Pokector coverage source indexes **174 English TCG sets** from Base through the 2026 Mega Evolution era;
- historical mechanic-family baseline scan spans Base/Gym/Neo/e-Card/EX/DP/Platinum/HGSS/BW/XY/SM/SWSH/SV/Mega Evolution and special products;
- Bulbapedia `Cards by effect` provides **54 broad effect categories** folded into the generic vocabulary;
- broader card/Ability/Attack indexes remain ongoing per-card research sources;
- active/passive/triggered Ability heritage, persistent attachments/fields, support-card limits, granted Attacks, Special Essence, modal card types, strategy tags, Reward classes, singleton limits, assembly, inheritance and alternate forms/types are represented generically.

**Indexed does not mean implemented.** V2-G1E must map capability IDs to current owners/opcodes or one justified generic extension and prove deterministic tests.

### V2.3.1-010 — Future card definitions compose generic capabilities

**State:** ✅ LOCKED DESIGN RULE

Future card design uses capability IDs + structured parameters for timing, targets, costs, values and zones.

Example:

`trigger.turn_start + search.deck + essence.attach_from_deck + condition.apply + limit.once_per_turn`

No card-name or series-name runtime branch is permitted when the generic vocabulary can express the effect. New capability IDs require proof that existing primitives cannot honestly compose the rule. Missing runtime support is implemented once, generically, and older card data remains backward compatible.

### V2.3.1-011 — Mechanic harvest remains living research

**State:** 🔎 ONGOING BY DESIGN

The catalog grows as individual historical/current cards reveal genuinely reusable rule primitives.

Latest explicit additions include:

- `zone.characteristics_by_zone`;
- `setup.special_play_eligibility`;
- `setup.mulligan_eligibility_override`;
- `form.multi_element`;
- `form.dynamic_element_change`;
- `condition.modify_checkup_or_recovery`;
- `draw.prevent` / `draw.modify_count`;
- `relic.eligibility_rule` / `relic.expire_at_timing`;
- `realm.modify_condition_rule`;
- `random.multi_outcome` / `effect.random_gate` / `choice.simultaneous_reveal`.

Research additions follow: identify idea → try to compose existing capabilities → add smallest generic primitive only if necessary → defer runtime support until V2-G1E proof.

### V2.3.1-012 — Second exact-head review precision repairs

**State:** ✅ CORRECTED ON BRANCH / RE-REVIEW REQUIRED

The refreshed review after mechanic-harvest work found four further documentation/control issues:

1. `tcg-special-mechanic-rule-matrix-v1.1.md` had become an addendum that omitted V1 capability/renderer/owner details. It is now **self-contained**, preserving the complete V1 matrix plus V1.1 corrections.
2. damage-counter ordering had later listeners before lethal defeat processing. The contract and master plan now require the **immediate destination defeat boundary after each committed PLACE_DAMAGE/MOVE_DAMAGE operation**.
3. Signature Power used presentation labels in the machine `action_kinds` field. Machine identifiers are restored to `attack` / `ability`, with Signature Attack / Signature Ability stored separately as display labels.
4. fixed MOVE_DAMAGE amounts were described like `up to` amounts. Fixed amounts now require the full legal amount; smaller values require explicit `up to` or partial semantics.

No runtime, current registry, Supabase, migration, live page or production game state was changed by these repairs.
