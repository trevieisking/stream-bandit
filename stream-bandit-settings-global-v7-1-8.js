/* Stream Bandit V7.1.9 Safe Global Settings Bridge / Settings Hub Auth Gate
   Reads future Settings Platform Control Hub JSON shape and exposes it globally.
   Safe stage: no redirects, no hiding pages, no favicon replacement, no Supabase writes.
   Settings Hub only: injects the standard Stream Bandit Auth Gate so the Settings group uses
   the normal login/logout/reset flow while Create Account remains locked. */
(function(){
'use strict';
const VERSION='V7.1.9 Safe Global Settings Bridge / Settings Hub Auth Gate';
const STORE_ID='stream_bandit';
const SETTINGS_KEYS=['settings_platform_control_hub','platform_feature_controls','featureControls','streamBanditSettings'];
const SETTINGS_HUB_FILE='settings-platform-control-hub-v7-12-85-test.html';
const AUTH_GATE_SRC='stream-bandit-auth-gate-v7-13-001.js?v=settings-auth-gate-7-13-005';
let sb=null;
let state={loaded:false,source:'defaults',settings:{},brandingFiles:{},error:''};
function esc(s){return String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
function currentFile(){return String(location.pathname||'').split('/').pop()||'';}
function isSettingsHub(){return currentFile()===SETTINGS_HUB_FILE;}
function ensureSettingsHubAuthGate(){
  if(!isSettingsHub())return;
  if(document.querySelector('script[src*="stream-bandit-auth-gate-v7-13-001.js"]'))return;
  const s=document.createElement('script');
  s.src=AUTH_GATE_SRC;
  s.defer=true;
  s.dataset.sbSettingsHubAuthGate='v7-13-005';
  document.head.appendChild(s);
  document.documentElement.dataset.sbSettingsHubAuthGate='v7-13-005';
}
async function readConfig(){
  try{
    const txt=await fetch('stream-bandit-shell-v6-24.js',{cache:'no-store'}).then(r=>r.text());
    return {url:(txt.match(/SUPABASE_URL\s*=\s*'([^']+)'/)||[])[1]||'',key:(txt.match(/SUPABASE_KEY\s*=\s*'([^']+)'/)||[])[1]||''};
  }catch(e){return {url:'',key:''};}
}
async function client(){
  if(sb)return sb;
  const c=await readConfig();
  if(window.supabase&&window.supabase.createClient&&c.url&&c.key)sb=window.supabase.createClient(c.url,c.key);
  return sb;
}
function defaults(){return {version:VERSION,note:'Default safe settings. No saved Settings JSON applied yet.',settings:{},brandingFiles:{}};}
function pickSettings(settings){
  settings=settings||{};
  for(const k of SETTINGS_KEYS){if(settings[k]&&typeof settings[k]==='object')return {...settings[k],sourceKey:k};}
  return null;
}
function applyData(data,source){
  const d=data||defaults();
  state={loaded:true,source:source||d.sourceKey||'defaults',settings:d.settings||{},brandingFiles:d.brandingFiles||{},error:''};
  document.documentElement.dataset.streamBanditSettingsBridge='v7-1-9';
  document.documentElement.dataset.streamBanditSettingsLoaded='true';
  document.dispatchEvent(new CustomEvent('streambandit:settings-loaded',{detail:{...state}}));
  return state;
}
async function load(){
  try{
    const c=await client();
    if(!c)return applyData(defaults(),'defaults-no-client');
    const r=await c.from('sb_app_settings').select('settings').eq('id',STORE_ID).maybeSingle();
    if(r.error)throw r.error;
    const picked=pickSettings((r.data&&r.data.settings)||{});
    if(!picked)return applyData(defaults(),'defaults-no-settings-json');
    return applyData(picked,picked.sourceKey||'sb_app_settings');
  }catch(e){
    state={...state,loaded:false,error:e.message||String(e)};
    document.documentElement.dataset.streamBanditSettingsBridge='v7-1-9-error';
    document.dispatchEvent(new CustomEvent('streambandit:settings-error',{detail:{...state}}));
    return state;
  }
}
function get(key){return key?state.settings[key]:state.settings;}
function enabled(key,fallback=true){const v=state.settings[key];return v&&typeof v==='object'&&'enabled'in v?!!v.enabled:fallback;}
function mode(key,fallback='public'){const v=state.settings[key];return v&&typeof v==='object'&&v.mode?v.mode:fallback;}
function visible(key,context){
  const v=state.settings[key];
  if(!v||typeof v!=='object')return true;
  if(v.enabled===false)return false;
  if(context&&context in v)return !!v[context];
  return true;
}
function injectStatus(){
  if(document.getElementById('sbSettingsBridgeStatus'))return;
  const target=document.querySelector('#summary')||document.querySelector('.footer')||document.body;
  const el=document.createElement('div');
  el.id='sbSettingsBridgeStatus';
  el.style.cssText='margin:12px 0;padding:10px 12px;border-radius:14px;border:1px solid #22d3a647;background:#22d3a61a;color:#dfffee;font-weight:800;font-family:Inter,system-ui,Arial,sans-serif';
  el.textContent='Settings bridge loaded safely. Settings Hub auth gate aligned. No global hiding/favicon replacement yet.';
  if(target&&target.parentNode)target.parentNode.insertBefore(el,target);else document.body.appendChild(el);
}
function init(){
  ensureSettingsHubAuthGate();
  window.StreamBanditSettingsGlobal={version:VERSION,load,getState:()=>({...state}),get,enabled,mode,visible,ensureSettingsHubAuthGate};
  load().then(()=>{if(location.pathname.includes('settings-platform-control-hub')){ensureSettingsHubAuthGate();injectStatus();}});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();