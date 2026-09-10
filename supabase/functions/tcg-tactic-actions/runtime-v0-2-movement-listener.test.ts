import assert from 'node:assert/strict';
import {
  runtimeV02BeginMovementListenerContinuation as begin,
  runtimeV02CreateEssenceMovedEvent as essenceMoved,
  runtimeV02ResolveMovementListenerChoice as resolve,
  runtimeV02PrivateMovementInspectionView as privateView,
} from '../_shared/tcg-match-movement-listener-v0-2.ts';
import type { RuntimeV02SwitchMovementEvent } from '../_shared/tcg-match-switch-context-v0-2.ts';
import { recordRuntimeV02EssenceAttachmentEvent as recordAttach } from '../_shared/tcg-match-essence-attachment-event-v0-2.ts';
import { runtimeV02SnapshotMarker } from '../_shared/tcg-runtime-registry-v0-2.ts';

type A=any;
const T=5, D={expires_on:['end_of_turn'],max_uses:1,consume_on:'legal_voluntary_withdrawal_declared'};
const i=(uid:string,card_id:string)=>({uid,card_id});
const c=(uid:string,card_id:string,o:A={})=>({stack:[i(uid,card_id)],essence:o.essence||[],relic:o.relic||null,damage:o.damage||0,shield:o.shield||0,conditions:{scorched:false,venomed:0,control:null,modifier:null},flags:{}});
const raw=(name:string,o:A={})=>({name,card_family:o.card_family||'Creature',element:o.element||'Gale',creature:o.creature??{stage:'Standalone',withdrawal:o.withdrawal??1,ability:o.ability||null},essence:o.essence??null,tactic:o.tactic??null});
const v02=(id:string,d:A)=>({...d,id,schema:'sb-tcg-card-v0.2',effect_schema:'sb-tcg-effects-v0.2'});
const ability=(event:string,id:string,requirements:A,steps:A[],limit:A={scope:'turn',count:1,owner:'card_instance'})=>({id,name:id,mode:'triggered',event,timing:'own_turn',limit,requirements,costs:[],steps});
const ev=(event:'moved_to_reserve'|'became_vanguard',subject_uid:string,action_kind:'attack'|'effect_switch'|'voluntary_withdrawal'='attack'):RuntimeV02SwitchMovementEvent=>({event,subject_uid,controller_seat:1,origin_zone:event==='moved_to_reserve'?'vanguard':'reserve',destination_zone:event==='moved_to_reserve'?'reserve':'vanguard',reserve_index:0,switch_id:'switch:5:1',source_action_id:'test',source_card_uid:null,action_kind,turn_seq:T});
const em=(source_creature_uid:string,destination_creature_uid:string,o:A={})=>essenceMoved({turn_seq:T,controller_seat:o.controller_seat||1,source_creature_uid,destination_creature_uid,essence_uid:o.essence_uid||'tide-essence-uid',element:o.element||'Tide',source_action_id:o.source_action_id||'tactic:test'});
function s(incoming:A,outgoing:A,defs:Record<string,A>,o:A={}){const all:Record<string,A>={'opp':raw('Opp',{element:'Stone'}),'dummy':raw('Dummy'),'tide-basic':raw('Tide Basic',{card_family:'Essence',element:'Tide',creature:null,essence:{listeners:[]}}),...defs};for(const z of [o.p1Deck||[],o.p1Hand||[],o.p2Deck||[]])for(const x of z)if(!all[x.card_id])all[x.card_id]=raw(x.card_id);for(const e of incoming.essence||[])if(!all[e.card_id])all[e.card_id]=raw(e.card_id,{card_family:'Essence',creature:null,essence:{listeners:[]}});for(const e of outgoing.essence||[])if(!all[e.card_id])all[e.card_id]=raw(e.card_id,{card_family:'Essence',creature:null,essence:{listeners:[]}});for(const relic of [incoming.relic,outgoing.relic].filter(Boolean))if(!all[relic.card_id])all[relic.card_id]=raw(relic.card_id,{card_family:'Tactic',creature:null,tactic:{subtype:'Relic',listeners:[]}});const state:A={turn_seq:T,active_seat:1,runtime_registry_v0_2:runtimeV02SnapshotMarker(),card_index:Object.fromEntries(Object.entries(all).map(([id,d])=>[id,{definition_v0_2:v02(id,d)}])),players:{'1':{vanguard:incoming,reserve:[outgoing,null,null,null],deck:o.p1Deck||[],hand:o.p1Hand||[],discard:[],void:[],rewards:[]},'2':{vanguard:c('opp','opp'),reserve:[null,null,null,null],deck:o.p2Deck||[],hand:[],discard:[],void:[],rewards:[]}},runtime_v0_2_switch_ledger:{contexts:[{switch_id:'switch:5:1',controller_seat:1,outgoing_vanguard_uid:outgoing.stack[0].uid,incoming_vanguard_uid:incoming.stack[0].uid,reserve_index:0,source_action_id:'test',source_card_uid:null,action_kind:'attack',turn_seq:T}]}};if(o.realm){state.realm=o.realm;state.card_index[o.realm.card.card_id]={definition_v0_2:v02(o.realm.card.card_id,o.realmDef)}}return state;}
const self={all:[{predicate:'event_subject_is_source'},{predicate:'event_controller_is_active_seat'}]};

