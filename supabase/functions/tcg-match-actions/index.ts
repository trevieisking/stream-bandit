import { createClient } from "jsr:@supabase/supabase-js@2";

const VERSION="Stream Bandit TCG match actions v0.1";
const cors={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"POST, OPTIONS"};
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{...cors,"Content-Type":"application/json","Cache-Control":"no-store"}});
const env=(n:string)=>Deno.env.get(n)||"";
function firstKey(raw:string){if(!raw)return"";try{const x=JSON.parse(raw);if(typeof x==="string")return x;const vals=Array.isArray(x)?x:Object.values(x||{});for(const it of vals){if(typeof it==="string")return it;if(it&&typeof it==="object"){const o=it as Record<string,unknown>;for(const k of ["value","key","secret","api_key"])if(typeof o[k]==="string")return o[k] as string}}}catch{return raw}return""}
const need=(n:string,v:string)=>{if(!v)throw new Error(`Missing ${n}`);return v};
type Inst={uid:string,card_id:string};
type Cr={stack:Inst[],essence:Inst[],relic:Inst|null,damage:number,shield:number,condition?:string|null,conditions?:Record<string,unknown>,flags?:Record<string,unknown>,entered_turn?:number,evolved_turn?:number};
function def(state:any,instOrId:any){const id=typeof instOrId==="string"?instOrId:instOrId?.card_id;return state.card_index?.[id]?.definition||state.card_index?.[id]||null}
function top(cr:Cr,state:any){return cr?.stack?.length?def(state,cr.stack[cr.stack.length-1]):null}
function starterLegal(d:any){return d?.kind==="Creature"&&["Baby","Standalone","Mythic"].includes(String(d.stage||""))}
function getCr(p:any,where:string,index:number|null){if(where==="vanguard")return p.vanguard as Cr|null;if(where==="reserve"&&Number.isInteger(index)&&Number(index)>=0&&Number(index)<4)return p.reserve[Number(index)] as Cr|null;return null}
function allCr(p:any){const out:{where:string,index:number|null,cr:Cr}[]=[];if(p.vanguard)out.push({where:"vanguard",index:null,cr:p.vanguard});for(let i=0;i<4;i++)if(p.reserve?.[i])out.push({where:"reserve",index:i,cr:p.reserve[i]});return out}
function removeHand(p:any,uid:string){const k=p.hand.findIndex((x:Inst)=>x.uid===uid);if(k<0)return null;return p.hand.splice(k,1)[0] as Inst}
function publicField(p:any){return{vanguard:p.vanguard,reserve:p.reserve,discard_count:p.discard.length,void_count:p.void.length,rewards_count:p.rewards.length,deck_count:p.deck.length,hand_count:p.hand.length}}
function makeView(s:any,viewerSeat:number,revision:number){const own=s.players[String(viewerSeat)],opp=s.players[String(viewerSeat===1?2:1)];return{version:s.version,match_id:s.match_id,revision,phase:s.phase,toss_winner_seat:s.toss_winner_seat,first_player_seat:s.first_player_seat,setup_turn_seat:s.setup_turn_seat,active_seat:s.active_seat,turn_seq:s.turn_seq,personal_turns:s.personal_turns,setup_ready:s.setup_ready,realm:s.realm,turn_flags:s.turn_flags||{},log:(s.log||[]).slice(-16),you:{seat:viewerSeat,user_id:own.user_id,hand:own.hand,deck_count:own.deck.length,rewards_count:own.rewards.length,vanguard:own.vanguard,reserve:own.reserve,discard:own.discard,void_count:own.void.length,mulligans:own.mulligans,deck_meta:own.deck_meta},opponent:{seat:opp.seat,user_id:opp.user_id,...publicField(opp),mulligans:opp.mulligans,deck_meta:{name:opp.deck_meta.name,primary_element:opp.deck_meta.primary_element}},card_index:s.card_index}}
function views(s:any,revision:number){return{p1:makeView(s,1,revision),p2:makeView(s,2,revision)}}
function ensureFlags(s:any,seat:number){s.turn_flags=s.turn_flags||{};const k=String(seat);s.turn_flags[k]=s.turn_flags[k]||{};return s.turn_flags[k]}
function addShield(cr:Cr,n:number){cr.shield=Math.min(60,Math.max(0,Number(cr.shield||0)+n))}
function heal(cr:Cr,n:number){cr.damage=Math.max(0,Number(cr.damage||0)-n)}
function conditions(cr:Cr){const q=(cr.conditions||={scorched:false,venomed:0,control:null,modifier:null}) as any;return q}
function clearCond(cr:Cr,c:string){const q=conditions(cr);if(c==="Scorched")q.scorched=false;else if(c==="Venomed")q.venomed=0;else if(q.control===c)q.control=null;else if(q.modifier===c)q.modifier=null}
function isEvolved(d:any){return ["Teen","Adult"].includes(String(d?.stage||""))}
function essenceProvides(d:any){return String(d?.element||"")}
function randomCodeSafe(){return crypto.randomUUID()}

