from pathlib import Path


def replace_once(path: str, old: str, new: str) -> None:
    p = Path(path)
    text = p.read_text()
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"replace guard failed {path}: expected 1, got {count}: {old[:140]}")
    p.write_text(text.replace(old, new, 1))


Path("supabase/functions/_shared/tcg-match-reward-inspection-v0-2.ts").write_text(r'''import { runtimeV02Definition } from "./tcg-runtime-registry-v0-2.ts";

export type RuntimeV02RewardInspectionEvent = {
  turn_seq: number;
  controller_seat: 1 | 2;
};

export type RuntimeV02PrivateRewardInspectionCard = {
  position: number;
  uid: string;
  card_id: string;
};

export type RuntimeV02PrivateRewardInspectionView = {
  turn_seq: number;
  controller_seat: 1 | 2;
  cards: RuntimeV02PrivateRewardInspectionCard[];
};

const LEDGER_KEY = "runtime_reward_inspections_v0_2";
const PRIVATE_VIEW_KEY = "runtime_private_reward_inspection_v0_2";

function objectRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function rejectUnsupportedFields(
  value: Record<string, unknown>,
  allowed: string[],
  error: string,
): void {
  const keys = new Set(allowed);
  const extra = Object.keys(value).find((key) => !keys.has(key));
  if (extra) throw new Error(`${error}:${extra}`);
}

function turnSeq(state: Record<string, unknown>): number {
  const value = state.turn_seq;
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
    throw new Error("tcg_v0_2_reward_inspection_turn_seq_invalid");
  }
  return value;
}

function seat(value: unknown): 1 | 2 {
  if (value !== 1 && value !== 2) {
    throw new Error("tcg_v0_2_reward_inspection_controller_seat_invalid");
  }
  return value;
}

function normalizeEvent(raw: unknown, index: number): RuntimeV02RewardInspectionEvent {
  const value = objectRecord(raw);
  if (!value) throw new Error(`tcg_v0_2_reward_inspection_event_invalid:${index}`);
  rejectUnsupportedFields(
    value,
    ["turn_seq", "controller_seat"],
    `tcg_v0_2_reward_inspection_event_field_unsupported:${index}`,
  );
  const eventTurn = value.turn_seq;
  if (typeof eventTurn !== "number" || !Number.isInteger(eventTurn) || eventTurn < 0) {
    throw new Error(`tcg_v0_2_reward_inspection_event_turn_invalid:${index}`);
  }
  return { turn_seq: eventTurn, controller_seat: seat(value.controller_seat) };
}

function ledger(state: Record<string, unknown>): RuntimeV02RewardInspectionEvent[] {
  const raw = state[LEDGER_KEY];
  if (raw == null) return [];
  if (!Array.isArray(raw)) throw new Error("tcg_v0_2_reward_inspection_ledger_invalid");
  return raw.map((entry, index) => normalizeEvent(entry, index));
}

function normalizePrivateCard(raw: unknown, index: number): RuntimeV02PrivateRewardInspectionCard {
  const value = objectRecord(raw);
  if (!value) throw new Error(`tcg_v0_2_reward_private_card_invalid:${index}`);
  rejectUnsupportedFields(
    value,
    ["position", "uid", "card_id"],
    `tcg_v0_2_reward_private_card_field_unsupported:${index}`,
  );
  const position = value.position;
  const uid = typeof value.uid === "string" ? value.uid : "";
  const cardId = typeof value.card_id === "string" ? value.card_id : "";
  if (typeof position !== "number" || !Number.isInteger(position) || position < 0 || !uid || !cardId) {
    throw new Error(`tcg_v0_2_reward_private_card_shape_invalid:${index}`);
  }
  return { position, uid, card_id: cardId };
}

function privateInspection(state: Record<string, unknown>): RuntimeV02PrivateRewardInspectionView | null {
  const raw = state[PRIVATE_VIEW_KEY];
  if (raw == null) return null;
  const value = objectRecord(raw);
  if (!value) throw new Error("tcg_v0_2_reward_private_view_invalid");
  rejectUnsupportedFields(
    value,
    ["turn_seq", "controller_seat", "cards"],
    "tcg_v0_2_reward_private_view_field_unsupported",
  );
  const viewTurn = value.turn_seq;
  if (typeof viewTurn !== "number" || !Number.isInteger(viewTurn) || viewTurn < 0) {
    throw new Error("tcg_v0_2_reward_private_view_turn_invalid");
  }
  if (!Array.isArray(value.cards)) throw new Error("tcg_v0_2_reward_private_view_cards_invalid");
  return {
    turn_seq: viewTurn,
    controller_seat: seat(value.controller_seat),
    cards: value.cards.map((card, index) => normalizePrivateCard(card, index)),
  };
}

function positions(value: unknown): number[] {
  if (value == null) return [];
  if (!Array.isArray(value)) throw new Error("tcg_v0_2_reward_inspection_positions_invalid");
  const out = value.map((entry, index) => {
    if (typeof entry !== "number" || !Number.isInteger(entry) || entry < 0) {
      throw new Error(`tcg_v0_2_reward_inspection_position_invalid:${index}`);
    }
    return entry;
  });
  if (new Set(out).size !== out.length) throw new Error("tcg_v0_2_reward_inspection_positions_duplicate");
  return out;
}

export function recordRuntimeV02RewardInspection(
  state: Record<string, unknown>,
  controllerSeat: 1 | 2,
): RuntimeV02RewardInspectionEvent[] {
  const currentTurn = turnSeq(state);
  const controller = seat(controllerSeat);
  const current = ledger(state).filter((entry) => entry.turn_seq === currentTurn);
  if (!current.some((entry) => entry.controller_seat === controller)) {
    current.push({ turn_seq: currentTurn, controller_seat: controller });
  }
  state[LEDGER_KEY] = current.map((entry) => ({ ...entry }));
  return current.map((entry) => ({ ...entry }));
}

export function runtimeV02CurrentTurnRewardInspections(
  state: Record<string, unknown>,
  controllerSeat: 1 | 2,
): RuntimeV02RewardInspectionEvent[] {
  const currentTurn = turnSeq(state);
  const controller = seat(controllerSeat);
  return ledger(state)
    .filter((entry) => entry.turn_seq === currentTurn && entry.controller_seat === controller)
    .map((entry) => ({ ...entry }));
}

export function runtimeV02PrivateRewardInspectionView(
  state: Record<string, unknown>,
  viewerSeat: 1 | 2,
): RuntimeV02PrivateRewardInspectionView | null {
  const view = privateInspection(state);
  if (!view || view.turn_seq !== turnSeq(state) || view.controller_seat !== seat(viewerSeat)) return null;
  return {
    turn_seq: view.turn_seq,
    controller_seat: view.controller_seat,
    cards: view.cards.map((card) => ({ ...card })),
  };
}

/**
 * Executes only the frozen private Reward-inspection shape on a structured
 * creature_evolved trigger. Reward cards remain in place. Public/canonical
 * event history stores only turn + controller; inspected identities are held
 * only by the controller-private view adapter.
 */
export function structuredRuntimeEvolutionRewardInspection(
  state: Record<string, unknown>,
  evolvedInstance: { card_id?: unknown } | null | undefined,
  controllerSeat: 1 | 2,
  rawPositions: unknown,
): { inspected_count: number; ability_id: string } | null {
  const definition = runtimeV02Definition(state, evolvedInstance);
  if (!definition) return null;
  const creature = objectRecord(definition.creature);
  const ability = objectRecord(creature?.ability);
  if (!ability || ability.mode !== "triggered" || ability.event !== "creature_evolved") return null;

  const steps = Array.isArray(ability.steps) ? ability.steps : [];
  const rewardInspectSteps = steps.filter((rawStep) => {
    const step = objectRecord(rawStep);
    return step?.op === "INSPECT_ZONE" && step.zone === "rewards";
  });
  if (rewardInspectSteps.length === 0) return null;

  const abilityId = typeof ability.id === "string" && ability.id ? ability.id : "unknown";
  rejectUnsupportedFields(
    ability,
    ["id", "name", "mode", "event", "timing", "limit", "requirements", "costs", "steps"],
    `tcg_v0_2_reward_inspection_ability_field_unsupported:${abilityId}`,
  );
  if (ability.timing !== "own_turn" || ability.limit !== null) {
    throw new Error(`tcg_v0_2_reward_inspection_ability_timing_unsupported:${abilityId}`);
  }
  if (!Array.isArray(ability.costs) || ability.costs.length !== 0) {
    throw new Error(`tcg_v0_2_reward_inspection_ability_cost_unsupported:${abilityId}`);
  }
  if (steps.length !== 1 || rewardInspectSteps.length !== 1) {
    throw new Error(`tcg_v0_2_reward_inspection_ability_shape_unsupported:${abilityId}`);
  }

  const requirements = objectRecord(ability.requirements);
  const all = Array.isArray(requirements?.all) ? requirements.all : [];
  const onlyRequirement = objectRecord(all[0]);
  if (
    !requirements || Object.keys(requirements).length !== 1 || all.length !== 1 ||
    !onlyRequirement || Object.keys(onlyRequirement).length !== 1 ||
    onlyRequirement.predicate !== "source_is_self"
  ) {
    throw new Error(`tcg_v0_2_reward_inspection_requirements_unsupported:${abilityId}`);
  }

  const step = objectRecord(rewardInspectSteps[0])!;
  rejectUnsupportedFields(
    step,
    ["op", "player", "zone", "selection", "visibility", "return_policy", "as"],
    `tcg_v0_2_reward_inspection_step_field_unsupported:${abilityId}`,
  );
  if (
    step.player !== "self" || step.visibility !== "controller_private" ||
    step.return_policy !== "same_position"
  ) {
    throw new Error(`tcg_v0_2_reward_inspection_step_shape_unsupported:${abilityId}`);
  }

  const selection = objectRecord(step.selection);
  if (!selection) throw new Error(`tcg_v0_2_reward_inspection_selection_invalid:${abilityId}`);
  rejectUnsupportedFields(
    selection,
    ["min", "max", "filters", "distinct"],
    `tcg_v0_2_reward_inspection_selection_field_unsupported:${abilityId}`,
  );
  const filters = objectRecord(selection.filters);
  if (!filters || Object.keys(filters).length !== 0) {
    throw new Error(`tcg_v0_2_reward_inspection_selection_filters_unsupported:${abilityId}`);
  }
  const min = selection.min;
  const max = selection.max;
  if (
    typeof min !== "number" || !Number.isInteger(min) || min < 0 ||
    typeof max !== "number" || !Number.isInteger(max) || max < min ||
    (max > 1 && selection.distinct !== true)
  ) {
    throw new Error(`tcg_v0_2_reward_inspection_selection_invalid:${abilityId}`);
  }

  const chosen = positions(rawPositions);
  if (chosen.length < min || chosen.length > max) {
    throw new Error(`tcg_v0_2_reward_inspection_count_invalid:${abilityId}:${chosen.length}`);
  }

  const controller = seat(controllerSeat);
  const players = objectRecord(state.players);
  const player = objectRecord(players?.[String(controller)]);
  const rewards = Array.isArray(player?.rewards) ? player.rewards : null;
  if (!rewards) throw new Error("tcg_v0_2_reward_inspection_rewards_missing");

  const cards = chosen.map((position, index) => {
    if (position >= rewards.length) {
      throw new Error(`tcg_v0_2_reward_inspection_position_out_of_range:${index}`);
    }
    const instance = objectRecord(rewards[position]);
    const uid = typeof instance?.uid === "string" ? instance.uid : "";
    const cardId = typeof instance?.card_id === "string" ? instance.card_id : "";
    if (!uid || !cardId) throw new Error(`tcg_v0_2_reward_inspection_reward_invalid:${position}`);
    return { position, uid, card_id: cardId };
  });

  if (cards.length > 0) {
    recordRuntimeV02RewardInspection(state, controller);
    state[PRIVATE_VIEW_KEY] = {
      turn_seq: turnSeq(state),
      controller_seat: controller,
      cards: cards.map((card) => ({ ...card })),
    };
  }
  return { inspected_count: cards.length, ability_id: abilityId };
}
''')


