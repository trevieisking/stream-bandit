/* Web Builder Protected Page V7.12.265
   Web Builder-only access gate.
   Reads Supabase Auth + public.sb_profiles.
   Uses User Management-controlled fields: account_status, plan_key, permissions_json, role, admin_level.
   No Stream Bandit app shell. No header/footer injection. No writes. No redirects. No schema/storage/RLS changes.
*/
(function(){
'use strict';

const VERSION='V7.12.265 Web Builder Protected Page Gate';
const SUPABASE_URL='https://xzxqfrvqdgkzwujbkdbk.supabase.co';
const SUPABASE_KEY='sb_publishable_1wHhSq2xo0XBwsKXO_64HQ_xyVY9xRN';
const SDK='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
const RANK={free_viewer:0,viewer_plus:1,creator_starter:2,creator_growth:3,creator_pro:4,studio_business:5,platform_owner:6,enterprise:7};

let sbClient=null;
let lastDecision=null;

function fileOf(value){
 return String(value||location.pathname).split('/').pop().split('?')[0].split('#')[0]||'index.html';
}

function currentSlug(){
 try{return new URL(location.href).searchParams.get('page')||'landing';}
 catch(e){return 'landing';}
}

function esc(value){
 return String(value==null?'':value).replace(/[&<>"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]||m;});
}

function scriptOption(name){
 try{
  let s=document.currentScript||Array.from(document.scripts||[]).find(function(x){return String(x.src||'').indexOf('web-builder-protected-page-v7-12-265.js')>-1;});
  return s&&s.dataset?s.dataset[name]:'';
 }catch(e){return '';}
}

function loadScript(src){
 return new Promise(function(resolve,reject){
  try{
   let base=src.split('?')[0];
   if(Array.from(document.scripts||[]).some(function(s){return String(s.src||'').indexOf(base)>-1;}))return resolve();
   let s=document.createElement('script');
   s.src=src;
   s.defer=true;
   s.onload=function(){resolve();};
   s.onerror=function(){reject(new Error('Could not load '+src));};
   document.head.appendChild(s);
  }catch(e){reject(e);}
 });
}

function config(){
 let cfg=window.StreamBanditSupabaseConfig||window.StreamBanditShellConfig||null;
 if(cfg&&cfg.url&&cfg.key)return cfg;
 if(window.StreamBanditShell&&typeof window.StreamBanditShell.config==='function'){
  let c=window.StreamBanditShell.config();
  if(c&&c.url&&c.key)return c;
 }
 if(window.SUPABASE_URL&&window.SUPABASE_KEY)return{url:window.SUPABASE_URL,key:window.SUPABASE_KEY};
 return{url:SUPABASE_URL,key:SUPABASE_KEY};
}

async function client(){
 if(sbClient)return sbClient;
 if(!window.supabase||!window.supabase.createClient)await loadScript(SDK);
 let cfg=config();
 sbClient=window.supabase.createClient(cfg.url,cfg.key);
 return sbClient;
}

function parsePerms(profile){
 try{
  let raw=profile&&profile.permissions_json;
  if(!raw)return{};
  return typeof raw==='string'?JSON.parse(raw):raw;
 }catch(e){return{};}
}

function truth(value){
 if(value===true||value===1)return true;
 if(typeof value==='string')return ['true','1','yes','on','enabled','allow','allowed'].includes(value.toLowerCase());
 return false;
}

function planRank(plan){
 return RANK[String(plan||'free_viewer')]||0;
}

function isOwner(profile){
 return !!profile&&(profile.admin_level==='owner'||profile.plan_key==='platform_owner');
}

function isAdmin(profile){
 return !!profile&&(profile.role==='admin'||profile.admin_level==='admin'||isOwner(profile));
}

function statusAllowed(profile){
 let status=String(profile&&profile.account_status||'active').toLowerCase();
 if(isOwner(profile))return true;
 return status==='active';
}

function hasPerm(profile,key){
 let p=parsePerms(profile);
 return truth(p[key])||truth(p[key+'_enabled'])||truth(p[key+'_access'])||truth(p[key+'_allowed']);
}

function routeInfo(route){
 let f=fileOf(route);
 let slug=currentSlug();
 let base={file:f,slug:slug,minPlan:'creator_growth',feature:'web_builder',label:'Web Builder'};

 if(f.indexOf('account-control-hub')>-1)return Object.assign(base,{feature:'web_builder_starter',label:'Web Builder Hub'});
 if(f.indexOf('pages-manager')>-1)return Object.assign(base,{feature:'pages_manager',label:'Pages Manager'});
 if(f.indexOf('overlay-route-truth-machine')>-1||f.indexOf('studio')>-1||f.indexOf('live-studio')>-1)return Object.assign(base,{feature:'web_builder',label:'Web Builder Studio'});
 if(f.indexOf('preview-owned')>-1)return Object.assign(base,{feature:'published_preview',label:'Published Preview'});
 if(f.indexOf('menu-builder')>-1)return Object.assign(base,{feature:'menu_builder',label:'Menu Builder'});
 if(f.indexOf('form-designer')>-1)return Object.assign(base,{feature:'forms',label:'Form Builder'});
 if(f.indexOf('form-inbox')>-1)return Object.assign(base,{feature:'forms',label:'Form Inbox'});
 if(f.indexOf('assets')>-1)return Object.assign(base,{feature:'assets',label:'Assets'});
 if(f.indexOf('route-map')>-1)return Object.assign(base,{feature:'web_builder_route_map',label:'Route Map'});
 if(f.indexOf('control-map')>-1)return Object.assign(base,{feature:'web_builder_control_map',label:'Control Map'});
 return base;
}

async function readAuthority(){
 let c=await client();
 let user=null;
 let source='none';
 let gu=await c.auth.getUser();
 if(gu&&gu.data&&gu.data.user){user=gu.data.user;source='getUser';}
 if(!user){
  let gs=await c.auth.getSession();
  if(gs&&gs.data&&gs.data.session&&gs.data.session.user){user=gs.data.session.user;source='getSession';}
 }
 if(!user)return{signed_in:false,user:null,profile:null,source:source};
 let pr=await c.from('sb_profiles').select('*').eq('id',user.id).maybeSingle();
 if(pr.error)throw pr.error;
 return{signed_in:true,user:user,profile:pr.data||null,source:source};
}

function allowByProfile(profile,info){
 if(!profile)return{allowed:false,reason:'No matching profile row'};
 if(!statusAllowed(profile))return{allowed:false,reason:'Account status is '+String(profile.account_status||'unknown')};
 if(isOwner(profile))return{allowed:true,reason:'Owner access'};
 if(isAdmin(profile))return{allowed:true,reason:'Admin access'};
 if(planRank(profile.plan_key)>=planRank(info.minPlan||'creator_growth'))return{allowed:true,reason:'Plan allows Web Builder'};
 if(hasPerm(profile,'web_builder')||hasPerm(profile,'web_builder_starter'))return{allowed:true,reason:'Web Builder permission allows access'};
 if(hasPerm(profile,info.feature))return{allowed:true,reason:'Feature permission allows '+info.feature};
 if(info.feature==='forms'&&(hasPerm(profile,'form_builder')||hasPerm(profile,'form_inbox')))return{allowed:true,reason:'Forms permission allows access'};
 if(info.feature==='assets'&&(hasPerm(profile,'uploads')||hasPerm(profile,'web_builder_assets')))return{allowed:true,reason:'Assets/uploads permission allows access'};
 return{allowed:false,reason:'Plan or permission does not allow Web Builder'};
}

async function decide(route){
 let publicMode=scriptOption('wbPublic')==='true'||scriptOption('public')==='true';
 let info=routeInfo(route||location.pathname);
 if(publicMode){
  return{version:VERSION,route:info.file,slug:info.slug,info:info,allowed:true,publicMode:true,reason:'Public mode explicitly enabled on script tag'};
 }
 let authority=await readAuthority();
 if(!authority.signed_in){
  return{version:VERSION,route:info.file,slug:info.slug,info:info,allowed:false,reason:'Sign in required',authority:authority};
 }
 let gate=allowByProfile(authority.profile,info);
 return{version:VERSION,route:info.file,slug:info.slug,info:info,allowed:gate.allowed,reason:gate.reason,authority:authority};
}

function renderLocked(decision){
 let a=decision&&decision.authority||{};
 let p=a.profile||{};
 let email=a.user&&a.user.email||'';
 let info=decision&&decision.info||{};

 document.documentElement.dataset.webBuilderProtectedPage='not-allowed';
 document.body.innerHTML='';
 document.body.style.margin='0';
 document.body.style.minHeight='100vh';
 document.body.style.background='radial-gradient(circle at 0 0,#22d3a633,transparent 34%),radial-gradient(circle at 100% 0,#7c3cff3d,transparent 38%),#050711';
 document.body.style.color='#f7fbff';
 document.body.style.fontFamily='Inter,system-ui,Arial,sans-serif';

 let main=document.createElement('main');
 main.style.cssText='min-height:100vh;display:grid;place-items:center;padding:18px';
 main.innerHTML='\
<section style="width:min(920px,100%);border:1px solid #ffffff24;border-radius:32px;background:linear-gradient(135deg,#101529,#17122d);box-shadow:0 26px 90px #0009;padding:24px">\
 <span style="display:inline-flex;border:1px solid #ffb14266;border-radius:999px;background:#ffb14224;color:#ffe7ad;font-weight:950;padding:7px 11px">Web Builder locked</span>\
 <h1 style="font-size:clamp(38px,7vw,76px);line-height:.9;letter-spacing:-.06em;margin:12px 0">Web Builder access required</h1>\
 <p style="color:#b9c0d8;line-height:1.5;font-size:16px">This is a Web Builder-only gate. It does not load the Stream Bandit app shell. Access is controlled by User Management plan, permissions, owner/admin level and account status.</p>\
 <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:10px;margin:14px 0">\
  <div style="border:1px solid #ffffff18;border-radius:18px;background:#ffffff0a;padding:12px"><b style="color:#baf7df">Route</b><p style="color:#b9c0d8;word-break:break-word">'+esc(decision&&decision.route)+'</p></div>\
  <div style="border:1px solid #ffffff18;border-radius:18px;background:#ffffff0a;padding:12px"><b style="color:#baf7df">Tool</b><p style="color:#b9c0d8">'+esc(info.label||'Web Builder')+'</p></div>\
  <div style="border:1px solid #ffffff18;border-radius:18px;background:#ffffff0a;padding:12px"><b style="color:#baf7df">Needed</b><p style="color:#b9c0d8">creator_growth plan or Web Builder permission</p></div>\
  <div style="border:1px solid #ffffff18;border-radius:18px;background:#ffffff0a;padding:12px"><b style="color:#baf7df">Reason</b><p style="color:#b9c0d8">'+esc(decision&&decision.reason)+'</p></div>\
 </div>\
 <pre style="white-space:pre-wrap;word-break:break-word;background:#0007;border:1px solid #ffffff14;border-radius:18px;padding:12px;color:#dfffee;max-height:260px;overflow:auto">'+esc(JSON.stringify({signed_in:!!a.signed_in,email:email,profile_id:p.id||'',role:p.role||'',admin_level:p.admin_level||'',account_status:p.account_status||'',plan_key:p.plan_key||'',feature:info.feature||'',version:VERSION},null,2))+'</pre>\
 <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px">\
  <a href="profile-settings-live-ready-v7-12-90-test.html" style="display:inline-flex;border-radius:999px;background:linear-gradient(135deg,#22d3a6,#7c3cff);color:#071015;text-decoration:none;font-weight:950;padding:11px 15px">Open Profile</a>\
  <a href="settings-platform-control-hub-v7-12-85-test.html" style="display:inline-flex;border-radius:999px;background:#414667;color:#fff;text-decoration:none;font-weight:950;padding:11px 15px">Back to Stream Bandit Settings</a>\
  <a href="home-global-helpers-v7-4-4-test.html" style="display:inline-flex;border-radius:999px;background:#30384f;color:#fff;text-decoration:none;font-weight:950;padding:11px 15px">Home</a>\
 </div>\
</section>';
 document.body.appendChild(main);
}

async function run(){
 try{
  let decision=await decide(location.pathname);
  lastDecision=decision;
  document.documentElement.dataset.webBuilderProtectedPage=decision.allowed?'allowed':'not-allowed';
  document.documentElement.dataset.webBuilderProtectedVersion='v7-12-265';
  window.StreamBanditWebBuilderProtectedState=decision;
  window.dispatchEvent(new CustomEvent('web-builder-access-decision',{detail:decision}));
  if(!decision.allowed)renderLocked(decision);
 }catch(e){
  lastDecision={version:VERSION,allowed:false,reason:e.message||String(e),error:true};
  window.StreamBanditWebBuilderProtectedState=lastDecision;
  renderLocked(lastDecision);
 }
}

window.StreamBanditWebBuilderProtectedPage={
 version:VERSION,
 decide:decide,
 readAuthority:readAuthority,
 state:function(){return lastDecision;},
 routeInfo:routeInfo
};

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);
else run();

})();
