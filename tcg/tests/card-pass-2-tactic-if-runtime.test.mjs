import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const tacticSource=fs.readFileSync('supabase/functions/tcg-tactic-actions/index.ts','utf8');
const files=[
  'tcg-card-pass-2-astral.md',
  'tcg-card-pass-2-ember.md',
  'tcg-card-pass-2-gale.md',
  'tcg-card-pass-2-grove.md',
  'tcg-card-pass-2-shade.md',
  'tcg-card-pass-2-stone.md',
  'tcg-card-pass-2-tide.md',
  'tcg-card-pass-2-volt.md',
  'tcg-card-pass-2-founder-structured.md',
];

function cards(){
  const out=[];
  for(const file of files){
    const source=fs.readFileSync(file,'utf8');
    for(const match of source.matchAll(/\`\`\`json\s*([\s\S]*?)\`\`\`/g)){
      const parsed=JSON.parse(match[1]);
      if(parsed?.schema==='sb-tcg-card-v0.2') out.push(parsed);
    }
  }
  return out;
}

function tacticIfs(){
  const found=[];
  const walk=(card,steps)=>{
    for(const step of steps||[]){
      if(!step||typeof step!=='object') continue;
      if(step.op==='IF') found.push({card:card.id,step});
      walk(card,step.then);
      walk(card,step.else);
      walk(card,step.steps);
    }
  };
  for(const card of cards()){
    if(card.tactic?.program?.steps) walk(card,card.tactic.program.steps);
  }
  return found;
}

test('frozen Release 1 has exactly six Tactic IF programs',()=>{
  const found=tacticIfs().map(({card})=>card).sort();
  assert.deepEqual(found,[
    'gale-cyclone-route',
    'shade-false-memory',
    'stone-reversal-seal',
    'stone-surveyor-mina',
    'tide-recovery-spray',
    'volt-blackout-pulse',
  ]);
});

test('frozen Release 1 Tactic IF predicate inventory is bounded to six generic meanings',()=>{
  const predicates=new Set();
  const walk=(value)=>{
    if(Array.isArray(value)){ for(const item of value) walk(item); return; }
    if(!value||typeof value!=='object') return;
    if(typeof value.predicate==='string') predicates.add(value.predicate);
    for(const child of Object.values(value)) walk(child);
  };
  for(const {step} of tacticIfs()) walk(step.when);
  assert.deepEqual([...predicates].sort(),[
    'hand_count_at_least',
    'legal_card_available',
    'modifier_condition_slot_empty',
    'reserve_count_at_least',
    'target_has_condition',
    'target_printed_hp_at_least',
  ]);
});

test('Tactic IF delegates boolean composition to the shared predicate-tree owner',()=>{
  assert.match(tacticSource,/runtimeV02EvaluatePredicateTree/);
  assert.match(tacticSource,/function tacticPredicateLeaf\(/);
  assert.match(tacticSource,/function evaluateTacticIf\([\s\S]*?runtimeV02EvaluatePredicateTree\(/);
  assert.match(tacticSource,/if \(op === "IF"\) \{/);
  assert.match(tacticSource,/effect\.steps\.splice\(effect\.cursor, 1, \.\.\.branch\)/);
});

test('Tactic IF leaf adapter is data-driven and contains no launch card identity branches',()=>{
  const start=tacticSource.indexOf('function tacticPredicateLeaf(');
  const end=tacticSource.indexOf('function evaluateTacticIf(',start);
  assert.ok(start>=0&&end>start);
  const leaf=tacticSource.slice(start,end);
  for(const card of [
    'gale-cyclone-route',
    'shade-false-memory',
    'stone-reversal-seal',
    'stone-surveyor-mina',
    'tide-recovery-spray',
    'volt-blackout-pulse',
  ]) assert.doesNotMatch(leaf,new RegExp(card));
});

test('Tactic IF reuses existing shared requirement semantics where already canonical',()=>{
  const start=tacticSource.indexOf('function tacticPredicateLeaf(');
  const end=tacticSource.indexOf('function evaluateTacticIf(',start);
  const leaf=tacticSource.slice(start,end);
  assert.match(leaf,/normalizeRuntimeV02ReserveCountAtLeastRequirement/);
  assert.match(leaf,/evaluateRuntimeV02ReserveCountAtLeastRequirement/);
  assert.match(leaf,/normalizeRuntimeV02LegalCardAvailableRequirement/);
  assert.match(leaf,/evaluateRuntimeV02LegalCardAvailableRequirement/);
});


test('Reversal Seal is the only frozen Tactic program using ADD_SHIELD_EACH',()=>{
  const found=[];
  const walk=(card,steps)=>{
    for(const step of steps||[]){
      if(!step||typeof step!=='object') continue;
      if(step.op==='ADD_SHIELD_EACH') found.push(card.id);
      walk(card,step.then);
      walk(card,step.else);
      walk(card,step.steps);
    }
  };
  for(const card of cards()) if(card.tactic?.program?.steps) walk(card,card.tactic.program.steps);
  assert.deepEqual(found,['stone-reversal-seal']);
});

test('Tactic ADD_SHIELD_EACH delegates each resolved target to the existing Shield owner',()=>{
  const start=tacticSource.indexOf('if (op === "ADD_SHIELD_EACH")');
  const end=tacticSource.indexOf('if (op === "ADD_SHIELD" ||',start);
  assert.ok(start>=0&&end>start);
  const block=tacticSource.slice(start,end);
  assert.match(block,/resolveVar\(vars, step\.targets\)/);
  assert.match(block,/Array\.isArray\(resolved\)/);
  assert.match(block,/addRuntimeShield\(found\.cr, amount\)/);
  assert.doesNotMatch(block,/stone-reversal-seal/);
});

test('Blackout Pulse is the frozen Tactic IF consumer of APPLY_CONDITION',()=>{
  const found=[];
  const walk=(card,steps)=>{
    for(const step of steps||[]){
      if(!step||typeof step!=='object') continue;
      if(step.op==='APPLY_CONDITION') found.push(card.id);
      walk(card,step.then);
      walk(card,step.else);
      walk(card,step.steps);
    }
  };
  for(const card of cards()) if(card.tactic?.program?.steps) walk(card,card.tactic.program.steps);
  assert.deepEqual(found,['volt-blackout-pulse']);
});

test('Tactic APPLY_CONDITION delegates mode and mutation to the shared Condition owner',()=>{
  const start=tacticSource.indexOf('if (op === "APPLY_CONDITION")');
  const end=tacticSource.indexOf('if (op === "ADD_SHIELD" ||',start);
  assert.ok(start>=0&&end>start);
  const block=tacticSource.slice(start,end);
  assert.match(block,/resolveVar\(vars, step\.target\)/);
  assert.match(block,/\["apply", "apply_if_empty", "apply_if_empty_or_same", "replace"\]/);
  assert.match(block,/applyRuntimeCondition\(found\.cr, condition, Number\(state\.turn_seq \|\| 0\), rawMode as ApplyConditionMode\)/);
  assert.doesNotMatch(block,/volt-blackout-pulse/);
});

test('Cyclone Route IF branch uses generic resumable Tactic OPTIONAL',()=>{
  const card=cards().find((entry)=>entry.id==='gale-cyclone-route');
  assert.ok(card?.tactic?.program?.steps);
  const optional=[];
  const walk=(steps)=>{
    for(const step of steps||[]){
      if(!step||typeof step!=='object') continue;
      if(step.op==='OPTIONAL') optional.push(step);
      walk(step.then);
      walk(step.else);
      walk(step.steps);
    }
  };
  walk(card.tactic.program.steps);
  assert.equal(optional.length,1);
  assert.equal(optional[0].player,'self');
  assert.equal(optional[0].steps?.[0]?.op,'PROMPT_CHOSEN_PLAYER_TO_SELECT_RESERVE');
  assert.equal(optional[0].steps?.[1]?.op,'SWITCH_WITH_VANGUARD');
});

test('Tactic OPTIONAL reuses pending-choice seat authority and the same effect cursor',()=>{
  const start=tacticSource.indexOf('if (op === "OPTIONAL")');
  const end=tacticSource.indexOf('if (op === "REPEAT_OPTIONAL")',start);
  assert.ok(start>=0&&end>start);
  const block=tacticSource.slice(start,end);
  assert.match(block,/playerSeat\(ownerSeat, step\.player \|\| "self", vars\)/);
  assert.match(block,/kind: "optional"/);
  assert.match(block,/id: "optional:yes"/);
  assert.match(block,/id: "optional:no"/);
  assert.match(block,/context: \{ apply: "optional_steps", steps: optionalSteps \}/);
  assert.doesNotMatch(block,/gale-cyclone-route/);

  const applyStart=tacticSource.indexOf('apply === "optional_steps"');
  const applyEnd=tacticSource.indexOf('apply === "repeat_optional"',applyStart);
  assert.ok(applyStart>=0&&applyEnd>applyStart);
  const applyBlock=tacticSource.slice(applyStart,applyEnd);
  assert.match(applyBlock,/selected\[0\]\?\.data\?\.use === true/);
  assert.match(applyBlock,/effect\.steps\.splice\(effect\.cursor, 1, \.\.\.chosen\)/);
  assert.match(applyBlock,/delete state\.pending_choice/);
});

test('Tactic choice transport keeps OPTIONAL private to the configured chooser seat',()=>{
  assert.match(tacticSource,/if \(Number\(choice\.seat\) !== viewerSeat\) \{[\s\S]*waiting: true/);
  assert.match(tacticSource,/if \(Number\(pending\.seat\) !== seat\) return json\(\{ ok: false, version: VERSION, error: "effect_choice_not_yours" \}, 403\)/);
});