authority = "supabase/functions/_shared/tcg-match-attack-authority-v0-2.ts"
replace_once(
    authority,
    'import { runtimeV02CurrentTurnEssenceMovements } from "./tcg-match-essence-movement-v0-2.ts";\n',
    'import { runtimeV02CurrentTurnEssenceMovements } from "./tcg-match-essence-movement-v0-2.ts";\nimport { runtimeV02CurrentTurnRewardInspections } from "./tcg-match-reward-inspection-v0-2.ts";\n',
)
replace_once(
    authority,
    'function formulaUsesEssenceMovement(value: RuntimeV02ConditionalAddFormulaMetadata | null): boolean {\n',
    '''function formulaUsesRewardInspection(value: RuntimeV02ConditionalAddFormulaMetadata | null): boolean {\n  if (!value) return false;\n  return value.terms.some((term) => {\n    const predicates = "any" in term.when ? term.when.any : [term.when];\n    return predicates.some((predicate) =>\n      predicate.predicate === "event_occurred" && predicate.event === "reward_inspected"\n    );\n  });\n}\n\nfunction formulaUsesEssenceMovement(value: RuntimeV02ConditionalAddFormulaMetadata | null): boolean {\n''',
)
replace_once(
    authority,
    '  const events: RuntimeV02ConditionalAddEventSignal[] = [];\n  if (formulaUsesEssenceMovement(formula)) {\n',
    '''  const events: RuntimeV02ConditionalAddEventSignal[] = [];\n  if (formulaUsesRewardInspection(formula)) {\n    const seat = declarationSourceControllerSeat(state, instanceOrId);\n    if (seat && runtimeV02CurrentTurnRewardInspections(state, seat).length > 0) {\n      events.push({ event: "reward_inspected", controller: "self" });\n    }\n  }\n  if (formulaUsesEssenceMovement(formula)) {\n''',
)
replace_once(
    authority,
    '  if (\n    predicate.event === "device_resolved" &&\n',
    '''  if (\n    predicate.event === "reward_inspected" &&\n    predicate.controller === "self" &&\n    predicate.window === "current_turn" &&\n    predicate.min_count === 1\n  ) return true;\n  if (\n    predicate.event === "device_resolved" &&\n''',
)
replace_once(
    authority,
    ''' * Runtime-C ready subset: declaration-time state predicates plus canonical\n * current-turn Device-resolution, hidden deck-view, Essence-movement,\n * damage-prevention and attack-source attachment signals.\n *\n * Reward inspection remains deliberately excluded until its canonical runtime\n * owner is proven.\n''',
    ''' * Runtime-C ready subset: declaration-time state predicates plus canonical\n * current-turn Device-resolution, hidden deck-view, Reward-inspection,\n * Essence-movement, damage-prevention and attack-source attachment signals.\n''',
)


