# Stream Bandit TCG — Canonical Master Plan V2.3.1

**Plan date:** 2026-09-17  
**Status:** canonical post-test consistency layer over V2.3  
**Inherits:** `tcg-master-plan-progress-v2.3.md` in full except where this file explicitly corrects card-header presentation and adds generic damage-affinity modifiers  
**Execution ledger:** `tcg-master-plan-ledger-v2.3.1.md`  
**Card visual contract:** `tcg-card-visual-printing-v1.1.json`  
**Evergreen/extensibility contract:** `tcg-evergreen-extensibility-v1.1.json`  
**Special mechanic matrix:** `tcg-special-mechanic-rule-matrix-v1.1.md`  
**Previous canonical main checkpoint:** `59ab7857522373a53de7d551c66f12c2e514e934`

---

## 0. Purpose

This layer closes the final two consistency gaps found by auditing every decision made after the real private-alpha game test and the approved ten showcase images.

Everything else from V2.3 remains unchanged and active.

---

## 1. Approved showcase card header — corrected visual authority

The final approved ten showcase families are the visual reference.

For ordinary Creature cards, the premium renderer must use this header logic:

- **Cost + value** in the top-left cost badge when that Creature identity has a structured play/evolution cost;
- **Element / type badge** top-right;
- **card name + stage/classification** in the identity band;
- **HP + value** clearly labelled in the upper identity/header area beneath or adjacent to the name;
- large dedicated artwork below the header;
- exactly two action slots below the art;
- **Withdraw Cost + value** bottom-right;
- rarity / printing finish / set markers in the frame/footer.

No visible gameplay number may float without a property label.

If a future card family does not use a generic play/evolution Cost, the renderer must omit that value cleanly rather than invent one. Structured data remains the rules authority; showcase concept numbers are not authoritative gameplay values.

This supersedes the older wording that required `HP` itself to occupy the top-left corner.

---

## 2. Creature action rule remains unchanged

Every ordinary Creature still uses exactly one of:

1. **Ability + Attack 1**
2. **Attack 1 + Attack 2**

Never Ability + Attack 1 + Attack 2 together.

Future reviewed special families may request a different generic action renderer only through an explicit shared contract; never as a one-card exception.

---

## 3. Generic Vulnerability / Resistance capability — added

The supplied historical/current special-card examples also expose a rule class that was not explicitly reserved in V2.3: type/element-based damage amplification and reduction.

Stream Bandit must therefore support generic **damage-affinity modifiers** through structured data.

Working player-facing terminology:

- **Vulnerability** — configured incoming damage is increased/multiplied when the source matches specified element/type/tag conditions;
- **Resistance** — configured incoming damage is reduced/prevented when the source matches specified element/type/tag conditions.

The exact public terminology may later change, but the capability is locked.

Required properties:

- zero, one or multiple configured affinity rules per Creature/printing identity where rules allow;
- source matching by element/type/rule tag rather than card name;
- additive, subtractive, multiplicative or prevention-style modifier modes only when explicitly declared by the rules schema;
- deterministic ordering relative to attack damage, Shield, prevention, Conditions and other damage modifiers;
- visible labels/icons on the card when the rule applies;
- accessible text equivalent for icons;
- server-authoritative calculation through the existing Damage/rules owners where possible;
- no browser-only damage arithmetic;
- no assumption that rarity, special class or printing finish creates Vulnerability/Resistance automatically.

Set One does not gain new Vulnerability/Resistance values merely because this capability is now reserved. Current card behaviour changes only through explicit structured card data and reviewed balance work.

---

## 4. Post-test master-plan audit — COMPLETE

The canonical inheritance chain now explicitly covers every accepted decision made after the real-game test:

- one-screen playable prototype restoration;
- uploaded-video interaction choreography;
- ten approved visual deck families;
- 10 elements / 241 current V2 identity target / 10 exact starter targets;
- Fairy / Glimmerwish and Underworld / Grave Pact accepted design packages;
- artwork target on every printable gameplay card;
- Basic / Rare / Extra Rare / Mythic rarity tiers;
- Standard / Shine / Holo / Full-Art Shine / Alt-Art / Signature Mythic printings;
- card-controlled Ability / Attack / Withdraw;
- exactly two ordinary Creature action slots;
- named numeric properties;
- drag/drop desktop + tap/select touch/accessibility equivalent;
- green legal-Evolution highlighting;
- Essence dragged/selected onto Creature;
- Relic attachment;
- persistent Realm until replacement or explicit effect removal/discard;
- Tactic board/overlay targeting;
- active Ability normally once during your turn unless structured data says otherwise;
- attack resolves fully then automatically ends turn;
- search/private-choice overlays preserving board context;
- Reward / defeat / promotion / victory presentation;
- Collection / Deck Builder / Packs / Practice / Card Viewer / Season product areas;
- prototype usability regression forbidden;
- primary all-cards Evergreen format with no age-based rotation;
- ownership/printing history preserved across future series;
- future cards, attacks, Abilities, special forms/classes, elements, series, decks, booster packs, rarities, printings, alternate art, collectible coins/accessories and event formats remain addable through data-driven systems;
- EX / GX / TAG TEAM / V / VMAX / VSTAR / V-UNION / Radiant / ACE SPEC / Prism / LV.X / BREAK / Tera / current Mega-ex-style mechanic categories researched as generic Stream Bandit capabilities;
- special rules split between visible card-facing data and global server-enforced family rules;
- 40-owner architecture remains the starting authority;
- no owner #41 merely for a new mechanic name;
- future schema changes require backward compatibility.

With the two corrections in this file, no additional post-test planning omission is currently known.

---

## 5. Locked next operation

No implementation order changes.

1. Finish Fairy + Underworld exact `sb-tcg-card-v0.2` translation.
2. Validate deterministic 241-identity / ten-starter authority.
3. Repair only proven generic dispatcher gaps.
4. Prove V2-G1E evergreen/extensibility schema support, now including damage-affinity metadata.
5. Build the premium full-card renderer from the corrected visual contract.
6. Restore the one-screen playable Battle Client.
7. Run real two-user end-to-end.

**Checkpoint:** post-test master-plan consistency audit ✅ complete.