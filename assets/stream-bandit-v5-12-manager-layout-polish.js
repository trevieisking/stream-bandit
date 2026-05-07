/* Stream Bandit V5.12 — Supabase Manager Layout Grid Polish
   Visual-only Supabase Movie Manager/Admin tidy pass.
   Fixes messy rows/edit/cast layout and removes awkward blank oval-like empty space.
   No Supabase writes, Mux, player, storage, upload, movie save, Cast & Crew save, rating calculator or database changes. */
(function(){
'use strict';

var VERSION='V5.12';
var ranFor='';

function text(el){return String(el&&el.textContent||'').replace(/\s+/g,' ').trim();}
function main(){return document.querySelector('.main')||document.querySelector('main')||document.getElementById('app');}
function title(){return text(document.querySelector('.main .top h2,.main h1,.main h2')).toLowerCase();}
function isManager(){
  var m=main(); var t=text(m).toLowerCase(); var p=title();
  return p.indexOf('supabase movie manager')>-1||p==='admin'||
    (t.indexOf('supabase rows')>-1&&t.indexOf('edit supabase movie')>-1)||
    (t.indexOf('mux playback helper')>-1&&t.indexOf('cast & crew metadata')>-1)||
    (t.indexOf('admin video route')>-1&&t.indexOf('manager polish')>-1);
}
function addStyle(){
  if(document.getElementById('sb512ManagerLayoutStyle'))return;
  var st=document.createElement('style');
  st.id='sb512ManagerLayoutStyle';
  st.textContent='\n.main.sb512ManagerPolish{max-width:1240px!important}.sb512ManagerPolish .sb59Tabs{position:sticky;top:8px;z-index:3800;background:rgba(5,7,14,.72);backdrop-filter:blur(10px);padding:8px;border-radius:22px}.sb512ManagerPolish #sb59-overview,.sb512ManagerPolish .sb5118Checkpoint{margin-bottom:14px}.sb512ManagerPolish [data-sb5118-section]{transition:box-shadow .18s ease, outline .18s ease}.sb512ManagerPolish .sb512Grid{display:grid!important;grid-template-columns:minmax(280px,430px) minmax(340px,1fr)!important;gap:16px!important;align-items:start!important;margin-top:12px!important}.sb512ManagerPolish .sb512RowsPane,.sb512ManagerPolish .sb512EditPane,.sb512ManagerPolish .sb512CastPane{min-width:0!important}.sb512ManagerPolish .sb512RowsPane{max-height:720px!important;overflow:auto!important}.sb512ManagerPolish .sb512EditPane{grid-column:2!important;grid-row:1 / span 2!important}.sb512ManagerPolish .sb512CastPane{grid-column:1!important;grid-row:2!important}.sb512ManagerPolish .sb512RowsPane,.sb512ManagerPolish .sb512EditPane,.sb512ManagerPolish .sb512CastPane{border-radius:18px!important;box-shadow:0 18px 50px rgba(0,0,0,.22)!important}.sb512ManagerPolish .sb512CastPane textarea{min-height:150px!important}.sb512ManagerPolish .sb512EditPane textarea{min-height:96px!important}.sb512ManagerPolish .sb512RowsPane:empty,.sb512ManagerPolish .sb512EditPane:empty,.sb512ManagerPolish .sb512CastPane:empty{display:none!important}.sb512ManagerPolish .sb512BadBlank{display:none!important}.sb512LayoutNote{margin:10px 0 12px;padding:10px 12px;border-radius:16px;background:linear-gradient(135deg,rgba(61,220,151,.12),rgba(124,60,255,.10));border:1px solid rgba(61,220,151,.24);color:#baf7df;font-size:12px;line-height:1.45}.sb512LayoutNote b{color:#f6fff9}@media(max-width:920px){.sb512ManagerPolish .sb512Grid{grid-template-columns:1fr!important}.sb512ManagerPolish .sb512EditPane,.sb512ManagerPolish .sb512CastPane{grid-column:auto!important;grid-row:auto!important}.sb512ManagerPolish .sb512RowsPane{max-height:none!important}}\n';
  document.head.appendChild(st);
}
function findCards(){
  var m=main(); if(!m)return {};
  var all=Array.prototype.slice.call(m.querySelectorAll('section,.card,.panel,.box,form,div')).filter(function(el){
    if(!el||el.closest('#sb59ManagerTabsWrap')||el.closest('.sb59Tabs'))return false;
    var t=text(el).toLowerCase();
    return t.length>15;
  });
  var rows=null, edit=null, cast=null;
  all.forEach(function(el){
    var t=text(el).toLowerCase();
    if(!rows && (t.indexOf('supabase rows')>-1 || (t.indexOf('loaded 9 supabase')>-1 && t.indexOf('edit')>-1 && t.indexOf('play')>-1))) rows=el;
    if(!edit && (t.indexOf('edit supabase movie')>-1 || t.indexOf('add supabase movie')>-1) && t.indexOf('title')>-1 && t.indexOf('description')>-1) edit=el;
    if(!cast && (t.indexOf('cast & crew metadata')>-1 || (t.indexOf('save cast')>-1 && t.indexOf('reload cast')>-1))) cast=el;
  });
  return {rows:rows,edit:edit,cast:cast};
}
function tooBlank(el){
  if(!el)return false;
  var t=text(el).toLowerCase();
  if(t.length>40)return false;
  var r=el.getBoundingClientRect();
  return r.height>280 && r.width>180;
}
function cleanBlankOvals(){
  var m=main(); if(!m)return;
  Array.prototype.slice.call(m.querySelectorAll('section,.card,.panel,.box,div')).forEach(function(el){
    if(el.id==='sb512ManagerGrid'||el.closest('#sb512ManagerGrid'))return;
    if(el.closest('#sb59ManagerTabsWrap'))return;
    if(tooBlank(el))el.classList.add('sb512BadBlank');
  });
}
function ensureNote(){
  var m=main(); if(!m)return;
  if(m.querySelector('.sb512LayoutNote'))return;
  var tabs=m.querySelector('#sb59ManagerTabsWrap');
  var note=document.createElement('div');
  note.className='sb512LayoutNote';
  note.innerHTML='<b>'+VERSION+' Manager layout polish:</b> rows, edit movie and Cast & Crew are grouped into a cleaner working grid. Visual-only; save buttons and Supabase logic are unchanged.';
  if(tabs)tabs.insertAdjacentElement('afterend',note);
  else {
    var top=m.querySelector('.top')||m.firstElementChild;
    if(top)top.insertAdjacentElement('afterend',note);
  }
}
function buildGrid(){
  var m=main(); if(!m)return;
  var c=findCards();
  if(!c.rows||!c.edit)return;
  var grid=document.getElementById('sb512ManagerGrid');
  if(!grid){
    grid=document.createElement('div');
    grid.id='sb512ManagerGrid';
    grid.className='sb512Grid';
    var anchor=c.rows;
    anchor.parentNode.insertBefore(grid,anchor);
  }
  if(c.rows&&!c.rows.classList.contains('sb512RowsPane'))c.rows.classList.add('sb512RowsPane');
  if(c.edit&&!c.edit.classList.contains('sb512EditPane'))c.edit.classList.add('sb512EditPane');
  if(c.cast&&!c.cast.classList.contains('sb512CastPane'))c.cast.classList.add('sb512CastPane');
  if(c.rows&&c.rows.parentNode!==grid)grid.appendChild(c.rows);
  if(c.edit&&c.edit.parentNode!==grid)grid.appendChild(c.edit);
  if(c.cast&&c.cast.parentNode!==grid)grid.appendChild(c.cast);
}
function run(){
  if(!isManager())return;
  addStyle();
  var m=main(); if(!m)return;
  m.classList.add('sb512ManagerPolish');
  ensureNote();
  cleanBlankOvals();
  buildGrid();
}
var mo=new MutationObserver(function(){setTimeout(run,180);});
try{mo.observe(document.documentElement,{childList:true,subtree:true});}catch(e){}
document.addEventListener('DOMContentLoaded',function(){setTimeout(run,700);});
setInterval(run,1600);
setTimeout(run,900);
})();
