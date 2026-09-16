import {
  dispatchRuntimeV02AfterHealPacket,
} from "./tcg-match-heal-listener-dispatch-v0-2.ts";
import {
  runtimeV02CurrentTurnHealPackets,
  type RuntimeV02HealPacket,
} from "./tcg-match-heal-packet-v0-2.ts";

export type RuntimeV02HealListenerContinuationDispatch = {
  packet_id: string;
  sequence: number;
  result: Record<string, unknown>;
};

export type RuntimeV02HealListenerContinuation = {
  status: "complete" | "player_choice_required";
  initial_packet_ids: string[];
  processed_packet_ids: string[];
  remaining_packet_ids: string[];
  emitted_packet_ids: string[];
  blocked_packet_id: string | null;
  deferred: unknown[];
  dispatches: RuntimeV02HealListenerContinuationDispatch[];
};

function nonEmpty(value: unknown, error: string): string {
  if (typeof value === "string" && value.trim()) return value.trim();
  throw new Error(error);
}

function packetsById(
  state: Record<string, unknown>,
): Map<string, RuntimeV02HealPacket> {
  const packets = runtimeV02CurrentTurnHealPackets(state);
  const byId = new Map<string, RuntimeV02HealPacket>();
  for (const packet of packets) {
    if (byId.has(packet.id)) {
      throw new Error(`tcg_v0_2_heal_continuation_duplicate_canonical_packet:${packet.id}`);
    }
    byId.set(packet.id, packet);
  }
  return byId;
}

function canonicalPackets(
  state: Record<string, unknown>,
  packetIds: string[],
  duplicateError: string,
): RuntimeV02HealPacket[] {
  if (!Array.isArray(packetIds)) {
    throw new Error("tcg_v0_2_heal_continuation_packet_ids_required");
  }
  const ids = packetIds.map((value) => nonEmpty(value, "tcg_v0_2_heal_continuation_packet_id_required"));
  if (new Set(ids).size !== ids.length) throw new Error(duplicateError);
  const byId = packetsById(state);
  const packets = ids.map((id) => {
    const packet = byId.get(id);
    if (!packet) throw new Error(`tcg_v0_2_heal_continuation_packet_not_found:${id}`);
    return packet;
  });
  packets.sort((a, b) => a.sequence - b.sequence || a.id.localeCompare(b.id));
  return packets;
}

/**
 * Deterministically continues one or more canonical after_heal_packet events.
 *
 * The existing single-packet dispatcher remains the only listener executor.
 * This coordinator is iterative rather than recursive: roots are normalized to
 * canonical packet sequence, each packet is dispatched at most once, and any
 * listener-generated heal packets are appended back to the ordered queue.
 *
 * Player-choice programs deliberately pause the continuation after the current
 * packet has finished. The emitted nested queue is returned untouched so a
 * later private-choice owner can resolve the choice and resume from the exact
 * remaining packet IDs without replaying already-resolved listener effects.
 */
export function continueRuntimeV02AfterHealPackets(
  state: Record<string, unknown>,
  packetIds: string[],
): RuntimeV02HealListenerContinuation | null {
  const roots = canonicalPackets(
    state,
    packetIds,
    "tcg_v0_2_heal_continuation_duplicate_root_packet_id",
  );
  const initialPacketIds = roots.map((packet) => packet.id);
  const queue = [...roots];
  const queued = new Set(initialPacketIds);
  const processed = new Set<string>();
  const emitted = new Set<string>();
  const dispatches: RuntimeV02HealListenerContinuationDispatch[] = [];

  while (queue.length > 0) {
    queue.sort((a, b) => a.sequence - b.sequence || a.id.localeCompare(b.id));
    const packet = queue.shift()!;
    queued.delete(packet.id);
    if (processed.has(packet.id)) {
      throw new Error(`tcg_v0_2_heal_continuation_packet_replayed:${packet.id}`);
    }

    const rawResult = dispatchRuntimeV02AfterHealPacket(state, packet.id);
    if (rawResult == null) return null;
    const result = rawResult as Record<string, unknown>;
    processed.add(packet.id);
    dispatches.push({ packet_id: packet.id, sequence: packet.sequence, result });

    const nestedIdsRaw = result.emitted_packet_ids;
    if (nestedIdsRaw != null && !Array.isArray(nestedIdsRaw)) {
      throw new Error("tcg_v0_2_heal_continuation_emitted_packet_ids_invalid");
    }
    const nestedIds = (nestedIdsRaw || []).map((value) =>
      nonEmpty(value, "tcg_v0_2_heal_continuation_emitted_packet_id_required")
    );
    if (new Set(nestedIds).size !== nestedIds.length) {
      throw new Error("tcg_v0_2_heal_continuation_duplicate_emitted_packet_id");
    }
    const nestedPackets = canonicalPackets(
      state,
      nestedIds,
      "tcg_v0_2_heal_continuation_duplicate_emitted_packet_id",
    );
    for (const nested of nestedPackets) {
      if (nested.sequence <= packet.sequence) {
        throw new Error(`tcg_v0_2_heal_continuation_non_forward_packet:${nested.id}`);
      }
      if (processed.has(nested.id) || queued.has(nested.id)) {
        throw new Error(`tcg_v0_2_heal_continuation_packet_replayed:${nested.id}`);
      }
      emitted.add(nested.id);
      queued.add(nested.id);
      queue.push(nested);
    }

    const deferredRaw = result.deferred;
    if (deferredRaw != null && !Array.isArray(deferredRaw)) {
      throw new Error("tcg_v0_2_heal_continuation_deferred_invalid");
    }
    const deferred = (deferredRaw || []) as unknown[];
    if (deferred.length > 0) {
      queue.sort((a, b) => a.sequence - b.sequence || a.id.localeCompare(b.id));
      return {
        status: "player_choice_required",
        initial_packet_ids: initialPacketIds,
        processed_packet_ids: [...processed],
        remaining_packet_ids: queue.map((item) => item.id),
        emitted_packet_ids: [...emitted],
        blocked_packet_id: packet.id,
        deferred,
        dispatches,
      };
    }
  }

  return {
    status: "complete",
    initial_packet_ids: initialPacketIds,
    processed_packet_ids: [...processed],
    remaining_packet_ids: [],
    emitted_packet_ids: [...emitted],
    blocked_packet_id: null,
    deferred: [],
    dispatches,
  };
}