Deno.test('movement continuation preserves private choices and same-position inspection',()=>{
  const sky=ability('became_vanguard','crosswind',self,[{op:'DRAW',player:'self',count:1},{op:'CHOOSE_HAND_TO_DISCARD',player:'self',count:1}]);
  let st=s(c('sky','sky'),c('out','dummy'),{sky:raw('Sky',{ability:sky})},{p1Deck:[i('d','d')],p1Hand:[i('h','h')]});
  let f=begin(st,[ev('became_vanguard','sky')]);assert.equal(f.status,'player_choice_required');resolve(st,1,f.pending_choice!.id,[f.pending_choice!.options[0].id]);assert.equal(st.players['1'].discard.length,1);assert.equal(begin(st,[ev('became_vanguard','sky')]).processed_listener_keys.length,0);

  const grave=ability('became_vanguard','cold-read',self,[{op:'INSPECT_ZONE',player:'opponent',zone:'deck_top',selection:{min:2,max:2,filters:{}},visibility:'controller_private',return_policy:'same_position',as:'looked'},{op:'RETURN_SET_TO_DECK_TOP',player:'opponent',cards:'$looked',order:'controller_choice'}]);
  st=s(c('grave','grave'),c('out','dummy'),{grave:raw('Grave',{element:'Shade',ability:grave})},{p2Deck:[i('a','a'),i('b','b'),i('c','c')]});f=begin(st,[ev('became_vanguard','grave')]);assert.deepEqual(privateView(st,1)!.cards.map(x=>x.uid),['a','b']);assert.equal(privateView(st,2),null);assert.deepEqual(st.players['2'].deck.map((x:A)=>x.uid),['a','b','c']);resolve(st,1,f.pending_choice!.id,[f.pending_choice!.options[1].id,f.pending_choice!.options[0].id]);assert.deepEqual(st.players['2'].deck.map((x:A)=>x.uid),['b','a','c']);
});

Deno.test('Jetstream uses exact hand-origin evidence and Caldera stays structured',()=>{
  const jet=i('jet','jet'), listener={id:'jetstream-vanguard-window',event:'became_vanguard',requirements:{all:[{predicate:'event_subject_is_attached_creature'},{predicate:'event_occurred',event:'essence_attached',controller:'self',window:'current_turn',filters:{source_card_uid:'self',origin_zone:'hand'},min_count:1}]},limit:{scope:'attachment',count:1,owner:'attachment'},steps:[{op:'SET_WITHDRAWAL_MODIFIER',target:'$attached_creature',mode:'set',amount:0,minimum:0,duration:D}]};
  let incoming=c('target','target',{essence:[jet]}),st=s(incoming,c('out','dummy'),{target:raw('Target',{withdrawal:2}),jet:raw('Jet',{card_family:'Essence',creature:null,essence:{listeners:[listener]}})});assert.equal(begin(st,[ev('became_vanguard','target')]).processed_listener_keys.length,0);recordAttach(st,1,'target',jet,'hand','manual_essence');assert.equal(begin(st,[ev('became_vanguard','target')]).processed_listener_keys.length,1);assert.equal((incoming.flags as A).lifecycle_withdrawal_cost.value,0);

  const realm=i('realm','caldera'), r={id:'caldera-nonember-withdrawal-damage',event:'moved_to_reserve',controller_scope:'any',requirements:{all:[{predicate:'event_action_kind_is',action_kind:'voluntary_withdrawal'},{not:{predicate:'event_subject_matches',filters:{element:'Ember'}}}]},limit:null,steps:[{op:'DIRECT_DAMAGE',target:'$event_subject',amount:10,damage_class:'effect'}]};const out=c('stone','stone');st=s(c('in','dummy'),out,{stone:raw('Stone',{element:'Stone'})},{realm:{card:realm,owner_seat:2},realmDef:raw('Caldera',{card_family:'Tactic',element:'Ember',creature:null,tactic:{subtype:'Realm',listeners:[r]}})});begin(st,[ev('moved_to_reserve','stone','voluntary_withdrawal')]);assert.equal(out.damage,10);
});

