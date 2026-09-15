import { runtimeV02Definition } from "./tcg-runtime-registry-v0-2.ts";

function objectRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function positiveInteger(value: unknown, error: string): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) {
    throw new Error(error);
  }
  return value;
}

export function structuredRuntimeEssenceProvidedElements(
  state: Record<string, unknown>,
  rawInstance: unknown,
  errorPrefix: string,
): string[] {
  const instance = objectRecord(rawInstance);
  const cardId = String(instance?.card_id || "").trim();
  if (!instance || !cardId) {
    throw new Error(`${errorPrefix}_essence_instance_invalid`);
  }

  const definition = runtimeV02Definition(state, { card_id: cardId });
  if (!definition) {
    throw new Error(`${errorPrefix}_essence_definition_required:${cardId}`);
  }
  if (String(definition.card_family || "") !== "Essence") {
    throw new Error(`${errorPrefix}_attachment_not_essence:${cardId}`);
  }

  const essence = objectRecord(definition.essence);
  if (!essence) {
    throw new Error(`${errorPrefix}_essence_metadata_required:${cardId}`);
  }
  if (!Array.isArray(essence.provides)) {
    throw new Error(`${errorPrefix}_essence_provides_required:${cardId}`);
  }

  return essence.provides.map((rawProvide, index) => {
    const provide = objectRecord(rawProvide);
    if (!provide) {
      throw new Error(`${errorPrefix}_essence_provide_invalid:${cardId}:${index}`);
    }
    const element = String(provide.element || "").trim();
    if (!element) {
      throw new Error(`${errorPrefix}_essence_element_required:${cardId}:${index}`);
    }
    positiveInteger(
      provide.amount,
      `${errorPrefix}_essence_amount_invalid:${cardId}:${index}`,
    );
    return element;
  });
}

export function structuredRuntimeDistinctAttachedEssenceElements(
  state: Record<string, unknown>,
  rawSourceCreature: unknown,
  allowedElements: readonly string[],
  errorPrefix: string,
): string[] {
  const sourceCreature = objectRecord(rawSourceCreature);
  if (!sourceCreature || !Array.isArray(sourceCreature.essence)) {
    throw new Error(`${errorPrefix}_source_essence_required`);
  }

  const orderedAllowed = [...new Set(allowedElements)];
  const allowed = new Set(orderedAllowed);
  const represented = new Set<string>();
  for (const attached of sourceCreature.essence) {
    for (const element of structuredRuntimeEssenceProvidedElements(state, attached, errorPrefix)) {
      if (allowed.has(element)) represented.add(element);
    }
  }

  return orderedAllowed.filter((element) => represented.has(element));
}
