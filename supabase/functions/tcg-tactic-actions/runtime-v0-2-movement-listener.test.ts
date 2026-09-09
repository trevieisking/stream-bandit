import assert from 'node:assert/strict';
import {
  runtimeV02BeginMovementListenerContinuation as begin,
  runtimeV02ResolveMovementListenerChoice as resolve,
  runtimeV02PrivateMovementInspectionView as privateView,
  type RuntimeV02SwitchMovementEvent,
} from '../_shared/tcg-match-movement-listener-v0-2.ts';
import { recordRuntimeV02EssenceAttachmentEvent as recordAttach } from '../_shared/tcg-match-essence-attachment-event-v0-2.ts';
import { runtimeV02SnapshotMarker } from '../_shared/tcg-runtime-registry-v0-2.ts';

type A=any;
const T=5, D={expires_on:['end_of_turn'],max_uses:1,consume_on:'legal_voluntary_withdrawal_declared'};
const i=(uid:string,card_id:string)=>({uid,card_id});
const c=(uid:string,card_id:string,o:A={})=>({stack:[i(uid,card_id)],essence:o.essence||[],relic:null,damage:o.damage||0,shield:0,conditions:{scorched:false,venomed:0,control:null,modifier:null},flags:{}});
const raw=(name:string,o:A={})=>({name,card_family:o.card_family||'Creature',element:o.element||'Gale',creature:o.creature??{stage:'Standalone',withdrawal:o.withdrawal??1,ability:o.ability||null},essence:o.essence??null,tactic:o.tactic??null});
const v02=(id:string,d:A)=>({...d,id,schema:'sb-tcg-card-v0.2',effect_schema:'sb-tcg-effects-v0.2'});
const ability=(event:string,id:string,requirements:A,steps:A[],limit:A={scope:'turn',count:1,owner:'card_instance'})=>({id,name:id,mode:'triggered',event,timing:'own_turn',limit,requirements,costs:[],steps});
const ev=(event:'moved_to_reserve'|'became_vanguard',subject_uid:string,action_kind:'attack'|'effect_switch'|'voluntary_withdrawal'='attack'):RuntimeV02SwitchMovementEvent=>({event,subject_uid,controller_seat:1,origin_zone:event==='moved_to_reserve'?'vanguard':'reserve',destination_zone:event==='moved_to_reserve'?'reserve':'vanguard',reserve_index:0,switch_id:'switch:5:1',source_action_id:'test',source_card_uid:null,action_kind,turn_seq:T});
function s(incoming:A,outgoing:A,defs:Record<string,A>,o:A={}){const all:Record<string,A>={'opp':raw('Opp',{element:'Stone'}),'dummy':raw('Dummy'),...defs};for(const z of [o.p1Deck||[],o.p1Hand||[],o.p2Deck||[]])for(const x of z)if(!all[x.card_id])all[x.card_id]=raw(x.card_id);for(const e of incoming.essence||[])if(!all[e.card_id])all[e.card_id]=raw(e.card_id,{card_family:'Essence',creature:null,essence:{listeners:[]}});const state:A={turn_seq:T,active_seat:1,runtime_registry_v0_2:runtimeV02SnapshotMarker(),card_index:Object.fromEntries(Object.entries(all).map(([id,d])=>[id,{definition_v0_2:v02(id,d)}])),players:{'1':{vanguard:incoming,reserve:[outgoing,null,null,null],deck:o.p1Deck||[],hand:o.p1Hand||[],discard:[],void:[],rewards:[]},'2':{vanguard:c('opp','opp'),reserve:[null,null,null,null],deck:o.p2Deck||[],hand:[],discard:[],void:[],rewards:[]}},runtime_v0_2_switch_ledger:{contexts:[{switch_id:'switch:5:1',controller_seat:1,outgoing_vanguard_uid:outgoing.stack[0].uid,incoming_vanguard_uid:incoming.stack[0].uid,reserve_index:0,source_action_id:'test',source_card_uid:null,action_kind:'attack',turn_seq:T}]}};if(o.realm){state.realm=o.realm;state.card_index[o.realm.card.card_id]={definition_v0_2:v02(o.realm.card.card_id,o.realmDef)}}return state;}
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

Deno.test('movement continuation fails closed for stale and legacy state',()=>{
  const a=ability('became_vanguard','x',self,[{op:'DRAW',player:'self',count:1}]);let st=s(c('src','src'),c('out','dummy'),{src:raw('Src',{ability:a})},{p1Deck:[i('stay','stay')]});const stale=ev('became_vanguard','src');stale.turn_seq=T-1;assert.throws(()=>begin(st,[stale]),/event_turn_stale/);st=s(c('src','src'),c('out','dummy'),{src:raw('Src',{ability:a})},{p1Deck:[i('stay','stay')]});delete st.runtime_registry_v0_2;assert.equal(begin(st,[ev('became_vanguard','src')]).processed_listener_keys.length,0);assert.equal(st.players['1'].deck.length,1);
});
