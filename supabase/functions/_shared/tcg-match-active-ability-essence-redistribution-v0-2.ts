import {
  runtimeV02CurrentTurnActiveAbilityUseCount,
} from "./tcg-match-active-ability-choice-v0-2.ts";
import { runtimeV02EvaluateActiveAbilityIf } from "./tcg-match-active-ability-if-v0-2.ts";
import {
  applyRuntimeV02EssenceTransfer,
  type RuntimeV02EssenceMovement,
} from "./tcg-match-essence-movement-v0-2.ts";
import {
  applyRuntimeV02HealPacket,
  type RuntimeV02HealPacketContext,
} from "./tcg-match-heal-packet-v0-2.ts";
import { runtimeV02Definition } from "./tcg-runtime-registry-v0-2.ts";

type Seat = 1 | 2;
type FieldWhere = "vanguard" | "reserve";
type Inst = { uid: string; card_id: string };

type Creature = {
  stack: Inst[];
  essence: Inst[];
  relic: Inst | null;
  damage: number;
  shield: number;
  conditions?: Record<string, unknown>;
  condition?: string | null;
  flags?: Record<string, unknown>;
};

type Field = {
  where: FieldWhere;
  index: number | null;
  creature: Creature;
  top: Inst;
  def: Record<string, unknown>;
};

export type RuntimeV02ActiveAbilityEssenceRedistributionDescriptor = {
  ability_id: string;
  timing: "own_turn";
  limit: { scope: "turn"; count: 1; owner: "controller" };
  move: {
    element: string;
    min: number;
    max: number;
    source_zone: "field";
    destination_zone: "field";
    require_destination_different_creature: true;
    as: string;
  };
  when: {
    predicate: "essence_move_count_at_least";
    moves: string;
    count: number;
  };
  heal: {
    target_element: string;
    target_damaged: true;
    participated_in_moves: string;
    as: string;
    amount: number;
  };
};

export type RuntimeV02ActiveAbilityEssenceRedistributionMoveOption = {
  id: string;
  kind: "move";
  label: string;
  essence_uid: string;
  essence_card_id: string;
  source_anchor_uid: string;
  source_card_id: string;
  source_where: FieldWhere;
  source_index: number | null;
  destination_anchor_uid: string;
  destination_card_id: string;
  destination_where: FieldWhere;
  destination_index: number | null;
};

export type RuntimeV02ActiveAbilityEssenceRedistributionHealOption = {
  id: string;
  kind: "heal_target";
  label: string;
  anchor_uid: string;
  card_id: string;
  where: FieldWhere;
  index: number | null;
};

export type RuntimeV02PendingActiveAbilityEssenceRedistributionChoice = {
  id:string; seat:Seat; kind:"redistribute_attached_essence_then_conditional_heal"; stage:"moves"|"heal";
  ability_id:string; prompt:string; min:number; max:number; turn_seq:number;
  source_where:FieldWhere; source_index:number|null; source_uid:string; source_card_id:string;
  move_element:string; move_min:number; move_max:number; move_var:string;
  when:RuntimeV02ActiveAbilityEssenceRedistributionDescriptor["when"];
  heal:RuntimeV02ActiveAbilityEssenceRedistributionDescriptor["heal"];
  move_options:RuntimeV02ActiveAbilityEssenceRedistributionMoveOption[];
  heal_options:RuntimeV02ActiveAbilityEssenceRedistributionHealOption[];
  movement_receipts:RuntimeV02EssenceMovement[];
};
export type RuntimeV02ActiveAbilityEssenceRedistributionResume = {
  kind:"redistribution_after_movement"; turn_seq:number; seat:Seat; ability_id:string;
  source_where:FieldWhere; source_index:number|null; source_uid:string; source_card_id:string;
  move_element:string; move_min:number; move_max:number; move_var:string;
  when:RuntimeV02ActiveAbilityEssenceRedistributionDescriptor["when"];
  heal:RuntimeV02ActiveAbilityEssenceRedistributionDescriptor["heal"];
  movement_receipts:RuntimeV02EssenceMovement[];
};
export type RuntimeV02ActiveAbilityEssenceRedistributionResumeResolution = {
  kind:"redistribution_after_movement"; ability_id:string; movement_count:number; if_matched:boolean;
  pending_choice:RuntimeV02PendingActiveAbilityEssenceRedistributionChoice|null;
};
export type RuntimeV02ActiveAbilityEssenceRedistributionResolution =
 | {kind:"redistribute_attached_essence_then_conditional_heal";stage:"moves_resolved";ability_id:string;choice_id:string;movement_count:number;movement_receipts:RuntimeV02EssenceMovement[];resume:RuntimeV02ActiveAbilityEssenceRedistributionResume;emitted_packet_ids:[]}
 | {kind:"redistribute_attached_essence_then_conditional_heal";stage:"heal_resolved";ability_id:string;choice_id:string;movement_count:number;if_matched:true;heal_target_uid:string;requested_heal:number;actual_heal:number;emitted_packet_ids:string[]};

function objectRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function requiredString(value: unknown, code: string): string {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) throw new Error(code);
  return text;
}

function currentTurn(state: Record<string, unknown>): number {
  const turn = Number(state.turn_seq);
  if (!Number.isInteger(turn) || turn < 0) {
    throw new Error("tcg_v0_2_active_ability_redistribution_turn_invalid");
  }
  return turn;
}

function player(state: Record<string, unknown>, seat: Seat): Record<string, unknown> {
  const players = objectRecord(state.players);
  const row = players ? objectRecord(players[String(seat)]) : null;
  if (!row || !Array.isArray(row.reserve)) {
    throw new Error("tcg_v0_2_active_ability_redistribution_player_invalid");
  }
  return row;
}

function inst(value: unknown, code: string): Inst {
  const row = objectRecord(value);
  if (!row) throw new Error(code);
  return {
    uid: requiredString(row.uid, `${code}:uid`),
    card_id: requiredString(row.card_id, `${code}:card_id`),
  };
}

function creature(value: unknown, code: string): Creature {
  const row = objectRecord(value);
  if (
    !row ||
    !Array.isArray(row.stack) ||
    row.stack.length < 1 ||
    !Array.isArray(row.essence)
  ) throw new Error(code);
  const damage = Number(row.damage ?? 0);
  const shield = Number(row.shield ?? 0);
  if (!Number.isFinite(damage) || damage < 0 || !Number.isFinite(shield) || shield < 0) {
    throw new Error(`${code}:state`);
  }
  return row as unknown as Creature;
}

function top(cr: Creature, code: string): Inst {
  return inst(cr.stack[cr.stack.length - 1], code);
}

function definition(
  state: Record<string, unknown>,
  value: Inst | string,
): Record<string, unknown> {
  const result = runtimeV02Definition(state, value);
  if (!result) {
    throw new Error("tcg_v0_2_active_ability_redistribution_definition_missing");
  }
  return result;
}

function fields(state: Record<string, unknown>, seat: Seat): Field[] {
  const own = player(state, seat);
  const rows: Array<[FieldWhere, number | null, unknown]> = [
    ["vanguard", null, own.vanguard],
    ...[0, 1, 2, 3].map((index) =>
      ["reserve", index, (own.reserve as unknown[])[index]] as [FieldWhere, number, unknown]
    ),
  ];
  return rows.flatMap(([where, index, raw]) => {
    if (raw == null) return [];
    const cr = creature(
      raw,
      "tcg_v0_2_active_ability_redistribution_field_creature_invalid",
    );
    const card = top(
      cr,
      "tcg_v0_2_active_ability_redistribution_field_top_invalid",
    );
    return [{
      where,
      index,
      creature: cr,
      top: card,
      def: definition(state, card),
    }];
  });
}

function fieldByAnchor(
  state: Record<string, unknown>,
  seat: Seat,
  anchorUid: string,
): Field | null {
  return fields(state, seat).find((field) => field.top.uid === anchorUid) || null;
}

