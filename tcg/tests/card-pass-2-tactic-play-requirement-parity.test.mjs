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
  'tcg-card-pass-2-founder.md',
];

function cards(){
  const out=[];
  for(const file of files){
    const source=fs.readFileSync(file,'utf8');
    for(const match of source.matchAll(/```json\s*([\s\S]*?)```/g)){
      const parsed=JSON.parse(match[1]);
      if(parsed?.schema==='sb-tcg-card-v0.2') out.push(parsed);
    }
  }
  return out;
}

test('frozen Release 1 has exactly five reserve-count Tactic play requirements',()=>{
  const found=cards()
    .filter(card=>Array.isArray(card.tactic?.play_requirements)&&card.tactic.play_requirements.some(req=>req?.predicate==='reserve_count_at_least'))
    .map(card=>card.id)
    .sort();
  assert.deepEqual(found,[
    'gale-cyclone-route',
    'gale-featherstep',
    'grove-warden-fern',
    'shade-quiet-step',
    'volt-courier-jett',
  ]);
});

test('Tactic playability recognizes the frozen predicate form through the shared Requirement evaluator',()=>{
  assert.match(tacticSource,/requirement\?\.predicate === "reserve_count_at_least"/);
  assert.match(tacticSource,/normalizeRuntimeV02ReserveCountAtLeastRequirement\(requirement\)/);
  assert.match(tacticSource,/evaluateRuntimeV02ReserveCountAtLeastRequirement\(reserve, normalized\)\.matched/);
  const gate=tacticSource.slice(
    tacticSource.indexOf('function checkPlayRequirements('),
    tacticSource.indexOf('type TacticPlayability'),
  );
  assert.doesNotMatch(gate,/reserveCount\(/,'Tactic requirement gate must not own reserve-count semantics');
});

test('legacy uppercase reserve requirement remains compatibility-only and delegates to the same predicate owner',()=>{
  const gate=tacticSource.slice(
    tacticSource.indexOf('function checkPlayRequirements('),
    tacticSource.indexOf('type TacticPlayability'),
  );
  assert.match(gate,/requirement\?\.op === "RESERVE_COUNT_AT_LEAST"/);
  assert.match(gate,/predicate: "reserve_count_at_least"/);
  assert.match(gate,/controller: requirement\.player \|\| "self"/);
});


test('frozen Release 1 has exactly twelve Tactics gated by legal_card_available',()=>{
  const found=cards()
    .filter(card=>Array.isArray(card.tactic?.play_requirements)&&card.tactic.play_requirements.some(req=>req?.predicate==='legal_card_available'))
    .map(card=>card.id)
    .sort();
  assert.deepEqual(found,[
    'ember-ashen-gamble',
    'ember-ember-salve',
    'ember-rhea-ashrunner',
    'gale-clear-skies',
    'grove-spore-remedy',
    'shade-mind-cleanse',
    'stone-keeper-tor',
    'stone-masons-kit',
    'stone-reinforce',
    'tide-recovery-spray',
    'volt-quickcharge-cell',
    'volt-static-reset',
  ]);
});

test('Tactic legal-card play requirements reuse existing selectors and shared candidate-existence semantics',()=>{
  const gate=tacticSource.slice(
    tacticSource.indexOf('function checkPlayRequirements('),
    tacticSource.indexOf('type TacticPlayability'),
  );
  assert.match(gate,/requirement\?\.predicate === "legal_card_available"/);
  assert.match(gate,/normalizeRuntimeV02LegalCardAvailableRequirement\(requirement\)/);
  assert.match(gate,/creatureOptions\(/);
  assert.match(gate,/cardOptions\(/);
  assert.match(gate,/evaluateRuntimeV02LegalCardAvailableRequirement\(candidateCount, normalized\)\.matched/);
});

test('Creature availability filters cover the frozen Release 1 condition aliases',()=>{
  const filters=tacticSource.slice(
    tacticSource.indexOf('function matchesCreatureFilters('),
    tacticSource.indexOf('function creatureOptions('),
  );
  assert.match(filters,/filters\.card_family/);
  assert.match(filters,/filters\.damaged === true/);
  assert.match(filters,/filters\.conditions_any/);
  assert.match(filters,/filters\.condition_any_of/);
  assert.match(filters,/filters\.has_any_condition === true/);
  assert.match(filters,/activeConditions\(item\.cr\)\.length < 1/);
});
