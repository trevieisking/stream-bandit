import {
  evaluateStructuredRuntimeAttackRequirements,
  structuredRuntimeAttackMetadata,
  type RuntimeV02AttackRequirement,
  type RuntimeV02AttackRequirementEvaluation,
  type RuntimeV02AttackTargetPermission,
} from "./tcg-match-attack-v0-2.ts";

export type LegacyAttackCompatibility = {
  name: string;
  raw: string;
  typed: Record<string, number>;
  any: number;
  damage: number;
  effect: string;
  starbound: boolean;
};

export type RuntimeAttackAuthority = LegacyAttackCompatibility & {
  id: string | null;
  metadata_source: "legacy" | "structured_v0_2";
  damage_source: "legacy" | "base_damage" | "damage_formula.base";
  target_permissions: RuntimeV02AttackTargetPermission[];
  requirements: RuntimeV02AttackRequirement[];
};

export function resolveRuntimeAttackAuthority(
  state: Record<string, unknown>,
  instanceOrId: string | { card_id?: unknown } | null | undefined,
  attackSlot: number,
  legacy: LegacyAttackCompatibility | null,
): RuntimeAttackAuthority | null {
  const structured = structuredRuntimeAttackMetadata(state, instanceOrId, attackSlot);

  if (structured == null) {
    if (!legacy) return null;
    return {
      ...legacy,
      typed: { ...legacy.typed },
      id: null,
      metadata_source: "legacy",
      damage_source: "legacy",
      target_permissions: [],
      requirements: [],
    };
  }

  if (!legacy) {
    throw new Error(`tcg_v0_2_attack_legacy_compatibility_required:${structured.id}`);
  }
  if (structured.base_damage == null || structured.damage_source == null) {
    throw new Error(`tcg_v0_2_attack_baseline_damage_required:${structured.id}`);
  }

  return {
    raw: legacy.raw,
    effect: legacy.effect,
    starbound: structured.starbound,
    id: structured.id,
    name: structured.name,
    typed: { ...structured.typed },
    any: structured.any,
    damage: structured.base_damage,
    metadata_source: "structured_v0_2",
    damage_source: structured.damage_source,
    target_permissions: structured.target_permissions.map((permission) => ({ ...permission })),
    requirements: structured.requirements.map((requirement) => ({
      ...requirement,
      allowed_elements: [...requirement.allowed_elements],
    })),
  };
}

export function evaluateRuntimeAttackDeclarationRequirements(
  state: Record<string, unknown>,
  sourceCreature: unknown,
  attack: RuntimeAttackAuthority,
): RuntimeV02AttackRequirementEvaluation {
  if (attack.metadata_source !== "structured_v0_2") return { ok: true };
  return evaluateStructuredRuntimeAttackRequirements(state, sourceCreature, attack.requirements);
}