function sourceTop(
  state: Record<string, unknown>,
  seat: Seat,
  where: FieldWhere,
  index: number | null,
): Inst {
  const field = fields(state, seat).find((candidate) =>
    candidate.where === where &&
    (where === "vanguard" || candidate.index === index)
  );
  if (!field) {
    throw new Error("tcg_v0_2_active_ability_redistribution_source_missing");
  }
  return field.top;
}

function same(actual: Inst, expected: Inst, code: string): void {
  if (actual.uid !== expected.uid || actual.card_id !== expected.card_id) {
    throw new Error(code);
  }
}

function exactLimit(raw: unknown, abilityId: string) {
  const limit = objectRecord(raw);
  if (
    !limit ||
    limit.scope !== "turn" ||
    Number(limit.count) !== 1 ||
    limit.owner !== "controller"
  ) {
    throw new Error(
      `tcg_v0_2_active_ability_redistribution_limit_unsupported:${abilityId}`,
    );
  }
  return { scope: "turn" as const, count: 1 as const, owner: "controller" as const };
}

function exactRange(raw: unknown, code: string): { min: number; max: number } {
  const range = objectRecord(raw);
  if (!range) throw new Error(code);
  const min = Number(range.min);
  const max = Number(range.max);
  if (
    !Number.isInteger(min) ||
    !Number.isInteger(max) ||
    min < 0 ||
    max < min
  ) throw new Error(code);
  return { min, max };
}

function essenceElement(
  state: Record<string, unknown>,
  value: Inst,
): string {
  const def = definition(state, value);
  if (String(def.card_family || "") !== "Essence") {
    throw new Error("tcg_v0_2_active_ability_redistribution_attachment_not_essence");
  }
  return requiredString(
    def.element,
    "tcg_v0_2_active_ability_redistribution_essence_element_required",
  );
}

function fieldLabel(field: Field): string {
  return field.where === "vanguard"
    ? "Vanguard"
    : `Reserve ${Number(field.index) + 1}`;
}

function legalMoveOptions(
  state: Record<string, unknown>,
  seat: Seat,
  element: string,
): RuntimeV02ActiveAbilityEssenceRedistributionMoveOption[] {
  const current = fields(state, seat);
  const out: RuntimeV02ActiveAbilityEssenceRedistributionMoveOption[] = [];
  for (const source of current) {
    for (const rawEssence of source.creature.essence) {
      const essence = inst(
        rawEssence,
        "tcg_v0_2_active_ability_redistribution_essence_invalid",
      );
      if (essenceElement(state, essence) !== element) continue;
      for (const destination of current) {
        if (destination.top.uid === source.top.uid) continue;
        out.push({
          id: `move:${essence.uid}:${source.top.uid}:${destination.top.uid}`,
          kind: "move",
          label: `Move ${String(definition(state, essence).name || essence.card_id)}: ${fieldLabel(source)} -> ${fieldLabel(destination)}`,
          essence_uid: essence.uid,
          essence_card_id: essence.card_id,
          source_anchor_uid: source.top.uid,
          source_card_id: source.top.card_id,
          source_where: source.where,
          source_index: source.index,
          destination_anchor_uid: destination.top.uid,
          destination_card_id: destination.top.card_id,
          destination_where: destination.where,
          destination_index: destination.index,
        });
      }
    }
  }
  return out.sort((a, b) => a.id.localeCompare(b.id));
}

function legalHealOptions(state:Record<string,unknown>,seat:Seat,element:string,participants:Set<string>):RuntimeV02ActiveAbilityEssenceRedistributionHealOption[]{
 return fields(state,seat).filter((field)=>participants.has(field.top.uid)&&String(field.def.element||"")===element&&Number(field.creature.damage||0)>0).map((field)=>({id:`heal:${field.top.uid}`,kind:"heal_target" as const,label:`Heal ${fieldLabel(field)}`,anchor_uid:field.top.uid,card_id:field.top.card_id,where:field.where,index:field.index})).sort((x,y)=>x.id.localeCompare(y.id));
}
function movementReceiptParticipants(moves:RuntimeV02EssenceMovement[]):Set<string>{return new Set(moves.flatMap((move)=>[move.source_creature_uid,move.destination_creature_uid]))}

