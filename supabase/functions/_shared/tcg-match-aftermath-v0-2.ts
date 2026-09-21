import { type RuntimeV02ConditionCreature } from "./tcg-match-condition-engine-v0-2.ts";
import {
  runtimeV02ResolveConditionAftermath,
  type RuntimeV02ConditionAftermathResult,
  type RuntimeV02ConditionCoinResult,
  type RuntimeV02ConditionDamageSink,
} from "./tcg-match-condition-lifecycle-v0-2.ts";
import {
  clearStructuredRuntimeAttachmentAttackBonusesAtAftermath,
  structuredRuntimeAftermathEssenceDisposition,
  type RuntimeLifecycleInstance,
} from "./tcg-match-surge-lifecycle-v0-2.ts";
import { runtimeV02ExpireWithdrawalModifiersAtAftermath } from "./tcg-match-withdrawal-modifier-v0-2.ts";

export type RuntimeV02AftermathCard = RuntimeLifecycleInstance & {
  uid: string;
  card_id: string;
};

export type RuntimeV02AftermathCreature = RuntimeV02ConditionCreature & {
  stack?: RuntimeV02AftermathCard[];
  essence?: RuntimeV02AftermathCard[];
  flags?: Record<string, unknown>;
};

export type RuntimeV02AftermathPlayer = {
  vanguard?: RuntimeV02AftermathCreature | null;
  reserve?: Array<RuntimeV02AftermathCreature | null>;
};

export type RuntimeV02AftermathState = Record<string, unknown> & {
  turn_seq?: number;
  players: Record<string, RuntimeV02AftermathPlayer>;
  turn_flags?: Record<string, Record<string, unknown>>;
};

export type RuntimeV02AftermathCardZoneRequest = {
  cause: "effect";
  action_kind: "aftermath";
  source_action_id: "aftermath_essence_disposition";
  source_card_uid: string;
  source: {
    controller_seat: 1 | 2;
    zone: "attached_essence";
    owner_card_uid: string;
  };
  destination: {
    controller_seat: 1 | 2;
    zone: "discard";
    owner_card_uid: null;
  };
  card_uids: string[];
  destination_position: "bottom";
};

export type RuntimeV02AftermathTransferPlan = {
  source_cards: RuntimeV02AftermathCard[];
  request: RuntimeV02AftermathCardZoneRequest;
};

export type RuntimeV02AftermathResult = {
  condition_result: RuntimeV02ConditionAftermathResult | null;
  transfer_plans: RuntimeV02AftermathTransferPlan[];
  log_messages: string[];
};

type CreatureLocation = {
  where: "vanguard" | "reserve";
  creature: RuntimeV02AftermathCreature;
};

function allCreatures(player: RuntimeV02AftermathPlayer): CreatureLocation[] {
  const out: CreatureLocation[] = [];
  if (player.vanguard) out.push({ where: "vanguard", creature: player.vanguard });
  for (const creature of player.reserve ?? []) {
    if (creature) out.push({ where: "reserve", creature });
  }
  return out;
}

function clearCurrentTurnFlag(
  flags: Record<string, unknown>,
  key: string,
  turnSeq: number,
): void {
  const value = flags[key];
  if (!value || typeof value !== "object" || Array.isArray(value)) return;
  if (Number((value as Record<string, unknown>).turn_seq) === turnSeq) delete flags[key];
}

/**
 * Canonical Match Aftermath lifecycle owner.
 *
 * This owner sequences existing specialist systems and clears only temporary
 * Aftermath lifecycle state. It deliberately does not own Damage semantics,
 * Condition semantics, physical Card-Zone movement, defeat scanning,
 * resolution queues, terminal evaluation, phase transitions, or turn advance.
 */
export function runtimeV02ResolveAftermath(
  state: RuntimeV02AftermathState,
  seat: 1 | 2,
  randomCoin: () => RuntimeV02ConditionCoinResult,
  applyConditionDamage: RuntimeV02ConditionDamageSink,
): RuntimeV02AftermathResult {
  const owner = state.players[String(seat)];
  if (!owner) throw new Error("tcg_v0_2_aftermath_player_required");

  const turnSeq = Number(state.turn_seq || 0);
  runtimeV02ExpireWithdrawalModifiersAtAftermath(state, seat);
  const logMessages: string[] = [];
  const transferPlans: RuntimeV02AftermathTransferPlan[] = [];
  let conditionResult: RuntimeV02ConditionAftermathResult | null = null;

  if (owner.vanguard) {
    conditionResult = runtimeV02ResolveConditionAftermath(
      owner.vanguard,
      randomCoin,
      applyConditionDamage,
    );
    for (const request of conditionResult.damage_requests) {
      if (request.condition === "Scorched") {
        const randomResult = conditionResult.random_results.find((entry) => entry.condition === "Scorched");
        if (!randomResult) throw new Error("tcg_v0_2_condition_lifecycle_scorched_result_required");
        logMessages.push(`Scorched dealt ${request.amount} to Seat ${seat}'s Vanguard (${randomResult.result}).`);
      } else {
        logMessages.push(`Venomed dealt ${request.amount} to Seat ${seat}'s Vanguard.`);
      }
    }
  }

  for (const location of allCreatures(owner)) {
    const creature = location.creature;
    const flags = (creature.flags ||= {}) as Record<string, unknown>;
    clearCurrentTurnFlag(flags, "lifecycle_attack_bonus", turnSeq);
    clearCurrentTurnFlag(flags, "lifecycle_withdrawal_cost", turnSeq);
    clearCurrentTurnFlag(flags, "lifecycle_condition_immunity", turnSeq);

    clearStructuredRuntimeAttachmentAttackBonusesAtAftermath(state, creature, turnSeq);

    const essence = creature.essence ?? [];
    const discardEssenceUids: string[] = [];
    for (const instance of essence) {
      const effectFlags = instance.effect_flags ?? {};
      const generated = effectFlags.discard_during_target_aftermath === true;
      const structuredDisposition = structuredRuntimeAftermathEssenceDisposition(state, instance, turnSeq);
      const legacySurge = structuredDisposition == null &&
        location.where === "vanguard" &&
        instance.card_id === "volt-surge-essence" &&
        Number(instance.attached_turn ?? -1) === turnSeq;
      if (generated || structuredDisposition === "discard" || legacySurge) {
        discardEssenceUids.push(instance.uid);
      }
    }

    if (discardEssenceUids.length > 0) {
      const ownerCardUid = String(creature.stack?.[creature.stack.length - 1]?.uid || "");
      if (!ownerCardUid) throw new Error("tcg_v0_2_aftermath_essence_owner_required");
      transferPlans.push({
        source_cards: essence,
        request: {
          cause: "effect",
          action_kind: "aftermath",
          source_action_id: "aftermath_essence_disposition",
          source_card_uid: ownerCardUid,
          source: {
            controller_seat: seat,
            zone: "attached_essence",
            owner_card_uid: ownerCardUid,
          },
          destination: {
            controller_seat: seat,
            zone: "discard",
            owner_card_uid: null,
          },
          card_uids: discardEssenceUids,
          destination_position: "bottom",
        },
      });
    }
  }

  state.turn_flags ||= {};
  const seatFlags = (state.turn_flags[String(seat)] ||= {});
  clearCurrentTurnFlag(seatFlags, "lifecycle_attack_eligibility", turnSeq);

  return {
    condition_result: conditionResult,
    transfer_plans: transferPlans,
    log_messages: logMessages,
  };
}
