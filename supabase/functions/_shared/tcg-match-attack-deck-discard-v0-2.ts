import { runtimeV02Definition } from "./tcg-runtime-registry-v0-2.ts";
import {
  runtimeV02ApplyCardZoneTransfer,
  type RuntimeV02CardZoneInstance,
} from "./tcg-match-card-zone-engine-v0-2.ts";

type RuntimeInst = { uid: string; card_id: string };

export type RuntimeV02AttackDeckDiscardDescriptor = {
  attack_id: string;
  phase: "after_damage";
  when: {
    predicate: "target_has_any_condition";
    target: "$attack_target";
  };
  discard: {
    player: "opponent";
    count: number;
    reveal: "public";
  };
};

export type RuntimeV02AttackDeckDiscardResolution = {
  attack_id: string;
  condition_met: boolean;
  requested_count: number;
  moved_count: number;
  discarded_card_uids: string[];
  discarded_controller_seat: 1 | 2;
  reveal: "public";
  event_name: "deck_cards_discarded" | null;
};

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
  const accepted = new Set(allowed);
  const extra = Object.keys(value).find((key) => !accepted.has(key));
  if (extra) throw new Error(`${error}:${extra}`);
}

function requiredString(value: unknown, error: string): string {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) throw new Error(error);
  return text;
}

function runtimeInst(value: unknown, error: string): RuntimeInst {
  const raw = objectRecord(value);
  if (!raw) throw new Error(error);
  return {
    uid: requiredString(raw.uid, `${error}:uid`),
    card_id: requiredString(raw.card_id, `${error}:card_id`),
  };
}

function playerForSeat(
  state: Record<string, unknown>,
  seat: 1 | 2,
): Record<string, unknown> {
  const players = objectRecord(state.players);
  const player = players ? objectRecord(players[String(seat)]) : null;
  if (!player) throw new Error("tcg_v0_2_attack_deck_discard_player_missing");
  if (!Array.isArray(player.deck) || !Array.isArray(player.discard)) {
    throw new Error("tcg_v0_2_attack_deck_discard_player_zones_invalid");
  }
  return player;
}

function currentVanguardTop(player: Record<string, unknown>): RuntimeInst {
  const vanguard = objectRecord(player.vanguard);
  if (!vanguard || !Array.isArray(vanguard.stack) || vanguard.stack.length === 0) {
    throw new Error("tcg_v0_2_attack_deck_discard_source_vanguard_missing");
  }
  return runtimeInst(
    vanguard.stack[vanguard.stack.length - 1],
    "tcg_v0_2_attack_deck_discard_source_top_invalid",
  );
}

function assertSameInst(
  actual: RuntimeInst,
  expected: RuntimeInst,
  error: string,
): void {
  if (actual.uid !== expected.uid || actual.card_id !== expected.card_id) {
    throw new Error(error);
  }
}

/**
 * Recognizes the structured after-damage family:
 * IF the attack target has any Condition -> discard the top N cards of the
 * opponent's deck publicly.
 *
 * The owner is intentionally card-id-free. It interprets only the structured
 * program shape; Card-Zone owns the eventual physical transfer.
 */
export function structuredRuntimeAfterDamageDeckDiscard(
  state: Record<string, unknown>,
  instanceOrId: string | { card_id?: unknown } | null | undefined,
  attackSlot: number,
): RuntimeV02AttackDeckDiscardDescriptor | null {
  const definition = runtimeV02Definition(state, instanceOrId);
  if (!definition) return null;
  if (String(definition.card_family || "") !== "Creature") {
    throw new Error("tcg_v0_2_attack_deck_discard_requires_creature");
  }

  const creature = objectRecord(definition.creature);
  if (!creature) throw new Error("tcg_v0_2_attack_deck_discard_creature_required");
  const attacks = creature.attacks;
  if (!Array.isArray(attacks)) throw new Error("tcg_v0_2_attack_deck_discard_attacks_required");
  if (!Number.isInteger(attackSlot) || attackSlot < 1 || attackSlot > attacks.length) {
    throw new Error("tcg_v0_2_attack_deck_discard_slot_invalid");
  }

  const attack = objectRecord(attacks[attackSlot - 1]);
  if (!attack) throw new Error("tcg_v0_2_attack_deck_discard_attack_invalid");
  const attackId = requiredString(attack.id, "tcg_v0_2_attack_deck_discard_attack_id_required");
  if (!Array.isArray(attack.after_damage)) {
    throw new Error(`tcg_v0_2_attack_deck_discard_after_damage_required:${attackId}`);
  }
  if (attack.after_damage.length !== 1) return null;

  const conditional = objectRecord(attack.after_damage[0]);
  if (!conditional || String(conditional.op || "") !== "IF") return null;
  const when = objectRecord(conditional.when);
  const then = Array.isArray(conditional.then) ? conditional.then : null;
  if (!when || String(when.predicate || "") !== "target_has_any_condition") return null;
  if (!then || then.length !== 1) return null;
  const discard = objectRecord(then[0]);
  if (!discard || String(discard.op || "") !== "DISCARD_DECK_TOP") return null;

  rejectUnsupportedFields(
    conditional,
    ["op", "when", "then"],
    `tcg_v0_2_attack_deck_discard_if_field_unsupported:${attackId}`,
  );
  rejectUnsupportedFields(
    when,
    ["predicate", "target"],
    `tcg_v0_2_attack_deck_discard_when_field_unsupported:${attackId}`,
  );
  const target = when.target == null ? "$attack_target" : String(when.target);
  if (target !== "$attack_target") {
    throw new Error(`tcg_v0_2_attack_deck_discard_target_unsupported:${attackId}`);
  }

  rejectUnsupportedFields(
    discard,
    ["op", "player", "count", "reveal"],
    `tcg_v0_2_attack_deck_discard_step_field_unsupported:${attackId}`,
  );
  if (String(discard.player || "") !== "opponent") {
    throw new Error(`tcg_v0_2_attack_deck_discard_player_unsupported:${attackId}`);
  }
  const count = Number(discard.count);
  if (!Number.isInteger(count) || count < 1) {
    throw new Error(`tcg_v0_2_attack_deck_discard_count_invalid:${attackId}`);
  }
  if (String(discard.reveal || "") !== "public") {
    throw new Error(`tcg_v0_2_attack_deck_discard_reveal_unsupported:${attackId}`);
  }

  return {
    attack_id: attackId,
    phase: "after_damage",
    when: {
      predicate: "target_has_any_condition",
      target: "$attack_target",
    },
    discard: {
      player: "opponent",
      count,
      reveal: "public",
    },
  };
}