Deno.serve(async(req)=>{
 if(req.method==="OPTIONS")return new Response("ok",{headers:cors});
 if(req.method!=="POST")return json({ok:false,version:VERSION,error:"POST only"},405);
 try{
  const auth=req.headers.get("Authorization")||"";if(!auth.startsWith("Bearer "))return json({ok:false,version:VERSION,error:"signed_in_user_required"},401);
  const url=need("SUPABASE_URL",env("SUPABASE_URL"));const pub=need("publishable key",env("SUPABASE_ANON_KEY")||firstKey(env("SUPABASE_PUBLISHABLE_KEYS")));const svc=need("service role key",env("SUPABASE_SERVICE_ROLE_KEY")||firstKey(env("SUPABASE_SECRET_KEYS")));
  const user=createClient(url,pub,{global:{headers:{Authorization:auth}},auth:{autoRefreshToken:false,persistSession:false}});const admin=createClient(url,svc,{auth:{autoRefreshToken:false,persistSession:false}});
  const {data:ud,error:ue}=await user.auth.getUser();const userId=ud?.user?.id||"";if(ue||!userId)return json({ok:false,version:VERSION,error:"invalid_user_token"},401);
  let body:any={};try{body=await req.json()}catch{return json({ok:false,version:VERSION,error:"invalid_json"},400)}
  const action=String(body.action||"");if(action==="ping")return json({ok:true,version:VERSION,user_id:userId});
  const matchId=String(body.match_id||""),nonce=String(body.client_nonce||""),expected=Number(body.expected_revision);if(!matchId||!nonce||!Number.isInteger(expected)||expected<0)return json({ok:false,version:VERSION,error:"match_id_client_nonce_expected_revision_required"},400);
  const {data:prior,error:priorErr}=await admin.from("tcg_match_commands").select("status,result,expected_revision,resolved_at").eq("match_id",matchId).eq("user_id",userId).eq("client_nonce",nonce).maybeSingle();if(priorErr)throw priorErr;if(prior)return json({ok:true,version:VERSION,replayed:true,result:prior.result,status:prior.status});
  const [{data:st,error:se},{data:ps,error:pe}]=await Promise.all([admin.from("tcg_match_state_private").select("revision,canonical_state").eq("match_id",matchId).maybeSingle(),admin.from("tcg_match_players").select("user_id,seat").eq("match_id",matchId)]);if(se)throw se;if(pe)throw pe;if(!st||!ps?.length)return json({ok:false,version:VERSION,error:"match_not_found"},404);
  const revision=Number(st.revision);if(revision!==expected)return json({ok:false,version:VERSION,error:"stale_revision",expected:revision,received:expected},409);
  const actor=ps.find((x:any)=>x.user_id===userId);if(!actor)return json({ok:false,version:VERSION,error:"not_match_participant"},403);const seat=Number(actor.seat);const s=structuredClone(st.canonical_state as any);if(s.phase!=="play"||Number(s.active_seat)!==seat)return json({ok:false,version:VERSION,error:"not_active_player"},400);const p=s.players[String(seat)],opp=s.players[String(seat===1?2:1)],flags=ensureFlags(s,seat);
  const rpc=async(fn:string,args:any)=>{const {data,error}=await admin.rpc(fn,args);if(error)throw new Error(`${fn}: ${error.message}`);return data};
  const commit=async(eventType:string,payload:any)=>{const next=revision+1;const vv=views(s,next);return await rpc("tcg_server_commit_state",{p_match_id:matchId,p_actor_user_id:userId,p_client_nonce:nonce,p_expected_revision:revision,p_command_type:action,p_new_state:s,p_player_one_id:s.players["1"].user_id,p_player_one_view:vv.p1,p_player_two_id:s.players["2"].user_id,p_player_two_view:vv.p2,p_event_type:eventType,p_public_payload:payload||{}})};
  const log=(m:string)=>{s.log=s.log||[];s.log.push(m)};

  if(action==="play_creature"){
   const uid=String(body.card_uid||""),idx=Number(body.reserve_index);if(!Number.isInteger(idx)||idx<0||idx>3||p.reserve[idx])return json({ok:false,version:VERSION,error:"empty_reserve_slot_required"},400);const inst=p.hand.find((x:Inst)=>x.uid===uid);const d=inst?def(s,inst):null;if(!inst||!starterLegal(d))return json({ok:false,version:VERSION,error:"baby_standalone_or_mythic_required"},400);const x=removeHand(p,uid)!;p.reserve[idx]={stack:[x],essence:[],relic:null,damage:0,shield:0,condition:null,conditions:{scorched:false,venomed:0,control:null,modifier:null},flags:{},entered_turn:Number(s.turn_seq||0),evolved_turn:-1};log(`Seat ${seat} played ${d.name} to Reserve ${idx+1}.`);return json({version:VERSION,result:await commit("play_creature",{seat,reserve_index:idx,card_id:d.id})});
  }

  if(action==="evolve"){
   if(Number(s.personal_turns?.[String(seat)]||0)<=1)return json({ok:false,version:VERSION,error:"evolution_locked_on_first_personal_turn"},400);const uid=String(body.card_uid||""),where=String(body.where||""),idx=body.index==null?null:Number(body.index),cr=getCr(p,where,idx);if(!cr)return json({ok:false,version:VERSION,error:"target_creature_not_found"},400);const inst=p.hand.find((x:Inst)=>x.uid===uid),d=inst?def(s,inst):null,prev=top(cr,s);if(!inst||!d||d.kind!=="Creature"||!["Teen","Adult"].includes(String(d.stage||"")))return json({ok:false,version:VERSION,error:"teen_or_adult_required"},400);if(String(d.evolves_from_id||"")!==String(prev?.id||""))return json({ok:false,version:VERSION,error:"evolution_predecessor_mismatch"},400);const turn=Number(s.turn_seq||0);if(Number(cr.entered_turn??0)>=turn)return json({ok:false,version:VERSION,error:"stack_entered_or_evolved_this_turn"},400);if(Number(cr.evolved_turn??-1)===turn)return json({ok:false,version:VERSION,error:"one_evolution_per_stack_per_turn"},400);const x=removeHand(p,uid)!;cr.stack.push(x);cr.evolved_turn=turn;cr.entered_turn=turn;
   if(d.id==="tide-reefback"||d.id==="stone-cragroller")addShield(cr,20);else if(d.id==="grove-briarback"&&p.reserve.filter(Boolean).length>=2)heal(cr,30);else if(d.id==="shade-veiljaw"&&opp.vanguard){const q=conditions(opp.vanguard);if(!q.control)q.control="Dazed"}
   log(`Seat ${seat} evolved ${prev.name} into ${d.name}.`);return json({version:VERSION,result:await commit("evolve",{seat,where,index:idx,from_card_id:prev.id,to_card_id:d.id})});
  }

  if(action==="attach_essence"){
   const turn=Number(s.turn_seq||0);if(Number(flags.manual_essence_turn??-1)===turn)return json({ok:false,version:VERSION,error:"manual_essence_already_used_this_turn"},400);const uid=String(body.card_uid||""),where=String(body.where||""),idx=body.index==null?null:Number(body.index),cr=getCr(p,where,idx);if(!cr)return json({ok:false,version:VERSION,error:"target_creature_not_found"},400);const inst=p.hand.find((x:Inst)=>x.uid===uid),d=inst?def(s,inst):null;if(!inst||!d||d.kind!=="Essence")return json({ok:false,version:VERSION,error:"essence_card_required"},400);const x=removeHand(p,uid)!;cr.essence.push(x);flags.manual_essence_turn=turn;const td=top(cr,s);
   if(d.id==="ember-smolder-essence"&&cr.damage>0){cr.flags=cr.flags||{};cr.flags.next_attack_bonus=(Number((cr.flags as any).next_attack_bonus||0)+10)}else if(d.id==="ember-hearth-essence"&&cr.damage>0)heal(cr,20);else if(d.id==="tide-calm-essence"&&td?.element==="Tide")heal(cr,20);else if(d.id==="grove-bloom-essence"&&td?.element==="Grove"&&isEvolved(td))heal(cr,20);else if(d.id==="stone-fault-essence"&&td?.element==="Stone")clearCond(cr,"Crushed");
   if(td?.id==="tide-puddlepip"&&d.element==="Tide"){cr.flags=cr.flags||{};const f=cr.flags as any;if(Number(f.freshwater_turn??-1)!==turn){f.freshwater_turn=turn;heal(cr,10)}}
   log(`Seat ${seat} attached ${d.name} to ${td?.name||"a creature"}.`);return json({version:VERSION,result:await commit("attach_essence",{seat,where,index:idx,card_id:d.id,provides:essenceProvides(d)})});
  }

  if(action==="attach_relic"){
   const uid=String(body.card_uid||""),where=String(body.where||""),idx=body.index==null?null:Number(body.index),cr=getCr(p,where,idx);if(!cr)return json({ok:false,version:VERSION,error:"target_creature_not_found"},400);if(cr.relic)return json({ok:false,version:VERSION,error:"creature_already_has_relic"},400);const inst=p.hand.find((x:Inst)=>x.uid===uid),d=inst?def(s,inst):null;if(!inst||!d||d.kind!=="Tactic"||d.family!=="Relic")return json({ok:false,version:VERSION,error:"relic_card_required"},400);cr.relic=removeHand(p,uid)!;const td=top(cr,s);if(td?.id==="stone-flintkin")heal(cr,10);log(`Seat ${seat} attached ${d.name} to ${td?.name||"a creature"}.`);return json({version:VERSION,result:await commit("attach_relic",{seat,where,index:idx,card_id:d.id})});
  }

  if(action==="play_realm"){
   const turn=Number(s.turn_seq||0);if(Number(flags.realm_turn??-1)===turn)return json({ok:false,version:VERSION,error:"realm_already_played_this_turn"},400);const uid=String(body.card_uid||""),inst=p.hand.find((x:Inst)=>x.uid===uid),d=inst?def(s,inst):null;if(!inst||!d||d.kind!=="Tactic"||d.family!=="Realm")return json({ok:false,version:VERSION,error:"realm_card_required"},400);if(s.realm){const old=def(s,s.realm.card);if(old?.id===d.id)return json({ok:false,version:VERSION,error:"same_named_realm_cannot_replace_itself"},400);const owner=s.players[String(s.realm.owner_seat)];if(owner)owner.discard.push(s.realm.card)}s.realm={card:removeHand(p,uid)!,owner_seat:seat,played_turn:turn};flags.realm_turn=turn;log(`Seat ${seat} played Realm ${d.name}.`);return json({version:VERSION,result:await commit("play_realm",{seat,card_id:d.id})});
  }

  return json({ok:false,version:VERSION,error:"unknown_action"},400);
 }catch(e){return json({ok:false,version:VERSION,error:e instanceof Error?e.message:String(e)},500)}
});