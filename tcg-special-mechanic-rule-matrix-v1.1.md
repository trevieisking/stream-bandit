# Stream Bandit TCG — Special Mechanic Rule Matrix V1.1

**Date:** 2026-09-17  
**Inherits:** `tcg-special-mechanic-rule-matrix-v1.md` in full  
**Purpose:** Post-test consistency addition for the supplied cards' visible type/element damage modifiers.

## Added rule family — damage affinity

Several supplied historical/current card examples visibly show weakness/resistance-style damage rules. V1 covered position prevention and special class rules but did not explicitly reserve this separate capability.

| Visible rule pattern | Stream Bandit card presentation | Server requirement | Generic capability |
|---|---|---|---|
| Source element/type causes increased incoming damage | clearly labelled **Vulnerability** marker/value or accessible standardized icon | match configured source element/type/tag and apply declared modifier in canonical damage order | `damage_affinity_modifier` / amplification |
| Source element/type causes reduced or prevented incoming damage | clearly labelled **Resistance** marker/value or accessible standardized icon | match configured source element/type/tag and apply declared reduction/prevention in canonical damage order | `damage_affinity_modifier` / reduction-prevention |

### Separation rules

Damage affinity is independent from:

- rarity;
- printing finish;
- special Creature class;
- Reward value;
- ordinary Shield;
- Condition state;
- position-based prevention.

A Shine/Alt-Art version has the same affinity data as the same gameplay identity's Standard printing.

### Rules authority

The renderer displays the configured rule. The server calculates it.

The browser must never infer elemental damage multipliers from artwork colour, rarity, special-class badge or visual element icon alone.

Set One does not gain new affinity values simply because this capability has been documented. Any actual card-level Vulnerability/Resistance value requires explicit structured card data and normal review/testing.

## Card header consistency note

The final approved showcase families use the visual pattern now captured by `tcg-card-visual-printing-v1.1.json`:

- Cost top-left when the identity has structured Cost data;
- element/type top-right;
- name/stage plus clearly labelled HP in the upper identity/header area;
- large artwork;
- two ordinary Creature action slots;
- Withdraw Cost bottom-right.

Concept-art numbers remain examples only; structured card data remains rules authority.

## Acceptance

This V1.1 addition closes the only mechanic-family omission found during the post-test master-plan consistency audit.