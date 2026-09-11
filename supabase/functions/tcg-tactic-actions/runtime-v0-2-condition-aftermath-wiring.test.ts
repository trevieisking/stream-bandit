import { runtimeV02ResolveConditionAftermath } from "../_shared/tcg-match-condition-lifecycle-v0-2.ts";
import { placeRuntimeDamage } from "./runtime-v0-2-core.ts";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function equal(actual: unknown, expected: unknown, message: string): void {
  if (!Object.is(actual, expected)) {
    throw new Error(`${message}: expected ${String(expected)}, got ${String(actual)}`);
  }
}

const matchActionsSource = await Deno.readTextFile(
  new URL("../tcg-match-actions/index.ts", import.meta.url),
);

Deno.test("match dispatcher delegates ordinary Condition Aftermath to the canonical lifecycle owner", () => {
  const start = matchActionsSource.indexOf("const aftermath=(who:number)=>");
  const end = matchActionsSource.indexOf("const continueResolution=", start);
  assert(start >= 0 && end > start, "match Aftermath block must be discoverable");
  const aftermath = matchActionsSource.slice(start, end);

  assert(
    matchActionsSource.includes(
      'import { runtimeV02ResolveConditionAftermath } from "../_shared/tcg-match-condition-lifecycle-v0-2.ts";',
    ),
    "match dispatcher must import the canonical Condition Lifecycle owner directly",
  );
  assert(
    aftermath.includes("runtimeV02ResolveConditionAftermath("),
    "match Aftermath must call the canonical Condition Lifecycle owner",
  );
  assert(
    aftermath.includes("placeRuntimeDamage(creature,request.amount)"),
    "condition damage requests must be handed to the existing canonical damage-placement primitive",
  );
  assert(
    !aftermath.includes("if(q.scorched)"),
    "match Aftermath must not retain its own Scorched state machine",
  );
  assert(
    !aftermath.includes("q.venomed=Math.min"),
    "match Aftermath must not retain its own Venomed escalation state machine",
  );
  assert(
    !aftermath.includes('q.control==="Stunned"') &&
      !aftermath.includes('q.modifier==="Drenched"'),
    "match Aftermath must not retain duplicate ordinary Condition expiry rules",
  );
  assert(
    !aftermath.includes("directDamage(v,"),
    "Condition Aftermath must not mutate damage through the dispatcher-local helper",
  );
});

Deno.test("Condition Aftermath preserves current direct-placement Shield semantics through the damage primitive", () => {
  const creature = {
    damage: 5,
    shield: 50,
    condition: null,
    conditions: {
      scorched: true,
      venomed: 20,
      control: null,
      modifier: null,
    },
    flags: {},
  };

  const result = runtimeV02ResolveConditionAftermath(
    creature,
    () => "heads",
    (target, request) => {
      placeRuntimeDamage(target, request.amount);
    },
  );

  equal(result.damage_requests.length, 2, "Scorched and Venomed must both request damage");
  equal(creature.damage, 45, "20 Scorched plus 20 Venomed damage must still be placed");
  equal(creature.shield, 50, "ordinary Condition damage must preserve the prior Shield-bypass behaviour");
  equal(creature.conditions.scorched, false, "Scorched heads must clear through the lifecycle owner");
  equal(creature.conditions.venomed, 30, "Venomed must still escalate through the lifecycle owner");
});
