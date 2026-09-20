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
const activeRecord=registry.records.find(row=>row.card_family==='Creature'&&row.definition?.creature?.ability?.mode==='active');
assert.ok(activeRecord,'Set One must expose an active Ability card for the browser glow proof');

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
class FakeAbilityButton{
  constructor(where,index){this.dataset={abilityWhere:where,abilityIndex:index};this.listeners=new Map();this.disabled=false;}
  addEventListener(type,fn){this.listeners.set(type,fn);}
  async click(){
    const fn=this.listeners.get('click');
    assert.equal(typeof fn,'function','active Ability control must bind click');
    return fn({preventDefault(){},stopPropagation(){}});
  }
}
class FakeNode{
  constructor(id,document){
    this.id=id;this.document=document;this.dataset={};this.classList=new FakeClassList();this.className='';
    this.listeners=new Map();this.textContent='';this._innerHTML='';this.hidden=false;this.src='';this.alt='';
  }
  addEventListener(type,fn){this.listeners.set(type,fn);}
  removeAttribute(name){if(name==='src')this.src='';}
  set innerHTML(value){
    this._innerHTML=String(value);
    if(this.id==='youVanguard'){
      const match=this._innerHTML.match(/data-card-intent="ability" data-ability-where="([^"]*)" data-ability-index="([^"]*)"/);
      this.document.abilityButtons=match?[new FakeAbilityButton(match[1],match[2])]:[];
    }
  }
  get innerHTML(){return this._innerHTML;}
}

function matchView(){
  const hp=Number(activeRecord.definition?.creature?.hp||100);
  return {
    revision:23,
    view_state:{
      phase:'play',active_seat:1,personal_turns:{'1':2,'2':1},
      you:{
        seat:1,
        vanguard:{stack:[{uid:'active-source-1',card_id:activeRecord.card_id}],damage:0,essence:[],shield:0,relic:null},
        reserve:[null,null,null,null],hand:[],discard:[],rewards_count:6,deck_count:50,mulligans:0
      },
      opponent:{seat:2,vanguard:null,reserve:[null,null,null,null],hand_count:7,deck_count:53,discard_count:0,rewards_count:6},
      card_index:{
        [activeRecord.card_id]:{
          definition:{
            id:activeRecord.card_id,name:activeRecord.name,kind:'Creature',
            stage:String(activeRecord.definition?.creature?.stage||'Standalone'),
            hp,element:activeRecord.element
          },
          definition_v0_2:activeRecord.definition
        }
      }
    }
  };
}

function makeHarness(){
  const nodes=new Map();
  const document={
    baseURI:'https://example.test/tcg-battle-v2.html',
    abilityButtons:[],
    getElementById(id){if(!nodes.has(id))nodes.set(id,new FakeNode(id,document));return nodes.get(id);},
    querySelectorAll(selector){
      if(selector==='[data-card-intent="ability"]')return document.abilityButtons;
      if(selector==='[data-essence-rail]')return [];
      return [];
    }
  };
  let domReady=null;
  let abilityUsed=false;
  const requests=[];
  const session={access_token:'test-token'};
  const client={auth:{async getSession(){return {data:{session}};}}};
  const window={
    location:{search:'?match_id=ability-glow-proof',href:'https://example.test/tcg-battle-v2.html'},
    StreamBanditShell:{config(){return {url:'https://example.supabase.co',key:'anon-key'};}},
    StreamBanditAuthGate:{async enforce(){return {allowed:true};}},
    supabase:{createClient(){return client;}},
    matchMedia(){return {matches:false};},
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
      return {ok:true,status:200,async json(){return {ok:true,view:matchView()};}};
    }
    if(String(url).endsWith('/functions/v1/tcg-match-actions')){
      if(payload.action==='field_actions'){
        return {ok:true,status:200,async json(){return {ok:true,result:{
          ability_sources:abilityUsed?[]:[{where:'vanguard',index:null,anchor_uid:'active-source-1'}],
          attacks:[],withdraw:{eligible:false}
        }};}};
      }
      if(payload.action==='use_ability'){
        abilityUsed=true;
        return {ok:true,status:200,async json(){return {ok:true,result:{ok:true}};}};
      }
    }
    throw new Error('Unexpected fetch '+url+' '+payload.action);
  }
  let nonce=0;
  const context={
    window,document,fetch,URL,URLSearchParams,console,
    crypto:{randomUUID(){nonce+=1;return 'nonce-'+nonce;}},
    setTimeout,clearTimeout,setInterval(){return 1;},clearInterval(){}
  };
  vm.runInNewContext(rendererSource,context,{filename:'stream-bandit-tcg-card-renderer-v2-4-51.js'});
  vm.runInNewContext(controller,context,{filename:'stream-bandit-tcg-v2-battle-controller.js'});
  assert.equal(typeof domReady,'function');
  return {document,nodes,requests,async boot(){await domReady();}};
}

test('server capability makes active Ability glow/clickable, then refreshed projection removes the glow after use',async()=>{
  const h=makeHarness();
  await h.boot();

  const before=h.nodes.get('youVanguard').innerHTML;
  assert.match(before,/ABILITY READY/);
  assert.equal(h.document.abilityButtons.length,1);

  await h.document.abilityButtons[0].click();

  const uses=h.requests.filter(r=>r.url.endsWith('/functions/v1/tcg-match-actions')&&r.payload.action==='use_ability');
  assert.equal(uses.length,1);
  assert.equal(uses[0].payload.where,'vanguard');

  const after=h.nodes.get('youVanguard').innerHTML;
  assert.doesNotMatch(after,/ABILITY READY/);
  assert.equal(h.document.abilityButtons.length,0,'used active Ability must stop presenting as a clickable ready control');
});
