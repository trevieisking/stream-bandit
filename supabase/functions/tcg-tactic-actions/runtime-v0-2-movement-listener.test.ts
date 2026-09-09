import assert from 'node:assert/strict';
import {
  runtimeV02BeginMovementListenerContinuation,
  runtimeV02ResolveMovementListenerChoice,
  runtimeV02PrivateMovementInspectionView,
  runtimeV02PendingMovementListenerChoiceView,
} from '../_shared/tcg-match-movement-listener-v0-2.ts';
import { recordRuntimeV02EssenceAttachmentEvent } from '../_shared/tcg-match-essence-attachment-event-v0-2.ts';

type Any = any;
const turn = 5;
const duration1 = { expires_on: ['end_of_turn'], max_uses: 1, consume_on: 'legal_attack_declared' };
const withdrawDuration1 = { expires_on: ['end_of_turn'], max_uses: 1, consume_on: 'legal_voluntary_withdrawal_declared' };
function inst(uid:string, card_id:string){ return {uid, card_id}; }
function cr(uid:string, card_id:string, opts:Any={}){ return {stack:[inst(uid,card_id)], essence:opts.essence||[], relic:opts.relic||null, damage:opts.damage||0, shield:0, conditions:{scorched:false,venomed:0,control:null,modifier:null}, flags:{}}; }
function def(id:string, extra:Any={}) { return { name: extra.name || id, card_family: extra.card_family || 'Creature', element: extra.element || 'Gale', creature: extra.creature ?? {stage:'Standalone', withdrawal: extra.withdrawal ?? 1, ability: extra.ability || null}, essence: extra.essence ?? null, tactic: extra.tactic ?? null }; }
function state(incoming:Any, outgoing:Any, defs:Record<string,Any>, opts:Any={}){
  const opp = opts.opp || cr('opp','opp-card');
  const p1reserve = [outgoing, ...(opts.reserveExtra||[]), null, null].slice(0,4);
  const baseDefs:Record<string,Any> = {
    'opp-card': def('opp-card',{element:'Stone'}),
    'dummy-in': def('dummy-in',{element:'Gale'}),
    'dummy-out': def('dummy-out',{element:'Gale'}),
    ...defs,
  };
  for (const p of [opts.p1Deck||[], opts.p1Hand||[], opts.p2Deck||[], opts.p2Hand||[]]) for(const x of p) if(!baseDefs[x.card_id]) baseDefs[x.card_id]=def(x.card_id,{element:'Stone'});
  for (const e of [...(incoming?.essence||[]), ...(outgoing?.essence||[]), ...((opts.reserveExtra||[]).flatMap((x:Any)=>x?.essence||[]))]) if(e && !baseDefs[e.card_id]) baseDefs[e.card_id]=def(e.card_id,{card_family:'Essence', element:'Tide', creature:null, essence:{listeners:[]}});
  if(outgoing?.relic && !baseDefs[outgoing.relic.card_id]) baseDefs[outgoing.relic.card_id]=def(outgoing.relic.card_id,{card_family:'Tactic', creature:null, tactic:{subtype:'Relic',listeners:[]}});
  const s:Any = {
    turn_seq:turn, active_seat:1, runtime_registry_v0_2:{registry_id:'SB1-set-one-v0.2'},
    card_index:Object.fromEntries(Object.entries(baseDefs).map(([id,d])=>[id,{definition_v0_2:d}])),
    players:{
      '1':{vanguard:incoming,reserve:p1reserve,deck:opts.p1Deck||[],hand:opts.p1Hand||[],discard:[],void:[],rewards:[]},
      '2':{vanguard:opp,reserve:[null,null,null,null],deck:opts.p2Deck||[],hand:opts.p2Hand||[],discard:[],void:[],rewards:[]},
    },
    runtime_v0_2_switch_ledger:{contexts:[{switch_id:'switch:5:1',controller_seat:1,outgoing_vanguard_uid:outgoing.stack[0].uid,incoming_vanguard_uid:incoming.stack[0].uid,reserve_index:0,source_action_id:'test',source_card_uid:null,action_kind:'attack',turn_seq:turn}]},
  };
  if(opts.realm){ s.realm=opts.realm; if(!s.card_index[opts.realm.card.card_id]) s.card_index[opts.realm.card.card_id]={definition_v0_2:opts.realmDef}; }
  return s;
}
function ev(kind:'moved_to_reserve'|'became_vanguard', subject:string, action:'attack'|'effect_switch'|'voluntary_withdrawal'='attack', id='switch:5:1'):Any {
  return {event:kind,subject_uid:subject,controller_seat:1,origin_zone:kind==='moved_to_reserve'?'vanguard':'reserve',destination_zone:kind==='moved_to_reserve'?'reserve':'vanguard',reserve_index:0,switch_id:id,source_action_id:'test',source_card_uid:null,action_kind:action,turn_seq:turn};
}
function ability(event:string,id:string,requirements:Any,steps:Any[],limit:Any={scope:'turn',count:1,owner:'card_instance'}){ return {id,name:id,mode:'triggered',event,timing:'own_turn',limit,requirements,costs:[],steps}; }

