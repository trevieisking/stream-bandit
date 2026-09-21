import {
  runtimeV02CreateActiveAbilityLiveChoice,
  runtimeV02PendingActiveAbilityLiveChoiceView,
  runtimeV02ResolveActiveAbilityLiveChoice,
} from "../_shared/tcg-match-active-ability-live-v0-2.ts";
import {
  runtimeV02CurrentTurnActiveAbilityUseCount,
} from "../_shared/tcg-match-active-ability-choice-v0-2.ts";
import {
  runtimeV02ResumeActiveAbilityEssenceRedistribution,
  structuredRuntimeActiveAbilityEssenceRedistribution,
} from "../_shared/tcg-match-active-ability-essence-redistribution-v0-2.ts";
import {
  runtimeV02CurrentTurnEssenceMovements,
} from "../_shared/tcg-match-essence-movement-v0-2.ts";
import { runtimeV02SnapshotMarker } from "../_shared/tcg-runtime-registry-v0-2.ts";

function equal(actual: unknown, expected: unknown, message = "values differ") {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${message}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}
function same(actual: unknown, expected: unknown, message = "instances differ") {
  if (!Object.is(actual, expected)) throw new Error(message);
}
function throws(fn: () => unknown, fragment: string) {
  try {
    fn();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes(fragment)) throw error;
    return;
  }
  throw new Error(`expected error containing ${fragment}`);
}
function card(uid: string, cardId: string) {
  return { uid, card_id: cardId };
}
function creature(
  uid: string,
  cardId: string,
  damage = 0,
  essence: Array<{ uid: string; card_id: string }> = [],
) {
  return {
    stack: [card(uid, cardId)],
    essence: [...essence],
    relic: null,
    damage,
    shield: 0,
    conditions: { scorched: false, venomed: 0, control: null, modifier: null },
    flags: {},
  };
}
function envelope(
  id: string,
  name: string,
  family: "Creature" | "Essence",
  element: string,
) {
  return {
    schema: "sb-tcg-card-v0.2",
    effect_schema: "sb-tcg-effects-v0.2",
    id,
    name,
    card_family: family,
    element,
    traits: [],
  };
}
function redistributionAbility() {
  return {
    id: "heart-shape",
    name: "Heart Shape",
    mode: "active",
    event: null,
    timing: "own_turn",
    limit: { scope: "turn", count: 1, owner: "controller" },
    requirements: [],
    costs: [],
    steps: [
      {
        op: "MOVE_ATTACHED_ESSENCE",
        controller: "self",
        element: "Tide",
        count: { min: 0, max: 2 },
        source_selector: {
          zone: "field",
          filters: { card_family: "Creature" },
        },
        destination_selector: {
          zone: "field",
          filters: { card_family: "Creature" },
        },
        require_destination_different_creature: true,
        as: "heart_moves",
      },
      {
        op: "IF",
        when: {
          predicate: "essence_move_count_at_least",
          moves: "$heart_moves",
          count: 2,
        },
        then: [
          {
            op: "SELECT_CREATURE",
            controller: "self",
            zone: "field",
            count: 1,
            filters: {
              element: "Tide",
              damaged: true,
              participated_in_moves: "$heart_moves",
            },
            as: "heart_heal",
          },
          {
            op: "HEAL",
            target: "$heart_heal",
            amount: 20,
          },
        ],
      },
    ],
  };
}
function state() {
  const sourceId = "test-heart-source";
  const tideAId = "test-tide-a";
  const tideBId = "test-tide-b";
  const tideCId = "test-tide-c";
  const essenceId = "test-tide-essence";
  const creatureDef = (id: string, name: string, ability: Record<string, unknown> | null = null) => ({
    ...envelope(id, name, "Creature", "Tide"),
    creature: {
      stage: "Standalone",
      hp: 200,
      withdrawal: 1,
      reward_value: 1,
      ability,
      attacks: [],
    },
    essence: null,
    tactic: null,
  });
  const essenceDef = {
    ...envelope(essenceId, "Tide Essence", "Essence", "Tide"),
    creature: null,
    essence: {
      subtype: "Basic",
      provides: [{ element: "Tide", amount: 1 }],
      attach_requirements: [],
      on_attach: [],
      continuous: [],
      listeners: [],
      lifecycle: null,
    },
    tactic: null,
  };
  const essenceA = card("essence-a", essenceId);
  const essenceB = card("essence-b", essenceId);
  return {
    runtime_registry_v0_2: runtimeV02SnapshotMarker(),
    turn_seq: 21,
    active_seat: 1,
    phase: "play",
    players: {
      "1": {
        vanguard: creature(
          "source-uid",
          sourceId,
          30,
          [essenceA],
        ),
        reserve: [
          creature("tide-a-uid", tideAId, 40, [essenceB]),
          creature("tide-b-uid", tideBId, 0),
          creature("tide-c-uid", tideCId, 25),
          null,
        ],
        deck: [],
        hand: [],
        discard: [],
        rewards: [],
      },
      "2": {
        vanguard: null,
        reserve: [null, null, null, null],
        deck: [],
        hand: [],
        discard: [],
        rewards: [],
      },
    },
    card_index: {
      [sourceId]: {
        card_id: sourceId,
        definition_v0_2: creatureDef(sourceId, "Heart Source", redistributionAbility()),
      },
      [tideAId]: {
        card_id: tideAId,
        definition_v0_2: creatureDef(tideAId, "Tide A"),
      },
      [tideBId]: {
        card_id: tideBId,
        definition_v0_2: creatureDef(tideBId, "Tide B"),
      },
      [tideCId]: {
        card_id: tideCId,
        definition_v0_2: creatureDef(tideCId, "Tide C"),
      },
      [essenceId]: {
        card_id: essenceId,
        definition_v0_2: essenceDef,
      },
    },
  } as Record<string, unknown> & any;
}
function source() {
  return {
    where: "vanguard" as const,
    index: null,
    instance: card("source-uid", "test-heart-source"),
  };
}
function pending(match: any) {
  const choice = runtimeV02CreateActiveAbilityLiveChoice(
    match,
    1,
    source(),
    "heart-choice",
  );
  if (!choice || choice.kind !== "redistribute_attached_essence_then_conditional_heal") {
    throw new Error("redistribution choice required");
  }
  return choice;
}
const moveAtoA = "move:essence-a:source-uid:tide-a-uid";
const moveAtoB = "move:essence-a:source-uid:tide-b-uid";
const moveBtoB = "move:essence-b:tide-a-uid:tide-b-uid";
const healB = "heal:tide-b-uid";
const healC = "heal:tide-c-uid";

