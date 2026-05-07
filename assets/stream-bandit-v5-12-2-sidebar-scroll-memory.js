/* Stream Bandit V5.12.2 — Sidebar Scroll Memory
   Remembers/restores the left menu/sidebar scroll after menu clicks and page re-renders.
   UI comfort patch only. No Supabase writes, Mux, player, storage, upload, movie save,
   Cast & Crew save, rating calculator, sound booster or database changes. */
(function(){
'use strict';

var VERSION='V5.12.2';
var KEY='streambandit_sidebar_scroll_v5122';
var pendingRestore=false;
var lastKnown=0;

function side(){
  return document.querySelector('.side') ||
    document.querySelector('aside') ||
    document.querySelector('[class*="sidebar"]') ||
    null;
}
function getScrollBox(){
  var s=side();
  if(!s)return null;
  var candidates=[s].concat(Array.prototype.slice.call(s.querySelectorAll('*')));
  var best=s;
  var bestScore=0;
  candidates.forEach(function(el){
    try{
      var cs=getComputedStyle(el);
      var canScroll=(cs.overflowY==='auto'||cs.overflowY==='scroll'||el.scrollHeight>el.clientHeight+12);
      if(canScroll){
        var score=(el.scrollHeight-el.clientHeight)+(el===s?100:0);
        if(score>bestScore){best=el;bestScore=score;}
      }
    }catch(e){}
  });
  return best;
}
function readSaved(){
  try{return Number(sessionStorage.getItem(KEY)||localStorage.getItem(KEY)||0)||0;}catch(e){return lastKnown||0;}
}
function save(y){
  y=Math.max(0,Number(y)||0);
  lastKnown=y;
  try{sessionStorage.setItem(KEY,String(y));localStorage.setItem(KEY,String(y));}catch(e){}
}
function currentY(){
  var box=getScrollBox();
  return box?box.scrollTop:0;
}
function restore(y){
  var box=getScrollBox();
  if(!box)return;
  y=Math.max(0,Number(y));
  if(!y)return;
  try{box.scrollTop=y;}catch(e){}
}
function restoreSoon(y){
  pendingRestore=true;
  [40,120,260,520,900].forEach(function(ms){
    setTimeout(function(){restore(y);pendingRestore=false;},ms);
  });
}
function isMenuClickTarget(el){
  if(!el||!el.closest)return false;
  var s=side();
  return !!(s&&s.contains(el));
}
function addStyle(){
  if(document.getElementById('sb5122SidebarStyle'))return;
  var st=document.createElement('style');
  st.id='sb5122SidebarStyle';
  st.textContent='\n.side{scroll-behavior:auto!important}.sb5122ScrollRestored{outline:1px solid rgba(61,220,151,.16)}\n';
  document.head.appendChild(st);
}
function run(){
  addStyle();
  var box=getScrollBox();
  if(!box)return;
  if(!box.dataset.sb5122Bound){
    box.dataset.sb5122Bound='1';
    box.addEventListener('scroll',function(){
      if(!pendingRestore)save(box.scrollTop);
    },{passive:true});
  }
  var saved=readSaved();
  if(saved&&Math.abs(box.scrollTop-saved)>8)restore(saved);
}
document.addEventListener('pointerdown',function(e){
  if(isMenuClickTarget(e.target))save(currentY());
},true);
document.addEventListener('click',function(e){
  if(isMenuClickTarget(e.target)){
    var y=currentY();
    save(y);
    restoreSoon(y);
  }
},true);
window.addEventListener('hashchange',function(){restoreSoon(readSaved());});
window.addEventListener('popstate',function(){restoreSoon(readSaved());});
var mo=new MutationObserver(function(){
  var y=readSaved();
  setTimeout(function(){run();restore(y);},80);
  setTimeout(function(){restore(y);},220);
});
try{mo.observe(document.documentElement,{childList:true,subtree:true});}catch(e){}
document.addEventListener('DOMContentLoaded',function(){setTimeout(run,500);setTimeout(function(){restore(readSaved());},900);});
setInterval(run,1500);
setTimeout(run,700);
})();
