import { runtimeV02Definition } from "./tcg-runtime-registry-v0-2.ts";
import {
  runtimeV02DamageInstance,
  runtimeV02DamageObject,
  runtimeV02DamageSeat,
  runtimeV02DamageString,
  type RuntimeV02DamagePacketCandidate,
  type RuntimeV02DamagePacketContext,
  type RuntimeV02DamagePacketCreature,
  type RuntimeV02DamagePacketField,
  type RuntimeV02DamagePacketInstance,
  type RuntimeV02DamagePacketLookup,
} from "./tcg-match-damage-packet-context-v0-2.ts";

export const runtimeV02DefaultDamagePacketLookup: RuntimeV02DamagePacketLookup =
  (state, value) => runtimeV02Definition(state, value);

function definition(
  state: Record<string, unknown>,
  card: RuntimeV02DamagePacketInstance,
  lookup: RuntimeV02DamagePacketLookup,
): Record<string, unknown> {
  const value = lookup(state, card);
  if (!value) throw new Error(`tcg_v0_2_damage_packet_definition_missing:${card.card_id}`);
  return value;
}

export function runtimeV02DamagePacketFields(
  state: Record<string, unknown>,
  lookup: RuntimeV02DamagePacketLookup,
): RuntimeV02DamagePacketField[] {
  const players = runtimeV02DamageObject(state.players);
  if (!players) throw new Error("tcg_v0_2_damage_packet_players_required");
  const result: RuntimeV02DamagePacketField[] = [];
  for (const seat of [1, 2] as const) {
    const player = runtimeV02DamageObject(players[String(seat)]);
    if (!player) throw new Error(`tcg_v0_2_damage_packet_player_missing:${seat}`);
    if (player.reserve != null && !Array.isArray(player.reserve)) {
      throw new Error(`tcg_v0_2_damage_packet_reserve_invalid:${seat}`);
    }
    const slots: Array<["vanguard" | "reserve", number | null, unknown]> = [
      ["vanguard", null, player.vanguard],
      ...[0, 1, 2, 3].map((index) => [
        "reserve",
        index,
        Array.isArray(player.reserve) ? player.reserve[index] : null,
      ] as ["reserve", number, unknown]),
    ];
    for (const [where, index, raw] of slots) {
      if (raw == null) continue;
      const cr = runtimeV02DamageObject(raw) as RuntimeV02DamagePacketCreature | null;
      if (!cr || !Array.isArray(cr.stack) || !cr.stack.length) {
        throw new Error("tcg_v0_2_damage_packet_creature_invalid");
      }
      const top = runtimeV02DamageInstance(
        cr.stack[cr.stack.length - 1],
        "tcg_v0_2_damage_packet_top_invalid",
      );
      result.push({ seat, where, index, cr, top, def: definition(state, top, lookup) });
    }
  }
  return result;
}

export function runtimeV02DamagePacketListenerId(candidate: RuntimeV02DamagePacketCandidate): string {
  return runtimeV02DamageString(
    candidate.listener.id,
    "tcg_v0_2_damage_packet_listener_id_required",
  );
}

function addListeners(
  result: RuntimeV02DamagePacketCandidate[],
  kind: RuntimeV02DamagePacketCandidate["kind"],
  source: RuntimeV02DamagePacketInstance,
  seat: 1 | 2,
  field: RuntimeV02DamagePacketField | null,
  raw: unknown,
): void {
  if (raw == null) return;
  if (!Array.isArray(raw)) throw new Error("tcg_v0_2_damage_packet_listener_list_invalid");
  for (const item of raw) {
    const listener = runtimeV02DamageObject(item);
    if (!listener) throw new Error("tcg_v0_2_damage_packet_listener_invalid");
    if (String(listener.event || "") !== "before_damage_packet") continue;
    runtimeV02DamageString(listener.id, "tcg_v0_2_damage_packet_listener_id_required");
    result.push({ kind, source, seat, field, listener });
  }
}

export function runtimeV02DamagePacketCandidates(
  state: Record<string, unknown>,
  lookup: RuntimeV02DamagePacketLookup,
): RuntimeV02DamagePacketCandidate[] {
  const result: RuntimeV02DamagePacketCandidate[] = [];
  for (const field of runtimeV02DamagePacketFields(state, lookup)) {
    const ability = runtimeV02DamageObject(
      runtimeV02DamageObject(field.def.creature)?.ability,
    );
    if (ability && String(ability.event || "") === "before_damage_packet") {
      if (String(ability.mode || "") !== "triggered") {
        throw new Error("tcg_v0_2_damage_packet_ability_mode_unsupported");
      }
      result.push({
        kind: "ability",
        source: field.top,
        seat: field.seat,
        field,
        listener: ability,
      });
    }

    if (field.cr.essence != null && !Array.isArray(field.cr.essence)) {
      throw new Error("tcg_v0_2_damage_packet_essence_zone_invalid");
    }
    for (const raw of field.cr.essence || []) {
      const source = runtimeV02DamageInstance(raw, "tcg_v0_2_damage_packet_essence_invalid");
      const def = definition(state, source, lookup);
      const essence = runtimeV02DamageObject(def.essence);
      if (String(def.card_family || "") !== "Essence" || !essence) {
        throw new Error("tcg_v0_2_damage_packet_essence_definition_invalid");
      }
      addListeners(result, "essence", source, field.seat, field, essence.listeners);
    }

    if (field.cr.relic != null) {
      const source = runtimeV02DamageInstance(
        field.cr.relic,
        "tcg_v0_2_damage_packet_relic_invalid",
      );
      const def = definition(state, source, lookup);
      const tactic = runtimeV02DamageObject(def.tactic);
      if (
        String(def.card_family || "") !== "Tactic" ||
        String(tactic?.subtype || "") !== "Relic"
      ) {
        throw new Error("tcg_v0_2_damage_packet_relic_definition_invalid");
      }
      addListeners(result, "relic", source, field.seat, field, tactic?.listeners);
    }
  }

  const realm = runtimeV02DamageObject(state.realm);
  if (realm?.card != null) {
    const source = runtimeV02DamageInstance(realm.card, "tcg_v0_2_damage_packet_realm_invalid");
    const def = definition(state, source, lookup);
    const tactic = runtimeV02DamageObject(def.tactic);
    if (
      String(def.card_family || "") !== "Tactic" ||
      String(tactic?.subtype || "") !== "Realm"
    ) {
      throw new Error("tcg_v0_2_damage_packet_realm_definition_invalid");
    }
    addListeners(
      result,
      "realm",
      source,
      runtimeV02DamageSeat(realm.owner_seat, "tcg_v0_2_damage_packet_realm_owner_invalid"),
      null,
      tactic?.listeners,
    );
  }

  const seen = new Set<string>();
  for (const candidate of result) {
    const key = `${candidate.source.uid}:${runtimeV02DamagePacketListenerId(candidate)}`;
    if (seen.has(key)) throw new Error(`tcg_v0_2_damage_packet_duplicate_listener:${key}`);
    seen.add(key);
  }
  return result;
}

export function runtimeV02DamagePacketTargetField(
  state: Record<string, unknown>,
  packet: RuntimeV02DamagePacketContext,
  lookup: RuntimeV02DamagePacketLookup,
): RuntimeV02DamagePacketField {
  const found = runtimeV02DamagePacketFields(state, lookup).find((field) =>
    field.seat === packet.target_controller_seat &&
    field.where === packet.target_zone &&
    field.index === packet.target_index &&
    field.top.uid === packet.target_creature_uid
  );
  if (!found) throw new Error("tcg_v0_2_damage_packet_target_stale");
  return found;
}
