/* Stream Bandit V5.25.1 — Branding-Aware Tab Polish
   Tiny visual polish only.
   Settings Branding is the boss: active tabs/buttons use accent colour 1 + accent colour 2 when available.
   Falls back to Stream pink / purple only if no branding values are found.
   No player, progress, Supabase, movie row, Sound Booster or database changes. */
(function(){
'use strict';
var FALLBACK_1='#ff2d55';
var FALLBACK_2='#7c3cff';
function isHex(v){return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(String(v||'').trim());}
function getStored(keys){
  for(var i=0;i<keys.length;i++){
    try{var v=localStorage.getItem(keys[i]);if(isHex(v))return v.trim();}catch(e){}
  }
  return '';
}
function findInputByLabel(labelText){
  var labels=Array.prototype.slice.call(document.querySelectorAll('label,div,span,p,strong,b'));
  var label=labels.find(function(el){return String(el.textContent||'').replace(/\s+/g,' ').trim().toLowerCase()===labelText.toLowerCase();});
  if(!label)return '';
  var wrap=label.closest('.card,.panel,section,div')||label.parentElement;
  var input=wrap&&wrap.querySelector('input');
  return input&&isHex(input.value)?input.value.trim():'';
}
function readAccent1(){
  return findInputByLabel('Accent colour 1')||getStored(['sb_accent_1','accent_colour_1','accentColor1','streamBanditAccent1','sbSettingsAccent1'])||FALLBACK_1;
}
function readAccent2(){
  return findInputByLabel('Accent colour 2')||getStored(['sb_accent_2','accent_colour_2','accentColor2','streamBanditAccent2','sbSettingsAccent2'])||FALLBACK_2;
}
function setVars(){
  var a1=readAccent1();
  var a2=readAccent2();
  document.documentElement.style.setProperty('--sb-brand-accent-1',a1);
  document.documentElement.style.setProperty('--sb-brand-accent-2',a2);
}
function addCss(){
  if(document.getElementById('sb5251PinkTabs'))return;
  var st=document.createElement('style');
  st.id='sb5251PinkTabs';
  st.textContent='\n:root{--sb-brand-accent-1:#ff2d55;--sb-brand-accent-2:#7c3cff}.tab.active,.tabs .active,.sb5232Tab.active,.sb523Tab.active,.sb525Tab.active,button.active[data-tab],button.active[data-panel],button.active[data-view],.active-tab,.nav button.active,.side button.active{background:linear-gradient(135deg,var(--sb-brand-accent-1),var(--sb-brand-accent-2))!important;border-color:color-mix(in srgb,var(--sb-brand-accent-1) 55%,white 8%)!important;box-shadow:0 14px 34px color-mix(in srgb,var(--sb-brand-accent-1) 26%,transparent),0 0 0 1px rgba(255,255,255,.05) inset!important;color:#fff!important}.continue-watching button.primary,.continue-watching .primary,.continue-watching .btn-primary,.continue-watching [class*=primary],body:has(h1) .sb-pink-keep{background:linear-gradient(135deg,var(--sb-brand-accent-1),var(--sb-brand-accent-2))!important}.card button:focus-visible,.tabs button:focus-visible,.side button:focus-visible{outline:2px solid var(--sb-brand-accent-1)!important;outline-offset:2px!important}\n';
  document.head.appendChild(st);
}
function run(){addCss();setVars();}
document.addEventListener('DOMContentLoaded',function(){setTimeout(run,250);setTimeout(run,1000);});
new MutationObserver(function(){setTimeout(setVars,150);}).observe(document.documentElement,{childList:true,subtree:true});
setInterval(setVars,1200);
run();
})();