function preflightMoves(
  state: Record<string, unknown>,
  seat: Seat,
  moves: RuntimeV02ActiveAbilityEssenceRedistributionMoveOption[],
  sourceActionId: string,
): void {
  const probe = structuredClone(state);
  for (const move of moves) {
    const source = fieldByAnchor(probe, seat, move.source_anchor_uid);
    const destination = fieldByAnchor(probe, seat, move.destination_anchor_uid);
    if (!source || !destination) {
      throw new Error(
        "tcg_v0_2_active_ability_redistribution_move_field_changed",
      );
    }
    same(
      source.top,
      { uid: move.source_anchor_uid, card_id: move.source_card_id },
      "tcg_v0_2_active_ability_redistribution_move_source_changed",
    );
    same(
      destination.top,
      {
        uid: move.destination_anchor_uid,
        card_id: move.destination_card_id,
      },
      "tcg_v0_2_active_ability_redistribution_move_destination_changed",
    );
    applyRuntimeV02EssenceTransfer(
      probe,
      seat,
      move.source_anchor_uid,
      move.destination_anchor_uid,
      source.creature.essence,
      destination.creature.essence,
      move.essence_uid,
      sourceActionId,
    );
  }
}

export function structuredRuntimeActiveAbilityEssenceRedistribution(
  state: Record<string, unknown>,
  instanceOrId: string | { card_id?: unknown } | null | undefined,
): RuntimeV02ActiveAbilityEssenceRedistributionDescriptor | null {
  const def = runtimeV02Definition(state, instanceOrId);
  if (!def || String(def.card_family || "") !== "Creature") return null;
  const creatureDef = objectRecord(def.creature);
  const ability = objectRecord(creatureDef?.ability);
  if (!ability || ability.mode !== "active" || ability.timing !== "own_turn") return null;
  if (!Array.isArray(ability.requirements) || ability.requirements.length !== 0) return null;
  if (!Array.isArray(ability.costs) || ability.costs.length !== 0) return null;

  const steps = Array.isArray(ability.steps) ? ability.steps.map(objectRecord) : [];
  if (steps.length !== 2 || steps.some((step) => !step)) return null;
  const move = steps[0]!;
  const conditional = steps[1]!;
  if (
    move.op !== "MOVE_ATTACHED_ESSENCE" ||
    move.controller !== "self" ||
    typeof move.element !== "string" ||
    !move.element ||
    move.require_destination_different_creature !== true
  ) return null;
  const count = exactRange(
    move.count,
    "tcg_v0_2_active_ability_redistribution_move_count_invalid",
  );
  const sourceSelector = objectRecord(move.source_selector);
  const destinationSelector = objectRecord(move.destination_selector);
  const sourceFilters = objectRecord(sourceSelector?.filters);
  const destinationFilters = objectRecord(destinationSelector?.filters);
  if (
    sourceSelector?.zone !== "field" ||
    destinationSelector?.zone !== "field" ||
    sourceFilters?.card_family !== "Creature" ||
    destinationFilters?.card_family !== "Creature"
  ) return null;
  const moveVar = requiredString(
    move.as,
    "tcg_v0_2_active_ability_redistribution_move_var_required",
  );

  if (conditional.op !== "IF" || conditional.else != null) return null;
  const when = objectRecord(conditional.when);
  const then = Array.isArray(conditional.then) ? conditional.then.map(objectRecord) : [];
  if (
    !when ||
    when.predicate !== "essence_move_count_at_least" ||
    String(when.moves || "") !== `$${moveVar}` ||
    !Number.isInteger(Number(when.count)) ||
    Number(when.count) < 1 ||
    then.length !== 2 ||
    !then[0] ||
    !then[1]
  ) return null;
  const select = then[0]!;
  const heal = then[1]!;
  if (
    select.op !== "SELECT_CREATURE" ||
    select.controller !== "self" ||
    select.zone !== "field" ||
    Number(select.count) !== 1
  ) return null;
  const healFilters = objectRecord(select.filters);
  if (
    !healFilters ||
    typeof healFilters.element !== "string" ||
    !healFilters.element ||
    healFilters.damaged !== true ||
    String(healFilters.participated_in_moves || "") !== `$${moveVar}`
  ) return null;
  const healVar = requiredString(
    select.as,
    "tcg_v0_2_active_ability_redistribution_heal_var_required",
  );
  if (
    heal.op !== "HEAL" ||
    String(heal.target || "") !== `$${healVar}`
  ) return null;
  const amount = Number(heal.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error(
      "tcg_v0_2_active_ability_redistribution_heal_amount_invalid",
    );
  }

  return {
    ability_id: requiredString(
      ability.id,
      "tcg_v0_2_active_ability_redistribution_id_required",
    ),
    timing: "own_turn",
    limit: exactLimit(ability.limit, String(ability.id || "")),
    move: {
      element: String(move.element),
      min: count.min,
      max: count.max,
      source_zone: "field",
      destination_zone: "field",
      require_destination_different_creature: true,
      as: moveVar,
    },
    when: {
      predicate: "essence_move_count_at_least",
      moves: `$${moveVar}`,
      count: Number(when.count),
    },
    heal: {
      target_element: String(healFilters.element),
      target_damaged: true,
      participated_in_moves: `$${moveVar}`,
      as: healVar,
      amount,
    },
  };
}

