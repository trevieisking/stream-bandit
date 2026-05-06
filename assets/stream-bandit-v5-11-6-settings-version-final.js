/* Stream Bandit V5.11.6 — Settings + Version Final
   One late controller for visible version labels and Settings tabs only.
   No Supabase writes, Mux, player, storage, upload, movie save or database changes. */
(function(){
'use strict';

var VERSION='V5.11.6';
var TITLE='Stream Bandit V5.11.6 Stable';
var SETTINGS_NOTE='V5.11.6 Settings Tabs: same Settings controls stay visible. Tabs jump to each area safely.';
var activeSettingsTab='overview';
var lastSettingsBuild='';

function text(el){return String(el&&el.textContent||'').replace(/\s+/g,' ').trim();}
function main(){return document.querySelector('.main')||document.querySelector('main')||document.getElementById('app');}
function isSettings(){
  var m=main();
  var t=text(m).toLowerCase();
  var title=text(document.querySelector('.main .top h2,.main h1,.main h2')).toLowerCase();
  return title==='settings'||(t.indexOf('settings')>-1&&t.indexOf('branding')>-1&&t.indexOf('homepage')>-1);
}
function normalize(s){
  var next=String(s||'');
  next=next.replace(/StreamBanditPrototypev5\.4\.2-details-tag-display-hotfix-page-polish/g,'StreamBanditPrototypev5.11.6-stable-settings-version-final');
  next=next.replace(/V5\.11(?:\.2){2,}/g,VERSION);
  next=next.replace(/V5\.11\.[0-5](?![\d.])/g,VERSION);
  next=next.replace(/V5\.11(?![\d.])/g,VERSION);
  next=next.replace(/V5\.10(?![\d.])/g,VERSION);
  next=next.replace(/V5\.8\.5/g,VERSION);
  next=next.replace(/V5\.8\.3/g,VERSION);
  next=next.replace(/V5\.8\.2/g,VERSION);
  next=next.replace(/V5\.8(?![\d.])/g,VERSION);
  next=next.replace(/V5\.7\.1/g,VERSION);
  next=next.replace(/V5\.6\.3/g,VERSION);
  next=next.replace(/V5\.6\.1/g,VERSION);
  next=next.replace(/V5\.4\.3/g,VERSION);
  next=next.replace(/V5\.4\.2/g,VERSION);
  next=next.replace(/V4\.4\.3/g,VERSION);
  next=next.replace(/Details Tag Display Hotfix \+ Page Polish/g,'Stable Manager + Tabs');
  return next;
}
function cleanLocalStorage(){
  try{
    for(var i=0;i<localStorage.length;i++){
      var key=localStorage.key(i);
      var raw=localStorage.getItem(key);
      if(!raw)continue;
      if(!/(V[45]\.|Details Tag Display Hotfix|StreamBanditPrototypev5\.4\.2)/.test(raw))continue;
      var next=normalize(raw);
      if(next!==raw)localStorage.setItem(key,next);
    }
  }catch(e){}
}
function walk(root){
  if(!root)return;
  var walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,null,false);
  var nodes=[];
  while(walker.nextNode())nodes.push(walker.currentNode);
  nodes.forEach(function(n){
    var old=n.nodeValue;
    var next=normalize(old);
    if(next!==old)n.nodeValue=next;
  });
}
function addStyle(){
  if(document.getElementById('sb5116Style'))return;
  var st=document.createElement('style');
  st.id='sb5116Style';
  st.textContent='\n.sb561StableBadge{display:inline-flex;align-items:center;gap:7px;margin:8px 0 10px;padding:8px 11px;border-radius:999px;background:linear-gradient(135deg,rgba(61,220,151,.16),rgba(124,60,255,.20));border:1px solid rgba(61,220,151,.26);font-size:12px;font-weight:950;color:#f6f7ff}.sb561StableDot{width:8px;height:8px;border-radius:50%;background:#3ddc97;box-shadow:0 0 14px rgba(61,220,151,.8)}.sb5116Checkpoint{background:linear-gradient(180deg,rgba(18,59,43,.35),rgba(13,14,21,.88));border:1px solid rgba(61,220,151,.28);border-radius:22px;padding:13px;margin:12px 0;box-shadow:0 14px 36px rgba(0,0,0,.28)}.sb5116Checkpoint h4{margin:0 0 6px;font-size:16px}.sb5116Checkpoint p{margin:5px 0;color:var(--muted,#a9afc3);font-size:13px;line-height:1.45}.sb5116Checkpoint b{color:#baf7df}.sb58Tabs{display:flex;gap:10px;flex-wrap:wrap;margin:12px 0 14px;position:relative!important;z-index:3000!important;pointer-events:auto!important}.sb58Tab{display:inline-flex;text-decoration:none!important;border:0;border-radius:999px;padding:11px 16px;background:rgba(48,52,78,.92);color:#f6f7ff!important;font-weight:950;box-shadow:0 10px 28px rgba(0,0,0,.20);cursor:pointer;pointer-events:auto!important;position:relative!important;z-index:3100!important}.sb58Tab.active{background:linear-gradient(135deg,#ff2d85,#7c3cff);box-shadow:0 14px 36px rgba(124,60,255,.35)}.sb58TabsNote{margin:0 0 12px;padding:10px 12px;border-radius:16px;background:rgba(61,220,151,.10);border:1px solid rgba(61,220,151,.22);color:#baf7df;font-size:12px;line-height:1.45}.sb5116Anchor{outline:2px solid rgba(255,45,133,.42)!important;box-shadow:0 0 0 7px rgba(124,60,255,.15),0 22px 60px rgba(124,60,255,.22)!important}.sb5116OldSettingsNote{display:none!important}\n';
  document.head.appendChild(st);
}
function sidebarBadge(){
  var side=document.querySelector('.side');
  if(!side)return;
  Array.prototype.slice.call(side.querySelectorAll('.sb56Badge')).forEach(function(x){try{x.remove();}catch(e){}});
  var badges=Array.prototype.slice.call(side.querySelectorAll('.sb561StableBadge'));
  badges.slice(1).forEach(function(b){try{b.remove();}catch(e){}});
  var badge=badges[0];
  if(!badge){
    var brand=side.querySelector('.brand')||side.firstElementChild;
    if(!brand)return;
    badge=document.createElement('div');
    badge.className='sb561StableBadge';
    brand.insertAdjacentElement('afterend',badge);
  }
  badge.innerHTML='<span class="sb561StableDot"></span><span>'+VERSION+' Stable checkpoint</span>';
}
function pageKind(){
  var m=main();
  var t=text(m).toLowerCase();
  if(t.indexOf('settings')>-1&&t.indexOf('branding')>-1)return 'settings';
  if(t.indexOf('supabase movie manager')>-1||t.indexOf('edit supabase movie')>-1&&t.indexOf('supabase rows')>-1)return 'manager';
  if(t.indexOf('backup')>-1)return 'backup';
  return '';
}
function checkpoint(){
  var m=main();
  if(!m)return;
  var kind=pageKind();
  if(!kind)return;
  var old=Array.prototype.slice.call(m.querySelectorAll('.sb561Checkpoint,.sb5112Checkpoint,.sb5113Checkpoint,.sb5115Checkpoint,.sb5116Checkpoint,[data-sb561-checkpoint]'));
  old.slice(1).forEach(function(x){try{x.remove();}catch(e){}});
  var box=old[0];
  if(!box){
    box=document.createElement('div');
    var top=m.querySelector('.top')||m.firstElementChild;
    if(top)top.insertAdjacentElement('afterend',box);
  }
  box.className='sb5116Checkpoint';
  box.innerHTML='<h4>'+VERSION+' stable checkpoint</h4><p><b>Current safe build:</b> Settings + Version final, Manager polish, Settings tabs and Rating Calculator guard.</p><p>No database, Mux, player, storage or Supabase save logic changes.</p>';
}
function labels(){
  Array.prototype.slice.call(document.querySelectorAll('.sb563SettingsBadge')).forEach(function(el,i){if(i>0){try{el.remove();}catch(e){};return;}var b=el.querySelector('b');if(b)b.textContent='V5.11.6 Stable Settings + Tabs';});
  Array.prototype.slice.call(document.querySelectorAll('.sb58TabsNote')).forEach(function(n){n.textContent=SETTINGS_NOTE;});
  Array.prototype.slice.call(document.querySelectorAll('.sb59TabsNote')).forEach(function(n){n.textContent='V5.11.6 Supabase Manager Tabs: same manager controls stay visible. Tabs jump to each area safely.';});
  Array.prototype.slice.call(document.querySelectorAll('.sb510ManagerIntro')).forEach(function(n){n.innerHTML='<b>V5.11.6 Manager polish:</b> the same Supabase manager controls are labelled and easier to navigate. Tabs scroll to sections; nothing is hidden or saved automatically.<div class="sb510Tiny">Safe visual layer only — movie rows, update buttons, Mux helper, image uploads and Cast & Crew saves are unchanged.</div>';});
}
function settingsSections(){
  var m=main(); if(!m)return [];
  return Array.prototype.slice.call(m.children).filter(function(el){
    if(!el||el.nodeType!==1)return false;
    if(el.id==='sb58SettingsTabsWrap'||el.closest('#sb58SettingsTabsWrap'))return false;
    if(el.classList.contains('top')||el.classList.contains('toast'))return false;
    if(el.classList.contains('sb5116OldSettingsNote'))return false;
    return !!text(el);
  });
}
function classifySettings(el){
  var t=text(el).toLowerCase();
  if(t.indexOf('homepage builder')>-1||t.indexOf('homepage hero')>-1||t.indexOf('homepage sections')>-1)return 'homepage';
  if(t.indexOf('branding')>-1||t.indexOf('app name')>-1||t.indexOf('sidebar tagline')>-1||t.indexOf('logo image')>-1||t.indexOf('accent colour')>-1)return 'branding';
  if(t.indexOf('image uploads')>-1||t.indexOf('storage')>-1||t.indexOf('supabase storage')>-1||t.indexOf('mux video route')>-1)return 'storage';
  return 'overview';
}
function cleanOldSettingsNotes(){
  var m=main(); if(!m)return;
  Array.prototype.slice.call(m.querySelectorAll('*')).forEach(function(el){
    if(el.id==='sb58SettingsTabsWrap'||el.closest('#sb58SettingsTabsWrap'))return;
    var t=text(el);
    if(/^V5\.[0-9.]+ Settings Tabs:/.test(t))el.classList.add('sb5116OldSettingsNote');
  });
}
function assignSettingsAnchors(){
  var found={};
  settingsSections().forEach(function(el){
    var k=classifySettings(el);
    if(!found[k]){found[k]=el;el.id='sb58-'+k;el.style.scrollMarginTop='24px';}
  });
  var first=settingsSections()[0];
  if(first){first.id='sb58-overview';first.style.scrollMarginTop='24px';}
}
function buildSettingsTabs(){
  if(!isSettings())return;
  var m=main(); if(!m)return;
  var top=m.querySelector('.top')||m.firstElementChild; if(!top)return;
  var sig=text(m).slice(0,220)+'|'+activeSettingsTab;
  var wrap=m.querySelector('#sb58SettingsTabsWrap');
  if(wrap&&lastSettingsBuild===sig){
    var note=wrap.querySelector('.sb58TabsNote');
    if(note)note.textContent=SETTINGS_NOTE;
    return;
  }
  if(!wrap){
    wrap=document.createElement('div');
    wrap.id='sb58SettingsTabsWrap';
    top.insertAdjacentElement('afterend',wrap);
  }
  wrap.innerHTML='<div class="sb58TabsNote">'+SETTINGS_NOTE+'</div><div class="sb58Tabs" id="sb58SettingsTabs"></div>';
  var tabs=wrap.querySelector('#sb58SettingsTabs');
  [['overview','Overview'],['branding','Branding'],['homepage','Homepage'],['storage','Storage']].forEach(function(pair){
    var a=document.createElement('a');
    a.href='#sb58-'+pair[0];
    a.dataset.tab=pair[0];
    a.className='sb58Tab'+(activeSettingsTab===pair[0]?' active':'');
    a.textContent=pair[1];
    tabs.appendChild(a);
  });
  lastSettingsBuild=sig;
}
function settingsTarget(k){assignSettingsAnchors();return document.getElementById('sb58-'+k)||settingsSections()[0]||null;}
function setActiveSettings(k){
  activeSettingsTab=k;
  Array.prototype.slice.call(document.querySelectorAll('.sb58Tab')).forEach(function(a){a.classList.toggle('active',a.dataset.tab===k);});
}
function jumpSettings(k){
  k=k||'overview';
  setActiveSettings(k);
  var el=settingsTarget(k);
  if(el){
    el.classList.add('sb5116Anchor');
    try{el.scrollIntoView({behavior:'smooth',block:'start'});}catch(e){location.hash='sb58-'+k;}
    setTimeout(function(){el.classList.remove('sb5116Anchor');},1600);
  }
}
function settingsTabsRun(){
  if(!isSettings())return;
  cleanOldSettingsNotes();
  assignSettingsAnchors();
  buildSettingsTabs();
}
function run(){
  cleanLocalStorage();
  addStyle();
  walk(main());
  walk(document.querySelector('.side'));
  sidebarBadge();
  checkpoint();
  labels();
  settingsTabsRun();
  if(document.title!==TITLE)document.title=TITLE;
}
document.addEventListener('click',function(e){
  var a=e.target&&e.target.closest&&e.target.closest('.sb58Tab');
  if(a&&isSettings()){
    e.preventDefault();
    e.stopImmediatePropagation();
    jumpSettings(a.dataset.tab||'overview');
    return false;
  }
},true);
cleanLocalStorage();
var mo=new MutationObserver(function(){setTimeout(run,100);});
try{mo.observe(document.documentElement,{childList:true,subtree:true});}catch(e){}
document.addEventListener('DOMContentLoaded',function(){setTimeout(run,600);});
setInterval(run,700);
setTimeout(run,900);
})();
