import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'..','..');
const controller=fs.readFileSync(path.join(root,'stream-bandit-tcg-v2-battle-controller.js'),'utf8');
const rendererSource=fs.readFileSync(path.join(root,'stream-bandit-tcg-card-renderer-v2-4-51.js'),'utf8');
const registry=JSON.parse(fs.readFileSync(path.join(root,'assets','tcg','cards','set-one','tcg-card-display-registry-v1.json'),'utf8'));

class FakeClassList{
  constructor(){this.values=new Set();}
  add(...values){values.forEach(v=>this.values.add(v));}
  remove(...values){values.forEach(v=>this.values.delete(v));}
  toggle(value,force){
    if(force===true){this.values.add(value);return true;}
    if(force===false){this.values.delete(value);return false;}
    if(this.values.has(value)){this.values.delete(value);return false;}
    this.values.add(value);return true;
  }
}
class FakeHandCard{
  constructor(uid,intent){this.dataset={playHandUid:uid,playIntent:intent};this.listeners=new Map();this.classList=new FakeClassList();}
  addEventListener(type,fn){this.listeners.set(type,fn);}
  async click(){return this.listeners.get('click')({target:this});}
}
class FakeNode{
  constructor(id,document){
    this.id=id;this.document=document;this.dataset={};this.textContent='';this._innerHTML='';
    this.listeners=new Map();this.classList=new FakeClassList();this.className='';this.hidden=false;this.src='';this.alt='';
  }
  addEventListener(type,fn){this.listeners.set(type,fn);}
  removeAttribute(name){if(name==='src')this.src='';}
  set innerHTML(value){
    this._innerHTML=String(value);
    if(this.id==='yourHand'){
      const cards=[...this._innerHTML.matchAll(/data-play-hand-uid="([^"]+)" data-play-intent="([^"]+)"/g)];
      this.document.playHandCards=cards.map(m=>new FakeHandCard(m[1],m[2]));
    }
  }
  get innerHTML(){return this._innerHTML;}
  async click(){
    const fn=this.listeners.get('click');
    assert.equal(typeof fn,'function',this.id+' must bind click');
    return fn({target:{closest(){return null;}}});
  }
}

function matchView(revision,attached){
  return {
    revision,
    view_state:{
      phase:'play',
      active_seat:1,
      personal_turns:{'1':2,'2':1},
      you:{
        seat:1,
        vanguard:{
          stack:[{uid:'orbitortoise-live-1',card_id:'astral-orbitortoise'}],
          damage:0,
          essence:attached?[{uid:'essence-live-1',card_id:'astral-basic-astral-essence'}]:[],
          shield:0,
          relic:null
        },
        reserve:[null,null,null,null],
        hand:attached?[]:[{uid:'essence-live-1',card_id:'astral-basic-astral-essence'}],
        discard:[],rewards_count:6,deck_count:52,mulligans:0
      },
      opponent:{
        seat:2,vanguard:null,reserve:[null,null,null,null],hand_count:7,deck_count:53,discard_count:0,rewards_count:6
      },
      card_index:{
        'astral-orbitortoise':{
          definition:{id:'astral-orbitortoise',name:'Orbitortoise',kind:'Creature',stage:'Standalone',hp:170,element:'Astral'},
          definition_v0_2:registry.records.find(r=>r.card_id==='astral-orbitortoise').definition
        },
        'astral-basic-astral-essence':{
          definition:{id:'astral-basic-astral-essence',name:'Basic Astral Essence',kind:'Essence',card_family:'Essence',element:'Astral'},
          definition_v0_2:registry.records.find(r=>r.card_id==='astral-basic-astral-essence').definition
        }
      }
    }
  };
}