match_actions = "supabase/functions/tcg-match-actions/index.ts"
replace_once(
    match_actions,
    'import { runtimeV02CurrentTurnHiddenInformationViews } from "../_shared/tcg-match-hidden-information-v0-2.ts";\n',
    'import { runtimeV02CurrentTurnHiddenInformationViews } from "../_shared/tcg-match-hidden-information-v0-2.ts";\nimport { runtimeV02PrivateRewardInspectionView, structuredRuntimeEvolutionRewardInspection } from "../_shared/tcg-match-reward-inspection-v0-2.ts";\n',
)
replace_once(
    match_actions,
    'pending_resolution:s.pending_resolutions?.[0]?{kind:s.pending_resolutions[0].kind,seat:s.pending_resolutions[0].seat,count:s.pending_resolutions[0].count||null}:null,result:s.result||null,',
    'pending_resolution:s.pending_resolutions?.[0]?{kind:s.pending_resolutions[0].kind,seat:s.pending_resolutions[0].seat,count:s.pending_resolutions[0].count||null}:null,private_reward_inspection:runtimeV02PrivateRewardInspectionView(s,viewerSeat as 1|2),result:s.result||null,',
)
replace_once(
    match_actions,
    'const x=removeHand(p,uid)!;cr.stack.push(x);cr.evolved_turn=turn;cr.entered_turn=turn;clearOrdinaryConditions(cr);\n   if(d.id==="tide-reefback"',
    '''const x=removeHand(p,uid)!;cr.stack.push(x);cr.evolved_turn=turn;cr.entered_turn=turn;clearOrdinaryConditions(cr);let rewardInspection=null;try{rewardInspection=structuredRuntimeEvolutionRewardInspection(s,x,seat as 1|2,body.inspect_reward_positions)}catch(error){const message=error instanceof Error?error.message:String(error);if(message.startsWith("tcg_v0_2_reward_inspection_positions_")||message.startsWith("tcg_v0_2_reward_inspection_position_")||message.startsWith("tcg_v0_2_reward_inspection_count_invalid:"))return json({ok:false,version:VERSION,error:message},400);throw error}void rewardInspection;\n   if(d.id==="tide-reefback"''',
)
replace_once(
    match_actions,
    'if(ef.includes("looked at a reward card this match")&&p.match_flags?.looked_reward)bonus+=20;',
    'if(conditionalAddEvaluation==null&&ef.includes("looked at a reward card this match")&&p.match_flags?.looked_reward)bonus+=20;',
)


