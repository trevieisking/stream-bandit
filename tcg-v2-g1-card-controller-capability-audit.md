# Stream Bandit TCG — V2-G1 Card Controller Capability Audit

**Base reviewed main:** `d56bfb80f413acf72f430876e1126a2ec80dde44`  
**Scope:** accepted Fairy / Glimmerwish and Underworld / Grave Pact Creature cards only.  
**Runtime/live change:** none.

## Decision

The real Creature card can be the primary player control surface without replacing Attack, Ability, Payment, Damage, Heal, Defeat, Switch, or Card-Zone ownership.

Existing `tcg-match-actions` already exposes the commands the renderer needs:

- Attack: `action = attack`, `attack_slot = 1 | 2`
- active Ability: `action = use_ability`, source `where` + `index`
- Withdraw: `action = withdraw`, `reserve_index` + exact `discard_essence_uids`

Triggered/passive Abilities are displayed on the card but do not manufacture a client action. Their canonical event/listener owner fires them.

## 22-card action-shape result

- 22 Creature identities total
- 11 Fairy / 11 Underworld
- 17 use `Ability + Attack 1`
- 5 use `Attack 1 + Attack 2`
- 0 use `Ability + Attack 1 + Attack 2`
- 8 Abilities are active/player-chosen
- 9 Abilities are triggered/automatic

## Existing owner support

The existing effect grammar already declares `MOVE_DAMAGE`, `DRAIN_VITALITY`, `HEAL`, `ADD_DAMAGE_PROTECTION`, `ADD_ATTACK_DAMAGE_MODIFIER`, `DRAW`, `PLACE_DAMAGE`, `SELECT_CREATURE`, `IF`, and the other primitives needed by the accepted Fairy/Underworld designs. `tcg-match-damage-program-v0-2.ts` already provides generic `MOVE_DAMAGE` and `DRAIN_VITALITY` executors. This is owner reuse evidence; it is not proof that every new compound Ability already has a live dispatcher route.

## Active Ability live-route audit

| Card | Ability | Owner primitives | Current live-route status |
|---|---|---|---|
| Fairy — Moonpetal Empress | Crown of Grace | `MOVE_DAMAGE` + `HEAL` | **GAP:** compound multi-target friendly damage movement + heal is not one of the currently proven active-Ability live-route families. |
| Fairy — Petalqueen | Seraphic Veil | Damage Protection owner | **GAP:** current selected-modifier live route proves attack-damage prevention, not this accepted next opposing **effect-damage** packet protection shape. |
| Fairy — Moondormouse | Moon Sip | `DRAIN_VITALITY` + Heal | **SUPPORTED SHAPE:** matches the current own-turn source-damaged → opposing Vanguard drain → heal-source active program. Exact structured card still requires validation. |
| Fairy — Luminara | Prismatic Burden | `MOVE_DAMAGE` | **GAP:** select friendly source + friendly destination and move damage is owner-supported but not a currently proven active-Ability live route. |
| Underworld — Grimling | Little Siphon | `DRAIN_VITALITY` + Heal | **SUPPORTED SHAPE:** matches the current own-turn source-damaged → opposing Vanguard drain → heal-source active program. Exact structured card still requires validation. |
| Underworld — Debtbound Sovereign | Sovereign Debt | `MOVE_DAMAGE` + `DRAW` | **GAP:** selected friendly → source damage movement plus conditional draw is not a currently proven live route. |
| Underworld — Bone Lantern Hound | Buried Sip | `DRAIN_VITALITY` + Heal | **GAP:** owner primitive exists, but current immediate drain recognizer requires `source_damaged`; this card instead requires the opposing Vanguard to be damaged. Extend the generic recognizer rather than create a new owner. |
| Underworld — Bloodbasilisk | Paid in Blood | Damage activation cost + `SELECT_CREATURE` + `DRAIN_VITALITY` | **SUPPORTED SHAPE:** current targeted-drain owner explicitly recognizes source-damage activation cost → one opposing field Creature → drain into source. Exact structured card still requires validation. |

### Result

**3 / 8 active Ability shapes have a directly proven current live family.**  
**5 / 8 need generic active-Ability dispatcher/recognizer extensions.**

This does **not** imply five new gameplay engines. The semantic owners already exist; the missing work is routing/recognition for compound shapes.

## Attack / Withdraw audit

### Attack

Base attack selection is already generic and slot-based. A rendered card can send `attack_slot: 1` or `attack_slot: 2`; the server retrieves the selected Vanguard definition, validates costs/requirements and resolves through Attack owners. Individual post-damage effect programs still require per-card structured/runtime validation before V2 live cutover.

### Withdraw

Withdraw remains a server-owned Vanguard action. The card renders `Withdraw Cost`; choosing Withdraw highlights legal Reserve replacements, then submits the selected replacement and exact attached-Essence payment. Switch/movement/listener owners remain unchanged.

## Renderer contract

The final battle renderer should derive these controls from the structured card definition and server view:

1. Render HP, element/type, artwork and card text.
2. Render exactly two printed action areas.
3. If Ability mode is `active`, enable it only when the server says it is legal.
4. If Ability mode is triggered/continuous, show it but do not create an activation button.
5. Render Attack 1 / Attack 2 from ordered `creature.attacks[]` and submit the corresponding `attack_slot`.
6. Render Withdraw from `creature.withdrawal` and submit only through the canonical Withdraw route.
7. Display server-provided legality/lock reasons rather than reimplementing legality in JavaScript.

## Safety boundary

This audit changes no runtime, registry, Supabase data, Edge Function, migration, live match, or production page. It only binds accepted card designs to existing server commands and records the exact remaining dispatcher gaps.

## Next bounded slice

Translate the Fairy and Underworld Creature gameplay effects into exact `sb-tcg-card-v0.2` / `sb-tcg-effects-v0.2` candidate definitions, with dedicated grammar tests. Extend a generic active-Ability live recognizer only when a translated card proves that exact gap. Do not add owner family 41.
