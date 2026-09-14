import type { RuntimeV02CreatureDefeatedEvent } from "./tcg-match-defeat-engine-v0-2.ts";
import {
  runtimeV02BeginEventListenerContinuation,
  type RuntimeV02EventListenerFlow,
} from "./tcg-match-event-listener-v0-2.ts";
import { runtimeV02AdaptDefeatEventsForListener } from "./tcg-match-event-listener-defeat-event-v0-2.ts";

export {
  runtimeV02AdaptDefeatEventForListener,
  runtimeV02AdaptDefeatEventsForListener,
} from "./tcg-match-event-listener-defeat-event-v0-2.ts";

/**
 * Canonical #34 -> #28 bridge. It deliberately delegates adapted events back
 * into the existing Event Listener continuation so there is still only one
 * listener execution/replay/choice owner.
 */
export function runtimeV02BeginDefeatEventListenerContinuation(
  state: Record<string, unknown>,
  events: readonly RuntimeV02CreatureDefeatedEvent[],
): RuntimeV02EventListenerFlow {
  return runtimeV02BeginEventListenerContinuation(
    state,
    runtimeV02AdaptDefeatEventsForListener(state, events),
  );
}