/**
 * Resolves only the structured deck-discard transaction after the Attack owner
 * has supplied the target-condition result. It never creates deckout, shuffles,
 * reorders to deck-bottom, or resolves listeners. Those remain separate owners.
 */
export function runtimeV02ResolveAfterDamageDeckDiscard(
  state: Record<string, unknown>,
  seat: 1 | 2,
  descriptor: RuntimeV02AttackDeckDiscardDescriptor,
  sourceInstance: unknown,
  targetHasAnyCondition: boolean,
): RuntimeV02AttackDeckDiscardResolution {
  if (descriptor.phase !== "after_damage") {
    throw new Error("tcg_v0_2_attack_deck_discard_phase_unsupported");
  }
  if (
    descriptor.when.predicate !== "target_has_any_condition" ||
    descriptor.when.target !== "$attack_target" ||
    descriptor.discard.player !== "opponent" ||
    !Number.isInteger(descriptor.discard.count) ||
    descriptor.discard.count < 1 ||
    descriptor.discard.reveal !== "public"
  ) {
    throw new Error("tcg_v0_2_attack_deck_discard_descriptor_invalid");
  }
  if (state.active_seat !== seat) {
    throw new Error("tcg_v0_2_attack_deck_discard_active_seat_mismatch");
  }

  const sourcePlayer = playerForSeat(state, seat);
  const source = runtimeInst(
    sourceInstance,
    "tcg_v0_2_attack_deck_discard_source_identity_invalid",
  );
  assertSameInst(
    currentVanguardTop(sourcePlayer),
    source,
    "tcg_v0_2_attack_deck_discard_source_vanguard_changed",
  );

  const discardedControllerSeat: 1 | 2 = seat === 1 ? 2 : 1;
  const opponent = playerForSeat(state, discardedControllerSeat);
  const deck = opponent.deck as RuntimeV02CardZoneInstance[];
  const discard = opponent.discard as RuntimeV02CardZoneInstance[];

  if (!targetHasAnyCondition) {
    return {
      attack_id: descriptor.attack_id,
      condition_met: false,
      requested_count: descriptor.discard.count,
      moved_count: 0,
      discarded_card_uids: [],
      discarded_controller_seat: discardedControllerSeat,
      reveal: "public",
      event_name: null,
    };
  }

  const available = Math.min(descriptor.discard.count, deck.length);
  const selected = deck.slice(0, available).map((card, index) =>
    runtimeInst(card, `tcg_v0_2_attack_deck_discard_top_card_invalid:${index}`)
  );

  if (selected.length > 0) {
    runtimeV02ApplyCardZoneTransfer(deck, discard, {
      cause: "effect",
      action_kind: "attack",
      source_action_id: descriptor.attack_id,
      source_card_uid: source.uid,
      source: {
        controller_seat: discardedControllerSeat,
        zone: "deck",
        owner_card_uid: null,
      },
      destination: {
        controller_seat: discardedControllerSeat,
        zone: "discard",
        owner_card_uid: null,
      },
      card_uids: selected.map((card) => card.uid),
      destination_position: "bottom",
    });
  }

  return {
    attack_id: descriptor.attack_id,
    condition_met: true,
    requested_count: descriptor.discard.count,
    moved_count: selected.length,
    discarded_card_uids: selected.map((card) => card.uid),
    discarded_controller_seat: discardedControllerSeat,
    reveal: "public",
    event_name: selected.length > 0 ? "deck_cards_discarded" : null,
  };
}
