(function(){
'use strict';

const VERSION='2.4.51';
const REGISTRY='assets/tcg/cards/set-one/tcg-card-display-registry-v1.json';
let readyPromise=null;
let registry=null;
let byId=new Map();

function esc(value){
  return String(value==null?'':value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}
function absolute(path){return new URL(String(path||''),document.baseURI).href;}
async function readJson(path){
  const response=await fetch(absolute(path),{credentials:'same-origin'});
  if(!response.ok)throw new Error('TCG card display registry unavailable: '+path+' (HTTP '+response.status+')');
  return response.json();
}
function human(value){
  return String(value||'').toLowerCase().replaceAll('_',' ').replace(/\b\w/g,m=>m.toUpperCase());
}
function num(value){
  return value!==null&&value!==undefined&&value!==''&&Number.isFinite(Number(value))?Number(value):null;
}
function costText(cost){
  if(!Array.isArray(cost)||!cost.length)return 'No Essence';
  return cost.map(part=>{
    const amount=num(part&&part.amount);
    const element=String(part&&part.element||'Any');
    return (amount==null?0:amount)+' '+element;
  }).join(' + ');
}
function damageText(attack){
  if(!attack)return '—';
  const direct=num(attack.base_damage);
  if(direct!=null)return String(direct);
  const formula=attack.damage_formula&&typeof attack.damage_formula==='object'?attack.damage_formula:null;
  const base=formula?num(formula.base):null;
  if(base==null)return '—';
  const terms=Array.isArray(formula.terms)?formula.terms:[];
  if(!terms.length)return String(base);
  const extras=terms.map(term=>{
    if(term&&term.kind==='conditional_add'&&num(term.amount)!=null)return '+'+num(term.amount);
    if(term&&term.kind==='count_add'&&num(term.amount_per)!=null)return '+'+num(term.amount_per)+' each';
    return '+';
  });
  return base+' '+extras.join(' ');
}
function targetLabel(value){
  const v=String(value||'');
  if(v==='$source_creature')return 'this creature';
  if(v==='$target_creature')return 'target creature';
  if(v==='self')return 'yourself';
  if(v==='opponent')return 'opponent';
  return v?human(v):'target';
}
function stepSummary(step){
  if(!step||typeof step!=='object')return '';
  const op=String(step.op||'');
  const amount=num(step.amount);
  const count=num(step.count);
  switch(op){
    case 'ADD_SHIELD': return 'Gain '+(amount==null?'Shield':amount+' Shield')+(step.target?' on '+targetLabel(step.target):'')+(num(step.source_contribution_cap)!=null?' (max '+num(step.source_contribution_cap)+' from this source)':'');
    case 'ADD_SHIELD_EACH': return 'Give '+(amount==null?'Shield':amount+' Shield')+' to each selected creature';
    case 'HEAL': return 'Heal '+(amount==null?'damage':amount+' damage')+(step.target?' from '+targetLabel(step.target):'');
    case 'HEAL_EACH': return 'Heal '+(amount==null?'damage':amount+' damage')+' from each selected creature';
    case 'DIRECT_DAMAGE': return 'Deal '+(amount==null?'direct damage':amount+' direct damage')+(step.target?' to '+targetLabel(step.target):'');
    case 'APPLY_CONDITION': return 'Apply '+human(step.condition||step.value||'condition')+(step.target?' to '+targetLabel(step.target):'');
    case 'CLEAR_CONDITION': return 'Clear '+human(step.condition||'condition');
    case 'CLEAR_CONDITION_IF_PRESENT': return 'Clear '+human(step.condition||'condition')+' if present';
    case 'CHOOSE_AND_CLEAR_CONDITION': return 'Choose and clear a condition';
    case 'CHOOSE_AND_CLEAR_CONTROL_CONDITION': return 'Choose and clear a control condition';
    case 'DRAW': return 'Draw '+(count==null?'card(s)':count+' card'+(count===1?'':'s'));
    case 'DRAW_FIXED': return 'Draw '+(count==null?'card(s)':count+' card'+(count===1?'':'s'));
    case 'LOOK_TOP': return 'Look at the top '+(count==null?'card(s)':count+' card'+(count===1?'':'s'))+' of your deck';
    case 'INSPECT_ZONE': return 'Inspect '+human(step.zone||'zone');
    case 'SEARCH_DECK': return 'Search your deck';
    case 'SEARCH_DECK_GROUP': return 'Search your deck for a group of cards';
    case 'SHUFFLE_DECK': return 'Shuffle your deck';
    case 'SHUFFLE_ZONE_INTO_DECK': return 'Shuffle '+human(step.zone||'zone')+' into the deck';
    case 'CHOOSE_HAND_TO_DISCARD': return 'Choose '+(count==null?'card(s)':count+' card'+(count===1?'':'s'))+' from hand to discard';
    case 'CHOOSE_HAND_TO_DECK_BOTTOM': return 'Choose a card from hand to put on the bottom of the deck';
    case 'DISCARD_HAND': return 'Discard hand';
    case 'DISCARD_DECK_TOP': return 'Discard the top card of the deck';
    case 'DISCARD_ATTACHED_ESSENCE': return 'Discard attached Essence';
    case 'MOVE_ATTACHED_ESSENCE': return 'Move attached Essence';
    case 'ATTACH_ESSENCE_FROM_SELECTION': return 'Attach selected Essence';
    case 'ATTACH_ESSENCE_FROM_ZONE': return 'Attach Essence from '+human(step.zone||'zone');
    case 'MOVE_CARDS': return 'Move selected card'+(step.to?' to '+human(step.to):'');
    case 'MOVE_ZONE_POSITION': return 'Move a card within '+human(step.zone||'zone');
    case 'CHOOSE_FROM_SET': return 'Choose '+(num(step.max)!=null?('up to '+num(step.max)):'card(s)')+' from the revealed set';
    case 'SELECT_CARDS': return 'Select card(s)';
    case 'SELECT_CREATURE': return 'Select a creature';
    case 'CHOOSE_PLAYER': return 'Choose a player';
    case 'PROMPT_CHOSEN_PLAYER_TO_SELECT_RESERVE': return 'Chosen player selects a Reserve creature';
    case 'PUT_REMAINDER_ON_DECK_BOTTOM': return 'Put the remaining cards on the bottom of the deck';
    case 'RETURN_REMAINDER_TO_DECK_TOP': return 'Return the remaining cards to the top of the deck';
    case 'RETURN_SET_TO_DECK_TOP': return 'Return the cards to the top of the deck';
    case 'SWITCH_WITH_VANGUARD': return 'Switch with the Vanguard';
    case 'PERFORM_VOLUNTARY_WITHDRAWAL': return 'Perform a voluntary Withdrawal';
    case 'TRANSFER_SHIELD': return 'Transfer Shield';
    case 'TIMEFOLD': return 'Timefold: take the extra-turn transition after this attack resolves';
    case 'SET_WITHDRAWAL_MODIFIER':
    case 'MODIFY_CURRENT_WITHDRAWAL_COST': return 'Modify Withdrawal cost';
    case 'ADD_ATTACK_DAMAGE_MODIFIER':
    case 'MODIFY_CURRENT_ATTACK_DAMAGE':
    case 'MODIFY_CURRENT_DAMAGE_PACKET':
    case 'ADD_INCOMING_ATTACK_DAMAGE_MODIFIER': return 'Modify damage';
    case 'ADD_CONDITION_IMMUNITY': return 'Gain condition immunity';
    case 'SET_ATTACK_ELIGIBILITY': return 'Modify attack eligibility';
    case 'SET_DEVICE_PLAY_LOCK': return 'Apply device play lock';
    case 'SET_RESOLVING_CARD_DESTINATION': return 'Set this card\'s destination after resolution';
    case 'REPLACE_CONTROL_CONDITION': return 'Replace a control condition';
    case 'MODIFY_CURRENT_HEAL': return 'Modify healing';
    case 'INCREMENT_SOURCE_COUNTER': return 'Increase this card\'s counter';
    case 'RECORD_EVENT': return 'Record '+human(step.event||'event');
    case 'SCHEDULE_ACTION': return 'Schedule '+human(step.action||'action');
    case 'SCHEDULE_SOURCE_DISCARD': return 'Discard this source after resolution';
    case 'CHECK_DECKOUT_AFTER_RESOLUTION': return 'Check deck-out after resolution';
    case 'RANDOM_SAMPLE_HIDDEN_ZONE': return 'Randomly sample a hidden zone';
    case 'OPTIONAL': {
      const nested=Array.isArray(step.steps)?step.steps:[];
      const text=nested.map(stepSummary).filter(Boolean).join('; ');
      return 'Optional'+(text?': '+text:'');
    }
    case 'REPEAT_OPTIONAL': return 'Repeat the optional effect as allowed';
    case 'IF': {
      const yes=Array.isArray(step.then)?step.then:(Array.isArray(step.steps)?step.steps:[]);
      const text=yes.map(stepSummary).filter(Boolean).join('; ');
      return 'If its condition is met'+(text?': '+text:'');
    }
    default: return human(op);
  }
}
function stepsSummary(steps,max=3){
  if(!Array.isArray(steps)||!steps.length)return '';
  const rows=steps.map(stepSummary).filter(Boolean);
  const visible=rows.slice(0,max);
  return visible.join(' • ')+(rows.length>max?' • +'+(rows.length-max)+' more':'');
}
function attackEffectSummary(attack){
  if(!attack)return '';
  const sections=[];
  const decl=stepsSummary(attack.on_declare,2);
  const before=stepsSummary(attack.before_damage,2);
  const after=stepsSummary(attack.after_damage,3);
  if(decl)sections.push('On declare: '+decl);
  if(before)sections.push('Before damage: '+before);
  if(after)sections.push('After damage: '+after);
  const formula=attack.damage_formula&&typeof attack.damage_formula==='object'?attack.damage_formula:null;
  if(formula&&Array.isArray(formula.terms)&&formula.terms.length){
    const terms=formula.terms.map(term=>{
      if(term.kind==='conditional_add'&&num(term.amount)!=null)return '+'+num(term.amount)+' when its condition is met';
      if(term.kind==='count_add'&&num(term.amount_per)!=null)return '+'+num(term.amount_per)+' for each qualifying count';
      return human(term.kind);
    });
    sections.unshift(terms.join(' • '));
  }
  return sections.join(' · ');
}
function artMarkup(record){
  const p=record.printing||{};
  if(p.artwork_status==='approved'&&p.art_path){
    return '<img src="'+esc(p.art_path)+'" alt="'+esc(record.name)+' artwork" loading="lazy" decoding="async">';
  }
  return '<div class="sb-card-art-pending" aria-label="Artwork pending"><span>'+esc(record.element||'Set One')+'</span><strong>Artwork Pending</strong><small>Card remains playable</small></div>';
}
function abilityMarkup(ability,options){
  if(!ability)return '';
  const active=String(ability.mode||'')==='active';
  const ready=!!(options&&options.abilityReady&&active);
  const interactive=!!(ready&&options&&options.interactiveAbility);
  const body=stepsSummary(ability.steps,3);
  const trigger=active?'Active Ability':('Triggered · '+human(ability.event||ability.timing||'event'));
  const tag=interactive?'button':'section';
  const attrs=interactive
    ? ' type="button" data-card-intent="ability" data-ability-where="'+esc(options.abilityWhere||'')+'" data-ability-index="'+esc(options.abilityIndex==null?'':options.abilityIndex)+'"'
    : '';
  return '<'+tag+' class="sb-card-rule sb-card-ability'+(ready?' is-ready':'')+'" data-card-ability-mode="'+esc(ability.mode||'')+'"'+attrs+'>'+
    '<div class="sb-card-rule-head"><span class="sb-card-rule-tag">'+(ready?'ABILITY READY':'ABILITY')+'</span><strong>'+esc(ability.name||'Ability')+'</strong></div>'+
    '<div class="sb-card-rule-meta">'+esc(trigger)+'</div>'+
    (body?'<p>'+esc(body)+'</p>':'')+
    '</'+tag+'>';
}
function attackMarkup(attack,index,options){
  const effect=attackEffectSummary(attack);
  const slot=index+1;
  const ready=Array.isArray(options&&options.readyAttackSlots)&&options.readyAttackSlots.includes(slot);
  const disabled=Array.isArray(options&&options.disabledAttackSlots)&&options.disabledAttackSlots.includes(slot);
  const interactive=!!(options&&options.interactiveAttacks);
  const tag=interactive?'button':'section';
  const attrs=interactive
    ? ' type="button" data-card-intent="attack" data-attack-slot="'+slot+'"'+(disabled?' disabled':'')
    : '';
  return '<'+tag+' class="sb-card-rule sb-card-attack'+(ready?' is-ready':'')+(disabled?' is-disabled':'')+'" data-card-attack-slot="'+slot+'"'+attrs+'>'+
    '<div class="sb-card-rule-head"><span class="sb-card-cost">'+esc(costText(attack.cost))+'</span><strong>'+esc(attack.name||('Attack '+slot))+'</strong><span class="sb-card-damage">'+esc(damageText(attack))+'</span></div>'+
    '<div class="sb-card-rule-meta">Attack '+slot+' · Ends Turn</div>'+
    (effect?'<p>'+esc(effect)+'</p>':'')+
    '</'+tag+'>';
}
function creatureRules(record,options){
  const creature=record.definition&&record.definition.creature||{};
  const ability=abilityMarkup(creature.ability,options);
  const attacks=(Array.isArray(creature.attacks)?creature.attacks:[]).map((a,i)=>attackMarkup(a,i,options)).join('');
  return ability+attacks;
}
function tacticRules(record){
  const tactic=record.definition&&record.definition.tactic||{};
  const program=tactic.program||{};
  const text=stepsSummary(program.steps,4);
  return '<section class="sb-card-rule"><div class="sb-card-rule-head"><span class="sb-card-rule-tag">'+esc(tactic.subtype||'TACTIC')+'</span><strong>Effect</strong></div>'+(text?'<p>'+esc(text)+'</p>':'<p>Resolve this card through its canonical Tactic owner.</p>')+'</section>';
}
function essenceRules(record){
  const essence=record.definition&&record.definition.essence||{};
  const provides=Array.isArray(essence.provides)?essence.provides.map(x=>(num(x.amount)||0)+' '+String(x.element||'Any')).join(' + '):'';
  const parts=[];
  if(provides)parts.push('Provides '+provides);
  const attach=stepsSummary(essence.on_attach,2);if(attach)parts.push('On attach: '+attach);
  const continuous=stepsSummary(essence.continuous,2);if(continuous)parts.push(continuous);
  return '<section class="sb-card-rule"><div class="sb-card-rule-head"><span class="sb-card-rule-tag">'+esc(essence.subtype||'ESSENCE')+'</span><strong>Essence</strong></div><p>'+esc(parts.join(' • ')||'Attach as Essence through the canonical Essence owner.')+'</p></section>';
}
function renderCard(cardOrId,options){
  const record=typeof cardOrId==='string'?byId.get(cardOrId):cardOrId;
  if(!record)return '<article class="sb-card-face sb-card-face--missing"><div class="sb-card-art-pending"><strong>Card unavailable</strong></div></article>';
  const opts=options||{};
  const mode=String(opts.mode||'full');
  const def=record.definition||{};
  const printing=record.printing||{};
  const family=String(record.card_family||def.card_family||'Card');
  const creature=def.creature||null;
  const hp=creature?num(creature.hp):null;
  const reward=creature?num(creature.reward_value):null;
  const withdrawal=creature?num(creature.withdrawal):null;
  const subtype=creature?String(creature.stage||'Creature'):(def.tactic?String(def.tactic.subtype||'Tactic'):(def.essence?String(def.essence.subtype||'Essence'):family));
  const rules=family==='Creature'?creatureRules(record,opts):(family==='Tactic'?tacticRules(record):(family==='Essence'?essenceRules(record):''));
  const rarity=printing.rarity?human(printing.rarity):'—';
  const leftTop=hp!=null?'<span class="sb-card-hp"><small>HP</small><strong>'+hp+'</strong></span>':'<span class="sb-card-family">'+esc(family)+'</span>';
  const rewardMarkup=reward!=null?'<span class="sb-card-reward"><small>REWARD CARDS</small><strong>'+reward+'</strong></span>':'<span class="sb-card-set"><small>'+esc(printing.set_code||'SB1')+'</small><strong>'+esc(family)+'</strong></span>';
  const withdrawMarkup=withdrawal!=null?'<span class="sb-card-withdraw"><small>WITHDRAW</small><strong>'+withdrawal+'</strong></span>':'';
  return '<article class="sb-card-face sb-card-face--'+esc(mode)+' sb-card-element--'+esc(String(record.element||'neutral').toLowerCase())+'" data-card-id="'+esc(record.card_id)+'" data-card-family="'+esc(family)+'" data-artwork-state="'+esc(printing.artwork_status||'missing')+'">'+
    '<header class="sb-card-header">'+leftTop+'<div class="sb-card-identity"><h3>'+esc(record.name)+'</h3><small>'+esc(family+' — '+subtype)+'</small></div><span class="sb-card-element"><strong>'+esc(record.element||'Neutral')+'</strong><small>ENERGY TYPE</small></span></header>'+
    '<div class="sb-card-art">'+artMarkup(record)+'</div>'+
    '<div class="sb-card-rules">'+rules+'</div>'+
    '<footer class="sb-card-footer">'+rewardMarkup+'<span class="sb-card-print"><strong>'+esc(printing.set_code||'SB1')+'</strong><small>'+esc(human(printing.finish_family||'standard'))+'</small></span><span class="sb-card-rarity"><small>RARITY</small><strong>'+esc(rarity)+'</strong>'+withdrawMarkup+'</span></footer>'+
    '</article>';
}
function hydrate(root=document){
  const scope=root||document;
  const nodes=[];
  if(scope.matches&&scope.matches('[data-sb-tcg-render-card]'))nodes.push(scope);
  if(scope.querySelectorAll)nodes.push(...scope.querySelectorAll('[data-sb-tcg-render-card]'));
  for(const node of nodes){
    const id=String(node.dataset.sbTcgRenderCard||node.dataset.cardId||'');
    if(!id)continue;
    const mode=String(node.dataset.sbTcgCardMode||'compact');
    node.innerHTML=renderCard(id,{mode});
    node.dataset.sbTcgCardHydrated='1';
  }
  return nodes.length;
}
function ready(){
  if(!readyPromise){
    readyPromise=readJson(REGISTRY).then(data=>{
      registry=data&&typeof data==='object'?data:{records:[]};
      byId=new Map((registry.records||[]).map(row=>[String(row.card_id),row]));
      return api;
    });
  }
  return readyPromise;
}
function getCard(id){return byId.get(String(id||''))||null;}
const api=Object.freeze({version:VERSION,ready,renderCard,hydrate,getCard,getRegistry:()=>registry,damageText,costText,stepsSummary});
window.StreamBanditTCGCardRendererV2451=api;
})();
