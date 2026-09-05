# Stream Bandit TCG — Card Pass 2 — Prismatic Founder

**Status:** Card Pass 2 design authority only. No production card registry, starter deck, migration, engine or deployed gameplay is changed by this file.

**Active implementation scope:** PR #549 on `feature/tcg-private-alpha-v0-5-source-recovery`.

## Authority boundary

The completed Set One element audit ledgers remain authoritative for the 192 elemental identities:

- `tcg-set-one-audit.md`: global rules + Astral / Ember / Gale / Grove
- `tcg-set-one-audit-volume-2.md`: Shade + future Fairy / Underworld reservation
- `tcg-set-one-audit-stone.md`: Stone
- `tcg-set-one-audit-tide.md`: Tide
- `tcg-set-one-audit-volt.md`: Volt

This file is authoritative for the 193rd Set One identity, **Stream Bandit — Prismatic Founder**, and establishes the first bounded Card Pass 2 decision.

Card Pass 2 is not another uncontrolled creative rewrite. It converts the completed current-rules design audit into deterministic, testable card data.

---

# CP2-01 — Stream Bandit — Prismatic Founder

## Fresh registry evidence

A read-only Supabase query of active `SB1` definitions confirms the current prototype is:

- card id: `prismatic-stream-bandit-prismatic-founder`
- element: **Prismatic**
- family: **Creature**
- stage: **Standalone**
- class: **Mythic**
- traits: **Mythic, Prismatic**
- HP: **360**
- withdrawal: **3**
- pack-only: **false**
- special identity: **193**
- rules version: `set-one-v0.6.1`

The active card-printing table contains one standard SB1 printing for the identity. No active starter deck includes the Founder.

The current prototype therefore already gets the most important class/stage distinction right: **Mythic is a class/trait and the creature is a Standalone**, not a fourth evolution stage.

---

## Prototype text

### Ability — Bandit's Current

Prototype meaning: once during your turn, search the deck for up to 2 Basic Essence cards and attach them to this creature and/or other friendly creatures in any combination; these attachments are additional to the normal manual attachment.

### Attack — Total Convergence

Prototype meaning: requires 3 attached Essence supplying 3 different elements and deals `60 × total physical Essence attached to all creatures in play`.

---

## Prototype problems

### 1. Bandit's Current produces excessive permanent acceleration

Two permanent Basic Essence attachments from the deck every turn, placed anywhere on the friendly board, are far above the normal one-manual-attachment economy and would make the Founder a universal resource engine rather than a distinctive Prismatic build-around.

The Ability is legal in principle under the global rule that card effects may attach Essence from other legal zones when explicitly authorized, but the quantity and unrestricted destinations are too strong.

### 2. Total Convergence is unbounded by the Founder's own development

The old attack counts **every physical Essence attached to every creature in play**, including the opponent's resources. Its damage therefore grows with both players merely playing the game and can reach numbers far beyond the intended Set One combat scale.

This also creates perverse incentives: an opponent developing their own board unintentionally powers the Founder's attack.

### 3. Total Convergence is not deterministic enough for the current attack grammar

The old expression combines a dynamic three-element payment test with a board-wide multiplication formula embedded in printed English. The current runtime cannot safely treat that sentence as authoritative structured gameplay.

### 4. A one-attack Starbound-only creature would be poor gameplay

If Total Convergence becomes the Founder's one shared Starbound expenditure, the Founder still needs an ordinary attack so it remains a functioning creature before and after that once-per-match power is spent.

---

# Current-rules design — LOCKED FOR CARD PASS 2

## Identity

- Name: **Stream Bandit — Prismatic Founder**
- Element: **Prismatic**
- Stage: **Standalone**
- Creature stage: **Standalone**
- Class: **Mythic**
- Traits: **Mythic, Prismatic**
- Prestige mechanic: **Starbound**
- HP: **360**
- Withdrawal: **3**
- Reward value: **2**
- Starbound: **yes**

The Founder is the special 193rd Set One identity and may legitimately be an exceptional multi-element build-around. It is not one of the eight elemental starter Mythics and therefore does not change Tide's locked position as the strongest fully-developed **elemental** late-game package.

---

## Ability — Bandit's Current

**Once during your turn, if Stream Bandit — Prismatic Founder is your Vanguard, search your deck for up to 1 Basic Essence card whose element is not already represented among the Essence attached to this Founder. Reveal that card, attach it to this Founder, then shuffle your deck. This Ability-generated attachment is additional to your normal manual Essence attachment for the turn.**

### Design purpose

Bandit's Current now does one clear job: it gradually builds a genuine multi-element Founder.

- It attaches only **1** Basic Essence per activation.
- It attaches only to the **Founder itself**.
- It requires the Founder to be **Vanguard**, exposing the two-Reward Mythic to interaction while it accelerates.
- It can fetch only a **new represented element** for that Founder, so duplicate colours cannot be farmed through the Ability.
- The search may choose zero cards, preserving hidden-deck legality.
- It remains additional to the normal manual Essence attachment, preserving the intended prestige acceleration without producing two free permanent resources every turn.

---

## Ordinary Attack — Founder's Mark

**`2 any — Founder's Mark — 70 damage.`**

### Purpose

The Founder needs a normal, deterministic attack that functions without consuming Starbound and remains usable after the player's shared Starbound marker has been spent.

The low typed requirement also lets a genuine multi-element deck attack without demanding a specific Essence colour combination.