Deno.test("movement listener continuation covers all 20 frozen Set One switch listeners and fail-closed privacy", () => {
// Skyweaver: draw -> private discard continuation.
{
  const incoming=cr('sky','gale-skyweaver'); const outgoing=cr('out','dummy-out');
  const sky=ability('became_vanguard','crosswind',{all:[{predicate:'event_subject_is_source'},{predicate:'event_origin_zone_is',zone:'reserve'},{predicate:'event_destination_zone_is',zone:'vanguard'},{predicate:'event_controller_is_active_seat'}]},[{op:'DRAW',player:'self',count:1},{op:'CHOOSE_HAND_TO_DISCARD',player:'self',count:1}]);
  const s=state(incoming,outgoing,{'gale-skyweaver':def('Skyweaver',{ability:sky})},{p1Deck:[inst('draw','draw-card')],p1Hand:[inst('hand','hand-card')]});
  const flow=runtimeV02BeginMovementListenerContinuation(s,[ev('became_vanguard','sky')]); assert.equal(flow.status,'player_choice_required'); assert.equal(s.players['1'].hand.length,2);
  assert.deepEqual(runtimeV02PendingMovementListenerChoiceView(flow.pending_choice,2),{id:flow.pending_choice!.id,seat:1,kind:'discard_from_hand',waiting:true});
  const resolved=runtimeV02ResolveMovementListenerChoice(s,1,flow.pending_choice!.id,[flow.pending_choice!.options[0].id]); assert.equal(resolved.status,'complete'); assert.equal(s.players['1'].discard.length,1);
  const replay=runtimeV02BeginMovementListenerContinuation(s,[ev('became_vanguard','sky')]); assert.equal(replay.processed_listener_keys.length,0); assert.equal(s.players['1'].hand.length,1);
}

// Cometmanta: self top-2 stays in place until controller order choice.
{
  const incoming=cr('in','dummy-in'); const outgoing=cr('comet','astral-cometmanta');
  const a=ability('moved_to_reserve','passing-orbit',{all:[{predicate:'source_is_self'},{predicate:'event_origin_zone_is',zone:'vanguard'},{predicate:'event_destination_zone_is',zone:'reserve'},{predicate:'event_controller_is_self'}]},[{op:'LOOK_TOP',player:'self',count:2,visibility:'controller_private',as:'looked'},{op:'RETURN_SET_TO_DECK_TOP',player:'self',cards:'$looked',order:'controller_choice'}],{scope:'turn',count:1,owner:'controller'});
  const s=state(incoming,outgoing,{'astral-cometmanta':def('Cometmanta',{element:'Astral',ability:a})},{p1Deck:[inst('a','a'),inst('b','b'),inst('c','c')]});
  const f=runtimeV02BeginMovementListenerContinuation(s,[ev('moved_to_reserve','comet')]); assert.equal(f.status,'player_choice_required'); assert.deepEqual(s.players['1'].deck.map((x:Any)=>x.uid),['a','b','c']);
  assert.deepEqual(runtimeV02PrivateMovementInspectionView(s,1)!.cards.map(x=>x.uid),['a','b']); assert.equal(runtimeV02PrivateMovementInspectionView(s,2),null);
  runtimeV02ResolveMovementListenerChoice(s,1,f.pending_choice!.id,[f.pending_choice!.options[1].id,f.pending_choice!.options[0].id]); assert.deepEqual(s.players['1'].deck.map((x:Any)=>x.uid),['b','a','c']);
}

// Wispbat: opponent top card is private and never moved.
{
  const incoming=cr('in','dummy-in'); const outgoing=cr('wisp','shade-wispbat');
  const a=ability('moved_to_reserve','fade-echo',{all:[{predicate:'event_subject_is_source'},{predicate:'event_action_kind_is',action_kind:'attack'},{predicate:'event_controller_is_active_seat'}]},[{op:'INSPECT_ZONE',player:'opponent',zone:'deck_top',selection:{min:1,max:1,filters:{}},visibility:'controller_private',return_policy:'same_position',as:'echo'}]);
  const s=state(incoming,outgoing,{'shade-wispbat':def('Wispbat',{element:'Shade',ability:a})},{p2Deck:[inst('secret','secret-card'),inst('next','next-card')]});
  const f=runtimeV02BeginMovementListenerContinuation(s,[ev('moved_to_reserve','wisp')]); assert.equal(f.status,'complete'); assert.deepEqual(s.players['2'].deck.map((x:Any)=>x.uid),['secret','next']); assert.equal(runtimeV02PrivateMovementInspectionView(s,1)!.cards[0].uid,'secret'); assert.equal(runtimeV02PrivateMovementInspectionView(s,2),null);
}

// Graveglider: opponent top 2 private reorder, deck unchanged before choice.
{
  const incoming=cr('grave','shade-graveglider'); const outgoing=cr('out','dummy-out');
  const a=ability('became_vanguard','cold-read',{all:[{predicate:'event_subject_is_source'},{predicate:'event_controller_is_active_seat'}]},[{op:'INSPECT_ZONE',player:'opponent',zone:'deck_top',selection:{min:2,max:2,filters:{}},visibility:'controller_private',return_policy:'same_position',as:'looked'},{op:'RETURN_SET_TO_DECK_TOP',player:'opponent',cards:'$looked',order:'controller_choice'}]);
  const s=state(incoming,outgoing,{'shade-graveglider':def('Graveglider',{element:'Shade',ability:a})},{p2Deck:[inst('g1','g1'),inst('g2','g2'),inst('g3','g3')]});
  const f=runtimeV02BeginMovementListenerContinuation(s,[ev('became_vanguard','grave')]); assert.equal(f.status,'player_choice_required'); assert.deepEqual(s.players['2'].deck.map((x:Any)=>x.uid),['g1','g2','g3']); assert.deepEqual(runtimeV02PrivateMovementInspectionView(s,1)!.cards.map(x=>x.uid),['g1','g2']);
  runtimeV02ResolveMovementListenerChoice(s,1,f.pending_choice!.id,[f.pending_choice!.options[1].id,f.pending_choice!.options[0].id]); assert.deepEqual(s.players['2'].deck.map((x:Any)=>x.uid),['g2','g1','g3']);
}

// Lanternsquid: optional Tide Essence move records canonical movement.
{
  const incoming=cr('lantern','tide-lanternsquid'); const outgoing=cr('out','dummy-out'); const tide=inst('tide-e','tide-basic'); const donor=cr('donor','donor-card',{essence:[tide]});
  const a=ability('became_vanguard','deep-signal',{all:[{predicate:'event_subject_is_source'},{predicate:'event_controller_is_active_seat'}]},[{op:'MOVE_ATTACHED_ESSENCE',controller:'self',element:'Tide',count:{min:0,max:1},source_selector:{zone:'reserve',filters:{card_family:'Creature',exclude_source:true}},destination_selector:{fixed:'$source_creature'},require_destination_different_creature:true,as:'signal_move'}]);
  const defs={'tide-lanternsquid':def('Lanternsquid',{element:'Tide',ability:a}), 'donor-card':def('Donor',{element:'Tide'}), 'tide-basic':def('Tide essence',{card_family:'Essence',element:'Tide',creature:null,essence:{listeners:[]}})};
  const s=state(incoming,outgoing,defs,{reserveExtra:[donor]}); const f=runtimeV02BeginMovementListenerContinuation(s,[ev('became_vanguard','lantern')]); assert.equal(f.status,'player_choice_required'); assert.equal(f.pending_choice!.kind,'move_attached_essence');
  const r=runtimeV02ResolveMovementListenerChoice(s,1,f.pending_choice!.id,[f.pending_choice!.options[0].id]); assert.equal(r.status,'complete'); assert.equal(incoming.essence[0].uid,'tide-e'); assert.equal(donor.essence.length,0); assert.equal(s.essence_moves.length,1);
}

// Jetstream: exact hand-origin attachment event required; attachment-scope once.
{
  const jet=inst('jet','gale-jetstream-essence'); const incoming=cr('jet-target','jet-target-card',{essence:[jet]}); const outgoing=cr('out','dummy-out');
  const listener={id:'jetstream-vanguard-window',event:'became_vanguard',requirements:{all:[{predicate:'event_subject_is_attached_creature'},{predicate:'event_occurred',event:'essence_attached',controller:'self',window:'current_turn',filters:{source_card_uid:'self',origin_zone:'hand'},min_count:1}]},limit:{scope:'attachment',count:1,owner:'attachment'},steps:[{op:'SET_WITHDRAWAL_MODIFIER',target:'$attached_creature',mode:'set',amount:0,minimum:0,duration:withdrawDuration1}]};
  const defs={'jet-target-card':def('JetTarget',{element:'Gale',withdrawal:2}), 'gale-jetstream-essence':def('Jetstream',{card_family:'Essence',element:'Gale',creature:null,essence:{listeners:[listener]}})};
  let s=state(incoming,outgoing,defs); let f=runtimeV02BeginMovementListenerContinuation(s,[ev('became_vanguard','jet-target')]); assert.equal(f.processed_listener_keys.length,0); assert.equal((incoming.flags as Any).lifecycle_withdrawal_cost,undefined);
  s=state(cr('jet-target','jet-target-card',{essence:[inst('jet','gale-jetstream-essence')]}),cr('out','dummy-out'),defs); recordRuntimeV02EssenceAttachmentEvent(s,1,'jet-target',s.players['1'].vanguard.essence[0],'hand','manual_essence','normal');
  f=runtimeV02BeginMovementListenerContinuation(s,[ev('became_vanguard','jet-target')]); assert.equal(f.processed_listener_keys.length,1); assert.equal(s.players['1'].vanguard.flags.lifecycle_withdrawal_cost.value,0);
  s.runtime_v0_2_switch_ledger.contexts.push({...s.runtime_v0_2_switch_ledger.contexts[0],switch_id:'switch:5:2'}); const second=runtimeV02BeginMovementListenerContinuation(s,[ev('became_vanguard','jet-target','effect_switch','switch:5:2')]); assert.equal(second.processed_listener_keys.length,0);
}

// Caldera non-Ember voluntary withdrawal damage, but never on attack switch.
{
  const realm=inst('caldera','ember-volcanic-caldera'); const calderaDef=def('Caldera',{card_family:'Tactic',element:'Ember',creature:null,tactic:{subtype:'Realm',listeners:[{id:'caldera-nonember-withdrawal-damage',event:'moved_to_reserve',controller_scope:'any',requirements:{all:[{predicate:'event_action_kind_is',action_kind:'voluntary_withdrawal'},{not:{predicate:'event_subject_matches',filters:{element:'Ember'}}}]},limit:null,steps:[{op:'DIRECT_DAMAGE',target:'$event_subject',amount:10,damage_class:'effect'}]}]}});
  let out=cr('out','stone-out'); let s=state(cr('in','dummy-in'),out,{'stone-out':def('Stone',{element:'Stone'})},{realm:{card:realm,owner_seat:2},realmDef:calderaDef}); runtimeV02BeginMovementListenerContinuation(s,[ev('moved_to_reserve','out','voluntary_withdrawal')]); assert.equal(out.damage,10);
  out=cr('out','stone-out'); s=state(cr('in','dummy-in'),out,{'stone-out':def('Stone',{element:'Stone'})},{realm:{card:realm,owner_seat:2},realmDef:calderaDef}); runtimeV02BeginMovementListenerContinuation(s,[ev('moved_to_reserve','out','attack')]); assert.equal(out.damage,0);
}

// Pressure Compass draw.
{
  const relic=inst('compass','gale-pressure-compass'); const outgoing=cr('out','out-card',{relic}); const incoming=cr('in','dummy-in');
  const relicDef=def('Pressure Compass',{card_family:'Tactic',element:'Gale',creature:null,tactic:{subtype:'Relic',listeners:[{id:'pressure-compass-draw',event:'moved_to_reserve',requirements:{all:[{predicate:'event_subject_is_attached_creature'},{predicate:'event_origin_zone_is',zone:'vanguard'},{predicate:'event_destination_zone_is',zone:'reserve'}]},limit:{scope:'turn',count:1,owner:'attachment'},steps:[{op:'DRAW',player:'self',count:1}]}]}});
  const s=state(incoming,outgoing,{'out-card':def('Out'), 'gale-pressure-compass':relicDef},{p1Deck:[inst('pcdraw','pcdraw')]}); runtimeV02BeginMovementListenerContinuation(s,[ev('moved_to_reserve','out')]); assert.equal(s.players['1'].hand[0].uid,'pcdraw');
}

// Cloudray attack bonus on voluntary withdrawal.
{
  const outgoing=cr('cloud','gale-cloudray'); const incoming=cr('in','incoming-card');
  const a=ability('moved_to_reserve','cloudwake',{all:[{predicate:'event_subject_is_source'},{predicate:'event_action_kind_is',action_kind:'voluntary_withdrawal'},{predicate:'event_controller_is_active_seat'}]},[{op:'ADD_ATTACK_DAMAGE_MODIFIER',target:'$switch_incoming_vanguard',amount:10,duration:duration1}]);
  const s=state(incoming,outgoing,{'gale-cloudray':def('Cloudray',{ability:a}), 'incoming-card':def('Incoming')}); runtimeV02BeginMovementListenerContinuation(s,[ev('moved_to_reserve','cloud','voluntary_withdrawal')]); assert.equal((incoming.flags as Any).lifecycle_attack_bonus.amount,10);
}

// Slipwing withdrawal modifier on attack switch.
{
  const outgoing=cr('slip','gale-slipwing'); const incoming=cr('in','incoming-card');
  const a=ability('moved_to_reserve','slipstream-relay',{all:[{predicate:'event_subject_is_source'},{predicate:'event_action_kind_is',action_kind:'attack'},{predicate:'event_controller_is_active_seat'}]},[{op:'SET_WITHDRAWAL_MODIFIER',target:'$switch_incoming_vanguard',mode:'delta',amount:-1,minimum:0,duration:withdrawDuration1}]);
  const s=state(incoming,outgoing,{'gale-slipwing':def('Slipwing',{ability:a}), 'incoming-card':def('Incoming',{withdrawal:2})}); runtimeV02BeginMovementListenerContinuation(s,[ev('moved_to_reserve','slip','attack')]); assert.equal((incoming.flags as Any).lifecycle_withdrawal_cost.value,1);
}

// Sootwing + Mistmarten use canonical heal packet source kind=ability.
for (const [id,abilityId,amount] of [['ember-sootwing','soot-glide',10],['tide-mistmarten','mist-recovery',20]] as const) {
  const outgoing=cr('heal-out',id,{damage:30}); const incoming=cr('in','dummy-in');
  const req=id==='ember-sootwing'?{all:[{predicate:'event_subject_is_source'},{predicate:'event_origin_zone_is',zone:'vanguard'},{predicate:'event_destination_zone_is',zone:'reserve'},{predicate:'event_action_kind_is',action_kind:'attack'},{predicate:'event_controller_is_active_seat'}]}:{all:[{predicate:'event_subject_is_source'},{predicate:'event_action_kind_is',action_kind:'attack'},{predicate:'target_damaged',target:'$source_creature'}]};
  const a=ability('moved_to_reserve',abilityId,req,[{op:'HEAL',target:'$source_creature',amount}]); const s=state(incoming,outgoing,{[id]:def(id,{element:id.startsWith('tide')?'Tide':'Ember',ability:a})}); const f=runtimeV02BeginMovementListenerContinuation(s,[ev('moved_to_reserve','heal-out','attack')]); assert.equal(f.emitted_heal_packet_ids.length,1); assert.equal(s.heal_packets[0].source.action_kind,'ability'); assert.equal(outgoing.damage,30-amount);
}

// Became-Vanguard attack bonuses: Coalfinch, Driftlet, Tempestalon, Boltfang.
for (const [id,abilityId,amount] of [['ember-coalfinch','cinder-lift',10],['gale-driftlet','rising-draft',10],['gale-tempestalon','storm-entry',30],['volt-boltfang','live-hunt',20]] as const) {
  const incoming=cr('bonus',id); const outgoing=cr('out','dummy-out');
  const req={all:[{predicate:'event_subject_is_source'},{predicate:'event_origin_zone_is',zone:'reserve'},{predicate:'event_controller_is_active_seat'}]};
  const a=ability('became_vanguard',abilityId,req,[{op:'ADD_ATTACK_DAMAGE_MODIFIER',target:'$source_creature',amount,duration:duration1}]); const s=state(incoming,outgoing,{[id]:def(id,{element:id.startsWith('ember')?'Ember':id.startsWith('volt')?'Volt':'Gale',ability:a})}); runtimeV02BeginMovementListenerContinuation(s,[ev('became_vanguard','bonus')]); assert.equal((incoming.flags as Any).lifecycle_attack_bonus.amount,amount,id);
}

// Condition entrants: Cindercrest Scorched; Umbraspider/Sparkmoth Dazed, event trace recorded.
for (const [id,abilityId,condition] of [['ember-cindercrest','ash-mark','Scorched'],['shade-umbraspider','web-of-doubt','Dazed'],['volt-sparkmoth','flash-dust','Dazed']] as const) {
  const incoming=cr('cond',id); const outgoing=cr('out','dummy-out');
  const req=id==='ember-cindercrest'?{all:[{predicate:'event_subject_is_source'},{predicate:'event_controller_is_active_seat'}]}:{all:[{predicate:'event_subject_is_source'},{predicate:'event_controller_is_active_seat'},{predicate:'control_condition_slot_empty',target:'$current_opponent_vanguard'}]};
  const target=id==='ember-cindercrest'?{controller:'opponent',zone:'vanguard'}:'$current_opponent_vanguard';
  const a=ability('became_vanguard',abilityId,req,[{op:'APPLY_CONDITION',target,condition,mode:'apply_if_empty'}]); const s=state(incoming,outgoing,{[id]:def(id,{element:id.startsWith('ember')?'Ember':id.startsWith('shade')?'Shade':'Volt',ability:a})}); runtimeV02BeginMovementListenerContinuation(s,[ev('became_vanguard','cond')]); if(condition==='Scorched') assert.equal(s.players['2'].vanguard.conditions.scorched,true); else assert.equal(s.players['2'].vanguard.conditions.control,'Dazed'); assert.equal(s.effect_events.at(-1).event,'condition_changed');
}

// Caldera became-Vanguard stacks with Coalfinch (+20 total) and is controller_scope:any.
{
  const incoming=cr('coal','ember-coalfinch'); const outgoing=cr('out','dummy-out'); const coal=ability('became_vanguard','cinder-lift',{all:[{predicate:'event_subject_is_source'},{predicate:'event_origin_zone_is',zone:'reserve'},{predicate:'event_destination_zone_is',zone:'vanguard'},{predicate:'event_controller_is_active_seat'}]},[{op:'ADD_ATTACK_DAMAGE_MODIFIER',target:'$source_creature',amount:10,duration:duration1}]);
  const realm=inst('caldera','ember-volcanic-caldera'); const realmDef=def('Caldera',{card_family:'Tactic',element:'Ember',creature:null,tactic:{subtype:'Realm',listeners:[{id:'caldera-ember-vanguard-pressure',event:'became_vanguard',controller_scope:'any',requirements:{all:[{predicate:'event_controller_is_active_seat'},{predicate:'event_subject_matches',filters:{card_family:'Creature',element:'Ember'}}]},limit:{scope:'turn',count:1,owner:'event_controller'},steps:[{op:'ADD_ATTACK_DAMAGE_MODIFIER',target:'$event_subject',amount:10,duration:duration1}]}]}});
  const s=state(incoming,outgoing,{'ember-coalfinch':def('Coalfinch',{element:'Ember',ability:coal})},{realm:{card:realm,owner_seat:2},realmDef}); const f=runtimeV02BeginMovementListenerContinuation(s,[ev('became_vanguard','coal')]); assert.equal(f.processed_listener_keys.length,2); assert.equal((incoming.flags as Any).lifecycle_attack_bonus.amount,20);
}

console.log('PASS movement listener representative matrix');

// Fail closed: stale top-deck order, wrong chooser, stale turn, and legacy/no-marker no-op.
{
  const incoming=cr('grave2','shade-graveglider-2'); const outgoing=cr('out2','dummy-out');
  const a=ability('became_vanguard','cold-read-2',{all:[{predicate:'event_subject_is_source'},{predicate:'event_controller_is_active_seat'}]},[{op:'INSPECT_ZONE',player:'opponent',zone:'deck_top',selection:{min:2,max:2,filters:{}},visibility:'controller_private',return_policy:'same_position',as:'looked'},{op:'RETURN_SET_TO_DECK_TOP',player:'opponent',cards:'$looked',order:'controller_choice'}]);
  const s=state(incoming,outgoing,{'shade-graveglider-2':def('Graveglider2',{element:'Shade',ability:a})},{p2Deck:[inst('z1','z1'),inst('z2','z2'),inst('z3','z3')]});
  const f=runtimeV02BeginMovementListenerContinuation(s,[ev('became_vanguard','grave2')]);
  assert.throws(()=>runtimeV02ResolveMovementListenerChoice(s,2,f.pending_choice!.id,f.pending_choice!.options.map(o=>o.id)),/choice_not_yours/);
  s.players['2'].deck[0]=inst('tampered','tampered'); s.card_index.tampered={definition_v0_2:def('tampered')};
  assert.throws(()=>runtimeV02ResolveMovementListenerChoice(s,1,f.pending_choice!.id,f.pending_choice!.options.map(o=>o.id)),/choice_deck_stale/);
}
{
  const incoming=cr('legacy-in','legacy-card'); const outgoing=cr('legacy-out','dummy-out'); const a=ability('became_vanguard','legacy-listener',{all:[{predicate:'event_subject_is_source'}]},[{op:'DRAW',player:'self',count:1}]);
  const s=state(incoming,outgoing,{'legacy-card':def('legacy',{ability:a})},{p1Deck:[inst('should-stay','stay')]}); delete s.runtime_registry_v0_2;
  const f=runtimeV02BeginMovementListenerContinuation(s,[ev('became_vanguard','legacy-in')]); assert.equal(f.status,'complete'); assert.equal(f.processed_listener_keys.length,0); assert.equal(s.players['1'].deck.length,1);
}
{
  const incoming=cr('stale-in','stale-card'); const outgoing=cr('stale-out','dummy-out'); const a=ability('became_vanguard','stale-listener',{all:[{predicate:'event_subject_is_source'}]},[{op:'DRAW',player:'self',count:1}]);
  const s=state(incoming,outgoing,{'stale-card':def('stale',{ability:a})}); const stale=ev('became_vanguard','stale-in'); stale.turn_seq=turn-1;
  assert.throws(()=>runtimeV02BeginMovementListenerContinuation(s,[stale]),/event_turn_stale/);
}
console.log('PASS fail-closed movement cases');
});
