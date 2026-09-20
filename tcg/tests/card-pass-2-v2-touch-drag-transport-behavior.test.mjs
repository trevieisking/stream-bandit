import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'..','..');
const controller=fs.readFileSync(path.join(root,'stream-bandit-tcg-v2-battle-controller.js'),'utf8');
const cardRenderer=fs.readFileSync(path.join(root,'stream-bandit-tcg-card-renderer-v2-4-51.js'),'utf8');
const registry=JSON.parse(fs.readFileSync(path.join(root,'assets','tcg','cards','set-one','tcg-card-display-registry-v1.json'),'utf8'));

class FakeClassList{
  constructor(){this.values=new Set();}
  add(...values){values.forEach(v=>this.values.add(v));}
  remove(...values){values.forEach(v=>this.values.delete(v));}
  contains(value){return this.values.has(value);}
  toggle(value,force){
    if(force===true){this.values.add(value);return true;}
    if(force===false){this.values.delete(value);return false;}
    if(this.values.has(value)){this.values.delete(value);return false;}
    this.values.add(value);return true;
  }
}
class FakeHandCard{
  constructor(uid,intent){
    this.dataset={playHandUid:uid,playIntent:intent};
    this.listeners=new Map();this.classList=new FakeClassList();this.attributes={};
  }
  addEventListener(type,fn){this.listeners.set(type,fn);}
  setAttribute(name,value){this.attributes[name]=String(value);}
  removeAttribute(name){delete this.attributes[name];}
  async click(){
    const fn=this.listeners.get('click');
    assert.equal(typeof fn,'function');
    return fn({target:this});
  }
  touchStart(x,y){
    const fn=this.listeners.get('touchstart');
    assert.equal(typeof fn,'function','coarse-touch playable card must bind touchstart');
    return fn({touches:[{clientX:x,clientY:y}]});
  }
  touchMove(x,y){
    const fn=this.listeners.get('touchmove');
    assert.equal(typeof fn,'function','coarse-touch playable card must bind touchmove');
    let prevented=false;
    fn({touches:[{clientX:x,clientY:y}],cancelable:true,preventDefault(){prevented=true;}});
    return prevented;
  }
  async touchEnd(x,y){
    const fn=this.listeners.get('touchend');
    assert.equal(typeof fn,'function','coarse-touch playable card must bind touchend');
    let prevented=false;
    await fn({changedTouches:[{clientX:x,clientY:y}],cancelable:true,preventDefault(){prevented=true;}});
    return prevented;
  }
}
class FakeNode{
  constructor(id,document){
    this.id=id;this.document=document;this.dataset={};this.textContent='';this._innerHTML='';
    this.listeners=new Map();this.classList=new FakeClassList();this.className='';this.hidden=false;this.src='';this.alt='';
  }
  addEventListener(type,fn){this.listeners.set(type,fn);}
  removeAttribute(name){if(name==='src')this.src='';}
  closest(selector){
    if(selector==='[data-play-where]' && this.dataset.playWhere!=null)return this;
    if(selector==='[data-setup-destination]' && this.dataset.setupDestination!=null)return this;
    return null;
  }
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

function playableView(revision=17){
  return {
    revision,
    view_state:{
      phase:'play',active_seat:1,personal_turns:{'1':2,'2':1},
      you:{
        seat:1,
        vanguard:{stack:[{uid:'orbitortoise-1',card_id:'astral-orbitortoise'}],damage:0,essence:[],shield:0,relic:null},
        reserve:[null,null,null,null],
        hand:[{uid:'essence-hand-1',card_id:'astral-basic-astral-essence'}],
        discard:[],rewards_count:6,deck_count:52,mulligans:0
      },
      opponent:{seat:2,vanguard:null,reserve:[null,null,null,null],hand_count:7,deck_count:53,discard_count:0,rewards_count:6},
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
  const timerQueue=[];
  const document={
    baseURI:'https://example.test/tcg-battle-v2.html',
    playHandCards:[],
    dropTarget:null,
    getElementById(id){if(!nodes.has(id))nodes.set(id,new FakeNode(id,document));return nodes.get(id);},
    elementFromPoint(){return document.dropTarget;},
    querySelectorAll(selector){
      if(selector==='[data-play-hand-uid]')return document.playHandCards;
      if(selector==='[data-play-where]')return [...nodes.values()].filter(n=>n.dataset&&n.dataset.playWhere!=null);
      if(selector==='[data-setup-destination]')return [...nodes.values()].filter(n=>n.dataset&&n.dataset.setupDestination!=null);
      if(selector==='[data-essence-rail]')return [];
      if(selector==='.is-touch-drag-over')return [...nodes.values()].filter(n=>n.classList&&n.classList.contains('is-touch-drag-over'));
      return [];
    }
  };
  let domReady=null;
  const requests=[];
  const session={access_token:'test-token'};
  const client={auth:{async getSession(){return {data:{session}};}}};
  const window={
    location:{search:'?match_id=touch-drag-proof',href:'https://example.test/tcg-battle-v2.html'},
    StreamBanditShell:{config(){return {url:'https://example.supabase.co',key:'anon-key'};}},
    StreamBanditAuthGate:{async enforce(){return {allowed:true};}},
    supabase:{createClient(){return client;}},
    matchMedia(){return {matches:true};},
    requestAnimationFrame(fn){fn();return 1;},
    addEventListener(type,listener){if(type==='DOMContentLoaded')domReady=listener;}
  };
  async function fetch(url,options={}){
    if(String(url).endsWith('/assets/tcg/cards/set-one/tcg-card-display-registry-v1.json')){
      return {ok:true,status:200,async json(){return registry;}};
    }
    const payload=JSON.parse(options.body||'{}');
    requests.push({url:String(url),payload});
    if(String(url).endsWith('/functions/v1/tcg-private-alpha-api')){
      return {ok:true,status:200,async json(){return {ok:true,view:playableView(17)};}};
    }
    if(String(url).endsWith('/functions/v1/tcg-match-actions')){
      if(payload.action==='field_actions'){
        return {ok:true,status:200,async json(){return {ok:true,result:{ability_sources:[],attacks:[],withdraw:{eligible:false}}};}};
      }
      if(payload.action==='attach_essence'){
        return {ok:true,status:200,async json(){return {ok:true,result:{ok:true}};}};
      }
    }
    throw new Error('Unexpected fetch '+url+' '+payload.action);
  }
  let nonce=0;
  const context={
    window,document,fetch,URL,URLSearchParams,console,
    crypto:{randomUUID(){nonce+=1;return 'nonce-'+nonce;}},
    setTimeout(fn){timerQueue.push(fn);return timerQueue.length;},
    clearTimeout(){},
    setInterval(){return 1;},clearInterval(){}
  };
  vm.runInNewContext(cardRenderer,context,{filename:'stream-bandit-tcg-card-renderer-v2-4-51.js'});
  vm.runInNewContext(controller,context,{filename:'stream-bandit-tcg-v2-battle-controller.js'});
  assert.equal(typeof domReady,'function');
  return {
    document,nodes,requests,
    flushHold(){const fn=timerQueue.shift();assert.equal(typeof fn,'function');fn();},
    async boot(){await domReady();}
  };
}

test('coarse-touch long-press drag submits the same authoritative Essence attachment command as tap mode',async()=>{
  const h=makeHarness();
  await h.boot();
  assert.equal(h.document.playHandCards.length,1);
  const card=h.document.playHandCards[0];
  assert.equal(card.dataset.playIntent,'attach_essence');

  const target=h.nodes.get('youVanguardSlot');
  h.document.dropTarget=target;

  card.touchStart(20,20);
  h.flushHold();
  assert.equal(card.attributes['aria-grabbed'],'true');
  assert.equal(card.classList.contains('is-touch-dragging'),true);

  const movePrevented=card.touchMove(44,72);
  assert.equal(movePrevented,true,'active touch drag must prevent page scroll only after hold activation');
  assert.equal(target.classList.contains('is-touch-drag-over'),true,'legal destination must glow beneath the finger');

  const endPrevented=await card.touchEnd(44,72);
  assert.equal(endPrevented,true);

  const attach=h.requests.filter(r=>r.url.endsWith('/functions/v1/tcg-match-actions')&&r.payload.action==='attach_essence');
  assert.equal(attach.length,1,'one finger drop must submit one authoritative action');
  assert.deepEqual(JSON.parse(JSON.stringify(attach[0].payload)),{
    action:'attach_essence',
    match_id:'touch-drag-proof',
    client_nonce:'nonce-2',
    expected_revision:17,
    card_uid:'essence-hand-1',
    where:'vanguard'
  });
});

test('coarse-touch tap-select -> highlighted destination remains a working fallback',async()=>{
  const h=makeHarness();
  await h.boot();
  const card=h.document.playHandCards[0];
  await card.click();

  const target=h.nodes.get('youVanguardSlot');
  assert.match(target.className,/is-play-legal/);
  await target.click();

  const attach=h.requests.filter(r=>r.url.endsWith('/functions/v1/tcg-match-actions')&&r.payload.action==='attach_essence');
  assert.equal(attach.length,1);
  assert.equal(attach[0].payload.card_uid,'essence-hand-1');
  assert.equal(attach[0].payload.where,'vanguard');
});

test('touch drag reuses existing setup/play command owners and contains no alternate mobile rules engine',()=>{
  assert.match(controller,/bindTouchHandDrag\(card, 'play'\)/);
  assert.match(controller,/bindTouchHandDrag\(card, 'setup'\)/);
  assert.match(controller,/await runPlayHandTarget\(coords\.where, coords\.index\)/);
  assert.match(controller,/await runSetupPlace\(uid, coords\.where, coords\.index\)/);
  assert.match(controller,/playTargetLegal\(coords\.where, coords\.index/);
  assert.match(controller,/setupTargetLegal\(coords\.where, coords\.index\)/);
  assert.doesNotMatch(controller,/mobileRulesEngine|touchRulesEngine|mobileAttachEssence/);
});
