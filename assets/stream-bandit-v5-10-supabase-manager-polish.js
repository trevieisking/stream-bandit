/* Stream Bandit V5.10 — Supabase Manager Layout Polish
   Visual organisation only for Supabase Movie Manager.
   No Supabase save logic, Mux, player, storage, upload, form field or database changes. */
(function(){
'use strict';

var VERSION='V5.10';

function text(el){return String(el&&el.textContent||'').replace(/\s+/g,' ').trim();}
function main(){return document.querySelector('.main')||document.querySelector('main')||document.getElementById('app');}
function pageTitle(){return text(document.querySelector('.main .top h2,.main h1,.main h2')).toLowerCase();}
function isManagerPage(){
  var m=main();
  var t=m?text(m).toLowerCase():'';
  return pageTitle().indexOf('supabase movie manager')>-1||
    (t.indexOf('supabase rows')>-1&&t.indexOf('edit supabase movie')>-1)||
    (t.indexOf('mux playback helper')>-1&&t.indexOf('cast & crew metadata')>-1);
}
function addStyle(){
  if(document.getElementById('sb510ManagerPolishStyle'))return;
  var st=document.createElement('style');
  st.id='sb510ManagerPolishStyle';
  st.textContent='\n.sb510ManagerReady{--sb510-border:rgba(182,140,255,.24)}.sb510ManagerReady .sb59TabsNote{background:linear-gradient(135deg,rgba(61,220,151,.12),rgba(124,60,255,.10));border-color:rgba(61,220,151,.24)}.sb510ManagerReady .sb59Tabs{position:sticky;top:8px;background:linear-gradient(180deg,rgba(8,9,16,.92),rgba(8,9,16,.72));backdrop-filter:blur(12px);padding:8px;border-radius:999px;border:1px solid rgba(255,255,255,.06);box-shadow:0 18px 40px rgba(0,0,0,.24);z-index:1500}.sb510ManagerReady [data-sb510-section]{position:relative}.sb510ManagerReady [data-sb510-section]::before{content:attr(data-sb510-title);display:inline-flex;margin:0 0 8px;padding:5px 9px;border-radius:999px;background:rgba(55,58,86,.82);border:1px solid rgba(255,255,255,.10);color:#dfe4ff;font-size:11px;font-weight:950;letter-spacing:.01em}.sb510ManagerReady [data-sb510-section="overview"]{border-color:rgba(61,220,151,.30)!important}.sb510ManagerReady [data-sb510-section="rows"]{border-color:rgba(255,45,133,.24)!important}.sb510ManagerReady [data-sb510-section="edit"]{border-color:rgba(124,60,255,.24)!important}.sb510ManagerReady [data-sb510-section="media"]{border-color:rgba(64,180,255,.24)!important}.sb510ManagerReady [data-sb510-section="genres"]{box-shadow:inset 0 0 0 1px rgba(255,210,80,.12)}.sb510ManagerReady [data-sb510-section="cast"]{border-color:rgba(61,220,151,.26)!important}.sb510ManagerReady [data-sb510-section="safety"]{box-shadow:inset 0 0 0 1px rgba(255,76,94,.18)}.sb510ManagerReady .sb510ManagerIntro{background:linear-gradient(135deg,rgba(61,220,151,.12),rgba(124,60,255,.10));border:1px solid rgba(61,220,151,.22);border-radius:18px;padding:10px 12px;margin:10px 0;color:#baf7df;font-size:12px;line-height:1.45}.sb510ManagerReady .sb510Tiny{font-size:11px;color:var(--muted,#a9afc3);margin-top:6px}.sb510ManagerReady .sb59Anchor{outline:2px solid rgba(255,45,133,.45)!important;box-shadow:0 0 0 7px rgba(124,60,255,.16),0 22px 60px rgba(124,60,255,.24)!important}\n';
  document.head.appendChild(st);
}
function classify(el){
  var t=text(el).toLowerCase();
  if(t.indexOf('cast & crew metadata')>-1||t.indexOf('save cast')>-1||t.indexOf('reload cast')>-1)return 'cast';
  if(t.indexOf('safe rule')>-1||t.indexOf('archive')>-1||t.indexOf('hide')>-1)return 'safety';
  if(t.indexOf('genre')>-1||t.indexOf('tags')>-1||t.indexOf('choose genres')>-1)return 'genres';
  if(t.indexOf('mux playback helper')>-1||t.indexOf('video url')>-1||t.indexOf('hls stream')>-1||t.indexOf('poster image')>-1||t.indexOf('trailer')>-1||t.indexOf('image file upload')>-1)return 'media';
  if(t.indexOf('edit supabase movie')>-1||t.indexOf('add supabase movie')>-1||t.indexOf('title')>-1&&t.indexOf('description')>-1&&t.indexOf('status')>-1)return 'edit';
  if(t.indexOf('supabase rows')>-1||t.indexOf('loaded 9 supabase')>-1||t.indexOf('editing selected')>-1)return 'rows';
  return 'overview';
}
function titleFor(kind){return {overview:'Overview / controls',rows:'Movie rows',edit:'Edit movie',media:'Media / Mux links',genres:'Genres / tags',cast:'Cast & Crew',safety:'Safety / archive'}[kind]||'Manager section';}
function candidates(){
  var m=main(); if(!m)return [];
  var direct=Array.prototype.slice.call(m.children).filter(function(el){
    if(!el||el.nodeType!==1)return false;
    if(el.id==='sb59ManagerTabsWrap'||el.closest('#sb59ManagerTabsWrap'))return false;
    if(el.classList.contains('top')||el.classList.contains('toast'))return false;
    if(!text(el))return false;
    return true;
  });
  var nested=Array.prototype.slice.call(m.querySelectorAll('.card,.panel,.box,section,form')).filter(function(el){
    if(!el||el.closest('#sb59ManagerTabsWrap'))return false;
    var t=text(el).toLowerCase();
    return t.indexOf('mux playback helper')>-1||t.indexOf('choose genres')>-1||t.indexOf('cast & crew metadata')>-1||t.indexOf('safe rule')>-1;
  });
  return direct.concat(nested);
}
function applyLabels(){
  var found={};
  candidates().forEach(function(el){
    var kind=classify(el);
    if(!found[kind]){
      found[kind]=true;
      el.dataset.sb510Section=kind;
      el.dataset.sb510Title=titleFor(kind);
      el.style.scrollMarginTop='82px';
    }
  });
}
function addIntro(){
  var m=main(); if(!m)return;
  if(m.querySelector('.sb510ManagerIntro'))return;
  var tabs=m.querySelector('#sb59ManagerTabsWrap');
  if(!tabs)return;
  var intro=document.createElement('div');
  intro.className='sb510ManagerIntro';
  intro.innerHTML='<b>V5.10 Manager polish:</b> the same Supabase manager controls are now labelled and easier to navigate. Tabs scroll to sections; nothing is hidden or saved automatically.<div class="sb510Tiny">Safe visual layer only — movie rows, update buttons, Mux helper, image uploads and Cast & Crew saves are unchanged.</div>';
  tabs.insertAdjacentElement('afterend',intro);
}
function run(){
  if(!isManagerPage())return;
  addStyle();
  var m=main(); if(m)m.classList.add('sb510ManagerReady');
  applyLabels();
  addIntro();
}
var mo=new MutationObserver(function(){setTimeout(run,250);});
try{mo.observe(document.documentElement,{childList:true,subtree:true});}catch(e){}
document.addEventListener('DOMContentLoaded',function(){setTimeout(run,800);});
setInterval(run,1200);
setTimeout(run,1000);
})();
