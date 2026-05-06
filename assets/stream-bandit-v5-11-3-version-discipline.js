/* Stream Bandit V5.11.3 — Version Discipline Regex Fix
   One safe version controller. Also repairs accidental repeated version text like V5.11.2.2.2.
   No Supabase writes, Mux, player, storage, upload, movie save or database changes. */
(function(){
'use strict';

var VERSION='V5.11.3';
var TITLE='Stream Bandit V5.11.3 Stable';

function text(el){return String(el&&el.textContent||'').replace(/\s+/g,' ').trim();}
function normalizeVersions(s){
  var next=String(s||'');
  next=next.replace(/V5\.11(?:\.2){2,}/g,VERSION);
  next=next.replace(/V5\.11\.2/g,VERSION);
  next=next.replace(/V5\.11\.1/g,VERSION);
  next=next.replace(/V5\.11(?![\d.])/g,VERSION);
  next=next.replace(/V5\.10(?![\d.])/g,VERSION);
  next=next.replace(/V5\.8\.2/g,VERSION);
  next=next.replace(/V5\.8(?![\d.])/g,VERSION);
  next=next.replace(/V5\.7\.1/g,VERSION);
  next=next.replace(/V5\.6\.3/g,VERSION);
  next=next.replace(/V5\.6\.1/g,VERSION);
  next=next.replace(/V5\.4\.2/g,VERSION);
  next=next.replace(/Details Tag Display Hotfix \+ Page Polish/g,'Stable Manager + Tabs');
  next=next.replace(/StreamBanditPrototypev5\.4\.2-details-tag-display-hotfix-page-polish/g,'StreamBanditPrototypev5.11.3-stable-manager-tabs');
  return next;
}
function cleanLocalStorage(){
  try{
    for(var i=0;i<localStorage.length;i++){
      var key=localStorage.key(i);
      var raw=localStorage.getItem(key);
      if(!raw)continue;
      if(!/(V5\.|Details Tag Display Hotfix|StreamBanditPrototypev5\.4\.2)/.test(raw))continue;
      var next=normalizeVersions(raw);
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
    var next=normalizeVersions(old);
    if(next!==old)n.nodeValue=next;
  });
}
function addStyle(){
  if(document.getElementById('sb5113Style'))return;
  var st=document.createElement('style');
  st.id='sb5113Style';
  st.textContent='\n.sb561StableBadge{display:inline-flex;align-items:center;gap:7px;margin:8px 0 10px;padding:8px 11px;border-radius:999px;background:linear-gradient(135deg,rgba(61,220,151,.16),rgba(124,60,255,.20));border:1px solid rgba(61,220,151,.26);font-size:12px;font-weight:950;color:#f6f7ff}.sb561StableDot{width:8px;height:8px;border-radius:50%;background:#3ddc97;box-shadow:0 0 14px rgba(61,220,151,.8)}.sb5113Checkpoint{background:linear-gradient(180deg,rgba(18,59,43,.35),rgba(13,14,21,.88));border:1px solid rgba(61,220,151,.28);border-radius:22px;padding:13px;margin:12px 0;box-shadow:0 14px 36px rgba(0,0,0,.28)}.sb5113Checkpoint h4{margin:0 0 6px;font-size:16px}.sb5113Checkpoint p{margin:5px 0;color:var(--muted,#a9afc3);font-size:13px;line-height:1.45}.sb5113Checkpoint b{color:#baf7df}\n';
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
  var main=document.querySelector('.main');
  var t=text(main).toLowerCase();
  if(t.indexOf('settings')>-1&&t.indexOf('branding')>-1)return 'settings';
  if(t.indexOf('supabase movie manager')>-1||t.indexOf('edit supabase movie')>-1&&t.indexOf('supabase rows')>-1)return 'manager';
  if(t.indexOf('backup')>-1)return 'backup';
  return '';
}
function checkpoint(){
  var main=document.querySelector('.main');
  if(!main)return;
  var kind=pageKind();
  if(!kind)return;
  var old=Array.prototype.slice.call(main.querySelectorAll('.sb561Checkpoint,.sb5112Checkpoint,.sb5113Checkpoint,[data-sb561-checkpoint]'));
  old.slice(1).forEach(function(x){try{x.remove();}catch(e){}});
  var box=old[0];
  if(!box){
    box=document.createElement('div');
    var top=main.querySelector('.top')||main.firstElementChild;
    if(top)top.insertAdjacentElement('afterend',box);
  }
  box.className='sb5113Checkpoint';
  box.innerHTML='<h4>'+VERSION+' stable checkpoint</h4><p><b>Current safe build:</b> Version discipline regex fix + Manager polish + Settings tabs + Rating Calculator guard.</p><p>No database, Mux, player, storage or Supabase save logic changes.</p>';
}
function specificLabels(){
  Array.prototype.slice.call(document.querySelectorAll('.sb563SettingsBadge')).forEach(function(el,i){
    if(i>0){try{el.remove();}catch(e){};return;}
    var b=el.querySelector('b'); if(b)b.textContent='V5.11.3 Stable Settings + Tabs';
  });
  Array.prototype.slice.call(document.querySelectorAll('.sb58TabsNote')).forEach(function(n){n.textContent='V5.11.3 Settings Tabs: same Settings controls stay visible. Tabs jump to each area safely.';});
  Array.prototype.slice.call(document.querySelectorAll('.sb59TabsNote')).forEach(function(n){n.textContent='V5.11.3 Supabase Manager Tabs: same manager controls stay visible. Tabs jump to each area safely.';});
  Array.prototype.slice.call(document.querySelectorAll('.sb510ManagerIntro')).forEach(function(n){
    n.innerHTML='<b>V5.11.3 Manager polish:</b> the same Supabase manager controls are labelled and easier to navigate. Tabs scroll to sections; nothing is hidden or saved automatically.<div class="sb510Tiny">Safe visual layer only — movie rows, update buttons, Mux helper, image uploads and Cast & Crew saves are unchanged.</div>';
  });
}
function run(){
  cleanLocalStorage();
  addStyle();
  walk(document.querySelector('.main'));
  walk(document.querySelector('.side'));
  sidebarBadge();
  checkpoint();
  specificLabels();
  if(document.title!==TITLE)document.title=TITLE;
}
cleanLocalStorage();
var mo=new MutationObserver(function(){setTimeout(run,120);});
try{mo.observe(document.documentElement,{childList:true,subtree:true});}catch(e){}
document.addEventListener('DOMContentLoaded',function(){setTimeout(run,600);});
setInterval(run,650);
setTimeout(run,900);
})();