hidden_test = "supabase/functions/tcg-tactic-actions/runtime-v0-2-attack-conditional-add-hidden-information-authority-evaluation.test.ts"
replace_once(
    hidden_test,
    'Deno.test("Reward inspection remains outside Runtime-C ready authority", () => {',
    'Deno.test("Reward Arc accepts a canonical current-turn Reward inspection event", () => {',
)
replace_once(
    hidden_test,
    '''  assertEquals(\n    evaluateRuntimeAttackReadyConditionalAddFormula(\n      authority,\n      context([{ event: "reward_inspected", controller: "self" }]),\n    ),\n    null,\n  );\n});''',
    '''  const result = evaluateRuntimeAttackReadyConditionalAddFormula(\n    authority,\n    context([{ event: "reward_inspected", controller: "self" }]),\n  );\n  assertEquals(result?.damage, 80);\n  assertEquals(result?.terms[0].matched, true);\n  assertEquals(result?.terms[0].contribution, 20);\n});''',
)


direct_test = "tcg/tests/card-pass-2-runtime-conditional-add-direct-wiring.test.mjs"
replace_once(
    direct_test,
    '''  const preserved = [\n    'if(ef.includes("looked at a reward card this match")',\n    'if(ef.includes("essence is discarded from this creature during this turn")',\n  ];''',
    '''  const preserved = [\n    'if(ef.includes("essence is discarded from this creature during this turn")',\n  ];''',
)
replace_once(
    direct_test,
    '''  assert.ok(\n    source.includes('if(conditionalAddEvaluation==null&&ef.includes("looked at your deck this turn")'),\n    'Predicted Hit deck-view fallback must now be gated by structured conditional authority',\n  );''',
    '''  assert.ok(\n    source.includes('if(conditionalAddEvaluation==null&&ef.includes("looked at a reward card this match")'),\n    'Reward Arc legacy fallback must now be gated by structured conditional authority',\n  );\n  assert.ok(\n    source.includes('if(conditionalAddEvaluation==null&&ef.includes("looked at your deck this turn")'),\n    'Predicted Hit deck-view fallback must now be gated by structured conditional authority',\n  );''',
)


