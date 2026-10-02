import { runtimeV02Definition } from "./tcg-runtime-registry-v0-2.ts";
import { runtimeV02AttackSourceAttachedEssenceKinds } from "./tcg-match-attack-authority-v0-2.ts";

export type RuntimeV02AttackActionEventCounts = Record<string, number>;

function objectRecord(value: unknown, code: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(code);
  return value as Record<string, unknown>;
}

function requiredString(value: unknown, code: string): string {
  const text = String(value ?? "").trim();
  if (!text) throw new Error(code);
  return text;
}

function positiveInteger(value: unknown, code: string): number {
  const number = Number(value);
  if (!Number.isInteger(number) || number <= 0) throw new Error(code);
  return number;
}

function rejectUnsupportedFields(
  value: Record<string, unknown>,
  allowed: string[],
  code: string,
): void {
  const allowedSet = new Set(allowed);
  const unexpected = Object.keys(value).find((key) => !allowedSet.has(key));
  if (unexpected) throw new Error(`${code}:${unexpected}`);
}

function sourceEssenceCount(sourceCreature: unknown): number {
  const source = objectRecord(sourceCreature, "tcg_v0_2_attack_declaration_source_invalid");
  if (!Array.isArray(source.essence)) {
    throw new Error("tcg_v0_2_attack_declaration_source_essence_invalid");
  }
  return source.essence.length;
}

export function runtimeV02EvaluateAttackDeclarationRecordEvents(
  onDeclare: unknown,
  sourceCreature: unknown,
  sourceEssenceKinds: Array<"temporary" | "borrowed">,
): RuntimeV02AttackActionEventCounts {
  if (!Array.isArray(onDeclare)) {
    throw new Error("tcg_v0_2_attack_declaration_program_invalid");
  }
  const events: RuntimeV02AttackActionEventCounts = {};

  for (let index = 0; index < onDeclare.length; index += 1) {
    const step = objectRecord(
      onDeclare[index],
      `tcg_v0_2_attack_declaration_step_invalid:${index}`,
    );
    if (String(step.op || "") !== "RECORD_EVENT") {
      throw new Error(`tcg_v0_2_attack_declaration_op_unsupported:${String(step.op || "")}`);
    }
    rejectUnsupportedFields(
      step,
      ["op", "event", "when"],
      `tcg_v0_2_attack_declaration_step_field_unsupported:${index}`,
    );
    const event = requiredString(
      step.event,
      `tcg_v0_2_attack_declaration_event_required:${index}`,
    );
    const when = objectRecord(
      step.when,
      `tcg_v0_2_attack_declaration_when_required:${index}`,
    );
    const predicate = String(when.predicate || "");
    let matched = false;

    if (predicate === "event_attack_source_attached_essence_count_at_least") {
      rejectUnsupportedFields(
        when,
        ["predicate", "count"],
        `tcg_v0_2_attack_declaration_count_predicate_field_unsupported:${index}`,
      );
      const threshold = positiveInteger(
        when.count,
        `tcg_v0_2_attack_declaration_count_invalid:${index}`,
      );
      matched = sourceEssenceCount(sourceCreature) >= threshold;
    } else if (predicate === "event_attack_source_has_attached_essence_kind") {
      rejectUnsupportedFields(
        when,
        ["predicate", "kind"],
        `tcg_v0_2_attack_declaration_kind_predicate_field_unsupported:${index}`,
      );
      const kind = requiredString(
        when.kind,
        `tcg_v0_2_attack_declaration_kind_required:${index}`,
      );
      if (kind !== "temporary" && kind !== "borrowed") {
        throw new Error(`tcg_v0_2_attack_declaration_kind_unsupported:${kind}`);
      }
      matched = sourceEssenceKinds.includes(kind);
    } else {
      throw new Error(`tcg_v0_2_attack_declaration_predicate_unsupported:${predicate}`);
    }

    if (matched) events[event] = (events[event] || 0) + 1;
  }

  return events;
}

export function runtimeV02CollectAttackDeclarationEvents(
  state: Record<string, unknown>,
  instanceOrId: string | { card_id?: unknown; uid?: unknown } | null | undefined,
  attackSlot: number,
  sourceCreature: unknown,
): RuntimeV02AttackActionEventCounts {
  const definition = runtimeV02Definition(state, instanceOrId);
  if (!definition) return {};
  if (String(definition.card_family || "") !== "Creature") {
    throw new Error("tcg_v0_2_attack_declaration_requires_creature");
  }
  const creature = objectRecord(
    definition.creature,
    "tcg_v0_2_attack_declaration_creature_required",
  );
  if (!Array.isArray(creature.attacks)) {
    throw new Error("tcg_v0_2_attack_declaration_attacks_required");
  }
  if (!Number.isInteger(attackSlot) || attackSlot < 1 || attackSlot > creature.attacks.length) {
    throw new Error("tcg_v0_2_attack_declaration_slot_invalid");
  }
  const attack = objectRecord(
    creature.attacks[attackSlot - 1],
    "tcg_v0_2_attack_declaration_attack_invalid",
  );
  const onDeclare = attack.on_declare;
  if (!Array.isArray(onDeclare)) {
    throw new Error("tcg_v0_2_attack_declaration_on_declare_required");
  }
  if (onDeclare.length === 0) return {};
  return runtimeV02EvaluateAttackDeclarationRecordEvents(
    onDeclare,
    sourceCreature,
    runtimeV02AttackSourceAttachedEssenceKinds(state, instanceOrId),
  );
}