---

## Starbound Power — Total Convergence

**`3 any — Total Convergence — variable damage.`**

### Legal declaration gate

Total Convergence may be declared only if:

1. the player still has their one shared Starbound marker;
2. normal attack legality is satisfied;
3. the Founder has at least 3 attached Essence whose supplied elements represent at least **3 different elements**.

Consume the player's shared Starbound marker immediately when the legal attack is declared, before later attack-condition resolution, exactly like the global Starbound rule.

### Damage formula

**Damage = `120 + (20 × number of different Essence elements represented among Essence attached to this Founder)`**.

For Set One, count at most the eight current SB1 Essence elements:

- Astral
- Ember
- Gale
- Grove
- Shade
- Stone
- Tide
- Volt

Duplicate Essence of the same element do not increase the distinct-element count.

### Set One damage range

- 3 different attached elements → **180 damage**
- 4 → **200**
- 5 → **220**
- 6 → **240**
- 7 → **260**
- all 8 → **280 damage**

### Why this is strong but bounded

Total Convergence preserves the fantasy of a huge Prismatic payoff while removing the prototype's uncontrolled board-wide multiplier.

- Only the Founder's own attached Essence matters.
- The opponent's board can never increase the attack's damage.
- Repeated copies of one element cannot inflate the formula.
- Reaching the maximum requires representing all eight current SB1 elements on one two-Reward Vanguard.
- The attack is available at most once per player per match because it consumes the shared Starbound marker.
- A player who uses another Starbound card first cannot later use Total Convergence.

At the three-colour minimum the attack equals Tide Marevault's locked raw 180 Starbound damage, but the Founder has no Marevault-style post-attack redistribution/healing package. Its higher 200–280 outcomes require increasingly demanding multi-element deck construction and board commitment.

---

## Starbound decision

**Stream Bandit — Prismatic Founder is explicitly STARBOUND: YES.**

Its exactly one Starbound effect is **Starbound Power — Total Convergence**.

- Bandit's Current is an ordinary once-per-turn Ability.
- Founder's Mark is an ordinary attack.
- Total Convergence is the single Starbound Power attack.
- The shared Starbound marker belongs to the player, not the Founder card instance.
- Once spent, no other Starbound Ability or Starbound attack may be used by that player during the match unless a future explicit rule says otherwise.

---

## Weakness / resistance

**Pending the cross-element Card Pass 2 matrix.**

The Founder will not automatically receive a special neutral rule simply because it is Prismatic. Its weakness/resistance decision must be made in the same per-creature comparative pass as the other Set One creatures so 360 HP + Mythic + acceleration + Starbound are considered together.

---

## Deterministic structure requirements

Card Pass 2 schema must support this identity without printed-English parsing:

1. Standalone creature stage independent from Mythic class/trait.
2. Explicit `reward_value = 2`.
3. Explicit `starbound = true` and one Starbound attack reference.
4. Ability activation limited to once per controller turn.
5. Vanguard-only Ability predicate.
6. Hidden-deck search with `0..1` Basic Essence selection.
7. Search predicate excluding elements already represented among attached Essence on the Founder.
8. Effect-generated attachment from deck additional to manual attachment.
9. `any` attack cost.
10. Attack declaration predicate requiring at least 3 distinct attached Essence elements.
11. Dynamic damage based on distinct attached element count, capped to the current SB1 eight-element set.
12. Shared Starbound-marker consumption on legal declaration.
13. Normal match-ending resolution before any later post-attack effects; Total Convergence currently has no post-damage rider.

The current runtime's printed-English attack parser is not authoritative for this card and must not be extended with Founder-specific string matching. Card Pass 2 must encode the formula as structured operations/predicates.

---

# Complete Set One design-audit milestone

With this Founder decision, **all 193 Set One identities now have a current-rules design authority**:

- 192 elemental identities: 24 × 8 elements
- 1 global Prismatic Founder identity

This completes the creative/current-rules card audit stage.

It does **not** mean the 193 cards are registry-ready or balanced. The remaining Card Pass 2 work converts those decisions into a coherent cross-element and deterministic implementation.

---

# Next bounded Card Pass 2 stage

## CP2-02 — Cross-element weakness/resistance matrix

Perform a complete read-only comparison of all Set One creatures before writing any weakness/resistance values.

Rules for the matrix:

1. Weakness and resistance are assigned **per creature**, never through a universal fixed element wheel.
2. Element identity is a design signal, not an automatic assignment.
3. Evolution families should usually tell a coherent defensive story, but individual stages may differ when creature biology/design warrants it.
4. Standalones may intentionally cover different matchups inside one element.
5. Mythic/Starbound creatures must not receive favourable weakness/resistance simply because they are prestigious.
6. HP, withdrawal, Shield access, healing, attack output, conditions and movement must be considered together with weakness/resistance.
7. Avoid circular pairings that create deterministic auto-win starter matchups.
8. Avoid giving every creature both a weakness and a resistance merely for symmetry; `none` is valid where appropriate.
9. Prismatic Founder is evaluated alongside the eight elemental pools, not exempted.
10. Freeze the matrix before deterministic card STRUCTURE so weakness/resistance becomes ordinary explicit registry metadata rather than engine hardcoding.

After the matrix is accepted, the next stage is **CP2-03 — shared deterministic card schema freeze**, followed by structuring all 193 corrected identities.