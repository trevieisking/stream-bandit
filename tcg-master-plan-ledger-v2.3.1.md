# Stream Bandit TCG — Master Plan V2.3.1 Execution Ledger

**Canonical plan:** `tcg-master-plan-progress-v2.3.1.md`  
**Previous canonical plan:** `tcg-master-plan-progress-v2.3.md`  
**Previous ledger:** `tcg-master-plan-ledger-v2.3.md`  
**Owner-family baseline:** 40  
**Ledger revision:** V2.3.1-4 — 2026-09-17

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
5. authority-graph references and self-contained JSON control contracts.

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

Exceptional future card data may explicitly define:

- Resistance;
- matchup override;
- another reviewed card-specific damage-affinity modifier.

No existing Set One matchup value changes from this control update.

### V2.3.1-004 — Original special-family names locked as working canon

**State:** ✅ LOCKED WORKING NAMES

Machine-readable authority: `tcg-special-mechanic-names-v1.json`

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

Shared once-per-match action name remains **Signature Power**, with Signature Attack / Signature Ability variants.

These are labels/capability bundles, not one engine per label.

### V2.3.1-005 — Damage-counter interaction/timing locked

**State:** ✅ LOCKED desired behaviour

Machine-readable authority: `tcg-damage-counter-interaction-v1.json`

- base counter unit = **10 damage**;
- visible counter values use 10-point increments up to the exact effect/property allowance;
- placing counters: resolving card hovers, legal targets highlight, counter tray appears, player drags/taps exact distribution, server validates/commits;
- moving counters: existing damage is transferred from source to legal destination(s) atomically;
- attack-generated counter choices resolve before automatic turn handoff;
- Conditions may declare counter ticks at the canonical turn-transition/checkup checkpoint;
- defeat/Reward/promotion consequences from Condition counters resolve before next-player normal actions;
- ordinary damage, placed counters, moved counters and Condition ticks remain semantically distinct.

### V2.3.1-006 — Authority graph repaired after exact-head review

**State:** ✅ CORRECTED

Review exposed four control-plane issues and all were addressed:

1. `tcg-v2-card-action-controller-v1.json` now points to `tcg-card-visual-printing-v1.1.json` rather than the superseded visual v1 contract.
2. `tcg-evergreen-extensibility-v1.1.json` is now a **self-contained** complete JSON authority rather than depending on undefined JSON inheritance semantics.
3. visual/header language no longer implies that current ordinary Creatures have a generic play/evolution Cost.
4. ordinary Vulnerability/weakness remains owned by the global matchup snapshot; exceptional Resistance/override data remains card-specific.

These corrections change no live gameplay, Supabase state, current card values or matchup table.

### V2.3.1-007 — Post-test coverage confirmed

**State:** ✅ COMPLETE

Confirmed retained authority includes:

- prototype restoration / one-screen board;
- full video choreography;
- all-card drag/drop/tap targeting;
- green Evolution target glow;
- Essence/Relic/Realm/Tactic direct play;
- Realm persistence;
- card-owned Ability/Attack/Withdraw;
- active Ability normally once/turn;
- attack auto-end-turn;
- interactive damage counter placement/movement before attack handoff;
- turn-transition Condition damage counters;
- ten visual families;
- 10 / 241 / 10 V2 target;
- Fairy + Underworld;
- artwork on every printable gameplay card;
- rarity + cosmetic printing variants;
- named numeric properties;
- schema-honest card header;
- original Stream Bandit special-mechanic family names;
- global matchup Vulnerability + exceptional Resistance/overrides;
- Evergreen/no age rotation;
- backward compatibility;
- future cards/attacks/Abilities/series/decks/packs/coins/accessories/events;
- generic special-mechanic capability architecture;
- 40-owner architecture / no owner #41 by label.

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

New authorities:

- `tcg-mechanic-harvest-index-v1.md`
- `tcg-generic-mechanic-capabilities-v1.json`

Research coverage recorded:

- Pokector coverage source indexes **174 English TCG sets** from Base through the 2026 Mega Evolution era;
- historical mechanic-family scan completed as a baseline across Base/Gym/Neo/e-Card/EX/DP/Platinum/HGSS/BW/XY/SM/SWSH/SV/Mega Evolution and special products;
- Bulbapedia `Cards by effect` provides 54 broad effect categories now folded into the generic mechanic vocabulary;
- active/passive/triggered Ability heritage, Tool/Stadium/Supporter/Technical Machine-style rules, special resource cards, high-risk Reward classes, singleton rules, multi-card assembly, inherited attacks/Abilities, alternate forms/types, strategy tags and modern special classes are represented generically.

Important honesty boundary:

- this is **not** a claim that every historical card text has been manually read;
- individual-card deep harvesting remains ongoing;
- an indexed capability is **not** runtime-complete until V2-G1E maps it to existing owners/opcodes or one justified generic extension and proves deterministic tests.

### V2.3.1-010 — Future card definitions must compose generic capabilities

**State:** ✅ LOCKED DESIGN RULE

Future Stream Bandit card design should use capability IDs from `tcg-generic-mechanic-capabilities-v1.json` plus structured parameters for timing, targets, costs, values and zones.

Example recipe:

`trigger.turn_start + search.deck + essence.attach_from_deck + condition.apply + limit.once_per_turn`

Rules:

- no card-name runtime branch when generic capabilities can express the effect;
- no series-name runtime branch;
- add a new capability ID only when existing capabilities cannot honestly compose the rule;
- missing runtime support must be implemented once, generically;
- old card data must remain backward compatible;
- new sets grow the capability/card library rather than rotating ownership away.

V2-G1E is not complete until a sample future series can be added using this catalog without rewriting old cards or adding series-specific runtime code.
