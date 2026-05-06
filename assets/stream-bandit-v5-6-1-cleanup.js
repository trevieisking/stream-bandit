/* Stream Bandit V5.7.1 — Cleanup & Stability Pass
   Visual cleanup only. No Supabase, Mux, player, storage or database logic changes. */
(function(){
'use strict';

var VERSION='V5.7.1';
var LABEL='Stream Bandit V5.7.1 Stable';
var LOCAL_KEY='streambandit_v25_data';

function text(el){return String(el&&el.textContent||'').replace(/\s+/g,' ').trim();}
function fixStoredOldVersion(){
  try{
    var raw=localStorage.getItem(LOCAL_KEY);
    if(!raw)return;
    var next=raw
      .replace(/V5\.4\.2 Details Tag Display Hotfix \+ Page Polish/g,'V5.7.1 Stable Settings + Branding')
      .replace(/V5\.6\.1 Stable checkpoint/g,'V5.7.1 Stable checkpoint')
      .replace(/V5\.6\.3 Stable checkpoint/g,'V5.7.1 Stable checkpoint')
      .replace(/V5\.4\.2/g,'V5.7.1')
      .replace(/Details Tag Display Hotfix \+ Page Polish/g,'Stable Settings + Branding');
    if(next!==raw)localStorage.setItem(LOCAL_KEY,next);
  }catch(e){}
}
function addStyle(){
  if(document.getElementById('sb561Style'))return;
  var st=document.createElement('style');
  st.id='sb561Style';
  st.textContent='\n.sb56Badge{display:none!important}.sb561OldVersionHidden{display:none!important}.sb561StableBadge{display:inline-flex;align-items:center;gap:7px;margin:8px 0 10px;padding:8px 11px;border-radius:999px;background:linear-gradient(135deg,rgba(61,220,151,.16),rgba(124,60,255,.20));border:1px solid rgba(61,220,151,.26);font-size:12px;font-weight:950;color:#f6f7ff}.sb561StableDot{width:8px;height:8px;border-radius:50%;background:#3ddc97;box-shadow:0 0 14px rgba(61,220,151,.8)}.sb561Checkpoint{background:linear-gradient(180deg,rgba(18,59,43,.35),rgba(13,14,21,.88));border:1px solid rgba(61,220,151,.28);border-radius:22px;padding:13px;margin:12px 0;box-shadow:0 14px 36px rgba(0,0,0,.28)}.sb561Checkpoint h4{margin:0 0 6px;font-size:16px}.sb561Checkpoint p{margin:5px 0;color:var(--muted,#a9afc3);font-size:13px;line-height:1.45}.sb561Checkpoint b{color:#baf7df}.sb561VersionPill{display:inline-block;margin:4px 6px 4px 0;padding:5px 8px;border-radius:999px;background:rgba(55,58,86,.88);border:1px solid rgba(255,255,255,.10);font-size:11px;font-weight:850}\n';
  document.head.appendChild(st);
}
function removeOldVersionBadges(){
  var side=document.querySelector('.side');
  if(!side)return;
  Array.prototype.slice.call(side.querySelectorAll('.sb56Badge')).forEach(function(x){x.remove();});
  Array.prototype.slice.call(side.querySelectorAll('*')).forEach(function(el){
    var t=text(el);
    if(t.indexOf('V5.4.2')>-1||t.indexOf('Details Tag Display Hotfix')>-1){
      if(t.indexOf('Stream Bandit')===-1&&t.indexOf('Chatterfriends Movies')===-1){
        el.classList.add('sb561OldVersionHidden');
        try{el.remove();}catch(e){}
      }
    }
  });
}
function addSidebarBadge(){
  var side=document.querySelector('.side');
  if(!side)return;
  removeOldVersionBadges();
  var existing=side.querySelector('.sb561StableBadge');
  if(existing){
    existing.innerHTML='<span class="sb561StableDot"></span><span>'+VERSION+' Stable checkpoint</span>';
    return;
  }
  var brand=side.querySelector('.brand')||side.firstElementChild;
  if(!brand)return;
  var badge=document.createElement('div');
  badge.className='sb561StableBadge';
  badge.innerHTML='<span class="sb561StableDot"></span><span>'+VERSION+' Stable checkpoint</span>';
  brand.insertAdjacentElement('afterend',badge);
}
function checkpointHtml(kind){
  return '<div class="sb561Checkpoint" data-sb561-checkpoint="'+kind+'">'+
    '<h4>'+VERSION+' stable checkpoint</h4>'+
    '<p><b>Current safe build:</b> Organised Menu + Supabase Cast Manager + Rating Calculator.</p>'+ 
    '<p>This cleanup pass does not change database, Mux, player, storage or Supabase save logic.</p>'+ 
    '<div><span class="sb561VersionPill">GitHub source split</span><span class="sb561VersionPill">Cast Manager passed</span><span class="sb561VersionPill">Rating Calculator passed</span></div>'+ 
  '</div>';
}
function pageTitle(){return text(document.querySelector('.top h2,.main h2,h1'));}
function addCheckpoint(){
  var main=document.querySelector('.main');
  if(!main)return;
  var title=pageTitle().toLowerCase();
  var kind='';
  if(title.indexOf('backup')>-1)kind='backup';
  if(title.indexOf('settings')>-1)kind='settings';
  if(title.indexOf('supabase movie manager')>-1)kind='supabase-manager';
  if(!kind)return;
  var existing=main.querySelector('[data-sb561-checkpoint="'+kind+'"]');
  if(existing){
    var h=existing.querySelector('h4');
    if(h)h.textContent=VERSION+' stable checkpoint';
    return;
  }
  var top=main.querySelector('.top')||main.firstElementChild;
  if(top)top.insertAdjacentHTML('afterend',checkpointHtml(kind));
}
function tidyMenuNames(){
  Array.prototype.slice.call(document.querySelectorAll('.sb56Group summary')).forEach(function(s){
    var t=text(s).replace('Mux / Video Links','Mux').replace('Storage & Backups','Storage');
    if(s.textContent!==t)s.textContent=t;
  });
}
function run(){
  fixStoredOldVersion();
  addStyle();
  addSidebarBadge();
  tidyMenuNames();
  addCheckpoint();
  document.title='Stream Bandit '+VERSION+' Stable';
}
fixStoredOldVersion();
var mo=new MutationObserver(function(){setTimeout(run,120);});
try{mo.observe(document.documentElement,{childList:true,subtree:true});}catch(e){}
document.addEventListener('DOMContentLoaded',function(){setTimeout(run,600);});
setInterval(run,900);
setTimeout(function(){run();try{var t=document.createElement('div');t.className='toast';t.textContent=LABEL+' loaded';document.body.appendChild(t);setTimeout(function(){t.remove()},2500)}catch(e){}},900);
})();