Path("supabase/functions/tcg-tactic-actions/runtime-v0-2-reward-inspection-ledger.test.ts").write_text(r'''import {
  runtimeV02CurrentTurnRewardInspections,
  runtimeV02PrivateRewardInspectionView,
  structuredRuntimeEvolutionRewardInspection,
} from "../_shared/tcg-match-reward-inspection-v0-2.ts";
import {
  evaluateRuntimeAttackReadyConditionalAddFormula,
  resolveRuntimeAttackAuthority,
} from "../_shared/tcg-match-attack-authority-v0-2.ts";
import { runtimeV02SnapshotMarker } from "../_shared/tcg-runtime-registry-v0-2.ts";

function assertEquals(actual: unknown, expected: unknown, message = "values differ") {
  if (!Object.is(actual, expected)) throw new Error(`${message}: expected ${String(expected)}, got ${String(actual)}`);
}

function assertJsonEquals(actual: unknown, expected: unknown, message = "JSON values differ") {
  const left = JSON.stringify(actual);
  const right = JSON.stringify(expected);
  if (left !== right) throw new Error(`${message}: expected ${right}, got ${left}`);
}

function assertThrows(fn: () => unknown, expected: string) {
  try {
    fn();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes(expected)) throw new Error(`expected ${expected}, got ${message}`);
    return;
  }
  throw new Error(`expected throw containing ${expected}`);
}

const source = { uid: "comettail-source", card_id: "astral-comettail" };

function comettailDefinition() {
  return {
    schema: "sb-tcg-card-v0.2",
    effect_schema: "sb-tcg-effects-v0.2",
    id: "astral-comettail",
    name: "Comettail",
    card_family: "Creature",
    element: "Astral",
    prestige: { starbound: { enabled: false } },
    creature: {
      ability: {
        id: "comet-survey",
        name: "Comet Survey",
        mode: "triggered",
        event: "creature_evolved",
        timing: "own_turn",
        limit: null,
        requirements: { all: [{ predicate: "source_is_self" }] },
        costs: [],
        steps: [{
          op: "INSPECT_ZONE",
          player: "self",
          zone: "rewards",
          selection: { min: 0, max: 2, filters: {}, distinct: true },
          visibility: "controller_private",
          return_policy: "same_position",
          as: "inspected_rewards",
        }],
      },
      attacks: [{
        id: "reward-arc",
        name: "Reward Arc",
        cost: [{ element: "Astral", amount: 3 }],
        base_damage: null,
        damage_formula: {
          base: 80,
          snapshot: "legal_declaration",
          terms: [{
            kind: "conditional_add",
            amount: 20,
            when: {
              predicate: "event_occurred",
              event: "reward_inspected",
              controller: "self",
              window: "current_turn",
              min_count: 1,
            },
          }],
        },
      }],
    },
  };
}

function rewardDefinition(id: string) {
  return {
    schema: "sb-tcg-card-v0.2",
    effect_schema: "sb-tcg-effects-v0.2",
    id,
    name: id,
    card_family: "Creature",
    prestige: { starbound: { enabled: false } },
    creature: { attacks: [] },
  };
}

function state() {
  const rewards = [
    { uid: "reward-a", card_id: "reward-a" },
    { uid: "reward-b", card_id: "reward-b" },
    { uid: "reward-c", card_id: "reward-c" },
  ];
  return {
    turn_seq: 7,
    runtime_registry_v0_2: runtimeV02SnapshotMarker(),
    players: {
      "1": { rewards, vanguard: { stack: [source], essence: [], relic: null }, reserve: [] },
      "2": { rewards: [], vanguard: null, reserve: [] },
    },
    card_index: {
      "astral-comettail": {
        card_id: "astral-comettail",
        definition: {
          id: "astral-comettail",
          attack_1: "3 Astral — Reward Arc — 80; if you looked at a Reward card this match, +20 damage",
        },
        definition_v0_2: comettailDefinition(),
        definition_v0_2_rules_version: "sb-tcg-card-v0.2",
      },
      "reward-a": { definition: { id: "reward-a" }, definition_v0_2: rewardDefinition("reward-a") },
      "reward-b": { definition: { id: "reward-b" }, definition_v0_2: rewardDefinition("reward-b") },
      "reward-c": { definition: { id: "reward-c" }, definition_v0_2: rewardDefinition("reward-c") },
    },
  } as Record<string, unknown>;
}

function legacy() {
  return {
    name: "Reward Arc",
    raw: "3 Astral — Reward Arc — 80; if you looked at a Reward card this match, +20 damage",
    typed: { Astral: 3 },
    any: 0,
    damage: 80,
    effect: "if you looked at a Reward card this match, +20 damage",
    starbound: false,
  };
}

function context() {
  return {
    source_conditions: [],
    target_conditions: [],
    source_became_vanguard_this_turn: false,
    self_reserve_count: 0,
    opponent_hand_count: 0,
    source_has_relic: false,
    current_turn_events: [],
    source_attached_essence_kinds: [],
  } as any;
}

Deno.test("Comet Survey inspects chosen Reward positions without moving Rewards or leaking identities into event history", () => {
  const s = state();
  const before = JSON.stringify((s.players as any)["1"].rewards);
  const result = structuredRuntimeEvolutionRewardInspection(s, source, 1, [0, 2]);
  assertJsonEquals(result, { inspected_count: 2, ability_id: "comet-survey" });
  assertEquals(JSON.stringify((s.players as any)["1"].rewards), before, "Reward zone must not move");
  assertJsonEquals(runtimeV02CurrentTurnRewardInspections(s, 1), [{ turn_seq: 7, controller_seat: 1 }]);
  const ledgerText = JSON.stringify((s as any).runtime_reward_inspections_v0_2);
  assertEquals(ledgerText.includes("reward-a"), false, "event ledger leaked Reward identity");
  assertEquals(ledgerText.includes("reward-c"), false, "event ledger leaked Reward identity");
});

Deno.test("private Reward inspection is visible only to its controller", () => {
  const s = state();
  structuredRuntimeEvolutionRewardInspection(s, source, 1, [1]);
  assertJsonEquals(runtimeV02PrivateRewardInspectionView(s, 1), {
    turn_seq: 7,
    controller_seat: 1,
    cards: [{ position: 1, uid: "reward-b", card_id: "reward-b" }],
  });
  assertEquals(runtimeV02PrivateRewardInspectionView(s, 2), null);
});

Deno.test("zero-card optional Comet Survey does not fabricate reward_inspected", () => {
  const s = state();
  assertJsonEquals(structuredRuntimeEvolutionRewardInspection(s, source, 1, []), {
    inspected_count: 0,
    ability_id: "comet-survey",
  });
  assertJsonEquals(runtimeV02CurrentTurnRewardInspections(s, 1), []);
  assertEquals(runtimeV02PrivateRewardInspectionView(s, 1), null);
});

Deno.test("Reward inspection validates unique in-range positions and frozen selection count", () => {
  assertThrows(() => structuredRuntimeEvolutionRewardInspection(state(), source, 1, [0, 0]), "positions_duplicate");
  assertThrows(() => structuredRuntimeEvolutionRewardInspection(state(), source, 1, [9]), "position_out_of_range");
  assertThrows(() => structuredRuntimeEvolutionRewardInspection(state(), source, 1, [0, 1, 2]), "count_invalid");
});

Deno.test("Reward Arc snapshots canonical current-turn Reward inspection and reaches 100", () => {
  const s = state();
  structuredRuntimeEvolutionRewardInspection(s, source, 1, [0]);
  const authority = resolveRuntimeAttackAuthority(s, source, 1, legacy());
  if (!authority) throw new Error("Reward Arc authority required");
  const evaluation = evaluateRuntimeAttackReadyConditionalAddFormula(authority, context());
  assertEquals(evaluation?.damage, 100);
  assertEquals(evaluation?.terms[0].matched, true);
  assertEquals(evaluation?.terms[0].contribution, 20);
});

Deno.test("Reward Arc remains 80 when Comet Survey inspects zero cards", () => {
  const s = state();
  structuredRuntimeEvolutionRewardInspection(s, source, 1, []);
  const authority = resolveRuntimeAttackAuthority(s, source, 1, legacy());
  if (!authority) throw new Error("Reward Arc authority required");
  const evaluation = evaluateRuntimeAttackReadyConditionalAddFormula(authority, context());
  assertEquals(evaluation?.damage, 80);
  assertEquals(evaluation?.terms[0].matched, false);
});

Deno.test("Reward inspection is current-turn and seat isolated", () => {
  const s = state();
  structuredRuntimeEvolutionRewardInspection(s, source, 1, [0]);
  assertEquals(runtimeV02CurrentTurnRewardInspections(s, 1).length, 1);
  assertEquals(runtimeV02CurrentTurnRewardInspections(s, 2).length, 0);
  s.turn_seq = 8;
  assertJsonEquals(runtimeV02CurrentTurnRewardInspections(s, 1), []);
  assertEquals(runtimeV02PrivateRewardInspectionView(s, 1), null);
});
''')