export function runtimeV02CreateActiveAbilityEssenceRedistributionChoice(state:Record<string,unknown>,controllerSeat:Seat,descriptor:RuntimeV02ActiveAbilityEssenceRedistributionDescriptor,source:{where:FieldWhere;index:number|null;instance:unknown},choiceId:string=crypto.randomUUID()):RuntimeV02PendingActiveAbilityEssenceRedistributionChoice{
 if(Number(state.active_seat)!==controllerSeat)throw new Error("tcg_v0_2_active_ability_redistribution_not_active_seat");
 if(runtimeV02CurrentTurnActiveAbilityUseCount(state,controllerSeat,descriptor.ability_id)>=descriptor.limit.count)throw new Error("tcg_v0_2_active_ability_redistribution_limit_reached");
 const sourceInstance=inst(source.instance,"tcg_v0_2_active_ability_redistribution_source_invalid");
 same(sourceTop(state,controllerSeat,source.where,source.index),sourceInstance,"tcg_v0_2_active_ability_redistribution_source_changed");
 return{id:requiredString(choiceId,"tcg_v0_2_active_ability_redistribution_choice_id_required"),seat:controllerSeat,kind:"redistribute_attached_essence_then_conditional_heal",stage:"moves",ability_id:descriptor.ability_id,prompt:"Choose up to the allowed attached Essence moves",min:descriptor.move.min,max:descriptor.move.max,turn_seq:currentTurn(state),source_where:source.where,source_index:source.index,source_uid:sourceInstance.uid,source_card_id:sourceInstance.card_id,move_element:descriptor.move.element,move_min:descriptor.move.min,move_max:descriptor.move.max,move_var:descriptor.move.as,when:structuredClone(descriptor.when),heal:structuredClone(descriptor.heal),move_options:legalMoveOptions(state,controllerSeat,descriptor.move.element),heal_options:[],movement_receipts:[]};
}
export function runtimeV02PendingActiveAbilityEssenceRedistributionChoiceView(choice:RuntimeV02PendingActiveAbilityEssenceRedistributionChoice|null|undefined,viewerSeat:Seat){
 if(!choice)return null;if(choice.seat!==viewerSeat)return{id:choice.id,seat:choice.seat,kind:choice.kind,waiting:true};
 const options=choice.stage==="moves"?choice.move_options.map((o)=>({id:o.id,label:o.label,kind:o.kind})):choice.heal_options.map((o)=>({id:o.id,label:o.label,kind:o.kind}));
 return{id:choice.id,seat:choice.seat,kind:choice.kind,stage:choice.stage,prompt:choice.prompt,min:choice.min,max:choice.max,options};
}
function validateChoiceEnvelope(choice:RuntimeV02PendingActiveAbilityEssenceRedistributionChoice,controllerSeat:Seat,choiceId:string,choiceIds:string[],state:Record<string,unknown>):void{
 if(choice.kind!=="redistribute_attached_essence_then_conditional_heal")throw new Error("tcg_v0_2_active_ability_redistribution_choice_kind_invalid");
 if(choice.seat!==controllerSeat)throw new Error("tcg_v0_2_active_ability_redistribution_choice_not_yours");
 if(!choiceId||choice.id!==choiceId)throw new Error("tcg_v0_2_active_ability_redistribution_choice_stale_id");
 if(!Array.isArray(choiceIds)||new Set(choiceIds).size!==choiceIds.length)throw new Error("tcg_v0_2_active_ability_redistribution_choice_ids_invalid");
 if(currentTurn(state)!==choice.turn_seq)throw new Error("tcg_v0_2_active_ability_redistribution_turn_changed");
 if(Number(state.active_seat)!==controllerSeat)throw new Error("tcg_v0_2_active_ability_redistribution_active_seat_changed");
 same(sourceTop(state,controllerSeat,choice.source_where,choice.source_index),{uid:choice.source_uid,card_id:choice.source_card_id},"tcg_v0_2_active_ability_redistribution_source_changed");
}
export function runtimeV02ResolveActiveAbilityEssenceRedistributionChoice(choice:RuntimeV02PendingActiveAbilityEssenceRedistributionChoice,controllerSeat:Seat,choiceId:string,choiceIds:string[],state:Record<string,unknown>):RuntimeV02ActiveAbilityEssenceRedistributionResolution{
 validateChoiceEnvelope(choice,controllerSeat,choiceId,choiceIds,state);
 if(choice.stage==="moves"){
  const byId=new Map(choice.move_options.map((o)=>[o.id,o])),moves=choiceIds.map((id)=>byId.get(id)).filter((o):o is RuntimeV02ActiveAbilityEssenceRedistributionMoveOption=>Boolean(o)).sort((x,y)=>x.id.localeCompare(y.id));
  if(moves.length!==choiceIds.length)throw new Error("tcg_v0_2_active_ability_redistribution_unknown_option");
  if(moves.length<choice.move_min||moves.length>choice.move_max)throw new Error("tcg_v0_2_active_ability_redistribution_choice_shape_invalid");
  if(new Set(moves.map((move)=>move.essence_uid)).size!==moves.length)throw new Error("tcg_v0_2_active_ability_redistribution_essence_reused");
  const current=new Set(legalMoveOptions(state,controllerSeat,choice.move_element).map((o)=>o.id));for(const move of moves)if(!current.has(move.id))throw new Error("tcg_v0_2_active_ability_redistribution_move_changed");
  preflightMoves(state,controllerSeat,moves,choice.ability_id);
  const receipts:RuntimeV02EssenceMovement[]=[];for(const move of moves){const source=fieldByAnchor(state,controllerSeat,move.source_anchor_uid),destination=fieldByAnchor(state,controllerSeat,move.destination_anchor_uid);if(!source||!destination)throw new Error("tcg_v0_2_active_ability_redistribution_move_field_changed");receipts.push(applyRuntimeV02EssenceTransfer(state,controllerSeat,move.source_anchor_uid,move.destination_anchor_uid,source.creature.essence,destination.creature.essence,move.essence_uid,choice.ability_id).movement)}
  const resume:RuntimeV02ActiveAbilityEssenceRedistributionResume={kind:"redistribution_after_movement",turn_seq:choice.turn_seq,seat:controllerSeat,ability_id:choice.ability_id,source_where:choice.source_where,source_index:choice.source_index,source_uid:choice.source_uid,source_card_id:choice.source_card_id,move_element:choice.move_element,move_min:choice.move_min,move_max:choice.move_max,move_var:choice.move_var,when:structuredClone(choice.when),heal:structuredClone(choice.heal),movement_receipts:receipts.map((x)=>({...x}))};
  return{kind:choice.kind,stage:"moves_resolved",ability_id:choice.ability_id,choice_id:choice.id,movement_count:receipts.length,movement_receipts:receipts.map((x)=>({...x})),resume,emitted_packet_ids:[]};
 }
 if(choice.stage!=="heal")throw new Error("tcg_v0_2_active_ability_redistribution_choice_stage_invalid");if(choiceIds.length!==1)throw new Error("tcg_v0_2_active_ability_redistribution_choice_shape_invalid");
 const participants=movementReceiptParticipants(choice.movement_receipts),currentOptions=legalHealOptions(state,controllerSeat,choice.heal.target_element,participants),selected=currentOptions.find((o)=>o.id===choiceIds[0]);
 if(!selected||!choice.heal_options.some((o)=>o.id===selected.id))throw new Error("tcg_v0_2_active_ability_redistribution_heal_target_changed");
 const target=fieldByAnchor(state,controllerSeat,selected.anchor_uid);if(!target||target.top.card_id!==selected.card_id)throw new Error("tcg_v0_2_active_ability_redistribution_heal_target_changed");
 const context:RuntimeV02HealPacketContext={source:{controller_seat:controllerSeat,action_kind:"ability",action_id:choice.ability_id,card_effect:true,card_uid:choice.source_uid,card_id:choice.source_card_id,creature_uid:choice.source_uid},target:{controller_seat:controllerSeat,creature_uid:target.top.uid,card_uid:target.top.uid,card_id:target.top.card_id,element:requiredString(target.def.element,"tcg_v0_2_active_ability_redistribution_target_element_required"),where:target.where,index:target.where==="reserve"?target.index:null}};
 const healed=applyRuntimeV02HealPacket(state,target.creature,choice.heal.amount,context);return{kind:choice.kind,stage:"heal_resolved",ability_id:choice.ability_id,choice_id:choice.id,movement_count:choice.movement_receipts.length,if_matched:true,heal_target_uid:target.top.uid,requested_heal:choice.heal.amount,actual_heal:healed.actual_heal,emitted_packet_ids:healed.packet?[healed.packet.id]:[]};
}
export function runtimeV02ResumeActiveAbilityEssenceRedistribution(state:Record<string,unknown>,resume:RuntimeV02ActiveAbilityEssenceRedistributionResume,choiceId:string=crypto.randomUUID()):RuntimeV02ActiveAbilityEssenceRedistributionResumeResolution{
 if(currentTurn(state)!==resume.turn_seq)throw new Error("tcg_v0_2_active_ability_redistribution_turn_changed");if(Number(state.active_seat)!==resume.seat)throw new Error("tcg_v0_2_active_ability_redistribution_active_seat_changed");
 same(sourceTop(state,resume.seat,resume.source_where,resume.source_index),{uid:resume.source_uid,card_id:resume.source_card_id},"tcg_v0_2_active_ability_redistribution_source_changed");
 const matched=runtimeV02EvaluateActiveAbilityIf(resume.when,{sets:{},creatures:{},essence_moves:{[resume.move_var]:resume.movement_receipts.map((x)=>({...x}))}});
 if(!matched)return{kind:resume.kind,ability_id:resume.ability_id,movement_count:resume.movement_receipts.length,if_matched:false,pending_choice:null};
 const participants=movementReceiptParticipants(resume.movement_receipts),heals=legalHealOptions(state,resume.seat,resume.heal.target_element,participants);if(!heals.length)return{kind:resume.kind,ability_id:resume.ability_id,movement_count:resume.movement_receipts.length,if_matched:true,pending_choice:null};
 return{kind:resume.kind,ability_id:resume.ability_id,movement_count:resume.movement_receipts.length,if_matched:true,pending_choice:{id:requiredString(choiceId,"tcg_v0_2_active_ability_redistribution_choice_id_required"),seat:resume.seat,kind:"redistribute_attached_essence_then_conditional_heal",stage:"heal",ability_id:resume.ability_id,prompt:"Choose one damaged participating Creature to heal",min:1,max:1,turn_seq:resume.turn_seq,source_where:resume.source_where,source_index:resume.source_index,source_uid:resume.source_uid,source_card_id:resume.source_card_id,move_element:resume.move_element,move_min:resume.move_min,move_max:resume.move_max,move_var:resume.move_var,when:structuredClone(resume.when),heal:structuredClone(resume.heal),move_options:[],heal_options:heals,movement_receipts:resume.movement_receipts.map((x)=>({...x}))}};
}