Deno.test('essence_moved adapter is deterministic and Reefshell gains Shield once per turn',()=>{
  const reef=ability('essence_moved','breakwater-current',{all:[{predicate:'essence_move_destination_is_self'},{predicate:'essence_move_element_is',element:'Tide'},{predicate:'source_controller_is_self'}]},[{op:'ADD_SHIELD',target:'$source_creature',amount:20}]);
  const reefCr=c('reef','reef');const st=s(reefCr,c('other','dummy'),{reef:raw('Reefshell',{element:'Tide',ability:reef})});
  const event=em('other','reef');assert.equal(event.movement_id,em('other','reef').movement_id);
  assert.equal(begin(st,[event]).processed_listener_keys.length,1);assert.equal(reefCr.shield,20);
  assert.equal(begin(st,[em('other','reef',{essence_uid:'second'})]).processed_listener_keys.length,0);assert.equal(reefCr.shield,20);
});

Deno.test('Rillrunner reacts when Tide Essence leaves or reaches itself and installs the one-use declaration bonus',()=>{
  const duration={expires_on:['end_of_turn'],max_uses:1,consume_on:'legal_attack_declared'};
  const run=ability('essence_moved','running-current',{all:[{predicate:'essence_move_element_is',element:'Tide'},{any:[{predicate:'essence_move_source_is_self'},{predicate:'essence_move_destination_is_self'}]},{predicate:'source_controller_is_self'}]},[{op:'ADD_ATTACK_DAMAGE_MODIFIER',target:'$source_creature',amount:10,duration}]);
  const rill=c('rill','rill');let st=s(rill,c('other','dummy'),{rill:raw('Rillrunner',{element:'Tide',ability:run})});
  assert.equal(begin(st,[em('rill','other')]).processed_listener_keys.length,1);assert.deepEqual((rill.flags as A).lifecycle_attack_bonus,{turn_seq:T,amount:10,uses:1,expires:'end_of_turn'});
  const rill2=c('rill2','rill2');st=s(rill2,c('other2','dummy'),{rill2:raw('Rillrunner',{element:'Tide',ability:run})});assert.equal(begin(st,[em('other2','rill2',{element:'Volt'})]).processed_listener_keys.length,0);assert.equal((rill2.flags as A).lifecycle_attack_bonus,undefined);
});

Deno.test('Tidal Lens heals its damaged attached creature through a canonical packet once per turn',()=>{
  const lensListener={id:'tidal-lens-heal',event:'essence_moved',requirements:{all:[{predicate:'essence_move_source_is_attached_creature'},{predicate:'essence_move_element_is',element:'Tide'},{predicate:'source_controller_is_self'},{predicate:'target_damaged',target:'$attached_creature'}]},limit:{scope:'turn',count:1,owner:'attachment'},steps:[{op:'HEAL',target:'$attached_creature',amount:10}]};
  const host=c('host','host',{damage:30,relic:i('lens','lens')});const st=s(host,c('other','dummy'),{host:raw('Host',{element:'Tide'}),lens:raw('Tidal Lens',{card_family:'Tactic',element:'Tide',creature:null,tactic:{subtype:'Relic',listeners:[lensListener]}})});
  const first=begin(st,[em('host','other')]);assert.equal(first.status,'complete');assert.equal(first.emitted_heal_packet_ids.length,1);assert.equal(host.damage,20);
  const second=begin(st,[em('host','other',{essence_uid:'second'})]);assert.equal(second.processed_listener_keys.length,0);assert.equal(host.damage,20);
});

Deno.test('essence_moved listeners require their own controller and legacy state remains a no-op',()=>{
  const reef=ability('essence_moved','breakwater-current',{all:[{predicate:'essence_move_destination_is_self'},{predicate:'essence_move_element_is',element:'Tide'},{predicate:'source_controller_is_self'}]},[{op:'ADD_SHIELD',target:'$source_creature',amount:20}]);
  const reefCr=c('reef','reef');let st=s(reefCr,c('other','dummy'),{reef:raw('Reefshell',{element:'Tide',ability:reef})});assert.equal(begin(st,[em('other','reef',{controller_seat:2})]).processed_listener_keys.length,0);assert.equal(reefCr.shield,0);
  st=s(reefCr,c('other','dummy'),{reef:raw('Reefshell',{element:'Tide',ability:reef})});delete st.runtime_registry_v0_2;assert.equal(begin(st,[em('other','reef')]).processed_listener_keys.length,0);assert.equal(reefCr.shield,0);
});

Deno.test('movement continuation fails closed for stale and legacy state',()=>{
  const a=ability('became_vanguard','x',self,[{op:'DRAW',player:'self',count:1}]);let st=s(c('src','src'),c('out','dummy'),{src:raw('Src',{ability:a})},{p1Deck:[i('stay','stay')]});const stale=ev('became_vanguard','src');stale.turn_seq=T-1;assert.throws(()=>begin(st,[stale]),/event_turn_stale/);st=s(c('src','src'),c('out','dummy'),{src:raw('Src',{ability:a})},{p1Deck:[i('stay','stay')]});delete st.runtime_registry_v0_2;assert.equal(begin(st,[ev('became_vanguard','src')]).processed_listener_keys.length,0);assert.equal(st.players['1'].deck.length,1);
});
