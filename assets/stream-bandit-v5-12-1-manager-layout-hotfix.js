/* Stream Bandit V5.12.1 — Manager Layout Hotfix
   Emergency visual hotfix after V5.12 layout polish was too aggressive.
   Does not move manager cards. Removes duplicate section labels and keeps spacing readable.
   No Supabase writes, Mux, player, storage, upload, movie save, Cast & Crew save, rating calculator or database changes. */
(function(){
'use strict';

var VERSION='V5.12.1';

function text(el){return String(el&&el.textContent||'').replace(/\s+/g,' ').trim();}
function main(){return document.querySelector('.main')||document.querySelector('main')||document.getElementById('app');}
function title(){return text(document.querySelector('.main .top h2,.main h1,.main h2')).toLowerCase();}
function isManager(){
  var m=main();
  var t=text(m).toLowerCase();
  var p=title();
  return p.indexOf('supabase movie manager')>-1||p==='admin'||
    (t.indexOf('supabase rows')>-1&&t.indexOf('edit supabase movie')>-1)||
    (t.indexOf('mux playback helper')>-1&&t.indexOf('cast & crew metadata')>-1)||
    (t.indexOf('admin video route')>-1&&t.indexOf('manager polish')>-1);
}
function addStyle(){
  if(document.getElementById('sb5121ManagerHotfixStyle'))return;
  var st=document.createElement('style');
  st.id='sb5121ManagerHotfixStyle';
  st.textContent='\n.main.sb5121ManagerHotfix{max-width:1240px!important}.main.sb5121ManagerHotfix .sb59Tabs{position:sticky;top:8px;z-index:3800;background:rgba(5,7,14,.72);backdrop-filter:blur(10px);padding:8px;border-radius:22px}.main.sb5121ManagerHotfix #sb512ManagerGrid{display:contents!important}.main.sb5121ManagerHotfix .sb512Grid{display:contents!important}.main.sb5121ManagerHotfix .sb512RowsPane,.main.sb5121ManagerHotfix .sb512EditPane,.main.sb5121ManagerHotfix .sb512CastPane{grid-column:auto!important;grid-row:auto!important;max-height:none!important;overflow:visible!important}.main.sb5121ManagerHotfix .sb512BadBlank{display:none!important}.main.sb5121ManagerHotfix [data-sb5118-section]::before{content:none!important;display:none!important}.main.sb5121ManagerHotfix [data-sb5118-section]{outline:none!important}.sb5121LayoutNote{margin:10px 0 12px;padding:10px 12px;border-radius:16px;background:linear-gradient(135deg,rgba(61,220,151,.12),rgba(124,60,255,.10));border:1px solid rgba(61,220,151,.24);color:#baf7df;font-size:12px;line-height:1.45}.sb5121LayoutNote b{color:#f6fff9}\n';
  document.head.appendChild(st);
}
function removeDuplicateLabels(){
  var m=main(); if(!m)return;
  Array.prototype.slice.call(m.querySelectorAll('[data-sb5118-section]')).forEach(function(el){
    el.removeAttribute('data-sb5118-section');
    el.removeAttribute('data-sb5118-title');
    el.classList.remove('sb5118Anchor');
  });
  Array.prototype.slice.call(m.querySelectorAll('.sb512BadBlank')).forEach(function(el){
    var t=text(el);
    if(!t || t.length<40)el.style.display='none';
  });
}
function ensureNote(){
  var m=main(); if(!m)return;
  var old=Array.prototype.slice.call(m.querySelectorAll('.sb512LayoutNote'));
  old.forEach(function(n){try{n.remove();}catch(e){}});
  if(m.querySelector('.sb5121LayoutNote'))return;
  var tabs=m.querySelector('#sb59ManagerTabsWrap');
  var note=document.createElement('div');
  note.className='sb5121LayoutNote';
  note.innerHTML='<b>'+VERSION+' Manager layout hotfix:</b> V5.12 aggressive grid has been calmed down. Existing manager controls stay visible; duplicate section labels are removed.';
  if(tabs)tabs.insertAdjacentElement('afterend',note);
  else {
    var top=m.querySelector('.top')||m.firstElementChild;
    if(top)top.insertAdjacentElement('afterend',note);
  }
}
function run(){
  if(!isManager())return;
  addStyle();
  var m=main(); if(!m)return;
  m.classList.remove('sb512ManagerPolish');
  m.classList.add('sb5121ManagerHotfix');
  removeDuplicateLabels();
  ensureNote();
}
var mo=new MutationObserver(function(){setTimeout(run,120);});
try{mo.observe(document.documentElement,{childList:true,subtree:true});}catch(e){}
document.addEventListener('DOMContentLoaded',function(){setTimeout(run,600);});
setInterval(run,1000);
setTimeout(run,800);
})();
