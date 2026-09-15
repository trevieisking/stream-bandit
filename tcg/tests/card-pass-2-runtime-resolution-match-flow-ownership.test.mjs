import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const dispatcher = readFileSync("supabase/functions/tcg-match-actions/index.ts", "utf8");
const owner = readFileSync("supabase/functions/_shared/tcg-match-flow-resolution-v0-2.ts", "utf8");

test("resolution continuation lifecycle belongs to Match Flow, not the dispatcher", () => {
  assert.match(
    dispatcher,
    /import \{ runtimeV02ContinueResolution \} from "\.\.\/_shared\/tcg-match-flow-resolution-v0-2\.ts";/,
    "dispatcher must import the canonical Match Flow resolution owner",
  );
  assert.doesNotMatch(
    dispatcher,
    /runtimeV02EvaluateWinner/,
    "dispatcher must not retain direct terminal evaluation for resolution continuation",
  );
  assert.match(
    dispatcher,
    /const continueResolution=\(\)=>\{const continuation=runtimeV02ContinueResolution\(s\);if\(continuation\.status==="resume_aftermath"\)aftermath\(continuation\.seat\);else if\(continuation\.status==="resume_turn_advance"\)advanceTurn\(\)\};/,
    "dispatcher must execute only specialist resumes returned by Match Flow",
  );
  assert.doesNotMatch(
    dispatcher,
    /if\(queue\(\)\.length\)return;if\(evaluateWinner\(\)\)return;/,
    "dispatcher still owns empty-resolution queue/terminal routing",
  );
  assert.doesNotMatch(
    dispatcher,
    /const resume=String\(s\.resume_after_resolution\|\|""\)/,
    "dispatcher still interprets the resolution resume token",
  );
});

test("Match Flow resolution owner remains declarative around specialist mechanics", () => {
  assert.match(owner, /runtimeV02EvaluateWinner\(state\)/, "Match Flow must own terminal preflight");
  assert.match(owner, /status: "resume_aftermath"/, "Match Flow must expose Aftermath resume intent");
  assert.match(owner, /status: "resume_turn_advance"/, "Match Flow must expose turn-advance resume intent");
  assert.match(owner, /state\.phase = "play"/, "Match Flow must own the empty-resolution return-to-play transition");
  assert.doesNotMatch(owner, /runtimeV02ResolveAftermath|runtimeV02AdvanceTurn|runtimeV02ApplyCardZoneTransfer|runtimeV02ResolveDefeatedCreatures/, "Match Flow resolution routing must not absorb specialist mechanics");
});
