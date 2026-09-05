import { createClient } from "jsr:@supabase/supabase-js@2";

const VERSION = "Stream Bandit TCG tactic actions v0.1";
const EFFECT_SCHEMA = "sb-tcg-effects-v0.1";
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...cors, "Content-Type": "application/json", "Cache-Control": "no-store" },
});
const env = (name: string) => Deno.env.get(name) || "";
function firstKey(raw: string) {
  if (!raw) return "";
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === "string") return parsed;
    const values = Array.isArray(parsed) ? parsed : Object.values(parsed || {});
    for (const value of values) {
      if (typeof value === "string") return value;
      if (value && typeof value === "object") {
        const item = value as Record<string, unknown>;
        for (const key of ["value", "key", "secret", "api_key"]) {
          if (typeof item[key] === "string") return item[key] as string;
        }
      }
    }
  } catch {
    return raw;
  }
  return "";
}
const need = (name: string, value: string) => {
  if (!value) throw new Error(`Missing ${name}`);
  return value;
};

type Inst = { uid: string; card_id: string; attached_turn?: number; borrowed?: boolean; effect_flags?: Record<string, unknown> };
type Cr = {
  stack: Inst[];
  essence: Inst[];
  relic: Inst | null;
  damage: number;
  shield: number;
  condition?: string | null;
  conditions?: Record<string, unknown>;
  flags?: Record<string, unknown>;
  entered_turn?: number;
  evolved_turn?: number;
  became_vanguard_turn?: number;
};
type CreatureRef = { kind: "creature"; seat: number; anchor_uid: string };
type EffectState = {
  id: string;
  owner_seat: number;
  source_card: Inst;
  source_name: string;
  source_card_id: string;
  source_subtype: string;
  discard_after_resolve: boolean;
  steps: any[];
  cursor: number;
  vars: Record<string, unknown>;
};
type ChoiceOption = { id: string; label: string; data: any };
type PendingChoice = {
  id: string;
  effect_id: string;
  seat: number;
  kind: string;
  prompt: string;
  min: number;
  max: number;
  mode: "select" | "order";
  options: ChoiceOption[];
  context: Record<string, unknown>;
};

