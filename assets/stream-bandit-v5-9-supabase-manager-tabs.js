/* Stream Bandit V5.9 — Supabase Movie Manager Tabs Safe Scroll
   Adds jump tabs to Supabase Movie Manager without hiding existing controls.
   No Supabase save logic, Mux, player, storage, form field, upload or database changes. */
(function(){
'use strict';

var VERSION='V5.9';
var active='overview';
var builtFor='';

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
  if(document.getElementById('sb59TabsStyle'))return;
  var st=document.createElement('style');
  st.id='sb59TabsStyle';
  st.textContent='\n.sb59Tabs{display:flex;gap:9px;flex-wrap:wrap;margin:12px 0 14px;position:relative;z-index:999}.sb59Tab{display:inline-flex;text-decoration:none!important;border:0;border-radius:999px;padding:10px 14px;background:rgba(48,52,78,.92);color:#f6f7ff!important;font-weight:950;box-shadow:0 10px 28px rgba(0,0,0,.20);cursor:pointer;pointer-events:auto!important;position:relative;z-index:1000}.sb59Tab.active{background:linear-gradient(135deg,#ff2d85,#7c3cff);box-shadow:0 14px 36px rgba(124,60,255,.35)}.sb59TabsNote{margin:0 0 12px;padding:10px 12px;border-radius:16px;background:rgba(61,220,151,.10);border:1px solid rgba(61,220,151,.22);color:#baf7df;font-size:12px;line-height:1.45}.sb59Anchor{outline:2px solid rgba(255,45,133,.35);box-shadow:0 0 0 6px rgba(124,60,255,.12),0 20px 50px rgba(124,60,255,.18)!important}.sb59Hidden{display:block!important}\n';
  document.head.appendChild(st);
}
function clearBadState(){
  var m=main(); if(!m)return;
  Array.prototype.slice.call(m.querySelectorAll('.sb59Hidden')).forEach(function(el){el.classList.remove('sb59Hidden');el.style.display='';});
}
function classify(el){
  var t=text(el).toLowerCase();
  if(t.indexOf('cast & crew metadata')>-1||t.indexOf('cast & crew')>-1&&t.indexOf('save cast')>-1)return 'cast';
  if(t.indexOf('safe rule')>-1||t.indexOf('archive')>-1||t.indexOf('hide')>-1)return 'safety';
  if(t.indexOf('genre')>-1||t.indexOf('tags')>-1||t.indexOf('choose genres')>-1)return 'genres';
  if(t.indexOf('mux playback helper')>-1||t.indexOf('video url')>-1||t.indexOf('hls stream')>-1||t.indexOf('poster image')>-1||t.indexOf('trailer')>-1||t.indexOf('image file upload')>-1)return 'media';
  if(t.indexOf('edit supabase movie')>-1||t.indexOf('add supabase movie')>-1||t.indexOf('title')>-1&&t.indexOf('description')>-1&&t.indexOf('status')>-1)return 'edit';
  if(t.indexOf('supabase rows')>-1||t.indexOf('editing selected')>-1)return 'rows';
  return 'overview';
}
function tabTitle(k){return {overview:'Overview',rows:'Rows',edit:'Edit Movie',media:'Media / Mux',genres:'Genres / Tags',cast:'Cast & Crew',safety:'Safety'}[k]||k;}
function sections(){
  var m=main(); if(!m)return [];
  return Array.prototype.slice.call(m.children).filter(function(el){
    if(!el||el.nodeType!==1)return false;
    if(el.id==='sb59ManagerTabsWrap'||el.closest('#sb59ManagerTabsWrap'))return false;
    if(el.classList.contains('top'))return false;
    if(el.classList.contains('toast'))return false;
    if(!text(el))return false;
    return true;
  });
}
function nestedCandidates(){
  var m=main(); if(!m)return [];
  return Array.prototype.slice.call(m.querySelectorAll('section,.card,.panel,.box,div')).filter(function(el){
    if(!el||el.id==='sb59ManagerTabsWrap'||el.closest('#sb59ManagerTabsWrap'))return false;
    var t=text(el).toLowerCase();
    if(!t||t.length<20)return false;
    return t.indexOf('supabase rows')>-1||t.indexOf('edit supabase movie')>-1||t.indexOf('mux playback helper')>-1||t.indexOf('choose genres')>-1||t.indexOf('cast & crew metadata')>-1||t.indexOf('safe rule')>-1;
  });
}
function assignAnchors(){
  var found={};
  sections().concat(nestedCandidates()).forEach(function(el){
    var kind=classify(el);
    if(!found[kind]){
      found[kind]=el;
      el.id='sb59-'+kind;
      el.style.scrollMarginTop='22px';
    }
  });
  var first=sections()[0];
  if(first){first.id='sb59-overview';first.style.scrollMarginTop='22px';}
}
function findSection(kind){
  assignAnchors();
  return document.getElementById('sb59-'+kind)||sections()[0]||null;
}
function updateActiveTabs(){
  var m=main(); if(!m)return;
  Array.prototype.slice.call(m.querySelectorAll('.sb59Tab')).forEach(function(b){b.classList.toggle('active',b.dataset.tab===active);});
}
function jump(kind){
  active=kind;
  clearBadState();
  updateActiveTabs();
  var target=findSection(kind);
  if(target){
    target.classList.add('sb59Anchor');
    try{target.scrollIntoView({behavior:'smooth',block:'start'});}catch(e){location.hash='sb59-'+kind;}
    setTimeout(function(){target.classList.remove('sb59Anchor');},1700);
  }
}
window.sb59JumpManager=function(kind){jump(kind||'overview');return false;};
function buildTabs(){
  var m=main(); if(!m)return;
  var top=m.querySelector('.top')||m.firstElementChild;
  if(!top)return;
  var oldWrap=m.querySelector('#sb59ManagerTabsWrap');
  if(oldWrap)oldWrap.remove();
  var wrap=document.createElement('div');
  wrap.id='sb59ManagerTabsWrap';
  wrap.innerHTML='<div class="sb59TabsNote">V5.9 Supabase Manager Tabs: same manager controls stay visible. Tabs jump to each area safely.</div><div class="sb59Tabs" id="sb59ManagerTabs"></div>';
  top.insertAdjacentElement('afterend',wrap);
  var tabs=wrap.querySelector('#sb59ManagerTabs');
  ['overview','rows','edit','media','genres','cast','safety'].forEach(function(k){
    var a=document.createElement('a');
    a.href='#sb59-'+k;
    a.dataset.tab=k;
    a.className='sb59Tab'+(active===k?' active':'');
    a.textContent=tabTitle(k);
    a.setAttribute('onclick','return window.sb59JumpManager && window.sb59JumpManager(\''+k+'\')');
    tabs.appendChild(a);
  });
  builtFor=text(m).slice(0,200);
}
function ensureTabs(){
  if(!isManagerPage())return;
  addStyle();
  clearBadState();
  assignAnchors();
  var m=main(); if(!m)return;
  if(!m.querySelector('#sb59ManagerTabsWrap')||builtFor!==text(m).slice(0,200))buildTabs();
}
document.addEventListener('click',function(e){
  var a=e.target&&e.target.closest&&e.target.closest('.sb59Tab');
  if(a){e.preventDefault();e.stopImmediatePropagation();jump(a.dataset.tab||'overview');return false;}
},true);
function run(){if(!isManagerPage())return;ensureTabs();clearBadState();assignAnchors();}
var mo=new MutationObserver(function(){setTimeout(run,400);});
try{mo.observe(document.documentElement,{childList:true,subtree:true});}catch(e){}
document.addEventListener('DOMContentLoaded',function(){setTimeout(run,700);});
setInterval(function(){if(isManagerPage()){clearBadState();assignAnchors();}},1000);
setTimeout(run,900);
})();
