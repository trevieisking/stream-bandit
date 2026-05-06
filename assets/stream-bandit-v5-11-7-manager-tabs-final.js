/* Stream Bandit V5.11.7 — Manager Tabs Final Controller
   One Supabase Movie Manager/Admin tabs controller only. Tabs jump/scroll and keep all content visible.
   No Supabase writes, Mux, player, storage, upload, movie save or database changes. */
(function(){
'use strict';

var VERSION='V5.11.7';
var NOTE='V5.11.7 Supabase Manager Tabs: same manager controls stay visible. Tabs jump to each area safely.';
var active='overview';
var lastBuild='';

function text(el){return String(el&&el.textContent||'').replace(/\s+/g,' ').trim();}
function main(){return document.querySelector('.main')||document.querySelector('main')||document.getElementById('app');}
function pageTitle(){return text(document.querySelector('.main .top h2,.main h1,.main h2')).toLowerCase();}
function isManagerPage(){
  var m=main();
  var t=m?text(m).toLowerCase():'';
  return pageTitle().indexOf('supabase movie manager')>-1||
    pageTitle()==='admin'||
    (t.indexOf('supabase rows')>-1&&t.indexOf('edit supabase movie')>-1)||
    (t.indexOf('mux playback helper')>-1&&t.indexOf('cast & crew metadata')>-1)||
    (t.indexOf('admin video route')>-1&&t.indexOf('manager polish')>-1);
}
function addStyle(){
  if(document.getElementById('sb5117ManagerTabsStyle'))return;
  Array.prototype.slice.call(document.querySelectorAll('#sb59TabsStyle')).forEach(function(old){try{old.remove();}catch(e){}});
  var st=document.createElement('style');
  st.id='sb5117ManagerTabsStyle';
  st.textContent='\n.sb59Tabs{display:flex;gap:9px;flex-wrap:wrap;margin:12px 0 14px;position:relative!important;z-index:3200!important;pointer-events:auto!important}.sb59Tab{display:inline-flex;text-decoration:none!important;border:0;border-radius:999px;padding:10px 14px;background:rgba(48,52,78,.92);color:#f6f7ff!important;font-weight:950;box-shadow:0 10px 28px rgba(0,0,0,.20);cursor:pointer;pointer-events:auto!important;position:relative!important;z-index:3300!important}.sb59Tab.active{background:linear-gradient(135deg,#ff2d85,#7c3cff);box-shadow:0 14px 36px rgba(124,60,255,.35)}.sb59TabsNote{margin:0 0 12px;padding:10px 12px;border-radius:16px;background:rgba(61,220,151,.10);border:1px solid rgba(61,220,151,.22);color:#baf7df;font-size:12px;line-height:1.45}.sb5117Anchor{outline:2px solid rgba(255,45,133,.42)!important;box-shadow:0 0 0 7px rgba(124,60,255,.15),0 22px 60px rgba(124,60,255,.22)!important}.sb5117OldManagerNote{display:none!important}\n';
  document.head.appendChild(st);
}
function cleanOldNotes(){
  var m=main(); if(!m)return;
  Array.prototype.slice.call(m.querySelectorAll('*')).forEach(function(el){
    if(el.id==='sb59ManagerTabsWrap'||el.closest('#sb59ManagerTabsWrap'))return;
    var t=text(el);
    if(/^V5\.[0-9.]+ Supabase Manager Tabs:/.test(t))el.classList.add('sb5117OldManagerNote');
  });
}
function sections(){
  var m=main(); if(!m)return [];
  return Array.prototype.slice.call(m.children).filter(function(el){
    if(!el||el.nodeType!==1)return false;
    if(el.id==='sb59ManagerTabsWrap'||el.closest('#sb59ManagerTabsWrap'))return false;
    if(el.classList.contains('top')||el.classList.contains('toast'))return false;
    if(el.classList.contains('sb5117OldManagerNote'))return false;
    return !!text(el);
  });
}
function nestedCandidates(){
  var m=main(); if(!m)return [];
  return Array.prototype.slice.call(m.querySelectorAll('section,.card,.panel,.box,div')).filter(function(el){
    if(!el||el.id==='sb59ManagerTabsWrap'||el.closest('#sb59ManagerTabsWrap'))return false;
    var t=text(el).toLowerCase();
    if(!t||t.length<20)return false;
    return t.indexOf('supabase rows')>-1||t.indexOf('edit supabase movie')>-1||t.indexOf('add supabase movie')>-1||t.indexOf('mux playback helper')>-1||t.indexOf('choose genres')>-1||t.indexOf('cast & crew metadata')>-1||t.indexOf('safe rule')>-1||t.indexOf('admin video route')>-1;
  });
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
function assignAnchors(){
  var found={};
  sections().concat(nestedCandidates()).forEach(function(el){
    var kind=classify(el);
    if(!found[kind]){
      found[kind]=el;
      el.id='sb59-'+kind;
      el.style.scrollMarginTop='24px';
    }
  });
  var first=sections()[0];
  if(first){first.id='sb59-overview';first.style.scrollMarginTop='24px';}
}
function buildTabs(){
  var m=main(); if(!m)return;
  var top=m.querySelector('.top')||m.firstElementChild; if(!top)return;
  var sig=text(m).slice(0,240)+'|'+active;
  var wrap=m.querySelector('#sb59ManagerTabsWrap');
  if(wrap&&lastBuild===sig){
    var note=wrap.querySelector('.sb59TabsNote');
    if(note)note.textContent=NOTE;
    return;
  }
  if(!wrap){
    wrap=document.createElement('div');
    wrap.id='sb59ManagerTabsWrap';
    top.insertAdjacentElement('afterend',wrap);
  }
  wrap.innerHTML='<div class="sb59TabsNote">'+NOTE+'</div><div class="sb59Tabs" id="sb59ManagerTabs"></div>';
  var tabs=wrap.querySelector('#sb59ManagerTabs');
  ['overview','rows','edit','media','genres','cast','safety'].forEach(function(k){
    var a=document.createElement('a');
    a.href='#sb59-'+k;
    a.dataset.tab=k;
    a.className='sb59Tab'+(active===k?' active':'');
    a.textContent=tabTitle(k);
    tabs.appendChild(a);
  });
  lastBuild=sig;
}
function findSection(kind){assignAnchors();return document.getElementById('sb59-'+kind)||sections()[0]||null;}
function setActive(kind){
  active=kind;
  Array.prototype.slice.call(document.querySelectorAll('.sb59Tab')).forEach(function(b){b.classList.toggle('active',b.dataset.tab===active);});
}
function jump(kind){
  kind=kind||'overview';
  setActive(kind);
  var target=findSection(kind);
  if(target){
    target.classList.add('sb5117Anchor');
    try{target.scrollIntoView({behavior:'smooth',block:'start'});}catch(e){location.hash='sb59-'+kind;}
    setTimeout(function(){target.classList.remove('sb5117Anchor');},1600);
  }
}
function run(){
  if(!isManagerPage())return;
  addStyle();
  cleanOldNotes();
  assignAnchors();
  buildTabs();
  var note=document.querySelector('#sb59ManagerTabsWrap .sb59TabsNote');
  if(note)note.textContent=NOTE;
}
document.addEventListener('click',function(e){
  var a=e.target&&e.target.closest&&e.target.closest('.sb59Tab');
  if(a&&isManagerPage()){
    e.preventDefault();
    e.stopImmediatePropagation();
    jump(a.dataset.tab||'overview');
    return false;
  }
},true);
var mo=new MutationObserver(function(){setTimeout(run,120);});
try{mo.observe(document.documentElement,{childList:true,subtree:true});}catch(e){}
document.addEventListener('DOMContentLoaded',function(){setTimeout(run,600);});
setInterval(run,700);
setTimeout(run,900);
})();