function definition(state: any, instOrId: any) {
  const id = typeof instOrId === "string" ? instOrId : instOrId?.card_id;
  return state.card_index?.[id]?.definition || state.card_index?.[id] || null;
}
function cardName(state: any, inst: Inst) {
  return String(definition(state, inst)?.name || state.card_index?.[inst.card_id]?.name || inst.card_id);
}
function allCreatures(player: any) {
  const out: { where: "vanguard" | "reserve"; index: number | null; cr: Cr }[] = [];
  if (player.vanguard) out.push({ where: "vanguard", index: null, cr: player.vanguard });
  for (let i = 0; i < 4; i++) if (player.reserve?.[i]) out.push({ where: "reserve", index: i, cr: player.reserve[i] });
  return out;
}
function topInst(cr: Cr | null) {
  return cr?.stack?.length ? cr.stack[cr.stack.length - 1] : null;
}
function topDef(cr: Cr | null, state: any) {
  const inst = topInst(cr);
  return inst ? definition(state, inst) : null;
}
function creatureRef(cr: Cr, seat: number): CreatureRef {
  const inst = topInst(cr);
  if (!inst) throw new Error("creature_without_top_card");
  return { kind: "creature", seat, anchor_uid: inst.uid };
}
function findCreature(state: any, ref: CreatureRef | null | undefined) {
  if (!ref || ref.kind !== "creature") return null;
  const player = state.players?.[String(ref.seat)];
  if (!player) return null;
  for (const item of allCreatures(player)) {
    if ((item.cr.stack || []).some((inst: Inst) => inst.uid === ref.anchor_uid)) return { ...item, seat: ref.seat, player };
  }
  return null;
}
function conditions(cr: Cr) {
  return (cr.conditions ||= { scorched: false, venomed: 0, control: null, modifier: null }) as any;
}
function hasCondition(cr: Cr, condition?: string) {
  const q = conditions(cr);
  if (condition === "Scorched") return !!q.scorched;
  if (condition === "Venomed") return Number(q.venomed || 0) > 0;
  if (condition) return q.control === condition || q.modifier === condition;
  return !!q.scorched || Number(q.venomed || 0) > 0 || !!q.control || !!q.modifier;
}
function activeConditions(cr: Cr) {
  const q = conditions(cr);
  const out: string[] = [];
  if (q.scorched) out.push("Scorched");
  if (Number(q.venomed || 0) > 0) out.push("Venomed");
  if (q.control) out.push(String(q.control));
  if (q.modifier) out.push(String(q.modifier));
  return out;
}
function clearCondition(cr: Cr, condition: string) {
  const q = conditions(cr);
  if (condition === "Scorched") q.scorched = false;
  else if (condition === "Venomed") q.venomed = 0;
  else if (q.control === condition) q.control = null;
  else if (q.modifier === condition) q.modifier = null;
}
function clearOrdinaryConditions(cr: Cr) {
  cr.conditions = { scorched: false, venomed: 0, control: null, modifier: null };
  cr.condition = null;
}
function addShield(cr: Cr, amount: number) {
  cr.shield = Math.min(60, Math.max(0, Number(cr.shield || 0) + Math.max(0, amount)));
}
function heal(cr: Cr, amount: number) {
  cr.damage = Math.max(0, Number(cr.damage || 0) - Math.max(0, amount));
}
function removeByUid(zone: Inst[], uid: string) {
  const index = zone.findIndex((inst) => inst.uid === uid);
  return index >= 0 ? zone.splice(index, 1)[0] : null;
}
function shuffle<T>(values: T[]) {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i--) {
    const random = new Uint32Array(1);
    crypto.getRandomValues(random);
    const j = random[0] % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
function countRange(raw: any) {
  if (typeof raw === "number") return { min: raw, max: raw };
  return { min: Math.max(0, Number(raw?.min || 0)), max: Math.max(0, Number(raw?.max || 0)) };
}
function playerSeat(ownerSeat: number, token: unknown, vars: Record<string, unknown>) {
  const resolved = typeof token === "string" && token.startsWith("$") ? vars[token.slice(1)] : token;
  if (resolved === "self" || resolved == null) return ownerSeat;
  if (resolved === "opponent") return ownerSeat === 1 ? 2 : 1;
  if (typeof resolved === "number" && [1, 2].includes(resolved)) return resolved;
  if (typeof resolved === "string" && ["1", "2"].includes(resolved)) return Number(resolved);
  throw new Error("effect_player_reference_invalid");
}
function resolveVar(vars: Record<string, unknown>, token: unknown) {
  return typeof token === "string" && token.startsWith("$") ? vars[token.slice(1)] : token;
}
function reserveCount(player: any) {
  return (player.reserve || []).filter(Boolean).length;
}
function inPlayTopCardIds(state: any, seat: number) {
  const player = state.players[String(seat)];
  return new Set(allCreatures(player).map((item) => topInst(item.cr)?.card_id).filter(Boolean));
}
function matchesCardFilters(state: any, inst: Inst, filters: any, ownerSeat: number) {
  if (!filters || typeof filters !== "object") return true;
  const d = definition(state, inst) || {};
  if (filters.any_of && !filters.any_of.some((branch: any) => matchesCardFilters(state, inst, branch, ownerSeat))) return false;
  if (filters.element && String(d.element || "") !== String(filters.element)) return false;
  if (filters.card_family && String(d.card_family || d.kind || "") !== String(filters.card_family)) return false;
  if (filters.tactic_subtype) {
    const allowed = Array.isArray(filters.tactic_subtype) ? filters.tactic_subtype : [filters.tactic_subtype];
    if (!allowed.includes(d.tactic_subtype || d.family || d.recipe_type)) return false;
  }
  if (filters.essence_subtype && String(d.essence_subtype || d.subtype || "") !== String(filters.essence_subtype)) return false;
  if (filters.creature_stage) {
    const allowed = Array.isArray(filters.creature_stage) ? filters.creature_stage : [filters.creature_stage];
    if (!allowed.includes(d.creature_stage || d.stage)) return false;
  }
  if (filters.printed_withdrawal_cost) {
    const n = Number(d.withdraw);
    if (Number.isFinite(Number(filters.printed_withdrawal_cost.max)) && n > Number(filters.printed_withdrawal_cost.max)) return false;
    if (Number.isFinite(Number(filters.printed_withdrawal_cost.min)) && n < Number(filters.printed_withdrawal_cost.min)) return false;
  }
  if (filters.must_evolve_from_in_play) {
    const evolvesFromId = String(d.evolves_from_id || "");
    if (!evolvesFromId || !inPlayTopCardIds(state, ownerSeat).has(evolvesFromId)) return false;
  }
  return true;
}
function matchesCreatureFilters(state: any, item: { cr: Cr }, filters: any) {
  if (!filters || typeof filters !== "object") return true;
  const d = topDef(item.cr, state) || {};
  if (filters.element && String(d.element || "") !== String(filters.element)) return false;
  if (filters.damaged === true && Number(item.cr.damage || 0) <= 0) return false;
  if (Array.isArray(filters.has_any_condition) && !filters.has_any_condition.some((c: string) => hasCondition(item.cr, c))) return false;
  return true;
}
function creatureOptions(state: any, ownerSeat: number, controller: unknown, zone: unknown, filters: any) {
  const seat = playerSeat(ownerSeat, controller || "self", {});
  const player = state.players[String(seat)];
  const out: ChoiceOption[] = [];
  for (const item of allCreatures(player)) {
    if (zone === "reserve" && item.where !== "reserve") continue;
    if (zone === "vanguard" && item.where !== "vanguard") continue;
    if (!matchesCreatureFilters(state, item, filters)) continue;
    const ref = creatureRef(item.cr, seat);
    const d = topDef(item.cr, state) || {};
    out.push({ id: `creature:${seat}:${ref.anchor_uid}`, label: String(d.name || "Creature"), data: ref });
  }
  return out;
}
function cardOptions(state: any, cards: Inst[], filters: any, ownerSeat: number) {
  return cards.filter((inst) => matchesCardFilters(state, inst, filters, ownerSeat)).map((inst) => ({
    id: `card:${inst.uid}`,
    label: cardName(state, inst),
    data: { uid: inst.uid, card_id: inst.card_id },
  }));
}
function unsupportedOps(steps: any[]): string[] {
  const unsupported = new Set<string>();
  const walk = (items: any[]) => {
    for (const step of items || []) {
      const op = String(step?.op || "");
      if (["ADD_ATTACK_DAMAGE_MODIFIER", "ADD_CONDITION_IMMUNITY", "SET_ATTACK_ELIGIBILITY", "SET_WITHDRAWAL_COST"].includes(op)) unsupported.add(op);
      if (op === "ATTACH_ESSENCE_FROM_ZONE" && step?.flags?.discard_during_target_aftermath) unsupported.add("ATTACH_ESSENCE_FROM_ZONE_AFTER_MATH_EXPIRY");
      if (Array.isArray(step?.steps)) walk(step.steps);
      if (Array.isArray(step?.then)) walk(step.then);
      if (Array.isArray(step?.else)) walk(step.else);
    }
  };
  walk(steps);
  return [...unsupported];
}
function publicField(player: any) {
  return {
    vanguard: player.vanguard,
    reserve: player.reserve,
    discard_count: player.discard.length,
    void_count: player.void.length,
    rewards_count: player.rewards.length,
    deck_count: player.deck.length,
    hand_count: player.hand.length,
  };
}
function choiceView(choice: PendingChoice | null, viewerSeat: number) {
  if (!choice) return null;
  if (Number(choice.seat) !== viewerSeat) return { id: choice.id, seat: choice.seat, kind: choice.kind, waiting: true };
  return {
    id: choice.id,
    seat: choice.seat,
    kind: choice.kind,
    prompt: choice.prompt,
    min: choice.min,
    max: choice.max,
    mode: choice.mode,
    options: choice.options.map((option) => ({ id: option.id, label: option.label })),
  };
}
function makeView(state: any, viewerSeat: number, revision: number) {
  const own = state.players[String(viewerSeat)];
  const opp = state.players[String(viewerSeat === 1 ? 2 : 1)];
  return {
    version: state.version,
    match_id: state.match_id,
    revision,
    phase: state.phase,
    toss_winner_seat: state.toss_winner_seat,
    first_player_seat: state.first_player_seat,
    setup_turn_seat: state.setup_turn_seat,
    active_seat: state.active_seat,
    turn_seq: state.turn_seq,
    personal_turns: state.personal_turns,
    setup_ready: state.setup_ready,
    realm: state.realm,
    turn_flags: state.turn_flags || {},
    pending_resolution: state.pending_resolutions?.[0] ? {
      kind: state.pending_resolutions[0].kind,
      seat: state.pending_resolutions[0].seat,
      count: state.pending_resolutions[0].count || null,
    } : null,
    pending_choice: choiceView(state.pending_choice || null, viewerSeat),
    result: state.result || null,
    log: (state.log || []).slice(-20),
    you: {
      seat: viewerSeat,
      user_id: own.user_id,
      hand: own.hand,
      deck_count: own.deck.length,
      rewards_count: own.rewards.length,
      vanguard: own.vanguard,
      reserve: own.reserve,
      discard: own.discard,
      void_count: own.void.length,
      mulligans: own.mulligans,
      deck_meta: own.deck_meta,
    },
    opponent: {
      seat: opp.seat,
      user_id: opp.user_id,
      ...publicField(opp),
      mulligans: opp.mulligans,
      deck_meta: { name: opp.deck_meta.name, primary_element: opp.deck_meta.primary_element },
    },
    card_index: state.card_index,
  };
}
function views(state: any, revision: number) {
  return { p1: makeView(state, 1, revision), p2: makeView(state, 2, revision) };
}
function evaluateWinner(state: any) {
  const reasons: Record<string, string[]> = { "1": [], "2": [] };
  for (const who of [1, 2]) {
    const me = state.players[String(who)];
    const them = state.players[String(who === 1 ? 2 : 1)];
    if ((me.rewards?.length || 0) === 0) reasons[String(who)].push("all_rewards_taken");
    if (!them.vanguard && !(them.reserve || []).some(Boolean)) reasons[String(who)].push("opponent_has_no_creature");
    if (Number(state.deckout_loser || 0) === (who === 1 ? 2 : 1)) reasons[String(who)].push("opponent_deckout");
  }
  const one = reasons["1"].length;
  const two = reasons["2"].length;
  if (one === 0 && two === 0) return false;
  if (one > two) state.result = { winner_seat: 1, reasons: reasons["1"], reason: reasons["1"][0] || "complete" };
  else if (two > one) state.result = { winner_seat: 2, reasons: reasons["2"], reason: reasons["2"][0] || "complete" };
  else {
    state.phase = "overtime_pending";
    state.result = { winner_seat: null, reasons, reason: "simultaneous_win_tie_requires_overtime" };
    return true;
  }
  state.phase = "complete";
  return true;
}
function setPending(state: any, effect: EffectState, pending: Omit<PendingChoice, "id" | "effect_id">) {
  state.pending_choice = { ...pending, id: crypto.randomUUID(), effect_id: effect.id } satisfies PendingChoice;
}
function selectChoiceOptions(pending: PendingChoice, ids: string[]) {
  if (!Array.isArray(ids) || new Set(ids).size !== ids.length) throw new Error("choice_ids_must_be_unique");
  if (ids.length < pending.min || ids.length > pending.max) throw new Error("choice_count_out_of_range");
  const byId = new Map(pending.options.map((option) => [option.id, option]));
  const selected = ids.map((id) => byId.get(id));
  if (selected.some((option) => !option)) throw new Error("choice_contains_unknown_option");
  if (pending.mode === "order" && (ids.length !== pending.options.length || ids.length !== pending.max)) throw new Error("order_requires_every_option_exactly_once");
  return selected as ChoiceOption[];
}
function moveCardsToDestination(state: any, seat: number, cards: Inst[], destination: string) {
  const player = state.players[String(seat)];
  if (destination === "hand") player.hand.push(...cards);
  else if (destination === "discard") player.discard.push(...cards);
  else if (destination === "deck_bottom") player.deck.push(...cards);
  else if (destination === "deck_top") player.deck.unshift(...cards);
  else throw new Error(`unsupported_card_destination:${destination}`);
}
function switchWithVanguard(state: any, ref: CreatureRef) {
  const found = findCreature(state, ref);
  if (!found) throw new Error("switch_target_missing");
  if (found.where === "vanguard") return { oldVanguard: ref, newVanguard: ref };
  const player = found.player;
  const old = player.vanguard as Cr | null;
  const oldRef = old ? creatureRef(old, ref.seat) : null;
  player.vanguard = found.cr;
  player.reserve[Number(found.index)] = old;
  if (old) clearOrdinaryConditions(old);
  clearOrdinaryConditions(player.vanguard);
  player.vanguard.became_vanguard_turn = Number(state.turn_seq || 0);
  return { oldVanguard: oldRef, newVanguard: creatureRef(player.vanguard, ref.seat) };
}
function firstRequiredCreatureTargetAvailable(state: any, ownerSeat: number, steps: any[]) {
  const first = (steps || []).find((step: any) => String(step?.op || "") !== "");
  if (!first || first.op !== "SELECT_CREATURE") return true;
  const range = countRange(first.count);
  if (range.min <= 0) return true;
  return creatureOptions(state, ownerSeat, first.controller || "self", first.zone, first.filters).length >= range.min;
}
function checkPlayRequirements(state: any, ownerSeat: number, requirements: any[]) {
  for (const requirement of requirements || []) {
    if (requirement?.op === "RESERVE_COUNT_AT_LEAST") {
      const seat = playerSeat(ownerSeat, requirement.player || "self", {});
      if (reserveCount(state.players[String(seat)]) < Number(requirement.count || 0)) return false;
    } else return false;
  }
  return true;
}
function log(state: any, message: string) {
  state.log ||= [];
  state.log.push(message);
}

function executeUntilChoice(state: any) {
  const effect = state.effect_resolution as EffectState;
  if (!effect) throw new Error("effect_resolution_missing");
  let guard = 0;
  while (!state.pending_choice && effect.cursor < effect.steps.length) {
    if (++guard > 200) throw new Error("effect_resolution_guard");
    const step = effect.steps[effect.cursor] || {};
    const op = String(step.op || "");
    const ownerSeat = effect.owner_seat;
    const vars = effect.vars;

    if (op === "DRAW" || op === "DRAW_FIXED") {
      const seat = playerSeat(ownerSeat, step.player || "self", vars);
      const player = state.players[String(seat)];
      const count = Math.max(0, Number(step.count || 0));
      const available = Math.min(count, player.deck.length);
      player.hand.push(...player.deck.splice(0, available));
      if (op === "DRAW_FIXED" && step.deckout_on_incomplete && available < count) state.deckout_loser = seat;
      effect.cursor++;
      continue;
    }
    if (op === "DISCARD_HAND") {
      const seat = playerSeat(ownerSeat, step.player || "self", vars);
      const player = state.players[String(seat)];
      player.discard.push(...player.hand.splice(0));
      effect.cursor++;
      continue;
    }
    if (op === "LOOK_TOP") {
      const seat = playerSeat(ownerSeat, step.player || "self", vars);
      const player = state.players[String(seat)];
      const count = Math.min(Math.max(0, Number(step.count || 0)), player.deck.length);
      vars[String(step.as || "looked")] = player.deck.splice(0, count);
      effect.cursor++;
      continue;
    }
    if (op === "SELECT_CREATURE") {
      const range = countRange(step.count);
      const options = creatureOptions(state, ownerSeat, step.controller || "self", step.zone, step.filters);
      const min = Math.min(range.min, options.length);
      const max = Math.min(range.max, options.length);
      setPending(state, effect, {
        seat: ownerSeat,
        kind: "select_creature",
        prompt: "Choose creature",
        min,
        max,
        mode: "select",
        options,
        context: { apply: "set_var", var_name: String(step.as || "target"), many: max !== 1 },
      });
      return;
    }
    if (op === "CHOOSE_FROM_SET") {
      const source = (resolveVar(vars, step.source) || []) as Inst[];
      const range = countRange(step.count);
      const options = cardOptions(state, source, step.filters, ownerSeat);
      setPending(state, effect, {
        seat: ownerSeat,
        kind: "choose_cards",
        prompt: "Choose card",
        min: Math.min(range.min, options.length),
        max: Math.min(range.max, options.length),
        mode: "select",
        options,
        context: { apply: "set_var_cards", var_name: String(step.as || "chosen") },
      });
      return;
    }
    if (op === "CHOOSE_HAND_TO_DISCARD" || op === "CHOOSE_HAND_TO_DECK_BOTTOM") {
      const seat = playerSeat(ownerSeat, step.player || "self", vars);
      const player = state.players[String(seat)];
      const range = countRange(step.count);
      const options = cardOptions(state, player.hand, null, ownerSeat);
      setPending(state, effect, {
        seat,
        kind: op === "CHOOSE_HAND_TO_DISCARD" ? "discard_from_hand" : "put_hand_on_deck_bottom",
        prompt: op === "CHOOSE_HAND_TO_DISCARD" ? "Choose card to discard" : "Choose card for deck bottom",
        min: Math.min(range.min, options.length),
        max: Math.min(range.max, options.length),
        mode: "select",
        options,
        context: { apply: op === "CHOOSE_HAND_TO_DISCARD" ? "hand_to_discard" : "hand_to_bottom", zone_seat: seat },
      });
      return;
    }
    if (op === "SEARCH_DECK") {
      const seat = playerSeat(ownerSeat, step.player || "self", vars);
      const player = state.players[String(seat)];
      const range = countRange(step.selection);
      const options = cardOptions(state, player.deck, step.selection?.filters, ownerSeat);
      setPending(state, effect, {
        seat: ownerSeat,
        kind: "search_deck",
        prompt: "Search deck",
        min: Math.min(range.min, options.length),
        max: Math.min(range.max, options.length),
        mode: "select",
        options,
        context: { apply: "search_deck", zone_seat: seat, destination: String(step.destination || "hand"), reveal: step.reveal || null },
      });
      return;
    }
    if (op === "SEARCH_DECK_GROUP") {
      const generated = (step.selections || []).map((selection: any) => ({
        op: "SEARCH_DECK",
        player: step.player || "self",
        reveal: step.reveal,
        selection,
        destination: step.destination || "hand",
      }));
      effect.steps.splice(effect.cursor, 1, ...generated);
      continue;
    }
    if (op === "SHUFFLE_DECK") {
      const seat = playerSeat(ownerSeat, step.player || "self", vars);
      const player = state.players[String(seat)];
      player.deck = shuffle(player.deck);
      effect.cursor++;
      continue;
    }
    if (op === "MOVE_CARDS" && step.selection && step.from) {
      const seat = playerSeat(ownerSeat, step.player || "self", vars);
      const player = state.players[String(seat)];
      const zone = String(step.from) === "discard" ? player.discard : null;
      if (!zone) throw new Error(`unsupported_move_source:${step.from}`);
      const range = countRange(step.selection);
      const options = cardOptions(state, zone, step.selection.filters, ownerSeat);
      setPending(state, effect, {
        seat: ownerSeat,
        kind: "choose_zone_cards",
        prompt: "Choose cards",
        min: Math.min(range.min, options.length),
        max: Math.min(range.max, options.length),
        mode: "select",
        options,
        context: { apply: "move_from_zone", zone_seat: seat, from: step.from, destination: String(step.to || "hand") },
      });
      return;
    }
    if (op === "MOVE_CARDS") {
      const cards = (resolveVar(vars, step.cards) || []) as Inst[];
      const seat = step.owner ? playerSeat(ownerSeat, step.owner, vars) : ownerSeat;
      moveCardsToDestination(state, seat, cards, String(step.to || "hand"));
      effect.cursor++;
      continue;
    }
    if (op === "PUT_REMAINDER_ON_DECK_BOTTOM" || op === "RETURN_REMAINDER_TO_DECK_TOP" || op === "RETURN_SET_TO_DECK_TOP") {
      const sourceToken = step.source || step.cards;
      const source = ((resolveVar(vars, sourceToken) || []) as Inst[]).slice();
      const except = new Set((((resolveVar(vars, step.except) || []) as Inst[]).map((inst) => inst.uid)));
      const cards = source.filter((inst) => !except.has(inst.uid));
      const seat = step.player ? playerSeat(ownerSeat, step.player, vars) : ownerSeat;
      const destination = op === "PUT_REMAINDER_ON_DECK_BOTTOM" ? "deck_bottom" : "deck_top";
      if (cards.length <= 1 || !String(step.order || "").includes("choice")) {
        moveCardsToDestination(state, seat, cards, destination);
        effect.cursor++;
        continue;
      }
      const options = cardOptions(state, cards, null, ownerSeat);
      setPending(state, effect, {
        seat: ownerSeat,
        kind: destination === "deck_top" ? "order_deck_top" : "order_deck_bottom",
        prompt: "Choose card order",
        min: options.length,
        max: options.length,
        mode: "order",
        options,
        context: { apply: "ordered_move", zone_seat: seat, destination },
      });
      return;
    }
    if (op === "HEAL" || op === "ADD_SHIELD" || op === "CLEAR_CONDITION_IF_PRESENT" || op === "CLEAR_CONDITION") {
      const ref = resolveVar(vars, step.target) as CreatureRef;
      const found = findCreature(state, ref);
      if (found) {
        if (op === "HEAL") heal(found.cr, Number(step.amount || 0));
        else if (op === "ADD_SHIELD") addShield(found.cr, Number(step.amount || 0));
        else clearCondition(found.cr, String(step.condition || ""));
      }
      effect.cursor++;
      continue;
    }
    if (op === "HEAL_EACH") {
      const refs = (resolveVar(vars, step.targets) || []) as CreatureRef[];
      for (const ref of refs) {
        const found = findCreature(state, ref);
        if (found) heal(found.cr, Number(step.amount || 0));
      }
      effect.cursor++;
      continue;
    }
    if (op === "CHOOSE_AND_CLEAR_CONDITION") {
      const ref = resolveVar(vars, step.target) as CreatureRef;
      const found = findCreature(state, ref);
      const range = countRange(step.count);
      if (!found) {
        effect.cursor++;
        continue;
      }
      let allowed = activeConditions(found.cr);
      if (Array.isArray(step.allowed)) allowed = allowed.filter((condition) => step.allowed.includes(condition));
      if (step.condition_slot === "control") allowed = allowed.filter((condition) => conditions(found.cr).control === condition);
      const options = allowed.map((condition) => ({ id: `condition:${condition}`, label: condition, data: { condition } }));
      setPending(state, effect, {
        seat: ownerSeat,
        kind: "clear_condition",
        prompt: "Choose condition to clear",
        min: Math.min(range.min, options.length),
        max: Math.min(range.max, options.length),
        mode: "select",
        options,
        context: { apply: "clear_condition", target: ref },
      });
      return;
    }
    if (op === "SWITCH_WITH_VANGUARD") {
      const target = resolveVar(vars, step.target) as CreatureRef;
      const result = switchWithVanguard(state, target);
      if (step.as_moved_to_reserve && result.oldVanguard) vars[String(step.as_moved_to_reserve)] = result.oldVanguard;
      if (step.as_moved_to_vanguard && result.newVanguard) vars[String(step.as_moved_to_vanguard)] = result.newVanguard;
      effect.cursor++;
      continue;
    }
    if (op === "CHOOSE_PLAYER") {
      const options: ChoiceOption[] = [];
      for (const allowed of step.allowed || ["self", "opponent"]) {
        const candidateSeat = playerSeat(ownerSeat, allowed, vars);
        const next = effect.steps[effect.cursor + 1];
        if (next?.op === "PROMPT_CHOSEN_PLAYER_TO_SELECT_RESERVE" && reserveCount(state.players[String(candidateSeat)]) < 1) continue;
        options.push({ id: `player:${allowed}`, label: allowed === "self" ? "You" : "Opponent", data: { player: allowed } });
      }
      setPending(state, effect, {
        seat: ownerSeat,
        kind: "choose_player",
        prompt: "Choose player",
        min: options.length ? 1 : 0,
        max: options.length ? 1 : 0,
        mode: "select",
        options,
        context: { apply: "set_var_player", var_name: String(step.as || "chosen_player") },
      });
      return;
    }
    if (op === "PROMPT_CHOSEN_PLAYER_TO_SELECT_RESERVE") {
      const chooserSeat = playerSeat(ownerSeat, step.player, vars);
      const range = countRange(step.count);
      const options = creatureOptions(state, ownerSeat, chooserSeat, "reserve", null);
      setPending(state, effect, {
        seat: chooserSeat,
        kind: "select_reserve",
        prompt: "Choose Reserve creature",
        min: Math.min(range.min, options.length),
        max: Math.min(range.max, options.length),
        mode: "select",
        options,
        context: { apply: "set_var", var_name: String(step.as || "target"), many: false },
      });
      return;
    }
    if (op === "MOVE_ATTACHED_ESSENCE") {
      const range = countRange(step.count);
      const player = state.players[String(ownerSeat)];
      const creatures = allCreatures(player).filter((item) => String(topDef(item.cr, state)?.element || "") === String(step.filters?.element || topDef(item.cr, state)?.element || ""));
      const options: ChoiceOption[] = [];
      for (const source of creatures) {
        for (const essence of source.cr.essence || []) {
          if (step.filters?.element && String(definition(state, essence)?.element || "") !== String(step.filters.element)) continue;
          for (const destination of creatures) {
            if (!step.allow_same_destination && source.cr === destination.cr) continue;
            const sourceRef = creatureRef(source.cr, ownerSeat);
            const destRef = creatureRef(destination.cr, ownerSeat);
            options.push({
              id: `move:${essence.uid}:${destRef.anchor_uid}`,
              label: `${cardName(state, essence)} to ${String(topDef(destination.cr, state)?.name || "Creature")}`,
              data: { essence_uid: essence.uid, source: sourceRef, destination: destRef },
            });
          }
        }
      }
      setPending(state, effect, {
        seat: ownerSeat,
        kind: "move_attached_essence",
        prompt: "Choose Essence moves",
        min: Math.min(range.min, options.length),
        max: Math.min(range.max, options.length),
        mode: "select",
        options,
        context: { apply: "move_attached_essence" },
      });
      return;
    }
    if (op === "REPEAT_OPTIONAL") {
      const min = Math.max(0, Number(step.min || 0));
      const max = Math.max(min, Number(step.max || 0));
      const options = Array.from({ length: max - min + 1 }, (_, i) => {
        const n = min + i;
        return { id: `repeat:${n}`, label: String(n), data: { count: n } };
      });
      setPending(state, effect, {
        seat: ownerSeat,
        kind: "repeat_count",
        prompt: "Choose repetitions",
        min: 1,
        max: 1,
        mode: "select",
        options,
        context: { apply: "repeat_optional", repeated_steps: step.steps || [] },
      });
      return;
    }
    if (op === "IF_CONDITION") {
      const ref = resolveVar(vars, step.target) as CreatureRef;
      const found = findCreature(state, ref);
      const branch = found && hasCondition(found.cr, String(step.condition || "")) ? step.then : step.else;
      effect.steps.splice(effect.cursor, 1, ...(branch || []));
      continue;
    }
    if (op === "IF_VANGUARD_PRINTED_HP_AT_LEAST") {
      const targetSeat = playerSeat(ownerSeat, step.player || "self", vars);
      const hp = Number(topDef(state.players[String(targetSeat)].vanguard, state)?.hp || 0);
      const branch = hp >= Number(step.amount || 0) ? step.then : [];
      effect.steps.splice(effect.cursor, 1, ...(branch || []));
      continue;
    }
    if (op === "CHECK_DECKOUT_AFTER_RESOLUTION") {
      effect.cursor++;
      evaluateWinner(state);
      if (state.phase === "complete" || state.phase === "overtime_pending") return;
      continue;
    }
    if (["ADD_ATTACK_DAMAGE_MODIFIER", "ADD_CONDITION_IMMUNITY", "SET_ATTACK_ELIGIBILITY", "SET_WITHDRAWAL_COST", "ATTACH_ESSENCE_FROM_ZONE"].includes(op)) {
      throw new Error(`unsupported_effect_op:${op}`);
    }
    throw new Error(`unknown_effect_op:${op}`);
  }

  if (!state.pending_choice && effect.cursor >= effect.steps.length) {
    const owner = state.players[String(effect.owner_seat)];
    if (effect.discard_after_resolve) owner.discard.push(effect.source_card);
    log(state, `Seat ${effect.owner_seat} resolved ${effect.source_name}.`);
    delete state.effect_resolution;
    delete state.pending_choice;
    if (state.phase !== "complete" && state.phase !== "overtime_pending") state.phase = "play";
    evaluateWinner(state);
  }
}

function applyPendingChoice(state: any, selected: ChoiceOption[]) {
  const effect = state.effect_resolution as EffectState;
  const pending = state.pending_choice as PendingChoice;
  if (!effect || !pending || pending.effect_id !== effect.id) throw new Error("pending_effect_mismatch");
  const context = pending.context || {};
  const apply = String(context.apply || "");
  const vars = effect.vars;

  if (apply === "set_var") {
    const values = selected.map((option) => option.data as CreatureRef);
    vars[String(context.var_name)] = context.many ? values : (values[0] || null);
  } else if (apply === "set_var_cards") {
    const sourceStep = effect.steps[effect.cursor];
    const source = (resolveVar(vars, sourceStep.source) || []) as Inst[];
    const selectedIds = new Set(selected.map((option) => String(option.data.uid)));
    vars[String(context.var_name)] = source.filter((inst) => selectedIds.has(inst.uid));
  } else if (apply === "set_var_player") {
    vars[String(context.var_name)] = selected[0]?.data?.player || null;
  } else if (apply === "hand_to_discard" || apply === "hand_to_bottom") {
    const player = state.players[String(context.zone_seat)];
    const moved: Inst[] = [];
    for (const option of selected) {
      const inst = removeByUid(player.hand, String(option.data.uid));
      if (!inst) throw new Error("selected_hand_card_missing");
      moved.push(inst);
    }
    if (apply === "hand_to_discard") player.discard.push(...moved);
    else player.deck.push(...moved);
  } else if (apply === "search_deck") {
    const player = state.players[String(context.zone_seat)];
    const moved: Inst[] = [];
    for (const option of selected) {
      const inst = removeByUid(player.deck, String(option.data.uid));
      if (!inst) throw new Error("selected_deck_card_missing");
      moved.push(inst);
    }
    moveCardsToDestination(state, Number(context.zone_seat), moved, String(context.destination));
  } else if (apply === "move_from_zone") {
    const player = state.players[String(context.zone_seat)];
    const zone = String(context.from) === "discard" ? player.discard : null;
    if (!zone) throw new Error("selected_zone_unsupported");
    const moved: Inst[] = [];
    for (const option of selected) {
      const inst = removeByUid(zone, String(option.data.uid));
      if (!inst) throw new Error("selected_zone_card_missing");
      moved.push(inst);
    }
    moveCardsToDestination(state, Number(context.zone_seat), moved, String(context.destination));
  } else if (apply === "ordered_move") {
    const ordered: Inst[] = [];
    for (const option of selected) ordered.push({ uid: option.data.uid, card_id: option.data.card_id });
    moveCardsToDestination(state, Number(context.zone_seat), ordered, String(context.destination));
  } else if (apply === "clear_condition") {
    const found = findCreature(state, context.target as CreatureRef);
    if (found && selected[0]?.data?.condition) clearCondition(found.cr, String(selected[0].data.condition));
  } else if (apply === "move_attached_essence") {
    const used = new Set<string>();
    for (const option of selected) {
      const essenceUid = String(option.data.essence_uid);
      if (used.has(essenceUid)) throw new Error("same_essence_selected_twice");
      used.add(essenceUid);
      const source = findCreature(state, option.data.source as CreatureRef);
      const destination = findCreature(state, option.data.destination as CreatureRef);
      if (!source || !destination) throw new Error("essence_move_creature_missing");
      const essence = removeByUid(source.cr.essence, essenceUid);
      if (!essence) throw new Error("essence_move_source_missing");
      destination.cr.essence.push(essence);
    }
  } else if (apply === "repeat_optional") {
    const count = Number(selected[0]?.data?.count || 0);
    const repeated: any[] = [];
    for (let i = 0; i < count; i++) repeated.push(...structuredClone((context.repeated_steps as any[]) || []));
    effect.steps.splice(effect.cursor, 1, ...repeated);
    delete state.pending_choice;
    return;
  } else throw new Error(`unknown_pending_apply:${apply}`);

  delete state.pending_choice;
  effect.cursor++;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ ok: false, version: VERSION, error: "POST only" }, 405);
  try {
    const auth = req.headers.get("Authorization") || "";
    if (!auth.startsWith("Bearer ")) return json({ ok: false, version: VERSION, error: "signed_in_user_required" }, 401);
    const url = need("SUPABASE_URL", env("SUPABASE_URL"));
    const publishable = need("publishable key", env("SUPABASE_ANON_KEY") || firstKey(env("SUPABASE_PUBLISHABLE_KEYS")));
    const service = need("service role key", env("SUPABASE_SERVICE_ROLE_KEY") || firstKey(env("SUPABASE_SECRET_KEYS")));
    const user = createClient(url, publishable, { global: { headers: { Authorization: auth } }, auth: { autoRefreshToken: false, persistSession: false } });
    const admin = createClient(url, service, { auth: { autoRefreshToken: false, persistSession: false } });
    const { data: userData, error: userError } = await user.auth.getUser();
    const userId = userData?.user?.id || "";
    if (userError || !userId) return json({ ok: false, version: VERSION, error: "invalid_user_token" }, 401);

    let body: any = {};
    try { body = await req.json(); } catch { return json({ ok: false, version: VERSION, error: "invalid_json" }, 400); }
    const action = String(body.action || "").trim();
    if (action === "ping") return json({ ok: true, version: VERSION, user_id: userId, effect_schema: EFFECT_SCHEMA });
    if (!['play_tactic', 'resolve_choice'].includes(action)) return json({ ok: false, version: VERSION, error: "unknown_action" }, 400);

    const matchId = String(body.match_id || "").trim();
    const nonce = String(body.client_nonce || "").trim();
    const expected = Number(body.expected_revision);
    if (!matchId || !nonce || !Number.isInteger(expected) || expected < 0) return json({ ok: false, version: VERSION, error: "match_id_client_nonce_expected_revision_required" }, 400);

    const { data: prior, error: priorError } = await admin.from("tcg_match_commands").select("status,result,expected_revision,resolved_at").eq("match_id", matchId).eq("user_id", userId).eq("client_nonce", nonce).maybeSingle();
    if (priorError) throw priorError;
    if (prior) return json({ ok: true, version: VERSION, replayed: true, result: prior.result, status: prior.status });

    const [{ data: stored, error: stateError }, { data: players, error: playersError }] = await Promise.all([
      admin.from("tcg_match_state_private").select("revision,canonical_state").eq("match_id", matchId).maybeSingle(),
      admin.from("tcg_match_players").select("user_id,seat").eq("match_id", matchId),
    ]);
    if (stateError) throw stateError;
    if (playersError) throw playersError;
    if (!stored || !players?.length) return json({ ok: false, version: VERSION, error: "match_not_found" }, 404);
    const revision = Number(stored.revision);
    if (revision !== expected) return json({ ok: false, version: VERSION, error: "stale_revision", expected: revision, received: expected }, 409);
    const actor = players.find((row: any) => row.user_id === userId);
    if (!actor) return json({ ok: false, version: VERSION, error: "not_match_participant" }, 403);
    const seat = Number(actor.seat);
    const state = structuredClone(stored.canonical_state as any);

    const rpc = async (fn: string, args: Record<string, unknown>) => {
      const { data, error } = await admin.rpc(fn, args);
      if (error) throw new Error(`${fn}: ${error.message}`);
      return data;
    };
    const commit = async (eventType: string, payload: Record<string, unknown>) => {
      const next = revision + 1;
      const currentViews = views(state, next);
      return await rpc("tcg_server_commit_state", {
        p_match_id: matchId,
        p_actor_user_id: userId,
        p_client_nonce: nonce,
        p_expected_revision: revision,
        p_command_type: action,
        p_new_state: state,
        p_player_one_id: state.players["1"].user_id,
        p_player_one_view: currentViews.p1,
        p_player_two_id: state.players["2"].user_id,
        p_player_two_view: currentViews.p2,
        p_event_type: eventType,
        p_public_payload: payload,
      });
    };

    if (action === "play_tactic") {
      if (state.phase !== "play" || Number(state.active_seat) !== seat) return json({ ok: false, version: VERSION, error: "not_active_player" }, 400);
      if (state.effect_resolution || state.pending_choice) return json({ ok: false, version: VERSION, error: "effect_resolution_already_pending" }, 409);
      const player = state.players[String(seat)];
      const uid = String(body.card_uid || "").trim();
      const index = player.hand.findIndex((inst: Inst) => inst.uid === uid);
      if (index < 0) return json({ ok: false, version: VERSION, error: "tactic_not_in_hand" }, 400);
      const source = player.hand[index] as Inst;
      const d = definition(state, source) || {};
      const engine = d.engine_effects || null;
      if (String(d.card_family || d.kind || "") !== "Tactic" || engine?.schema !== EFFECT_SCHEMA) return json({ ok: false, version: VERSION, error: "structured_tactic_required" }, 400);
      const subtype = String(d.tactic_subtype || d.family || engine.subtype || "");
      if (subtype === "Ally" && Number(state.first_player_seat) === seat && Number(state.personal_turns?.[String(seat)] || 0) === 1) return json({ ok: false, version: VERSION, error: "first_player_cannot_play_ally_on_first_turn" }, 400);
      if (!checkPlayRequirements(state, seat, engine.play_requirements || [])) return json({ ok: false, version: VERSION, error: "tactic_play_requirement_not_met" }, 400);
      if (!firstRequiredCreatureTargetAvailable(state, seat, engine.steps || [])) return json({ ok: false, version: VERSION, error: "required_tactic_target_unavailable" }, 400);
      const unsupported = unsupportedOps(engine.steps || []);
      if (unsupported.length) return json({ ok: false, version: VERSION, error: "tactic_waiting_for_battle_lifecycle_support", unsupported_ops: unsupported }, 409);

      player.hand.splice(index, 1);
      state.phase = "effect_resolution";
      state.effect_resolution = {
        id: crypto.randomUUID(),
        owner_seat: seat,
        source_card: source,
        source_name: String(d.name || cardName(state, source)),
        source_card_id: source.card_id,
        source_subtype: subtype,
        discard_after_resolve: engine.discard_after_resolve !== false,
        steps: structuredClone(engine.steps || []),
        cursor: 0,
        vars: {},
      } satisfies EffectState;
      executeUntilChoice(state);
      const result = await commit("play_tactic", { seat, card_id: source.card_id, subtype, pending_choice: !!state.pending_choice });
      return json({ ok: true, version: VERSION, result, pending_choice: choiceView(state.pending_choice || null, seat) });
    }

    const pending = state.pending_choice as PendingChoice | null;
    const effect = state.effect_resolution as EffectState | null;
    if (!pending || !effect || state.phase !== "effect_resolution") return json({ ok: false, version: VERSION, error: "no_effect_choice_pending" }, 400);
    if (Number(pending.seat) !== seat) return json({ ok: false, version: VERSION, error: "effect_choice_not_yours" }, 403);
    if (String(body.choice_id || "") && String(body.choice_id) !== pending.id) return json({ ok: false, version: VERSION, error: "stale_choice_id" }, 409);
    const ids = Array.isArray(body.choice_ids) ? body.choice_ids.map((value: unknown) => String(value)) : [];
    const selected = selectChoiceOptions(pending, ids);
    applyPendingChoice(state, selected);
    executeUntilChoice(state);
    const result = await commit("resolve_effect_choice", { seat, kind: pending.kind, selected_count: selected.length, pending_choice: !!state.pending_choice });
    return json({ ok: true, version: VERSION, result, pending_choice: choiceView(state.pending_choice || null, seat) });
  } catch (error) {
    return json({ ok: false, version: VERSION, error: error instanceof Error ? error.message : String(error) }, 500);
  }
});
