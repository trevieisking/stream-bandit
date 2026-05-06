/* Stream Bandit V5.8.2 — Settings Tabs Safe Restore
   Organises existing Settings page sections into tabs without risking a blank page.
   No Supabase save logic, Mux, player, storage, form field, upload or database changes. */
(function(){
'use strict';

var VERSION='V5.8.2';
var active='overview';

function text(el){return String(el&&el.textContent||'').replace(/\s+/g,' ').trim();}
function main(){return document.querySelector('.main')||document.querySelector('main')||document.getElementById('app');}
function pageTitle(){return text(document.querySelector('.main .top h2,.main h1,.main h2')).toLowerCase();}
function isSettingsPage(){
  var m=main();
  var t=m?text(m).toLowerCase():'';
  return pageTitle()==='settings'||(t.indexOf('branding')>-1&&t.indexOf('homepage builder')>-1);
}
function addStyle(){
  if(document.getElementById('sb58TabsStyle'))return;
  var st=document.createElement('style');
  st.id='sb58TabsStyle';
  st.textContent='\n.sb58Tabs{display:flex;gap:10px;flex-wrap:wrap;margin:12px 0 14px}.sb58Tab{border:0;border-radius:999px;padding:11px 16px;background:rgba(48,52,78,.92);color:#f6f7ff;font-weight:950;box-shadow:0 10px 28px rgba(0,0,0,.20);cursor:pointer}.sb58Tab.active{background:linear-gradient(135deg,#ff2d85,#7c3cff);box-shadow:0 14px 36px rgba(124,60,255,.35)}.sb58TabPanel{display:block}.sb58TabPanel.sb58Hidden{display:none!important}.sb58TabsNote{margin:0 0 12px;padding:10px 12px;border-radius:16px;background:rgba(61,220,151,.10);border:1px solid rgba(61,220,151,.22);color:#baf7df;font-size:12px;line-height:1.45}.sb58Recover{padding:12px;border-radius:18px;background:rgba(255,190,80,.10);border:1px solid rgba(255,190,80,.25);color:#ffe0a3;margin:10px 0}\n';
  document.head.appendChild(st);
}
function classify(el){
  var t=text(el).toLowerCase();
  if(t.indexOf('homepage builder')>-1||t.indexOf('homepage hero')>-1||t.indexOf('homepage sections')>-1)return 'homepage';
  if(t.indexOf('branding')>-1||t.indexOf('app name')>-1||t.indexOf('sidebar tagline')>-1||t.indexOf('logo image')>-1||t.indexOf('accent colour')>-1)return 'branding';
  if(t.indexOf('image uploads')>-1||t.indexOf('storage')>-1||t.indexOf('supabase storage')>-1||t.indexOf('mux video route')>-1)return 'storage';
  return 'overview';
}
function tabTitle(k){return {overview:'Overview',branding:'Branding',homepage:'Homepage',storage:'Storage'}[k]||k;}
function clearOldHidden(){
  var m=main(); if(!m)return;
  Array.prototype.slice.call(m.querySelectorAll('.sb58Hidden')).forEach(function(el){el.classList.remove('sb58Hidden');});
}
function ensureTabs(){
  if(!isSettingsPage())return;
  addStyle();
  var m=main(); if(!m)return;
  var top=m.querySelector('.top')||m.firstElementChild;
  if(!top)return;
  if(!m.querySelector('#sb58SettingsTabsWrap')){
    var wrap=document.createElement('div');
    wrap.id='sb58SettingsTabsWrap';
    wrap.innerHTML='<div class="sb58TabsNote">V5.8.2 Settings Tabs: same Settings controls, grouped neatly. Nothing saves until you press the original save buttons.</div><div class="sb58Tabs" id="sb58SettingsTabs"></div>';
    top.insertAdjacentElement('afterend',wrap);
  }
  var note=m.querySelector('.sb58TabsNote');
  if(note)note.textContent='V5.8.2 Settings Tabs: same Settings controls, grouped neatly. Nothing saves until you press the original save buttons.';
  var tabs=m.querySelector('#sb58SettingsTabs');
  if(!tabs)return;
  tabs.innerHTML='';
  ['overview','branding','homepage','storage'].forEach(function(k){
    var b=document.createElement('button');
    b.type='button';
    b.className='sb58Tab'+(active===k?' active':'');
    b.textContent=tabTitle(k);
    b.addEventListener('click',function(e){e.preventDefault();active=k;applyTabs();});
    tabs.appendChild(b);
  });
}
function directSections(){
  var m=main(); if(!m)return [];
  return Array.prototype.slice.call(m.children).filter(function(el){
    if(!el||el.nodeType!==1)return false;
    if(el.id==='sb58SettingsTabsWrap'||el.closest('#sb58SettingsTabsWrap'))return false;
    if(el.classList.contains('top'))return false;
    if(el.classList.contains('toast'))return false;
    if(!text(el))return false;
    return true;
  });
}
function applyPanels(){
  if(!isSettingsPage())return;
  var sections=directSections();
  sections.forEach(function(el){
    var group=classify(el);
    el.dataset.sb58TabPanel=group;
    el.classList.add('sb58TabPanel');
    el.classList.toggle('sb58Hidden',group!==active);
  });
  var visible=sections.filter(function(el){return !el.classList.contains('sb58Hidden')&&text(el);});
  if(!visible.length){
    clearOldHidden();
    var m=main();
    if(m&&!m.querySelector('.sb58Recover')){
      var warn=document.createElement('div');
      warn.className='sb58Recover';
      warn.textContent='Tabs safe mode: content restored because this tab would have been empty.';
      var wrap=m.querySelector('#sb58SettingsTabsWrap');
      if(wrap)wrap.insertAdjacentElement('afterend',warn);
    }
  }
}
function applyTabs(){ensureTabs();applyPanels();}
function run(){if(!isSettingsPage())return;ensureTabs();applyPanels();}
var mo=new MutationObserver(function(){setTimeout(run,140);});
try{mo.observe(document.documentElement,{childList:true,subtree:true});}catch(e){}
document.addEventListener('DOMContentLoaded',function(){setTimeout(run,700);});
setInterval(run,1000);
setTimeout(run,900);
})();