Deno.test("redistribution choice is move-only before listener resolution",()=>{const match=state(),choice=pending(match),own=runtimeV02PendingActiveAbilityLiveChoiceView(choice,1) as any;equal(choice.stage,"moves");equal(own.max,2);if(own.options.some((o:any)=>String(o.id).startsWith("heal:")))throw new Error("premature heal target")});
Deno.test("two moves resume IF against post-listener state then open heal choice",()=>{const match=state(),moveChoice=pending(match),moved=runtimeV02ResolveActiveAbilityLiveChoice(moveChoice,1,moveChoice.id,[moveAtoA,moveBtoB],match);if(moved.kind!=="redistribute_attached_essence_then_conditional_heal"||moved.stage!=="moves_resolved")throw new Error("moves stage required");equal(match.effect_events,undefined);match.players["1"].reserve[0].damage=0;match.players["1"].reserve[1].damage=15;const resumed=runtimeV02ResumeActiveAbilityEssenceRedistribution(match,moved.resume,"heart-heal-choice");if(!resumed.pending_choice)throw new Error("heal choice required");const own=runtimeV02PendingActiveAbilityLiveChoiceView(resumed.pending_choice,1) as any;if(!own.options.some((o:any)=>o.id===healB))throw new Error("post-listener participant missing");if(own.options.some((o:any)=>o.id===healC))throw new Error("nonparticipant included");const healed=runtimeV02ResolveActiveAbilityLiveChoice(resumed.pending_choice,1,resumed.pending_choice.id,[healB],match);if(healed.kind!=="redistribute_attached_essence_then_conditional_heal"||healed.stage!=="heal_resolved")throw new Error("heal stage required");equal(healed.actual_heal,15);equal(runtimeV02CurrentTurnActiveAbilityUseCount(match,1,"heart-shape"),1)});
Deno.test("zero moves leave IF false",()=>{const match=state(),moved=runtimeV02ResolveActiveAbilityLiveChoice(pending(match),1,"heart-choice",[],match);if(moved.kind!=="redistribute_attached_essence_then_conditional_heal"||moved.stage!=="moves_resolved")throw new Error("moves stage required");const resumed=runtimeV02ResumeActiveAbilityEssenceRedistribution(match,moved.resume,"heal-choice");equal(resumed.if_matched,false);equal(resumed.pending_choice,null)});
Deno.test("duplicate Essence movement fails before mutation",()=>{const match=state(),before=JSON.stringify(match.players["1"]),choice=pending(match);throws(()=>runtimeV02ResolveActiveAbilityLiveChoice(choice,1,choice.id,[moveAtoA,moveAtoB],match),"essence_reused");equal(JSON.stringify(match.players["1"]),before)});