function makeHarness(){
  const nodes=new Map();
  let authoritativeAttached=false;
  const document={
    rails:[],
    baseURI:'https://example.test/tcg-battle-v2.html',
    playHandCards:[],
    getElementById(id){if(!nodes.has(id))nodes.set(id,new FakeNode(id,document));return nodes.get(id);},
    querySelectorAll(selector){
      if(selector==='[data-play-hand-uid]')return document.playHandCards;
      if(selector==='[data-play-where]')return [...nodes.values()].filter(node=>node.dataset&&node.dataset.playWhere);
      return [];
    }
  };
  let domReady=null;
  const requests=[];
  const session={access_token:'test-token'};
  const client={auth:{async getSession(){return {data:{session}};}}};
  const window={
    location:{search:'?match_id=essence-orb-proof',href:'https://example.test/tcg-battle-v2.html'},
    StreamBanditShell:{config(){return {url:'https://example.supabase.co',key:'anon-key'};}},
    StreamBanditAuthGate:{async enforce(){return {allowed:true};}},
    supabase:{createClient(){return client;}},
    addEventListener(type,listener){if(type==='DOMContentLoaded')domReady=listener;},
    requestAnimationFrame(fn){fn();return 1;}
  };
  let viewCalls=0;
  async function fetch(url,options={}){
    if(String(url).endsWith('/assets/tcg/cards/set-one/tcg-card-display-registry-v1.json')){
      return {ok:true,status:200,async json(){return registry;}};
    }
    const payload=JSON.parse(options.body||'{}');
    requests.push({url:String(url),payload});
    if(String(url).endsWith('/functions/v1/tcg-private-alpha-api')){
      viewCalls+=1;
      return {ok:true,status:200,async json(){return {ok:true,view:matchView(viewCalls>1?18:17,authoritativeAttached)};}};
    }
    if(String(url).endsWith('/functions/v1/tcg-match-actions')){
      if(payload.action==='field_actions'){
        return {ok:true,status:200,async json(){return {ok:true,result:{ability_sources:[],attacks:[],withdraw:{eligible:false}}};}};
      }
      if(payload.action==='attach_essence'){
        authoritativeAttached=true;
        return {ok:true,status:200,async json(){return {ok:true,result:{ok:true}};}};
      }
    }
    throw new Error('Unexpected fetch: '+url+' '+payload.action);
  }
  let nonce=0;
  const context={
    window,document,fetch,URL,URLSearchParams,setTimeout,clearTimeout,setInterval(){return 1;},clearInterval(){},console,
    crypto:{randomUUID(){nonce+=1;return 'nonce-'+nonce;}}
  };
  vm.runInNewContext(rendererSource,context,{filename:'stream-bandit-tcg-card-renderer-v2-4-51.js'});
  vm.runInNewContext(controller,context,{filename:'stream-bandit-tcg-v2-battle-controller.js'});
  assert.equal(typeof domReady,'function');
  return {
    document,nodes,requests,
    controllerApi:window.StreamBanditTCGV2BattleController,
    setAuthoritativeAttached(value){authoritativeAttached=!!value;},
    async boot(){await domReady();}
  };
}

test('authoritative Essence attachment appears as an element orb on refreshed Creature card',async()=>{
  const h=makeHarness();
  await h.boot();

  const before=h.nodes.get('youVanguard').innerHTML;
  assert.doesNotMatch(before,/data-essence-rail/,'Creature with no attached Essence must not show a rail');

  assert.equal(h.document.playHandCards.length,1);
  await h.document.playHandCards[0].click();
  const target=h.nodes.get('youVanguardSlot');
  assert.match(target.className,/is-play-legal/);
  await target.click();

  const attach=h.requests.filter(r=>r.url.endsWith('/functions/v1/tcg-match-actions')&&r.payload.action==='attach_essence');
  assert.equal(attach.length,1);
  assert.equal(attach[0].payload.card_uid,'essence-live-1');
  assert.equal(attach[0].payload.where,'vanguard');

  const after=h.nodes.get('youVanguard').innerHTML;
  assert.match(after,/data-essence-rail/);
  assert.match(after,/aria-label="Attached Essence: 1 Astral"/);
  assert.match(after,/data-essence-element="Astral"/);
  assert.match(after,/data-essence-count="1"/);
  assert.match(after,/Essence <strong>1<\/strong>/);

  h.setAuthoritativeAttached(false);
  await h.controllerApi.refresh();
  const removed=h.nodes.get('youVanguard').innerHTML;
  assert.doesNotMatch(removed,/data-essence-rail/,'authoritative removal must remove the visual rail on refresh');
  assert.match(removed,/Essence <strong>0<\/strong>/);
});


test('Essence rail compression is driven by rendered overflow and can expand again',async()=>{
  const h=makeHarness();
  const rail={
    clientWidth:80,
    classList:new FakeClassList(),
    querySelector(selector){
      if(selector==='[data-essence-expanded]')return {scrollWidth:120};
      return null;
    }
  };
  h.document.rails=[rail];
  await h.boot();
  assert.equal(rail.classList.contains('is-compressed'),true,'rail wider than available card space must compress');

  rail.querySelector=(selector)=>selector==='[data-essence-expanded]'?{scrollWidth:60}:null;
  await h.controllerApi.refresh();
  assert.equal(rail.classList.contains('is-compressed'),false,'rail must expand again when authoritative presentation fits');
});