Path("tcg/tests/card-pass-2-runtime-reward-inspection-wiring.test.mjs").write_text(r'''import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const matchSource = fs.readFileSync('supabase/functions/tcg-match-actions/index.ts', 'utf8');
const authoritySource = fs.readFileSync('supabase/functions/_shared/tcg-match-attack-authority-v0-2.ts', 'utf8');
const rewardSource = fs.readFileSync('supabase/functions/_shared/tcg-match-reward-inspection-v0-2.ts', 'utf8');

function viewSlice() {
  const from = matchSource.indexOf('function makeView');
  const to = matchSource.indexOf('function views', from + 1);
  assert.notEqual(from, -1, 'match makeView missing');
  assert.notEqual(to, -1, 'match views boundary missing');
  return matchSource.slice(from, to);
}

test('evolution path delegates private Reward inspection to the structured runtime owner', () => {
  assert.ok(
    matchSource.includes('structuredRuntimeEvolutionRewardInspection(s,x,seat as 1|2,body.inspect_reward_positions)'),
    'evolve action must delegate Reward inspection to the structured helper',
  );
  assert.ok(rewardSource.includes('ability.event !== "creature_evolved"'), 'helper must be bound to creature_evolved');
  assert.ok(rewardSource.includes('step?.op === "INSPECT_ZONE" && step.zone === "rewards"'), 'helper must require Reward INSPECT_ZONE');
  assert.ok(rewardSource.includes('step.visibility !== "controller_private"'), 'helper must require controller-private visibility');
  assert.ok(rewardSource.includes('step.return_policy !== "same_position"'), 'helper must leave Rewards in place');
});

test('Reward identities are exposed only through the controller-private player view', () => {
  const view = viewSlice();
  assert.ok(view.includes('private_reward_inspection:runtimeV02PrivateRewardInspectionView(s,viewerSeat as 1|2)'), 'private Reward view adapter missing');
  assert.equal(view.includes('runtime_reward_inspections_v0_2'), false, 'event ledger key leaked into player view');
  assert.ok(rewardSource.includes('view.controller_seat !== seat(viewerSeat)'), 'private view must be viewer-bound');
});

test('Reward Arc authority consumes only the canonical current-turn inspection ledger', () => {
  assert.ok(authoritySource.includes('runtimeV02CurrentTurnRewardInspections'), 'Reward inspection ledger reader missing');
  assert.ok(authoritySource.includes('predicate.event === "reward_inspected"'), 'Reward Arc ready predicate missing');
  assert.ok(authoritySource.includes('predicate.window === "current_turn"'), 'Reward Arc current-turn window missing');
  assert.ok(authoritySource.includes('predicate.min_count === 1'), 'Reward Arc minimum event count missing');
  assert.ok(
    matchSource.includes('if(conditionalAddEvaluation==null&&ef.includes("looked at a reward card this match")'),
    'legacy Reward Arc fallback must be suppressed whenever structured authority evaluates',
  );
});
''')
